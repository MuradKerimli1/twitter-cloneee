import SearchUser from "./SearchUser";
import SuggesstedUsers from "./SuggesstedUsers";

const RightSideBar = () => {
  return (
    <div className="sticky top-0 right-0 ml-5 w-fit min-w-sm p-3 grid gap-4">
      <div className="relative z-10">
        <SearchUser />
      </div>
      <SuggesstedUsers />
    </div>
  );
};

export default RightSideBar;
