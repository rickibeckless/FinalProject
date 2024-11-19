/**
 * Desc: Notification Table component for the user's notifications page.
 *     This component displays a table of notifications with the notification details.
 * File: Promptify/client/src/components/user/NotificationTable.jsx
*/

// general imports
import { useEffect, useState, useContext } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import DOMPurify from 'dompurify';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelopeOpen, faEnvelope, faTrashCan, faRecycle, faDumpsterFire } from "@fortawesome/free-solid-svg-icons";

// loading screen for when the page is loading (also used for transitions and testing)
import LoadingScreen from "../global/LoadingScreen.jsx";

// message popup for errors, warnings, and successes
import MessagePopup from "../global/MessagePopup.jsx";

// some pages may also need to import utils, hooks, or context
import AuthContext from "../../context/AuthProvider.jsx"; // context used for authentication

// styling for page will be imported here
import "../../styles/user/notifications/notification-table.css"; // styling for the notification table

// import any images or assets here

export default function NotificationTable({ selectedNotifications, toggleNotification, markNotification }) {
    const { user } = useContext(AuthContext); // context used for authentication

    const formattedDate = (date) => {
        return new Date(date).toLocaleDateString();
    };

    const splicedTitle = (title) => {
        return title.length > 30 ? title.slice(0, 30) + "..." : title;
    };

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
                    <tr onClick={() => toggleNotification(notification.title)} key={index}>
                        <td>{splicedTitle(notification.title)}</td>
                        <td>{formattedDate(notification.date_created)}</td>
                        <td className="td-buttons">
                            {notification.status === 'unread' && (
                                <button type="button" title="Mark As Read" className="challenge-card-button" onClick={() => markNotification(notification.id, 'read')}>
                                    <FontAwesomeIcon icon={faEnvelope} />
                                </button>
                            )}
                            {notification.status === 'read' && (
                                <button type="button" title="Mark As Unread" className="challenge-card-button" onClick={() => markNotification(notification.id, 'unread')}>
                                    <FontAwesomeIcon icon={faEnvelopeOpen} />
                                </button>
                            )}
                            {notification.status !== 'delete' && (
                                <button type="button" title="Mark For Deletion (30 days)" className="challenge-card-button" onClick={() => markNotification(notification.id, 'delete')}>
                                    <FontAwesomeIcon icon={faTrashCan} />
                                </button>
                            )}
                            {notification.status === 'delete' && (
                                <>
                                    <button type="button" title="Mark As Unread" className="challenge-card-button" onClick={() => markNotification(notification.id, 'unread')}>
                                    <FontAwesomeIcon icon={faRecycle} />
                                    </button>
                                    <button type="button" title="Permanently Delete Now" className="challenge-card-button" onClick={() => markNotification(notification.id, 'permanently_delete')}>
                                    <FontAwesomeIcon icon={faDumpsterFire} />
                                    </button>
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