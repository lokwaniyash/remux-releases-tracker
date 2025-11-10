export type Resolution = "2160p" | "1080p" | "720p" | "480p";
export type Quality =
    | "BluRay REMUX"
    | "BluRay"
    | "WEB-DL"
    | "WEBRip"
    | "HDRip"
    | "DVDRip"
    | "HDTV"
    | "CAM"
    | "TS"
    | "TC";
export type Encode = "HEVC" | "AVC" | "AV1" | "XviD" | "DivX";
export type VisualTag = "HDR10+" | "HDR10" | "HDR" | "DV" | "10bit";

export interface Torrent {
    movieId: number;
    indexer: string[];
    fileName: string;
    quality?: Quality;
    resolution?: Resolution;
    source?: Quality;
    encode?: Encode;
    releaseGroup: string;
    size: number;
    magnetLink: string;
    firstSeen: string;
    visualTags: VisualTag[];
    audioTags: string[];
    audioChannels: string[];
    languages: string[];
    rank?: number;
    createdAt: string;
    updatedAt: string;
}
