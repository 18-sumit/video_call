import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { User } from "../models/user.models.js";
import logger from "../logger.js";
import { validationResult } from "express-validator";


const generateAccessRefreshToken = async (userId) => {
    try {

        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        // to save refreshToken in db 
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while generating access and refresh tokens"
        )
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

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if (!createdUser) {
        throw new ApiError(
            500,
            "Something went wrong while registering the user"
        )
    }

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

    const { accessToken, refreshToken } = generateAccessRefreshToken(user._id);

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






export {
    registerUser,
    loginUser,
    logoutUser
}