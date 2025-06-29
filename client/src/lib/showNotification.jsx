import toast from "react-hot-toast";

export const showNotification = (username, message) => {
  toast.success(
    `New Notification from ${
      username.charAt(0).toUpperCase() + username.slice(1)
    }: ${message}`,
    {
      style: {
        border: "1px solid #00B894",
        padding: "16px",
        color: "#FFFFFF",
        backgroundColor: "#2D3436",
        borderRadius: "8px",
        fontSize: "14px",
      },
      iconTheme: {
        primary: "#FFFFFF",
        secondary: "#00B894",
      },
      position: "top-right",
    }
  );
};
