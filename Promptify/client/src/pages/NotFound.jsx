import { Link } from "react-router-dom";
import PageTitle from "../components/global/PageTitle.jsx";
import "../styles/notFound/not-found.css";

export default function NotFound() {
    return (
        <main className="container" id="not-found-body">
            <PageTitle title="404 Page Not Found" />
            <section className="not-found-content">
                <div className="error-header">
                    <h1>404</h1>
                    <h2>Page Not Found</h2>
                </div>
                <p>
                    Oops! The page you're looking for either doesn't exist, requires higher authorization, or may have been moved or deleted.
                </p>
                <p>
                    If you think this is an error, feel free to <a href="mailto:glbeckless@hotmail.com">contact the developer</a>.
                </p>
                <p>Here are some useful links to help you get back on track:</p>
                <ul className="not-found-links">
                    <li><Link to="/about">ℹ️ About Us</Link></li>
                    <li><Link to="/challenges">🏆 Challenges</Link></li>
                    <li><Link to="/help">❓ Help</Link></li>
                </ul>
                <Link to="/" className="challenge-card-button">Go Back Home</Link>
            </section>
        </main>
    );
};