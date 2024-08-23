import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary, deleteOnCloudnary } from "../utils/cloudinary.js";
import { ApiResponce } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
const accessAndRefreshToken = async (userID) => {
  try {
    const user = await User.findById(userID);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something Went wrong to generate access and refresh token."
    );
  }
};
const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  // validation - not empty
  // check if user already exists :email , username
  // cheack for images and avatar👌
  // upload them to cloudinary
  // create user object - create entry in db
  // remove password an refersh token
  // check user  creation
  // return response

  const { fullname, email, username, password } = req.body;

  // validation

  if (
    [fullname, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All field required.");
  } else {
    if (!(email.includes("@") && email.includes("."))) {
      throw new ApiError(400, "Enter valid email");
    }
  }

  // check user
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "username and email already exist.");
  }

  // image validation

  //const avatarLocalPath = req.files?.avatar[0]?.path;
  //const coverLocalPath = req.files?.coverimage[0]?.path;
  let avatarLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.avatar) &&
    req.files.avatar.length > 0
  ) {
    avatarLocalPath = req.files?.avatar[0]?.path;
  }
  let coverLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverimage) &&
    req.files.coverimage.length > 0
  ) {
    coverLocalPath = req.files?.coverimage[0]?.path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "avatar local needed.");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const cover = await uploadOnCloudinary(coverLocalPath);
  if (!avatar) {
    throw new ApiError(400, "avatar local needed.");
  }

  // create user object

  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverimage: cover?.url || "",
    email,
    username: username.toLowerCase(),
    password,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "User not created.");
  }

  return res
    .status(201)
    .json(new ApiResponce(201, createdUser, "User registered successfully."));
});
const loginUser = asyncHandler(async (req, res) => {
  // req.body --->data
  // username or email
  // find the user
  // pasword check
  //  access and refresh token
  // send cookies

  const { email, username, password } = req.body;
  if (!username && !email) {
    throw new ApiError(400, "Username or email is required.");
  }
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!existedUser) {
    throw new ApiError(400, "User not found.");
  }

  const isPasswdCorrect = await existedUser.passwordChecker(password);
  if (!isPasswdCorrect) {
    throw new ApiError(400, "Invalid user credentials.");
  }

  const { accessToken, refreshToken } = await accessAndRefreshToken(
    existedUser._id
  );

  const logedInUser = await User.findById(existedUser._id).select(
    "-password -refreshToken"
  );
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponce(
        200,
        {
          user: logedInUser,
          accessToken,
          refreshToken,
        },
        "User Logged In Successfully"
      )
    );
});
const logOutUser = asyncHandler(async (req, res) => {
  User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponce(200, {}, "User logged out."));
});
const refershAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }
  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECERT
    );
    const user = await User.findById(decodedToken._id);
    if (!user) {
      throw new ApiError(401, "Invalid refresh token.");
    }
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used.");
    }
    const options = {
      httpOnly: true,
      secure: true,
    };
    const { accessToken, newRefreshToken } = await accessAndRefreshToken(
      user._id
    );

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponce(
          200,
          {
            accessToken: accessToken,
            refreshToken: newRefreshToken,
          },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refesh token");
  }
});
const resetPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswdCorrect(oldPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid Old Password");
  }
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponce(200, {}, "Passowrd change succesfully."));
});
const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponce(200, res.user, "Current user fetched successfully."));
});
const updateAccoutDetails = asyncHandler(async (req, res) => {
  const { fullname, email } = req.body;

  if (!fullname || !email) {
    throw new ApiError(400, "All field is required.");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullname,
        email: email,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponce(200, user, "Account details updated successfully."));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing.");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar.url) {
    throw new ApiError(400, "Error while uploading avatar");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: { avatar: avatar.url },
    },
    { new: true }
  ).select("-password");

  await deleteOnCloudnary(user.avatar);

  return res.status(200).json(new ApiResponce(200, user, "Avatar Updated."));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverLocalPath = req.file?.path;
  if (!coverLocalPath) {
    throw new ApiError(400, "CoverImage file is missing.");
  }

  const cover = await uploadOnCloudinary(coverLocalPath);

  if (!cover.url) {
    throw new ApiError(400, "Error while uploading cover");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: { coverimage: cover.url },
    },
    { new: true }
  ).select("-password");

  await deleteOnCloudnary(user.coverimage);

  return res.status(200).json(new ApiResponce(200, user, "cover Updated."));
});

export {
  registerUser,
  loginUser,
  logOutUser,
  refershAccessToken,
  resetPassword,
  getCurrentUser,
  updateAccoutDetails,
  updateUserAvatar,
  updateUserCoverImage,
};
