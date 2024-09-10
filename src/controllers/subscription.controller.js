import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Subcription } from "../models/subscription.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponce } from "../utils/apiResponse.js";

const subscriptiontoogle = asyncHandler(async (req, res) => {
  const { channelID } = req.params;
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
        subscriber:{$push:"$subscribers"}
      },
    },
  ]);

  res
    .status(200)
    .json(new ApiResponce(200, subscriber[0], "Subscriber get succesfully."));
});



export { getUserChannelSubscribers, subscriptiontoogle };
