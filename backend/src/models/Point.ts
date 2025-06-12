import { Schema, model, Document, Types } from "mongoose";

export interface Photo {
    url: string;
    caption?: string;
}

export interface IPoint extends Document {
    lat: number;
    long: number;
    descriptor?: string;
    tags: string[];
    photos: Photo[];
}

const PhotoSchema = new Schema({
    url: { type: String, required: true },
    caption: String,
});

const PointSchema = new Schema<IPoint>(
    {
        lat: { type: Number, required: true },
        long: { type: Number, required: true },
        descriptor: { type: String },
        tags: { type: [String], default: [] },
        photos: { type: [PhotoSchema], default: [] },

    },
    { timestamps: true }
);

export const Point = model<IPoint>("Point", PointSchema);