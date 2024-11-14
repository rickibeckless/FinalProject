/**
 * Desc: Notification Table component for the user's notifications page.
 *     This component displays a table of notifications with the notification details.
 * File: Promptify/client/src/components/user/NotificationTable.jsx
*/

// general imports
import { useEffect, useState, useContext } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import DOMPurify from 'dompurify';

// loading screen for when the page is loading (also used for transitions and testing)
import LoadingScreen from "../global/LoadingScreen.jsx";

// message popup for errors, warnings, and successes
import MessagePopup from "../global/MessagePopup.jsx";

// some pages may also need to import utils, hooks, or context
import AuthContext from "../../context/AuthProvider.jsx"; // context used for authentication

// styling for page will be imported here
//import "../../styles/users/notification-card.css"; // styling for the notification card

// import any images or assets here

export default function NotificationTable({ selectedNotifications, toggleNotification, markNotification }) {
    const { user } = useContext(AuthContext); // context used for authentication

    return (
        <table>
            <thead>
                <tr>
                    <th>Notification</th>
                    <th>Date</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {selectedNotifications.length > 0 ? selectedNotifications.map((notification, index) => (
                    <tr key={index}>
                        <td onClick={(e) => toggleNotification(e)}>{notification.title}</td>
                        <td>{notification.date_created}</td>
                        <td>
                            {notification.status === 'unread' && (
                                <button type="button" className="notification-action" onClick={() => markNotification(notification.id, 'read')}>Mark as Read</button>
                            )}
                            {notification.status === 'read' && (
                                <button type="button" className="notification-action" onClick={() => markNotification(notification.id, 'unread')}>Mark as Unread</button>
                            )}
                            {notification.status !== 'delete' && (
                                <button type="button" className="notification-action" onClick={() => markNotification(notification.id, 'delete')}>Delete</button>
                            )}
                            {notification.status === 'delete' && (
                                <>
                                    <button type="button" className="notification-action" onClick={() => markNotification(notification.id, 'unread')}>Restore</button>
                                    <button type="button" className="notification-action" onClick={() => markNotification(notification.id, 'permanently_delete')}>Permanently Delete</button>
                                </>
                            )}
                        </td>
                    </tr>
                )) : (
                    <tr>
                        <td colSpan="3">No unread notifications</td>
                    </tr>
                )}
            </tbody>
        </table>
    );
};