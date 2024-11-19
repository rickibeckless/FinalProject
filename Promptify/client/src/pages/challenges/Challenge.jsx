import { useEffect, useState, useContext } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import AuthContext from "../../context/AuthProvider.jsx";
import LoadingScreen from "../../components/global/LoadingScreen.jsx";
import MessagePopup from "../../components/global/MessagePopup.jsx";
import PageTitle from "../../components/global/PageTitle.jsx";
import EditChallenge from "../../components/challenges/modals/EditChallenge.jsx";
import SubmissionCard from "../../components/challenges/SubmissionCard.jsx";

import "../../styles/challenges/challenge.css";

import BookmarkImg from "../../assets/bookmark.svg";
import BookmarkFilledImg from "../../assets/bookmark_filled.svg";

export default function Challenge() {
    const [loading, setLoading] = useState(true); // set to false when done loading
    const [message, setMessage] = useState(""); // set to message to display in message popup
    const { user } = useContext(AuthContext);

    const [challenge, setChallenge] = useState({});
    const [submissions, setSubmissions] = useState([]);
    const { challengeId } = useParams();

    const [author, setAuthor] = useState({});
    const [openEditModal, setOpenEditModal] = useState(false);

    const [bookmarkedChallenge, setBookmarkedChallenge] = useState(false);
    const [openPointsInfo, setOpenPointsInfo] = useState(false);

    const navigate = useNavigate(); // used to navigate to a different page

    useEffect(() => {
        async function fetchChallenge() {
            const response = await fetch(`/api/challenges/${challengeId}`);
            const data = await response.json();

            if (response.ok) {
                setChallenge(data[0]);
                setLoading(false);

                const authorResponse = await fetch(`/api/users/${data[0].author_id}`);
                const authorData = await authorResponse.json();

                if (authorResponse.ok) {
                    setAuthor(authorData[0]);
                } else {
                    setMessage(authorData.message);
                };
            } else {
                setMessage(data.message);
            };
        };

        async function fetchSubmissions() {
            const response = await fetch(`/api/submissions/challenge/${challengeId}`);
            const data = await response.json();

            if (response.ok) {
                setLoading(false);

                setSubmissions(data);
            } else {
                setMessage(data.message);
            };
        };

        async function checkIfBookmarked() {
            if (user) {
                if (user.bookmarked_challenges.includes(challenge.id)) {
                    setBookmarkedChallenge(true);
                } else {
                    setBookmarkedChallenge(false);
                };
            };
        };

        fetchChallenge();
        fetchSubmissions();
        checkIfBookmarked();
    }, [user, challengeId]);

    const handleBookmark = async () => {
        if (user) {
            const response = await fetch(`/api/users/${user.id}/${challenge.id}/bookmark`, {
                method: "PATCH",
                headers: {
                    role: user ? "user" : "none",
                },
            });

            if (response.ok) {
                setBookmarkedChallenge(!bookmarkedChallenge);
            } else {
                console.error("Error bookmarking challenge");
            };
        } else {
            console.error("User not logged in");
        };
    };

    const toggleEditChallenge = async (type, previousType) => {
        if (previousType === "close") {
            setOpenEditModal(false);
            document.body.classList.remove("modal-open");
            return;
        } else {
            document.body.classList.toggle("modal-open");
        }

        if (challenge.status !== "upcoming" && user.isAdmin === false) {
            setMessage("Cannot edit a challenge that is in-progress or ended!");
            return;
        };

        setOpenEditModal(true);
    };

    return (
        <>
            {loading ? <LoadingScreen /> : null}
            <PageTitle title={`${challenge.name} | Promptify`} />

            <main id="challenge-body" className="container">
                <section id="challenge-info" className="challenge-section">
                    <h1 className="section-title">{challenge.name}</h1>
                    <div id="challenge-details" className="challenge-details">
                        <div className="detail-row">
                            <p className="detail-label">Author:</p>
                            <Link to={`/@${author.username}`} className="detail-content author-link">{author.username}</Link>
                        </div>
                        <div className="detail-row long">
                            <p className="detail-label">Description:</p>
                            <p className="detail-content">{challenge.description}</p>
                        </div>
                        <div className="detail-row long">
                            <p className="detail-label">Prompt:</p>
                            <p className="detail-content">{challenge.prompt}</p>
                        </div>
                        <div className="detail-row">
                            <p className="detail-label">Status:</p>
                            <p className={`status-badge status-${challenge.status}`}>
                                {challenge.status}
                            </p>
                        </div>
                        <div className="detail-row">
                            <p className="detail-label">Skill Level:</p>
                            <p className="detail-content">{challenge.skill_level}</p>
                        </div>
                        <div className="detail-row">
                            <p className="detail-label">Genre:</p>
                            <p className="detail-content">{challenge.genre}</p>
                        </div>
                        <div className="detail-row">
                            <p className="detail-label">Start Date:</p>
                            <p className="detail-content">
                                {new Date(challenge.start_date_time).toLocaleString()}
                            </p>
                        </div>
                        <div className="detail-row">
                            <p className="detail-label">End Date:</p>
                            <p className="detail-content">
                                {new Date(challenge.end_date_time).toLocaleString()}
                            </p>
                        </div>
                        <div className="detail-row" onMouseEnter={() => setOpenPointsInfo(true)} onMouseLeave={() => setOpenPointsInfo(false)}>
                            <p className="detail-label">Available Points:</p>
                            <p className="detail-content">{challenge.available_points}</p>
                        </div>
                        <div className={`detail-row points-info ${openPointsInfo ? 'active' : ''}`}>
                            <ul>
                                <li>1st place: 50%</li>
                                <li>2nd place: 30%</li>
                                <li>3rd place: 20%</li>
                            </ul>
                            <p>
                                You will receive points based on your placement in the challenge! 
                                Places are decided by how many upvotes your submission receives!
                            </p>
                        </div>
                    </div>

                    {openEditModal && <EditChallenge toggleEditChallenge={toggleEditChallenge} challenge={challenge} />}
                </section>

                <section id="challenge-actions" className="challenge-section">
                    {user ? (
                        <>
                            {(user.id === challenge.author_id || user.isAdmin) && (
                                <button
                                    id="edit-challenge-button"
                                    className={`challenge-card-button ${(challenge.status !== "upcoming" && user.isAdmin === false) ? "disabled" : ""}`}
                                    title={`${challenge.status !== "upcoming" ? "Cannot edit a challenge that is in-progress or ended!" : "Edit this challenge"}`}
                                    type="button"
                                    onClick={() => toggleEditChallenge('edit')}
                                >
                                    Edit Challenge
                                </button>
                            )}
                            
                            {user.id !== challenge.author_id && (
                                !bookmarkedChallenge ? (
                                    <>
                                        <button className="bookmark-holder" title="Bookmark this challenge for later!" type="button" onClick={handleBookmark}>
                                            <img className="bookmark" src={BookmarkImg} alt="bookmark" />
                                        </button>
                                        <p>Bookmark this challenge to save it for later!</p>
                                    </>
                                ) : (
                                    <>
                                        <button className="bookmark-holder filled" title="Remove bookmark" type="button" onClick={handleBookmark}>
                                            <img className="bookmark filled" src={BookmarkFilledImg} alt="filled bookmark" />
                                        </button>
                                        <p>Challenge bookmarked!</p>
                                    </>
                                )
                            )}
                        </>
                    ) : (
                        <>
                            <p className="no-submissions-message">Login or Signup to participate or save this challenge for later!</p>
                        </>
                    )}
                </section>

                <section id="challenge-submissions" className="challenge-section">
                    <h2 className="section-title">Submissions</h2>
                    {submissions.length > 0 ? (
                        <ul id="submissions-list" className="submission-list">
                            {submissions.map((submission) => (
                                <SubmissionCard
                                    key={submission.id}
                                    challenge={challenge}
                                    submission={submission}
                                />
                            ))}
                        </ul>
                    ) : (
                        user?.id === challenge.author_id ? (
                            <p className="no-submissions-message">No submissions yet. Try and check back later!</p>
                        ) : (
                            <div className="challenge-submissions-call-to-action">
                                <p className="no-submissions-message">No submissions yet. Be the first to participate!</p>

                                {user && (
                                    <Link to={`/challenges/${challenge.id}/join`} className="challenge-card-button">Join Challenge</Link>
                                )}
                            </div>
                        )
                    )}
                </section>
            </main>

            {message && <MessagePopup message={message} setMessage={setMessage} />}
        </>
    );
}
