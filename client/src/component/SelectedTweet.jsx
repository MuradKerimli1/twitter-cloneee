import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa6";
import useScroll from "../hooks/useScroll";
import { Axios } from "../lib/axios";
import { summaryApi } from "../config/summaryApi";
import {
  resetSelectedTweet,
  setSelectedTweet,
} from "../store/slices/tweet.slice";
import { axiosError } from "../error/axiosError";
import { useEffect, useState } from "react";
import { Bookmark } from "lucide-react";
import { FaRegComment, FaRegHeart, FaHeart, FaRetweet } from "react-icons/fa";
import useTweetOptions from "../hooks/useTweetOptions";
import Comment from "./Comment";
import FollowButton from "./FollowButton";
import { FiShare2 } from "react-icons/fi";

const DEFAULT_PROFILE_IMAGE = "https://plus.unsplash.com/premium_photo-1689568126014-06fea9d5d341?fm=jpg&q=60&w=3000";
const MAX_COMMENT_LENGTH = 280;

const SelectedTweet = () => {
  const { id } = useParams();
  const { selectedTweet } = useSelector((state) => state.tweet);
  const { user } = useSelector((state) => state.auth);
  const isScrolled = useScroll(20);
  const likedTweet = selectedTweet?.likes?.some((like) => like.id === user.id);
  const bookMark = selectedTweet?.bookmarks?.some((b) => b.id === user.id);
  const { likeTweet, commentTweet, bookMarkTweet } = useTweetOptions();
  const [isLoading, setIsLoading] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchTweet = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await Axios({ ...summaryApi.getTweetById(id) });
        if (response.data.success) {
          dispatch(setSelectedTweet(response.data.tweet));
        }
      } catch (error) {
        setError("Failed to load tweet. Please try again.");
        axiosError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTweet();

    return () => {
      dispatch(resetSelectedTweet());
    };
  }, [id, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) {
      setError("Comment cannot be empty");
      return;
    }

    try {
      await commentTweet(selectedTweet.id, text);
      setText("");
      setError(null);
    } catch (error) {
      setError("Failed to post comment");
    }
  };

  const handleLike = async () => {
    try {
      await likeTweet(selectedTweet.id);
    } catch (error) {
      setError("Failed to like tweet");
    }
  };

  const handleBookmark = async () => {
    try {
      await bookMarkTweet(selectedTweet.id);
    } catch (error) {
      setError("Failed to bookmark tweet");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error && !selectedTweet) {
    return (
      <section className="max-w-2xl mx-auto border-x border-gray-800 min-h-screen">
        <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-sm p-4 border-b border-gray-800 flex items-center gap-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-gray-800 transition-colors"
          >
            <FaArrowLeft className="text-xl" />
          </button>
          <h1 className="text-xl font-bold">Post</h1>
        </div>
        <div className="p-8 text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-2xl mx-auto border-x border-gray-800 min-h-screen">
      {/* Header */}
      <div
        className={`sticky top-0 z-10 p-4 border-b border-gray-800 flex items-center gap-6 ${
          isScrolled ? "bg-black/80 backdrop-blur-sm" : "bg-black"
        } transition-all duration-300`}
      >
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-gray-800 transition-colors"
        >
          <FaArrowLeft className="text-xl" />
        </button>
        <h1 className="text-xl font-bold">Post</h1>
      </div>

      {error && (
        <div className="p-4 text-red-500 text-center bg-red-500/10">
          {error}
        </div>
      )}

      {selectedTweet && (
        <div className="p-4">
          {/* Tweet Author */}
          <div className="flex items-start gap-3 pb-4 border-b border-gray-800">
            <div
              className="w-12 h-12 rounded-full overflow-hidden cursor-pointer flex-shrink-0"
              onClick={() => navigate(`/profile/${selectedTweet.user.id}`)}
            >
              <img
                src={selectedTweet.user.profil_picture || DEFAULT_PROFILE_IMAGE}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <h2 className="font-bold text-lg hover:underline cursor-pointer">
                    {selectedTweet.user.username}
                  </h2>
                  <span className="text-gray-500 text-sm ml-1">
                    @{selectedTweet.user.email.split("@")[0]}
                  </span>
                </div>
                <FollowButton id={selectedTweet.user.id} />
              </div>

              {/* Tweet Content */}
              <div className="mt-2">
                <p className="text-lg whitespace-pre-line">
                  {selectedTweet.text}
                </p>
              </div>

              {/* Media */}
              {selectedTweet.image && (
                <div className="mt-3 rounded-xl overflow-hidden border border-gray-800">
                  <img
                    src={selectedTweet.image}
                    className="w-full max-h-[500px] object-contain"
                    alt="Tweet media"
                  />
                </div>
              )}

              {selectedTweet.video && !selectedTweet.image && (
                <div className="mt-3 rounded-xl overflow-hidden border border-gray-800">
                  <video
                    controls
                    className="w-full"
                    src={selectedTweet.video}
                  />
                </div>
              )}

              {/* Tweet Stats */}
              <div className="mt-3 text-gray-500 text-sm">
                <span>
                  {new Date(selectedTweet.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span className="mx-1">·</span>
                <span>
                  {new Date(selectedTweet.created_at).toLocaleDateString()}
                </span>
              </div>

              {/* Tweet Actions */}
              <div className="flex justify-between mt-4 pt-3 border-t border-gray-800">
                <button
                  className="flex items-center gap-1 text-gray-500 hover:text-blue-400 group"
                  onClick={() =>
                    document.getElementById("comment-textarea")?.focus()
                  }
                >
                  <div className="p-2 rounded-full group-hover:bg-blue-400/10">
                    <FaRegComment className="text-lg" />
                  </div>
                  <span>{selectedTweet.comments.length}</span>
                </button>

                <button className="flex items-center gap-1 text-gray-500 hover:text-green-400 group">
                  <div className="p-2 rounded-full group-hover:bg-green-400/10">
                    <FaRetweet className="text-lg" />
                  </div>
                </button>

                <button
                  className="flex items-center gap-1 text-gray-500 hover:text-pink-400 group"
                  onClick={handleLike}
                >
                  <div className="p-2 rounded-full group-hover:bg-pink-400/10">
                    {likedTweet ? (
                      <FaHeart className="text-lg text-pink-500" />
                    ) : (
                      <FaRegHeart className="text-lg" />
                    )}
                  </div>
                  <span>{selectedTweet.likes.length}</span>
                </button>

                <button
                  className="flex items-center gap-1 text-gray-500 hover:text-blue-400 group"
                  onClick={handleBookmark}
                >
                  <div className="p-2 rounded-full group-hover:bg-blue-400/10">
                    <Bookmark
                      className={`text-lg ${
                        bookMark ? "text-blue-500 fill-blue-500" : ""
                      }`}
                    />
                  </div>
                </button>

                <button className="flex items-center gap-1 text-gray-500 hover:text-blue-400 group">
                  <div className="p-2 rounded-full group-hover:bg-blue-400/10">
                    <FiShare2 className="text-lg" />
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Comment Form */}
          <div className="py-4 border-b border-gray-800">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                <img
                  src={user.profil_picture || DEFAULT_PROFILE_IMAGE}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <textarea
                  id="comment-textarea"
                  className="w-full bg-transparent text-white text-lg placeholder-gray-500 resize-none outline-none"
                  placeholder="Post your reply"
                  rows={3}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  maxLength={MAX_COMMENT_LENGTH}
                />
                <div className="flex justify-between items-center mt-2">
                  <span
                    className={`text-xs ${
                      text.length === MAX_COMMENT_LENGTH
                        ? "text-red-500"
                        : "text-gray-500"
                    }`}
                  >
                    {text.length}/{MAX_COMMENT_LENGTH}
                  </span>
                  <button
                    type="submit"
                    disabled={!text.trim()}
                    className={`px-4 py-1.5 rounded-full font-bold ${
                      !text.trim()
                        ? "bg-blue-500/50 text-white/50 cursor-not-allowed"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                    } transition-colors`}
                  >
                    Reply
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Comments Section */}
          <div className="divide-y divide-gray-800">
            {selectedTweet.comments.length > 0 ? (
              [...selectedTweet.comments]
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .map((comment) => (
                  <Comment key={comment.id} comment={comment} />
                ))
            ) : (
              <div className="py-8 text-center text-gray-500">
                <p>No replies yet</p>
                <p className="text-sm mt-1">Be the first to reply!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default SelectedTweet;
