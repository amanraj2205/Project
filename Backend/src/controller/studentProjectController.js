import { prisma } from "../config/db.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { fetchGithubRepos } from "../utils/githubUtils.js";

/**
 * Get all projects for the logged-in student
 */
const getAllProjects = asyncHandler(async (req, res) => {
    const userId = req.user?.userId;

    const student = await prisma.student.findUnique({
        where: { userId: Number(userId) },
        include: { projects: true }
    });

    if (!student) {
        throw new ApiError(404, "Student profile not found");
    }

    return res.status(200).json(
        new ApiResponse(200, student.projects, "Projects fetched successfully")
    );
});

/**
 * Add a single project manually
 */
const addProject = asyncHandler(async (req, res) => {
    const userId = req.user?.userId;
    const { title, shortDescription, techStack, githubUrl, demoUrl, role, startDate, endDate } = req.body;

    const student = await prisma.student.findUnique({
        where: { userId: Number(userId) }
    });

    if (!student) {
        throw new ApiError(404, "Student profile not found");
    }

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
        }
    });

    return res.status(201).json(
        new ApiResponse(201, project, "Project added successfully")
    );
});

/**
 * Sync projects from GitHub
 */
const syncGitHubProjects = asyncHandler(async (req, res) => {
    const userId = req.user?.userId;

    const student = await prisma.student.findUnique({
        where: { userId: Number(userId) }
    });

    if (!student || !student.githubUsername) {
        throw new ApiError(400, "GitHub username not set in profile");
    }

    const githubProjects = await fetchGithubRepos(student.githubUsername);

    // Fetch existing project URLs to avoid duplicates
    const existingProjects = await prisma.studentProject.findMany({
        where: { studentId: student.id },
        select: { githubUrl: true }
    });

    const existingUrls = existingProjects.map(p => p.githubUrl);

    // Filter projects that are NOT already in the database
    const newProjects = githubProjects.filter(p => !existingUrls.includes(p.githubUrl));

    if (newProjects.length === 0) {
        return res.status(200).json(
            new ApiResponse(200, [], "All GitHub repositories are already synced")
        );
    }

    // Insert new projects
    const createdProjects = await Promise.all(
        newProjects.map(p => 
            prisma.studentProject.create({
                data: {
                    ...p,
                    studentId: student.id,
                    status: "unverified" // Default status as per project roadmap
                }
            })
        )
    );

    return res.status(201).json(
        new ApiResponse(201, createdProjects, `${createdProjects.length} new projects synced from GitHub`)
    );
});

const updateProject = asyncHandler(async (req,res)=>{
    const userId = req.user?.userId;
    const { title, shortDescription, techStack, githubUrl, demoUrl, role, startDate, endDate } = req.body;

    const student = await prisma.student.findUnique({
        where: { userId: Number(userId) }
    });

    if (!student) {
        throw new ApiError(404, "Student profile not found");
    }

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
        }
    });

    return res.status(201).json(
        new ApiResponse(201, project, "Project added successfully")
    );
})

/**
 * Delete a project
 */

const deleteProject = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.userId;

    // Verify ownership
    const project = await prisma.studentProject.findUnique({
        where: { id: Number(id) },
        include: { student: true }
    });

    if (!project || project.student.userId !== Number(userId)) {
        throw new ApiError(403, "Not authorized to delete this project");
    }

    await prisma.studentProject.delete({
        where: { id: Number(id) }
    });

    return res.status(200).json(
        new ApiResponse(200, null, "Project deleted successfully")
    );
});

export {
    getAllProjects,
    addProject,
    syncGitHubProjects,
    updateProject,
    deleteProject 
};
