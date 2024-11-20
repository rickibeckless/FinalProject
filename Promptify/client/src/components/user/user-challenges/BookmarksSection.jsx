import { useEffect, useState, useContext } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import AuthContext from "../../../context/AuthProvider.jsx";

import ChallengeCard from "../../challenges/ChallengeCard.jsx";

export default function BookmarksSection({ targetUser, userIsTarget }) {
    const [loading, setLoading] = useState(true); // set to false when done loading
    const [message, setMessage] = useState(""); // set to message to display in message popup
    const { user } = useContext(AuthContext);

    const navigate = useNavigate(); // used to navigate to a different page

    const [section, setSection] = useState("current");

    const [bookmarkedChallenges, setBookmarkedChallenges] = useState([]);

    useEffect(() => {
        async function getBookmarkedChallenges() {
            let bookmarkedChallengesNames = [];

            for (let i = 0; i < targetUser.bookmarked_challenges.length; i++) {
                const challengeId = targetUser.bookmarked_challenges[i];
                const response = await fetch(`/api/challenges/${challengeId}`);
                const data = await response.json();

                bookmarkedChallengesNames.push(data[0]);
            };

            setBookmarkedChallenges(bookmarkedChallengesNames);
        };

        getBookmarkedChallenges();
        setLoading(false);
    }, []);

    return (
        <section id="your-challenges-bookmarks-section" className="your-challenges-section">
            {userIsTarget ? <h2>Your Bookmarks</h2> : <h2>{targetUser.username}'s Bookmarks</h2>}

            <div className="challenges-section">
                {bookmarkedChallenges.length > 0 ? 
                    bookmarkedChallenges.map((challenge, index) => {
                        return <ChallengeCard challenge={challenge} />
                    }
                ) : <p>No challenges found.</p>}
            </div>
        </section>
    );
};