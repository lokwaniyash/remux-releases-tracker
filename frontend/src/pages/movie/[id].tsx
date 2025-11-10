import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import MovieDetails from '../../components/MovieDetails';
import { Movie } from '../../types/movie';
import { Torrent } from '../../types/torrent';

interface MovieWithTorrents {
  movie: Movie;
  torrents: Torrent[];
}

export default function MoviePage() {
  const router = useRouter();
  const { id } = router.query;
  const [data, setData] = useState<MovieWithTorrents | null>(null);

  useEffect(() => {
    const fetchMovie = async () => {
      if (!id) return;
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/movies/${id}`);
        const movieData = await response.json();
        setData(movieData);
      } catch (error) {
        console.error('Error fetching movie:', error);
      }
    };

    fetchMovie();
  }, [id]);

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <MovieDetails movie={data.movie} torrents={data.torrents} />
    </div>
  );
}