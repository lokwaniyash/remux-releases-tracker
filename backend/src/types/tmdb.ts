export interface TMDBMovie {
    id: number;
    title: string;
    poster_path: string;
    release_date: string;
}

export interface TMDBDiscoverResponse {
    results: TMDBMovie[];
    page: number;
    total_pages: number;
    total_results: number;
}

export interface TMDBReleaseDateResponse {
    id: number;
    results: {
        iso_3166_1: string; 
        release_dates: {
            certification: string;
            iso_639_1: string; 
            note: string;
            release_date: string;
            type: number;
        }[];
    }[];
}