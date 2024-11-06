import { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AuthContext from "../../context/AuthProvider.jsx";
import LoadingScreen from "../../components/global/LoadingScreen.jsx";
import MessagePopup from "../../components/global/MessagePopup.jsx";
import PageTitle from "../../components/global/PageTitle.jsx";

export default function UserChallenges() {
    const [loading, setLoading] = useState(true); // set to false when done loading
    const [message, setMessage] = useState(""); // set to message to display in message popup
    const { user } = useContext(AuthContext);

    const { username } = useParams();

    const navigate = useNavigate(); // used to navigate to a different page

    useEffect(() => {
        setLoading(false);
    }, []);

    /**
     * I want to have this page display all of the challenges that a user has bookmarked 
     *     meaning, the user selected "bookmark" on a challenge (this would require a new column in the users table)
     * I also want to have a section for "current challenges" and a section for "past challenges"
     * The user should be able to filter the "all your challenges" to show:
     *     - all challenges
     *     - current challenges
     *     - past challenges
     * or maybe these will all be tabs on the page
    */
    // decide whether or not to have this be a tab page or to separate into different pages

    return (
        <>
            {loading ? <LoadingScreen /> : null}
            <PageTitle title={`${username} Challenges | Promptify`} />

            <main id="current-challenges-body" className="container">


                {message && <MessagePopup message={message} setMessage={setMessage} />}
            </main>
        </>
    );
};