import toast from "react-hot-toast";
import { summaryApi } from "../config/summaryApi";
import { axiosError } from "../error/axiosError";
import { Axios } from "../lib/axios";
import { useSelector } from "react-redux";

const FollowButton = ({ id }) => {
  const { user } = useSelector((state) => state.auth);

  const isFollowing = user?.following?.some?.((f) => f.id == id) || false;

  const handleFollow = async (e) => {
    e?.stopPropagation?.();
    e?.preventDefault?.();

    if (!user) {
      toast.error("Lütfen giriş yapın");
      return;
    }

    try {
      const res = await Axios({ ...summaryApi.followUser(id) });
      if (res.data.success) {
        toast.success(res.data.message);
      }
    } catch (error) {
      axiosError(error);
    }
  };

  
  if (user?.id == id) return null;

  return (
    <button
      type="button"
      onClick={handleFollow}
      disabled={!user}
      className={`px-3 py-2 cursor-pointer font-bold text-sm rounded-full transition-all duration-200 ${
        isFollowing
          ? "bg-black text-white border border-[#44525C] hover:text-red-500"
          : "bg-[#D7DBDC] text-black hover:bg-gray-300 border-none"
      } ${!user ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {isFollowing ? "Takibi Bırak" : "Takip Et"}
    </button>
  );
};

export default FollowButton;
