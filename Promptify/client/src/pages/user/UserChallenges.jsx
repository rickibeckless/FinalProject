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