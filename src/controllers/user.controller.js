import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponce } from "../utils/apiResponse.js";
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
  const existedUser =await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "username and email already exist.");
  }

  // image validation

  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverLocalPath = req.files?.coverimage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "avatar local needed.");
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const cover = await uploadOnCloudinary(coverLocalPath);
  if (!avatar) {
    throw  new ApiError(400, "avatar local needed.");
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

export { registerUser };
