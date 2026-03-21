import { NextApiRequest, NextApiResponse } from "next";
import cloudinary from "cloudinary";

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb", // Adjust size limit for large images
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      const { image } = req.body;

      if (!image) {
        return res.status(400).json({ message: "No image provided." });
      }

      // Upload image to Cloudinary
      const uploadResponse = await cloudinary.v2.uploader.upload(image, {
        folder: "my-blog", // Optional folder name in Cloudinary
      });

      res.status(200).json({ url: uploadResponse.secure_url });
    } catch (error) {
      console.error("Image upload failed:", error);
      res.status(500).json({ message: "Image upload failed." });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
