import express from 'express';
import './config/dotenv.js';
import cors from 'cors';
import "./config/dotenv.js";
import { 
    defaultRoutes, 
    userRoutes, 
    challengeRoutes, 
    submissionRoutes,
    commentRoutes,
    upvoteRoutes,
    notificationRoutes
} from './routes/data.js';
import { authSession, passport } from './middleware/auth.js';

const PORT = process.env.PORT || 8080;
const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
}));
app.use(express.json());
app.use(authSession);
app.use(passport.initialize());
app.use(passport.session());

app.use('/api/admin/default', defaultRoutes);
app.use('/api/users', userRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/upvotes', upvoteRoutes);
app.use('/api/notifications', notificationRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on 'http://localhost:${PORT}'`);
});