import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import mongoose from "mongoose";
import pointsRouter from "./controllers/points";
import s3Router from "./controllers/s3";
import dotenv from "dotenv";

dotenv.config();

async function start() {
    await mongoose.connect(process.env.MONGO_URI!, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });

    const app = express();
    app.use(cors({
        origin: 'http://localhost:3000'
    }));
    app.use(express.json());

    // Routes
    app.use("/api/s3", s3Router)
    app.use("/api/points", pointsRouter);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
        console.error(err);
        res.status(500).json({ error: err.message || "Internal Server Error" });
    });

    app.listen(Number(process.env.PORT), () => console.log(`API listening on port ${process.env.PORT}`));

}

start().catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
});
