import { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

    async function fetchUpvotes() {
        const response = await fetch(`/api/upvotes/submission/${submission.id}`);
        const data = await response.json();

        if (response.ok) {
            setUpvotes(data);
        } else {
            console.error(data.error);
        };
    };

    /*
    useEffect(() => {
        async function fetchSubmission() {
            const response = await fetch(`/api/submissions/${submissionId}`);
            const data = await response.json();

            if (response.ok) {
                setSubmission(data[0]);
            } else {
                console.error(data.error);
            };
        };

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
            const response = await fetch(`/api/comments/submission/${submissionId}`);
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

        fetchSubmission();
        fetchAuthor();
        fetchComments();
        fetchUpvotes();
        setLoading(false);
    }, []); */

    useEffect(() => {
        async function fetchData() {
            try {
                // First, fetch submission
                const submissionResponse = await fetch(`/api/submissions/${submissionId}`);
                const submissionData = await submissionResponse.json();
    
                if (submissionResponse.ok) {
                    setSubmission(submissionData[0]);
    
                    // Fetch author after submission is fetched
                    const authorResponse = await fetch(`/api/users/${submissionData[0].author_id}`);
                    const authorData = await authorResponse.json();
                    if (authorResponse.ok) setAuthor(authorData[0]);
    
                    // Fetch comments after submission is fetched
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
    
                    // Fetch upvotes after submission is fetched
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

    return (
        <>
            {loading ? <LoadingScreen /> : null}
            <PageTitle title={`${submission.title} | Promptify`} />

            <main id="submission-body" className="container">
                <section className="submission-section">
                    <div className="submission-header">
                        <h1>{submission.title}</h1>
                        <p>{author.username}</p>
                        <p>{submission.summary}</p>
                        <p>{submission.word_count} words</p>
                        <p>{submission.character_count} characters</p>
                    </div>
                    
                    <div id="submission-content" dangerouslySetInnerHTML={{ __html: submission.content }}></div>

                </section>

                <section className="submission-feedback">
                    <h2>Feedback</h2>
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
                            <button type="button" onClick={submitComment}>Submit</button>
                        </form>
                    </div>
                </section>
            </main>
            
            {message && <MessagePopup message={message} setMessage={setMessage} />}
        </>
    );
};