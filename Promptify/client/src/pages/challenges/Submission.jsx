import { useEffect, useState, useContext } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { io } from 'socket.io-client'; // used to connect to the server's socket
import AuthContext from "../../context/AuthProvider.jsx";
import LoadingScreen from "../../components/global/LoadingScreen.jsx";
import MessagePopup from "../../components/global/MessagePopup.jsx";
import PageTitle from "../../components/global/PageTitle.jsx";
import FeedBackCard from "../../components/submissions/FeedBackCard.jsx";
import "../../styles/submissions/submission.css";

// import any images or assets here
import thumbsUpImg from "../../assets/thumbs_up.svg";
import thumbsUpFilledImg from "../../assets/thumbs_up_filled.svg";

export default function Submission() {
    const socket = io(import.meta.env.VITE_BACKEND_URL, { autoConnect: false }); // connect to the server's socket
    const { user } = useContext(AuthContext); // context used for authentication
    const [loading, setLoading] = useState(true); // set to false when done loading
    const [message, setMessage] = useState(""); // set to message to display in message popup
    const { submissionId } = useParams();
    const [submission, setSubmission] = useState([]);
    const [author, setAuthor] = useState([]);
    const [comments, setComments] = useState([]);
    const [upvotes, setUpvotes] = useState([]);
    const [newComment, setNewComment] = useState({
        content: "",
        parentCommentId: null
    })

    const [openComments, setOpenComments] = useState(false);

    useEffect(() => {
        socket.connect(); // connect to the server's socket

        socket.on('receive-comment', (data) => {
            if (data.submission_id === submissionId) {
                setComments(prevComments => [...prevComments, data]);
            }
        });

        return () => {
            socket.disconnect(); // disconnect from the server's socket
        };
    })

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
        async function fetchData() {
            try {
                const submissionResponse = await fetch(`/api/submissions/${submissionId}`);
                const submissionData = await submissionResponse.json();
    
                if (submissionResponse.ok) {
                    setSubmission(submissionData[0]);
    
                    const authorResponse = await fetch(`/api/users/${submissionData[0].author_id}`);
                    const authorData = await authorResponse.json();
                    if (authorResponse.ok) setAuthor(authorData[0]);
    
                    const commentsResponse = await fetch(`/api/comments/submission/${submissionId}`);
                    const commentsData = await commentsResponse.json();
                    if (commentsResponse.ok) {
                        const commentsWithInfo = await Promise.all(commentsData.map(async comment => {
                            const userResponse = await fetch(`/api/users/${comment.user_id}`);
                            const userData = await userResponse.json();
                            const author = userData[0].username;
                            const childrenComments = commentsData.filter(childComment => childComment.parent_comment_id === comment.id);
    
                            return {
                                ...comment,
                                author,
                                childrenComments
                            };
                        }));
                        setComments(commentsWithInfo);
                    }
    
                    const upvotesResponse = await fetch(`/api/upvotes/submission/${submissionData[0].id}`);
                    const upvotesData = await upvotesResponse.json();
                    if (upvotesResponse.ok) setUpvotes(upvotesData);
                } else {
                    console.error(submissionData.error);
                }
    
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        }
    
        fetchData();
    }, [submissionId]);    

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

    const submitComment = async () => {
        const response = await fetch(`/api/comments/user/${user.id}/submission/${submissionId}/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newComment)
        });

        const data = await response.json();

        if (response.ok) {
            setNewComment({
                content: "",
                parentCommentId: null
            });
        } else {
            console.error(data.error);
        };
    };

    const handleSubNavClick = (section) => {
        const element = document.getElementById(section);
        const offset = 80;
        window.scrollTo({
            top: element.offsetTop - offset,
            behavior: 'smooth'
        });
    };

    return (
        <>
            {loading ? <LoadingScreen /> : null}
            <PageTitle title={`${submission.title} | Promptify`} />

            <main id="submission-body" className="container">
                <section className="submission-nav-section">
                    <Link to={`/challenges/${submission.challenge_id}`} className="submission-nav-link">Back To Challenge</Link>
                    <p className="submission-nav-link" onClick={() => handleSubNavClick('feedback')}>Scroll To Feedback</p>
                </section>
                <section className="submission-section">
                    <div className="submission-header">
                        <h1>{submission.title}</h1>
                        <Link to={`/@${author.username}`} className="submission-header-username">{author.username}</Link>
                        <p className="submission-header-summary">{submission.summary}</p>
                        <div className="submission-header-stats-holder">
                            <p className="submission-header-stat">{new Date(submission.submitted_at).toLocaleDateString()}</p>
                            <p className="submission-header-stat">{submission.genre}</p>
                            <p className="submission-header-stat">{submission.word_count} words</p>
                            <p className="submission-header-stat">{submission.character_count} characters</p>
                        </div>
                        <div className="stat-count-holder" id="upvote-holder" title={upvotes.length === 1 ? `${upvotes.length} Upvote` : `${upvotes.length} Upvotes`}>
                            <p>{upvotes.length}</p>
                            <button type="button" className="stat-btn" onClick={handleUpvote}>
                                <img src={upvotes.find(upvote => upvote.user_id === user?.id) ? thumbsUpFilledImg : thumbsUpImg} alt="Thumbs up icon" />
                            </button>
                        </div>
                    </div>
                    
                    <div id="submission-content" dangerouslySetInnerHTML={{ __html: submission.content }}></div>

                </section>

                <section className="submission-feedback" id="feedback">
                    <h2>
                        Feedback 
                        <span className="submission-feedback-count">{comments.length}</span>
                    </h2>
                    <ul id="feedback-list">
                        {comments.map(comment => (
                            <FeedBackCard key={comment.id} comment={comment} />
                        ))}
                    </ul>

                    <div className="new-comment">
                        <form>
                            <textarea
                                placeholder="Add a comment..."
                                value={newComment.content}
                                onChange={e => setNewComment({ ...newComment, content: e.target.value })}
                            ></textarea>
                            <button type="button" className="challenge-card-button" onClick={submitComment}>Submit</button>
                        </form>
                    </div>
                </section>
            </main>
            
            {message && <MessagePopup message={message} setMessage={setMessage} />}
        </>
    );
};