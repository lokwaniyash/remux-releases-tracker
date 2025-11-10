import express from 'express';
import { checkNewReleases, checkNewTorrents } from '../cron/index.js';
import { DateRange } from '../types/date.js';
import { Movie } from '../models/Movie.js';

const router = express.Router();

router.post('/year/:year', async (req, res) => {
    try {
        const year = parseInt(req.params.year);
        if (isNaN(year) || year < 1900 || year > 2100) {
            return res.status(400).json({ error: 'Invalid year' });
        }

        const dateRange: DateRange = {
            startDate: `${year}-01-01`,
            endDate: `${year}-12-31`
        };
        
        console.log(`Starting scrape for year ${year}`);

        const scrapedMovieIds = await checkNewReleases(dateRange);
        
        console.log(`Scrape for year ${year} found ${scrapedMovieIds.length} movies`);

        const moviesToCheckForTorrents = await Movie.find({
            tmdbId: { $in: scrapedMovieIds }
        });
        
        await checkNewTorrents(moviesToCheckForTorrents);

        res.json({ message: `Started scraping for year ${year}` });
    } catch (error) {
        console.error('Error in scrape route:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export const scrapeRoutes = router;