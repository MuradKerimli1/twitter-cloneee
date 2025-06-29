import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer, { StorageEngine } from "multer";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

const storage: StorageEngine = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: "uploads",
      public_id: file.originalname.split(".")[0],
      transformation: [{ width: 500, height: 500, crop: "limit" }],
    };
  },
});


export const parser = multer({ storage: storage });
