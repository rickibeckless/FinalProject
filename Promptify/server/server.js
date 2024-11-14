import express from 'express';
import './config/dotenv.js';
import cors from 'cors';
import { Server } from 'socket.io';
import http from 'http';
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
const server = http.createServer(app);

export const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL,
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('send-notification', (data) => {
        console.log(data);
        io.emit('receive-notification', data);
    });

    socket.on('send-challenge', (data) => {
        console.log(data);
        io.emit('receive-challenge', data);
    });

    socket.on('send-submission', (data) => {
        console.log(data);
        io.emit('receive-submission', data);
    });

    socket.on('send-upvote', (data) => {
        console.log(data);
        io.emit('receive-upvote', data);
    });

    socket.on('send-comment', (data) => {
        console.log(data);
        io.emit('receive-comment', data);
    });

    socket.on('disconnect', () => {
        console.log('a user disconnected');
    });
});

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

server.listen(PORT, () => {
    console.log(`Server is running on '${process.env.BACKEND_URL}'`);
});