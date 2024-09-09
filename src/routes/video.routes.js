import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {publishVideo,getVideoByID,updateVideo,deleteVideo,togglePublishStatus} from "../controllers/video.controller.js"
const router = Router();

router.route("/publishvideo").post(verifyJWT,
    upload.fields([
        {name:"video",maxCount:1},
        {
            name:"thumbnail",maxCount:1
        }
    ]),
    publishVideo)

router.route("/v/:videoID").get(getVideoByID)
router.route("/updatevideo/:videoID").patch(verifyJWT,
    upload.single("thumbnail"),updateVideo
)
router.route("/deletevideo/:videoID").delete(verifyJWT,deleteVideo)
router.route("/publishstatus/:videoID").patch(verifyJWT,togglePublishStatus)


export default router