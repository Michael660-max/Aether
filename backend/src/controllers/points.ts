import { Router } from "express";
import { Point } from "../models/Point";

const router = Router();

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
    try {
        await Point.findByIdAndDelete(req.params.id);
        res.sendStatus(204);
    } catch (err) {
        next(err);
    }
});

export default router;