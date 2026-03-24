import 'dotenv/config';
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import {prisma , connectDB, disconnectDB} from "./config/db.js";
import userRouter from "./router/user.router.js";
import studentRouter from "./router/student.router.js";
import projectRouter from "./router/project.router.js";
import contactRouter from "./router/contact.router.js";
const app = express();


app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  credentials: true
}));

app.use(cookieParser());
app.use(express.json());           
app.use(express.urlencoded({ extended: true })); 

const PORT = process.env.PORT || 5001;

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("Failed to connect to DB", err);
        process.exit(1);
    });


// good practice to handle errors
// Handle unhandled promise rejections(e.g database connection error)

process.on("unhandledRejection",  () => {
    console.log(`Error unhandledRejection: ${error.message}`);
    console.log("Shutting down the server due to unhandled rejection"); 
    server.close(async () => {
        await disconnectDB();
        process.exit(1);
    });
});

// Handle uncaught exceptions

process.on("uncaughtException", (error) => {
    console.log(`Error uncaughtException: ${error.message}`);
    console.log("Shutting down the server due to uncaught exception");
    server.close(async () => {
        await disconnectDB();
        process.exit(1);
    });
});

// Graceful shutdown on SIGTERM

process.on("SIGTERM", () => {
    console.log("SIGTERM received, shutting down gracefully");
    server.close(async () => {
        await disconnectDB();
        process.exit(0);
    });
});


// get,post,put,delete
// http://localhost:5001/hello
// http://localhost:5001/auth   
// Auth = singin,singup
// user = profile


app.get("/hello", (req, res) => {
    res.json({message: "Hello World"});
});

app.use("/api/users", userRouter);
app.use("/api/students", studentRouter);
app.use("/api/projects", projectRouter);
app.use("/api/contacts", contactRouter);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("Global Error Handler:", err);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error",
        errors: err.errors || [],
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined
    });
});



