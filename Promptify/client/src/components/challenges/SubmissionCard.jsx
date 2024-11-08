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
//import "../../styles/challenges/submission-card.css"; // styling for the submission card

// import any images or assets here

export default function SubmissionCard({ challenge, submission }) {
    const { user } = useContext(AuthContext); // context used for authentication
    const [author, setAuthor] = useState([]);
    const [comments, setComments] = useState([]);
    const [upvotes, setUpvotes] = useState([]);

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
                setComments(data);
            } else {
                console.error(data.error);
            };
        };

        async function fetchUpvotes() {
            const response = await fetch(`/api/upvotes/submission/${submission.id}`);
            const data = await response.json();

            if (response.ok) {
                setUpvotes(data);
            } else {
                console.error(data.error);
            };
        };

        fetchAuthor();
        //fetchComments();
        //fetchUpvotes();
    }, [submission]);

    const splicedContent = `${submission.content.slice(0, 300)}...`;

    return (
        <li className={`submission-card`}>
            <div className="submission-card-header">
                {/**
                * TODO:
                * - Add submission title
                * - Add submission author
                * - Add submission date
                * - Add submission tags (genre, word count, character count)
                * - Add submission total time
                */}
                <h3>{submission.title}</h3>
                <p>{author.username}</p>
                <p>{submission.submitted_at}</p>
                <p>{submission.genre}</p>
                <p>{submission.word_count} words</p>
                <p>{submission.character_count} characters</p>
            </div>

            <div className="submission-card-content">
                {/**
                * TODO:
                * - Show submission description
                * - Show spliced submission content
                */}
                <p>{submission.summary}</p>
                <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(splicedContent) }}></div>
            </div>

            <div className="submission-card-footer">
                {/**
                * TODO: 
                * - Add button to view submission
                * - Show total number of upvotes and comments
                * - Show top 3 comments
                * - Add input field to submit a comment
                */}
                <Link to={`/submissions/${submission.id}`} className="button">View Submission</Link>
                <p>{upvotes.length} Upvotes</p>
                <p>{comments.length} Comments</p>
                <ul>
                    {comments.slice(0, 3).map(comment => (
                        <li key={comment.id}>
                            <p>{comment.content}</p>
                        </li>
                    ))}
                </ul>

            </div>
        </li>
    );
};