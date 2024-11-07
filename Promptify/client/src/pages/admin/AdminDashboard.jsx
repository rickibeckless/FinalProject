/**
 * Desc: Admin dashboard page, displays admin information and allows admin to manage the website.
 * File: Promptify/client/src/pages/admin/AdminDashboard.jsx
*/

// general imports
import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";

// sets the page title, used by all pages in the format "Page Title | Promptify"
import PageTitle from "../../components/global/PageTitle.jsx"; // note: modals will not use this component

// loading screen for when the page is loading (also used for transitions and testing)
import LoadingScreen from "../../components/global/LoadingScreen.jsx";

// message popup for errors, warnings, and successes
import MessagePopup from "../../components/global/MessagePopup.jsx";

import SignUpModal from "../../components/global/modals/SignUp.jsx";
import LoginModal from "../../components/global/modals/Login.jsx";

// some pages may also need to import utils, hooks, or context
import AuthContext from "../../context/AuthProvider.jsx"; // context used for authentication

export default function AdminDashboard() {
    const { user, loading: authLoading } = useContext(AuthContext); // get context used for authentication
    const [loading, setLoading] = useState(true); // set to false when done loading
    const [message, setMessage] = useState(""); // set to message to display in message popup
    const token = localStorage.getItem("token");

    const navigate = useNavigate(); // used to navigate to a different page

    const [showSignUpModal, setShowSignUpModal] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);

    useEffect(() => {
        if (!authLoading) {
            if (user && user.is_admin) {
                setLoading(false);
            } else {
                navigate("/404");
            }
        }
    }, [authLoading, user, navigate]);

    const toggleModal = (type, previousType) => {
        if (previousType) {
            if (previousType === "sign-up") {
                setShowSignUpModal(false);
            } else if (previousType === "login") {
                setShowLoginModal(false);
            } else if (previousType === "close") {
                document.body.classList.remove("modal-open");
                navigate("/");
            };
        } else {
            document.body.classList.remove("modal-open");
        };

        if (type === "sign-up") {
            setShowSignUpModal(!showSignUpModal);
        } else if (type === "login") {
            setShowLoginModal(!showLoginModal);
        };
    };

    const handleSeedDefaultUsers = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/admin/default/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    role: user.is_admin ? "admin" : "user",
                },
            });

            const data = await response.json();
            if (data.error) {
                setMessage(data.error);
            } else {
                setMessage(data.message);
            };

            setLoading(false);
        } catch (error) {
            console.error(error);
            setMessage("An error occurred. Please try again.");
            setLoading(false);
        };
    };

    const handleSeedDefaultChallenges = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/admin/default/challenges", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    role: user.is_admin ? "admin" : "user",
                },
            });

            const data = await response.json();
            if (data.error) {
                setMessage(data.error);
            } else {
                setMessage(data.message);
            };

            setLoading(false);
        } catch (error) {
            console.error(error);
            setMessage("An error occurred. Please try again.");
            setLoading(false);
        };
    };

    return (
        <> {/* React fragment (shorthand), used to return multiple elements. Pages usually start with fragment */}
            <PageTitle title="Admin Dashboard | Promptify" />
            {loading ? <LoadingScreen /> : null}
            {message && <MessagePopup message={message} setMessage={setMessage} />}

            <main id="admin-dashboard-body" className="container">
                <h1>Admin Dashboard</h1>

                <button type="button" onClick={handleSeedDefaultUsers}>Seed Default Users</button>
                <button type="button" onClick={handleSeedDefaultChallenges}>Seed Default Challenges</button>
                
            </main>

            {showSignUpModal && <SignUpModal toggleModal={toggleModal} />}
            {showLoginModal && <LoginModal toggleModal={toggleModal} />}
        </>
    );
};