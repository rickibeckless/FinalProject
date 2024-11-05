import { useState, useContext } from "react";
import AuthContext from "../../context/AuthProvider.jsx";
import SignUpModal from "../../components/global/modals/SignUp.jsx";
import LoginModal from "../../components/global/modals/Login.jsx";
import PageTitle from "../../components/global/PageTitle.jsx";

export default function About() {
    const { user } = useContext(AuthContext);

    const [showSignUpModal, setShowSignUpModal] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);

    const toggleModal = (type, previousType) => {
        if (previousType) {
            if (previousType === "sign-up") {
                setShowSignUpModal(false);
            } else if (previousType === "login") {
                setShowLoginModal(false);
            } else if (previousType === "close") {
                document.body.classList.remove("modal-open");
            };
        } else {
            document.body.classList.toggle("modal-open");
        };

        if (type === "sign-up") {
            setShowSignUpModal(!showSignUpModal);
        } else if (type === "login") {
            setShowLoginModal(!showLoginModal);
        };
    };

    return (
        <div className="footer-page-body container">
            <PageTitle title="About | Promptify" />

            <header className="footer-header">
                <h1>About Promptify</h1>
                <p className="footer-intro">
                    Welcome to Promptify — a platform that inspires creativity and encourages learning through engaging writing challenges and prompts.
                </p>
            </header>

            <section className="footer-section" id="mission">
                <h2>Our Mission</h2>
                <p>
                    Promptify was created to help writers at every stage of their journey develop their skills, discover new genres, and connect with a community of like-minded creatives. We believe everyone has a story to tell, and our goal is to provide the inspiration, tools, and space for users to bring their stories to life.
                </p>
            </section>

            <section className="footer-section" id="features">
                <h2>Features</h2>
                <ul>
                    <li><strong>Daily Writing Challenges:</strong> Take part in daily challenges designed to boost your creativity, with new themes, genres, and prompts.</li>
                    <li><strong>Genre Exploration:</strong> Write across genres, from poetry and non-fiction to thrillers and fantasy. Try something new and see where it takes you!</li>
                    <li><strong>Skill-Based Levels:</strong> Tailored prompts for beginner, intermediate, and advanced writers so that you're always pushing your skills in the right way.</li>
                    <li><strong>Community Voting & Feedback:</strong> Receive feedback from peers, engage with other writers, and get recognized for your unique storytelling style.</li>
                    <li><strong>Achievements & Badges:</strong> Unlock badges as you complete challenges, participate in the community, and reach new milestones in your writing journey.</li>
                    <li><strong>Personalized Writing Dashboard:</strong> Track your progress, save drafts, and view stats to stay motivated and monitor improvement.</li>
                </ul>
            </section>

            <section className="footer-section" id="how-it-works">
                <h2>How It Works</h2>
                <ol>
                    <li><strong>Create an Account:</strong> Sign up to gain full access to challenges, personalized recommendations, and community features.</li>
                    <li><strong>Choose Your Challenge:</strong> Browse available challenges and choose one that piques your interest. You can filter by genre, skill level, or theme.</li>
                    <li><strong>Write & Submit:</strong> Let your creativity flow! Complete your writing within the challenge parameters and submit it for others to read.</li>
                    <li><strong>Engage & Vote:</strong> Check out other users' submissions, leave constructive feedback, and vote for your favorites.</li>
                    <li><strong>Track Your Growth:</strong> View your completed challenges, badges, and skill progression from your dashboard.</li>
                </ol>
            </section>

            <section className="footer-section" id="user-benefits">
                <h2>Why Join Promptify?</h2>
                <p>
                    Whether you're a seasoned writer or just starting out, Promptify offers something for everyone. Here's what you can expect as a member of our community:
                </p>
                <ul>
                    <li><strong>Improved Writing Skills:</strong> Regular practice and feedback help you refine your writing style and grow as a writer.</li>
                    <li><strong>Creative Inspiration:</strong> Never face writer's block again with our diverse range of prompts and challenges.</li>
                    <li><strong>Constructive Feedback:</strong> Gain insights from other writers in the community, helping you see your work from different perspectives.</li>
                    <li><strong>Achievements & Motivation:</strong> Set goals, earn rewards, and celebrate milestones to keep your motivation high.</li>
                    <li><strong>Networking:</strong> Connect with fellow writers, build friendships, and collaborate on projects.</li>
                </ul>
            </section>

            {/* <section className="footer-section" id="meet-the-team">
                <h2>Meet the Team</h2>
                <p>
                    Our team is passionate about writing, creativity, and community. We're writers, designers, and developers who wanted to create a space where inspiration meets functionality. Here's a little about us:
                </p>
                <div className="team-members">
                    <div className="team-member">
                        <img src="" alt="Ricki Beckless" />
                        <h3>Ricki Beckless</h3>
                        <p><em>Founder/Developer</em></p>
                        <p>Ricki is a writer and developer dedicated to making creative expression accessible to all.</p>
                    </div>
                </div>
            </section> */}

            {/* <section className="footer-section" id="testimonials">
                <h2>What Our Users Are Saying</h2>
                <blockquote>
                    <p>"User Quote."</p>
                    <footer>- User Name, User Title</footer>
                </blockquote>
            </section> */}

            <section className="footer-section" id="get-started">
                <h2>Get Started</h2>
                {user ? (
                    <p>
                        Ready to start your writing journey? <strong>Explore challenges</strong>, <strong>submit your work</strong>, and <strong>connect with other writers</strong> today!
                    </p>
                ) : (
                    <>
                        <p>
                            Ready to take your writing journey to the next level? <strong>Sign up today</strong> and join a community of passionate writers, creators, and learners. We're excited to see where your creativity takes you!
                        </p>
                        <button className="signup-button" onClick={() => toggleModal('sign-up')}>
                            Join Promptify Now
                        </button>
                    </>
                )}
            </section>

            {showSignUpModal && <SignUpModal toggleModal={toggleModal} />}
            {showLoginModal && <LoginModal toggleModal={toggleModal} />}
        </div>
    );
};