/**
 * Desc: Submission Card component for the submissions page.
 *      This component displays a submission card with the submission details.
 * File: Promptify/client/src/components/challenges/SubmissionCard.jsx
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
import "../../styles/submissions/submission-card.css"; // styling for the submission card

// import any images or assets here
import commentsImg from "../../assets/comments.svg";
import commentsFilledImg from "../../assets/comments_filled.svg";
import thumbsUpImg from "../../assets/thumbs_up.svg";
import thumbsUpFilledImg from "../../assets/thumbs_up_filled.svg";

export default function SubmissionCard({ submission }) {
    const { user } = useContext(AuthContext); // context used for authentication
    const [author, setAuthor] = useState([]);
    const [comments, setComments] = useState([]);
    const [upvotes, setUpvotes] = useState([]);

    const [openComments, setOpenComments] = useState(false);

    async function fetchUpvotes() {
        const response = await fetch(`/api/upvotes/submission/${submission.id}`);
        const data = await response.json();

        if (response.ok) {
            setUpvotes(data);
        } else {
            console.error(data.error);
        };
    };

    useEffect(() => {
        async function fetchAuthor() {
            const response = await fetch(`/api/users/${submission.author_id}`);
            const data = await response.json();

            if (response.ok) {
                setAuthor(data[0]);
            } else {
                console.error(data.error);
            };
        };

        async function fetchComments() {
            const response = await fetch(`/api/comments/submission/${submission.id}`);
            const data = await response.json();

            if (response.ok) {
                const commentsWithInfo = await Promise.all(data.map(async comment => {
                    const response = await fetch(`/api/users/${comment.user_id}`);
                    const data = await response.json();
                    const author = data[0].username;

                    const childrenComments = data.filter(childComment => childComment.parent_comment_id === comment.id);

                    if (response.ok) {
                        return {
                            ...comment,
                            author,
                            childrenComments
                        };
                    }
                }));

                setComments(commentsWithInfo);
            } else {
                console.error(data.error);
            };
        };

        fetchAuthor();
        fetchComments();
        fetchUpvotes();
    }, [submission]);

    const handleUpvote = async (e) => {
        e.preventDefault();

        const response = await fetch(`/api/upvotes/${submission.id}/upvote`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userId: user?.id
            })
        });

        const data = await response.json();

        if (response.ok) {
            fetchUpvotes();
        } else {
            console.error(data.error);
        };
    };

    const toggleComments = () => {
        setOpenComments(!openComments);
    };

    const splicedContent = `${submission.content.slice(0, 300)}...`;

    const removeHTMLTags = (str) => {
        return str.replace(/<[^>]*>?/gm, '');
    };

    return (
        <li className="submission-card">
            <div className="submission-card-header">
                {/**
                * TODO:
                * - Add submission total time
                */}
                <h3>{submission.title}</h3>
                <Link to={`/@${author.username}`}>{author.username}</Link>
                <p>{new Date(submission.submitted_at).toLocaleDateString()}</p>
                <p>{submission.genre}</p>
                <p>{submission.word_count} words</p>
                <p>{submission.character_count} characters</p>
            </div>

            <div className="submission-card-content-holder">
                <p className="submission-card-summary">{submission.summary}</p>
                <p className="submission-card-content">{removeHTMLTags(splicedContent)}</p>
            </div>

            <div className="submission-card-footer">
                <Link to={`/submissions/${submission.id}`} className="button">View Submission</Link>
                <div className="submission-card-stats-holder">
                    <div className="stat-count-holder" title={upvotes.length === 1 ? `${upvotes.length} Upvote` : `${upvotes.length} Upvotes`}>
                        <p>{upvotes.length}</p>

                        <button className="stat-btn" onClick={(e) => handleUpvote(e)}>
                            {upvotes.find(upvote => upvote.user_id === user?.id) ? (
                                <img key="filled-upvote" className="upvote filled" src={thumbsUpFilledImg} alt="filled upvote icon" />
                            ) : (
                                <img key="empty-upvote" className="upvote" src={thumbsUpImg} alt="upvote icon" />
                            )}
                        </button>
                    </div>

                    <div className="stat-count-holder" onClick={toggleComments} title={comments.length === 1 ? `${comments.length} Comment` : `${comments.length} Comments`}>
                        <p>{comments.length}</p>

                        <button type="button" className="stat-btn">
                            {openComments ? (
                                <img key="filled-comments" className="comments filled" src={commentsFilledImg} alt="filled comments icon" />
                            ) : (
                                <img key="empty-comments" className="comments" src={commentsImg} alt="comments icon" />
                            )}
                        </button>
                    </div>
                </div>

                {openComments && (      
                    <ul className="submission-card-comments-list">
                        
                        {comments.slice(0, 3).map(comment => (
                            <li className="submission-card-comment" key={comment.id}>
                                <Link to={`/@${comment.author}`}>{comment.author}</Link>
                                <p>{new Date(comment.date_created).toLocaleDateString()}</p>
                                <p className="submission-card-comment-content">{comment.content}</p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </li>
    );
};