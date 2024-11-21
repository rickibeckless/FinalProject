import { Link } from "react-router-dom";
import PageTitle from "../../components/global/PageTitle.jsx";

export default function Help() {
    return (
        <div className="footer-page-body container">
            <PageTitle title="Help | Promptify" />

            <header className="footer-header">
                <h1>Help Center</h1>
                <p>Your guide to getting started and making the most of Promptify.</p>
            </header>

            <section className="footer-section" id="getting-started">
                <h2>Getting Started</h2>
                <p>
                    Welcome to Promptify! To get started, follow these steps:
                </p>
                <ol>
                    <li><strong>Create an Account:</strong> Sign up to access all features.</li>
                    <li><strong>Explore Challenges:</strong> Browse available writing challenges.</li>
                    <li><strong>Participate:</strong> Choose a challenge and start writing!</li>
                </ol>
            </section>

            <section className="footer-section" id="faq">
                <h2>Frequently Asked Questions</h2>

                <h3>1. How do I reset my password?</h3>
                <p>
                    To reset your password, please contact the developer at <Link to="mailto:glbeckless@hotmail.com">glbeckless@hotmail.com</Link>.
                </p>

                <h3>2. How can I submit my writing?</h3>
                <p>
                    After completing a challenge, you can submit your writing directly on the challenge page. Make sure to review your work before submitting!
                </p>

                <h3>3. Can I delete my account?</h3>
                <p>
                    Yes, to delete your account, navigate to your account setting found after selecting your profile picture. Then, navigate to the "Delete Profile" section and select the delete button. Please note that this action is irreversible.
                </p>

                <h3>4. How does community feedback work?</h3>
                <p>
                    After you submit your writing, other users can provide feedback and vote on your submission. Engage with their comments to improve your writing!
                </p>

                <h3>5. What should I do if I encounter a technical issue?</h3>
                <p>
                    If you experience any technical issues, please reach out to the developer via email at <Link to="mailto:glbeckless@hotmail.com">glbeckless@hotmail.com</Link>.
                </p>
            </section>

            <section className="footer-section" id="contact-support">
                <h2>Contact Support</h2>
                <p>
                    If you have any additional questions or need further assistance, please contact the developer:
                </p>
                <fieldset>
                    <legend>Contact Information</legend>
                    <p>
                        <strong>Name:</strong> Ricki Beckless
                    </p>
                    <p>
                        <strong>Email:</strong> <Link to="mailto:glbeckless@hotmail.com">glbeckless@hotmail.com</Link>
                    </p>
                    <p>
                        <strong>GitHub:</strong> <Link to="https://www.github.com/rickibeckless" target="_blank" rel="noopener noreferrer">github.com/rickibeckless</Link>
                    </p>
                    <p>
                        <strong>LinkedIn:</strong> <Link to="https://www.linkedin.com/in/ricki-beckless" target="_blank" rel="noopener noreferrer">linkedin.com/in/ricki-beckless</Link>
                    </p>
                </fieldset>

                <p>
                    We aim to respond to all inquiries within three(3) business days.
                </p>
            </section>
        </div>
    );
}
