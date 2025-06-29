import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import SideBar from "../component/SideBar";
import RightSideBar from "../component/RightSideBar";

const PrivateLayout = () => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const messagesPage = location.pathname.split("/")[1] === "messages";

  if (!user) {
    return <Navigate to="/auth/login" />;
  }

  return (
    <div className="bg-black text-white min-h-screen flex overflow-hidden">
      <SideBar />
      <div className="ml-15 sm:ml-45 min-h-screen flex w-full">
        <div
          className={`w-full border border-[#2F3336] ${
            messagesPage ? "max-w-5xl" : "min-w-[300px] sm:max-w-2xl"
          }`}
        >
          <Outlet />
        </div>

        {!messagesPage && (
          <div className="hidden show-1100">
            <RightSideBar />
          </div>
        )}
      </div>
    </div>
  );
};

export default PrivateLayout;
