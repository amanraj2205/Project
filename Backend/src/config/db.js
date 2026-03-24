import { PrismaClient } from "@prisma/client";
import { PrismaPg } from '@prisma/adapter-pg'
import "dotenv/config";

const prisma = new PrismaClient({
    log: process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })  // for database connection for checker 
})

const connectDB = async () => {
    try {
        await prisma.$connect();
        console.log("Database connected");
    } catch (error) {
        console.log(`Database connection error ${error}`);
        process.exit(1);  // exit with nodejs process in case of failure
    }
}
const disconnectDB = async () => {
    try {
        await prisma.$disconnect();
        console.log("Database disconnected");
    } catch (error) {
        console.log(`Database disconnection error ${error}`);
    }
}

export { prisma, connectDB, disconnectDB } 
