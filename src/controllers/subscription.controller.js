import mongoose, { isValidObjectId } from "mongoose";
import { Subcription } from "../models/subscription.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponce } from "../utils/apiResponse.js";

const subscriptiontoogle = asyncHandler(async (req, res) => {
  const { channelID } = req.params;
  if (!isValidObjectId(channelID)) {
    throw new ApiError(400, "Check params id.");
  }
  const existingSubscription = await Subcription.findOneAndDelete({
    subscriber: req.user._id,
    channel: channelID,
  });
  if (existingSubscription) {
    res
      .status(200)
      .json(
        new ApiResponce(200, existingSubscription, "Unsubscribed Successfully.")
      );
  } else {
    const newSubscription = await Subcription.create({
      subscriber: req.user._id,
      channel: channelID,
    });
    if (newSubscription) {
      res
        .status(200)
        .json(
          new ApiResponce(200, newSubscription, "Subscribed Successfully.")
        );
    }
  }
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(channelID)) {
    throw new ApiError(400, "Check params id.");
  }
  const subscriber = await Subcription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(id),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscribers",
        pipeline: [
          {
            $project: {
              fullname: 1,
              username: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: "$subscribers",
    },
    {
      $group: {
        _id: "$channel",
        subscriber: { $push: "$subscribers" },
      },
    },
  ]);

  res
    .status(200)
    .json(new ApiResponce(200, subscriber[0], "Subscriber get succesfully."));
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(channelID)) {
    throw new ApiError(400, "Check params id.");
  }
  const channelList = await Subcription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(id),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "channels",
        pipeline: [
          {
            $project: {
              fullname: 1,
              username: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: "$channels",
    },
    {
      $group: {
        _id: "$subscriber",
        channel: { $push: "$channels" },
      },
    },
  ]);

  if (!channelList) {
    throw new ApiError(400, "Subscribed chaanel fetched failed.");
  }

  res
    .status(200)
    .json(new ApiResponce(200, channelList[0], "Channel fetched succesfully."));
});

export { getUserChannelSubscribers, subscriptiontoogle, getSubscribedChannels };
