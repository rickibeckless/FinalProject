/**
 * Desc: Challenge Card component for the Challenges page.
 *      This component displays a challenge card with the challenge details.
 * File: Promptify/client/src/components/challenges/ChallengeCard.jsx
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
import "../../styles/challenges/challenge-card.css"; // styling for the challenge card

// import any images or assets here
import BookmarkImg from "../../assets/bookmark.svg";
import BookmarkFilledImg from "../../assets/bookmark_filled.svg";
import AuthorImg from "../../assets/imgs/blank_profile_picture.png";

export default function ChallengeCard({ sortBy, challenge, index }) {
    const { user } = useContext(AuthContext); // context used for authentication
    const [author, setAuthor] = useState(null);
    const [authorProfilePicture, setAuthorProfilePicture] = useState(AuthorImg);
    const [userInChallenge, setUserInChallenge] = useState(false);
    const [tags, setTags] = useState([]);
    const [countdown, setCountdown] = useState(null);
    const [inProgress, setInProgress] = useState(false);
    const [formattedDate, setFormattedDate] = useState(null);
    const [bookmarkedChallenge, setBookmarkedChallenge] = useState(false);
    const [showPointsDetails, setShowPointsDetails] = useState(false);

    // TODO: Replace filter input checkboxes with custom checkboxes

    const navigate = useNavigate(); // used to navigate to a different page

    useEffect(() => {
        const newTags = [challenge.genre, challenge.status, challenge.skill_level];

        const limitationTags = [
            challenge.limitations.time_limit.min  && "time limit" || challenge.limitations.time_limit.max && "time limit",
            challenge.limitations.word_limit.min && "word limit" || challenge.limitations.word_limit.max && "word limit",
            challenge.limitations.character_limit.min && "character limit" || challenge.limitations.character_limit.max && "character limit",
            challenge.limitations.required_phrase.length > 0 && "required phrase",
        ];

        const filteredLimitationTags = limitationTags.filter(Boolean);

        const participationCountTags = [
            challenge.participation_count <= 10 && "0-10",
            challenge.participation_count <= 50 && challenge.participation_count > 10 && "11-50",
            challenge.participation_count <= 100 && challenge.participation_count > 50 && "51-100",
            challenge.participation_count > 100 && "100+",
        ];

        const filteredParticipationCountTags = participationCountTags.filter(Boolean);

        setTags([...newTags, ...filteredLimitationTags, ...filteredParticipationCountTags]);
        
        let now = new Date();
        let timeToStart = new Date(challenge.start_date_time) - now;
        let timeToEnd = new Date(challenge.end_date_time) - now;

        setFormattedDate(new Date(challenge.end_date_time).toLocaleString());

        const updateCountdown = (time, status) => {
            let days, hours, minutes;
            const formatTwoDigits = (num) => String(num).padStart(2, '0');

            const timeInterval = setInterval(() => {
                time -= 1000;
                days = Math.floor(time / (1000 * 60 * 60 * 24));
                hours = Math.floor((time % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));

                if (time <= 0) {
                    clearInterval(timeInterval);
                    return;
                };

                {status === "upcoming"
                    ? setCountdown(`Starting In: ${formatTwoDigits(days)} days, ${formatTwoDigits(hours)} hours, ${formatTwoDigits(minutes)} minutes`) 
                    : setCountdown(`Ends In: ${formatTwoDigits(days)} days, ${formatTwoDigits(hours)} hours, ${formatTwoDigits(minutes)} minutes`)
                };
            }, 1000);
        };

        if (timeToStart > 0 && timeToEnd > 0) {
            updateCountdown(timeToStart, "upcoming");
        } else if (timeToEnd > 0 && timeToStart <= 0) {
            updateCountdown(timeToEnd, "in-progress");
            setInProgress(true);
        } else {
            setCountdown("Challenge Ended");
        };

        async function fetchAuthor() {
            const response = await fetch(`/api/users/${challenge.author_id}`);
            const data = await response.json();

            if (response.ok) {
                setAuthor(data[0]);
                if (data[0].profile_picture_url) {
                    setAuthorProfilePicture(data[0].profile_picture_url);
                }
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

        async function checkIfUserInChallenge() {
            if (user) {
                const response = await fetch(`/api/submissions/user/${user.id}/challenge/${challenge.id}`);
                const data = await response.json();

                if (data.length > 0) {
                    setUserInChallenge(true);
                };
            };
        };
        
        fetchAuthor();
        checkIfBookmarked();
        checkIfUserInChallenge();
    }, [challenge, navigate]);

    const handleBookmark = async () => {
        if (user) {
            const response = await fetch(`/api/users/${user.id}/${challenge.id}/bookmark`, {
                method: "PATCH",
            });

            if (response.ok) {
                const data = await response.json();
                console.log(data);
                setBookmarkedChallenge(!bookmarkedChallenge);
            } else {
                console.error("Error bookmarking challenge");
            };
        } else {
            console.error("User not logged in");
        };
    };

    const handlePointsDetails = (state) => {
        if (state === 'close') {
            setShowPointsDetails(false);
        } else if (state === 'open') {
            setShowPointsDetails(true);
        }
    };

    return (
        <li className={`challenge-card ${user && userInChallenge ? 'active' : ''}`}>
            <div className="challenge-card-header">
                {user && (
                    <>
                        {!bookmarkedChallenge ? (
                            <button className="bookmark-holder" title="Bookmark this challenge for later!" type="button" onClick={handleBookmark}>
                                <img className="bookmark" src={BookmarkImg} alt="bookmark" />
                            </button>
                        ) : (
                            <button className="bookmark-holder filled" title="Remove bookmark" type="button" onClick={handleBookmark}>
                                <img className="bookmark filled" src={BookmarkFilledImg} alt="filled bookmark" />
                            </button>
                        )}
                    </>
                )}

                <div className="challenge-card-section">
                    <h2 className="challenge-card-name">{challenge.name}</h2>
                    <p className="challenge-card-dates">{new Date(challenge.start_date_time).toLocaleDateString()} - {new Date(challenge.end_date_time).toLocaleDateString()}</p>
                </div>

                <div className="challenge-card-author-holder">
                    <img className="challenge-card-author-image" src={authorProfilePicture} alt={`${author?.username} profile image`} />
                    <Link to={`/${author?.username}`} className="challenge-card-author">{author?.username}</Link>
                </div>
                
                <div className="points-holder" onMouseEnter={() => handlePointsDetails('open')} onMouseLeave={() => handlePointsDetails('close')}>
                    <p className="points">{challenge.available_points}pts</p>
                </div>
                <div className={`points-details-holder ${showPointsDetails ? 'shown' : ''}`}>
                    <p className={`points-details ${showPointsDetails ? 'shown' : ''}`}>You can get up to {challenge.available_points} points!</p>
                </div>

                <div className="challenge-card-tags-holder">
                    {tags.map((tag) => (
                        <span key={tag} value={tag} className="challenge-card-tag">{tag}</span>
                    ))}
                </div>
            </div>
            <div className="challenge-card-content">
                <p className="challenge-card-description">{challenge.description}</p>
                <p className="challenge-card-prompt">{challenge.prompt}</p>
                <div className="challenge-card-countdown" title={formattedDate}>
                    {challenge.end_date_time === '3004-08-13T00:00:00.000Z' ? 'Never Ending!' : countdown}
                </div>
            </div>
            <div className="challenge-card-footer">
                <Link to={`/challenges/${challenge.id}`} className="challenge-card-link">View Challenge</Link>
                <div className="challenge-card-footer-participants-join">
                    {challenge.participation_count === 1 ? (<p className="challenge-card-participants">{challenge.participation_count} participant</p>) : (<p className="challenge-card-participants">{challenge.participation_count} participants</p>)}
                    {user && inProgress && author?.id !== user?.id && (
                        (userInChallenge ? (
                            <Link to={`/${user.username}/challenges/${challenge.id}`} className="challenge-card-button">View Submission</Link>
                        ) : (
                            <Link to={`/challenges/${challenge.id}/join`} className="challenge-card-button">Join Challenge</Link>
                        ))
                    )}
                </div>
            </div>
        </li>
    );
};