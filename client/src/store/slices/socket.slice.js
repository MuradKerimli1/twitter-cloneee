import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  socket: null,
};

export const socketSlice = createSlice({
  name: "socket",
  initialState,
  reducers: {
    setSocket: (state, action) => {
      state.socket = action.payload;
    },
    clearSocket: (state) => {
      if (state.socket) {
        state.socket.disconnect();
      }
      state.socket = null;
    },
  },
});

export const { setSocket, clearSocket } = socketSlice.actions;

export const selectSocket = (state) => state.socket.socket;

export default socketSlice.reducer;
