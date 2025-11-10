import { ParsedTorrent, Resolution, Quality, Encode, VisualTag } from '../types/torrent.js';

type RankingPoints = {
  resolution: Record<Resolution, number>;
  quality: Record<Quality, number>;
  encodes: Record<Encode, number>;
  visualTags: Record<VisualTag, number>;
};

export function rankTorrents(torrents: ParsedTorrent[]): ParsedTorrent[] {
  const rankingPoints: RankingPoints = {
    resolution: {
      '2160p': 4,
      '1080p': 3,
      '720p': 2,
      '480p': 1
    },
    quality: {
      'BluRay REMUX': 7,
      'BluRay': 6,
      'WEB-DL': 5,
      'WEBRip': 4,
      'HDRip': 3,
      'DVDRip': 2,
      'HDTV': 2,
      'CAM': 1,
      'TS': 1,
      'TC': 1
    },
    encodes: {
      'HEVC': 3,
      'AVC': 2,
      'AV1': 3,
      'XviD': 1,
      'DivX': 1
    },
    visualTags: {
      'HDR10+': 4,
      'HDR10': 3,
      'HDR': 2,
      'DV': 4,
      '10bit': 1
    }
  };

  return torrents.sort((a, b) => {
    let aPoints = 0;
    let bPoints = 0;
    if (a.resolution && a.resolution in rankingPoints.resolution) {
      aPoints += rankingPoints.resolution[a.resolution];
    }
    if (b.resolution && b.resolution in rankingPoints.resolution) {
      bPoints += rankingPoints.resolution[b.resolution];
    }
    if (a.source && a.source in rankingPoints.quality) {
      aPoints += rankingPoints.quality[a.source];
    }
    if (b.source && b.source in rankingPoints.quality) {
      bPoints += rankingPoints.quality[b.source];
    }
    if (a.encode && a.encode in rankingPoints.encodes) {
      aPoints += rankingPoints.encodes[a.encode];
    }
    if (b.encode && b.encode in rankingPoints.encodes) {
      bPoints += rankingPoints.encodes[b.encode];
    }
    if (a.visualTags) {
      aPoints += a.visualTags.reduce((sum, tag) => {
        if (tag in rankingPoints.visualTags) {
          return sum + rankingPoints.visualTags[tag];
        }
        return sum;
      }, 0);
    }
    if (b.visualTags) {
      bPoints += b.visualTags.reduce((sum, tag) => {
        if (tag in rankingPoints.visualTags) {
          return sum + rankingPoints.visualTags[tag];
        }
        return sum;
      }, 0);
    }

    return bPoints - aPoints;
  });
}