import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ limit: "20kb", extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

// router import

import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import platlistRouter from "./routes/playlist.routes.js";

// routes declaration

app.use("/api/v1/users", userRouter);
app.use("/api/v1/video", videoRouter);
app.use("/api/v1/subs", subscriptionRouter);
app.use("/api/v1/tweet", tweetRouter);
app.use("/api/v1/playlist", platlistRouter);

export { app };
