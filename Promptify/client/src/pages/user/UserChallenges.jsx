import { useEffect, useState, useContext } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import AuthContext from "../../context/AuthProvider.jsx";
import LoadingScreen from "../../components/global/LoadingScreen.jsx";
import MessagePopup from "../../components/global/MessagePopup.jsx";
import PageTitle from "../../components/global/PageTitle.jsx";

import ChallengesSection from "../../components/user/user-challenges/ChallengesSection.jsx";
import SubmissionsSection from "../../components/user/user-challenges/SubmissionsSection.jsx";
import BookmarksSection from "../../components/user/user-challenges/BookmarksSection.jsx";

import "../../styles/user/user-challenges.css";

export default function UserChallenges() {
    const navigate = useNavigate(); // used to navigate to a different page
    const [loading, setLoading] = useState(true); // set to false when done loading
    const [message, setMessage] = useState(""); // set to message to display in message popup
    const { user } = useContext(AuthContext);

    const { username } = useParams();

    if (!username.startsWith('@')) {
        return navigate("/404");
    }
    
    const [userHandle, setUserHandle] = useState(username.slice(1).toLowerCase()); 

    const [targetUser, setTargetUser] = useState(null);
    const [userIsTarget, setUserIsTarget] = useState(false);

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const tabQuery = queryParams.get('tab');
    const sectionQuery = queryParams.get('section');

    const [tab, setTab] = useState("challenges");
    const [section, setSection] = useState("current");

    const [challenges, setChallenges] = useState([]);
    const [bookmarkedChallenges, setBookmarkedChallenges] = useState([]);
    const [submissions, setSubmissions] = useState([]);

    useEffect(() => {
        async function fetchTargetUser() {
            try {
                const response = await fetch(`/api/users/username/${userHandle}`);
                const data = await response.json();

                if (!response.ok) {
                    setMessage(data.message);
                } else {
                    setTargetUser(data[0]);
                    setUserHandle(data[0].username);

                    if (user && user.username.toLowerCase() === userHandle) {
                        setUserIsTarget(true);
                    }

                    setLoading(false);
                }
            } catch (error) {
                setMessage(error.message);
                setLoading(false);
            }
        }

        fetchTargetUser();
    }, [loading, user, userHandle]);

    return (
        <>
            {loading ? <LoadingScreen /> : null}
            <PageTitle title={`${userHandle}'s Work | Promptify`} />

            <main id="your-challenges-body" className="container">
                <div className="your-challenges-header">
                    <h1 className="your-challenges-header-username">{userHandle}'s Work</h1>
                    <ul className="your-challenges-header-list">
                        <li onClick={() => setTab("challenges")}>Challenges</li>
                        <li onClick={() => setTab("submissions")}>Submissions</li>
                        {userIsTarget && <li onClick={() => setTab("bookmarks")}>Bookmarks</li>}
                    </ul>
                </div>

                <div className="your-challenges-body">
                    {tab === "submissions" ? (
                        <SubmissionsSection targetUser={targetUser} userIsTarget={userIsTarget} />
                    ) : tab === "bookmarks" ? (
                        <BookmarksSection targetUser={targetUser} userIsTarget={userIsTarget} />
                    ) : (
                        <ChallengesSection targetUser={targetUser} userIsTarget={userIsTarget} />
                    )}
                </div>

                {message && <MessagePopup message={message} setMessage={setMessage} />}
            </main>
        </>
    );
};