import express from "express";
import "dotenv/config";
import cors from "cors";
import job from "./lib/cron.js";

import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";

import { connectDB } from "./lib/db.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Cron Job 시작 (환경 변수로 제어 가능)
// .env 파일에 ENABLE_CRON=true 설정 시에만 활성화
job.start();
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
  connectDB();
});
