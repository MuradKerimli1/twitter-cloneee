import moment from "moment";

const DEFAULT_PROFILE_IMAGE = "https://plus.unsplash.com/premium_photo-1689568126014-06fea9d5d341?fm=jpg&q=60&w=3000t";

const Comment = ({ comment }) => {
  const timeAgo = moment(comment.created_at).fromNow();
  const formattedTime = moment(comment.created_at).format(
    "h:mm A · MMM D, YYYY"
  );

  return (
    <div className="p-4 hover:bg-gray-900/50 transition-colors duration-200 border-b border-gray-800">
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full overflow-hidden cursor-pointer hover:opacity-90 transition-opacity">
            <img
              src={comment.user.profil_picture || DEFAULT_PROFILE_IMAGE}
              alt={`${comment.user.username}'s profile`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = DEFAULT_PROFILE_IMAGE;
              }}
            />
          </div>
        </div>

        {/* Comment Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-baseline gap-1 flex-wrap">
            <span
              className="font-bold text-white hover:underline cursor-pointer truncate max-w-[180px]"
              title={comment.user.username}
            >
              {comment.user.username}
            </span>
            <span
              className="text-gray-500 text-sm truncate max-w-[180px]"
              title={comment.user.email}
            >
              @{comment.user.email.split("@")[0]}
            </span>
            <span className="text-gray-500">·</span>
            <span
              className="text-gray-500 text-sm hover:underline cursor-pointer"
              title={formattedTime}
            >
              {timeAgo}
            </span>
          </div>

          {/* Comment text */}
          <div className="mt-1 text-white text-[15px] leading-snug whitespace-pre-line">
            {comment.text}
          </div>

          {/* Actions */}
        </div>
      </div>
    </div>
  );
};

export default Comment;
