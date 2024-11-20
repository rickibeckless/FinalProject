import { useEffect, useState, useContext } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import AuthContext from "../../../context/AuthProvider.jsx";

import SubmissionCard from "../../challenges/SubmissionCard.jsx";

export default function SubmissionsSection({ targetUser, userIsTarget }) {
    const [loading, setLoading] = useState(true); // set to false when done loading
    const [message, setMessage] = useState(""); // set to message to display in message popup
    const { user } = useContext(AuthContext);

    const navigate = useNavigate(); // used to navigate to a different page

    const [section, setSection] = useState("current");

    const [submissions, setSubmissions] = useState([]);

    useEffect(() => {
        async function fetchSubmissions() {
            try {
                const response = await fetch(`/api/submissions/user/${targetUser.id}`);
                const data = await response.json();

                if (response.ok) {
                    setSubmissions(data);
                } else {
                    setMessage(data.message);
                }
            } catch (error) {
                setMessage(error.message);
            };
        };

        fetchSubmissions();
        setLoading(false);
    }, []);

    return (
        <section id="your-challenges-submissions-section" className="your-challenges-section">
            {userIsTarget ? <h2>Your Submissions</h2> : <h2>{targetUser.username}'s Submissions</h2>}

            <div className="submissions-section">
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
                    <p>No submissions found.</p>
                )}
            </div>
        </section>
    );
};