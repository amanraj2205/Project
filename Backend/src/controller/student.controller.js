import { prisma } from "../config/db.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const getStudentProfile = asyncHandler(async (req, res) => {
    const userId = req.user?.payload?.id || req.user?.id;

    if (!userId) {
        throw new ApiError(401, "User not authenticated");
    }

    const student = await prisma.student.findUnique({
        where: { userId: Number(userId) },
        include: {
            academics: true,
            experiences: true,
            skills: true,
            projects: true,
            achievements: true,
        },
    });

    if (!student) {
        return res.status(200).json(
            new ApiResponse(200, null, "Student profile not found")
        );
    }

    return res.status(200).json(
        new ApiResponse(200, student, "Student profile fetched successfully")
    );
});


const updateStudentProfile = asyncHandler(async (req, res) => {
    const userId = req.user?.payload?.id || req.user?.id;
    const {
        fullName,
        rollNumber,
        branch,
        year,
        graduationYear,
        cgpa,
        profileDescription,
        bio,
        slug,
        phone,
        location,
        profilePhotoUrl,
        githubUsername,
        leetcodeUsername,
        codeforcesUsername,
        githubUrl,
        linkedinUrl,
        leetcodeUrl,
        codeforcesUrl,
        codechefUrl,
        xUrl,
        isPublic 
    } = req.body;

    let finalProfilePhotoUrl = profilePhotoUrl;
    if (req.file) {
        finalProfilePhotoUrl = req.file.path;
    }

    if (!userId) {
        throw new ApiError(401, "User not authenticated");
    }

    if (!fullName || !slug) {
        throw new ApiError(400, "Full name and slug are required");
    }


    const existingStudentWithSlug = await prisma.student.findUnique({
        where: { slug }
    });

    if (existingStudentWithSlug && existingStudentWithSlug.userId !== Number(userId)) {
        throw new ApiError(400, "Portfolio slug is already taken. Please choose another one.");
    }

    const studentProfile = await prisma.student.upsert({
        where: { userId: Number(userId) },
        update: {
            fullName,
            rollNumber,
            branch,
            year: year ? Number(year) : undefined,
            graduationYear: graduationYear ? Number(graduationYear) : undefined,
            cgpa: cgpa ? parseFloat(cgpa) : undefined,
            profileDescription,
            bio,
            slug,
            phone,
            location,
            profilePhotoUrl: finalProfilePhotoUrl,
            githubUsername,
            leetcodeUsername,
            codeforcesUsername,
            githubUrl,
            linkedinUrl,
            leetcodeUrl,
            codeforcesUrl,
            codechefUrl,
            xUrl,
            isPublic: isPublic !== undefined ? Boolean(isPublic) : undefined,
        },
        create: {
            userId: Number(userId),
            fullName,
            rollNumber,
            branch,
            year: year ? Number(year) : undefined,
            graduationYear: graduationYear ? Number(graduationYear) : undefined,
            cgpa: cgpa ? parseFloat(cgpa) : undefined,
            profileDescription,
            bio,
            slug,
            phone,
            location,
            profilePhotoUrl: finalProfilePhotoUrl,
            githubUsername,
            leetcodeUsername,
            codeforcesUsername,
            githubUrl,
            linkedinUrl,
            leetcodeUrl,
            codeforcesUrl,
            codechefUrl,
            xUrl,
            isPublic: isPublic !== undefined ? Boolean(isPublic) : true,
        },
    });

    return res.status(200).json(
        new ApiResponse(200, studentProfile, "Student profile updated successfully")
    );
});


const getPublicProfile = asyncHandler(async (req, res) => {
    const { slug } = req.params;

    const student = await prisma.student.findUnique({
        where: { 
            slug,
            isPublic: true 
        },
        include: {
            academics: true,
            experiences: true,
            skills: true,
            projects: true,
            achievements: true,
        },
    });

    if (!student) {
        throw new ApiError(404, "Public profile not found or is private");
    }

    
    await prisma.student.update({
        where: { id: student.id },
        data: { portfolioViews: { increment: 1 } }
    });

    return res.status(200).json(
        new ApiResponse(200, student, "Public profile fetched successfully")
    );
});



const addSkill = asyncHandler(async (req, res) => {
    const userId = req.user?.payload?.id || req.user?.id;
    const { name, level } = req.body;

    if (!name) throw new ApiError(400, "Skill name is required");

    const student = await prisma.student.findUnique({ where: { userId: Number(userId) } });
    if (!student) throw new ApiError(404, "Student profile not found");

    const skill = await prisma.studentSkill.create({
        data: {
            studentId: student.id,
            name,
            level: level || "Beginner"
        }
    });

    return res.status(201).json(new ApiResponse(201, skill, "Skill added successfully"));
});


const removeSkill = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await prisma.studentSkill.delete({ where: { id: Number(id) } });
    return res.status(200).json(new ApiResponse(200, {}, "Skill removed successfully"));
});



const addExperience = asyncHandler(async (req, res) => {
    const userId = req.user?.payload?.id || req.user?.id;
    const { title, company, location, startDate, endDate, isCurrent, description } = req.body;

    if (!title || !company) throw new ApiError(400, "Title and company are required");

    const student = await prisma.student.findUnique({ where: { userId: Number(userId) } });
    const experience = await prisma.studentExperience.create({
        data: {
            studentId: student.id,
            title,
            company,
            location,
            startDate: startDate ? new Date(startDate) : null,
            endDate: endDate ? new Date(endDate) : null,
            isCurrent: Boolean(isCurrent),
            description
        }
    });

    return res.status(201).json(new ApiResponse(201, experience, "Experience added successfully"));
});


const removeExperience = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await prisma.studentExperience.delete({ where: { id: Number(id) } });
    return res.status(200).json(new ApiResponse(200, {}, "Experience removed successfully"));
});



const addAcademic = asyncHandler(async (req, res) => {
    const userId = req.user?.payload?.id || req.user?.id;
    const { level, institution, boardOrUniversity, courseOrStream, startYear, endYear, cgpaOrPercentage } = req.body;

    if (!level || !institution) throw new ApiError(400, "Level and institution are required");

    const student = await prisma.student.findUnique({ where: { userId: Number(userId) } });
    const academic = await prisma.studentAcademic.create({
        data: {
            studentId: student.id,
            level,
            institution,
            boardOrUniversity,
            courseOrStream,
            startYear: Number(startYear),
            endYear: Number(endYear),
            cgpaOrPercentage: String(cgpaOrPercentage)
        }
    });

    return res.status(201).json(new ApiResponse(201, academic, "Academic record added successfully"));
});



const removeAcademic = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await prisma.studentAcademic.delete({ where: { id: Number(id) } });
    return res.status(200).json(new ApiResponse(200, {}, "Academic record removed successfully"));
});

export {
    getStudentProfile,
    updateStudentProfile,
    getPublicProfile,
    addSkill,
    removeSkill,
    addExperience,
    removeExperience,
    addAcademic,
    removeAcademic
};
