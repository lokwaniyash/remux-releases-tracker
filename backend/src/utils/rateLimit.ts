import pLimit from 'p-limit';
import { AxiosError } from 'axios';
import { TMDBDiscoverResponse, TMDBReleaseDateResponse } from '../types/tmdb';
const RATE_LIMIT = 40;
const RATE_LIMIT_WINDOW = 10000;
const RETRY_DELAY = 1000;
const MAX_RETRIES = 3;

const limit = pLimit(RATE_LIMIT);
function isRateLimited(error: unknown): boolean {
    if (error instanceof AxiosError) {
        return error.response?.status === 429;
    }
    if (error instanceof Response) {
        return error.status === 429;
    }
    return false;
}
export async function withRateLimit<T>(fn: () => Promise<T>): Promise<T> {
    let retries = 0;
    
    while (retries < MAX_RETRIES) {
        try {
            return await limit(fn);
        } catch (error) {
            if (isRateLimited(error)) {
                retries++;
                console.log(`Rate limited, attempt ${retries} of ${MAX_RETRIES}. Waiting ${RETRY_DELAY}ms...`);
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
                continue;
            }
            throw error;
        }
    }
    
    throw new Error('Max retries exceeded for rate limited request');
}
export async function fetchTMDBApi<T>(url: string, options: RequestInit = {}): Promise<T> {
    return withRateLimit(async () => {
        const response = await fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw response;
        }

        return response.json() as Promise<T>;
    });
}
export function fetchTMDBDiscover(url: string, options?: RequestInit): Promise<TMDBDiscoverResponse> {
    return fetchTMDBApi<TMDBDiscoverResponse>(url, options);
}

export function fetchTMDBReleaseDate(url: string, options?: RequestInit): Promise<TMDBReleaseDateResponse> {
    return fetchTMDBApi<TMDBReleaseDateResponse>(url, options);
}