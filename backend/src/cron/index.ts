import { CronJob } from "cron";
import axios from "axios";
import { Movie } from "../models/Movie";
import { Torrent } from "../models/Torrent";
import { parseTorrentFilename } from "../utils/torrentParser";
import { rankTorrents } from "../utils/rankTorrents";
import { fetchTMDBDiscover, fetchTMDBReleaseDate } from "../utils/rateLimit";
import { TMDBMovie } from "../types/tmdb";

import { setupRssFeed } from "./rssFeed";

export async function setupCronJobs() {
    new CronJob("0 0 * * *", async () => {
        await checkNewReleases();
    }).start();

    new CronJob("0 */6 * * *", async () => {
        await checkNewTorrents();
    }).start();

    // Check RSS feed more frequently for new releases
    new CronJob("*/15 * * * *", async () => {
        await setupRssFeed();
    }).start();
}

interface DateRange {
    startDate?: string;
    endDate?: string;
}

export async function checkNewReleases(dateRange?: DateRange) {
    try {
        const today = new Date();
        const defaultStartDate = new Date(today);
        defaultStartDate.setDate(defaultStartDate.getDate() - 1);

        const discoverUrl = new URL(`${process.env.TMDB_API_URL}/discover/movie`);
        const params = new URLSearchParams({
            api_key: process.env.TMDB_API_KEY!,
            "primary_release_date.gte": dateRange?.startDate || defaultStartDate.toISOString().split("T")[0],
            "primary_release_date.lte": dateRange?.endDate || today.toISOString().split("T")[0],
            "vote_count.gte": "100",
            "sort_by": "primary_release_date.desc",
            "page": "1"
        });
        discoverUrl.search = params.toString();

        const firstResponse = await fetchTMDBDiscover(discoverUrl.toString());
        console.log(`Found ${firstResponse.total_results} movies across ${firstResponse.total_pages} pages`);
        await Promise.all(
            firstResponse.results.map((movie: TMDBMovie) => 
                checkBlurayReleaseDate(
                    movie.id,
                    movie.title,
                    movie.poster_path,
                    new Date(movie.release_date).getFullYear()
                )
            )
        );
        if (firstResponse.total_pages > 1) {
            const remainingPages = Array.from(
                { length: firstResponse.total_pages - 1 },
                (_, i) => i + 2
            );

            for (const page of remainingPages) {
                params.set('page', page.toString());
                discoverUrl.search = params.toString();
                
                const pageResponse = await fetchTMDBDiscover(discoverUrl.toString());
                console.log(`Processing page ${page} of ${firstResponse.total_pages}`);
                
                await Promise.all(
                    pageResponse.results.map((movie: TMDBMovie) => 
                        checkBlurayReleaseDate(
                            movie.id,
                            movie.title,
                            movie.poster_path,
                            new Date(movie.release_date).getFullYear()
                        )
                    )
                );
            }
        }
    } catch (err) {
        console.error("Error checking new releases:", err);
    }
}

async function checkBlurayReleaseDate(movieId: number, title: string, posterPath: string, year: number) {
    try {
        console.log(`Checking Blu-ray release date for movie: ${title} (${year})`);
        
        const releaseDatesUrl = new URL(`${process.env.TMDB_API_URL}/movie/${movieId}/release_dates`);
        const params = new URLSearchParams({
            api_key: process.env.TMDB_API_KEY!,
        });
        releaseDatesUrl.search = params.toString();

        const releaseDatesResponse = await fetchTMDBReleaseDate(releaseDatesUrl.toString());

        console.log(`Processing release dates for: ${title} found a total of ${releaseDatesResponse?.results.length} country results`);

        let earliestReleaseDate: Date | null = null;
        
        for (const country of releaseDatesResponse.results) {
            for (const release of country.release_dates) {
                if (
                    release.type === 5 &&
                    release.note?.toLowerCase().includes("blu")
                ) {
                    const releaseDate = new Date(release.release_date);
                    if (!earliestReleaseDate || releaseDate < earliestReleaseDate) {
                        earliestReleaseDate = releaseDate;
                    }
                }
            }
        }

        if (earliestReleaseDate) {
            const hasReleased = earliestReleaseDate <= new Date();
            const result = await Movie.findOneAndUpdate(
                { tmdbId: movieId },
                {
                    tmdbId: movieId,
                    title,
                    year,
                    posterPath,
                    physicalReleaseDate: earliestReleaseDate,
                    hasReleased,
                },
                { upsert: true, new: true }
            );
            console.log(`Movie ${result.isNew ? 'created' : 'updated'}: ${title} with release date: ${earliestReleaseDate}`);
        }
    } catch (err) {
        console.error(
            `Error checking Blu-ray release date for movie ${movieId}:`,
            err
        );
    }
}

export async function checkNewTorrents() {
    try {
        // Get today's date at midnight for consistent comparison
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get all released movies
        const releasedMovies = await Movie.find({ hasReleased: true });
        
        // Get movies that have just been released (in their 10-day window)
        const tenDaysAgo = new Date(today);
        tenDaysAgo.setDate(today.getDate() - 10);
        
        const newlyReleasedMovies = await Movie.find({
            physicalReleaseDate: {
                $gte: tenDaysAgo,
                $lte: today
            }
        });

        // Combine both lists, removing duplicates by tmdbId
        const moviesToCheck = [...releasedMovies, ...newlyReleasedMovies]
            .filter((movie, index, self) => 
                index === self.findIndex(m => m.tmdbId === movie.tmdbId)
            );

        for (const movie of moviesToCheck) {
            console.log(`Searching torrents for: ${movie.title} (${movie.year})`);
            const response = await axios.get(
                `${process.env.JACKETT_URL}/api/v2.0/indexers/all/results`,
                {
                    params: {
                        apikey: process.env.JACKETT_API_KEY,
                        Query: `${movie.title} ${movie.year} remux`,
                        Category: ["2000", "2045"],
                        _: Date.now()
                    },
                }
            );

            console.log(`Found ${response.data?.Results?.length || 0} torrents`);

            const validTorrents = [];
            for (const result of response.data?.Results || []) {
                const parsedInfo = parseTorrentFilename(result.Title);
                if (parsedInfo.quality === "BluRay REMUX" && parsedInfo.resolution && parsedInfo.encode) {
                    validTorrents.push({
                        movieId: movie.tmdbId,
                        indexer: [result.Tracker],
                        resolution: parsedInfo.resolution,
                        quality: parsedInfo.quality,
                        encode: parsedInfo.encode,
                        releaseGroup: parsedInfo.releaseGroup || "Unknown",
                        size: result.Size,
                        magnetLink: result.MagnetUri || result.Link,
                        fileName: result.Title,
                        firstSeen: new Date(),
                        visualTags: parsedInfo.visualTags || [],
                        audioTags: parsedInfo.audioTags || [],
                        audioChannels: parsedInfo.audioChannels || [],
                        languages: parsedInfo.languages || [],
                    });
                }
            }

            for (const torrent of rankTorrents(validTorrents)) {
                try {
                    const existingTorrent = await Torrent.findOne({
                        movieId: torrent.movieId,
                        releaseGroup: torrent.releaseGroup,
                        resolution: torrent.resolution,
                        quality: torrent.quality,
                        encode: torrent.encode
                    });

                    if (existingTorrent) {
                        const updatedIndexers = Array.from(new Set([
                            ...(existingTorrent.indexer || []),
                            ...(torrent.indexer || [])
                        ]));
                        
                        if (updatedIndexers.length > existingTorrent.indexer.length) {
                            await Torrent.findByIdAndUpdate(existingTorrent._id, { indexer: updatedIndexers });
                        }
                    } else {
                        await Torrent.create(torrent);
                    }
                } catch (error: unknown) {
                    console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
                }
            }
        }
    } catch (err) {
        console.error("Error checking new torrents:", err);
    }
}
