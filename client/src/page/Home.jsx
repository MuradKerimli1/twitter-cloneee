import { useEffect, useState, useCallback, useRef } from "react";
import Tweet from "../component/Tweet";
import useScroll from "../hooks/useScroll";
import InfiniteScroll from "react-infinite-scroll-component";
import { Axios } from "../lib/axios";
import { summaryApi } from "../config/summaryApi";
import { useDispatch, useSelector } from "react-redux";
import { nullTweet, setTweet } from "../store/slices/tweet.slice";

const Home = () => {
  const isScrolled = useScroll(50);
  const [activeTab, setActiveTab] = useState("OZEL");
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loadingTweets, setLoadingTweets] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const isInitialLoad = useRef(true);
  const dispatch = useDispatch();
  const { tweets } = useSelector((state) => state.tweet);

  const fetchTweets = useCallback(
    async (currentPage, isTabSwitch = false) => {
      setLoadingTweets(true);
      try {
        const apiConfig =
          activeTab === "OZEL"
            ? summaryApi.fetchAllTweet
            : summaryApi.followingTweet;

        const res = await Axios({
          ...apiConfig,
          data: { page: currentPage, limit: 15 },
        });

        if (res.data.success) {
          setTotalItems(res.data.totalTweets);

          if (isTabSwitch || currentPage === 1) {
            dispatch(setTweet(res.data.tweets));
          } else {
            dispatch(setTweet([...tweets, ...res.data.tweets]));
          }

          setHasMore(
            res.data.tweets.length > 0 &&
              (isTabSwitch
                ? res.data.tweets.length < res.data.totalTweets
                : tweets.length + res.data.tweets.length < res.data.totalTweets)
          );
        }
      } catch (error) {
        setHasMore(false);
      } finally {
        setLoadingTweets(false);
        isInitialLoad.current = false;
      }
    },
    [activeTab, dispatch, tweets]
  );

  useEffect(() => {
    const controller = new AbortController();
    isInitialLoad.current = true;
    setPage(1);
    setHasMore(true);
    dispatch(nullTweet());
    fetchTweets(1, true);

    return () => {
      controller.abort();
    };
  }, [activeTab]);

  useEffect(() => {
    if (!isInitialLoad.current && page > 1) {
      fetchTweets(page);
    }
  }, [page]);

  const loadMoreTweets = () => {
    if (!loadingTweets && hasMore) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const handleTabChange = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };

  return (
    <section className="h-full w-full">
      <div className="w-full">
        <div
          className={`w-full grid grid-cols-2 sticky top-0 ${
            isScrolled ? "backdrop-blur-lg bg-black/40" : ""
          } transition-all ease-in-out duration-300`}
        >
          <div
            className="flex items-center justify-center cursor-pointer hover:bg-[#181818] rounded transition-colors"
            onClick={() => handleTabChange("OZEL")}
          >
            <p
              className={`${
                activeTab === "OZEL" ? "border-b-4 border-[#1D9BF0]" : ""
              } w-fit p-2 font-bold`}
            >
              Sana Ozel
            </p>
          </div>
          <div
            className="flex items-center justify-center cursor-pointer hover:bg-[#181818] rounded transition-colors"
            onClick={() => handleTabChange("TAKIP")}
          >
            <p
              className={`${
                activeTab === "TAKIP" ? "border-b-4 border-[#1D9BF0]" : ""
              } w-fit p-2 font-bold`}
            >
              Takip
            </p>
          </div>
        </div>

        {isInitialLoad.current && loadingTweets && (
          <div className="flex items-center justify-center my-4">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        )}

        <InfiniteScroll
          dataLength={tweets?.length || 0}
          next={loadMoreTweets}
          hasMore={hasMore}
          loader={
            !isInitialLoad.current && (
              <div className="flex items-center justify-center my-4">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            )
          }
          endMessage={
            tweets?.length > 0 &&
            !loadingTweets && (
              <p className="text-center py-4">No more tweets to load</p>
            )
          }
        >
          <div className="grid grid-cols-1 p-3">
            {[...tweets]
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
              .map((tweet) => (
                <Tweet key={tweet.id} data={tweet} />
              ))}
          </div>
        </InfiniteScroll>
        {!isInitialLoad.current && tweets.length === 0 && (
          <div className=" font-semibold  flex items-center justify-center p-4">
            No tweets yet
          </div>
        )}
      </div>
    </section>
  );
};

export default Home;
