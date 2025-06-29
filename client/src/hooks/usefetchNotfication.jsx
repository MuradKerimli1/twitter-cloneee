import { useDispatch, useSelector } from "react-redux";
import { Axios } from "../lib/axios";
import { summaryApi } from "../config/summaryApi";

const useFetchNotfications = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      try {
        const response = await Axios({ ...summaryApi.notfications });
        dispatch(setNotfication(response.data));
      } catch (error) {
        console.error("Bildirişlər alınarkən xəta:", error);
      }
    };

    fetchNotifications();
  }, [user, dispatch]);
};

export default useFetchNotfications;
