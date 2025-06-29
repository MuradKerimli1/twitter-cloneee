import { useEffect, useState, useCallback } from "react";
import { axiosError } from "../error/axiosError";
import { summaryApi } from "../config/summaryApi";
import { Axios } from "../lib/axios";
import SuggestedChild from "../component/SuggestedChild";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import useScroll from "../hooks/useScroll";
import InfiniteScroll from "react-infinite-scroll-component";

const SuggestedUsers = () => {
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalUsers, setTotalUsers] = useState(0);
  const navigate = useNavigate();
  const isScrolled = useScroll(20);

  const fetchSuggestedUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await Axios({
        ...summaryApi.suggesstionUsers,
        data: { page, limit },
      });
      if (res.data.success) {
        setTotalUsers(res.data.totalUsers);
        setSuggestedUsers((prev) =>
          page === 1 ? res.data?.data || [] : [...prev, ...res.data.data]
        );
      }
    } catch (error) {
      axiosError(error);
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchSuggestedUsers();
  }, [fetchSuggestedUsers]);

  if (loading && page === 1) {
    return (
      <div className="flex justify-center my-4">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  return (
    <div className="p-2">
      <div
        className={`w-full flex items-center gap-5 sticky p-2 top-0 border-b-2 border-[#17191B] ${
          isScrolled ? "backdrop-blur-lg bg-black/40" : ""
        }`}
      >
        <FaArrowLeft
          className="cursor-pointer"
          size={17}
          onClick={() => navigate(-1)}
        />
        <p className="font-bold capitalize">Baglan</p>
      </div>

      {!loading && suggestedUsers.length === 0 ? (
        <p className="text-white font-semibold p-4">No users found</p>
      ) : (
        <InfiniteScroll
          dataLength={suggestedUsers.length}
          next={() => setPage((prev) => prev + 1)}
          hasMore={totalUsers > suggestedUsers.length}
          loader={
            <div className="flex justify-center my-2">
              <span className="loading loading-spinner" />
            </div>
          }
        >
          <div className="mt-2 grid gap-4">
            {suggestedUsers.map((s) => (
              <SuggestedChild key={s.id} data={s} />
            ))}
          </div>
        </InfiniteScroll>
      )}
    </div>
  );
};

export default SuggestedUsers;
