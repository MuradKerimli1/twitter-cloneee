import { useEffect, useState } from "react";
import { IoClose, IoSearch } from "react-icons/io5";
import { axiosError } from "../error/axiosError";
import { Axios } from "../lib/axios";
import { summaryApi } from "../config/summaryApi";
import { setConversationUser } from "../store/slices/conversation";
import { useDispatch } from "react-redux";

const ConversationUsers = ({ close }) => {
  const [username, setUsername] = useState("");
  const [conversationUsers, setConversationUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const dispatch = useDispatch();

  useEffect(() => {
    if (!username) {
      setConversationUsers([]);
      setHasSearched(false);
      return;
    }

    const fetchConversationUsers = async () => {
      setLoading(true);
      try {
        const res = await Axios({ ...summaryApi.searchUser(username) });
        if (res.data.success) {
          setConversationUsers(res.data.data || []);
          setHasSearched(true);
        }
      } catch (error) {
        axiosError(error);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchConversationUsers();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [username]);

  const handleSelectUser = () => {
    if (selectedUser) {
      dispatch(setConversationUser(selectedUser));
      setSelectedUser(null);
      close();
    }
  };

  return (
    <section className="fixed inset-0 z-50 w-full flex items-center justify-center p-3 bg-[rgba(36,45,52,0.8)]">
      <div className="bg-black w-full max-w-2xl p-5 rounded-xl overflow-x-hidden min-h-[calc(90vh-100px)]">
        {/* Header */}
        <div className="flex items-center gap-4 w-full">
          <IoClose
            size={24}
            className="cursor-pointer text-white"
            onClick={close}
          />
          <div className="flex items-center justify-between w-full">
            <p className="text-xl font-semibold text-white">Yeni mesaj</p>
            <button
              disabled={!selectedUser}
              className="btn disabled:opacity-50"
              onClick={handleSelectUser}
            >
              Sonraki
            </button>
          </div>
        </div>

        {/* Search and selected user */}
        <div className="grid gap-2 mt-3">
          <div className="relative w-full py-2">
            <IoSearch
              size={22}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#1A8BD8]"
            />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="İstifadəçi axtar..."
              className="w-full pl-10 pr-3 py-2 rounded-md bg-transparent border border-gray-600 text-white placeholder-gray-400 focus:outline-none"
            />
          </div>

          {selectedUser && (
            <div className="flex items-center gap-2 p-2 border border-[#323539] rounded-full max-w-max">
              <span className="text-sm font-semibold">
                {selectedUser.username}
              </span>
              <IoClose
                size={19}
                className="text-[#1D9BF0] cursor-pointer hover:text-red-500"
                onClick={() => setSelectedUser(null)}
              />
            </div>
          )}
        </div>

        {/* User list */}
        <div className="mt-4">
          {loading && (
            <div className="flex justify-center my-4">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          )}

          {!loading && hasSearched && conversationUsers.length === 0 && (
            <p className="text-red-400 font-bold">User not found</p>
          )}

          {!loading && conversationUsers.length > 0 && (
            <div className="space-y-3">
              {conversationUsers.map((user) => (
                <div
                  key={user.id}
                  className={`flex items-center gap-3 p-2 rounded cursor-pointer hover:bg-[#16181C] transition-colors ${
                    selectedUser?.id === user.id ? "bg-[#16181C]" : ""
                  }`}
                  onClick={() => setSelectedUser(user)}
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden">
                    <img
                      src={
                        user.profil_picture ||
                        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
                      }
                      alt={user.username}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold truncate">{user.username}</p>
                    <p className="text-[#71767B] text-sm truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ConversationUsers;
