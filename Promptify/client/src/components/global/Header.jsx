import { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { io } from 'socket.io-client'; // used to connect to the server's socket
import AuthContext from "../../context/AuthProvider.jsx";
import SignUpModal from "./modals/SignUp.jsx";
import LoginModal from "./modals/Login.jsx";
import LoadingScreen from "./LoadingScreen.jsx";

import LogoutImg from "../../assets/logout.svg";
import BellImg from "../../assets/bell.svg";
import PersonImg from "../../assets/person.svg";
import SettingsImg from "../../assets/settings.svg";
import AddImg from "../../assets/add.svg";
import BoxGridImg from "../../assets/box_grid.svg";
import GlobeImg from "../../assets/globe.svg";
import BoxQuestionImg from "../../assets/box_question.svg";
import UserProfileImg from "../../assets/imgs/blank_profile_picture.png";

export default function Header() {
    const socket = io(import.meta.env.VITE_BACKEND_URL, { autoConnect: false }); // connect to the server's socket
    const location = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    const { user, logout } = useContext(AuthContext);

    const [openNavDropdown, setOpenNavDropdown] = useState(null);
    const [showSignUpModal, setShowSignUpModal] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);

    const [userWelcome, setUserWelcome] = useState("Welcome");
    const [userProfileImage, setUserProfileImage] = useState(UserProfileImg);
    const [unreadNotifications, setUnreadNotifications] = useState([]);

    // if (user) {
    //     socket.on('receive-notification', (data) => {
    //         if (data.userId === user.id && data.status === "unread") {
    //             setUnreadNotifications([...unreadNotifications, data]);
    //         } else if (data.userId === user.id && data.status !== "unread") {
    //             setUnreadNotifications(unreadNotifications.filter(notification => notification.notificationId !== data.notificationId));
    //         }
    //     });
    // };

    useEffect(() => {
        if (user) {
            socket.connect();

            const handleReceiveNotification = (data) => {
                if (data.userId === user.id) {
                    setUnreadNotifications((prevNotifications) => {
                        if (data.status === "unread") {
                            return [...prevNotifications, data];
                        } else {
                            return prevNotifications.filter(notification => notification.notificationId !== data.notificationId);
                        }
                    });
                }
            };

            socket.on('receive-notification', handleReceiveNotification);

            return () => {
                socket.off('receive-notification', handleReceiveNotification);
                socket.disconnect();
            };
        }
    }, [user]);

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

        if (user) {
            setUserProfileImage(user.profile_picture_url);
            setUnreadNotifications(user.notifications.filter(notification => notification.status === "unread"));
        };
    }, [user]);

    useEffect(() => {
        setOpenNavDropdown(null);
    }, [location]);

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

    const toggleDropdown = (type, state) => {
        if (type === "challenges") {
            if (state === "close") {
                setOpenNavDropdown(null);
            } else if (state === "open") {
                setOpenNavDropdown("challenges");
            };
        } else if (type === "user") {
            if (state === "close") {
                setOpenNavDropdown(null);
            } else if (state === "open") {
                setOpenNavDropdown("user");
            };
        };
    };

    return (
        <>
            {loading ? <LoadingScreen /> : null}
            <header id="main-header">
                <h1 id="main-logo">
                    <Link to="/">
                        Promptify
                    </Link>
                </h1>
                <nav id="main-navbar">
                    <ul className="challenge-nav" onMouseEnter={() => toggleDropdown('challenges', 'open')} onMouseLeave={() => toggleDropdown('challenges', 'close')}>
                        <li>Challenges</li>

                        <li className={`challenge-nav-dropdown dropdown ${openNavDropdown === "challenges" ? "active" : ""}`}>
                            {location.pathname !== "/challenges" && 
                                <li className="nav-link">
                                    <Link className="user-nav-link" to="/challenges">
                                        <img src={GlobeImg} alt="globe icon" />
                                        <span className="nav-link-text">Current Challenges</span>
                                    </Link>
                                </li>
                            }
                            {location.pathname !== "/challenges/archive" && 
                                <li className="nav-link">
                                    <Link className="user-nav-link" to="/challenges/archive">
                                        <img src={BoxGridImg} alt="box grid icon" />
                                        <span className="nav-link-text">Challenge Archive</span>
                                    </Link>
                                </li>
                            }

                            {user && (
                                <>
                                    {location.pathname !== "/challenges/create" && 
                                        <li className="nav-link">
                                            <Link className="user-nav-link" to="/challenges/create">
                                                <img src={AddImg} alt="add icon" />
                                                <span className="nav-link-text">Create Challenge</span>
                                            </Link>
                                        </li>
                                    }
                                    {location.pathname !== `/${user.username}/challenges` && 
                                        <li className="nav-link">
                                            <Link className="user-nav-link" to={`/${user.username}/challenges`}>
                                                <img src={BoxQuestionImg} alt="box question icon" />
                                                <span className="nav-link-text">Your Challenges</span>
                                            </Link>
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
                        <ul className="user-nav" onMouseEnter={() => toggleDropdown('user', 'open')} onMouseLeave={() => toggleDropdown('user', 'close')}>
                            <li className="user-nav-welcome">{userWelcome}, <span className="user-nav-username">{user.username}</span>!</li>

                            <li className={`user-nav-dropdown dropdown ${openNavDropdown === "user" ? "active" : ""}`}>
                                {location.pathname !== "/notifications" &&
                                    <li className="nav-link">
                                        <Link className="user-nav-link" to="/notifications">
                                            <img src={BellImg} alt="bell icon" />
                                            <span className="nav-link-text">Notifications</span>
                                        </Link>
                                    </li>
                                }
                                {location.pathname !== "/profile" && 
                                    <li className="nav-link">
                                        <Link className="user-nav-link" to="/profile">
                                            <img src={PersonImg} alt="person icon" />
                                            <span className="nav-link-text">Your Profile</span>
                                        </Link>
                                    </li>
                                }
                                {location.pathname !== "/settings" && 
                                    <li className="nav-link">
                                        <Link className="user-nav-link" to="/settings">
                                            <img src={SettingsImg} alt="settings icon" />
                                            <span className="nav-link-text">Settings</span>
                                        </Link>
                                    </li>
                                }
                                <li className="logout-btn mild-danger-red nav-link user-nav-link" onClick={() => logout()}>
                                    <img src={LogoutImg} alt="logout icon" /> 
                                    <span className="nav-link-text">Logout</span>
                                </li>
                            </li>
                            <div className="user-nav-image-holder">
                                {unreadNotifications && unreadNotifications.length > 0 && 
                                    <div className="user-nav-notifications">
                                        <p>{unreadNotifications.length}</p>
                                    </div>
                                }
                                <img className="user-nav-image" src={userProfileImage} alt={`${user?.username} profile image`} />
                            </div>
                        </ul>
                    }
                </nav>
            </header>
        
            {showSignUpModal && <SignUpModal toggleModal={toggleModal} />}
            {showLoginModal && <LoginModal toggleModal={toggleModal} />}
        </>
    );
};