import React, { useEffect, useState } from "react";
import ConversationUsers from "./ConversationUsers";
import { useDispatch, useSelector } from "react-redux";
import {
  clearConversationUser,
  setMessages,
  updatedMessages,
} from "../store/slices/conversation";
import { IoMdSend } from "react-icons/io";
import { IoArrowBack } from "react-icons/io5";
import { axiosError } from "../error/axiosError";
import { Axios } from "../lib/axios";
import { summaryApi } from "../config/summaryApi";

const MessageContainer = ({ setActiveView }) => {
  const [openConversationUser, setOpenConversations] = useState(false);
  const { selectedConversation, messages } = useSelector(
    (state) => state.conversation
  );
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const [message, setMessage] = useState("");
  const [sentMessageLoading, setMessageLoading] = useState(false);

  useEffect(() => {
    if (!selectedConversation) return;

    const fetchUserConversation = async () => {
      setLoading(true);
      try {
        const res = await Axios({
          ...summaryApi.conversationMessages(selectedConversation.id),
        });
        if (res.data.success) {
          dispatch(setMessages(res.data.messages || []));
        }
      } catch (error) {
        axiosError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserConversation();
  }, [selectedConversation, dispatch]);

  const handleSendMessage = async () => {
    if (message.trim() === "") return;
    setMessageLoading(true);
    try {
      const res = await Axios({
        ...summaryApi.sendMessage(selectedConversation.id),
        data: { text: message },
      });

      if (res.data.success && res.data.message) {
        const updateMessages = [...messages, res.data.message];
        dispatch(updatedMessages(updateMessages));
        setMessage("");
      }
    } catch (error) {
      axiosError(error);
    } finally {
      setMessageLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div
      className={`flex ${
        !selectedConversation ? "items-center justify-center" : ""
      } h-screen w-full bg-black text-white`}
    >
      {!selectedConversation && (
        <div className="flex flex-col p-4 gap-2 text-center max-w-sm">
          <p className="text-3xl font-semibold max-w-[250px] mx-auto">
            Mesaj seç
          </p>
          <span className="text-[#71767B]">
            Mevcut sohbetlerin arasından seçim yap, yeni bir sohbet başlat veya
            sörfe devam et.
          </span>
          <button
            onClick={() => setOpenConversations(true)}
            className="btn bg-[#1D9BF0] text-white w-fit border-none rounded-full mt-2 mx-auto hover:bg-[#1A8BD8] transition-colors px-4 py-2"
          >
            Yeni Mesaj
          </button>
        </div>
      )}

      {openConversationUser && (
        <ConversationUsers close={() => setOpenConversations(false)} />
      )}

      {selectedConversation && !loading && (
        <div className="flex flex-col w-full h-full">
          <div className="border-b border-[#2F3336] p-4 flex items-center gap-4">
            <button
              onClick={() => {
                dispatch(clearConversationUser());
                setActiveView("conversations");
              }}
              className="md:hidden text-xl"
            >
              <IoArrowBack />
            </button>
            <div className="w-10 h-10 rounded-full overflow-hidden">
              <img
                src={
                  selectedConversation.profil_picture ||
                  "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
                }
                alt={selectedConversation.username}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="font-semibold text-xl">
              {selectedConversation.username}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            {messages?.length > 0 ? (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${
                    m.sender.id === user.id ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`flex gap-2 max-w-[80%] ${
                      m.sender.id === user.id ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div className="min-w-10 max-w-10 w-full h-10 rounded-full overflow-hidden">
                      <img
                        src={
                          m.sender.profil_picture ||
                          "https://plus.unsplash.com/premium_photo-1689568126014-06fea9d5d341?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cHJvZmlsZXxlbnwwfHwwfHx8MA%3D%3D"
                        }
                        alt="userProfile"
                        className="w-full h-full object-cover object-center"
                      />
                    </div>
                    <div
                      className={`p-3 rounded-2xl ${
                        m.sender.id === user.id
                          ? "bg-[#1D9BF0] rounded-tr-none"
                          : "bg-[#2F3336] rounded-tl-none"
                      }`}
                    >
                      <p className="text-white">{m.text}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-center text-[#71767B]">Henüz mesaj yok</p>
              </div>
            )}
          </div>

          <div className="border-t border-[#2F3336] p-4 relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Mesaj yaz..."
              className="w-full p-3 pr-12 rounded-full bg-[#2F3336] text-white focus:outline-none"
            />
            <button
              onClick={handleSendMessage}
              disabled={message.trim() === ""}
              className={`absolute right-0 top-1/2 transform -translate-y-1/2 pr-6 ${
                message.trim() === ""
                  ? "text-[#71767B]"
                  : "text-[#1D9BF0] hover:text-[#1A8BD8]"
              }`}
            >
              {sentMessageLoading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <IoMdSend size={20} className="cursor-pointer" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageContainer;
