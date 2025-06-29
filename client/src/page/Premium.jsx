import { useSelector } from "react-redux";
import { FaUsers, FaCrown } from "react-icons/fa";
import { Link } from "react-router-dom";

const Premium = () => {
  const { user } = useSelector((state) => state.auth);
  const premiumExpiryDate = new Date(user.premiumExpiredAt);
  return (
    <div className="p-4 h-screen  text-white">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="border-b pb-4 border-[#2F3336] flex items-center gap-3">
          <FaCrown className="text-yellow-400" size={24} />
          <h1 className="text-2xl font-bold">Premium Features</h1>
        </div>

        {/* Options */}
        <div className="mt-6 space-y-4">
          <Link
            to={"/premium/visitors"}
            className="flex items-center gap-4 bg-[#1F2124] p-4 rounded-lg cursor-pointer hover:bg-[#26292D] transition-colors"
          >
            <div className="bg-[#2F3336] p-3 rounded-full">
              <FaUsers size={20} className="text-blue-400" />
            </div>
            <div>
              <h3 className="font-bold">Profile Visitors</h3>
              <p className="text-sm text-gray-400 mt-1">
                See users who viewed your profile in the last month
              </p>
            </div>
          </Link>
        </div>

        {/* status */}
        <div className="mt-8 p-4 bg-[#1F2124] rounded-lg">
          <p className="text-gray-400 font-bold">Premium Status:</p>
          <p className="font-bold text-yellow-400 mt-1">
            Active until {premiumExpiryDate.toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Premium;
