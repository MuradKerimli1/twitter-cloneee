import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedConversation: null,
  messages: [],
  userConversations: [],
};

export const conversationSlice = createSlice({
  name: "conversation",
  initialState,
  reducers: {
    setConversationUser: (state, action) => {
      state.selectedConversation = action.payload;
    },
    clearConversationUser: (state, action) => {
      state.selectedConversation = null;
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    clearMessages: (state, action) => {
      state.messages = null;
    },
    updatedMessages: (state, action) => {
      state.messages = action.payload;
    },
    setUserConversations: (state, action) => {
      state.userConversations = action.payload;
    },
    setUserConversations: (state, action) => {
      state.userConversations = action.payload;
    },
  },
});

export const {
  setConversationUser,
  clearConversationUser,
  setMessages,
  clearMessages,
  updatedMessages,
  setUserConversations,
} = conversationSlice.actions;

export default conversationSlice.reducer;
