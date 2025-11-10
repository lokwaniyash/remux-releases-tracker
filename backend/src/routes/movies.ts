import { Router } from "express";
import { Movie } from "../models/Movie";
import { Torrent } from "../models/Torrent";

const router = Router();

router.get("/", async (req, res) => {
    try {
        const movies = await Movie.aggregate([
            {
                $lookup: {
                    from: "torrents",
                    localField: "tmdbId",
                    foreignField: "movieId",
                    as: "torrents"
                }
            },
            {
                $match: {
                    "torrents.0": { $exists: true },
                    hasReleased: true
                }
            },
            {
                $project: {
                    torrents: 0
                }
            },
            {
                $sort: {
                    physicalReleaseDate: -1
                }
            }
        ]);
        res.json(movies);
    } catch (err) {
        res.status(500).json({ message: "Error fetching movies" });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const movie = await Movie.findOne({ tmdbId: parseInt(req.params.id) });
        if (!movie) {
            return res.status(404).json({ message: "Movie not found" });
        }

        const torrents = await Torrent.find({ movieId: movie.tmdbId });
        res.json({ movie, torrents });
    } catch (err) {
        res.status(500).json({ message: "Error fetching movie details" });
    }
});

router.get("/calendar/upcoming", async (req, res) => {
    try {
        const movies = await Movie.find({
            hasReleased: false,
            physicalReleaseDate: { $gte: new Date() },
        }).sort({ physicalReleaseDate: 1 });
        res.json(movies);
    } catch (err) {
        res.status(500).json({ message: "Error fetching upcoming releases" });
    }
});

export const movieRoutes = router;
