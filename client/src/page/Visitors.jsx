import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { axiosError } from "../error/axiosError";
import { Axios } from "../lib/axios";
import { summaryApi } from "../config/summaryApi";
import { setVisitors } from "../store/slices/auth.slice";
import { Link } from "react-router-dom";

const Visitors = () => {
  const { visitors } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const fetchVisitors = async () => {
      setLoading(true);
      try {
        const res = await Axios({ ...summaryApi.fetchVisitors });
        if (res.data.success) {
          const viewers = res.data.viewers;
          dispatch(setVisitors(viewers));
        }
      } catch (error) {
        axiosError(error);
      } finally {
        setLoading(false);
      }
    };
    fetchVisitors();
  }, [dispatch]);

  return (
    <div>
      {loading && (
        <div className="flex items-center justify-center my-4">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      )}
      {!loading && visitors.length === 0 && (
        <div className="flex items-center justify-center my-4">
          <span className="text-xl text-gray-500 font-bold ">
            Henüz ziyaretçi yok
          </span>
        </div>
      )}
      {!loading && visitors.length > 0 && (
        <div className="grid gap-4">
          <div>
            <p>
              <span className="font-bold text-lg">Profil Ziyaretçileri</span>
            </p>
          </div>
          {visitors.map((visitor) => (
            <Link
              to={"/profile/" + visitor.id}
              key={visitor.id}
              className="flex items-center gap-4 p-4 bg-[#1F2124] rounded-lg"
            >
              <div className="max-w-10 w-full h-10 rounded-full overflow-hidden">
                <img
                  src={
                    visitor.profil_picture ||
                    "https://plus.unsplash.com/premium_photo-1689568126014-06fea9d5d341?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cHJvZmlsZXxlbnwwfHwwfHx8MA%3D%3D"
                  }
                  alt="userProfile"
                  className="w-full h-full object-cover object-center"
                />
              </div>

              <div>
                <h3 className="font-bold">{visitor.username}</h3>
                <p className="text-sm text-gray-400">{visitor.email}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Visitors;
