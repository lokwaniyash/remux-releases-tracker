import { useState } from "react";
import { Torrent } from "../types/torrent";
import { Movie } from "../types/movie";
import Image from "next/image";

interface MovieDetailsProps {
    movie: Movie;
    torrents: Torrent[];
}

export default function MovieDetails({ movie, torrents }: MovieDetailsProps) {
    const [expandedLinks, setExpandedLinks] = useState<{ [key: string]: boolean }>({});

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString();
    };

    const formatSize = (bytes: number) => {
        const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
        if (bytes === 0) return "0 Byte";
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i)) + " " + sizes[i];
    };

    // Use a unique key for each torrent card (movieId-releaseGroup-index)
    const toggleLinksExpanded = (key: string) => {
        setExpandedLinks((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };


    const sortedTorrents = [...torrents].sort((a, b) => {
        const rankA = a.rank || 0;
        const rankB = b.rank || 0;
        return rankB - rankA;
    });

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 flex gap-8">
            {/* Sticky Poster on Left */}
            <div className="hidden md:block md:w-1/4 flex-shrink-0">
                <div className="sticky top-8 rounded-lg border border-gray-400">
                    {movie.posterPath ? (
                        <Image
                            src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`}
                            alt={movie.title}
                            width={300}
                            height={450}
                            className="rounded-lg w-full"
                        />
                    ) : (
                        <div className="w-full aspect-[2/3] bg-gray-800 rounded-lg flex items-center justify-center">
                            <span className="text-gray-300">
                                No poster available
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Content */}
            <div className="flex-1">
                {/* Movie Info */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between md:gap-4 mb-4">
                        <h1 className="text-3xl font-bold text-gray-100">
                            {movie.title} ({movie.year})
                        </h1>
                        <a
                            href={`https://www.themoviedb.org/movie/${movie.tmdbId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-blue-300 transition-colors whitespace-nowrap"
                        >
                            View on TMDB
                        </a>
                    </div>
                    <p className="text-lg text-gray-400">
                        Physical Release Date:{" "}
                        {formatDate(movie.physicalReleaseDate)}
                    </p>
                </div>

                {/* Mobile Poster */}
                <div className="md:hidden mb-8 rounded-lg border border-gray-400 w-1/2">
                    {movie.posterPath ? (
                        <Image
                            src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`}
                            alt={movie.title}
                            width={300}
                            height={450}
                            className="rounded-lg w-full"
                        />
                    ) : (
                        <div className="w-full aspect-[2/3] bg-gray-800 rounded-lg flex items-center justify-center">
                            <span className="text-gray-300">
                                No poster available
                            </span>
                        </div>
                    )}
                </div>

                {/* Torrents */}
                <div className="bg-gray-900 rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-6 text-gray-200">
                        Available Releases
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4">
                        {sortedTorrents.map((torrent, idx) => {
                            const cardKey = `${torrent.movieId}-${torrent.releaseGroup}-${idx}`;
                            return (
                                <div
                                    key={cardKey}
                                    className="bg-gray-800 rounded-lg p-4 border border-gray-700 flex flex-col relative"
                                >
                                <div className="flex-1">
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex items-center justify-between gap-2">
                                                <h3 className="font-medium text-lg break-all">
                                                    {torrent.releaseGroup}
                                                </h3>
                                                {torrent.rank !== undefined && (
                                                    <span className="px-2 py-1 bg-gray-400/10 text-gray-300 border border-gray-400/20 rounded text-xs font-semibold">
                                                        Rank: {torrent.rank}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-400 mt-1 break-all">
                                                {torrent.fileName}
                                            </p>
                                        </div>

                                        <div className="space-y-1.5">
                                            {torrent.resolution && (
                                                <p className="text-sm">
                                                    <span className="text-gray-400">
                                                        Resolution:
                                                    </span>{" "}
                                                    <span className="text-gray-300">
                                                        {torrent.resolution}
                                                    </span>
                                                </p>
                                            )}
                                            {torrent.encode && (
                                                <p className="text-sm">
                                                    <span className="text-gray-400">
                                                        Codec:
                                                    </span>{" "}
                                                    <span className="text-gray-300">
                                                        {torrent.encode}
                                                    </span>
                                                </p>
                                            )}
                                            <p className="text-sm">
                                                <span className="text-gray-400">
                                                    Size:
                                                </span>{" "}
                                                <span className="text-gray-300">
                                                    {formatSize(torrent.size)}
                                                </span>
                                            </p>
                                        </div>

                                        {/* Visual Features */}
                                        {torrent.visualTags.length > 0 && (
                                            <div>
                                                <h4 className="text-xs font-medium text-gray-400 mb-1.5">
                                                    Video Features
                                                </h4>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {torrent.visualTags.map(
                                                        (tag) => (
                                                            <span
                                                                key={tag}
                                                                className="px-1.5 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded text-xs"
                                                            >
                                                                {tag}
                                                            </span>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Audio Features */}
                                        {(torrent.audioTags.length > 0 ||
                                            torrent.audioChannels.length > 0) && (
                                            <div>
                                                <h4 className="text-xs font-medium text-gray-400 mb-1.5">
                                                    Audio Features
                                                </h4>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {torrent.audioTags.map(
                                                        (tag) => (
                                                            <span
                                                                key={tag}
                                                                className="px-1.5 py-0.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded text-xs"
                                                            >
                                                                {tag}
                                                            </span>
                                                        )
                                                    )}
                                                    {torrent.audioChannels.map(
                                                        (channel) => (
                                                            <span
                                                                key={channel}
                                                                className="px-1.5 py-0.5 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded text-xs"
                                                            >
                                                                {channel}
                                                            </span>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Bottom Actions */}
                                <div className="mt-4 pt-4 border-t border-gray-700 relative">
                                    {/* Hide buttons and indexers when links are expanded */}
                                    <div className={`flex items-center justify-between gap-2 transition-opacity duration-200 ${expandedLinks[cardKey] && torrent.links.length > 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}> 
                                        <div className="flex items-center gap-2">
                                            {torrent.magnetLink && (
                                                <a
                                                    href={torrent.magnetLink}
                                                    className="text-xl hover:opacity-80 transition-opacity"
                                                    title="Download Magnet"
                                                >
                                                    🧲
                                                </a>
                                            )}
                                            {torrent.links.length > 0 && (
                                                <button
                                                    onClick={() => toggleLinksExpanded(cardKey)}
                                                    className="text-xl hover:opacity-80 transition-opacity"
                                                    title="View Links"
                                                >
                                                    🔗
                                                </button>
                                            )}
                                        </div>
                                        <div
                                            className="text-xs text-gray-400 truncate"
                                            title={torrent.indexer.join(", ")}
                                        >
                                            {torrent.indexer.join(", ")}
                                        </div>
                                    </div>
                                    {/* Animated links section, overlays bottom actions fully */}
                                    <div
                                        className={`overflow-hidden transition-all duration-300 ease-in-out w-full left-0 ${expandedLinks[cardKey] && torrent.links.length > 0 ? 'absolute bottom-0 bg-gray-800 shadow-lg z-10 border-t border-gray-600 pt-3 mt-3 max-h-60 opacity-100 space-y-2' : 'absolute bottom-0 max-h-0 opacity-0'} `}
                                        style={{ minHeight: expandedLinks[cardKey] && torrent.links.length > 0 ? undefined : 0 }}
                                    >
                                        {expandedLinks[cardKey] && torrent.links.length > 0 && (
                                            <div className="p-4 relative">
                                                {/* Close button top right */}
                                                <button
                                                    onClick={() => toggleLinksExpanded(cardKey)}
                                                    className="absolute top-2 right-2 text-gray-400 hover:text-red-400 text-lg font-bold focus:outline-none"
                                                    title="Close"
                                                >
                                                    ×
                                                </button>
                                                <div className="mb-2"></div>
                                                {torrent.links.map((link, idx) => (
                                                    <a
                                                        key={idx}
                                                        href={link.guid}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-2 text-gray-400 hover:text-blue-300 transition-colors whitespace-nowrap truncate"
                                                    >
                                                        <span className="flex-shrink-0">🔗</span>
                                                        <span className="truncate">{link.indexer}</span>
                                                    </a>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                );
            })}
                    </div>
                </div>
            </div>
        </div>
    );
}
