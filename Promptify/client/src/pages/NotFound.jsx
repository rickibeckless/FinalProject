import PageTitle from "../components/global/PageTitle.jsx";
import "../styles/notFound/not-found.css";

export default function NotFound() {
    return (
        <main className="container" id="not-found-body">
            <PageTitle title="404 Page Not Found" />
            <h1>404</h1>
            <h2>Page Not Found</h2>
            <p>Sorry, the page you're looking for either doesn't exist or requires higher authorization. It may have been moved or deleted.</p>
            <a href="/" className="back-home">Go Back Home</a>
        </main>
    )
}