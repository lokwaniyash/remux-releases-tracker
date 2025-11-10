import axios from "axios";
import { Movie } from "../models/Movie.js";
import { Torrent } from "../models/Torrent.js";
import { parseTorrentFilename } from "../utils/torrentParser.js";

export async function setupRssFeed() {
    try {
        const notFullyRemuxedMovies = await Movie.find({
            hasReleased: true,
            tmdbId: {
                $nin: await Torrent.distinct("movieId", {
                    quality: "BluRay REMUX",
                }),
            },
        });

        // Get all results directly using the all results endpoint
        const response = await axios.get(
            `${process.env.JACKETT_URL}/api/v2.0/indexers/all/results`,
            {
                params: {
                    apikey: process.env.JACKETT_API_KEY,
                    Category: ["2000", "2045"], // Bluray categories
                },
            }
        );

        const items: any[] = [];

        // Process results from all indexers
        if (response.data?.Results) {
            items.push(
                ...response.data.Results.map((item: any) => ({
                    title: item.Title,
                    link: item.MagnetUri || item.Link,
                    size: item.Size,
                    jackettindexer: { id: item.Tracker },
                }))
            );

            const indexerItems = response.data?.channel?.item || [];
            items.push(
                ...indexerItems.map((item: any) => ({
                    ...item,
                    jackettindexer: { id: item.id },
                }))
            );
        }
        for (const item of items) {
            const parsedInfo = parseTorrentFilename(item.title);
            if (parsedInfo.quality !== "BluRay REMUX") continue;

            // Try to match this remux with one of our movies that need remuxes
            for (const movie of notFullyRemuxedMovies) {
                if (
                    item.title
                        .toLowerCase()
                        .includes(movie.title.toLowerCase()) &&
                    item.title.includes(movie.year.toString())
                ) {
                    const torrent = {
                        movieId: movie.tmdbId,
                        indexer: [item.jackettindexer?.id || "Unknown"],
                        resolution: parsedInfo.resolution,
                        quality: parsedInfo.quality,
                        encode: parsedInfo.encode,
                        releaseGroup: parsedInfo.releaseGroup || "Unknown",
                        size: parseInt(item.size),
                        magnetLink: item.link,
                        fileName: item.title,
                        firstSeen: new Date(),
                        visualTags: parsedInfo.visualTags || [],
                        audioTags: parsedInfo.audioTags || [],
                        audioChannels: parsedInfo.audioChannels || [],
                        languages: parsedInfo.languages || [],
                    };

                    try {
                        const existingTorrent = await Torrent.findOne({
                            movieId: torrent.movieId,
                            releaseGroup: torrent.releaseGroup,
                            resolution: torrent.resolution,
                            quality: torrent.quality,
                            encode: torrent.encode,
                        });

                        if (existingTorrent) {
                            const updatedIndexers = Array.from(
                                new Set([
                                    ...(existingTorrent.indexer || []),
                                    ...(torrent.indexer || []),
                                ])
                            );

                            if (
                                updatedIndexers.length >
                                existingTorrent.indexer.length
                            ) {
                                await Torrent.findByIdAndUpdate(
                                    existingTorrent._id,
                                    { indexer: updatedIndexers }
                                );
                            }
                        } else {
                            await Torrent.create(torrent);
                        }
                    } catch (error: unknown) {
                        console.error(
                            `RSS Feed - Error processing torrent: ${
                                error instanceof Error
                                    ? error.message
                                    : String(error)
                            }`
                        );
                    }
                }
            }
        }
    } catch (error) {
        console.error("Error processing RSS feed:", error);
    }
}
