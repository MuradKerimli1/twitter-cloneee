import React, { useEffect, useState } from "react";
import { BiMessageSquareDots } from "react-icons/bi";
import ConversationUsers from "./ConversationUsers";
import { axiosError } from "../error/axiosError";
import { Axios } from "../lib/axios";
import { summaryApi } from "../config/summaryApi";
import { useDispatch, useSelector } from "react-redux";
import {
  setConversationUser,
  setUserConversations,
} from "../store/slices/conversation";

const Conversations = ({ setActiveView }) => {
  const [openConversationUser, setOpenConversations] = useState(false);
  const [loading, setLoading] = useState(false);
  const { userConversations } = useSelector((state) => state.conversation);
  const { user } = useSelector((state) => state.auth);
  const [sortedConversations, setSortedConversations] = useState([]);
  const { onlineUsers } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUserConversations = async () => {
      setLoading(true);
      try {
        const res = await Axios({ ...summaryApi.userConversations });

        if (res.data.success) {
          dispatch(setUserConversations(res.data.conversations));
        }
      } catch (error) {
        axiosError(error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserConversations();
  }, []);

  useEffect(() => {
    if (userConversations?.length > 0) {
      const sorted = [...userConversations].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setSortedConversations(sorted);
    }
  }, [userConversations]);

  const getOtherParticipant = (conversation) => {
    return conversation?.participants?.find((p) => p.id !== user?.id);
  };

  const isUserOnline = (userId) => {
    return onlineUsers?.some((onlineId) => parseInt(onlineId) === userId);
  };

  return (
    <>
      <div className="flex flex-col border-r border-[#2F3336] h-screen overflow-y-auto p-3 w-full conversations-at-992">
        {/* Header */}
        <div className="w-full flex items-center justify-between gap-1">
          <p className="font-semibold text-xl">Mesajlar</p>
          <div className="flex items-center gap-2">
            <BiMessageSquareDots
              size={19}
              className="cursor-pointer"
              onClick={() => setOpenConversations(true)}
            />
          </div>
        </div>

        {/* Content */}
        <div className="mt-3">
          {loading && (
            <div className="flex items-center justify-center my-4">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          )}

          {!loading && sortedConversations?.length === 0 && (
            <div className="p-3 flex flex-col gap-2 mt-4">
              <p className="text-3xl max-w-[250px] font-semibold">
                Gelen kutuna hoş geldin!
              </p>
              <span className="text-[#505257]">
                Özel sohbetler sayesinde X platformundaki diğer kişilere
                düşüncelerini yaz, gönderi ve daha fazla içerik paylaş.
              </span>
              <button
                onClick={() => {
                  setActiveView("messages"), setOpenConversations(true);
                }}
                className="btn bg-[#1D9BF0] text-white w-fit border-none rounded-full mt-2"
              >
                Mesaj yaz
              </button>
            </div>
          )}

          {!loading &&
            sortedConversations?.length > 0 &&
            sortedConversations.map((conversation) => {
              const participant = getOtherParticipant(conversation);
              if (!participant) return null;

              return (
                <div
                  key={conversation.id}
                  onClick={() => {
                    dispatch(setConversationUser(participant));
                    setActiveView("messages");
                  }}
                  className="w-full mt-2 flex gap-2 bg-[#16181C] p-2 rounded-md cursor-pointer hover:bg-[#1e2024]"
                >
                  <div className="relative min-w-10 max-w-10 w-full h-10 rounded-full">
                    <img
                      src={
                        participant?.profil_picture ||
                        "https://plus.unsplash.com/premium_photo-1689568126014-06fea9d5d341?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cHJvZmlsZXxlbnwwfHwwfHx8MA%3D%3D"
                      }
                      alt="userProfile"
                      className="w-full h-full object-cover object-center rounded-full"
                    />
                    <span
                      className={`absolute -bottom-1.5 -left-1.5 w-4 h-4 rounded-full border-2 shadow-lg ${
                        isUserOnline(participant.id)
                          ? "bg-green-500"
                          : "bg-red-500"
                      } border-[#16181C]`}
                    ></span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-sm font-bold">
                      {participant?.username}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(conversation?.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {openConversationUser && (
        <ConversationUsers close={() => setOpenConversations(false)} />
      )}
    </>
  );
};

export default Conversations;
