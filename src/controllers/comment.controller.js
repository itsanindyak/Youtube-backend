import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponce } from "../utils/apiResponse.js";

const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { comment } = req.body;
  const user = req.user._id;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "url id is not valid");
  }
  if (!comment) {
    throw new ApiError(400, "Comment is required");
  }

  const newComment = await Comment.create({
    content: comment,
    video: videoId,
    owner: user,
  });

  if (!newComment) {
    throw new ApiError(400, "Unable to create comment");
  }

  res.status(200).json(new ApiResponce(200, newComment, "Comment is added"));
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  const { commentID } = req.params;
  const { comment } = req.body;
  if (!isValidObjectId(commentID)) {
    throw new ApiError(400, "Url id is not valid");
  }
  const existingComment = await Comment.findOne({
    _id: commentID,
    owner: req.user._id,
  }).lean();

  if (!existingComment) {
    throw new ApiError(400, "Comment does not exist or unauthorized");
  }
  if (existingComment.content === comment) {
    return res
      .status(200)
      .json(new ApiResponce(200, existingComment, "No changes made"));
  }

  const updatedComment = await Comment.findByIdAndUpdate(
    commentID,
    {
      content: comment,
    },
    { new: true, lean: true }
  );

  if (!updatedComment) {
    throw new ApiError(500, "Unable to update the comment");
  }

  res
    .status(200)
    .json(new ApiResponce(200, updatedComment, "Comment updated succesfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentID } = req.params;

  if (!isValidObjectId(commentID)) {
    throw new ApiError(400, "Invalid comment ID");
  }

  const deletedComment = await Comment.findOneAndDelete({
    _id: commentID,
    owner: req.user._id,
  });

  if (!deletedComment) {
    throw new ApiError(404, "Comment not found or unauthorized");
  }

  res
    .status(200)
    .json(new ApiResponce(200, deletedComment, "Comment deleted successfully"));
});

export {  addComment, updateComment, deleteComment };
