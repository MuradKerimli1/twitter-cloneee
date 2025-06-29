import { FaRegHeart, FaRegTimesCircle } from "react-icons/fa";
import { FaRegComment } from "react-icons/fa";
import { Bookmark } from "lucide-react";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import useTweetOptions from "../hooks/useTweetOptions";
import { useState } from "react";
import CommentContainer from "./CommentContainer";
import { setSelectedTweet } from "../store/slices/tweet.slice";
import { useNavigate } from "react-router-dom";
import { IoMdMore } from "react-icons/io";
import { HiBars3 } from "react-icons/hi2";
import { axiosError } from "../error/axiosError";
import { Axios } from "../lib/axios";
import { summaryApi } from "../config/summaryApi";
import toast from "react-hot-toast";

const Tweet = ({ data, options = true }) => {
  const { user } = useSelector((state) => state.auth);
  const { likeTweet, bookMarkTweet } = useTweetOptions();
  const timeAgo = moment(data.created_at).fromNow();
  const likedTweet = data.likes.some((like) => like.id === user.id);
  const bookMark = data.bookmarks.some((b) => b.id === user.id);
  const [openComment, setOpenComment] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const handleSelectTweet = (tweet) => {
    navigate(`/tweet/${tweet.id}`);
  };

  const handleLikeClick = (e) => {
    e.stopPropagation();
    likeTweet(data.id);
  };

  const handleBookMarkClick = (e) => {
    e.stopPropagation();
    bookMarkTweet(data.id);
  };

  const handleCommentClick = (e) => {
    e.stopPropagation();
    dispatch(setSelectedTweet(data));
    setOpenComment((prev) => !prev);
  };

  const handleDeleteTweet = async (id) => {
    try {
      const res = await Axios({ ...summaryApi.deleteTweet(id) });
      if (res.data.success) {
        toast.success(res.data.message);
      }
    } catch (error) {
      axiosError(error);
    }
  };

  return (
    <>
      <div
        className="w-full border border-[#2F3336] p-2 rounded-md flex gap-2 cursor-pointer"
        onClick={(e) => handleSelectTweet(data)}
      >
        {/* Tweet user image */}
        <div
          className="min-w-10 max-w-10 w-full h-10 rounded-full overflow-hidden"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/profile/${data.user.id}`);
          }}
        >
          <img
            src={
              data.user?.profil_picture ||
              "https://plus.unsplash.com/premium_photo-1689568126014-06fea9d5d341?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cHJvZmlsZXxlbnwwfHwwfHx8MA%3D%3D"
            }
            alt="userProfile"
            className="w-full h-full object-cover object-center"
          />
        </div>

        <div className="w-full grid gap-2 py-2 items-start">
          {/* Tweet user details */}
          <div className=" flex gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 min-w-0">
              <span className="text-sm font-bold whitespace-nowrap">
                @{data.user.username}
              </span>
              <p className="text-[#71767B] text-sm truncate overflow-hidden text-ellipsis whitespace-nowrap">
                <span>{timeAgo}</span>
              </p>
            </div>
            {user.id == data.user.id && options && (
              <div
                className="relative"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <IoMdMore
                  size={19}
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                  }}
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
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowMenu(!showMenu);
                      }}
                    />
                  </div>
                  <div
                    className="p-2 hover:bg-gray-800 cursor-pointer text-red-500"
                    onClick={() => handleDeleteTweet(data.id)}
                  >
                    Delete Tweet
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tweet text & media */}
          <div className="w-full rounded flex flex-col items-start justify-start">
            <p className="font-medium text-xs sm:text-sm mb-2">
              {data.text || ""}
            </p>
            <div className="w-full h-fit rounded overflow-hidden">
              {data.image && (
                <img
                  src={data.image}
                  className="object-cover object-center w-full h-auto rounded-md"
                  alt="tweet media"
                />
              )}

              {data.video && !data.image && (
                <iframe
                  className="w-full h-64 rounded-md"
                  src={data.video}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              )}
            </div>
          </div>

          {/* Tweet options like/comment/mark */}
          {options && (
            <div className="w-full flex items-center justify-between mt-1">
              {/* like and comment */}
              <div className="flex items-center gap-5">
                {/* like */}
                <div
                  className="flex items-center gap-1 text-sm cursor-pointer text-[#71767B] hover:text-[#1D9BF0] transition-colors"
                  onClick={handleLikeClick}
                >
                  <FaRegHeart
                    className={likedTweet ? "text-red-500" : "text-[#7eb1e5]"}
                  />
                  <span>{data.likes.length}</span>
                </div>

                {/* comment */}
                <div
                  onClick={handleCommentClick}
                  className="flex items-center gap-1 text-sm cursor-pointer text-[#71767B] hover:text-[#1D9BF0] transition-colors"
                >
                  <FaRegComment />
                  <span>{data.comments.length}</span>
                </div>
              </div>

              {/* mark */}
              <div className="flex items-center gap-1 text-sm cursor-pointer text-[#71767B] hover:text-[#1D9BF0] transition-colors">
                <Bookmark
                  className={bookMark ? " text-[#1D9BF0]" : "text-[#71767B]  "}
                  onClick={handleBookMarkClick}
                  size={20}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      {openComment && <CommentContainer close={() => setOpenComment(false)} />}
    </>
  );
};

export default Tweet;
