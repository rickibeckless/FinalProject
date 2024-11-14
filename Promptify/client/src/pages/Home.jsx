import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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

    /**
     * @rickibeckless
     * if the user is logged in, redirect them to their `your challenges` page
     * get all challenges, splice the first 3, use the challenges card component to display them
     * write out a list of features and how it works
     * decide if the how section should be on this page
     * decide if the last three sections should be a carousel or just a list
     * want to make at least one of the sections a carousel
     * create a left aside for the user to navigate to the different sections
     *  - this will be the same kind of aside that will be on the:
     *      - settings page
     *      - your challenges page
    */

    return (
        <>
            {loading && <LoadingScreen />}
            <PageTitle title="Promptify" />

            <main id="home-body" className="container">
                <section id="hero" className="home-section">
                    <div id="hero-left">
                        <h1>Unlock Your Creativity with Promptify</h1>
                        <p>
                            Discover fresh inspiration, tackle exciting
                            writing challenges, and connect with a community
                            of writers. Start your journey today and turn
                            your ideas into stories!
                        </p>

                        <div className="hero-buttons account-links">
                            <Link className="account-link" to="/challenges">Current Challenges</Link>
                            <Link className="account-link" to="#">User Ranks</Link>
                        </div>
                    </div>
                    <div id="hero-right">
                        <img id="hero-right-img" src={ComputerWriteImg} alt="computer" />
                    </div>
                </section>
                <section id="home-how-section" className="home-section">
                    <h2 className="home-section-header">How It Works: Join, Compete, and Win</h2>
                    <p>
                        Choose a challenge from the list of current challenges, write a response,
                        and submit it to the challenge. You can view your past submissions and see
                        how you rank against other users.
                    </p>
                    <ol className="section-list">
                        <li className="section-card">Create an Account
                            <p>
                                Sign up for a free account to join the community, participate in
                                challenges, and start earning points and badges. Your profile will
                                track your achievements, including points and badges earned.
                            </p>
                        </li>
                        <li className="section-card">Explore Challenges
                            <p>
                                Browse the available challenges, each with its own theme, rules,
                                and points to be won. Challenges are open to submissions during
                                a set time-frame, so keep an eye on new ones to jump in as early
                                as possible!
                            </p>
                        </li>
                        <li className="section-card">Submit Your Entry
                            <p>
                                Once you've chosen a challenge, create and submit your entry.
                                Every submission instantly earns you 50 points, rewarding you
                                for participating and showcasing your creativity.
                            </p>
                        </li>
                        <li className="section-card">Earn Upvotes
                            <p>
                                Community members can upvote submissions they like the most. Gather
                                as many upvotes as possible to increase your chance of winning.
                                High upvotes can help secure a top spot and earn a larger share of
                                the challenge points.
                            </p>
                        </li>
                        <li className="section-card">Challenge Scoring Mode
                            <p>
                                When the challenge ends, it enters a special one-hour "scoring" mode.
                                During this time, final votes are cast, and users have the last
                                opportunity to show support for their favorite entries.
                            </p>
                        </li>
                        <li className="section-card">Win Points for Top Submissions
                            <p>
                                After scoring mode, upvotes are counted, and the top three submissions are
                                crowned winners. Available points for the challenge are divided as follows:
                                <ul>
                                    <li>1st Place: 50% of the total points</li>
                                    <li>2nd Place: 30% of the total points</li>
                                    <li>3rd Place: 20% of the total points</li>
                                </ul>
                                Placing in the top three boosts your score and helps you earn new badges.
                            </p>
                        </li>
                        <li className="section-card">Collect Badges
                            <p>
                                Earn badges for reaching milestones, like achieving a certain number of points,
                                winning challenges, or receiving and giving upvotes. Each badge showcases your
                                accomplishments and adds a fun element of progression to your profile.
                            </p>
                        </li>
                    </ol>
                </section>
                <section id="home-features-section" className="home-section">
                    <h2 className="home-section-header">App Features</h2>
                    <ul className="section-list">
                        <li className="section-card">Community Challenges
                            <p>
                                Participate in themed writing challenges created by the community. Each challenge has
                                unique themes and rules to spark creativity and encourage diverse entries.
                            </p>
                        </li>
                        <li className="section-card">Upvoting System
                            <p>
                                Support your favorite entries by upvoting them. The upvoting system lets users decide
                                on the best submissions, adding a democratic aspect to the challenges.
                            </p>
                        </li>
                        <li className="section-card">Scoring Mode
                            <p>
                                After each challenge ends, the platform enters a one-hour scoring mode, allowing
                                last-minute votes to influence the final standings. This feature helps ensure
                                that everyone gets a fair shot at winning.
                            </p>
                        </li>
                        <li className="section-card">Dynamic Point Rewards
                            <p>
                                Earn points for participating in challenges and aim for the top ranks to win
                                a larger share of the challenge's points. Your overall points reflect your
                                activity and success on the platform.
                            </p>
                        </li>
                        <li className="section-card">Leader-Board Rankings
                            <p>
                                See where you stand against other users with the live leader-board, which displays
                                users ranked by points. Compete with others and climb the ranks to showcase your skills.
                            </p>
                        </li>
                        <li className="section-card">Achievement Badges
                            <p>
                                Collect badges as you reach key milestones, such as winning challenges, gathering
                                upvotes, or accumulating points. Each badge highlights your accomplishments
                                and adds personality to your profile.
                            </p>
                        </li>
                        <li className="section-card">User Profiles
                            <p>
                                Personalize your profile to showcase your achievements, badges, and favorite
                                submissions. Your profile becomes a space to track your growth and connect with others.
                            </p>
                        </li>
                        <li className="section-card">Custom Notifications
                            <p>
                                Stay informed with real-time notifications for new challenges, upvotes, comments,
                                and follower activity. Customize your notification preferences to focus on what matters most to you.
                            </p>
                        </li>
                        <li className="section-card">Follower System
                            <p>
                                Follow your favorite writers and stay up-to-date on their latest submissions
                                and challenges. Build a network of inspiring creators within the community.
                            </p>
                        </li>
                        <li className="section-card">Daily & Weekly Reviews
                            <p>
                                Keep track of your progress and accomplishments with daily and weekly review
                                summaries, highlighting points gained, badges earned, and other key updates.
                            </p>
                        </li>
                        <li className="section-card">Responsive Design
                            <p>
                                Access the platform from any device with a fully responsive design, ensuring
                                a smooth and optimized experience on both desktop and mobile.
                            </p>
                        </li>
                    </ul>
                </section>
            </main>

            {message && <MessagePopup message={message} />}
        </>
    );
};