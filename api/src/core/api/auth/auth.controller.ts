import { NextFunction, Request, Response } from "express";
import { UserDto } from "./auth.dto";
import { validate } from "class-validator";
import { appError } from "../../error/appError";
import { formatErrors } from "../../error/dtoError";
import { User } from "../../../dal/entity/user.entity";
import bcrypt from "bcrypt";

import { transporter } from "../../services/nodemailer";
import jwt from "jsonwebtoken";

const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, username, gender } = req.body;
    // validation
    const usreDto = new UserDto();
    usreDto.email = email;
    usreDto.username = username;
    usreDto.password = password;
    usreDto.gender = gender;

    const errors = await validate(usreDto);

    if (errors.length > 0) {
      return next(new appError(formatErrors(errors), 400));
    }

    const existEmail = await User.createQueryBuilder("user")
      .where("user.email = :email", { email: email })
      .getOne();

    if (existEmail) {
      return next(new appError("email already exist", 400));
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // save user

    const newUser = new User();
    newUser.email = email;
    newUser.password = hashedPassword;
    newUser.username = username;
    newUser.gender = gender;

    await newUser.save();

    console.log(newUser.email);

    const mailOptions = {
      from: process.env.NODEMAILER_NAME,
      to: newUser.email,
      subject: "TWITTER",
      text: `QEYDIYATDAN KECDINIZ ARTIQ BIZDENSINIZ`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email: ", error);
      } else {
        console.log("Mail sent successfully");
      }
    });

    res
      .status(201)
      .json({ success: true, message: "User created Successfuly" });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    // validation
    if (!email || !password) {
      return next(new appError("Invalid parameters", 400));
    }

    const existUser = await User.findOne({ where: { email: email } });
    if (!existUser) {
      return next(new appError("Email doesn't exist", 404));
    }

    if (existUser.isBlocked) {
      return next(
        new appError(
          "Your account is blocked. Please reset your password or contact support.",
          403
        )
      );
    }

    const comparePass = await bcrypt.compare(password, existUser.password);
    if (!comparePass) {
      return next(new appError("email or password are invalid", 400));
    }

    //token
    const payload = {
      sub: existUser.id,
    };
    const accessToken = jwt.sign(payload, process.env.ACCESS_SECRET_KEY!, {
      expiresIn: "15m",
    });
    const refreshToken = jwt.sign(payload, process.env.REFRESH_SECRET_KEY!, {
      expiresIn: "7d",
    });

    existUser.refresh_token = refreshToken;
    await existUser.save();

    res
      .status(200)
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
      })
      .json({
        success: true,
        token: accessToken,
        message: "Login successful",
        user: existUser,
      });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const refreshTokenController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refresh_token = req.cookies?.refreshToken;
    if (!refresh_token) {
      return next(new appError("Refresh token is missing or invalid", 401));
    }

    const verifyRefreshToken = jwt.verify(
      refresh_token,
      process.env.REFRESH_SECRET_KEY!
    );

    if (!verifyRefreshToken) {
      return next(new appError("refresh token invalid", 401));
    }

    const payload = {
      sub: verifyRefreshToken.sub,
    };

    const accessToken = jwt.sign(payload, process.env.ACCESS_SECRET_KEY!, {
      expiresIn: "1h",
    });

    res.status(200).json({
      success: true,
      message: "New access token generated",
      token: accessToken,
    });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(new appError("JWT expired", 401));
    }
    next(error);
  }
};

const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;
    if (!email) {
      return next(new appError("Email is required", 400));
    }

    const existUser = await User.findOne({ where: { email: email } });
    if (!existUser) {
      return next(new appError("Email not found", 400));
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000);
    const expireTimeOtp = new Date(Date.now() + 60 * 60 * 1000); // 1 saat

    await User.update(
      { id: existUser.id },
      {
        forgot_password_code: otpCode,
        forgot_password_expiredAt: expireTimeOtp,
      }
    );

    // send email
    const mailOptions = {
      from: process.env.NODEMAILER_NAME,
      to: existUser.email,
      subject: "Twitter",
      text: `Your reset password code is ${otpCode}. It will expire on ${expireTimeOtp}.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email: ", error);
      } else {
        console.log("Mail sent successfully");
      }
    });

    res.status(200).json({ message: "Your OTP has been sent", success: true });
  } catch (error) {
    next();
  }
};

const verifyForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return next(new appError("email and otp are required", 400));
    }

    const user = await User.findOne({ where: { email: email } });
    if (!user) {
      return next(new appError("email not found", 404));
    }

    if (user.isBlocked) {
      return next(
        new appError("Account is blocked due to too many failed attempts", 403)
      );
    }

    const currentTime = new Date();
    if (user.forgot_password_expiredAt < currentTime) {
      return next(new appError("otp is expired", 400));
    }

    if (user.forgot_password_code !== +otp) {
      user.attemptCount += 1;

      if (user.attemptCount >= 3) {
        user.isBlocked = true;
      }

      await user.save();

      if (user.isBlocked) {
        return next(
          new appError("Too many failed attempts. Account is blocked.", 403)
        );
      }

      return next(new appError("otp is invalid", 400));
    }

    await User.update(
      { id: user.id },
      {
        forgot_password_expiredAt: "",
        forgot_password_code: 0,
        attemptCount: 0,
        isBlocked: false,
      }
    );

    res.status(200).json({ message: "verify otp successfully", success: true });
  } catch (error) {
    console.error("Error during verifyForgotPassword:", error);
    next(error);
  }
};

const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    if (!email || !newPassword || !confirmPassword) {
      return next(
        new appError("Email, newPassword və confirmPassword tələb olunur", 400)
      );
    }

    if (newPassword !== confirmPassword) {
      return next(
        new appError("newPassword və confirmPassword eyni olmalıdır", 400)
      );
    }

    if (newPassword.length < 6) {
      return next(new appError("Şifrə ən azı 6 simvol olmalıdır", 400));
    }

    const user = await User.findOne({ where: { email: email } });

    if (!user) {
      return next(new appError("İstifadəçi tapılmadı", 404));
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.update({ id: user.id }, { password: hashedPassword });

    res
      .status(200)
      .json({ message: "Şifrə uğurla dəyişdirildi", success: true });
  } catch (error) {
    console.error("Error during password reset:", error);
    next();
  }
};

const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user;

    await User.update({ id: user.id }, { refresh_token: "" });

    res
      .status(200)
      .cookie("refreshToken", "", {
        httpOnly: true,
        secure: true,
        maxAge: 0,
      })
      .json({
        success: true,
        message: "Logout successful",
      });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const authController = () => {
  return {
    register,
    login,
    refreshTokenController,
    logout,
    forgotPassword,
    verifyForgotPassword,
    resetPassword,
  };
};
