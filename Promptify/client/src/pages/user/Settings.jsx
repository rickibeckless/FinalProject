/**
 * Desc: User profile page, displays user information and allows user to edit their profile.
 * File: Promptify/client/src/pages/user/Profile.jsx
*/

// general imports
import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";

// sets the page title, used by all pages in the format "Page Title | StudyGo"
import PageTitle from "../../components/global/PageTitle.jsx"; // note: modals will not use this component

// loading screen for when the page is loading (also used for transitions and testing)
import LoadingScreen from "../../components/global/LoadingScreen.jsx";

// message popup for errors, warnings, and successes
import MessagePopup from "../../components/global/MessagePopup.jsx";

import SignUpModal from "../../components/global/modals/SignUp.jsx";
import LoginModal from "../../components/global/modals/Login.jsx";

// some pages may also need to import utils, hooks, or context
import AuthContext from "../../context/AuthProvider.jsx"; // context used for authentication

export default function Settings() {
    const { user } = useContext(AuthContext); // context used for authentication
    const [loading, setLoading] = useState(true); // set to false when done loading
    const [message, setMessage] = useState(""); // set to message to display in message popup
    const token = localStorage.getItem("token");

    const navigate = useNavigate(); // used to navigate to a different page

    const [showSignUpModal, setShowSignUpModal] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);

    useEffect(() => {
        if (token) {
            setLoading(false);
        } else {
            setLoading(false);
            setShowLoginModal(true);
        };
    }, [loading, user]);

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

    return (
        <> {/* React fragment (shorthand), used to return multiple elements. Pages usually start with fragment */}
            <PageTitle title="Settings | Promptify" />
            {loading ? <LoadingScreen /> : null}
            {message && <MessagePopup message={message} setMessage={setMessage} />}

            <main id="profile-body" className="container">
                <h1>Settings</h1>

                <aside id="table-of-contents">
                    <h2>Table of Contents</h2>
                    <ul>
                        <li><a href="#profile-info">Profile Information</a></li>
                        <li><a href="#notifications">Notifications</a></li>
                        <li><a href="#profile-delete">Delete Profile</a></li>
                    </ul>
                </aside>

                {user ? (
                    <section id="settings-content">
                        <div id="profile-info">
                            <h2>Profile Information</h2>
                            <div className="profile-info-item">
                                <h3>Username</h3>
                                <p>{user?.username}</p>
                            </div>
                            <div className="profile-info-item">
                                <h3>Email</h3>
                                <p>{user?.email}</p>
                            </div>
                        </div>

                        <div id="notifications">
                            <h2>Notifications</h2>
                            <div className="profile-info-item">
                                <h3>Email Notifications</h3>
                                <p>Receive email notifications for new challenges, reminders, and more.</p>
                            </div>
                            <div className="profile-info-item">
                                <h3>Push Notifications</h3>
                                <p>Receive push notifications for new challenges, reminders, and more.</p>
                            </div>
                        </div>

                        <div id="profile-delete">
                            <h2>Delete Profile</h2>
                            <p>Are you sure you want to delete your profile? This action cannot be undone.</p>
                            <button className="btn btn-danger">Delete Profile</button>
                        </div>
                    </section>
                ) : <p>Please log in or create an account to view and edit your settings.</p>}
            </main>

            {showSignUpModal && <SignUpModal toggleModal={toggleModal} />}
            {showLoginModal && <LoginModal toggleModal={toggleModal} />}
        </>
    );
};