import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponce } from "../utils/apiResponse.js";
import { Video } from "../models/video.model.js";
import { uploadOnCloudinary, deleteOnCloudnary } from "../utils/cloudinary.js";
import mongoose from "mongoose";

const publishVideo = asyncHandler(async (req, res) => {
  const { title, description, isPublished } = req.body;
  if (!title) {
    throw new ApiError(400, "Title in required.");
  }
  if (!description) {
    throw new ApiError(400, "description in required.");
  }
  const videofileLocalPath = req.files?.video[0]?.path;
  if (!videofileLocalPath) {
    throw new ApiError(400, "Video file not found.");
  }
  const videofile = await uploadOnCloudinary(videofileLocalPath);

  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
  if (!thumbnailLocalPath) {
    throw new ApiError(400, "Thumbnail not found");
  }
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  
  const uploadvideo = await Video.create({
    videofile: videofile?.url,
    thumbnail: thumbnail?.url,
    title,
    description,
    duration: videofile.duration,
    views: 0,
    isPublished,
    owner: req.user._id,
  });
  const video = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(uploadvideo._id),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id", //users
        as: "ownerdetails",
        pipeline: [
          {
            $project: {
               _id:1,
              fullname: 1,
              username: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        owner: { $arrayElemAt: ["$ownerdetails", 0] }
      },
    },
    {
      $project: {
        videofile: 1,
        thumbnail: 1,
        title: 1,
        description: 1,
        duration: 1,
        isPublished: 1,
        views: 1,
        createdAt: 1,
        owner:1
      },
    },
  ]);

  if (!video?.length) {
    throw new ApiError(404);
  }
  res
    .status(200)
    .json(new ApiResponce(200, video[0], "Video uploaded succesfully"));
});

export { publishVideo };
