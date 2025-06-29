import { FaArrowLeft } from "react-icons/fa6";
import { useNavigate, useParams } from "react-router-dom";
import useScroll from "../hooks/useScroll";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearSelectedUser, setSelectedUser } from "../store/slices/auth.slice";
import { axiosError } from "../error/axiosError";
import { Axios } from "../lib/axios";
import { summaryApi } from "../config/summaryApi";
import Tweet from "../component/Tweet";
import UpdateProfile from "../component/UpdateProfile";
import { setUserTweets } from "../store/slices/tweet.slice";
import FollowButton from "../component/FollowButton";

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedUser, user } = useSelector((state) => state.auth);
  const isScrolled = useScroll(20);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("Gonderiler");
  const [tweetLoading, setTweetLoading] = useState(false);
  const { userTweets } = useSelector((state) => state.tweet);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const res = await Axios({ ...summaryApi.getUserById(id) });

        if (res.data.success) {
          dispatch(setSelectedUser(res.data.data));
          setIsVisible(res.data.isvisible);
        }
      } catch (error) {
        axiosError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    return () => {
      dispatch(clearSelectedUser());
      dispatch(setUserTweets([]));
    };
  }, [id]);

  useEffect(() => {
    if (selectedUser && user) {
      const isFollowing = selectedUser.followers?.some(
        (follower) => follower.id === user.id
      );
      setIsVisible(
        selectedUser.isvisible || isFollowing || user.id === selectedUser.id
      );
    }
  }, [selectedUser, user]);

  const handleTabChange = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };

  useEffect(() => {
    const fetchTweets = async () => {
      setTweetLoading(true);
      try {
        let res;
        switch (activeTab) {
          case "Gonderiler":
            res = await Axios({ ...summaryApi.getUserTweet(selectedUser.id) });
            break;
          case "Begenilen":
            res = await Axios({
              ...summaryApi.likedUserTweet(selectedUser.id),
            });
            break;
          case "KaydEdilen":
            res = await Axios({
              ...summaryApi.bookMarkTweetUser(selectedUser.id),
            });
            break;
          default:
            res = await Axios({ ...summaryApi.getUserTweet(selectedUser.id) });
        }

        if (res.data.success) {
          dispatch(setUserTweets(res.data.data));
        }
      } catch (error) {
        axiosError(error);
      } finally {
        setTweetLoading(false);
      }
    };

    if (selectedUser?.id && isVisible) {
      fetchTweets();
    }
  }, [activeTab, selectedUser, isVisible]);

  return (
    <section className="">
      {loading && (
        <div className="flex items-center justify-center my-4">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      )}
      {!loading && selectedUser && (
        <div className=" w-full h-full ">
          {/* head */}
          <div
            className={`w-full flex items-center gap-5 sticky p-2 top-0 ${
              isScrolled ? "backdrop-blur-lg bg-black/40 " : ""
            } transition-all ease-in-out duration-300`}
          >
            <FaArrowLeft
              className="cursor-pointer"
              size={17}
              onClick={() => navigate(-1)}
            />
            <div className=" text-sm">
              <p className="font-bold capitalize">{selectedUser?.username}</p>
              {isVisible && (
                <span className=" text-xs text-[#5F6468]">
                  {selectedUser.tweets?.length || 0} Gonderi
                </span>
              )}
            </div>
          </div>

          {/* user details */}
          <div className=" grid h-full">
            <div className="w-full h-20 sm:h-30 md:h-44 bg-[#333639]"></div>

            <div className=" w-full relative">
              <div className=" w-full flex items-center justify-between p-3">
                <div className="w-20 sm:w-40 h-20 sm:h-40 overflow-hidden rounded-full absolute top-[-40px] sm:top-[-60px] left-5">
                  <img
                    className=" w-full h-full object-cover rounded-full"
                    src={
                      selectedUser?.profil_picture ||
                      "https://plus.unsplash.com/premium_photo-1689568126014-06fea9d5d341?fm=jpg&q=60&w=3000"
                    }
                    alt="userProfileImage"
                  />
                </div>
                {user.id === selectedUser.id && (
                  <button
                    onClick={() => setOpenUpdate((prev) => !prev)}
                    className=" btn bg-black text-white rounded-full border-[#5F6468] block ml-auto shadow-none"
                  >
                    Profili Duzenle
                  </button>
                )}
                {user.id !== selectedUser.id && (
                  <div className="block ml-auto">
                    <FollowButton id={selectedUser.id} />
                  </div>
                )}
              </div>
            </div>
            <div className=" mt-6 sm:mt-12 p-3">
              <p className=" font-bold capitalize">{selectedUser.username}</p>
              <p className=" text-[#5F6468] text-sm">{selectedUser.email}</p>
              <div className=" flex items-center gap-5 mt-4">
                <p className=" text-sm">
                  {selectedUser.following?.length || 0}
                  <span className=" text-[#5F6468] ml-1">Takip edilen</span>
                </p>
                <p className=" text-sm">
                  {selectedUser.followers?.length || 0}
                  <span className="text-[#5F6468] ml-1">Takipci</span>
                </p>
              </div>
            </div>
          </div>

          {/* tweets */}
          {isVisible ? (
            <div className=" grid">
              <div className=" w-full grid grid-cols-3">
                <div
                  className="flex items-center justify-center cursor-pointer hover:bg-[#181818] rounded transition-colors"
                  onClick={() => handleTabChange("Gonderiler")}
                >
                  <p
                    className={`${
                      activeTab === "Gonderiler"
                        ? "border-b-4 border-[#1D9BF0]"
                        : ""
                    } w-fit p-2 font-bold`}
                  >
                    Gonderiler
                  </p>
                </div>
                <div
                  className="flex items-center justify-center cursor-pointer hover:bg-[#181818] rounded transition-colors"
                  onClick={() => handleTabChange("Begenilen")}
                >
                  <p
                    className={`${
                      activeTab === "Begenilen"
                        ? "border-b-4 border-[#1D9BF0]"
                        : ""
                    } w-fit p-2 font-bold`}
                  >
                    Begenilen
                  </p>
                </div>
                <div
                  className="flex items-center justify-center cursor-pointer hover:bg-[#181818] rounded transition-colors"
                  onClick={() => handleTabChange("KaydEdilen")}
                >
                  <p
                    className={`${
                      activeTab === "KaydEdilen"
                        ? "border-b-4 border-[#1D9BF0]"
                        : ""
                    } w-fit p-2 font-bold`}
                  >
                    Mark
                  </p>
                </div>
              </div>
              <div>
                {tweetLoading && (
                  <div className="flex items-center justify-center my-4">
                    <span className="loading loading-spinner loading-lg"></span>
                  </div>
                )}
                {!tweetLoading && userTweets.length > 0 && (
                  <div className="w-full grid gap-5 p-3">
                    {userTweets.map((tweet) => (
                      <Tweet key={tweet.id} data={tweet} options={false} />
                    ))}
                  </div>
                )}
                {!tweetLoading && userTweets.length === 0 && (
                  <div className="flex items-center justify-center my-4">
                    <p>Henüz {activeTab} bulunmamaktadır.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="w-full flex items-center justify-center my-4 border-t border-[#2F3336]">
              <p className=" text-center mt-5 line-clamp-2">
                Bu kullanici gizli bir hesaba sahiptir. Takip isteginizi
                bekliyor.
              </p>
            </div>
          )}
        </div>
      )}
      {openUpdate && <UpdateProfile close={() => setOpenUpdate(false)} />}
    </section>
  );
};

export default Profile;
