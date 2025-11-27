import express from 'express';
import session from 'express-session';
import passport from 'passport';
import cors from 'cors';
import { loadEnv } from './config/env';
import { configurePassport } from './auth/passport';
import { registerRoutes } from './routes';
import { errorHandler } from './middleware/errorHandler';

const env = loadEnv();

export const app = express();

app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true
}));

app.use(express.json({ limit: '5mb' }));

app.use(session({
  secret: env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: env.NODE_ENV === 'production',
    httpOnly: true
  }
}));

app.use(passport.initialize());
app.use(passport.session());

configurePassport();

registerRoutes(app);

app.use(errorHandler);
