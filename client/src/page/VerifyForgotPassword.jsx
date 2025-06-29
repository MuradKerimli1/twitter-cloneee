import { useEffect, useState } from "react";
import { BsTwitterX } from "react-icons/bs";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { axiosError } from "../error/axiosError";
import { Axios } from "../lib/axios";
import { summaryApi } from "../config/summaryApi";
import { useSelector } from "react-redux";

const VerifyForgotPassword = () => {
  const [forgotVerifyValues, setVerifyForgotValues] = useState({
    email: "",
    otp: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!location.state) {
      navigate("/auth/forgot-password");
    }
    setVerifyForgotValues((prev) => ({ ...prev, email: location.state }));
  }, [location]);

  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, []);

  const handleValues = Object.values(forgotVerifyValues).every((v) => v !== "");

  const handleChange = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setVerifyForgotValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    try {
      const res = await Axios({
        ...summaryApi.verify_forgot_password,
        data: forgotVerifyValues,
      });

      if (res.data.success) {
        toast.success(res.data.message);
        navigate("/auth/reset-password", { state: forgotVerifyValues.email });
        setVerifyForgotValues({
          email: "",
          otp: "",
        });
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
          <p className="font-semibold text-3xl my-3">Kimliginizi Kanitlayin</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid space-y-4 p-6 w-full border border-gray-600 rounded-md bg-[#0f0f0f]"
        >
          {/* otp */}
          <div className="grid gap-2 w-full">
            <label htmlFor="otp" className="text-sm font-medium">
              Otp
            </label>
            <input
              type="number"
              name="otp"
              id="otp"
              value={forgotVerifyValues.otp}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 6) {
                  handleChange(e);
                }
              }}
              placeholder="Enter your otp"
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

export default VerifyForgotPassword;
