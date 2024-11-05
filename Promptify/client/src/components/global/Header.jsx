import { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthContext from "../../context/AuthProvider.jsx";
import SignUpModal from "./modals/SignUp.jsx";
import LoginModal from "./modals/Login.jsx";
import LoadingScreen from "./LoadingScreen.jsx";

import LogoutImg from "../../assets/logout.svg";
import PersonImg from "../../assets/person.svg";
import SettingsImg from "../../assets/settings.svg";
import AddImg from "../../assets/add.svg";
import BoxGridImg from "../../assets/box_grid.svg";
import GlobeImg from "../../assets/globe.svg";
import BoxQuestionImg from "../../assets/box_question.svg";

export default function Header() {
    const location = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    const { user, logout } = useContext(AuthContext);

    const [openNavDropdown, setOpenNavDropdown] = useState(null);
    const [showSignUpModal, setShowSignUpModal] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);

    const [userWelcome, setUserWelcome] = useState("Welcome");

    useEffect(() => { // runs once when the page loads
        setLoading(false); // set to false when done loading

        // set the user's welcome message based on the time of day
        const userDate = new Date();
        const userHour = userDate.getHours();
        if (userHour >= 0 && userHour < 12) {
            setUserWelcome("Good morning");
        } else if (userHour >= 12 && userHour < 18) {
            setUserWelcome("Good afternoon");
        } else {
            setUserWelcome("Good evening");
        };
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
                <h1 id="main-logo">
                    <a href="/">
                        Promptify
                    </a>
                </h1>
                <nav id="main-navbar">
                    <ul className="challenge-nav" onMouseEnter={() => toggleDropdown('challenges')} onMouseLeave={() => toggleDropdown('challenges')}>
                        <li>Challenges</li>

                        <li className={`challenge-nav-dropdown dropdown ${openNavDropdown === "challenges" ? "active" : ""}`}>
                            {location.pathname !== "/challenges" && 
                                <li className="nav-link">
                                    <a className="user-nav-link" href="/challenges">
                                        <img src={GlobeImg} alt="globe icon" />
                                        <span className="nav-link-text">Current Challenges</span>
                                    </a>
                                </li>
                            }
                            {location.pathname !== "/challenges/archive" && 
                                <li className="nav-link">
                                    <a className="user-nav-link" href="/challenges/archive">
                                        <img src={BoxGridImg} alt="box grid icon" />
                                        <span className="nav-link-text">Challenge Archive</span>
                                    </a>
                                </li>
                            }

                            {user && (
                                <>
                                    {location.pathname !== "/challenges/create" && 
                                        <li className="nav-link">
                                            <a className="user-nav-link" href="/challenges/create">
                                                <img src={AddImg} alt="add icon" />
                                                <span className="nav-link-text">Create Challenge</span>
                                            </a>
                                        </li>
                                    }
                                    {location.pathname !== `/${user.username}/challenges` && 
                                        <li className="nav-link">
                                            <a className="user-nav-link" href={`/${user.username}/challenges`}>
                                                <img src={BoxQuestionImg} alt="box question icon" />
                                                <span className="nav-link-text">Your Challenges</span>
                                            </a>
                                        </li>
                                    }
                                </>
                            )}
                        </li>
                    </ul>
                    {!user ? (
                        <ul className="account-links">
                            {location.pathname !== "/sign-up" && <li className="account-link" onClick={() => toggleModal('sign-up')}>Sign Up</li>}
                            {location.pathname !== "/login" && <li className="account-link" onClick={() => toggleModal('login')}>Login</li>}
                        </ul>
                    ) :
                        <ul className="user-nav" onMouseEnter={() => toggleDropdown('user')} onMouseLeave={() => toggleDropdown('user')}>
                            <li className="user-nav-welcome">{userWelcome}, <span className="user-nav-username">{user.username}</span>!</li>

                            <li className={`user-nav-dropdown dropdown ${openNavDropdown === "user" ? "active" : ""}`}>
                                {location.pathname !== "/profile" && 
                                    <li className="nav-link">
                                        <a className="user-nav-link" href="/profile">
                                            <img src={PersonImg} alt="person icon" />
                                            <span className="nav-link-text">Your Profile</span>
                                        </a>
                                    </li>
                                }
                                {location.pathname !== "/settings" && 
                                    <li className="nav-link">
                                        <a className="user-nav-link" href="/settings">
                                            <img src={SettingsImg} alt="settings icon" />
                                            <span className="nav-link-text">Settings</span>
                                        </a>
                                    </li>
                                }
                                <li className="logout-btn mild-danger-red nav-link user-nav-link" onClick={() => logout()}>
                                    <img src={LogoutImg} alt="logout icon" /> 
                                    <span className="nav-link-text">Logout</span>
                                </li>
                            </li>
                        </ul>
                    }
                </nav>
            </header>
        
            {showSignUpModal && <SignUpModal toggleModal={toggleModal} />}
            {showLoginModal && <LoginModal toggleModal={toggleModal} />}
        </>
    );
};