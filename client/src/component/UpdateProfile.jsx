import { FaArrowLeft } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import useScroll from "../hooks/useScroll";
import { useRef, useState } from "react";
import { axiosError } from "../error/axiosError";
import toast from "react-hot-toast";
import { Axios } from "../lib/axios";
import { summaryApi } from "../config/summaryApi";
import { setUser } from "../store/slices/auth.slice";

const UpdateProfile = ({ close }) => {
  const navigate = useNavigate();
  const { selectedUser } = useSelector((state) => state.auth);
  const isScrolled = useScroll(20);
  const ref = useRef();
  const dispatch = useDispatch();

  const [userData, setUserData] = useState({
    imageFile: null,
    previewUrl: selectedUser?.profil_picture || "",
    email: selectedUser?.email || "",
    username: selectedUser?.username || "",
    bio: selectedUser?.bio || "",
    isvisible: selectedUser?.isvisible || false,
  });

  const [loading, setLoading] = useState(false);

  const handleChangeImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUserData((prev) => ({
        ...prev,
        imageFile: file,
        previewUrl: URL.createObjectURL(file),
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    let change = false;

    if (userData.imageFile) {
      formData.append("imageUrl", userData.imageFile);
      change = true;
    }
    if (userData.email !== selectedUser?.email) {
      formData.append("email", userData.email);
      change = true;
    }
    if (userData.username !== selectedUser?.username) {
      formData.append("username", userData.username);
      change = true;
    }
    if (userData.bio !== selectedUser?.bio) {
      formData.append("bio", userData.bio);
      change = true;
    }

    if (userData.isvisible !== selectedUser?.isvisible) {
      formData.append("isvisible", userData.isvisible);
      change = true;
    }

    if (!change) {
      return toast("Değişiklik yapmadın!", { icon: "⚠️" });
    }

    setLoading(true);
    try {
      const res = await Axios({ ...summaryApi.updateUser, data: formData });
      if (res.data.success) {
        toast.success(res.data.message);
        dispatch(setUser(res.data.data));
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
    <section
      style={{ backgroundColor: "rgba(36, 45, 52, 0.8)" }}
      className="fixed top-0 bottom-0 right-0 left-0 z-50 w-full flex items-center justify-center p-3"
    >
      <div className="bg-black w-full max-w-2xl p-5 rounded-xl overflow-x-hidden">
        <div
          className={`w-full flex items-center gap-5 sticky p-2 top-0 ${
            isScrolled ? "backdrop-blur-lg bg-black/40 " : ""
          } transition-all ease-in-out duration-300`}
        >
          <FaArrowLeft className="cursor-pointer" size={17} onClick={close} />
          <div className="text-sm">
            <p className="font-bold capitalize">Profili düzenle</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-5 mt-10 mb-5">
          <div
            className="w-32 h-32 rounded-full overflow-hidden cursor-pointer"
            onClick={() => ref.current.click()}
          >
            <img
              src={
                userData.previewUrl ||
                "https://plus.unsplash.com/premium_photo-1689568126014-06fea9d5d341?fm=jpg&q=60&w=3000"
              }
              alt="Profile"
              className="w-full h-full object-cover object-center"
            />
          </div>
          <input
            type="file"
            onChange={handleChangeImage}
            className="hidden"
            ref={ref}
            accept="image/*"
          />
        </div>

        <form onSubmit={handleSubmit} className="grid gap-3 space-y-3">
          <div className="grid w-full gap-1">
            <label htmlFor="email" className="font-medium text-sm">
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              onChange={handleChange}
              placeholder="Enter your email"
              className="input w-full bg-transparent border-[#333639] rounded-md"
              value={userData.email}
            />
          </div>

          <div className="grid w-full gap-1">
            <label htmlFor="username" className="font-medium text-sm">
              Username
            </label>
            <input
              id="username"
              type="text"
              name="username"
              onChange={handleChange}
              placeholder="Enter your username"
              className="input w-full bg-transparent border-[#333639] rounded-md"
              value={userData.username}
            />
          </div>

          <div className="grid w-full gap-1">
            <label htmlFor="bio" className="font-medium text-sm">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              onChange={handleChange}
              placeholder="Enter your Bio"
              className="input w-full bg-transparent border-[#333639] rounded-md"
              value={userData.bio}
              maxLength={160}
            ></textarea>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isvisible"
              name="isvisible"
              checked={userData.isvisible}
              onChange={(e) =>
                setUserData((prev) => ({
                  ...prev,
                  isvisible: e.target.checked,
                }))
              }
            />
            <label htmlFor="isvisible" className="text-sm">
              Profilimi gizli yap
            </label>
          </div>

          <button
            type="submit"
            className="btn w-full disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "...yükleniyor" : "Kaydet"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default UpdateProfile;
