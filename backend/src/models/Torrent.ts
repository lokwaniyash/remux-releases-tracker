import { Schema, model, Document } from "mongoose";

interface ITorrent extends Document {
    movieId: number;
    indexer: string[];
    resolution: string;   
    quality: string;      
    encode: string;        
    releaseGroup: string;
    size: number;
    magnetLink: string;
    fileName: string;   
    firstSeen: Date;
    visualTags: string[];
    audioTags: string[];
    audioChannels: string[];
    languages: string[];
    createdAt: Date;
    updatedAt: Date;
}

const TorrentSchema = new Schema<ITorrent>(
    {
        movieId: { type: Number, required: true, index: true },
        indexer: [{ type: String, required: true }],
        resolution: { type: String, required: true }, 
        quality: { type: String, required: true },    
        encode: { type: String, required: true },      
        releaseGroup: { type: String, required: true },
        size: { type: Number, required: true },
        magnetLink: { type: String, required: true },
        fileName: { type: String, required: true },
        firstSeen: { type: Date, required: true },
        visualTags: [{ type: String }],
        audioTags: [{ type: String }],
        audioChannels: [{ type: String }],
        languages: [{ type: String }],
    },
    {
        timestamps: true,
    }
);
TorrentSchema.index(
    { movieId: 1, releaseGroup: 1, resolution: 1, quality: 1, encode: 1 },
    { name: 'torrent_match_index' }
);

export const Torrent = model<ITorrent>("Torrent", TorrentSchema, "torrents");
