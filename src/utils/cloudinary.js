import { v2 as cloudinary } from "cloudinary";
import { Console, error, log } from "console";
import fs from "fs";
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    //console.log("File is uploaded.", response.url);
    fs.unlinkSync(localFilePath); //remove the save temp file after upload

    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); //remove the save temp file as the upload operation got failed
    return null;
  }
};
const deleteOnCloudnary = async (cloudinaryFilePath) => {
  try {
    if (!cloudinaryFilePath) return null;
    const parts = cloudinaryFilePath.split("/");
    const fileName = parts.pop();
    const publicId = fileName?.split(".")[0];
    const response = await cloudinary.uploader.destroy([publicId], {
      type:"upload",resource_type: "image",
    },(error,result)=>{console.log(result,"\nError: ",error)});

    return response;
  } catch (error) {
    return null;
  }
};

export { uploadOnCloudinary, deleteOnCloudnary };
