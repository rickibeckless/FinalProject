import { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AuthContext from "../../context/AuthProvider.jsx";
import LoadingScreen from "../../components/global/LoadingScreen.jsx";
import MessagePopup from "../../components/global/MessagePopup.jsx";
import PageTitle from "../../components/global/PageTitle.jsx";
import SubmissionCard from "../../components/challenges/SubmissionCard.jsx";

import "../../styles/challenges/challenge.css";

export default function Challenge() {
    const [loading, setLoading] = useState(true); // set to false when done loading
    const [message, setMessage] = useState(""); // set to message to display in message popup
    const { user } = useContext(AuthContext);

    const [challenge, setChallenge] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const { challengeId } = useParams();

    const navigate = useNavigate(); // used to navigate to a different page

    useEffect(() => {
        async function fetchChallenge() {
            const response = await fetch(`/api/challenges/${challengeId}`);
            const data = await response.json();

            if (response.ok) {
                setChallenge(data[0]);
                setLoading(false);
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

        fetchChallenge();
        fetchSubmissions();
    }, [user, challenge]);

    return (
        <>
            {loading ? <LoadingScreen /> : null}
            <PageTitle title={`${challenge.name} | Promptify`} />

            <main id="challenge-body" className="container">
                <h1>{challenge.name}</h1>
                <p>{challenge.description}</p>
                <p>{challenge.prompt}</p>

                <ul id="submissions-list">
                    {submissions.map(submission => (
                        <SubmissionCard key={submission.id} challenge={challenge} submission={submission} />
                    ))}
                </ul>
            </main>
            
            {message && <MessagePopup message={message} setMessage={setMessage} />}
        </>
    );
};