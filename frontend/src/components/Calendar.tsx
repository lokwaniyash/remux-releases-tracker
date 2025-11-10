import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { Movie } from "../types/movie";

interface CalendarProps {
    releases: Movie[];
}

export default function Calendar({ releases }: CalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const getReleasesForDate = (date: Date) => {
        return releases.filter((release) => {
            const releaseDate = new Date(release.physicalReleaseDate);
            return (
                releaseDate.getDate() === date.getDate() &&
                releaseDate.getMonth() === date.getMonth() &&
                releaseDate.getFullYear() === date.getFullYear()
            );
        });
    };

    const nextMonth = () => {
        setCurrentMonth(
            new Date(currentMonth.setMonth(currentMonth.getMonth() + 1))
        );
    };

    const prevMonth = () => {
        setCurrentMonth(
            new Date(currentMonth.setMonth(currentMonth.getMonth() - 1))
        );
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
                <div className="mb-4 flex justify-between items-center">
                    <h2 className="text-xl font-semibold">
                        {format(currentMonth, "MMMM yyyy")}
                    </h2>
                    <div className="flex gap-2">
                        <button
                            onClick={prevMonth}
                            className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600"
                        >
                            Previous
                        </button>
                        <button
                            onClick={nextMonth}
                            className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600"
                        >
                            Next
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-7 gap-1">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                        (day) => (
                            <div
                                key={day}
                                className="p-2 text-center font-medium"
                            >
                                {day}
                            </div>
                        )
                    )}
                    {monthDays.map((day) => {
                        const dayReleases = getReleasesForDate(day);
                        return (
                            <button
                                key={day.toISOString()}
                                onClick={() => setSelectedDate(day)}
                                className={`p-2 text-center rounded hover:bg-gray-700 relative ${
                                    dayReleases.length > 0
                                        ? "bg-blue-500 bg-opacity-20"
                                        : ""
                                } ${
                                    selectedDate?.toDateString() ===
                                    day.toDateString()
                                        ? "ring-2 ring-blue-500"
                                        : ""
                                }`}
                            >
                                {format(day, "d")}
                                {dayReleases.length > 0 && (
                                    <span className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-full"></span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="md:col-span-1">
                <h3 className="text-lg font-medium mb-4">
                    {selectedDate
                        ? `Releases for ${format(selectedDate, "MMMM d, yyyy")}`
                        : "Select a date"}
                </h3>
                {selectedDate && (
                    <div className="space-y-4">
                        {getReleasesForDate(selectedDate).map((release) => (
                            <div
                                key={release.tmdbId}
                                className="p-4 bg-gray-800 rounded-lg"
                            >
                                <h4 className="font-medium">{release.title}</h4>
                                <p className="text-sm text-gray-400">
                                    {release.year}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
