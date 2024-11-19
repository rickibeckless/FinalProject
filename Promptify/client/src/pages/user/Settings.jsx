/**
 * Desc: User profile page, displays user information and allows user to edit their profile.
 * File: Promptify/client/src/pages/user/Profile.jsx
*/

// general imports
import { useEffect, useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// sets the page title, used by all pages in the format "Page Title | Promptify"
import PageTitle from "../../components/global/PageTitle.jsx"; // note: modals will not use this component

// loading screen for when the page is loading (also used for transitions and testing)
import LoadingScreen from "../../components/global/LoadingScreen.jsx";

// message popup for errors, warnings, and successes
import MessagePopup from "../../components/global/MessagePopup.jsx";

// modals for page
import SignUpModal from "../../components/global/modals/SignUp.jsx";
import LoginModal from "../../components/global/modals/Login.jsx";
import DeleteUserModal from "../../components/user/DeleteUserModal.jsx";

import ProfileSection from "../../components/user/settings/ProfileSection.jsx";
import NotificationSection from "../../components/user/settings/NotificationSection.jsx";

// some pages may also need to import utils, hooks, or context
import AuthContext from "../../context/AuthProvider.jsx"; // context used for authentication

// styles for the page
import "../../styles/user/settings.css";

export default function Settings() {
    const { user } = useContext(AuthContext); // context used for authentication
    const [loading, setLoading] = useState(true); // set to false when done loading
    const [message, setMessage] = useState(""); // set to message to display in message popup
    const token = localStorage.getItem("token");

    const navigate = useNavigate(); // used to navigate to a different page
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const tabQuery = queryParams.get('tab');
    const edit = queryParams.get('edit');

    const [showSignUpModal, setShowSignUpModal] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);

    const [tab, setTab] = useState("profile-section");
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        if (token) {
            if (tabQuery === "profile") {
                setTab("profile-section");
            }
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

                if (type !== "delete") {
                    navigate("/");
                }
            };
        } else {
            document.body.classList.remove("modal-open");
        };

        if (type === "sign-up") {
            setShowSignUpModal(!showSignUpModal);
        } else if (type === "login") {
            setShowLoginModal(!showLoginModal);
        } else if (type === "delete") {
            setShowDeleteModal(!showDeleteModal);
        }
    };

    return (
        <> {/* React fragment (shorthand), used to return multiple elements. Pages usually start with fragment */}
            <PageTitle title="Settings | Promptify" />
            {loading ? <LoadingScreen /> : null}
            {message && <MessagePopup message={message} setMessage={setMessage} />}

            <main id="settings-body" className="container">
                <aside id="table-of-contents">
                <h1>Settings</h1>
                    <h2>Table of Contents</h2>
                    <ul>
                        <li onClick={() => setTab("profile-section")}>Profile Information</li>
                        <li onClick={() => setTab("notifications")}>Notifications</li>
                        <li onClick={() => setTab("profile-delete")}>Delete Profile</li>
                    </ul>
                </aside>

                {user ? (
                    <section id="settings-content">
                        {tab === "notifications" ? (
                            <NotificationSection user={user} />
                        ) : tab === "profile-delete" ? (
                            <div id="profile-delete">
                                <h2 className="settings-section-header">Delete Profile</h2>
                                <p>Are you sure you want to delete your profile? This action cannot be undone.</p>
                                <button className="btn btn-danger" onClick={() => toggleModal("delete")}>Delete Profile</button>
                            </div>
                        ) : (
                            <ProfileSection user={user} edit={edit} />
                        )}
                    </section>
                ) : <p>Please log in or create an account to view and edit your settings.</p>}
            </main>

            {showSignUpModal && <SignUpModal toggleModal={toggleModal} />}
            {showLoginModal && <LoginModal toggleModal={toggleModal} />}
            {showDeleteModal && <DeleteUserModal toggleModal={toggleModal} />}
        </>
    );
};