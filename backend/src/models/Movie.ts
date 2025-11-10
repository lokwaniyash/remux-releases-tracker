import { Schema, model, Document } from "mongoose";

interface IMovie extends Document {
    tmdbId: number;
    title: string;
    year: number;
    posterPath: string;
    physicalReleaseDate: Date;
    hasReleased: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const MovieSchema = new Schema<IMovie>(
    {
        tmdbId: { type: Number, required: true, unique: true },
        title: { type: String, required: true },
        year: { type: Number, required: true },
        posterPath: { type: String, required: true },
        physicalReleaseDate: { type: Date, required: true },
        hasReleased: { type: Boolean, default: false },
    },
    {
        timestamps: true,
    }
);

export const Movie = model<IMovie>("Movie", MovieSchema, "movies");
