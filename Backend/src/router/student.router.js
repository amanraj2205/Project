import express from "express";
import { 
    getStudentProfile, 
    updateStudentProfile, 
    getPublicProfile,
    addSkill,
    removeSkill,
    addExperience,
    removeExperience,
    addAcademic,
    removeAcademic
} from "../controller/student.controller.js";
import { addAchievement, removeAchievement } from "../controller/studentAchievementController.js";
import { authenticateToken } from "../middlewares/auth.js";
import { uploadProfile } from "../utils/cloudinary.js";

const studentRouter = express.Router();

studentRouter.get("/p/:slug", getPublicProfile);


studentRouter.use(authenticateToken); 

studentRouter.get("/", getStudentProfile);
studentRouter.post("/", uploadProfile.single('profilePhoto'), updateStudentProfile); 
studentRouter.post("/profile", uploadProfile.single('profilePhoto'), updateStudentProfile); 
studentRouter.put("/profile", uploadProfile.single('profilePhoto'), updateStudentProfile); 
studentRouter.patch("/profile", uploadProfile.single('profilePhoto'), updateStudentProfile); 


studentRouter.post("/skills", addSkill);
studentRouter.delete("/skills/:id", removeSkill);


studentRouter.post("/experiences", addExperience);
studentRouter.delete("/experiences/:id", removeExperience);


studentRouter.post("/academics", addAcademic);
studentRouter.delete("/academics/:id", removeAcademic);


studentRouter.post("/achievements", addAchievement);
studentRouter.delete("/achievements/:id", removeAchievement);

export default studentRouter;
