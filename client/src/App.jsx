import { Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import useResetScrollTopOnLocationChange from "./hooks/useResetScrollTop";
import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useSelector, useDispatch } from "react-redux";
import { setSocket, clearSocket } from "./store/slices/socket.slice";
import { showNotification } from "./lib/showNotification";
import { setNotfication } from "./store/slices/notfication.slice";
import useFetchNotfications from "./hooks/fetchNotfication";
import { setTweet, updateSelectedTweet } from "./store/slices/tweet.slice";
import {
  clearVisitors,
  setOnlineUsers,
  setSelectedUser,
  setUser,
  setVisitors,
  updateUser,
} from "./store/slices/auth.slice";
import {
  setUserConversations,
  updatedMessages,
} from "./store/slices/conversation";

const App = () => {
  const { user, selectedUser } = useSelector((state) => state.auth);
  const { tweets } = useSelector((state) => state.tweet);
  const { notfications } = useSelector((state) => state.notfication);
  const { messages } = useSelector((state) => state.conversation);
  const { userConversations } = useSelector((state) => state.conversation);
  const { visitors } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const notificationsRef = useRef(notfications);
  const userRef = useRef(user);
  const tweetsRef = useRef(tweets);
  const selectedUserRef = useRef(selectedUser);
  const messagesRef = useRef(messages);
  const userConversation = useRef(userConversations);
  const visitorsRef = useRef(visitors);

  useResetScrollTopOnLocationChange();
  useFetchNotfications();

  useEffect(() => {
    userRef.current = user;
    notificationsRef.current = notfications;
    tweetsRef.current = tweets;
    selectedUserRef.current = selectedUser;
    messagesRef.current = messages;
    userConversation.current = userConversations;
    visitorsRef.current = visitors;
  }, [
    user,
    notfications,
    tweets,
    selectedUser,
    messages,
    userConversations,
    visitors,
  ]);

  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem("token");

    const socket = io(import.meta.env.VITE_SOCKET_URL, {
      auth: { token: token },
      transports: ["websocket"],
    });

    socket.on("newNotification", (value) => {
      const { notification } = value;

      if (notification.toUser.id !== userRef.current?.id) return;

      showNotification(notification.fromUser.username, notification.message);

      const updatedNotifications = [...notificationsRef.current, notification];
      dispatch(setNotfication(updatedNotifications));
    });

    socket.on("tweetLikeStatusChange", (data) => {
      const { likeStatus, tweetId, user: actionUser } = data;

      const updatedTweets = tweetsRef.current.map((tweet) => {
        if (tweet.id === tweetId) {
          const updatedLikes = likeStatus
            ? [...(tweet.likes || []), actionUser]
            : (tweet.likes || []).filter((like) => like.id !== actionUser.id);

          return {
            ...tweet,
            likes: updatedLikes,
          };
        }
        return tweet;
      });

      dispatch(setTweet(updatedTweets));

      dispatch(
        updateSelectedTweet({
          id: tweetId,
          likes: updatedTweets.find((t) => t.id === tweetId)?.likes || [],
        })
      );
    });

    socket.on("tweetNewComment", (data) => {
      const { tweetId, comment } = data;

      const updatedTweets = tweetsRef.current.map((tweet) =>
        tweet.id === tweetId
          ? {
              ...tweet,
              comments: [...(tweet.comments || []), comment],
            }
          : tweet
      );

      dispatch(setTweet(updatedTweets));

      dispatch(
        updateSelectedTweet({
          id: tweetId,
          comments: updatedTweets.find((t) => t.id === tweetId)?.comments || [],
        })
      );
    });

    socket.on("newTweet", (value) => {
      const updatedTweetData = [...tweetsRef.current, value.tweet];
      dispatch(setTweet(updatedTweetData));
    });

    socket.on("deleteTweet", (value) => {
      const updatedTweetData = tweetsRef.current.filter(
        (t) => t.id !== value.tweetId
      );
      dispatch(setTweet(updatedTweetData));
    });

    socket.on("followOrUnfollow", (data) => {
      const { existUserId, targetUserId, followStatus } = data;

      const updatedUser = { ...userRef.current };
      const updatedSelectedUser = { ...selectedUserRef.current };

      if (userRef.current?.id === existUserId) {
        if (followStatus) {
          updatedUser.following = [
            ...(updatedUser.following || []),
            { id: targetUserId },
          ];
        } else {
          updatedUser.following = (updatedUser.following || []).filter(
            (user) => user.id !== targetUserId
          );
        }

        dispatch(updateUser(updatedUser));
      }

      if (selectedUserRef.current?.id === targetUserId) {
        if (followStatus) {
          updatedSelectedUser.followers = [
            ...(updatedSelectedUser.followers || []),
            { id: existUserId },
          ];
        } else {
          updatedSelectedUser.followers = (
            updatedSelectedUser.followers || []
          ).filter((user) => user.id !== existUserId);
        }

        dispatch(setSelectedUser(updatedSelectedUser));
      }

      if (selectedUserRef.current?.id === existUserId) {
        if (followStatus) {
          updatedSelectedUser.following = [
            ...(updatedSelectedUser.following || []),
            { id: targetUserId },
          ];
        } else {
          updatedSelectedUser.following = (
            updatedSelectedUser.following || []
          ).filter((user) => user.id !== targetUserId);
        }

        dispatch(setSelectedUser(updatedSelectedUser));
      }
    });
    socket.on("newMessage", (data) => {
      const updateMessages = [...messagesRef.current, data.message];
      dispatch(updatedMessages(updateMessages));
    });

    socket.on("newConversation", (data) => {
      const { conversation } = data;
      const updatedConversations = [...userConversation.current, conversation];
      dispatch(setUserConversations(updatedConversations));
    });

    socket.on("onlineUsers", (data) => {
      dispatch(setOnlineUsers(data));
    });

    socket.on("newViewer", (data) => {
      const viewer = data.viewer.viewerUser;
      const updatedVisitors = [...visitorsRef.current, viewer];
      dispatch(setVisitors(updatedVisitors));
    });

    socket.on("viewersCleanedUp", () => {
      dispatch(clearVisitors());
    });

    socket.on("premiumStatusExpired", (data) => {
      const { userId } = data;

      if (userRef.current?.id == userId) {
        dispatch(
          setUser({
            ...userRef.current,
            isPremium: false,
            premiumExpiredAt: null,
            viewers: [],
          })
        );
      }
    });

    dispatch(setSocket(socket));

    return () => {
      socket.off("newNotification");
      socket.off("tweetLikeStatusChange");
      socket.off("tweetNewComment");
      socket.off("newTweet");
      socket.off("deleteTweet");
      socket.off("followOrUnfollow");
      socket.off("newMessage");
      socket.off("newConversation");
      socket.off("onlineUsers");
      socket.off("newViewer");
      socket.off("viewersCleanedUp");
      socket.off("premiumStatusExpired");
      socket.disconnect();
      dispatch(clearSocket());
    };
  }, [user, dispatch]);

  return (
    <>
      <main>
        <Outlet />
      </main>
      <Toaster />
    </>
  );
};

export default App;
