import { useDispatch, useSelector } from "react-redux";
import {
  cancelNotficationLoading,
  setNotfication,
  startNotficationLoading,
} from "../store/slices/notfication.slice";
import { axiosError } from "../error/axiosError";
import { Axios } from "../lib/axios";
import { summaryApi } from "../config/summaryApi";
import { useEffect } from "react";

const useFetchNotfications = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user) return;

    const fetchNotfication = async () => {
      dispatch(startNotficationLoading());
      try {
        const res = await Axios({ ...summaryApi.notfications });
        if (res.data.status === "success") {
          dispatch(setNotfication(res.data.data));
        }
      } catch (error) {
        axiosError(error);
      } finally {
        dispatch(cancelNotficationLoading());
      }
    };

    fetchNotfication();
  }, [dispatch, user]);
};

export default useFetchNotfications;
