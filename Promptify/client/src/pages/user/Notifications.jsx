/**
 * Desc: User notifications page, displays user notifications and allows user to manage their notifications.
 * File: Promptify/client/src/pages/user/Notifications.jsx
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

import NotificationCard from "../../components/user/NotificationCard.jsx";

// some pages may also need to import utils, hooks, or context
import AuthContext from "../../context/AuthProvider.jsx"; // context used for authentication

export default function Notifications() {
    const { user } = useContext(AuthContext); // context used for authentication
    const [loading, setLoading] = useState(true); // set to false when done loading
    const [message, setMessage] = useState(""); // set to message to display in message popup
    const token = localStorage.getItem("token");

    const navigate = useNavigate(); // used to navigate to a different page

    const [showSignUpModal, setShowSignUpModal] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);

    const [showNotification, setShowNotification] = useState(false);
    const [notificationId, setNotificationId] = useState("");

    const [notifications, setNotifications] = useState([]);
    const [tab, setTab] = useState("unread");
    const [unreadNotifications, setUnreadNotifications] = useState([]);
    const [readNotifications, setReadNotifications] = useState([]);
    const [deletedNotifications, setDeletedNotifications] = useState([]);
    
    async function fetchNotifications() {
        try {
            const response = await fetch(`/api/notifications/${user.id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (response.ok) {
                const rawData = await response.json();
                const data = rawData[0].notifications;
                setNotifications(data);

                const unread = data.filter(notification => notification.status === "unread");
                setUnreadNotifications(unread);

                const read = data.filter(notification => notification.status === "read");
                setReadNotifications(read);

                const deleted = data.filter(notification => notification.status === "deleted");
                setDeletedNotifications(deleted);
            } else {
                throw new Error("An error occurred");
            };
        } catch (error) {
            console.error("Error fetching notifications:", error);
            setMessage("An unexpected error occurred");
        };
    };

    useEffect(() => {
        if (token) {
            fetchNotifications();
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

    const handleTabChange = (e) => {
        const tab = e.target.value;
        setTab(tab);
        setNotificationId("");
        setShowNotification(false);
    };

    const toggleNotification = (e) => {
        const notificationTitle = e.target.innerText;
        const notification = notifications.find(notification => notification.title === notificationTitle);

        if (notification) {
            console.log(notification);
            setNotificationId(notification.id);
            setShowNotification(!showNotification);
        };
    };

    const markNotification = async (notificationId, status) => {
        try {
            const response = await fetch(`/api/notifications/${user.id}/${notificationId}/${status}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (response.ok) {
                fetchNotifications();
                setMessage(`Notification marked as '${status}'`);
            } else {
                throw new Error("An error occurred");
            };
        } catch (error) {
            console.error("Error updating notification status:", error);
            setMessage("An unexpected error occurred");
        };
    };

    return (
        <> {/* React fragment (shorthand), used to return multiple elements. Pages usually start with fragment */}
            <PageTitle title={`${notifications && notifications.length > 0 ? `(${notifications.length}) ` : ''}Notifications | Promptify`} />
            {loading ? <LoadingScreen /> : null}
            {message && <MessagePopup message={message} setMessage={setMessage} />}

            <main id="notifications-body" className="container">
                <h1>Notifications</h1>
                {user ? (
                    <>
                        <div className="notification-tab-holder">
                            <button type="button" className="notification-tab" value="unread" onClick={(e) => handleTabChange(e)}>Unread ({unreadNotifications.length})</button>
                            <button type="button" className="notification-tab" value="read" onClick={(e) => handleTabChange(e)}>Read ({readNotifications.length})</button>
                            <button type="button" className="notification-tab" value="deleted" onClick={(e) => handleTabChange(e)}>Deleted ({deletedNotifications.length})</button>
                        </div>

                        <section className="left-notification-holder">
                            {tab === "unread" && (
                                <section id="unread-notifications-section">
                                    <h2>Unread Notifications</h2>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Notification</th>
                                                <th>Date</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {unreadNotifications.length > 0 ? unreadNotifications.map((notification, index) => (
                                                <tr key={index}>
                                                    <td onClick={(e) => toggleNotification(e)}>{notification.title}</td>
                                                    <td>{notification.date_created}</td>
                                                    <td>
                                                        <button type="button" className="notification-action" onClick={() => markNotification(notification.id, 'read')}>Mark as Read</button>
                                                        <button type="button" className="notification-action" onClick={() => markNotification(notification.id, 'delete')}>Delete</button>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan="3">No unread notifications</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </section>
                            )}

                            {tab === "read" && (
                                <section id="read-notifications-section">
                                    <h2>Read Notifications</h2>
                                    
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Notification</th>
                                                <th>Date</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {readNotifications.length > 0 ? readNotifications.map((notification, index) => (
                                                <tr key={index}>
                                                    <td>{notification.title}</td>
                                                    <td>{notification.date_created}</td>
                                                    <td>
                                                        <button type="button" className="notification-action" onClick={() => markNotification(notification.id, 'unread')}>Mark as Unread</button>
                                                        <button type="button" className="notification-action" onClick={() => deleteNotification(notification.id)}>Delete</button>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan="3">No read notifications</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </section>
                            )}

                            {tab === "deleted" && (
                                <section id="deleted-notifications-section">
                                    <h2>Deleted Notifications</h2>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Notification</th>
                                                <th>Date</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {deletedNotifications.length > 0 ? deletedNotifications.map((notification, index) => (
                                                <tr key={index}>
                                                    <td>{notification.title}</td>
                                                    <td>{notification.date_created}</td>
                                                    <td>
                                                        <button type="button" className="notification-action" onClick={() => markNotification(notification.id, 'unread')}>Mark as Unread</button>
                                                        <button type="button" className="notification-action" onClick={() => markNotification(notification.id, 'read')}>Mark as Read</button>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan="3">No deleted notifications</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </section>
                            )}                            
                        </section>

                        <section className="right-notification-holder">
                            {showNotification ? (
                                <NotificationCard notificationId={notificationId} toggleNotification={toggleNotification} />
                            ) : (
                                <p>Select a notification to view details</p>
                            )}
                        </section>
                    </>
                ) : <p>Please log in or create an account to view your notifications.</p>}
            </main>

            {showSignUpModal && <SignUpModal toggleModal={toggleModal} />}
            {showLoginModal && <LoginModal toggleModal={toggleModal} />}
        </>
    );
};