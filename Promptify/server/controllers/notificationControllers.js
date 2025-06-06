import { pool } from '../config/database.js';
import { io } from '../server.js';
import { v4 as uuidv4 } from 'uuid';

const notificationCheck = async (results, res) => {
    try {
        let updates = [];

        if (results.rows.length === 0) {
            return;
        };

        for (let i = 0; i < results.rows.length; i++) {
            const user = results.rows[i];
            let notificationsToKeep = [];
            let notificationsToDelete = [];

            if (user.notifications === null || user.notifications === undefined) {
                await pool.query('UPDATE users SET notifications = $1 WHERE id = $2', [JSON.stringify([]), user.id]);
            }

            if (user.notifications.length === 0 || user.notifications.length === undefined || user.notifications === null) {
                continue;
            }

            for (const notification of user.notifications) {
                const dateDeleted = new Date(notification.date_deleted);
                const currentDate = new Date();

                if (dateDeleted !== null && dateDeleted !== undefined) {
                    if (currentDate - dateDeleted > 30) {
                        notificationsToDelete.push(notification);
                    } else {
                        notificationsToKeep.push(notification);
                    }
                } else {
                    notificationsToKeep.push(notification);
                }
            }

            if (notificationsToDelete.length > 0) {
                await pool.query(`
                    UPDATE users
                    SET notifications = notifications - $1
                    WHERE id = $2
                `, [JSON.stringify(notificationsToDelete), user.id]);
            };

            updates.push({
                id: user.id,
                notifications: notificationsToKeep
            });
        }

        for (const update of updates) {
            await pool.query('UPDATE users SET notifications = $1 WHERE id = $2', [update.notifications, update.id]);
        }
    } catch (error) {
        console.error('Error checking notifications:', error);
    };
};

export const getAllNotifications = async (req, res) => {
    try {
        const results = await pool.query('SELECT notifications FROM users');

        await notificationCheck(results, res);

        res.status(200).json(results.rows);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'An unexpected error occurred' });
    };
};

export const getNotificationsByUserId = async (req, res) => {
    try {
        const { userId } = req.params;

        const results = await pool.query('SELECT notifications FROM users WHERE id = $1', [userId]);

        if (results.rows.length === 0) {
            return res.status(404).json({ error: 'Notifications for this user not found.' });
        };

        if (results.rows[0].notifications === null || results.rows[0].notifications === undefined) {
            return res.status(200).json([]);
        };
        
        await notificationCheck(results, res);

        res.status(200).json(results.rows);
    } catch (error) {
        console.error('Error fetching notifications by user ID:', error);
        res.status(500).json({ error: 'An unexpected error occurred' });
    };
};

export const getNotificationsByNotificationId = async (req, res) => {
    try {
        const { userId, notificationId } = req.params;

        const results = await pool.query(`
            SELECT notification
            FROM users, jsonb_array_elements(notifications) AS notification
            WHERE id = $1 AND notification->>'id' = $2
        `, [userId, notificationId]);

        if (results.rows.length === 0) {
            return res.status(404).json({ error: 'Notification not found' });
        };

        res.status(200).json(results.rows[0].notification);
    } catch (error) {
        console.error('Error fetching notification by user ID and notification ID:', error);
        res.status(500).json({ error: 'An unexpected error occurred' });
    };
}

export const updateNotificationStatus = async (req, res) => {
    try {
        const { userId, notificationId, status } = req.params;
        const statusOptions = ['read', 'unread', 'delete', 'permanently_delete'];
        let deleteDate = null;

        if (!statusOptions.includes(status)) {
            return res.status(400).json({ error: 'Invalid status option' });
        };

        if (status === 'delete') {
            deleteDate = new Date().toISOString();
        };

        const notification = await pool.query(`
            SELECT notification
            FROM users, jsonb_array_elements(notifications) AS notification
            WHERE id = $1 AND notification->>'id' = $2
        `, [userId, notificationId]);

        if (notification.rows.length === 0) {
            return res.status(404).json({ error: 'Notification not found' });
        };

        if (status === 'permanently_delete') {
            const results = await pool.query(`
                UPDATE users
                SET notifications = (
                    SELECT jsonb_agg(notification)
                    FROM jsonb_array_elements(notifications) AS notification
                    WHERE notification->>'id' != $2
                )
                WHERE id = $1
                RETURNING notifications;
            `, [userId, notificationId]);

            // if (results.rows[0].notifications.length === 0) {
            //     results.rows[0].notifications = [];
            // };

            await notificationCheck(results, res);

            if (results.rowCount === 0) {
                return res.status(404).json({ error: 'Notification not found' });
            };

            return res.status(200).json({ message: 'Notification permanently deleted' });
        };

        // 12/30/2024 - change so that notifications set for deletion gain a date_deleted value
        const results = await pool.query(`
            UPDATE users
            SET notifications = (
                SELECT jsonb_agg(
                    CASE
                        WHEN notification->>'id' = $2 THEN
                            jsonb_set(
                                jsonb_set(notification, '{status}', $3::jsonb),
                                '{date_deleted}', $4::jsonb
                            )
                        ELSE notification
                    END
                )
                FROM jsonb_array_elements(notifications) AS notification
            )
            WHERE id = $1
            RETURNING notifications;
        `, [userId, notificationId, JSON.stringify(status), JSON.stringify(deleteDate)]);

        await notificationCheck(results, res);

        if (results.rowCount === 0) {
            return res.status(404).json({ error: 'Notification not found' });
        };

        let data = notification.rows[0].notification;

        io.emit('receive-notification', { userId, data, status });

        res.status(200).json({ message: 'Notification status updated' });
    } catch (error) {
        console.error('Error updating notification status:', error);
        res.status(500).json({ error: 'An unexpected error occurred' });
    };
};

export const updateAllNotificationsStatus = async (req, res) => {
    try {
        const { userId, startStatus, toStatus } = req.params;

        if (toStatus === 'permanently_delete') {
            const results = await pool.query(`
                UPDATE users
                SET notifications = (
                    SELECT jsonb_agg(notification)
                    FROM jsonb_array_elements(notifications) AS notification
                    WHERE notification->>'status' != $2
                )
                WHERE id = $1
                RETURNING notifications;
            `, [userId, startStatus]);

            await notificationCheck(results, res);

            if (results.rowCount === 0) {
                return res.status(404).json({ error: 'Notifications not found' });
            };

            return res.status(200).json({ message: 'Notifications permanently deleted' });
        };

        const results = await pool.query(`
            UPDATE users SET notifications = (
                SELECT jsonb_agg(
                    CASE
                        WHEN notification->>'status' = $2 THEN
                            jsonb_set(notification, '{status}', $3::jsonb)
                        ELSE notification
                    END
                )
                FROM jsonb_array_elements(notifications) AS notification
            )
            WHERE id = $1
            RETURNING notifications;
        `, [userId, startStatus, JSON.stringify(toStatus)]);

        await notificationCheck(results, res);

        if (results.rowCount === 0) {
            return res.status(404).json({ error: 'Notifications not found' });
        };

        let data = results.rows[0].notifications;

        data.forEach(notification => {
            io.emit('receive-notification', { userId, data: notification, status: toStatus });
        });

        res.status(200).json({ message: 'Notifications status updated' });
    } catch (error) {
        console.error('Error updating all notifications status:', error);
        res.status(500).json({ error: 'An unexpected error occurred' });
    };
};

export const sendNotificationToUser = async (req, res) => {
    try {
        let { title, content, type, to } = req.body;

        let recipientIds = [];

        if (to.find(user => user === 'all')) {
            let results = await pool.query('SELECT id, username FROM users');
            results = results.rows.filter(user => user.username !== 'deleted_user' && user.username !== 'PromptifyBot');

            recipientIds.push(...results.map(user => user.id));
        } else {
            recipientIds.push(...to);
        };

        const notification = {
            id: uuidv4(),
            title,
            content,
            type,
            status: 'unread',
            date_created: new Date().toISOString(),
            date_deleted: null
        };

        for (const recipientId of recipientIds) {
            const user = await pool.query('SELECT * FROM users WHERE id = $1', [recipientId]);

            if (user.rows.length === 0) continue;
            if (user.rows[0].notifications_settings.allow_notifications === false) continue;

            const results = await pool.query(`
                UPDATE users
                SET notifications = notifications || $1
                WHERE id = $2
                RETURNING notifications;
            `, [JSON.stringify(notification), recipientId]);

            await notificationCheck(results, res);
            io.emit('receive-notification', { userId: recipientId, notification, status: 'unread' });
        };

        res.status(201).json({ message: 'Notification sent' });
    } catch (error) {
        console.error('Error sending notification:', error);
        res.status(500).json({ error: 'An unexpected error occurred' });
    };
};

export const sendSeveralNotificationsToUsers = async (req, res) => {
    try {
        const notifications = req.body;
        if (!Array.isArray(notifications)) {
            console.error('Notifications payload should be an array');
            return res.status(400).json({ error: 'Notifications payload should be an array' });
        };

        for (const notification of notifications) {
            const { title, content, type, to } = notification;
            let recipientIds = [];
            recipientIds.push(...to);

            const notificationObject = {
                id: uuidv4(),
                title,
                content,
                type,
                status: 'unread',
                date_created: new Date().toISOString(),
                date_deleted: null,
            };

            for (const recipientId of recipientIds) {
                const user = await pool.query('SELECT * FROM users WHERE id = $1', [recipientId]);

                if (user.rows.length === 0) continue;
                if (!user.rows[0].notifications_settings.allow_notifications) continue;

                const results = await pool.query(
                    `UPDATE users
                    SET notifications = notifications || $1
                    WHERE id = $2`,
                    [JSON.stringify(notificationObject), recipientId]
                );

                await notificationCheck(results, res);
                io.emit('receive-notification', {
                    userId: recipientId,
                    notification: notificationObject,
                    status: 'unread',
                });
            };
        };

        res.status(201).json({ message: 'Notifications sent successfully' });
    } catch (error) {
        console.error('Error sending notifications:', error);
        res.status(500).json({ error: 'An unexpected error occurred' });
    };
};