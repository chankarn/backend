import { Injectable } from '@nestjs/common';
import axios from 'axios';

type GenreMap = Record<number, string>;

@Injectable()
export class VideosService {
  private readonly TMDB_BASE_URL = 'https://api.themoviedb.org/3';
  private readonly TMDB_AUTH_TOKEN =
    'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzNDZiYjliOTI5YWM4ZTk3OTdkNDNhMDJjZTYyMTA5YiIsIm5iZiI6MTc1MzEyNTI3MS41MTEwMDAyLCJzdWIiOiI2ODdlOTE5NzI3NGIwOTFmNzY1MjkwYmUiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.RT6hRs0TkdZ1-Dzqv0HKGcmd86JaHO--VN-WFVXHRmA';

  private get headers() {
    return {
      accept: 'application/json',
      Authorization: this.TMDB_AUTH_TOKEN,
    };
  }

  private async getGenreMap(): Promise<GenreMap> {
    const url = `${this.TMDB_BASE_URL}/genre/movie/list`;

    try {
      const response = await axios.get(url, { headers: this.headers });
      const genres = response.data.genres; // [{ id: 28, name: 'Action' }, ...]

      const map: GenreMap = {};
      for (const g of genres) {
        map[g.id] = g.name;
      }

      return map;
    } catch (error) {
      console.error('🔥 Failed to fetch genres:', error.message);
      return {};
    }
  }

  async discoverMovies(page = 1) {
    const url = `${this.TMDB_BASE_URL}/discover/movie?include_adult=false&include_video=false&language=en-US&page=${page}&sort_by=popularity.desc`;

    try {
      const [genreMap, response] = await Promise.all([
        this.getGenreMap(),
        axios.get(url, { headers: this.headers }),
      ]);

      return response.data.results.map((movie) => ({
        id: movie.id,
        title: movie.title,
        description: movie.overview,
        backdrop: movie.backdrop_path
          ? `https://image.tmdb.org/t/p/w500${movie.backdrop_path}`
          : null,
        thumbnail: movie.poster_path
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
          : null,
        genre: movie.genre_ids
          .map((id: number) => genreMap[id] || 'Unknown')
          .join(', '),
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(
          movie.title + ' trailer',
        )}`,
      }));
    } catch (error) {
      console.error('🔥 Failed to fetch movies:', error.message);
      throw error;
    }
  }
}
