import { useEffect, useState } from "react";
import { axiosError } from "../error/axiosError";
import { Axios } from "../lib/axios";
import { summaryApi } from "../config/summaryApi";
import RightSideUser from "./RightSideUser";

const SearchUser = () => {
  const [username, setUsername] = useState("");
  const [userList, setUserList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (!username) {
      setUserList([]);
      setHasSearched(false);
      return;
    }

    const fetchUser = async () => {
      setLoading(true);
      try {
        const res = await Axios({ ...summaryApi.searchUser(username) });

        if (res.data.success) {
          setUserList(res.data.data);
          setHasSearched(true);
        }
      } catch (error) {
        axiosError(error);
        setUserList([]);
        setHasSearched(true);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchUser();
    }, 500);

    return () => {
      clearTimeout(debounceTimer);
    };
  }, [username]);

  return (
    <div className="relative">
      <div className="bg-transparent">
        <label className="input bg-transparent w-full border-2 border-[#191B1C] rounded-full">
          <svg
            className="h-[1em] opacity-50"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <g
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeWidth="2.5"
              fill="none"
              stroke="currentColor"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.3-4.3"></path>
            </g>
          </svg>
          <input
            type="search"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="grow bg-transparent w-full"
            placeholder="Search"
          />
        </label>
      </div>
      {username.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 max-h-[400px] min-h-[150px] overflow-y-auto border-2 border-[#2E2E2E] shadow-2xl rounded-xl bg-[#191B1C] p-2 text-[#6C7075]">
          {loading && (
            <div className="flex items-center justify-center my-4">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          )}
          {!loading && hasSearched && userList.length === 0 && (
            <div>
              <span className="text-red-600">User not found</span>
            </div>
          )}
          {!loading && userList.length > 0 && (
            <div className="grid gap-4">
              {userList.map((u) => (
                <RightSideUser key={u.id} data={u} setUsername={setUsername} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchUser;
