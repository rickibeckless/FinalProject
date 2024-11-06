import { useEffect, useState } from "react";
import PageTitle from "../components/global/PageTitle.jsx";
import LoadingScreen from "../components/global/LoadingScreen.jsx";
import MessagePopup from "../components/global/MessagePopup.jsx";
import "../styles/home/home.css";

import ComputerWriteImg from "../assets/imgs/computer_write.jpg";

export default function Home() {
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    useEffect(() => {
        setLoading(false);
    }, []);

    // if the user is logged in, redirect them to their `your challenges` page
    // get all challenges, splice the first 3, use the challenges card component to display them
    // write out a list of features and how it works
    // decide if the how section should be on this page
    // decide if the last three sections should be a carousel or just a list
    // want to make at least one of the sections a carousel
    // create a left aside for the user to navigate to the different sections
        // this will be the same kind of aside that will be on the:
            // settings page
            // your challenges page

    return (
        <>
            {loading && <LoadingScreen />}
            <PageTitle title="Promptify" />

            <main id="home-body" className="container">
                <section id="hero" className="home-section">
                    <div id="hero-left">
                        <h1>Welcome to Promptify</h1>
                        <p>Start writing today with our writing challenges</p>

                        <div className="hero-buttons account-links">
                            <a className="account-link" href="/challenges">Current Challenges</a>
                            <a className="account-link" href="#">User Ranks</a>
                        </div>
                    </div>
                    <div id="hero-right">
                        <img id="hero-right-img" src={ComputerWriteImg} alt="computer" />
                    </div>
                </section>
                <section id="home-how-section" className="home-section">
                    <h2>How it works</h2>
                    <p>Choose a challenge from the list of current challenges, write a response, and submit it to the challenge. You can view your past submissions and see how you rank against other users.</p>
                </section>
                <section id="home-features-section" className="home-section">
                    <h2>Features</h2>
                    <ul>
                        <li>Writing challenges</li>
                        <li>View past submissions</li>
                        <li>View user ranks</li>
                    </ul>
                </section>
                <section id="home-top-challenges-section" className="home-section">
                    <h2>Top 3 Challenges Of All Time</h2>
                    <ul>
                        <li>Challenge 1</li>
                        <li>Challenge 2</li>
                        <li>Challenge 3</li>
                    </ul>
                </section>
            </main>

            {message && <MessagePopup message={message} />}
        </>
    );
};