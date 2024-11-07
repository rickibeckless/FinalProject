// server/server.js

import express from 'express';
import './config/dotenv.js';
import cors from 'cors';
import { defaultRoutes, userRoutes, challengeRoutes, submissionRoutes } from './routes/data.js';
import { authSession, passport } from './middleware/auth.js';

const PORT = process.env.PORT || 8080;
const app = express();

app.use(cors());
app.use(express.json());
app.use(authSession);
app.use(passport.initialize());
app.use(passport.session());

app.use('/api/admin/default', defaultRoutes);
app.use('/api/users', userRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/submissions', submissionRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on 'http://localhost:${PORT}'`);
});