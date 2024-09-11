import { Router } from "express";
import {getUserChannelSubscribers,subscriptiontoogle,getSubscribedChannels,} from "../controllers/subscription.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router()

router.route("/:channelID/subscribe").post(verifyJWT,subscriptiontoogle)
router.route("/:id/subscriber").get(getUserChannelSubscribers)
router.route("/:id/subscribedchannel").get(getSubscribedChannels)



export default router;