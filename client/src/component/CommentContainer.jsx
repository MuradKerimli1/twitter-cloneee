import { useDispatch, useSelector } from "react-redux";
import { IoCloseSharp } from "react-icons/io5";
import moment from "moment";
import { useState } from "react";
import useTweetOptions from "../hooks/useTweetOptions";
import { resetSelectedTweet } from "../store/slices/tweet.slice";

const CommentContainer = ({ close }) => {
  const { user } = useSelector((state) => state.auth);
  const { selectedTweet } = useSelector((state) => state.tweet);
  const timeAgo = moment(selectedTweet?.created_at).fromNow();
  const { commentTweet } = useTweetOptions();
  const [text, setText] = useState("");
  const dispatch = useDispatch();

  const handleClose = () => {
    close();
    dispatch(resetSelectedTweet());
    setText("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text) {
      return;
    }
    commentTweet(selectedTweet.id, text);
    setText("");
    close();
  };

  return (
    <section className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-[#16181c] w-full max-w-xl p-4 rounded-2xl border border-gray-800 shadow-xl">
        {/* Close icon */}
        <div className="flex justify-end">
          <button
            onClick={handleClose}
            className="p-1 rounded-full hover:bg-gray-800 transition-colors"
          >
            <IoCloseSharp
              size={24}
              className="text-gray-400 hover:text-white transition-colors"
            />
          </button>
        </div>

        {/* Tweet info */}
        <div className="flex gap-3 mt-1">
          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
            <img
              src={
                selectedTweet?.user.profil_picture ||
                "https://plus.unsplash.com/premium_photo-1689568126014-06fea9d5d341?fm=jpg&q=60&w=3000"
              }
              alt="userProfile"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col gap-1 text-sm">
            <div className="flex flex-wrap items-baseline gap-1">
              <p className="font-bold text-white">
                {selectedTweet?.user.username}
              </p>
              <span className="text-gray-500 text-[15px]">
                @{selectedTweet?.user.email.split("@")[0]} · {timeAgo}
              </span>
            </div>
            <div className="text-[15px] text-white leading-5 mt-1">
              <p className="whitespace-pre-line">{selectedTweet?.text}</p>
              <p className="text-gray-500 mt-3 text-[15px]">
                Replying to{" "}
                <span className="text-blue-400">
                  @{selectedTweet?.user.email.split("@")[0]}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Comment input */}
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
              <img
                src={user.profil_picture || "https://plus.unsplash.com/premium_photo-1689568126014-06fea9d5d341?fm=jpg&q=60&w=3000"}
                alt="userProfile"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <textarea
                className="w-full text-white bg-transparent resize-none text-[17px] placeholder:text-gray-500 focus:outline-none"
                placeholder="Post your reply"
                rows={4}
                value={text}
                onChange={(e) => setText(e.target.value)}
                autoFocus
              />
              <div className="border-t border-gray-800 pt-3 flex justify-end">
                <button
                  disabled={!text}
                  className={`px-4 py-1.5 rounded-full font-bold text-[15px] transition-all ${
                    !text
                      ? "bg-blue-500/50 text-white/50 cursor-not-allowed"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                >
                  Reply
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
};

export default CommentContainer;
