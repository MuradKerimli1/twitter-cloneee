import { useEffect, useState } from "react";
import { axiosError } from "../error/axiosError";
import { Axios } from "../lib/axios";
import { summaryApi } from "../config/summaryApi";
import SuggestedChild from "./SuggestedChild";
import { Link } from "react-router-dom";

const SuggesstedUsers = () => {
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const fetchSuggestedUsers = async () => {
      setLoading(true);
      try {
        const res = await Axios({
          ...summaryApi.suggesstionUsers,
          data: {
            limit: 3,
          },
        });
        if (res.data.success) {
          setSuggestedUsers(res.data.data);
        }
      } catch (error) {
        axiosError(error);
      } finally {
        setLoading(false);
      }
    };
    fetchSuggestedUsers();
  }, []);
  return (
    <div className="p-3 w-full max-h-[300px] overflow-y-auto border-2 border-[#2E2E2E] rounded-xl ">
      <div className=" mb-3">
        <p className=" font-semibold">Kimi takip etmeli</p>
      </div>
      {loading && (
        <div className="flex items-center justify-center my-4">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      )}
      {!loading && suggestedUsers.length == 0 && (
        <div>
          <p className=" font-bold">Hiçbir öneri yok</p>
        </div>
      )}
      {!loading && suggestedUsers.length > 0 && (
        <div>
          <div className=" mb-3">
            {suggestedUsers.map((s, index) => (
              <div key={index} className="grid gap-3 ">
                <SuggestedChild key={s.id} data={s} />
              </div>
            ))}
          </div>
          <Link
            to={"/suggestedUsers"}
            className=" text-[#1C94E5] font-semibold cursor-pointer "
          >
            Daha fazla göster
          </Link>
        </div>
      )}
    </div>
  );
};

export default SuggesstedUsers;
