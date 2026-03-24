import { prisma } from "../config/db.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Send a contact message to a student
 */
const sendContactMessage = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    const { senderName, senderEmail, message } = req.body;

    if (!senderName || !senderEmail || !message) {
        throw new ApiError(400, "All fields are required to send a message.");
    }

    const student = await prisma.student.findUnique({ where: { slug } });
    if (!student) throw new ApiError(404, "Student profile not found.");

    const contactMsg = await prisma.contactMessage.create({
        data: {
            studentId: student.id,
            senderName,
            senderEmail,
            message
        }
    });

    return res.status(201).json(new ApiResponse(201, contactMsg, "Message sent successfully."));
});


const getContactMessages = asyncHandler(async (req, res) => {
    const userId = req.user?.payload?.id || req.user?.id;

    const student = await prisma.student.findUnique({ where: { userId: Number(userId) } });
    if (!student) throw new ApiError(404, "Student profile not found.");

    const messages = await prisma.contactMessage.findMany({
        where: { studentId: student.id },
        orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json(new ApiResponse(200, messages, "Contact messages fetched successfully."));
});

export { sendContactMessage, getContactMessages };
