import { useSelector } from "react-redux";
import { Outlet } from "react-router-dom";
import PremiumPackage from "../component/PremiumPackage";

const PremiumLayout = () => {
  const { user } = useSelector((state) => state.auth);
  if (!user) return null;

  const premiumExpiryDate = new Date(user.premiumExpiredAt);
  const currentDate = new Date();
  const isPremiumActive = user.isPremium && premiumExpiryDate > currentDate;
  return (
    <div className="p-4 h-screen  text-white">
      {isPremiumActive ? <Outlet /> : <PremiumPackage />}
    </div>
  );
};

export default PremiumLayout;
