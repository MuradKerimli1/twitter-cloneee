import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  notfications: [],
  loading: false,
};

export const notficationSlice = createSlice({
  name: "notfication",
  initialState,
  reducers: {
    startNotficationLoading: (state, action) => {
      state.loading = true;
    },
    setNotfication: (state, action) => {
      state.notfications = action.payload;
    },
    cancelNotficationLoading: (state, action) => {
      state.loading = false;
    },
  },
});

export const {
  startNotficationLoading,
  setNotfication,
  cancelNotficationLoading,
} = notficationSlice.actions;

export default notficationSlice.reducer;
