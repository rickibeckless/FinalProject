import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider.jsx';
import App from './App.jsx';
import './index.css';

// import pages
import Home from './pages/Home.jsx';
import Profile from './pages/user/Profile.jsx';
import CreateChallenge from './pages/challenges/CreateChallenge.jsx';
import Challenge from './pages/challenges/Challenge.jsx';
import AllChallenges from './pages/challenges/AllChallenges.jsx';
import NotFound from './pages/NotFound.jsx';

// set router
const router = createBrowserRouter([
    { // main pages
        path: '/',
        element: <App />,
        children: [
            { path: '/', element: <Home /> },
            { path: '/profile', element: <Profile /> },
            { path: '/challenges', element: <AllChallenges /> },
            { path: '/challenges/create', element: <CreateChallenge /> },
            { path: '/challenges/:challengeId', element: <Challenge /> },
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