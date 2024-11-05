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
                    Click on the “Forgot Password?” link on the login page. Follow the prompts to reset your password.
                </p>

                <h3>2. How can I submit my writing?</h3>
                <p>
                    After completing a challenge, you can submit your writing directly on the challenge page. Make sure to review your work before submitting!
                </p>

                <h3>3. Can I delete my account?</h3>
                <p>
                    Yes, if you wish to delete your account, please contact our support team at <a href="mailto:glbeckless@hotmail.com">glbeckless@hotmail.com</a> for assistance.
                </p>

                <h3>4. How does community feedback work?</h3>
                <p>
                    After you submit your writing, other users can provide feedback and vote on your submission. Engage with their comments to improve your writing!
                </p>

                <h3>5. What should I do if I encounter a technical issue?</h3>
                <p>
                    If you experience any technical issues, please reach out to the developer via email at <a href="mailto:glbeckless@hotmail.com">glbeckless@hotmail.com</a>.
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
                        <strong>Email:</strong> <a href="mailto:glbeckless@hotmail.com">glbeckless@hotmail.com</a>
                    </p>
                    <p>
                        <strong>GitHub:</strong> <a href="https://www.github.com/rickibeckless" target="_blank" rel="noopener noreferrer">github.com/rickibeckless</a>
                    </p>
                    <p>
                        <strong>LinkedIn:</strong> <a href="https://www.linkedin.com/in/ricki-beckless" target="_blank" rel="noopener noreferrer">linkedin.com/in/ricki-beckless</a>
                    </p>
                </fieldset>

                <p>
                    We aim to respond to all inquiries within three(3) business days.
                </p>
            </section>
        </div>
    );
}
