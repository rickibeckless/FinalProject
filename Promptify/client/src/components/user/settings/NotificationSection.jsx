/**
 * Desc: Notification section component for the user's settings page.
 *    This component displays the user's notification settings and allows them to edit it.
 * File: Promptify/client/src/components/user/settings/NotificationSection.jsx
*/

// general imports
import { useEffect, useState, useContext } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";

// some pages may also need to import utils, hooks, or context
import AuthContext from "../../../context/AuthProvider.jsx";

// message popup for errors, warnings, and successes
import MessagePopup from "../../global/MessagePopup.jsx";

export default function NotificationSection({ user, handleSave }) {
    const [message, setMessage] = useState("");
    const navigate = useNavigate();
    const [notificationSettings, setNotificationSettings] = useState({
        allow_notifications: null,
        allow_push_notifications: null,
        allow_daily_notifications: null,
        allow_email_notifications: null,
        allow_weekly_notifications: null,
        allow_feedback_notifications: null,
        allow_follower_notifications: null,
        allow_challenge_notifications: null,
        allow_skill_level_notifications: null,
        allow_following_user_notifications: null,
        allow_following_genre_notifications: null
    });

    useEffect(() => {
        if (user) {
            const notiSettings = user.notifications_settings;

            setNotificationSettings({
                allow_notifications: notiSettings.allow_notifications,
                allow_push_notifications: notiSettings.allow_push_notifications,
                allow_daily_notifications: notiSettings.allow_daily_notifications,
                allow_email_notifications: notiSettings.allow_email_notifications,
                allow_weekly_notifications: notiSettings.allow_weekly_notifications,
                allow_feedback_notifications: notiSettings.allow_feedback_notifications,
                allow_follower_notifications: notiSettings.allow_follower_notifications,
                allow_challenge_notifications: notiSettings.allow_challenge_notifications,
                allow_skill_level_notifications: notiSettings.allow_skill_level_notifications,
                allow_following_user_notifications: notiSettings.allow_following_user_notifications,
                allow_following_genre_notifications: notiSettings.allow_following_genre_notifications
            });
        };
    }, [user]);

    /*
        Allow user to edit their notification settings, which looks like:
        {
            "notifications_settings": {
                "allow_notifications": true,
                "allow_push_notifications": true,
                "allow_daily_notifications": true,
                "allow_email_notifications": true,
                "allow_weekly_notifications": true,
                "allow_feedback_notifications": true,
                "allow_follower_notifications": true,
                "allow_challenge_notifications": true,
                "allow_skill_level_notifications": true,
                "allow_following_user_notifications": true,
                "allow_following_genre_notifications": true
            }
        }

    */

    console.log(notificationSettings);

    return (
        <section className="settings-section" id="notifications">
            <h2>Notifications</h2>
            <div className="profile-info-item">
                <h3>Email Notifications</h3>
                <p>Receive email notifications for new challenges, reminders, and more.</p>
            </div>
            <div className="profile-info-item">
                <h3>Push Notifications</h3>
                <p>Receive push notifications for new challenges, reminders, and more.</p>
            </div>
        </section>
    );
};