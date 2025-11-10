import { useEffect, useState } from 'react';
import Calendar from '../components/Calendar';
import { Movie } from '../types/movie';

export default function CalendarPage() {
  const [upcomingReleases, setUpcomingReleases] = useState<Movie[]>([]);

  useEffect(() => {
    const fetchUpcomingReleases = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/movies/calendar/upcoming`);
        const data = await response.json();
        setUpcomingReleases(data);
      } catch (error) {
        console.error('Error fetching upcoming releases:', error);
      }
    };

    fetchUpcomingReleases();
  }, []);

  return (
    <main className="container mx-auto px-4 py-8">
      <Calendar releases={upcomingReleases} />
    </main>
  );
}