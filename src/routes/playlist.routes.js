import { Router } from "express";
import {createPlaylist,getUserPlaylists,addVideoToPlaylist,getPlaylistById} from "../controllers/playlist.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router()

router.route("/create").post(verifyJWT,createPlaylist)
router.route("/owner/:id").get(getUserPlaylists)
router.route("/:playlistId/:videoId").patch( verifyJWT,addVideoToPlaylist)
router.route("/:playlistID").get(getPlaylistById)


export default router