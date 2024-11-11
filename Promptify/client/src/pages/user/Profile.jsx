/**
 * Desc: User profile page, displays user information and allows user to edit their profile.
 * File: Promptify/client/src/pages/user/Profile.jsx
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

export default function Profile() {
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
            <PageTitle title="Profile | Promptify" />
            {loading ? <LoadingScreen /> : null}
            {message && <MessagePopup message={message} setMessage={setMessage} />}

            <main id="profile-body" className="container">
                <h1>Your Profile</h1>
                {user ? (
                    <section id="profile-info">
                        <div className="profile-info-item">
                            <h2>Username</h2>
                            <p>{user?.username}</p>
                        </div>
                        <div className="profile-info-item">
                            <h2>Email</h2>
                            <p>{user?.email}</p>
                        </div>
                        <div className="profile-info-item">
                            <h2>Member Since</h2>
                            <p>{new Date(user?.date_created).toLocaleDateString()}</p>
                        </div>
                        <div className="profile-info-item">
                            <h2>Last log in</h2>
                            <p>{new Date(user?.last_login).toLocaleDateString()}</p>
                        </div>
                        <div className="profile-info-item">
                            <h2>Followers</h2>
                            <p>{user?.followers}</p>
                        </div>
                        <div className="profile-info-item">
                            <h2>Following</h2>
                            <p>{user?.following}</p>
                        </div>
                    </section>
                ) : <p>Please log in or create an account to view your profile information.</p>}
            </main>

            {showSignUpModal && <SignUpModal toggleModal={toggleModal} />}
            {showLoginModal && <LoginModal toggleModal={toggleModal} />}
        </>
    );
};