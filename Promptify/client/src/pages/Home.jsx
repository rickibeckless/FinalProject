import { useEffect, useState } from "react";
import PageTitle from "../components/global/PageTitle.jsx";
import LoadingScreen from "../components/global/LoadingScreen.jsx";
import MessagePopup from "../components/global/MessagePopup.jsx";
import "../styles/home/home.css";

export default function Home() {
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    useEffect(() => {
        setLoading(false);
    }, []);

    return (
        <>
            {loading && <LoadingScreen />}
            <PageTitle title="Promptify" />

            <main id="home-body" className="container">

            </main>

            {message && <MessagePopup message={message} />}
        </>
    );
};