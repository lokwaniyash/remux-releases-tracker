# Bluray Releases Tracker

A web application to track Blu-ray releases and their available torrents on private/public trackers.

## Features

- Track movie Blu-ray releases
- View available torrents from different sources
- Calendar view for upcoming releases
- Quality comparison and ranking system
- Magnet link support
- Multi-indexer search through Prowlarr

## Tech Stack

- Frontend: Next.js with TypeScript and Tailwind CSS
- Backend: Node.js/Express with TypeScript
- Database: MongoDB
- Integration: TMDB API, Prowlarr API
- Containerization: Docker

## Setup

1. Clone the repository
2. Copy `.env.example` to `.env` and fill in the required values
3. Run `docker-compose up --build`

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:4000

## Environment Variables

```env
# Frontend
FRONTEND_PORT=3000
NEXT_PUBLIC_API_URL=http://localhost:4000

# Backend
BACKEND_PORT=4000
TMDB_API_KEY=your_tmdb_api_key
PROWLARR_API_KEY=your_prowlarr_api_key
PROWLARR_URL=http://localhost:9696

# MongoDB
MONGO_PORT=27017
MONGODB_URI=mongodb://username:password@localhost:27017/blurays?authSource=admin
MONGO_USERNAME=username
MONGO_PASSWORD=password
```

## Development

1. Install dependencies:
   ```bash
   # Frontend
   cd frontend
   npm install

   # Backend
   cd backend
   npm install
   ```

2. Run in development mode:
   ```bash
   # Frontend
   npm run dev

   # Backend
   npm run dev
   ```

## Build

```bash
# Build and run with Docker
docker-compose up --build
```

## License

MIT