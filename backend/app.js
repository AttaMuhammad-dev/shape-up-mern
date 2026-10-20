import path from "path";
import { fileURLToPath } from "node:url";
import { existsSync } from 'node:fs';
import { rateLimit } from 'express-rate-limit';
import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cookieParser from "cookie-parser";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import connectDB from "./config/db.js";
import cors from "cors"; 

const port = process.env.PORT || 9000;

// Import Routes
import userRoutes from "./routes/userRoutes.js";
import userStatusRoutes from "./routes/userStatusRoutes.js";
import UserMealPlanRoutes from "./routes/UserMealPlanRoutes.js";
import workoutRoutes from "./routes/workoutRoutes.js"; 
import dailyLogRoutes from "./routes/dailyLogRoutes.js";
import reminderRoutes from "./routes/reminderRoutes.js"; 
import aiRoutes from "./routes/aiRoutes.js"; 
import emailRoutes from "./routes/emailRoutes.js"; 
import {emailReady} from './services/emailService.js';
import reviewRoutes from "./routes/reviewRoutes.js"; // <--- 1. IMPORT THIS

const app = express();
app.set('trust proxy', process.env.TRUST_PROXY === '1' ? 1 : false);

// ✅ CORS CONFIGURATION
app.use(cors({
    origin: [
        "http://localhost:3000",
        ...(process.env.ALLOWED_ORIGINS || '').split(',').map(value => value.trim()).filter(Boolean)
    ], 
    credentials: true
}));

app.use(express.json({ limit: '256kb' }));
app.use(express.urlencoded({ extended: true, limit: '256kb' }));
app.use(cookieParser());
app.use('/api',(req,res,next)=>{
  res.set('Cache-Control','no-store');
  if(['POST','PUT','PATCH','DELETE'].includes(req.method)&&req.body!==undefined&&(!req.body||typeof req.body!=='object'||Array.isArray(req.body)))return res.status(400).json({message:'Send a valid JSON object.'});
  next();
});
app.disable('x-powered-by');
app.use('/api', rateLimit({
    windowMs: 60_000, limit: 120, standardHeaders: 'draft-8', legacyHeaders: false,
    skip: req => req.path === '/health',
    message: { message: 'Too many requests. Please try again shortly.' },
}));
const authLimiter = rateLimit({
    windowMs: 15 * 60_000, limit: 20, standardHeaders: 'draft-8', legacyHeaders: false,
    message: { message: 'Too many sign-in attempts. Please try again later.' },
});
app.post(['/api/users', '/api/users/auth'], authLimiter);

app.get('/api/health', (req, res) => {res.set('Cache-Control','no-store');res.json({ status: 'ok', version:'workflow-finalization-20261020', databaseConfigured: Boolean(process.env.MONGO_URI), aiConfigured: process.env.AI_ENABLED === 'true' && Boolean(process.env.GEMINI_API_KEY?.trim()), emailEnabled:emailReady() });});
app.use('/api/ai',rateLimit({windowMs:60_000,limit:20,standardHeaders:'draft-8',legacyHeaders:false,message:{code:'RATE_LIMITED',reply:'Please wait a minute before asking the AI again. The other fitness tools remain available.'}}));

// Mount Routes
app.use("/api/users", userRoutes);
app.use("/api/user", userStatusRoutes);
app.use("/api/user", UserMealPlanRoutes);
app.use("/api/workouts", workoutRoutes);
app.use("/api/daily-logs", dailyLogRoutes);
app.use("/api/reminders", reminderRoutes); 
app.use("/api/ai", aiRoutes); 
app.use("/api/support", emailRoutes);
app.use("/api/reviews", reviewRoutes); // <--- 2. ADD THIS ROUTE

// Serve the React build on the same origin for the free Render demo.
const frontendBuild = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../frontend/build');
if (process.env.SERVE_FRONTEND === 'true' && existsSync(path.join(frontendBuild, 'index.html'))) {
    app.use(express.static(frontendBuild));
    app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api/')) return next();
        res.sendFile(path.join(frontendBuild, 'index.html'));
    });
} else {
    app.get('/', (req, res) => res.send('API is running...'));
}

// Error Middleware
app.use(notFound);
app.use(errorHandler);

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
    connectDB().then(() => app.listen(port, () => console.log(`Server started on port ${port}`)))
      .catch(() => { console.error('Database connection failed. Check MONGO_URI.'); process.exitCode = 1; });
}

export default app;
