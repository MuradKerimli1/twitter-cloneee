import { useState, useRef } from "react";
import { CgClose } from "react-icons/cg";
import { GoFileMedia } from "react-icons/go";
import { useSelector } from "react-redux";
import { axiosError } from "../error/axiosError";
import { Axios } from "../lib/axios";
import { summaryApi } from "../config/summaryApi";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const CreateTweet = ({ close }) => {
  const [tweetDetails, setTweetDetails] = useState({
    text: "",
    image: null,
    video: null,
  });

  const { user } = useSelector((state) => state.auth);
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [mediaPreview, setMediaPreview] = useState({
    image: null,
    video: null,
  });
  const navigate = useNavigate("/");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTweetDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleMediaChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const fileType = file.type.split("/")[0];

    if (tweetDetails.image || tweetDetails.video) {
      if (!window.confirm("Yüklənmiş media silinəcək. Davam edilsin?")) {
        return;
      }
    }

    const previewURL = URL.createObjectURL(file);

    if (fileType === "image") {
      setTweetDetails({
        text: tweetDetails.text,
        image: file,
        video: null,
      });

      setMediaPreview({
        image: previewURL,
        video: null,
      });
    } else if (fileType === "video") {
      setTweetDetails({
        text: tweetDetails.text,
        video: file,
        image: null,
      });
      setMediaPreview({
        video: previewURL,
        image: null,
      });
    }
  };

  const removeMedia = () => {
    if (mediaPreview.image) URL.revokeObjectURL(mediaPreview.image);
    if (mediaPreview.video) URL.revokeObjectURL(mediaPreview.video);

    setTweetDetails({
      ...tweetDetails,
      image: null,
      video: null,
    });
    setMediaPreview({
      image: null,
      video: null,
    });
  };

  const handleSubmit = async () => {
    if (
      !tweetDetails.text.trim() &&
      !tweetDetails.image &&
      !tweetDetails.video
    ) {
      toast.error("Mətn, şəkil və ya video daxil edin!");
      return;
    }

    const formData = new FormData();
    formData.append("text", tweetDetails.text);

    if (tweetDetails.image) {
      formData.append("image", tweetDetails.image);
    }

    if (tweetDetails.video) {
      formData.append("video", tweetDetails.video);
    }

    setLoading(true);

    try {
      const res = await Axios({ ...summaryApi.createTweet, data: formData });
      if (res.data.status === "success") {
        toast.success(res.data.message);
        close();
        navigate("/");
      }
    } catch (error) {
      axiosError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-black w-full max-w-xl rounded-2xl overflow-hidden border border-gray-800 shadow-xl">
        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex justify-between items-center">
          <button
            onClick={close}
            className="p-2 rounded-full hover:bg-gray-800 transition-colors duration-200"
          >
            <CgClose size={20} className="text-gray-400 hover:text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex gap-3">
            {/* Profile Picture */}
            <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border border-gray-700">
              <img
                src={
                  user.profil_picture ||
                  "https://plus.unsplash.com/premium_photo-1689568126014-06fea9d5d341?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cHJvZmlsZXxlbnwwfHwwfHx8MA%3D%3D"
                }
                alt="Profil"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Tweet Input */}
            <div className="flex-1">
              <textarea
                className="w-full bg-transparent text-white placeholder-gray-500 resize-none outline-none text-lg"
                maxLength={280}
                placeholder="Neler oluyor?"
                rows={4}
                value={tweetDetails.text}
                name="text"
                onChange={handleChange}
              />

              {/* Media Preview */}
              {mediaPreview.image && (
                <div className="relative mt-3 rounded-xl overflow-hidden border border-gray-700">
                  <img
                    src={mediaPreview.image}
                    alt="Preview"
                    className="w-full max-h-96 object-contain rounded-xl"
                  />
                  <button
                    onClick={removeMedia}
                    className="absolute top-3 right-3 bg-black/70 rounded-full p-1.5 hover:bg-black/90 transition-colors duration-200"
                  >
                    <CgClose size={18} className="text-white" />
                  </button>
                </div>
              )}

              {mediaPreview.video && (
                <div className="relative mt-3 rounded-xl overflow-hidden border border-gray-700">
                  <video
                    src={mediaPreview.video}
                    controls
                    className="w-full max-h-96 rounded-xl"
                  />
                  <button
                    onClick={removeMedia}
                    className="absolute top-3 right-3 bg-black/70 rounded-full p-1.5 hover:bg-black/90 transition-colors duration-200"
                  >
                    <CgClose size={18} className="text-white" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 flex justify-between items-center">
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleMediaChange}
              accept="image/*,video/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current.click()}
              className="p-2 rounded-full hover:bg-blue-900/10 transition-colors duration-200"
            >
              <GoFileMedia size={22} className="text-blue-500" />
            </button>
          </div>

          <button
            onClick={handleSubmit}
            disabled={
              (!tweetDetails.text.trim() &&
                !tweetDetails.image &&
                !tweetDetails.video) ||
              loading
            }
            className={`px-5 py-2 rounded-full font-bold text-white transition-colors duration-200 ${
              (tweetDetails.text.trim() ||
                tweetDetails.image ||
                tweetDetails.video) &&
              !loading
                ? "bg-blue-500 hover:bg-blue-600"
                : "bg-blue-500/50 cursor-not-allowed"
            }`}
          >
            {loading ? (
              <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></span>
            ) : (
              "Gönderi yayınla"
            )}
          </button>
        </div>
      </div>
    </section>
  );
};

export default CreateTweet;