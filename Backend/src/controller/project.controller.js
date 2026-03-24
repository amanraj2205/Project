import { prisma } from "../config/db.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { fetchGithubRepos } from "../utils/githubUtils.js";

/**
 * Manually add a project
 */
const addProject = asyncHandler(async (req, res) => {
    const userId = req.user?.payload?.id || req.user?.id;
    const { title, shortDescription, techStack, githubUrl, demoUrl, role, startDate, endDate, status, imageUrl } = req.body;

    let finalImageUrl = imageUrl;
    if (req.file) {
        finalImageUrl = req.file.path;
    }

    if (!title) throw new ApiError(400, "Project title is required");

    const student = await prisma.student.findUnique({ where: { userId: Number(userId) } });
    if (!student) throw new ApiError(404, "Student profile not found");

    const project = await prisma.studentProject.create({
        data: {
            studentId: student.id,
            title,
            shortDescription,
            techStack,
            githubUrl,
            demoUrl,
            role,
            startDate: startDate ? new Date(startDate) : null,
            endDate: endDate ? new Date(endDate) : null,
            status: status || "unverified",
            imageUrl: finalImageUrl
        }
    });

    return res.status(201).json(new ApiResponse(201, project, "Project added successfully"));
});

/**
 * Sync projects from GitHub
 */
const syncGithubProjects = asyncHandler(async (req, res) => {
    const userId = req.user?.payload?.id || req.user?.id;
    if (!userId) throw new ApiError(401, "Unauthorized");

    const student = await prisma.student.findUnique({ where: { userId: Number(userId) } });
    if (!student) throw new ApiError(404, "Student profile not found");

    if (!student.githubUsername) {
        throw new ApiError(400, "GitHub username not set. Please update your settings first.");
    }

    console.log(`Syncing for user: ${student.githubUsername}`);
    const repos = await fetchGithubRepos(student.githubUsername);

    const existingProjects = await prisma.studentProject.findMany({
        where: { studentId: student.id },
        select: { githubUrl: true }
    });
    const existingUrls = new Set(existingProjects.map(p => p.githubUrl).filter(url => !!url));

    const newRepos = repos.filter(repo => !existingUrls.has(repo.githubUrl));

    if (newRepos.length === 0) {
        return res.status(200).json(new ApiResponse(200, [], "No new projects to sync."));
    }

    // Individual creates instead of createMany to be safer and catch specific errors
    const completed = [];
    const errors = [];

    for (const repo of newRepos) {
        try {
            const project = await prisma.studentProject.create({
                data: {
                    studentId: student.id,
                    ...repo,
                    status: 'unverified'
                }
            });
            completed.push(project);
        } catch (err) {
            console.error(`Failed to sync repo ${repo.title}:`, err.message);
            errors.push({ repo: repo.title, error: err.message });
        }
    }

    if (completed.length === 0 && errors.length > 0) {
        throw new ApiError(500, `Failed to sync projects: ${errors[0].error}`);
    }

    return res.status(201).json(new ApiResponse(
        201, 
        { synced: completed.length, errors: errors.length > 0 ? errors : undefined }, 
        `Synced ${completed.length} projects. ${errors.length > 0 ? `${errors.length} failed.` : ""}`
    ));
});

const updateProject = asyncHandler(async (req,res)=>{
    const userId = req.user?.payload?.id || req.user?.id;
    const { id, title, shortDescription, techStack, githubUrl, demoUrl, role, startDate, endDate, status, imageUrl } = req.body;

    let finalImageUrl = imageUrl;
    if (req.file) {
        finalImageUrl = req.file.path;
    }

    const student = await prisma.student.findUnique({
        where: { userId: Number(userId) }
    });

    if (!student) {
        throw new ApiError(404, "Student profile not found");
    }

    if (!id) throw new ApiError(400, "Project ID is required");

    const project = await prisma.studentProject.update({
        where: { id: Number(id) },
        data: {
            title,
            shortDescription,
            techStack,
            githubUrl,
            demoUrl,
            role,
            startDate: startDate ? new Date(startDate) : null,
            endDate: endDate ? new Date(endDate) : null,
            status: status || "unverified",
            imageUrl: finalImageUrl
        }
    });

    return res.status(200).json(
        new ApiResponse(200, project, "Project updated successfully")
    );
})

/**
 * Get all projects for the student
 */
const getProjects = asyncHandler(async (req, res) => {
    const userId = req.user?.payload?.id || req.user?.id;

    const student = await prisma.student.findUnique({ where: { userId: Number(userId) } });
    if (!student) throw new ApiError(404, "Student profile not found");

    const projects = await prisma.studentProject.findMany({
        where: { studentId: student.id },
        orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json(new ApiResponse(200, projects, "Projects fetched successfully"));
});

/**
 * Remove a project
 */
const removeProject = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await prisma.studentProject.delete({ where: { id: Number(id) } });
    return res.status(200).json(new ApiResponse(200, {}, "Project removed successfully"));
});

export { addProject, syncGithubProjects,updateProject, getProjects, removeProject }; 
