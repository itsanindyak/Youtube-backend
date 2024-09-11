import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponce } from "../utils/apiResponse.js";

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
    .json(new ApiResponce(200, tweetList, "All tweet fetched successfully."));
});

const updateTweet = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  const exsitingTweet = await Tweet.findById(id);
  if (!exsitingTweet) {
    throw new ApiError(400, "Tweet not exsit");
  }
  if (!exsitingTweet.owner.equals(req.user._id)) {
    throw new ApiError(400, "Unauthorized request.");
  }
  const updatedTweet = await Tweet.findByIdAndUpdate(
    id,
    {
      content,
    },
    {
      new: true,
    }
  );

  res
    .status(200)
    .json(new ApiResponce(200, updatedTweet, "Tweet updated secessfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
  const { id } = req.params;
  const exsitingTweet = await Tweet.findById(id);
  if (!exsitingTweet) {
    throw new ApiError(400, "Tweet not exsit");
  }
  if (!exsitingTweet.owner.equals(req.user._id)) {
    throw new ApiError(400, "Unauthorized request.");
  }

  const deleteResponce = await Tweet.findByIdAndDelete(id);

  if (!deleteResponce) {
    throw new ApiError(500, "Unable to delete the tweet.");
  }

  res
    .status(200)
    .json(new ApiResponce(200, deleteResponce, "Tweet delete succesfully."));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
