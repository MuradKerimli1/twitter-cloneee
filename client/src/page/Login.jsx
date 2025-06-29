import { useEffect, useState } from "react";
import { BsTwitterX } from "react-icons/bs";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { axiosError } from "../error/axiosError";
import { Axios } from "../lib/axios";
import { summaryApi } from "../config/summaryApi";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../store/slices/auth.slice";

const Login = () => {
  const [loginValues, setLoginValues] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, []);

  const handleValues = Object.values(loginValues).every((v) => v !== "");

  const handleChange = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setLoginValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    try {
      const res = await Axios({ ...summaryApi.login, data: loginValues });

      if (res.data.success) {
        toast.success(res.data.message);
        localStorage.setItem("token", res.data.token);
        dispatch(setUser(res.data.user));
        setLoginValues({
          email: "",
          password: "",
        });
        navigate("/");
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
          <p className="font-semibold text-3xl my-3">X'e giriş yapın</p>
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
              value={loginValues.email}
              onChange={handleChange}
              placeholder="Enter your email"
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
              value={loginValues.password}
              onChange={handleChange}
              placeholder="********"
              className="input w-full bg-[#E7E9EA] text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <Link
            to={"/auth/forgot-password"}
            className="text-sm font-bold text-right cursor-pointer"
          >
            Sifrenizimi unuttunuz?
          </Link>

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
            {loading ? "...Loading" : "  Kayit Ol"}
          </button>

          {/* Link register */}
          <p className="text-sm font-bold mt-2 text-center">
            Zaten hesabin varmi?{" "}
            <Link
              to="/auth/register"
              className="text-[#1B92E2] hover:underline ml-2"
            >
              Register
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
};

export default Login;
