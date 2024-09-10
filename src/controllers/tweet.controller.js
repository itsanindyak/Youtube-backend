import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Tweet } from "../models/tweet.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponce } from "../utils/apiResponse.js";
import { json } from "express";

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;
  if (content === "") {
    throw new ApiError(400, "Content is required.");
  }

  const tweet = await Tweet.create({
    content,
    owner: req.user._id,
  });

  if (!tweet) {
    throw new ApiError(400, "Error occured to create tweet.");
  }
  res
    .status(200)
    .json(new ApiResponce(200, tweet, "Tweet created succesfully."));
});

const getUserTweets = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Worng id in url.");
  }
  const tweetList = await Tweet.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(id),
      },
    },
    
  ]);

  res
    .status(200)
    .json(
      new ApiResponce(200, tweetList, "All tweet fetched successfully.")
    );
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
