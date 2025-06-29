export const summaryApi = {
  register: {
    url: "/auth/register",
    method: "post",
  },
  login: {
    url: "/auth/login",
    method: "post",
  },
  forgot_password: {
    url: "/auth/forgotPassword",
    method: "post",
  },
  verify_forgot_password: {
    url: "/auth/otpVerify",
    method: "post",
  },
  reset_password: {
    url: "/auth/resetPassword",
    method: "post",
  },
  logout: {
    url: "/auth/logout",
    method: "get",
  },
  setAccessToken: {
    url: "/auth/setAccessToken",
    method: "get",
  },
  fetchAllTweet: {
    url: "/tweet/all",
    method: "post",
  },
  followingTweet: {
    url: "/tweet/following/userTweets",
    method: "post",
  },
  notfications: {
    url: "/notfication/user",
    method: "get",
  },
  deleteNotificationById: (id) => ({
    url: `/notfication/delete/${id}`,
    method: "delete",
  }),
  deleteAllnotfications: {
    url: "/notfication",
    method: "delete",
  },
  likeTweet: (id) => ({
    url: `/tweet/like/${id}`,
    method: "get",
  }),
  bookMarkTweet: (id) => ({
    url: `/tweet/bookmark/${id}`,
    method: "get",
  }),

  commentTweet: (id) => ({
    url: `/tweet/comment/${id}`,
    method: "post",
  }),
  getTweetById: (id) => ({
    url: `/tweet/${id}`,
    method: "get",
  }),
  getUserById: (id) => ({
    url: `/user/profile/${id}`,
    method: "get",
  }),
  getUserTweet: (id) => ({
    url: `/tweet/user/${id}`,
    method: "get",
  }),
  likedUserTweet: (id) => ({
    url: `/tweet/liked/userTweets/${id}`,
    method: "get",
  }),
  bookMarkTweetUser: (id) => ({
    url: `/tweet/bookmarks/userTweets/${id}`,
    method: "get",
  }),
  updateUser: {
    url: "/user/update",
    method: "put",
  },
  searchUser: (username) => ({
    url: `/user/search/${username}`,
    method: "get",
  }),
  suggesstionUsers: {
    url: "/user/suggestions",
    method: "post",
  },
  createTweet: {
    url: "/tweet/create",
    method: "post",
  },
  deleteTweet: (id) => ({
    url: `/tweet/${id}`,
    method: "delete",
  }),
  followUser: (id) => ({
    url: `/user/follow/${id}`,
    method: "get",
  }),
  conversationMessages: (id) => ({
    url: `/message/getMessages/${id}`,
    method: "get",
  }),
  sendMessage: (id) => ({
    url: `/message/send/${id}`,
    method: "post",
  }),
  userConversations: {
    url: `/message/userConversations`,
    method: "get",
  },
  fetchVisitors: {
    url: "/premium/viewers",
    method: "get",
  },
  fetchPackages: {
    url: "/premium/packages",
    method: "get",
  },
  deletePackage: (id) => ({
    url: `/premium/package/delete/${id}`,
    method: "delete",
  }),
  createPackage: {
    url: "/premium/create",
    method: "post",
  },
  setUpdatePackage: (id) => ({
    url: `/premium/package/update/${id}`,
    method: "put",
  }),
  buyPackage: {
    url: `/premium/buy`,
    method: "post",
  },
  buyPremiumPacket: {
    url: `/premium/buy`,
    method: "post",
  },
  packetOrder: {
    url: `/premium/create-order`,
    method: "post",
  },
};
