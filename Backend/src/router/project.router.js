import express from "express";
import { 
    getProjects, 
    addProject, 
    syncGithubProjects,
    updateProject, 
    removeProject 
} from "../controller/project.controller.js";
import { authenticateToken } from "../middlewares/auth.js";
import { uploadProject } from "../utils/cloudinary.js";

const projectRouter = express.Router();

projectRouter.use(authenticateToken); 

projectRouter.get("/", getProjects);
projectRouter.post("/", uploadProject.single('image'), addProject);
projectRouter.post("/github-sync", syncGithubProjects);
projectRouter.post("/update", uploadProject.single('image'), updateProject);
projectRouter.delete("/:id", removeProject);

export default projectRouter;
