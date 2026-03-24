import { prisma } from "../config/db.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import bcrypt from 'bcrypt';
import generateToken from "../utils/token.js";
import jwt from 'jsonwebtoken';

const registerUser = asyncHandler(async (req, res) => { 
    const { email, password, username, fullName } = req.body;

    if (!email || !password || !username) {
        throw new ApiError(400, "Email, password, and username are required");
    }

    const existingUser = await prisma.user.findFirst({ 
        where: { OR: [{ email }, { username }] } 
    });

    if (existingUser) {
        throw new ApiError(409, "User with this email or username already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user and optionally the student profile
    const user = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            username,
            student: {
                create: {
                    fullName: fullName || username,
                    slug: username.toLowerCase().replace(/\s+/g, '-'),
                    isPublic: true,
                }
            }
        },
        include: {
            student: true
        }
    });

    const { accessToken, refreshToken } = await generateToken(user.id);

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "None",
    };

    const createdUser = {
        id: user.id,
        email: user.email,
        username: user.username,
        student: user.student
    };

    return res 
        .status(201)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(201, { user: createdUser, accessToken, refreshToken }, "User registered successfully")
        );
});

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }

    const user = await prisma.user.findUnique({
        where: { email },
        include: { student: true }
    });

    if (!user) {
        throw new ApiError(401, "Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid email or password");
    }

    const { accessToken, refreshToken } = await generateToken(user.id);

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "None",
    };

    // Remove sensitive data
    const loggedInUser = {
        id: user.id,
        email: user.email,
        username: user.username,
        student: user.student
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "User logged in successfully")
        );
});

const logout = asyncHandler(async (req, res) => {
    // In a full implementation, we would invalidate the refresh token in the DB
    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "None",
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
    const userId = req.user?.id || req.user?.userId || req.user?.payload?.id;

    const user = await prisma.user.findUnique({
        where: { id: Number(userId) },
        include: { student: true }
    });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Remove sensitive data
    delete user.password;

    return res.status(200).json(new ApiResponse(200, user, "User fetched successfully"));
});

const getAllUsers = asyncHandler(async (req, res) => {
    const users = await prisma.user.findMany({
        include: { student: true }
    });

    const sanitizedUsers = users.map(user => {
        delete user.password;
        return user;
    });

    return res.status(200).json(new ApiResponse(200, sanitizedUsers, "All users fetched successfully"));
});

export { registerUser, login, logout, getCurrentUser, getAllUsers };
