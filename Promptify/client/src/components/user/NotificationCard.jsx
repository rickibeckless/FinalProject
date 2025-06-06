/**
 * Desc: Notification Card component for the user's notifications page.
 *     This component displays a notification card with the notification details.
 * File: Promptify/client/src/components/user/NotificationCard.jsx
*/

// general imports
import { useEffect, useState, useContext } from "react";

// some pages may also need to import utils, hooks, or context
import AuthContext from "../../context/AuthProvider.jsx"; // context used for authentication

// styling for page will be imported here
import "../../styles/user/notifications/notification-card.css"; // styling for the notification card

// import any images or assets here

export default function NotificationCard({ notificationId }) {
    const { user } = useContext(AuthContext); // context used for authentication
    const [notification, setNotification] = useState({});

    useEffect(() => {
        async function fetchNotification() {
            const response = await fetch(`/api/notifications/${user.id}/${notificationId}`);
            const data = await response.json();

            if (response.ok) {
                setNotification(data);
            } else {
                console.error(data.error);
            }
        };

        fetchNotification();
    }, [notificationId]);

    const formattedDate = new Date(notification?.date_created).toLocaleString();

    return (
        <div className="notification-card">
            <div className="notification-card-header">
                <h3>{notification?.title}</h3>
                <p>{formattedDate}</p>
            </div>
            <div className="notification-card-body">
                <p>{notification?.content}</p>
            </div>
        </div>
    );
};