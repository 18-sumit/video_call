import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { User } from "../models/user.models.js";
import logger from "../logger.js";
import { validationResult } from "express-validator";


const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);

        if (!user) {
            throw new Error("User not found")
        }
        // generate access & refresh Tokens
        // await them , because user.generateAccessToken() and user.RefreshToken() 
        //methods return a promise because they internally use jwt.sign()
        // which doesn't resolve immediately, but instead returns a promise.

        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();

        // save refresh token in DB:
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        throw new Error(error.message, "smthing went wrong while gen.. refresh & access token");
    }
}

const registerUser = asyncHandler(async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty())
        return res
            .status(400)
            .json({
                errors: errors.array()
            });

    console.log(req.body);
    // logger.info(req.body);
    const { name, email, password } = req.body


    const existedUser = await User.findOne({
        $or: [{ name }, { email }]
    })

    if (existedUser) {
        throw new ApiError(
            409,
            "User with name or email already exists"
        )
    }

    const user = await User.create(
        {
            name,
            email,
            password
        }
    )

    // Fetch the created user excluding password and refreshToken
    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if (!createdUser) {
        throw new ApiError(
            500,
            "Something went wrong while registering the user"
        )
    }

    // Success respond
    return res
        .status(201)
        .json(
            new ApiResponse(
                200,
                createdUser,
                "User registered successfully"
            )
        )
});



const loginUser = asyncHandler(async (req, res) => {

    console.log(req.body);

    const { email, password } = req.body;

    if (!email && !password) {
        throw new ApiError(
            400,
            "Email and password is required"
        )
    }

    const user = await User.findOne({ email }).select("+password");
    // do add +password as it is false in usermodel .it prevents password to being exposed to every query 
    // even if it is not needed.

    if (!user) {
        throw new ApiError(
            404,
            "User does not exist"
        )
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(
            401,
            "Invalid User credential"
        )
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
    // console.log(accessToken, refreshToken);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                { user: loggedInUser, accessToken, refreshToken },
                "User logged in successfully"
            )
        )
});

const logoutUser = asyncHandler(async (req, res) => {

    // Ensure the user is authenticated (user should be in the request object)
    if (!req.user) {
        throw new ApiError(400, "User is not authenticated");
    }

    // Clear the refresh token from the database
    await User.findOneAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(
                200,
                {},
                "User logged out"
            )
        )
})

const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
        throw new ApiError(
            404,
            "User not found"
        )
    }
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { user },
                "User Profile retrieved successfully"
            )
        )
});

const updateUserProfile = asyncHandler(async (req, res) => {

    const { name, email } = req.body;
    if (!name || !email) {
        throw new ApiError(400, "All fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?.id,
        {
            $set: {
                name,
                email
            }
        },
        { new: true }
    ).select("-password")

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            user,
            "Account details updated"
        ))
})


export {
    registerUser,
    loginUser,
    logoutUser,
    getUserProfile,
    updateUserProfile,
}