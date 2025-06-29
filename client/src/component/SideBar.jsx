import { FaHome } from "react-icons/fa";
import { IoMdNotifications } from "react-icons/io";
import { AiOutlineMessage } from "react-icons/ai";
import { CgProfile } from "react-icons/cg";
import { BsTwitterX } from "react-icons/bs";
import { Link, useNavigate } from "react-router-dom";
import { IoMdLogOut } from "react-icons/io";
import { RiVipDiamondFill } from "react-icons/ri";
import { axiosError } from "../error/axiosError";
import { Axios } from "../lib/axios";
import { summaryApi } from "../config/summaryApi";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/slices/auth.slice";
import { useState } from "react";
import CreateTweet from "./CreateTweet";

const sideBarItems = [
  {
    text: "Anasayfa",
    icon: <FaHome size={27} />,
  },
  {
    text: "Bildirimler",
    icon: <IoMdNotifications size={27} />,
  },
  {
    text: "Mesajlar",
    icon: <AiOutlineMessage size={27} />,
  },
  {
    text: "Premium",
    icon: <RiVipDiamondFill size={27} />,
  },
  {
    text: "Profile",
    icon: <CgProfile size={27} />,
  },
  {
    text: "Logout",
    icon: <IoMdLogOut size={27} />,
  },
];

const SideBar = () => {
  const { user } = useSelector((state) => state.auth);
  const { notfications } = useSelector((state) => state.notfication);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [openCreateTweet, setOpenCreateTweet] = useState(false);

  const handleLogout = async () => {
    try {
      const res = await Axios({ ...summaryApi.logout });
      if (res.data.success) {
        toast.success(res.data.message);
        localStorage.removeItem("token");
        dispatch(logout());
        navigate("/auth/login");
      }
    } catch (error) {
      axiosError(error);
    }
  };

  const handleClickSidebarItems = (text) => {
    switch (text) {
      case "Anasayfa":
        navigate("/");
        break;

      case "Bildirimler":
        navigate("/notfication");
        break;

      case "Logout":
        handleLogout();
        break;

      case "Profile":
        navigate(`/profile/${user.id}`);
        break;
      case "Mesajlar":
        navigate(`/messages`);
        break;
      case "Premium":
        navigate(`/premium`);
        break;

      default:
        break;
    }
  };

  const handleCreateTweet = () => {
    setOpenCreateTweet((prev) => !prev);
  };
  return (
    <>
      <div className=" fixed top-0 left-0 z-10 w-15  sm:w-45 shadow-md h-screen p-3 flex flex-col gap-4  ">
        {/* icon */}
        <Link to={"/"} className="p-2 cursor-pointer">
          <BsTwitterX size={30} />
        </Link>
        {/* sidebarItems */}
        <div className=" grid gap-4 ">
          {sideBarItems.map((i, index) => (
            <div
              key={index}
              className="flex items-start gap-4 w-full cursor-pointer hover:bg-[#181818] p-2 rounded-md relative"
              onClick={() => handleClickSidebarItems(i.text)}
            >
              <span className="relative">
                {i.text === "Bildirimler" && notfications.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                    {notfications.length > 99 ? "99+" : notfications.length}
                  </span>
                )}
                {i.icon}
              </span>
              <p className="font-bold hidden sm:block">{i.text}</p>
            </div>
          ))}
        </div>

        {/* tweetCreate */}
        <div className=" grid mt-2">
          <button
            onClick={handleCreateTweet}
            className=" btn w-full text-black bg-white rounded-full hidden sm:block"
          >
            Gonderi yayinla
          </button>
          <div
            className=" bg-white text-black p-2 rounded-full w-fit cursor-pointer block sm:hidden"
            onClick={handleCreateTweet}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="24"
              height="24"
              fill="currentColor"
            >
              <path d="M23 3c-6.62-.1-10.38 2.421-13.05 6.03C7.29 12.61 6 17.331 6 22h2c0-1.007.07-2.012.19-3H12c4.1 0 7.48-3.082 7.94-7.054C22.79 10.147 23.17 6.359 23 3zm-7 8h-1.5v2H16c.63-.016 1.2-.08 1.72-.188C16.95 15.24 14.68 17 12 17H8.55c.57-2.512 1.57-4.851 3-6.78 2.16-2.912 5.29-4.911 9.45-5.187C20.95 8.079 19.9 11 16 11zM4 9V6H1V4h3V1h2v3h3v2H6v3H4z"></path>
            </svg>
          </div>
        </div>
      </div>
      {openCreateTweet && (
        <CreateTweet close={() => setOpenCreateTweet((prev) => !prev)} />
      )}
    </>
  );
};

export default SideBar;
