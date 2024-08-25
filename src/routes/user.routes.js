import { Router } from "express";
import {
  registerUser,
  loginUser,
  logOutUser,
  refershAccessToken,
  resetPassword,
  getCurrentUser,
  updateAccoutDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getChannelProfile,
  watchHistory,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import multer from "multer";

const router = Router();

router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    {
      name: "coverimage",
      maxCount: 1,
    },
  ]),
  registerUser
);
router.route("/login").post(loginUser);

// secured route
router.route("/logout").post(verifyJWT, logOutUser);
router.route("/refreshToken").post(verifyJWT, refershAccessToken);
router.route("/change-password").post(verifyJWT, resetPassword);
router.route("/currentUser").get(verifyJWT, getCurrentUser);
router.route("/update-account").patch(verifyJWT, updateAccoutDetails);
router
  .route("/avatar")
  .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);
router
  .route("/cover-image")
  .patch(verifyJWT, upload.single("coverimage"), updateUserCoverImage);
router.route("/c/:username").get(verifyJWT, getChannelProfile);
router.route("/history").get(verifyJWT, watchHistory);

export default router;
