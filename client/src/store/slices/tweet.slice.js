import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  tweets: [],
  selectedTweet: null,
  userTweets: [],
};

export const tweetSlice = createSlice({
  name: "tweet",
  initialState,
  reducers: {
    setTweet: (state, action) => {
      state.tweets = action.payload;
    },
    setUserTweets: (state, action) => {
      state.userTweets = action.payload;
    },

    updateUserTweets: (state, action) => {
      state.userTweets = state.userTweets.map((tweet) =>
        tweet.id === action.payload.id ? { ...tweet, ...action.payload } : tweet
      );
    },
    nullTweet: (state) => {
      state.tweets = [];
    },
    setSelectedTweet: (state, action) => {
      state.selectedTweet = action.payload;
    },
    updateSelectedTweet: (state, action) => {
      if (state.selectedTweet) {
        state.selectedTweet = { ...state.selectedTweet, ...action.payload };
      }
    },
    resetSelectedTweet: (state) => {
      state.selectedTweet = null;
    },
  },
});

export const {
  setTweet,
  setUserTweets,
  updateUserTweets,
  nullTweet,
  setSelectedTweet,
  updateSelectedTweet,
  resetSelectedTweet,
} = tweetSlice.actions;

export default tweetSlice.reducer;
