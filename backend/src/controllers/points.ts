import { Router } from "express";
import { Point } from "../models/Point";
import { S3Client, DeleteObjectCommand, S3 } from "@aws-sdk/client-s3";

const router = Router();
const s3 = new S3Client({ region: process.env.AWS_REGION })

// Create a point
router.post("/", async (req, res, next) => {
    try {
        const point = await Point.create(req.body);
        res.status(201).json(point.toJSON());
    } catch (err) {
        next(err);
    }
});

// Read a list of points
router.get("/", async (req, res, next) => {
    try {
        const pts = await Point.find();
        res.json(pts);
    } catch (err) {
        next(err);
    }
});

// Get one point
router.get("/:id", async (req, res, next) => {
    try {
        const pts = await Point.findById(req.params.id);
        if (!pts) res.sendStatus(404);
        res.json(pts);
    } catch (err) {
        next(err);
    }
});

// Update a point
router.put("/:id", async (req, res, next) => {
    try {
        const pt = await Point.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!pt) res.sendStatus(404);
        res.json(pt);
    } catch (err) {
        next(err);
    }
});

// Delete a point
router.delete("/:id", async (req, res, next) => {
    const { id } = req.params;
    const pt = await Point.findById(id);

    if (!pt) return res.sendStatus(404).json({ error: "Point not found" });

    await Promise.all(
        pt.photos.map(async ({ url }) => {
            const key = url.split("/").pop()!;
            await s3.send(
                new DeleteObjectCommand({
                    Bucket: process.env.S3_BUCKET,
                    Key: key
                }))

        })
    )
    await Point.findByIdAndDelete(id);
    res.sendStatus(204);
});

export default router;