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
                    Category: ["2000", "2045"],
                },
            }
        );

        const items: any[] = [];
        if (response.data?.Results) {
            items.push(
                ...response.data.Results.map((item: any) => ({
                    title: item.Title,
                    magnetUri: item.MagnetUri,
                    guid: item.Guid,
                    size: item.Size,
                    tracker: item.Tracker,
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
                    const torrentData: any = {
                        movieId: movie.tmdbId,
                        indexer: [item.tracker || "Unknown"],
                        resolution: parsedInfo.resolution,
                        quality: parsedInfo.quality,
                        encode: parsedInfo.encode,
                        releaseGroup: parsedInfo.releaseGroup || "Unknown",
                        size: parseInt(item.size),
                        fileName: item.title,
                        firstSeen: new Date(),
                        visualTags: parsedInfo.visualTags || [],
                        audioTags: parsedInfo.audioTags || [],
                        audioChannels: parsedInfo.audioChannels || [],
                        languages: parsedInfo.languages || [],
                        links: [],
                    };

                    if (item.magnetUri) {
                        torrentData.magnetLink = item.magnetUri;
                    } else if (item.guid) {
                        torrentData.links.push({
                            indexer: item.tracker || "Unknown",
                            guid: item.guid,
                        });
                    }

                    const [rankedTorrent] = rankTorrents([torrentData]);

                    try {
                        const existingTorrent = await Torrent.findOne({
                            movieId: torrentData.movieId,
                            releaseGroup: torrentData.releaseGroup,
                            resolution: torrentData.resolution,
                            quality: torrentData.quality,
                            encode: torrentData.encode,
                        });

                        if (existingTorrent) {
                            const updatedIndexers = Array.from(
                                new Set([
                                    ...(existingTorrent.indexer || []),
                                    ...(torrentData.indexer || []),
                                ])
                            );

                            const existingLinks = existingTorrent.links || [];
                            const newLinks = torrentData.links || [];
                            const mergedLinks = [
                                ...existingLinks,
                                ...newLinks.filter(
                                    (nl: any) =>
                                        !existingLinks.some(
                                            (el: any) =>
                                                el.indexer === nl.indexer &&
                                                el.guid === nl.guid
                                        )
                                ),
                            ];

                            const updateData: any = {
                                indexer: updatedIndexers,
                                rank: rankedTorrent.rank,
                                links: mergedLinks,
                            };

                            if (
                                torrentData.magnetLink &&
                                !existingTorrent.magnetLink
                            ) {
                                updateData.magnetLink = torrentData.magnetLink;
                            }

                            if (
                                updatedIndexers.length >
                                    existingTorrent.indexer.length ||
                                mergedLinks.length > existingLinks.length
                            ) {
                                await Torrent.findByIdAndUpdate(
                                    existingTorrent._id,
                                    updateData
                                );
                            }
                        } else {
                            await Torrent.create({
                                ...torrentData,
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
