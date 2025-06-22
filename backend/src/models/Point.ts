import { Schema, model, Document, Types } from "mongoose";

export interface Photo {
    url: string;
    caption?: string;
}

export interface IPoint extends Document {
    _id: Types.ObjectId;
    lat: number;
    long: number;
    descriptor?: string;
    tags: string[];
    photos: Photo[];
}

const PhotoSchema = new Schema({
    url: String,
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

PointSchema.virtual('id').get(function (this: IPoint) {
    return this._id ? this._id.toHexString() : undefined;
})

PointSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (_doc: any, ret: { _id: any; }) => {
        delete ret._id;
    },
});

export const Point = model<IPoint>("Point", PointSchema);