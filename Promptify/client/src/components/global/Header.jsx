import { useState, useEffect, useContext } from "react";
import { useLocation } from "react-router-dom";
import AuthContext from "../../context/AuthProvider.jsx";
import SignUpModal from "./modals/SignUp.jsx";
import LoginModal from "./modals/Login.jsx";
import LoadingScreen from "./LoadingScreen.jsx";

export default function Header() {
    const location = useLocation();
    const [loading, setLoading] = useState(true);

    const { user, logout } = useContext(AuthContext);

    const [openNavDropdown, setOpenNavDropdown] = useState(null);
    const [showSignUpModal, setShowSignUpModal] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);

    useEffect(() => { // runs once when the page loads
        setLoading(false); // set to false when done loading
    }, []); // the empty array means this effect will only run once

    const toggleModal = (type, previousType) => {
        if (previousType) {
            if (previousType === "sign-up") {
                setShowSignUpModal(false);
            } else if (previousType === "login") {
                setShowLoginModal(false);
            } else if (previousType === "close") {
                document.body.classList.remove("modal-open");
            };
        } else {
            document.body.classList.toggle("modal-open");
        };

        if (type === "sign-up") {
            setShowSignUpModal(!showSignUpModal);
        } else if (type === "login") {
            setShowLoginModal(!showLoginModal);
        };
    };

    const toggleDropdown = (type) => {
        if (type === "challenges") {
            setOpenNavDropdown(openNavDropdown === "challenges" ? null : "challenges");
        } else if (type === "user") {
            setOpenNavDropdown(openNavDropdown === "user" ? null : "user");
        };
    };

    return (
        <>
            {loading ? <LoadingScreen /> : null}
            <header id="main-header">
                <h1 id="main-logo"><a href="/">Promptify</a></h1>
                <nav id="main-navbar">
                    <ul>
                        <li className="challenge-nav" onClick={() => toggleDropdown('challenges')}>
                            Challenges

                            <div className={`challenge-nav-dropdown dropdown ${openNavDropdown === "challenges" ? "active" : ""}`}>
                                {location.pathname !== "/challenges" && <li><a href="/challenges">Current Challenges</a></li>}
                                {location.pathname !== "/challenges/archive" && <li><a href="/challenges/archive">Challenge Archive</a></li>}

                                {user && (
                                    <>
                                        {location.pathname !== "/challenges/create" && <li><a href="/challenges/create">Create Challenge!</a></li>}
                                        {location.pathname !== `/challenges/${user.username}` && <li><a href={`/challenges/${user.username}`}>Your Challenges</a></li>}
                                    </>
                                )}
                            </div>
                        </li>
                        <div className="account-links">
                            {!user ? (
                                <>
                                    {location.pathname !== "/sign-up" && <li onClick={() => toggleModal('sign-up')}>Sign Up</li>}
                                    {location.pathname !== "/login" && <li onClick={() => toggleModal('login')}>Login</li>}
                                </>
                            ) :
                                <>
                                    <li>Welcome, <span onClick={() => toggleDropdown('user')}>{user.username}</span>!</li>

                                    <div className={`user-nav-dropdown dropdown ${openNavDropdown === "user" ? "active" : ""}`}>
                                        {location.pathname !== "/profile" && <li><a href="/profile">Your Profile</a></li>}
                                        <li className="logout-btn mild-danger-red" onClick={() => logout()}>Logout</li>
                                    </div>
                                </>
                            }
                        </div>
                    </ul>
                </nav>
            </header>
        
            {showSignUpModal && <SignUpModal toggleModal={toggleModal} />}
            {showLoginModal && <LoginModal toggleModal={toggleModal} />}
        </>
    );
};