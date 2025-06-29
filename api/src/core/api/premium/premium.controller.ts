import * as dotenv from "dotenv";
import { NextFunction, Request, Response } from "express";
import { appError } from "../../error/appError";
import { User } from "../../../dal/entity/user.entity";
import { PremiumPackage } from "../../../dal/entity/premiumPackage.entity";
import { Currency } from "../../../dal/enums/currencyEnum";
import { PaymentStatus } from "../../../dal/enums/paymentEnum";
import { UserPremiumHistory } from "../../../dal/entity/UserPremiumHistory.entity";
import Stripe from "stripe";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY! as string);

const profileViewers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return next(new appError("User not found", 404));
    }

    const user = await User.createQueryBuilder("user")
      .leftJoinAndSelect("user.viewers", "viewers")
      .where("user.id = :userId", { userId })
      .getOne();

    if (!user) {
      return next(new appError("User not found", 404));
    }

    res.status(200).json({ success: true, viewers: user.viewers || [] });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const confirmPremiumPackage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { session_id } = req.body;

    if (!session_id) {
      return next(new appError("Session ID is required", 400));
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      return next(new appError("Payment not successful", 400));
    }

    if (!session.metadata) {
      return next(new appError("Session metadata is missing", 400));
    }

    const { userId, packageId } = session.metadata;

    if (!userId || !packageId) {
      return next(
        new appError("User ID or Package ID is missing in metadata", 400)
      );
    }

    const [user, pkg] = await Promise.all([
      User.findOne({ where: { id: +userId } }),
      PremiumPackage.findOne({ where: { id: +packageId } }),
    ]);

    if (!user) {
      return next(new appError("User not found", 404));
    }

    if (!pkg) {
      return next(new appError("Premium package not found", 404));
    }

    if (user.isPremium && user.premiumExpiredAt > new Date()) {
      return next(new appError("User is already premium", 400));
    }

    const now = new Date();
    const expiredAt = new Date();
    expiredAt.setDate(now.getDate() + pkg.durationInDays);

    user.isPremium = true;
    user.premiumExpiredAt = expiredAt;
    await user.save();

    const history = await UserPremiumHistory.create({
      user,
      package: pkg,
      startedAt: now,
      expiredAt,
      paymentStatus: PaymentStatus.COMPLETED,
      currency: pkg.currency,
      stripeSessionId: session_id,
    }).save();

    if (!history) {
      return next(new appError("Failed to create premium history", 500));
    }

    res.status(200).json({
      success: true,
      message: "Premium package activated successfully",
      premiumExpiresAt: expiredAt,
      userId: user.id,
      packageId: pkg.id,
    });
  } catch (error) {
    next(new appError("Failed to complete premium activation", 500));
  }
};

export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const { packageId } = req.body;

    if (!userId) {
      return next(new appError("User authentication required", 401));
    }

    if (!packageId || isNaN(packageId)) {
      return next(new appError("Valid package ID is required", 400));
    }

    const pkg = await PremiumPackage.findOne({ where: { id: packageId } });
    if (!pkg) {
      return next(new appError("Premium package not found", 404));
    }

    if (pkg.price <= 0) {
      return next(new appError("Package price must be greater than zero", 400));
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: pkg.currency.toLowerCase(),
            product_data: {
              name: pkg.name,
              ...(pkg.description ? { description: pkg.description } : {}),
            },
            unit_amount: pkg.price * 100,
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: userId.toString(),
        packageId: pkg.id.toString(),
      },
      success_url: `${process.env.FRONT_END_URL}/checkout/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONT_END_URL}/checkout/cancel`,
    });

    res.status(201).json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("Stripe order create error:", error);
    next(new appError("Failed to create Stripe order", 500));
  }
};

const getPremiumPackages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const packages = await PremiumPackage.find({
      order: { createdAt: "ASC" },
    });
    if (!packages) {
      return next(new appError("No packages found", 404));
    }
    res.status(200).json({ success: true, packages });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const createPremiumPackage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, durationInDays, price, description, currency, features } =
      req.body;

    if (!name || !durationInDays || !price || !currency || !features) {
      return next(new appError("Please provide all required fields", 400));
    }
    if (currency && !Object.values(Currency).includes(currency.toUpperCase())) {
      return next(new appError("Invalid currency", 400));
    }

    if (durationInDays <= 0) {
      return next(new appError("Duration must be greater than 0", 400));
    }
    if (price <= 0) {
      return next(new appError("Price must be greater than 0", 400));
    }
    if (description && description.length > 500) {
      return next(new appError("Description is too long", 400));
    }

    const packageExists = await PremiumPackage.findOne({ where: { name } });
    if (packageExists) {
      return next(new appError("Package already exists", 400));
    }
    const newPackage = await PremiumPackage.create({
      name,
      durationInDays,
      price,
      description,
      features,
      currency: currency.toUpperCase(),
    }).save();

    if (!newPackage) {
      return next(new appError("Failed to create package", 500));
    }

    res.status(201).json({
      success: true,
      message: "Package created successfully",
      package: newPackage,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const deletePremiumPackage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const packageId = Number(req.params.id);
    if (!packageId) {
      return next(new appError("Package ID is required", 400));
    }
    const packageToDelete = await PremiumPackage.findOne({
      where: { id: packageId },
    });
    if (!packageToDelete) {
      return next(new appError("Package not found", 404));
    }
    await PremiumPackage.delete({ id: packageId });
    res.status(200).json({
      success: true,
      message: "Package deleted successfully",
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const updatePremiumPackage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const packageId = Number(req.params.id);
    if (!packageId) {
      return next(new appError("Package ID is required", 400));
    }
    const packageToUpdate = await PremiumPackage.findOne({
      where: { id: packageId },
    });
    if (!packageToUpdate) {
      return next(new appError("Package not found", 404));
    }
    const { name, durationInDays, price, description, currency, features } =
      req.body;
    if (name) packageToUpdate.name = name;
    if (durationInDays) packageToUpdate.durationInDays = durationInDays;
    if (price) packageToUpdate.price = price;
    if (description) packageToUpdate.description = description;
    if (currency) packageToUpdate.currency = currency.toUpperCase();
    if (features) packageToUpdate.features = features;

    await packageToUpdate.save();
    res.status(200).json({
      success: true,
      message: "Package updated successfully",
      package: packageToUpdate,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const premiumController = () => {
  return {
    profileViewers,
    confirmPremiumPackage,
    getPremiumPackages,
    createPremiumPackage,
    deletePremiumPackage,
    updatePremiumPackage,
    createOrder,
  };
};
