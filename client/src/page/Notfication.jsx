import { useDispatch, useSelector } from "react-redux";
import useFetchNotfications from "../hooks/fetchNotfication";
import { HiBars3 } from "react-icons/hi2";
import { FaRegTimesCircle } from "react-icons/fa";
import useScroll from "../hooks/useScroll";
import NotficationChild from "../component/NotficationChild";
import { Axios } from "../lib/axios";
import { summaryApi } from "../config/summaryApi";
import { setNotfication } from "../store/slices/notfication.slice";
import toast from "react-hot-toast";
import { axiosError } from "../error/axiosError";
import { useState } from "react";

const Notfication = () => {
  const { loading, notfications } = useSelector((state) => state.notfication);
  useFetchNotfications();
  const isScrolled = useScroll(20);
  const dispatch = useDispatch();
  const [showMenu, setShowMenu] = useState(false);

  const deleteAllNotfications = async () => {
    try {
      const res = await Axios({ ...summaryApi.deleteAllnotfications });
      if (res.data.success) {
        dispatch(setNotfication([]));
        toast(res.data.message, {
          icon: "👏",
        });
        setShowMenu(false);
      }
    } catch (error) {
      axiosError(error);
    }
  };

  return (
    <div className="p-2 w-full relative">
      <div
        className={`sticky z-20 top-0 w-full flex items-center justify-between border-b border-[#2F3336] py-2 ${
          isScrolled ? "backdrop-blur-lg bg-black/40" : ""
        } transition-all ease-in-out duration-300`}
      >
        <p className="font-bold text-sm sm:text-xl">Bildirimler</p>
        <div className="relative">
          <HiBars3
            size={19}
            className="cursor-pointer"
            onClick={() => setShowMenu(!showMenu)}
          />

          <div
            className={`absolute right-0 mt-2 w-48 bg-black border border-[#2F3336] rounded-md shadow-lg z-30 ${
              showMenu
                ? "opacity-100 translate-y-0"
                : "opacity-0 -translate-y-2 pointer-events-none"
            } transition-all duration-200 ease-in-out`}
          >
            <div className="flex justify-between items-center p-2 border-b border-[#2F3336]">
              <span className="font-semibold">Options</span>
              <FaRegTimesCircle
                size={16}
                className="cursor-pointer hover:text-gray-400"
                onClick={() => setShowMenu(false)}
              />
            </div>
            <div
              className="p-2 hover:bg-gray-800 cursor-pointer text-red-500"
              onClick={deleteAllNotfications}
            >
              Delete All Notifications
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center my-4">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        )}
        {!loading &&
          notfications.length > 0 &&
          notfications.map((n, index) => (
            <NotficationChild key={index} data={n} />
          ))}
        {!loading && notfications.length === 0 && (
          <p className="p-4 font-semibold">You dont have any notfication</p>
        )}
      </div>
    </div>
  );
};

export default Notfication;
