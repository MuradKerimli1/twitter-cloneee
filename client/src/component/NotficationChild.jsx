import { TiDeleteOutline } from "react-icons/ti";
import { axiosError } from "../error/axiosError";
import { Axios } from "../lib/axios";
import { summaryApi } from "../config/summaryApi";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { setNotfication } from "../store/slices/notfication.slice";

const NotficationChild = ({ data }) => {
  const { notfications } = useSelector((state) => state.notfication);
  const dispatch = useDispatch();

  const handleDeleteById = async (id) => {
    try {
      const res = await Axios({
        ...summaryApi.deleteNotificationById(id),
      });

      if (res.data.success) {
        const filteredData = notfications.filter((n) => n.id !== id);
        dispatch(setNotfication(filteredData));
        toast(res.data.message, {
          icon: "👏",
        });
      }
    } catch (error) {
      axiosError(error);
    }
  };

  return (
    <div className="w-full p-4 hover:bg-[#080808] transition-colors duration-200 border-b border-[#2F3336] cursor-pointer">
      <div className="flex gap-3">
        {/* Notification icon */}
        <div className="flex-shrink-0 pt-1">
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="w-5 h-5 text-[#794BC4]"
          >
            <g>
              <path
                d="M22.99 11.295l-6.986-2.13-.877-.326-.325-.88L12.67.975c-.092-.303-.372-.51-.688-.51-.316 0-.596.207-.688.51l-2.392 7.84-1.774.657-6.148 1.82c-.306.092-.515.372-.515.69 0 .32.21.6.515.69l7.956 2.358 2.356 7.956c.09.306.37.515.69.515.32 0 .6-.21.69-.514l1.822-6.15.656-1.773 7.84-2.392c.303-.09.51-.37.51-.687 0-.316-.207-.596-.51-.688z"
                fill="currentColor"
              ></path>
            </g>
          </svg>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <img
              src={
                data.fromUser?.profil_picture ||
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTcg4Y51XjQ-zSf87X4nUPTQzsF83eFdZswTg&s"
              }
              alt="user profile"
              className="w-10 h-10 rounded-full object-cover"
            />
            <span className="font-bold text-white truncate">
              {data.fromUser.username}
            </span>
          </div>

          <p className="text-gray-300 text-sm mb-2 truncate">{data.message}</p>

          <div className="text-xs text-gray-500">
            {new Date(data.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>

        <div className="flex-shrink-0 ">
          <button
            onClick={() => handleDeleteById(data.id)}
            className="text-gray-400 hover:text-red-500 transition-colors duration-200"
          >
            <TiDeleteOutline size={24} className=" cursor-pointer" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotficationChild;
