import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Login from "../page/Login";
import Register from "../page/Register";
import Home from "../page/Home";
import ForgotPassword from "../page/ForgotPassword";
import VerifyForgotPassword from "../page/VerifyForgotPassword";
import ResetPassword from "../page/ResetPassword";
import PrivateLayout from "../layout/PrivateLayout";
import AuthLayout from "../layout/AuthLayout";
import Notfication from "../page/Notfication";
import SelectedTweet from "../component/SelectedTweet";
import Profile from "../page/Profile";
import SuggestedUsers from "../page/SuggestedUsers";
import Messages from "../page/Messages";
import Premium from "../page/Premium";
import PremiumLayout from "../layout/PremiumLayout";
import Visitors from "../page/Visitors";
import CheckoutCancel from "../page/CheckoutCancel";
import CheckoutSuccess from "../page/CheckoutSuccess";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "",
        element: <PrivateLayout />,
        children: [
          {
            path: "",
            element: <Home />,
          },
          {
            path: "notfication",
            element: <Notfication />,
          },
          {
            path: "tweet/:id",
            element: <SelectedTweet />,
          },
          {
            path: "profile/:id",
            element: <Profile />,
          },
          {
            path: "suggestedUsers",
            element: <SuggestedUsers />,
          },
          {
            path: "messages",
            element: <Messages />,
          },
          {
            path: "premium",
            element: <PremiumLayout />,
            children: [
              {
                path: "",
                element: <Premium />,
              },
              {
                path: "visitors",
                element: <Visitors />,
              },
            ],
          },
          {
            path: "checkout/checkout-success",
            element: <CheckoutSuccess />,
          },
          {
            path: "checkout/cancel",
            element: <CheckoutCancel />,
          },
        ],
      },
      {
        path: "/auth",
        element: <AuthLayout />,
        children: [
          {
            path: "login",
            element: <Login />,
          },
          {
            path: "register",
            element: <Register />,
          },
          {
            path: "forgot-password",
            element: <ForgotPassword />,
          },
          {
            path: "verify-password",
            element: <VerifyForgotPassword />,
          },
          {
            path: "reset-password",
            element: <ResetPassword />,
          },
        ],
      },
    ],
  },
]);
