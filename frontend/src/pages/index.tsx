import { useEffect, useState } from 'react';
import MovieList from '../components/MovieList';
import { Movie } from '../types/movie';

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(`/api/movies`);
        if (!response.ok) throw new Error('Failed to fetch movies');
        const data = await response.json();
        setMovies(data);
      } catch (error) {
        console.error('Error fetching movies:', error);
        setError(error instanceof Error ? error.message : 'Failed to load movies');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovies();
  }, []);

  return (
    <main className="container mx-auto px-4 py-8">

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-700 border-t-blue-500" />
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400">
          <p>{error}</p>
        </div>
      ) : (
        <MovieList movies={movies} />
      )}
    </main>
  );
}