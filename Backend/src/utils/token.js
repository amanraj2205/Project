// src/utils/token.js
import jwt from 'jsonwebtoken';
import {prisma} from '../config/db.js';  
import {ApiError} from './apiError.js';
import { config } from "dotenv";
config();
 
const generateToken = async (userId) => { 
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { 
                email: true, 
                username: true
            }
        });

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        const payload = {
            id:userId,
            email: user.email,
            username: user.username
        }

        const accessToken = jwt.sign(
            { 
             payload
            },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        const refreshToken = jwt.sign(
            { id: userId },
            process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );


        return { accessToken, refreshToken };
    } catch (error) {
        console.error('Token generation error:', error);
        throw new ApiError(500, "Token generation failed");
    }
};

export default generateToken;
