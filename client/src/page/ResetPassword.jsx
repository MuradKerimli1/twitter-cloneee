import { useEffect, useState } from "react";
import { BsTwitterX } from "react-icons/bs";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { axiosError } from "../error/axiosError";
import { Axios } from "../lib/axios";
import { summaryApi } from "../config/summaryApi";
import { useSelector } from "react-redux";

const ResetPassword = () => {
  const [resetPasswordValues, setResetPasswordValues] = useState({
    email: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!location.state) {
      navigate("/auth/forgot-password");
    }
    setResetPasswordValues((prev) => ({ ...prev, email: location.state }));
  }, [location]);

  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, []);

  const handleValues = Object.values(resetPasswordValues).every(
    (v) => v !== ""
  );

  const handleChange = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setResetPasswordValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      resetPasswordValues.confirmPassword !== resetPasswordValues.newPassword
    ) {
      return toast.error("sifre eyni olmalidi");
    }

    setLoading(true);
    try {
      const res = await Axios({
        ...summaryApi.reset_password,
        data: resetPasswordValues,
      });

      if (res.data.success) {
        toast.success(res.data.message);
        setResetPasswordValues({
          email: "",
          newPassword: "",
          confirmPassword: "",
        });
        navigate("/auth/login");
      }
    } catch (error) {
      axiosError(error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <section className="w-full h-screen bg-black flex items-center justify-center">
      <div className="max-w-xl w-full text-white flex flex-col gap-5 p-4 rounded-md shadow-lg">
        <BsTwitterX size={40} />
        <div className="flex items-center justify-center">
          <p className="font-semibold text-3xl my-3">Sifrenizi degistirin</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid space-y-4 p-6 w-full border border-gray-600 rounded-md bg-[#0f0f0f]"
        >
          {/* newPassword */}
          <div className="grid gap-2 w-full">
            <label htmlFor="newPassword" className="text-sm font-medium">
              New password
            </label>
            <input
              type="password"
              name="newPassword"
              id="newPassword"
              value={resetPasswordValues.newPassword}
              onChange={handleChange}
              placeholder="********"
              className="input w-full bg-[#E7E9EA] text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* ConfirmPassword */}
          <div className="grid gap-2 w-full">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              confirm password
            </label>
            <input
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              value={resetPasswordValues.confirmPassword}
              onChange={handleChange}
              placeholder="********"
              className="input w-full bg-[#E7E9EA] text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* submit button */}
          <button
            type="submit"
            disabled={!handleValues}
            className={`${
              !handleValues
                ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                : "bg-[#1B92E2] text-white cursor-pointer"
            } w-full p-3 font-bold text-sm rounded-md  transition-colors`}
          >
            {loading ? "...Loading" : "Kodu Dogrula"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default ResetPassword;
