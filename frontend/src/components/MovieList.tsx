import { useState, useMemo } from "react";
import Link from "next/link";
import { Movie } from "../types/movie";

interface MovieListProps {
    movies: Movie[];
}

type SortField = "title" | "year" | "physicalReleaseDate";
type SortOrder = "asc" | "desc";

export default function MovieList({ movies }: MovieListProps) {
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [sortField, setSortField] = useState<SortField>(
        "physicalReleaseDate"
    );
    const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
    const itemsPerPage = 20;

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const filteredAndSortedMovies = useMemo(() => {
        return movies
            .filter(
                (movie) =>
                    movie.title.toLowerCase().includes(search.toLowerCase()) ||
                    movie.year.toString().includes(search)
            )
            .sort((a, b) => {
                if (sortField === "title") {
                    return sortOrder === "asc"
                        ? a.title.localeCompare(b.title)
                        : b.title.localeCompare(a.title);
                }
                if (sortField === "year") {
                    return sortOrder === "asc"
                        ? a.year - b.year
                        : b.year - a.year;
                }
                return sortOrder === "asc"
                    ? new Date(a.physicalReleaseDate).getTime() -
                          new Date(b.physicalReleaseDate).getTime()
                    : new Date(b.physicalReleaseDate).getTime() -
                          new Date(a.physicalReleaseDate).getTime();
            });
    }, [movies, search, sortField, sortOrder]);

    const totalPages = Math.ceil(filteredAndSortedMovies.length / itemsPerPage);
    const paginatedMovies = filteredAndSortedMovies.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortOrder("asc");
        }
    };

    if (!movies || movies.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-gray-400">
                <p className="text-xl">No movies found</p>
                <p className="mt-2">Check back later for new releases</p>
            </div>
        );
    }

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field)
            return <span className="text-gray-500">↕</span>;
        return sortOrder === "asc" ? <span>↑</span> : <span>↓</span>;
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Search */}
            <div className="mb-6">
                <div className="flex items-center max-w-md bg-gray-800 rounded-lg px-3 py-2">
                    <svg
                        className="w-5 h-5 text-gray-400 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setCurrentPage(1);
                        }}
                        placeholder="Search movies..."
                        className="w-full bg-transparent focus:outline-none text-gray-100"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto bg-gray-900 rounded-lg shadow">
                <table className="min-w-full">
                    <thead>
                        <tr className="border-b border-gray-800">
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-400 cursor-pointer hover:text-white"
                                onClick={() => handleSort("title")}
                            >
                                Title <SortIcon field="title" />
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-400 cursor-pointer hover:text-white"
                                onClick={() => handleSort("year")}
                            >
                                Year <SortIcon field="year" />
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-400 cursor-pointer hover:text-white"
                                onClick={() =>
                                    handleSort("physicalReleaseDate")
                                }
                            >
                                Release Date{" "}
                                <SortIcon field="physicalReleaseDate" />
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400">
                                Best Release
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedMovies.map((movie) => (
                            <tr
                                key={movie.tmdbId}
                                className="border-b border-gray-800 hover:bg-gray-800 transition-colors"
                            >
                                <td className="px-6 py-4">
                                    <Link
                                        href={`/movie/${movie.tmdbId}`}
                                        className="text-white hover:text-blue-400 transition-colors"
                                    >
                                        {movie.title}
                                    </Link>
                                </td>
                                <td className="px-6 py-4 text-gray-300">
                                    {movie.year}
                                </td>
                                <td className="px-6 py-4 text-gray-300">
                                    {formatDate(movie.physicalReleaseDate)}
                                </td>
                                <td className="px-6 py-4">
                                    {movie.bestReleaseGroup ? (
                                        <span className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded text-sm">
                                            {movie.bestReleaseGroup}
                                        </span>
                                    ) : (
                                        <span className="text-gray-500 text-sm">
                                            —
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() =>
                                setCurrentPage((p) => Math.max(1, p - 1))
                            }
                            disabled={currentPage === 1}
                            className="px-3 py-1 bg-gray-800 rounded disabled:opacity-50 hover:bg-gray-700 transition-colors"
                        >
                            Previous
                        </button>
                        <span className="text-gray-400">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() =>
                                setCurrentPage((p) =>
                                    Math.min(totalPages, p + 1)
                                )
                            }
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 bg-gray-800 rounded disabled:opacity-50 hover:bg-gray-700 transition-colors"
                        >
                            Next
                        </button>
                    </div>
                    <div className="text-sm text-gray-400">
                        {filteredAndSortedMovies.length} movies total
                    </div>
                </div>
            )}
        </div>
    );
}
