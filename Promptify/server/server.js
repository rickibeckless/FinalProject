import express from 'express';
import './config/dotenv.js';
import cors from 'cors';
import { Server } from 'socket.io';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const environmentUrl = process.env.NODE_ENV === 'production' ? process.env.BACKEND_URL : process.env.FRONTEND_URL;

export const io = new Server(server, {
    cors: {
        origin: environmentUrl,
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

io.on('connection', (socket) => {
    socket.on('send-notification', (data) => {
        io.emit('receive-notification', data);
    });

    socket.on('send-challenge', (data) => {
        io.emit('receive-challenge', data);
    });

    socket.on('send-submission', (data) => {
        io.emit('receive-submission', data);
    });

    socket.on('send-upvote', (data) => {
        io.emit('receive-upvote', data);
    });

    socket.on('send-comment', (data) => {
        console.log(data);
        io.emit('receive-comment', data);
    });

    socket.on('disconnect', () => {
        // cleanup could go here
    });
});

app.use(cors({
    origin: environmentUrl,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
}));
app.use(express.json());
app.use(authSession);
app.use(passport.initialize());
app.use(passport.session());

if (process.env.NODE_ENV === 'production') {
    //app.use(express.static('public'));

    app.use(express.static(path.join(__dirname, 'public')));

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });
};

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