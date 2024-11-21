/**
 * Desc: Template for all pages, includes page title, loading screen, and message popup.
 *       This template is used to create new pages.
 *       May also be used for modals and components.
*/

// general imports
import { useEffect, useState, useContext } from "react";
import { useNavigate, useLocation, Link, useParams } from "react-router-dom";
import { io } from 'socket.io-client'; // used to connect to the server's socket
import { environmentUrl } from "../App.jsx";

// sets the page title, used by all pages in the format "Page Title | Promptify"
import PageTitle from "../components/global/PageTitle.jsx"; // note: components will not use this

// loading screen for when the page is loading (also used for transitions and testing)
import LoadingScreen from "../components/global/LoadingScreen.jsx";

// message popup for errors, warnings, and successes
import MessagePopup from "../components/global/MessagePopup.jsx";

// styles that a component uses may also be imported here
import "./StyleTemplate.css"; // note: styles will be global, so use unique class and/or id names

// some pages may also need to import utils, hooks, or context
import AuthContext from "../context/AuthProvider.jsx"; // context used for authentication
import { FetchContext } from "../context/FetchProvider.jsx"; // context used to fetch data from the server
import '../utils/validators.js'; // note: this validator is for the classes pages url validation

export default function PageTemplate() {
    const socket = io(environmentUrl, { autoConnect: false }); // connect to the server's socket
    const { user, login, logout } = useContext(AuthContext); // context used for authentication
    const { fetchWithRetry } = useContext(FetchContext); // context used to fetch data from the server
    const [loading, setLoading] = useState(true); // set to false when done loading
    const [message, setMessage] = useState(""); // set to message to display in message popup

    const navigate = useNavigate(); // used to navigate to a different page
    const location = useLocation(); // used to get the current location

    useEffect(() => { // runs once when the page loads
        setLoading(false); // set to false when done loading
    }, []); // the empty array means this effect will only run once

    return (
        <> {/* React fragment (shorthand), used to return multiple elements. Pages usually start with fragment */}
            <PageTitle title={`Page Title | Promptify`} />
            {loading ? <LoadingScreen /> : null}
            {message && <MessagePopup message={message} setMessage={setMessage} />}

            <main id="-body" className="container"></main>
        </>
    );
};