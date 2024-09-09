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
              _id: 1,
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
        Owner: { $arrayElemAt: ["$ownerdetails", 0] },
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
        Owner: 1,
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
const getVideoByID = asyncHandler(async (req, res) => {
  const { videoID } = req.params;
  if (!videoID?.trim()) {
    throw new ApiError(400, "VideoID is missing.");
  }

  const video = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(videoID),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "ownerdetail",
        pipeline: [
          {
            $project: {
              username: 1,
              fullname: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        Owner: { $arrayElemAt: ["$ownerdetail", 0] },
      },
    },
    {
      $project: {
        _id: 1,
        videofile: 1,
        thumbnail: 1,
        title: 1,
        description: 1,
        Owner: 1,
      },
    },
  ]);
  if (!video?.length) {
    throw new ApiError(404, "video does not exist.");
  }
  res
    .status(200)
    .json(new ApiResponce(200, video[0], "Video fetched succesfully."));
});
const updateVideo = asyncHandler(async (req, res) => {
  const { videoID } = req.params;

  const checkVideoID = await Video.findById(videoID);
  if (!checkVideoID) {
    throw new ApiError(400, "Video : Not Found");
  }
  if (!checkVideoID.owner.equals(req.user._id)) {
    throw new ApiError(400, "Video owner is not matched.");
  }

  const { title, description } = req.body;

  let updatedThumbnailLocalPath;
  if (req.file) {
    updatedThumbnailLocalPath = req.file?.path;
  }
  if (!title && !description && !updatedThumbnailLocalPath) {
    throw new ApiError(400, "video : Minimum one field is required.");
  }
  let updatedThumbnail;
  if (updatedThumbnailLocalPath || 0) {
    updatedThumbnail = await uploadOnCloudinary(updatedThumbnailLocalPath);
    if (!updatedThumbnail) {
      throw new ApiError(
        400,
        "video : Error while uploading updated thumbnail."
      );
    } else {
      await deleteOnCloudnary(checkVideoID.thumbnail,"image");
    }
  }

  const updateVideo = await Video.findByIdAndUpdate(
    videoID,
    {
      $set: {
        title,
        description,
        thumbnail: updatedThumbnail?.url || checkVideoID.thumbnail,
      },
    },
    { new: true }
  );
  if (!updateVideo) {
    throw new ApiError(400, "video : Video not updated.");
  }

  res
    .status(200)
    .json(new ApiResponce(200, updateVideo, "Video updated succesfully."));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoID } = req.params;
  const checkVideoID = await Video.findById(videoID);
  if (!checkVideoID) {
    throw new ApiError(400, "Video : Not Found");
  }
  if (!checkVideoID.owner.equals(req.user._id)) {
    throw new ApiError(400, "Video owner is not matched.");
  }
  const deleteResponce = await Video.findByIdAndDelete(videoID);
  await deleteOnCloudnary(deleteResponce.videofile, "video");
  await deleteOnCloudnary(deleteResponce.thumbnail, "image");
  res.status(200).json(new ApiResponce(200, deleteResponce, "Video deleted."));
});

export { publishVideo, getVideoByID, updateVideo, deleteVideo };
