import axios from "axios";

export const generatePaypalToken = async () => {
  try {
    const res = await axios({
      url: process.env.PAYPAL_URL + "/v1/oauth2/token",
      method: "post",
      data: "grant_type=client_credentials",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      auth: {
        username: process.env.PAYPAL_ID || "",
        password: process.env.PAYPAL_SECRET || "",
      },
    });

    return res.data.access_token;
  } catch (err) {
    console.error("PayPal token alınarkən xəta baş verdi:", err);
  }
};
