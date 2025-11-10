import axios from "axios";
import { Movie } from "../models/Movie.js";
import { Torrent } from "../models/Torrent.js";
import { parseTorrentFilename } from "../utils/torrentParser.js";
import { rankTorrents } from "../utils/rankTorrents.js";

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
        const response = await axios.get(
            `${process.env.JACKETT_URL}/api/v2.0/indexers/all/results`,
            {
                params: {
                    apikey: process.env.JACKETT_API_KEY,
                    Category: ["2000", "2045"], // Movie categories
                },
            }
        );

        const items: any[] = [];
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

                    // Calculate rank using rankTorrents function
                    const [rankedTorrent] = rankTorrents([torrent]);

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
                                    {
                                        indexer: updatedIndexers,
                                        rank: rankedTorrent.rank,
                                    }
                                );
                            }
                        } else {
                            await Torrent.create({
                                ...torrent,
                                rank: rankedTorrent.rank,
                            });
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
