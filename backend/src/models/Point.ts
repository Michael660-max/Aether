import { Schema, model, Document, Types } from "mongoose";

export interface Photo {
    url: string;
    caption?: string;
}

export interface IPoint extends Document {
    lat: number;
    long: number;
    photos: Photo[];
    tags: string[];
    descriptor?: string;
    createdAt: Date;
    updatedAt: Date;
}

const PhotoSchema = new Schema({
    url: { type: String, required: true },
    caption: String,
});

const PointSchema = new Schema<IPoint>(
    {
        lat: { type: Number, required: true },
        long: { type: Number, required: true },
        photos: { type: [PhotoSchema], default: [] },
        tags: { type: [String], default: [] },
        descriptor: { type: String },
    },
    { timestamps: true }
);

export const Point = model<IPoint>("Point", PointSchema);