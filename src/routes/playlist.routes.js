import { Router } from "express";
import {
  createPlaylist,
  getUserPlaylists,
  addVideoToPlaylist,
  getPlaylistById,
  removeVideoFromPlaylist,
  updatePlaylist,
  deletePlaylist
} from "../controllers/playlist.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/create").post(verifyJWT, createPlaylist);
router.route("/delete/:playlistId").delete(verifyJWT,deletePlaylist)
router.route("/update/:playlistId").patch(verifyJWT,updatePlaylist)



router.route("/owner/:id").get(getUserPlaylists);
router.route("/:playlistID").get(getPlaylistById);


router.route("/add/:playlistId/:videoId").patch(verifyJWT, addVideoToPlaylist);
router.route("/remove/:playlistId/:videoId").patch(verifyJWT,removeVideoFromPlaylist)


export default router;
