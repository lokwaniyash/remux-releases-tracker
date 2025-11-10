import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { movieRoutes } from "./routes/movies.js";
import { scrapeRoutes } from "./routes/scrape.js";
import { setupCronJobs } from "./cron/index.js";

dotenv.config();

const app = express();
const port = process.env.BACKEND_PORT || 4000;

app.use(cors());
app.use(express.json());

mongoose
    .connect(process.env.MONGODB_URI as string)
    .then(async() => {
        console.log("Connected to MongoDB");
        setupCronJobs();
    })
    .catch((err) => console.error("MongoDB connection error:", err));

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});
mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});


app.use("/api/movies", movieRoutes);
app.use("/api/scrape", scrapeRoutes);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
