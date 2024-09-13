import { Router } from "express";
import {
  
  addComment,
  updateComment,
  deleteComment,
} from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/add/:videoId").post(verifyJWT, addComment);
router.route("/update/:commentID").patch(verifyJWT, updateComment);
router.route("/delete/:commentID").patch(verifyJWT,deleteComment);

export default router;
