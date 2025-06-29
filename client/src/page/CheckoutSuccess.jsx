import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

import { summaryApi } from "../config/summaryApi";
import { Axios } from "../lib/axios";
import { axiosError } from "../error/axiosError";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { setUser, updateUser } from "../store/slices/auth.slice";

const CheckoutSuccess = () => {
  const { user } = useSelector((state) => state.auth);
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const dispatch = useDispatch();

  useEffect(() => {
    const confirmPayment = async () => {
      try {
        if (!sessionId) return;

        const response = await Axios({
          ...summaryApi.buyPackage,
          data: { session_id: sessionId },
        });

        if (response.data.success) {
          toast.success("Ödəniş uğurla alındı!");

          const updatedUser = {
            ...user,
            isPremium: true,
            premiumExpiredAt: response.data.premiumExpiresAt,
          };

          dispatch(setUser(updatedUser));

          setTimeout(() => {
            window.location.href = "/premium";
          }, 2000);
        } else {
          toast.error("Ödəniş alınmadı!");
          setTimeout(() => {
            window.location.href = "/";
          }, 2000);
        }
      } catch (error) {
        axiosError(error);
      }
    };

    confirmPayment();
  }, [sessionId]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className=" rounded-xl shadow-2xl p-8 max-w-md w-full text-center transform transition-all duration-300 hover:scale-[1.02]">
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">
          Ödəniş Tamamlandı!
        </h2>
        <p className="text-gray-600 mb-6">
          Premium paketiniz aktivləşdirilir...
        </p>

        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full animate-pulse"
            style={{ width: "70%" }}
          ></div>
        </div>

        <p className="text-sm text-gray-500 mt-4">
          Sizi premium səhifəsinə yönləndiririk...
        </p>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
