import { useEffect, useState, useContext } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import AuthContext from "../../../context/AuthProvider.jsx";

import ChallengeCard from "../../challenges/ChallengeCard.jsx";

export default function ChallengesSection({ targetUser, userIsTarget }) {
    const [loading, setLoading] = useState(true); // set to false when done loading
    const [message, setMessage] = useState(""); // set to message to display in message popup
    const { user } = useContext(AuthContext);

    const navigate = useNavigate(); // used to navigate to a different page

    const [section, setSection] = useState("current");

    const [challenges, setChallenges] = useState({});

    useEffect(() => {
        async function fetchChallenges() {
            try {
                const response = await fetch(`/api/challenges/user/${targetUser.id}`);
                const data = await response.json();

                if (response.ok) {
                    setChallenges(data);
                } else {
                    setMessage(data.message);
                }
            } catch (error) {
                setMessage(error.message);
            };
        };

        fetchChallenges();
        setLoading(false);
    }, [targetUser]);

    return (
        <section id="your-challenges-challenges-section" className="your-challenges-section">
            {userIsTarget ? <h2>Your Challenges</h2> : <h2>{targetUser?.username}'s Challenges</h2>}

            <div className="challenges-section">
                {challenges.length > 0 ? 
                    challenges.map((challenge, index) => {
                        return <ChallengeCard challenge={challenge} />
                    }
                ) : <p>No challenges found.</p>}
            </div>
        </section>
    );
};