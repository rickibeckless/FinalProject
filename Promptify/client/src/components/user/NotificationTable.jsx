/**
 * Desc: Notification Table component for the user's notifications page.
 *     This component displays a table of notifications with the notification details.
 * File: Promptify/client/src/components/user/NotificationTable.jsx
*/

// general imports
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelopeOpen, faEnvelope, faTrashCan, faRecycle, faDumpsterFire } from "@fortawesome/free-solid-svg-icons";

// styling for page will be imported here
import "../../styles/user/notifications/notification-table.css"; // styling for the notification table

// import any images or assets here

export default function NotificationTable({ selectedNotifications, toggleNotification, markNotification }) {
    const formattedDate = (date) => {
        return new Date(date).toLocaleDateString();
    };

    const splicedTitle = (title) => {
        return title?.length > 30 ? title?.slice(0, 30) + "..." : title;
    };

    return (
        <table className={`${selectedNotifications?.length > 0 ? "block" : ""}`}>
            <thead>
                <tr>
                    <th>Notification</th>
                    <th>Date</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {selectedNotifications.length > 0 ? selectedNotifications.map((notification, index) => (
                    <tr onClick={() => toggleNotification(notification.id)} key={index}>
                        <td>{splicedTitle(notification?.title)}</td>
                        <td>{formattedDate(notification?.date_created)}</td>
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