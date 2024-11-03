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

export default function ChallengeCard({ sortBy, challenge, index }) {
    const { user } = useContext(AuthContext); // context used for authentication
    const [author, setAuthor] = useState(null);
    const [userInChallenge, setUserInChallenge] = useState(false);
    const [tags, setTags] = useState([]);
    const [countdown, setCountdown] = useState(null);

    const navigate = useNavigate(); // used to navigate to a different page

    useEffect(() => {
        console.log(challenge);

        setTags([challenge.genre, challenge.status, challenge.skill_level]);

        if (challenge.limitations) {
            setTags((prev) => [...prev, "limitations"]);
        };

        let now = new Date();
        let timeToStart = new Date(challenge.start_date_time) - now;
        let timeToEnd = new Date(challenge.end_date_time) - now;

        const updateCountdown = (time) => {
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

                {time === timeToStart
                    ? setCountdown(`Starting In: ${formatTwoDigits(days)}d:${formatTwoDigits(hours)}h:${formatTwoDigits(minutes)}m`) 
                    : setCountdown(`Ends In: ${formatTwoDigits(days)}d:${formatTwoDigits(hours)}h:${formatTwoDigits(minutes)}m`)
                };
            }, 1000);
        };

        if (timeToStart > 0) {
            updateCountdown(timeToStart);
        } else if (timeToEnd > 0) {
            updateCountdown(timeToEnd);
        } else {
            setCountdown("Challenge Ended");
        };

        async function fetchAuthor() {
            const response = await fetch(`/api/users/${challenge.author_id}`);
            const data = await response.json();

            if (response.ok) {
                setAuthor(data[0]);
            };
        };
        
        fetchAuthor();
    }, []);

    return (
        <li className={`challenge-card ${user && userInChallenge ? 'active' : ''}`}>
            <div className="challenge-card-header">
                <h2 className="challenge-card-name">{challenge.name}</h2>
                <a href={`/${author?.username}`} className="challenge-card-author">{author?.username}</a>
                <div className="challenge-card-tags-holder">
                    {tags.map((tag) => (
                        <span key={tag} className="challenge-card-tag">{tag}</span>
                    ))}
                </div>
            </div>
            <div className="challenge-card-content">
                <p className="challenge-card-description">{challenge.description}</p>
                <p className="challenge-card-prompt">{challenge.prompt}</p>
                <div className="challenge-card-countdown">
                    {countdown}
                </div>
            </div>
            <div className="challenge-card-footer">
                <Link to={`/challenges/${challenge.id}`} className="challenge-card-link">View Challenge</Link>
                {user && (
                    (userInChallenge ? (
                        <button className="challenge-card-button">View Submission</button>
                    ) : (
                        <button className="challenge-card-button">Join Challenge</button>
                    ))
                )}
            </div>
        </li>
    );
};