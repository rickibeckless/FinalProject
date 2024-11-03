import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider.jsx';
import App from './App.jsx';
import './index.css';

// import pages
import Home from './pages/Home.jsx';
import Profile from './pages/user/Profile.jsx';
import Settings from './pages/user/Settings.jsx';
import UserChallenges from './pages/user/UserChallenges.jsx';
import User from './pages/User.jsx';
import AllChallenges from './pages/challenges/AllChallenges.jsx';
import CreateChallenge from './pages/challenges/CreateChallenge.jsx';
import ChallengeArchive from './pages/challenges/ChallengeArchive.jsx';
import Challenge from './pages/challenges/Challenge.jsx';
import NotFound from './pages/NotFound.jsx';

// set router
const router = createBrowserRouter([
    { // main pages
        path: '/',
        element: <App />,
        children: [
            { path: '/', element: <Home /> },
            { path: '/profile', element: <Profile /> },
            { path: '/settings', element: <Settings /> },
            { path: '/challenges', element: <AllChallenges /> },
            { path: '/challenges/create', element: <CreateChallenge /> },
            { path: '/challenges/archive', element: <ChallengeArchive /> },
            { path: '/challenges/:challengeId', element: <Challenge /> },
            { path: '/:username', element: <User /> },
            { path: '/:username/challenges', element: <UserChallenges /> },
            { path: '*', element: <NotFound /> },
            { path: '/404', element: <NotFound /> },
        ],
    }
]);

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <AuthProvider>
            <RouterProvider router={router} />
        </AuthProvider>
    </StrictMode>
);