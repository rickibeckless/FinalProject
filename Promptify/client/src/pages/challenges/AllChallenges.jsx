import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../context/AuthProvider.jsx";
import LoadingScreen from "../../components/global/LoadingScreen.jsx";
import MessagePopup from "../../components/global/MessagePopup.jsx";
import PageTitle from "../../components/global/PageTitle.jsx";
import ChallengeCard from "../../components/challenges/ChallengeCard.jsx";

export default function AllChallenges() {
    const [loading, setLoading] = useState(true); // set to false when done loading
    const [message, setMessage] = useState(""); // set to message to display in message popup
    const { user } = useContext(AuthContext);

    const [challenges, setChallenges] = useState(null);
    const [sortBy, setSortBy] = useState("submissions");

    const navigate = useNavigate(); // used to navigate to a different page

    useEffect(() => {
        async function fetchChallenges() {
            const response = await fetch(`/api/challenges`);
            const data = await response.json();

            if (response.ok) {
                setChallenges(data);
                setLoading(false);
            } else {
                setMessage(data.message);
            };
        };

        fetchChallenges();
    }, [navigate, user]);

    return (
        <>
            {loading ? <LoadingScreen /> : null}
            <PageTitle title="Challenges | Promptify" />

            <main id="all-challenges-body" className="container">
                <h1>All Challenges</h1>

                {challenges?.length === 0 ? (
                    <p>Nothing yet!</p>
                ) : (
                    <ul id="challenges-list">
                        {challenges?.map((challenge, index) => (
                            <ChallengeCard sortBy={sortBy} challenge={challenge} index={index} />
                        ))}
                    </ul>
                )}

                {message && <MessagePopup message={message} setMessage={setMessage} />}
            </main>
        </>
    );
};