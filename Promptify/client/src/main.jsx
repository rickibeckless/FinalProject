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
import Notifications from './pages/user/Notifications.jsx';
import Settings from './pages/user/Settings.jsx';
import UserChallenges from './pages/user/UserChallenges.jsx';

// challenge pages
import AllChallenges from './pages/challenges/AllChallenges.jsx';
import CreateChallenge from './pages/challenges/CreateChallenge.jsx';
import ChallengeArchive from './pages/challenges/ChallengeArchive.jsx';
import Challenge from './pages/challenges/Challenge.jsx';
import JoinChallenge from './pages/challenges/JoinChallenge.jsx';
import Submission from './pages/challenges/Submission.jsx';
import NotFound from './pages/NotFound.jsx';

// footer pages
import IssueLog from './pages/footer/IssueLog.jsx';
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
            { path: '/notifications', element: <Notifications /> },
            { path: '/settings', element: <Settings /> },

            { path: '/issue-log', element: <IssueLog /> },
            { path: '/about', element: <About /> },
            { path: '/terms-of-service', element: <TermsOfService /> },
            { path: '/help', element: <Help /> },

            { path: '/challenges', element: <AllChallenges /> },
            { path: '/challenges/create', element: <CreateChallenge /> },
            // { path: '/challenges/archive', element: <ChallengeArchive /> },
            { path: '/challenges/:challengeId', element: <Challenge /> },
            { path: '/challenges/:challengeId/join', element: <JoinChallenge /> },

            { path: '/submissions/:submissionId', element: <Submission /> },

            { path: '/:username', element: <User /> },
            { path: '/:username/work', element: <UserChallenges /> },

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