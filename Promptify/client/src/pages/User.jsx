/**
 * Desc: User page, displays other user's information.
 * File: Promptify/client/src/pages/User.jsx
*/

// general imports
import { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";

// sets the page title, used by all pages in the format "Page Title | Promptify"
import PageTitle from "../components/global/PageTitle.jsx"; // note: modals will not use this component

// loading screen for when the page is loading (also used for transitions and testing)
import LoadingScreen from "../components/global/LoadingScreen.jsx";

// message popup for errors, warnings, and successes
import MessagePopup from "../components/global/MessagePopup.jsx";

// some pages may also need to import utils, hooks, or context
import AuthContext from "../context/AuthProvider.jsx"; // context used for authentication

export default function User() {
    const { user } = useContext(AuthContext); // context used for authentication
    const [loading, setLoading] = useState(true); // set to false when done loading
    const [message, setMessage] = useState(""); // set to message to display in message popup

    const { username } = useParams();
    const [target_user, setTargetUser] = useState([]);

    const navigate = useNavigate(); // used to navigate to a different page

    useEffect(() => {
        setLoading(false);
    }, [loading, user]);

    return (
        <> {/* React fragment (shorthand), used to return multiple elements. Pages usually start with fragment */}
            <PageTitle title={`${username} | Promptify`} />
            {loading ? <LoadingScreen /> : null}
            {message && <MessagePopup message={message} setMessage={setMessage} />}

            <main id="user-body" className="container">
                <h1>{target_user.username} Profile</h1>
                <section id="profile-info">
                    <div className="profile-info-item">
                        <h2>Username</h2>
                        <p>{username}</p>
                    </div>
                    <div className="profile-info-item">
                        <h2>Email</h2>
                        <p>{target_user?.email}</p>
                    </div>
                    <div className="profile-info-item">
                        <h2>Member Since</h2>
                        <p>{new Date(target_user?.date_created).toLocaleDateString()}</p>
                    </div>
                </section>
            </main>
        </>
    );
};