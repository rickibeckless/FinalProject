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
    const [isTimeLimit, setIsTimeLimit] = useState(false);
    const [isWordLimit, setIsWordLimit] = useState(false);
    const [isCharacterLimit, setIsCharacterLimit] = useState(false);
    const [isRequiredPhrase, setIsRequiredPhrase] = useState(false);

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

                if (data[0].limitations.time_limit.min !== null || data[0].limitations.time_limit.max !== null) {
                    setIsTimeLimit(true);
                };
                if (data[0].limitations.word_limit.min !== null || data[0].limitations.word_limit.max !== null) {
                    setIsWordLimit(true);
                };
                if (data[0].limitations.character_limit.min !== null || data[0].limitations.character_limit.max !== null) {
                    setIsCharacterLimit(true);
                };
                if (data[0].limitations.required_phrase.length > 0) {
                    setIsRequiredPhrase(true);
                };

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

        if (challenge.status !== "upcoming" && user.is_admin === false) {
            setMessage("Cannot edit a challenge that is in-progress or ended!");
            setTimeout(() => setMessage(""), 2000);
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
                        {isTimeLimit && (
                            <div className="detail-row">
                                <p className="detail-label">Time Limit:</p>
                                <p className="detail-content">
                                    {challenge.limitations.time_limit.min !== null ? `${challenge.limitations.time_limit.min} minutes` : "None"}
                                    {challenge.limitations.time_limit.max !== null ? ` - ${challenge.limitations.time_limit.max} minutes` : ""}
                                </p>
                            </div>
                        )}
                        {isWordLimit && (
                            <div className="detail-row">
                                <p className="detail-label">Word Limit:</p>
                                <p className="detail-content">
                                    {challenge.limitations.word_limit.min !== null ? `${challenge.limitations.word_limit.min} words` : "None"}
                                    {challenge.limitations.word_limit.max !== null ? ` - ${challenge.limitations.word_limit.max} words` : ""}
                                </p>
                            </div>
                        )}
                        {isCharacterLimit && (
                            <div className="detail-row">
                                <p className="detail-label">Character Limit:</p>
                                <p className="detail-content">
                                    {challenge.limitations.character_limit.min !== null ? `${challenge.limitations.character_limit.min} characters` : "None"}
                                    {challenge.limitations.character_limit.max !== null ? ` - ${challenge.limitations.character_limit.max} characters` : ""}
                                </p>
                            </div>
                        )}
                        {isRequiredPhrase && (
                            <div className="detail-row long">
                                {challenge.limitations.required_phrase.length > 1 ? (
                                    <p className="detail-label">Required Phrases:</p>
                                ) : (
                                    <p className="detail-label">Required Phrase:</p>
                                )}
                                
                                {challenge.limitations.required_phrase.map((phrase, index) => (
                                    <p key={index} className="detail-content">{phrase}</p>
                                ))}
                            </div>
                        )}
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

                    {openEditModal && <EditChallenge toggleEditChallenge={toggleEditChallenge} challenge={challenge} setChallenge={setChallenge} author={author} user={user} />}
                </section>

                <section id="challenge-actions" className="challenge-section">
                    {user ? (
                        <>
                            {(user.id === challenge.author_id || user.is_admin) && (
                                <button
                                    id="edit-challenge-button"
                                    className={`challenge-card-button ${(challenge.status !== "upcoming" && user.is_admin === false) ? "disabled" : ""}`}
                                    title={`${challenge.status !== "upcoming" ? "Cannot edit a challenge that is in-progress or ended!" : "Edit this challenge"}`}
                                    type="button"
                                    onClick={() => toggleEditChallenge('edit')}
                                >
                                    Edit Challenge
                                </button>
                            )}
                            
                            {user.id !== challenge.author_id && (
                                !bookmarkedChallenge ? (
                                    <div className="challenge-bookmark-option-holder">
                                        <button className="bookmark-holder" title="Bookmark this challenge for later!" type="button" onClick={handleBookmark}>
                                            <img className="bookmark" src={BookmarkImg} alt="bookmark" />
                                        </button>
                                        <p>Bookmark this challenge to save it for later!</p>
                                    </div>
                                ) : (
                                    <div className="challenge-bookmark-option-holder">
                                        <button className="bookmark-holder filled" title="Remove bookmark" type="button" onClick={handleBookmark}>
                                            <img className="bookmark filled" src={BookmarkFilledImg} alt="filled bookmark" />
                                        </button>
                                        <p>Challenge bookmarked!</p>
                                    </div>
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
