import toast from "react-hot-toast";

export const axiosError = (error) => {
  toast.error(error?.response?.data?.message);
};
