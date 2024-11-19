/**
 * Desc: Notification section component for the user's settings page.
 *    This component displays the user's notification settings and allows them to edit it.
 * File: Promptify/client/src/components/user/settings/NotificationSection.jsx
*/

// general imports
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// styles for the page
import "../../../styles/user/settings/notification-section.css";

export default function NotificationSection({ user }) {
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
    const [pendingSave, setPendingSave] = useState(false);

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

    const handleSettingsChange = (e) => {
        const { name, checked } = e.target;

        setNotificationSettings({
            ...notificationSettings,
            [name]: checked
        });

        setPendingSave(true);
    };

    const handleSaveSettings = async () => {
        const response = await fetch(`/api/users/${user.id}/edit/notification`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                role: user ? "user" : "guest",
            },
            body: JSON.stringify({ notificationSettings })
        });

        await response.json();
    };

    useEffect(() => {
        if (pendingSave) {
            handleSaveSettings();
        }
    }, [notificationSettings, pendingSave]);

    const resetSettings = (type) => {
        if (type === "default") {
            setNotificationSettings({
                allow_notifications: true,
                allow_push_notifications: true,
                allow_daily_notifications: true,
                allow_email_notifications: true,
                allow_weekly_notifications: true,
                allow_feedback_notifications: true,
                allow_follower_notifications: true,
                allow_challenge_notifications: true,
                allow_skill_level_notifications: true,
                allow_following_user_notifications: true,
                allow_following_genre_notifications: true
            });
        };

        setPendingSave(true);
    };

    return (
        <section className="settings-section" id="notifications">
            <h2 className="settings-section-header">Notifications</h2>

            <div className="profile-info-item">
                <label htmlFor="notification">
                    Notifications
                    <input type="checkbox" name="allow_notifications" id="notification" checked={notificationSettings.allow_notifications} onChange={handleSettingsChange} />
                    <span className="custom-checkbox"></span>
                </label>
                <p>Receive notifications for new challenges, reminders, and more.</p>
            </div>

            {notificationSettings.allow_notifications ? (
                <>
                    <div className="profile-info-item">
                        <label htmlFor="email">
                            Email Notifications
                            <input type="checkbox" name="allow_email_notifications" id="email" checked={notificationSettings.allow_email_notifications} onChange={handleSettingsChange} />
                            <span className="custom-checkbox"></span>
                        </label>
                        <p>Receive email notifications for new challenges, reminders, and more.</p>
                    </div>

                    <div className="profile-info-item">
                        <label htmlFor="push">
                            Push Notifications
                            <input type="checkbox" name="allow_push_notifications" id="push" checked={notificationSettings.allow_push_notifications} onChange={handleSettingsChange} />
                            <span className="custom-checkbox"></span>
                        </label>
                        <p>Receive push notifications for new challenges, reminders, and more.</p>
                    </div>

                    <div className="profile-info-item">
                        <label htmlFor="daily">
                            Daily Notifications
                            <input type="checkbox" name="allow_daily_notifications" id="daily" checked={notificationSettings.allow_daily_notifications} onChange={handleSettingsChange} />
                            <span className="custom-checkbox"></span>
                        </label>
                        <p>Receive daily notifications for new challenges, reminders, and more.</p>
                    </div>

                    <div className="profile-info-item">
                        <label htmlFor="weekly">
                            Weekly Notifications
                            <input type="checkbox" name="allow_weekly_notifications" id="weekly" checked={notificationSettings.allow_weekly_notifications} onChange={handleSettingsChange} />
                            <span className="custom-checkbox"></span>
                        </label>
                        <p>Receive weekly notifications for new challenges, reminders, and more.</p>
                    </div>

                    <div className="profile-info-item">
                        <label htmlFor="feedback">
                            Feedback Notifications
                            <input type="checkbox" name="allow_feedback_notifications" id="feedback" checked={notificationSettings.allow_feedback_notifications} onChange={handleSettingsChange} />
                            <span className="custom-checkbox"></span>
                        </label>
                        <p>Receive feedback notifications for your submissions.</p>
                    </div>

                    <div className="profile-info-item">
                        <label htmlFor="follower">
                            Follower Notifications
                            <input type="checkbox" name="allow_follower_notifications" id="follower" checked={notificationSettings.allow_follower_notifications} onChange={handleSettingsChange} />
                            <span className="custom-checkbox"></span>
                        </label>
                        <p>Receive notifications when someone follows you.</p>
                    </div>

                    <div className="profile-info-item">
                        <label htmlFor="challenge">
                            Challenge Notifications
                            <input type="checkbox" name="allow_challenge_notifications" id="challenge" checked={notificationSettings.allow_challenge_notifications} onChange={handleSettingsChange} />
                            <span className="custom-checkbox"></span>
                        </label>
                        <p>Receive notifications for new challenges.</p>
                    </div>

                    <div className="profile-info-item">
                        <label htmlFor="skill">
                            Skill Level Notifications
                            <input type="checkbox" name="allow_skill_level_notifications" id="skill" checked={notificationSettings.allow_skill_level_notifications} onChange={handleSettingsChange} />
                            <span className="custom-checkbox"></span>
                        </label>
                        <p>Receive notifications for challenges based on your skill level.</p>
                    </div>

                    <div className="profile-info-item">
                        <label htmlFor="following-user">
                            Following User Notifications
                            <input type="checkbox" name="allow_following_user_notifications" id="following-user" checked={notificationSettings.allow_following_user_notifications} onChange={handleSettingsChange} />
                            <span className="custom-checkbox"></span>
                        </label>
                        <p>Receive notifications for new challenges from users you follow.</p>
                    </div>

                    <div className="profile-info-item">
                        <label htmlFor="following-genre">
                            Following Genre Notifications
                            <input type="checkbox" name="allow_following_genre_notifications" id="following-genre" checked={notificationSettings.allow_following_genre_notifications} onChange={handleSettingsChange} />
                            <span className="custom-checkbox"></span>
                        </label>
                        <p>Receive notifications for new challenges from genres you follow.</p>
                    </div>
                </>
            ) : (
                <div className="profile-info-item">
                    <p>Turn on notifications to customize your notification settings.</p>
                </div>
            )}

            <button className="settings-default-btn settings-btn" onClick={() => resetSettings('default')}>Reset to Default</button>
        </section>
    );
};