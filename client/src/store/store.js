import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer from "./slices/auth.slice";
import tweetReducer from "./slices/tweet.slice";
import socketReducer from "./slices/socket.slice";
import notficationReducer from "./slices/notfication.slice";
import conversationReducer from "./slices/conversation.js";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"],
  blacklist: ["socket"],
};

const rootReducer = combineReducers({
  auth: authReducer,
  tweet: tweetReducer,
  socket: socketReducer,
  notfication: notficationReducer,
  conversation: conversationReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
