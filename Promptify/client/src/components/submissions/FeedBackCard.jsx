/**
 * Desc: FeedBack Card component for the submissions page.
 *     This component displays a feedback card with the feedback details.
 * File: Promptify/client/src/components/submissions/FeedBackCard.jsx
*/

// general imports
import { useEffect, useState, useContext } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";

// loading screen for when the page is loading (also used for transitions and testing)
import LoadingScreen from "../global/LoadingScreen.jsx";

// message popup for errors, warnings, and successes
import MessagePopup from "../global/MessagePopup.jsx";

// some pages may also need to import utils, hooks, or context
import AuthContext from "../../context/AuthProvider.jsx"; // context used for authentication

// styling for page will be imported here
import "../../styles/submissions/feedback-card.css"; // styling for the submission card

// import any images or assets here
import commentsImg from "../../assets/comments.svg";
import commentsFilledImg from "../../assets/comments_filled.svg";

export default function FeedBackCard({ key, comment, childrenComments }) {
    const { user } = useContext(AuthContext); // context used for authentication
    const [author, setAuthor] = useState([]);
    const [openComments, setOpenComments] = useState(false);

    useEffect(() => {
        async function fetchAuthor() {
            const response = await fetch(`/api/users/${comment.user_id}`);
            const data = await response.json();

            if (response.ok) {
                setAuthor(data[0]);
            } else {
                console.error(data.error);
            };
        };

        fetchAuthor();
    }, [comment.author_id]);

    const toggleComments = () => {
        setOpenComments(!openComments);
    };

    return (
        <li className="feedback-card">
            <div className="feedback-card-header">
                <div className="feedback-card-author">
                    <Link to={`/@${author.username}`}>
                        <img src={author.profile_picture_url} alt="Author profile picture" />
                        <span>{author.username}</span>
                    </Link>
                </div>
                <div className="feedback-card-date">
                    <span>{new Date(comment.date_created).toLocaleDateString()}</span>
                </div>

            </div>

            <div className="feedback-card-content-holder">
                <div className="feedback-card-content">
                    <p>{comment.content}</p>
                </div>
            </div>

            <div className="feedback-card-footer">
                <div className="feedback-card-comments">
                    <button onClick={toggleComments}>
                        <img src={commentsImg} alt="Comments icon" />
                        <span>{comment.children_comments_count || 0}</span>
                    </button>
                </div>
            </div>
        </li>
    );
};