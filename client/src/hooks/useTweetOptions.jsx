import { useDispatch, useSelector } from "react-redux";
import { Axios } from "../lib/axios";
import { summaryApi } from "../config/summaryApi";
import { setTweet, updateSelectedTweet } from "../store/slices/tweet.slice";
import { axiosError } from "../error/axiosError";

const useTweetOptions = () => {
  const { user } = useSelector((state) => state.auth);
  const { tweets, selectedTweet } = useSelector((state) => state.tweet);
  const dispatch = useDispatch();

  const updateBothTweetStates = (id, updates) => {
    const updatedTweets = tweets.map((tweet) => {
      if (tweet.id === id) {
        return { ...tweet, ...updates };
      }
      return tweet;
    });

    dispatch(setTweet(updatedTweets));

    if (selectedTweet?.id === id) {
      dispatch(
        updateSelectedTweet({
          ...updates,
        })
      );
    }
  };

  const likeTweet = async (id) => {
    try {
      const res = await Axios({ ...summaryApi.likeTweet(id) });

      if (res.data.success) {
        const existingLikes =
          selectedTweet?.id === id
            ? selectedTweet.likes || []
            : tweets.find((t) => t.id === id)?.likes || [];

        const updatedLikes = res.data.liked
          ? [...existingLikes, user]
          : existingLikes.filter((l) => l.id !== user.id);

        updateBothTweetStates(id, { likes: updatedLikes });
        return res.data;
      }
    } catch (error) {
      axiosError(error);
      throw error;
    }
  };

  const commentTweet = async (id, text) => {
    try {
      const res = await Axios({
        ...summaryApi.commentTweet(id),
        data: { text },
      });

      if (res.data.success) {
        const newComment = res.data.comment;

        const existingComments =
          selectedTweet?.id === id
            ? selectedTweet.comments || []
            : tweets.find((t) => t.id === id)?.comments || [];

        const updatedComments = [...existingComments, newComment];

        updateBothTweetStates(id, {
          comments: updatedComments,
        });

        return res.data;
      }
    } catch (error) {
      axiosError(error);
      throw error;
    }
  };

  const bookMarkTweet = async (id) => {
    try {
      const res = await Axios({ ...summaryApi.bookMarkTweet(id) });

      if (res.data.success) {
        const existingBookmarks =
          selectedTweet?.id === id
            ? selectedTweet.bookmarks || []
            : tweets.find((t) => t.id === id)?.bookmarks || [];

        const updatedBookmarks = res.data.bookMark
          ? [...existingBookmarks, user]
          : existingBookmarks.filter((b) => b.id !== user.id);

        updateBothTweetStates(id, { bookmarks: updatedBookmarks });
        return res.data;
      }
    } catch (error) {
      axiosError(error);
      throw error;
    }
  };

  return { likeTweet, commentTweet, bookMarkTweet };
};

export default useTweetOptions;
