import { prisma } from "../config/db.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const addAchievement = asyncHandler(async (req, res) => {
    const userId = req.user?.payload?.id || req.user?.id;
    const { title, type, organization, positionOrScore, date, proofUrl } = req.body;

    if (!title) throw new ApiError(400, "Achievement title is required");

    const student = await prisma.student.findUnique({ where: { userId: Number(userId) } });
    if (!student) throw new ApiError(404, "Student profile not found");

    const achievement = await prisma.studentAchievement.create({
        data: {
            studentId: student.id,
            title,
            type,
            organization,
            positionOrScore,
            date: date ? new Date(date) : null,
            proofUrl,
            status: "unverified"
        }
    });

    return res.status(201).json(new ApiResponse(201, achievement, "Achievement added successfully"));
});


 
const removeAchievement = asyncHandler(async (req, res) => {
    const { id } = req.params;
    

    await prisma.studentAchievement.delete({ where: { id: Number(id) } });
    
    return res.status(200).json(new ApiResponse(200, {}, "Achievement removed successfully"));
});

export { addAchievement, removeAchievement };
