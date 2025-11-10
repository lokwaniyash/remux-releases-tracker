export interface Movie {
    tmdbId: number;
    title: string;
    year: number;
    physicalReleaseDate: string;
    hasReleased: boolean;
    posterPath?: string;
    createdAt: string;
    updatedAt: string;
}
