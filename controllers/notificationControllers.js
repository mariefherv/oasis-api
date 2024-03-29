const db = require('../index');

// view all notifications
module.exports.viewAll = (req,res) => {
    const user_id = req.user.user_id

let sql = `
    SELECT
        notifications.*,
        CASE
            WHEN notifications.type = 'like_post'
            THEN (
                SELECT COUNT(like_id)
                FROM likes
                INNER JOIN posts ON posts.post_id = likes.post_id
                WHERE likes.post_id = notifications.post_id
                AND posts.user_id = '${user_id}'
                LIMIT 1
            )
            WHEN notifications.type = 'like_comment'
            THEN (
                SELECT COUNT(like_id)
                FROM comment_likes
                INNER JOIN comments ON comments.comment_id = comment_likes.comment_id
                WHERE comment_likes.comment_id = notifications.comment_id
                AND comments.user_id = '${user_id}'
                LIMIT 1
            )
            ELSE 0
        END AS like_count,
        CASE
            WHEN notifications.type = 'comment'
            THEN (
                SELECT COUNT(DISTINCT comments.user_id)
                FROM comments
                INNER JOIN posts ON posts.post_id = comments.post_id
                WHERE comments.post_id = notifications.post_id
                AND posts.post_id = notifications.post_id
                LIMIT 1
            )
            ELSE 0
        END AS comment_count,
        CASE
            WHEN notifications.type = 'confirm_booking' OR notifications.type = 'decline_booking' OR notifications.type = 'slots'
            THEN (
                SELECT therapists.prefix
                FROM therapists
                INNER JOIN notifications ON therapists.user_id = notifications.triggered_by
                WHERE notifications.notification_id = notifications.notification_id
                GROUP BY therapists.prefix
                LIMIT 1
            )
            ELSE NULL
        END AS prefix,
        CASE
            WHEN notifications.type = 'confirm_booking' OR notifications.type = 'decline_booking' OR notifications.type = 'slots'
            THEN (
                SELECT therapists.last_name
                FROM therapists
                INNER JOIN notifications ON therapists.user_id = notifications.triggered_by
                WHERE notifications.notification_id = notifications.notification_id 
                GROUP BY therapists.last_name
                LIMIT 1
            )
            ELSE NULL
        END AS last_name,
        u1.username AS user_username,
        u1.gender AS user_gender,
        u1.role AS user_role,
        u2.username AS triggered_by_username,
        u2.gender AS triggered_by_gender,
        u2.role AS triggered_by_role
        FROM notifications
        LEFT JOIN users u1 ON u1.user_id = notifications.user_id
        INNER JOIN users u2 ON u2.user_id = notifications.triggered_by
        WHERE notifications.user_id = '${user_id}'  
    ORDER BY notifications.created DESC;
    `;


    db.query(sql, (err,result) => {
		if(err) throw err;
        res.send(result)
	}
    )
}

// view all unread
module.exports.viewUnread = (req,res) => {
    const user_id = req.user.user_id

let sql = `
SELECT
	notifications.*,
    CASE
        WHEN notifications.type = 'like_post'
        THEN (
            SELECT COUNT(like_id)
            FROM likes
            INNER JOIN posts ON posts.post_id = likes.post_id
            WHERE likes.post_id = notifications.post_id
            AND posts.user_id = '${user_id}'
            LIMIT 1
        )
        WHEN notifications.type = 'like_comment'
        THEN (
            SELECT COUNT(like_id)
            FROM comment_likes
            INNER JOIN comments ON comments.comment_id = comment_likes.comment_id
            WHERE comment_likes.comment_id = notifications.comment_id
            AND comments.user_id = '${user_id}'
            LIMIT 1
        )
        ELSE 0
    END AS like_count,
    CASE
        WHEN notifications.type = 'comment'
        THEN (
            SELECT COUNT(DISTINCT comments.user_id)
            FROM comments
            INNER JOIN posts ON posts.post_id = comments.post_id
            WHERE comments.post_id = notifications.post_id
            AND posts.post_id = notifications.post_id
            LIMIT 1
        )
        ELSE 0
    END AS comment_count,
    CASE
        WHEN notifications.type = 'confirm_booking' OR notifications.type = 'decline_booking' OR notifications.type = 'slots'
        THEN (
            SELECT therapists.prefix
            FROM therapists
            INNER JOIN notifications ON therapists.user_id = notifications.triggered_by
            WHERE notifications.notification_id = notifications.notification_id
            GROUP BY therapists.prefix
            LIMIT 1
        )
        ELSE NULL
    END AS prefix,
    CASE
        WHEN notifications.type = 'confirm_booking' OR notifications.type = 'decline_booking' OR notifications.type = 'slots'
        THEN (
            SELECT therapists.last_name
            FROM therapists
            INNER JOIN notifications ON therapists.user_id = notifications.triggered_by
            WHERE notifications.notification_id = notifications.notification_id 
            GROUP BY therapists.last_name
            LIMIT 1
        )
        ELSE NULL
    END AS last_name,
    u1.username AS user_username,
    u1.gender AS user_gender,
    u1.role AS user_role,
    u2.username AS triggered_by_username,
    u2.gender AS triggered_by_gender,
    u2.role AS triggered_by_role
    FROM notifications
    LEFT JOIN users u1 ON u1.user_id = notifications.user_id
    INNER JOIN users u2 ON u2.user_id = notifications.triggered_by
    WHERE notifications.user_id = '${user_id}'  
    AND notifications.marked_read = 0
    ORDER BY notifications.created DESC;`;



    db.query(sql, (err,result) => {
		if(err) throw err;
        res.send(result)
	}
    )
}

// mark notification as read

module.exports.markRead = (req,res) => {
    const user_id = req.user.user_id
    const notif_id = req.params.notification_id

    let sql = `UPDATE notifications SET marked_read = 1 WHERE notification_id = '${notif_id}' AND user_id = '${user_id}'`

    db.query(sql, (err,result) => {
		if(err) throw err;
        result.affectedRows !== 0 ? res.send(true) : res.send(false) 
	}
    )
}