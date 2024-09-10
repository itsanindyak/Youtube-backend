import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createTweet,
  getUserTweets,
  updateTweet,
  deleteTweet,
} from "../controllers/tweet.controller.js";
const router = Router();

router.route("/create").post( verifyJWT,createTweet)

router.route("/update/:id").patch(verifyJWT,updateTweet)

router.route("/:id").get(getUserTweets)

router.route("/delete").delete(verifyJWT,deleteTweet)


export default router;