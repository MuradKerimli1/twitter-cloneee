import { useNavigate } from "react-router-dom";

const RightSideUser = ({ data, setUsername }) => {
  const navigate = useNavigate();
  return (
    <div
      className=" flex gap-3  cursor-pointer"
      onClick={(e) => {
        navigate(`/profile/${data.id}`);
        setUsername("");
      }}
    >
      <div className="max-w-10 w-full h-10 rounded-full overflow-hidden">
        <img
          src={
            data.profil_picture ||
            "https://plus.unsplash.com/premium_photo-1689568126014-06fea9d5d341?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cHJvZmlsZXxlbnwwfHwwfHx8MA%3D%3D"
          }
          alt="userProfile"
          className="w-full h-full object-cover object-center"
        />
      </div>
      <div className="flex flex-col  min-w-0 max-w-[170px]">
        <span className="text-sm font-bold whitespace-nowrap">
          {data.username}
        </span>
        <p className="text-[#71767B] text-sm truncate overflow-hidden text-ellipsis whitespace-nowrap">
          {data.email}
        </p>
      </div>
    </div>
  );
};

export default RightSideUser;
