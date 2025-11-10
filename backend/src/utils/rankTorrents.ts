import {
    ParsedTorrent,
    Resolution,
    Quality,
    Encode,
    VisualTag,
} from "../types/torrent.js";

type RankingPoints = {
    resolution: Record<Resolution, number>;
    quality: Record<Quality, number>;
    encodes: Record<Encode, number>;
    visualTags: Record<VisualTag, number>;
};

export function rankTorrents(
    torrents: ParsedTorrent[]
): (ParsedTorrent & { rank: number })[] {
    const rankingPoints: RankingPoints = {
        resolution: {
            "2160p": 4,
            "1080p": 3,
            "720p": 2,
            "480p": 1,
        },
        quality: {
            "BluRay REMUX": 7,
            BluRay: 6,
            "WEB-DL": 5,
            WEBRip: 4,
            HDRip: 3,
            DVDRip: 2,
            HDTV: 2,
            CAM: 1,
            TS: 1,
            TC: 1,
        },
        encodes: {
            HEVC: 3,
            AVC: 2,
            AV1: 3,
            XviD: 1,
            DivX: 1,
        },
        visualTags: {
            "HDR10+": 4,
            HDR10: 3,
            HDR: 2,
            DV: 4,
            "10bit": 1,
        },
    };

    const torrentsWithRank = torrents.map((torrent) => {
        let points = 0;
        if (
            torrent.resolution &&
            torrent.resolution in rankingPoints.resolution
        ) {
            points += rankingPoints.resolution[torrent.resolution];
        }
        if (torrent.quality && torrent.quality in rankingPoints.quality) {
            points += rankingPoints.quality[torrent.quality];
        }
        if (torrent.encode && torrent.encode in rankingPoints.encodes) {
            points += rankingPoints.encodes[torrent.encode];
        }
        if (torrent.visualTags) {
            points += torrent.visualTags.reduce((sum, tag) => {
                if (tag in rankingPoints.visualTags) {
                    return sum + rankingPoints.visualTags[tag];
                }
                return sum;
            }, 0);
        }
        return {
            ...torrent,
            rank: points,
        };
    });

    return torrentsWithRank.sort((a, b) => b.rank - a.rank);
}
