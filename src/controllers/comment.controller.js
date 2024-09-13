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
const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 3 } = req.query;

  // Validate that the videoId is valid
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
      throw new ApiError(400, "Invalid video ID");
  }

  // Calculate the skip value for pagination
  const skip = (page - 1) * limit;

  // Get total number of comments for this video
  const totalComments = await Comment.countDocuments( videoId );

  // Fetch the comments with pagination
  const comments = await Comment.find( {video:videoId} )
      .sort({ createdAt: -1 }) // Sort by newest first
      .skip(skip)
      .limit(parseInt(limit));

  // Return the response with pagination information
  res.status(200).json(new ApiResponce(200, {
      comments,
      pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalComments / limit),
          totalComments,
      },
  }, "Comments retrieved successfully"));
});


export {  addComment, updateComment, deleteComment,getVideoComments };
