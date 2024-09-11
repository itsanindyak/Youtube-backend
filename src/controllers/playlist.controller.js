import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponce } from "../utils/apiResponse.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  const createdPlaylist = await Playlist.create({
    name,
    description,
    videos: [],
    owner: req.user._id,
  });
  if (!createdPlaylist) {
    throw new ApiError(500, "Error to create playlist");
  }

  res
    .status(200)
    .json(
      new ApiResponce(200, createdPlaylist, "Playlist created succesfully.")
    );
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!isValidObjectId(playlistId || !isValidObjectId(videoId))) {
    throw new ApiError(400, "Url id is not valid");
  }

  const playlist = await Playlist.findById(playlistId);
  if (!playlist.owner.equals(req.user._id)) {
    throw new ApiError(400, "Unauthorized request.");
  }
  if (!playlist.videos.includes(videoId)) {
    playlist.videos.push(videoId);
  } else {
    throw new ApiError(400, "Video already exists in the playlist.");
  }

  await playlist.save({ validateBeforeSave: false });

  res.status(200).json(new ApiResponce(200, playlist, "Video add succesfully"));
});

// checking
const getUserPlaylists = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Url id not valid.");
  }

  const playlists = await Playlist.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videos",
      },
    },
  ]);
  if (!playlists) {
    throw new ApiError(500, "Unable to fetched playlists,");
  }

  res
    .status(200)
    .json(new ApiResponce(200, playlists, "Playlist fetched successfully."));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistID } = req.params;
  if (!isValidObjectId(playlistID)) {
    throw new ApiError(400, "Url id not valid");
  }
  const existPlaylist = await Playlist.findById(playlistID);
  if (!existPlaylist) {
    throw new ApiError(400, "Playlist not exsit.");
  }

  const playlists = await Playlist.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(existPlaylist._id),
      },
    },
    {
      $unwind: "$videos",
    },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videodetails",
      },
    },
    {
      $unwind: "$videodetails",
    },
    {
      $group: {
        _id: "$_id",
        name: { $first: "$name" },
        description: { $first: "$description" },
        owner: { $first: "$owner" },
        createdAt: { $first: "$createdAt" },
        updatedAt: { $first: "$updatedAt" },
        videos: { $push: "$videodetails" }, // Rebuild the videos array with detailed video objects
      },
    },
  ]);
  if (!playlists || playlists.length === 0) {
    throw new ApiError(400, "Playlist not found");
  }

  res
    .status(200)
    .json(new ApiResponce(200, playlists[0], "Playlist fetched succesfully"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!isValidObjectId(playlistId || !isValidObjectId(videoId))) {
    throw new ApiError(400, "Url id is not valid");
  }

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(400, "Playlist not exist");
  }
  if (!playlist.owner.equals(req.user._id)) {
    throw new ApiError(400, "Unauthorized request.");
  }
  if (playlist.videos.includes(videoId)) {
    playlist.videos.push(videoId);
  } else {
    throw new ApiError(400, "Video not exists in the playlist.");
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $pull: { videos: videoId },
    },
    { new: true }
  );

  res
    .status(200)
    .json(
      new ApiResponce(
        200,
        updatedPlaylist,
        "Video delete from playlist successfully"
      )
    );
});

export {
  createPlaylist,
  getUserPlaylists,
  addVideoToPlaylist,
  getPlaylistById,
  removeVideoFromPlaylist,
};
