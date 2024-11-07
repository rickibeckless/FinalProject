import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider.jsx';
import App from './App.jsx';
import './index.css';

// import pages
import Home from './pages/Home.jsx';

// admin pages
import AdminDashboard from './pages/admin/AdminDashboard.jsx';

// user pages
import User from './pages/User.jsx';
import Profile from './pages/user/Profile.jsx';
import Settings from './pages/user/Settings.jsx';
import UserChallenges from './pages/user/UserChallenges.jsx';

// challenge pages
import AllChallenges from './pages/challenges/AllChallenges.jsx';
import CreateChallenge from './pages/challenges/CreateChallenge.jsx';
import ChallengeArchive from './pages/challenges/ChallengeArchive.jsx';
import Challenge from './pages/challenges/Challenge.jsx';
import JoinChallenge from './pages/challenges/JoinChallenge.jsx';
import NotFound from './pages/NotFound.jsx';

// footer pages
import About from './pages/footer/About.jsx';
import TermsOfService from './pages/footer/TermsOfService.jsx';
import Help from './pages/footer/Help.jsx';

// set router
const router = createBrowserRouter([
    { // main pages
        path: '/',
        element: <App />,
        children: [
            { path: '/', element: <Home /> },
            { path: '/admin', element: <AdminDashboard /> },
            { path: '/profile', element: <Profile /> },
            { path: '/settings', element: <Settings /> },

            { path: '/about', element: <About /> },
            { path: '/terms-of-service', element: <TermsOfService /> },
            { path: '/help', element: <Help /> },

            { path: '/challenges', element: <AllChallenges /> },
            { path: '/challenges/create', element: <CreateChallenge /> },
            { path: '/challenges/archive', element: <ChallengeArchive /> },
            { path: '/challenges/:challengeId', element: <Challenge /> },
            { path: '/challenges/:challengeId/join', element: <JoinChallenge /> },

            { path: '/:username', element: <User /> },
            { path: '/:username/challenges', element: <UserChallenges /> },
            { path: '/:username/challenges/:challengeId', element: <Challenge /> }, // will be used for user challenge submission <Submission />

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