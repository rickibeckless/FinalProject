/**
 * Desc: User page, displays user's information.
 * File: Promptify/client/src/pages/User.jsx
*/

// general imports
import { useEffect, useState, useContext } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";

// sets the page title, used by all pages in the format "Page Title | Promptify"
import PageTitle from "../components/global/PageTitle.jsx"; // note: modals will not use this component

// loading screen for when the page is loading (also used for transitions and testing)
import LoadingScreen from "../components/global/LoadingScreen.jsx";

// message popup for errors, warnings, and successes
import MessagePopup from "../components/global/MessagePopup.jsx";

// some pages may also need to import utils, hooks, or context
import AuthContext from "../context/AuthProvider.jsx"; // context used for authentication

// styles for the page
import "../styles/user/profile.css";

import personEdit from "../assets/edit_person.svg";
import followUser from "../assets/follow_user.svg";
import unfollowUser from "../assets/unfollow_user.svg";

// badge imports
import registeredBadge from "../assets/userBadges/registered.png";
import firstSubmissionBadge from "../assets/userBadges/first_submission.png";

export default function User() {
    const navigate = useNavigate(); // used to navigate to a different page
    const { user } = useContext(AuthContext); // context used for authentication
    const [loading, setLoading] = useState(true); // set to false when done loading
    const [message, setMessage] = useState(""); // set to message to display in message popup

    const { username } = useParams();

    if (!username.startsWith('@')) {
        return navigate("/404");
    }
    
    const [userHandle, setUserHandle] = useState(username.slice(1).toLowerCase()); 

    const [target_user, setTargetUser] = useState([]);
    const [targetUserChallenges, setTargetUserChallenges] = useState([]);
    const [targetUserSubmissions, setTargetUserSubmissions] = useState({});
    const [targetUserBadges, setTargetUserBadges] = useState([]);

    const [userIsTarget, setUserIsTarget] = useState(false);
    const [following, setFollowing] = useState(false);

    useEffect(() => {
        async function fetchTargetUser() {
            try {
                const response = await fetch(`/api/users/username/${userHandle}`);
                if (response.ok) {
                    const data = await response.json();

                    setUserHandle(data[0].username);

                    if (user && user.username.toLowerCase() === userHandle) {
                        setUserIsTarget(true);
                    } else {
                        const followingResponse = await fetch(`/api/user-followers/${user.id}/following/${data[0].id}`);
                        if (followingResponse.ok) {
                            const followingData = await followingResponse.json();
                            setFollowing(followingData.message);
                        }
                    }

                    if (data[0].badges) {
                        const badges = Object.entries(data[0].badges).filter(([key, value]) => value === true);
                        setTargetUserBadges(badges);
                    }

                    setTargetUser(data[0]);

                    const challengesResponse = await fetch(`/api/challenges/user/${data[0].id}`);

                    if (challengesResponse.ok) {
                        const challengesData = await challengesResponse.json();
                        setTargetUserChallenges(challengesData);
                    }

                    const submissionsResponse = await fetch(`/api/submissions/user/${data[0].id}`);

                    if (submissionsResponse.ok) {
                        const submissionsData = await submissionsResponse.json();

                        // get submission stats (upvotes, comments)

                        for (let submission of submissionsData) {
                            submission.upvotes = await getSubmissionStats(submission.id, 'upvotes');
                            submission.comments = await getSubmissionStats(submission.id, 'comments');
                        }
                        
                        setTargetUserSubmissions(submissionsData);
                    }
                } else {
                    setMessage("User not found.");
                };
            } catch (error) {
                setMessage(error.message);
            };

            setLoading(false);
        };

        fetchTargetUser();
    }, []);

    const badgeImages = {
        registered: registeredBadge,
        first_submission: firstSubmissionBadge,
    };

    const renderLimitations = (limitations) => {
        if (!limitations) return null;
    
        const { time_limit, word_limit, character_limit, required_phrase } = limitations;
    
        return (
            <>
                {(time_limit?.min || time_limit?.max) && (
                    <span className="li-detail">
                        {time_limit.min || 0}
                        {time_limit.max && (
                            - time_limit.max || "No limit"
                        )} minutes
                    </span>
                )}
                {(word_limit?.min || word_limit?.max) && (
                    <span className="li-detail">
                        {word_limit.min || 0} 
                        {word_limit.max && (
                            - word_limit.max || "No limit"
                        )} words
                    </span>
                )}
                {(character_limit?.min || character_limit?.max) && (
                    <span className="li-detail">
                        {character_limit.min || 0} 
                        {character_limit.max && (
                            - character_limit.max || "No limit"
                        )} characters
                    </span>
                )}
                {required_phrase && (
                    required_phrase.length === 1 ? (
                        <span className="li-detail">
                            Required Phrase
                        </span>
                    ) : (
                        <span className="li-detail">
                            Required Phrases
                        </span>
                    )
                )}
            </>
        );
    };

    const getSubmissionStats = async (submissionId, statType) => {
        if (statType === "upvotes") {
            const upvotesRes = await fetch(`/api/upvotes/submission/${submissionId}`);
            if (upvotesRes.ok) {
                const data = await upvotesRes.json();
                return data.length;
            } else {
                return 0;
            }
        } else if (statType === "comments") {
            const commentsRes = await fetch(`/api/comments/submission/${submissionId}`);
            if (commentsRes.ok) {
                const data = await commentsRes.json();
                return data.length;
            } else {
                return 0;
            }
        }
    };

    const handleUserFollow = async () => {
        try {
            const response = await fetch(`/api/user-followers/${user.id}/follow/${target_user.id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    role: user ? "user" : "guest",
                },
                body: JSON.stringify({ followerId: user.id }),
            });

            if (response.ok) {
                setTargetUser((prev) => ({
                    ...prev,
                    followers: prev.followers + 1,
                }));
                setFollowing((prev) => !prev);
            } else {
                setMessage("Failed to follow user.");
            }
        } catch (error) {
            setMessage(error.message);
        }
    };

    return (
        <>
            <PageTitle title={`${userHandle} | Promptify`} />
            {loading ? <LoadingScreen /> : null}
            {message && <MessagePopup message={message} setMessage={setMessage} />}

            <main id="user-body" className="container">
                {userIsTarget && 
                    <button type="button" title="Edit Profile" className="edit-user-btn" onClick={() => navigate("/settings")}>
                        <img src={personEdit} alt="Edit Profile" />
                    </button>
                }

                <section id="profile-overview">
                    <div id="profile-picture">
                        <img src={target_user?.profile_picture_url || "/default-profile.png"} alt={`${userHandle}'s profile`} />
                    </div>
                    <div id="profile-details">
                        <h1>
                            {userHandle}
                            {(user && user.id !== target_user?.id && target_user.username !== 'PromptifyBot') && (
                                following ? (
                                    <button type="button" className="user-follow-btn" onClick={handleUserFollow}>
                                        <img src={unfollowUser} alt="Unfollow User" />
                                    </button>
                                ) : (
                                    <button type="button" className="user-follow-btn" onClick={handleUserFollow}>
                                        <img src={followUser} alt="Follow User" />
                                    </button>
                                )
                            )}
                        </h1>
                        <p id="about">{target_user?.about || "No bio available."}</p>
                    </div>
                </section>

                <section id="profile-stats">
                    <div className="stat-item">
                        <h2>Challenges</h2>
                        <p>{targetUserChallenges.length || 0}</p>
                    </div>
                    <div className="stat-item">
                        <h2>Submissions</h2>
                        <p>{targetUserSubmissions.length || 0}</p>
                    </div>
                    <div className="stat-item">
                        <h2>Skill Level</h2>
                        <p>{target_user?.skill_level || "N/A"}</p>
                    </div>
                    <div className="stat-item">
                        <h2>Followers</h2>
                        <p>{target_user?.followers || 0}</p>
                    </div>
                    <div className="stat-item">
                        <h2>Last Login</h2>
                        <p>{new Date(target_user?.last_login).toLocaleDateString() || "N/A"}</p>
                    </div>
                    <div className="stat-item">
                        <h2>Member Since</h2>
                        <p>{new Date(target_user?.date_created).toLocaleDateString() || "N/A"}</p>
                    </div>
                </section>

                <section id="profile-badges">
                    <h2>Earned Badges</h2>
                    <div id="badge-list">
                        {targetUserBadges.length > 0 ? (
                            targetUserBadges.map(([badgeName]) => (
                                <img
                                    key={badgeName}
                                    src={badgeImages[badgeName] || "/default-badge.png"}
                                    alt={badgeName.replace(/_/g, " ")}
                                    title={badgeName.replace(/_/g, " ")}
                                />
                            ))
                        ) : (
                            <p>No badges earned yet.</p>
                        )}
                    </div>
                </section>

                <section id="profile-challenges">
                    <h2>Challenges</h2>
                    <ul>
                        {targetUserChallenges.length > 0 ? (
                            targetUserChallenges.map((challenge) => (
                                <li key={challenge.id}>
                                    <Link to={`/challenges/${challenge.id}`}>{challenge.name}</Link>
                                    <span className="li-detail">{challenge.genre}</span>
                                    <span className="li-detail">{challenge.skill_level}</span>
                                    <span className="li-detail" title="Participation Count">
                                        {challenge.participation_count}
                                        {challenge.participation_count === 1 ? " Participant" :  " Participants"}
                                    </span>
                                    {renderLimitations(challenge.limitations)}
                                    <span className="li-detail" title="Available Points">{challenge.available_points} Points</span>
                                    <span className="li-detail">{challenge.status}</span>
                                </li>
                            ))
                        ) : (
                            <p>No challenges completed yet.</p>
                        )}
                    </ul>
                </section>

                <section id="profile-submissions">
                    <h2>Submissions</h2>
                    <ul>
                        {targetUserSubmissions.length > 0 ? (
                            targetUserSubmissions.map((submission) => (
                                <li key={submission.id}>
                                    <Link to={`/submissions/${submission.id}`}>{submission.title}</Link>
                                    <span className="li-detail">{submission.genre}</span>
                                    <span className="li-detail">{submission.upvotes} Upvotes</span>
                                    <span className="li-detail">{submission.comments} Comments</span>
                                </li>
                            ))
                        ) : (
                            <p>No submissions yet.</p>
                        )}
                    </ul>
                </section>
            </main>
        </>
    );

};