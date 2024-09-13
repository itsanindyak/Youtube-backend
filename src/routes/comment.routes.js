import { Router } from "express";
import {
  getVideoComments,
  addComment,
  updateComment,
  deleteComment,
} from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/:videoId").post(verifyJWT, addComment).get(getVideoComments)
router.route("/update/:commentID").patch(verifyJWT, updateComment);
router.route("/delete/:commentID").patch(verifyJWT,deleteComment);

export default router;
