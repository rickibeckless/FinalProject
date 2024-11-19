/**
 * Desc: Profile section component for the user's settings page.
 *    This component displays the user's profile information and allows them to edit it.
 * File: Promptify/client/src/components/user/settings/ProfileSection.jsx
*/

// general imports
import { useEffect, useState, useContext } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";

// some pages may also need to import utils, hooks, or context
import AuthContext from "../../../context/AuthProvider.jsx";

// message popup for errors, warnings, and successes
import MessagePopup from "../../global/MessagePopup.jsx";

import CloseImg from "../../../assets/close.svg";

export default function ProfileSection({ user }) {
    const [message, setMessage] = useState("");
    const navigate = useNavigate();
    const [profileInfo, setProfileInfo] = useState({
        username: "",
        email: "",
        about: "",
        profile_picture_url: "",
        bookmarked_challenges: [],
        following_genres: [],
        following: [],
    });
    const [bookmarkedChallengesNames, setBookmarkedChallengesNames] = useState([]);
    const [followingUsersNames, setFollowingUsersNames] = useState([]);

    const [showEditForm, setShowEditForm] = useState(false);

    useEffect(() => {
        if (user) {
            setProfileInfo({
                username: user.username,
                email: user.email,
                about: user.about,
                profile_picture_url: user.profile_picture_url,
                bookmarked_challenges: user.bookmarked_challenges,
                following_genres: user.following_genres,
                following: user.following,
            });

            async function getBookmarkedChallengesNames() {
                let bookmarkedChallengesNames = [];

                for (let i = 0; i < user.bookmarked_challenges.length; i++) {
                    const challengeId = user.bookmarked_challenges[i];
                    const response = await fetch(`/api/challenges/${challengeId}`);
                    const data = await response.json();

                    bookmarkedChallengesNames.push(data[0].name);
                };

                setBookmarkedChallengesNames(bookmarkedChallengesNames);
            };

            async function getFollowingUsersNames() {
                let followingUsersNames = [];

                const response = await fetch(`/api/user-followers/${user.id}/following`);
                const data = await response.json();

                for (let i = 0; i < data.length; i++) {
                    followingUsersNames.push(data[i].username);
                };


                setFollowingUsersNames(followingUsersNames);
            };

            getBookmarkedChallengesNames();
            getFollowingUsersNames();
        };
    }, [user]);

    // console.log("profileInfo: ", profileInfo);
    // console.log("bookmarkedChallengesNames: ", bookmarkedChallengesNames);
    // console.log("followingUsersNames: ", followingUsersNames);

    /*
        Allow user to edit their profile info, which looks like:

        {
            "username": "ricki_b",
            "profile_picture_url": "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
            "about": "This user has not set up an about yet.",
            "bookmarked_challenges": [
                "77777777-bbbb-bbbb-bbbb-777777777777",
                "850869aa-c3d1-48a5-80fe-ddf42ab41cde",
                "66666666-bbbb-bbbb-bbbb-666666666666"
            ],
            "following_genres": [],
            "following": 1,
        }

        Here, they will be able to see their bookmarked challenges by the challenge name,
            and they will be able to remove them by selecting an "x" next to the challenge name.

        They will also be able to see the genres they are following, and they will be able to
            remove them by selecting an "x" next to the genre name.

        They will also be able to see the users they are following, and they will be able to
            unfollow them by selecting an "x" next to the username.
    */

    const handleChange = (e) => {
        setProfileInfo({ ...profileInfo, [e.target.name]: e.target.value });
    };

    const handleEditProfile = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`/api/users/${user.id}/edit`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    role: user ? (user.isAdmin ? "admin" : "user") : "guest",
                },
                body: JSON.stringify(profileInfo),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage("Profile updated successfully!");
                setShowEditForm(false);
            } else {
                setMessage(data.error);
            };
            setTimeout(() => setMessage(""), 3000);
        } catch (error) {
            console.error("Error updating profile:", error);
            setMessage("An unexpected error occurred when updating your profile");
            setTimeout(() => setMessage(""), 3000);
        };
    };

    const handleCancel = () => {
        setProfileInfo({
            username: user.username,
            email: user.email,
            about: user.about,
            profile_picture_url: user.profile_picture_url,
            bookmarked_challenges: user.bookmarked_challenges,
            following_genres: user.following_genres,
            following: user.following,
        });

        setShowEditForm(false);
    };

    const handleRemove = async (type, id, name) => {
        console.log("Removing:", type, id);
        setProfileInfo({ 
            ...profileInfo, 
            [type]: profileInfo[type].filter((item) => item !== id) 
        });

        if (type === "bookmarked_challenges") {
            console.log("Removing bookmarked challenge:", name);
            setBookmarkedChallengesNames(bookmarkedChallengesNames.filter((challenge) => challenge !== name));
            // do fetch (have to get id from name)
        } else if (type === "following") {
            console.log("Removing following user:", name);
            setFollowingUsersNames(followingUsersNames.filter((user) => user !== name));
            // do fetch (have to get id from name)
        };
    };

    return (
        <>
            {message && <MessagePopup message={message} setMessage={setMessage} />}

            <section className="settings-section" id="profile-section-info">
                <h2 className="settings-section-header">Profile Information</h2>

                {showEditForm ? (
                    <form id="edit-profile-form" onSubmit={handleEditProfile}>
                        <button type="button" className="close-btn" title="Close Edit Form" onClick={() => handleCancel()}>
                            <img src={CloseImg} alt="Close" />
                        </button>

                        <div className="form-input-holder">
                            <img src={profileInfo.profile_picture_url} alt="Profile Picture" />
                            <label htmlFor="profile-picture-url">Profile Picture URL</label>
                            <input type="url" name="profile_picture_url" id="profile-picture-url" value={profileInfo.profile_picture_url} onChange={handleChange} required />
                        </div>

                        <div className="form-input-holder">
                            <label htmlFor="username">Username</label>
                            <input type="text" name="username" id="username" value={profileInfo.username} onChange={handleChange} required />
                        </div>

                        <div className="form-input-holder">
                            <label htmlFor="email">Email</label>
                            <input type="email" name="email" id="email" value={profileInfo.email} onChange={handleChange} required />
                        </div>

                        <div className="form-input-holder">
                            <label htmlFor="about">About</label>
                            <textarea name="about" id="about" value={profileInfo.about} onChange={handleChange} required />
                        </div>

                        <div className="form-input-holder">
                            <label htmlFor="bookmarked-challenges">Bookmarked Challenges</label>
                            <ul id="bookmarked-challenges-list">
                                {bookmarkedChallengesNames.map((challenge, index) => (
                                    <li key={index}>
                                        <span>{challenge}</span>
                                        <button type="button" className="btn btn-danger" onClick={() => handleRemove("bookmarked_challenges", profileInfo.bookmarked_challenges[index], challenge)}>x</button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="form-input-holder">
                            <label htmlFor="following-genres">Following Genres</label>
                            <ul id="following-genres-list">
                                {profileInfo.following_genres.map((genre, index) => (
                                    <li key={index}>
                                        <span>{genre}</span>
                                        <button type="button" className="btn btn-danger" onClick={() => handleRemove("following_genres", profileInfo.following_genres[index], genre)}>x</button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="form-input-holder">
                            <label htmlFor="following-users">Following Users</label>
                            <ul id="following-users-list">
                                {followingUsersNames.map((user, index) => (
                                    <li key={index}>
                                        <span>{user}</span>
                                        {user !== "PromptifyBot" && (
                                            <button type="button" className="btn btn-danger" onClick={() => handleRemove("following", profileInfo.following[index], user)}>x</button>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <button type="submit" className="btn btn-primary">Save Changes</button>
                    </form>
                ) : (
                    <div id="profile-section-info">
                        <div id="profile-picture">
                            <img src={profileInfo.profile_picture_url} alt="Profile Picture" />
                        </div>

                        <div id="profile-details">
                            <h3>{profileInfo.username}</h3>
                            <p>{profileInfo.email}</p>
                            <p>{profileInfo.about}</p>

                            <div id="bookmarked-challenges">
                                <h4>Bookmarked Challenges</h4>
                                <ul>
                                    {bookmarkedChallengesNames.map((challenge, index) => (
                                        <li key={index}>{challenge}</li>
                                    ))}
                                </ul>
                            </div>

                            <div id="following-genres">
                                <h4>Following Genres</h4>
                                <ul>
                                    {profileInfo.following_genres.map((genre, index) => (
                                        <li key={index}>{genre}</li>
                                    ))}
                                </ul>
                            </div>

                            <div id="following-users">
                                <h4>Following Users</h4>
                                <ul>
                                    {followingUsersNames.map((user, index) => (
                                        <li key={index}>{user}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <button className="btn btn-primary" onClick={() => setShowEditForm(true)}>Edit Profile</button>
                    </div>
                )}
            </section>
        </>
    );
};