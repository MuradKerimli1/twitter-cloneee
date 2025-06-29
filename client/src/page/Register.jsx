import { useEffect, useState } from "react";
import { BsTwitterX } from "react-icons/bs";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { axiosError } from "../error/axiosError";
import { Axios } from "../lib/axios";
import { summaryApi } from "../config/summaryApi";
import { useSelector } from "react-redux";

const Register = () => {
  const [registerValues, setRegisterValues] = useState({
    email: "",
    username: "",
    password: "",
    gender: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, []);

  const handleValues = Object.values(registerValues).every((v) => v !== "");

  const handleChange = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setRegisterValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    try {
      const res = await Axios({ ...summaryApi.register, data: registerValues });

      if (res.data.success) {
        toast.success(res.data.message);
        setRegisterValues({
          email: "",
          username: "",
          password: "",
          gender: "",
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
          <p className="font-semibold text-3xl my-3">Bugün katılın.</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid space-y-4 p-6 w-full border border-gray-600 rounded-md bg-[#0f0f0f]"
        >
          {/* Email */}
          <div className="grid gap-2 w-full">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={registerValues.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="input w-full bg-[#E7E9EA] text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Username */}
          <div className="grid gap-2 w-full">
            <label htmlFor="username" className="text-sm font-medium">
              Username
            </label>
            <input
              type="text"
              name="username"
              id="username"
              value={registerValues.username}
              onChange={handleChange}
              placeholder="Enter your username"
              className="input w-full bg-[#E7E9EA] text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Password */}
          <div className="grid gap-2 w-full">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              value={registerValues.password}
              onChange={handleChange}
              placeholder="********"
              className="input w-full bg-[#E7E9EA] text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Gender */}
          <div className="grid gap-2 w-full">
            <label htmlFor="gender" className="text-sm font-medium">
              Gender
            </label>
            <div className="flex items-center gap-6">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  value="MALE"
                  checked={registerValues.gender === "MALE"}
                  onChange={handleChange}
                  className="radio radio-md bg-[#E7E9EA] text-black border border-[#E7E9EA]"
                />
                <span>Male</span>
              </label>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  value="FEMALE"
                  checked={registerValues.gender === "FEMALE"}
                  onChange={handleChange}
                  className="radio radio-md text-black bg-[#E7E9EA] border border-[#E7E9EA]"
                />
                <span>Female</span>
              </label>
            </div>
          </div>

          {/* submit button */}
          <button
            type="submit"
            disabled={!handleValues}
            className={`${
              !handleValues
                ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                : "bg-[#1B92E2] text-white cursor-pointer"
            } w-full p-3 font-bold text-sm rounded-md mt-4 transition-colors`}
          >
            {loading ? "...Loading" : "  Kayit Ol"}
          </button>

          {/* Link login */}
          <p className="text-sm font-bold mt-2 text-center">
            Zaten hesabin varmi?{" "}
            <Link
              to="/auth/login"
              className="text-[#1B92E2] hover:underline ml-2"
            >
              Login
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
};

export default Register;
