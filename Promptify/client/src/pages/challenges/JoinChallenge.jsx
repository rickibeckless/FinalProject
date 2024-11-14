/**
 * Desc: Join a challenge page, used to join a challenge.
*/

// general imports
import { useEffect, useState, useContext } from "react";
import { useNavigate, useLocation, Link, useParams } from "react-router-dom";
import DOMPurify from 'dompurify';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// import any images or assets here
import FirstPageImg from "../../assets/first_page.svg";
import LastPageImg from "../../assets/last_page.svg";
import NextPageImg from "../../assets/forward.svg";
import PreviousPageImg from "../../assets/backward.svg";

// sets the page title, used by all pages in the format "Page Title | Promptify"
import PageTitle from "../../components/global/PageTitle.jsx"; // note: components will not use this

// loading screen for when the page is loading (also used for transitions and testing)
import LoadingScreen from "../../components/global/LoadingScreen.jsx";

// message popup for errors, warnings, and successes
import MessagePopup from "../../components/global/MessagePopup.jsx";

// styles that a component uses may also be imported here
import "../../styles/challenges/join-challenge.css";

// some pages may also need to import utils, hooks, or context
import AuthContext from "../../context/AuthProvider.jsx"; // context used for authentication

export default function JoinChallenge() {
    const { user } = useContext(AuthContext); // context used for authentication
    const [loading, setLoading] = useState(true); // set to false when done loading
    const [message, setMessage] = useState(""); // set to message to display in message popup

    const navigate = useNavigate(); // used to navigate to a different page
    const location = useLocation(); // used to get the current location

    const { challengeId } = useParams();
    const [challenge, setChallenge] = useState(null);
    const [author, setAuthor] = useState(null);

    const [focusedInput, setFocusedInput] = useState(null);
    const [openSubmissionForm, setOpenSubmissionForm] = useState(false);
    const totalPages = 3;
    const [currentPage, setCurrentPage] = useState(1);

    const [timer, setTimer] = useState(null);
    const [wordCount, setWordCount] = useState(0);
    const [characterCount, setCharacterCount] = useState(0);

    const [startDateTime, setStartDateTime] = useState('');
    const [endDateTime, setEndDateTime] = useState('');

    const [wordMin, setWordMin] = useState(null);
    const [wordMax, setWordMax] = useState(null);
    const [characterMin, setCharacterMin] = useState(null);
    const [characterMax, setCharacterMax] = useState(null);
    const [timeLimit, setTimeLimit] = useState(null);

    const [elapsedTime, setElapsedTime] = useState(0);

    const [submissionForm, setSubmissionForm] = useState({
        title: '',
        summary: '',
        content: '',
        genre: ''
    });

    useEffect(() => {
        async function fetchChallenge() {
            try {
                const response = await fetch(`/api/challenges/${challengeId}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setChallenge(data[0]);

                    const { word_limit, character_limit, time_limit } = data[0].limitations;

                    if (data[0].author_id === user.id) {
                        setMessage("You cannot join your own challenge.");
                        setLoading(false);
                        return;
                    };

                    if (data[0].start_date_time > new Date()) {
                        setMessage("This challenge has not started yet.");
                        setLoading(false);
                        return;
                    };

                    if (data[0].end_date_time < new Date()) {
                        setMessage("This challenge has already ended.");
                        setLoading(false);
                        return;
                    };

                    const timeLimitInSeconds = time_limit?.max * 60;

                    setWordMin(word_limit?.min || null);
                    setWordMax(word_limit?.max || null);
                    setCharacterMin(character_limit?.min || null);
                    setCharacterMax(character_limit?.max || null);
                    setTimeLimit(timeLimitInSeconds || null);

                    fetchAuthor(data[0].author_id);

                    setLoading(false);
                } else {
                    console.error("Error fetching challenge:", response.statusText);
                    setMessage("Error fetching challenge. Please try again later.");
                    setLoading(false);
                };
            } catch (error) {
                console.error("Error fetching challenge:", error);
                setMessage("Error fetching challenge. Please try again later.");
                setLoading(false);
            };
        };

        async function fetchAuthor(author_id) {
            const response = await fetch(`/api/users/${author_id}`);
            const data = await response.json();

            if (response.ok) {
                setAuthor(data[0]);
            };
        };

        fetchChallenge();
    }, [challengeId]);

    const handleStart = async () => {
        const now = new Date();
        const formattedDateTime = now.toISOString();
        setStartDateTime(formattedDateTime);
        setOpenSubmissionForm(true);

        if (timeLimit) {
            setElapsedTime(timeLimit);
        } else {
            setElapsedTime(0);
        };
    };

    useEffect(() => {
        let interval;
        if (openSubmissionForm) {
            interval = setInterval(() => {
                setElapsedTime(prevTime => {
                    if (timeLimit !== null && prevTime <= 1) {
                        clearInterval(interval);
                        handleSubmit();
                        return 0;
                    }
                    return timeLimit ? prevTime - 1 : prevTime + 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [openSubmissionForm, timeLimit]);

    const formatTime = (seconds) => {
        const hrs = String(Math.floor(seconds / 3600)).padStart(2, '0');
        const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
        const secs = String(seconds % 60).padStart(2, '0');
        return `${hrs}:${mins}:${secs}`;
    };    

    const handleCancel = () => {
        clearInterval(timer);
        setElapsedTime(0);
        setSubmissionForm({
            title: '',
            summary: '',
            content: '',
            genre: ''
        });
        setWordCount(0);
        setCharacterCount(0);
        setCurrentPage(1);
        setMessage("Submission cancelled.");
        setInterval(() => {
            setMessage("");
        }, 3500);
        setOpenSubmissionForm(false);
    };

    const handleFocus = (input) => {
        setFocusedInput(input);
    };

    const handlePreContentChange = (e) => {
        const { name, value } = e.target;

        setSubmissionForm((prevForm) => ({
            ...prevForm,
            [name]: value
        }));
    };

    const handleContentChange = (content) => {
        setSubmissionForm({ ...submissionForm, content });
        updateCounts(content);
    };

    const updateCounts = (htmlContent) => {
        const tempElement = document.createElement("div");
        tempElement.innerHTML = htmlContent;
        const plainText = tempElement.textContent || tempElement.innerText || "";
        const blockElements = ['address', 'article', 'aside', 'blockquote', 'details', 'dialog', 'dd', 'div', 'dl', 'dt', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hr', 'li', 'main', 'nav', 'ol', 'p', 'pre', 'section', 'table', 'ul'];

        const words = plainText.trim().split(/[\s\n]+/);
        const wordCount = words.filter((word) => word.length > 0).length;
        const blockElementsCount = tempElement.querySelectorAll(blockElements.join(',')).length - 1;
        const totalWordCount = wordCount + blockElementsCount;
        setWordCount(totalWordCount);
    
        const charCount = plainText.length;
        setCharacterCount(charCount);
    };

    const goToNextPage = (i) => {
        if (i === 'last') {
            setCurrentPage(totalPages);
        } else {
            setCurrentPage((prevPage) => prevPage + i);
        }
    };

    const goToPreviousPage = (i) => {
        if (i === 'first') {
            setCurrentPage(1);
        } else {
            setCurrentPage((prevPage) => prevPage - i);
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        clearInterval(timer);
        const now = new Date();
        const formattedDateTime = now.toISOString();
        console.log(formattedDateTime);
        setEndDateTime(formattedDateTime);

        const submission = {
            title: submissionForm.title,
            summary: submissionForm.summary,
            content: submissionForm.content,
            genre: submissionForm.genre,
            started_at: startDateTime,
            submitted_at: endDateTime
        };

        try {
            const response = await fetch(`/api/submissions/${user.id}/${challenge.id}/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(submission),
            });

            if (response.ok) {
                setMessage("Submission created successfully!");
                setLoading(false);
            } else {
                console.error("Error creating submission:", response.statusText);
                setMessage("Error creating submission. Please try again later.");
                setLoading(false);
            };
        } catch (error) {
            console.error("Error creating submission:", error);
            setMessage("Error creating submission. Please try again later.");
            setLoading(false);
        }

        setOpenSubmissionForm(false);
    };

    const modules = {
        toolbar: {
            container: '#toolbar',
        },
    };

    const formats = [
        'bold', 'italic', 'underline', 'clean'
    ];

    return (
        <>
            <PageTitle title={`New Submission | Promptify`} />
            {loading ? <LoadingScreen /> : null}
            {message && <MessagePopup message={message} setMessage={setMessage} />}

            <main id="join-challenge-body" className="container">
                <section id="challenge-details-section">
                    <h1 id="name">New Submission | {challenge?.name} <span id="author">{author?.username}</span></h1>
                    <p className="challenge-detail" id="description">{challenge?.description}</p>
                    <p className="challenge-detail" id="dates">{new Date(challenge?.start_date_time).toLocaleDateString()} - {new Date(challenge?.end_date_time).toLocaleDateString()}</p>
                    <p className="challenge-detail" id="genre">{challenge?.genre}</p>
                    <p className="challenge-detail" id="skill-level">{challenge?.skill_level}</p>
                    {wordMin && wordMax && <p className="challenge-detail" id="word-limit">Word Limit: {wordMin} - {wordMax}</p>}
                    {characterMin && characterMax && <p className="challenge-detail" id="character-limit">Character Limit: {characterMin} - {characterMax}</p>}
                    {timeLimit && <p className="challenge-detail" id="time-limit">Time Limit: {timeLimit}</p>}
                    <p className="challenge-detail" id="available-points">{challenge?.available_points} points available!</p>
                    <div className="challenge-detail-holder" id="prompt-holder">
                        <h2>Prompt</h2>
                        <p className="challenge-detail" id="prompt">{challenge?.prompt}</p>
                    </div>
                </section>

                {!openSubmissionForm ? (
                    <button type="button" className="form-cancel-btn" onClick={handleStart}>Start</button>
                ) : (
                    <button type="button" className="form-cancel-btn" onClick={handleCancel}>Cancel</button>
                )}

                {openSubmissionForm &&
                    <section id="submission-section">
                        <form id="submission-form" onSubmit={(e) => handleSubmit(e)}>
                            {openSubmissionForm && (
                                <p className="form-counter">{formatTime(elapsedTime)}</p>
                            )}

                            {currentPage === 1 && (
                                <div className="form-page">
                                    <h3 className="form-page-header">Response Information</h3>
                                    <div className="submission-form-input-holder">
                                        <label htmlFor="title">Title:<span className="form-input-required-asterisk">*</span></label>
                                        <input type="text" id="title" name="title" placeholder="New Challenge" value={submissionForm.title} onFocus={() => handleFocus('title-input')} onChange={(e) => handlePreContentChange(e)} required />
                                    </div>
                                    <div className="submission-form-input-holder">
                                        <label htmlFor="summary">Summary:<span className="form-input-required-asterisk">*</span></label>
                                        <textarea id="summary" name="summary" placeholder="Write a brief summary of your submission." value={submissionForm.summary} onFocus={() => handleFocus('summary-input')} onChange={(e) => handlePreContentChange(e)} required />
                                    </div>
                                    <div className="submission-form-input-holder">
                                        <label htmlFor="genre">Genre:<span className="form-input-required-asterisk">*</span></label>
                                        <select id="genre" name="genre" value={submissionForm.genre} onFocus={() => handleFocus('genre-input')} onChange={(e) => handlePreContentChange(e)} required>
                                            <option value="">Select a genre</option>
                                            <option value="fantasy">Fantasy</option>
                                            <option value="non-fiction">Non-Fiction</option>
                                            <option value="thriller">Thriller</option>
                                            <option value="poetry">Poetry</option>
                                            <option value="general">General</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            {currentPage === 2 && (
                                <div className="form-page">
                                    <h3 className="form-page-header">Prompt Response<span className="form-input-required-asterisk">*</span></h3>
                                    <div className="submission-form-input-holder">
                                        <div id="toolbar">
                                            <span className="ql-formats">
                                                <button className="ql-bold"></button>
                                                <button className="ql-italic"></button>
                                                <button className="ql-underline"></button>
                                                <button className="ql-clean"></button>
                                            </span>
                                        </div>
                                        <ReactQuill formats={formats} modules={modules} theme="snow" value={submissionForm.content} onChange={(e) => handleContentChange(e)} />
                                    </div>
                                    <div className="submission-form-input-holder form-counters-holder">
                                        <p className="form-counter">{wordCount}{wordMax && (<>/{wordMax}</>)} words</p>
                                        <p className="form-counter">{characterCount}{characterMax && (<>/{characterMax}</>)} characters</p>
                                    </div>
                                </div>
                            )}

                            {currentPage === 3 && (
                                <div className="form-page">
                                    <h3 className="form-page-header">Review your submission:</h3>
                                    <div className="submission-form-input-holder">
                                        <div className="submission-form-input-holder">
                                            <h4>Title:</h4>
                                            <p>{submissionForm.title}</p>
                                        </div>
                                        <div className="submission-form-input-holder">
                                            <h4>Summary:</h4>
                                            <p>{submissionForm.summary}</p>
                                        </div>
                                        <div className="submission-form-input-holder">
                                            <h4>Genre:</h4>
                                            <p>{submissionForm.genre}</p>
                                        </div>
                                        <div className="submission-form-input-holder">
                                            <h4>Content:</h4>
                                            <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(submissionForm.content) }} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="form-navigation-buttons">
                                {currentPage > 1 && currentPage <= totalPages &&
                                    <div className="button-group">
                                        <button type="button" onClick={() => goToPreviousPage('first')}>
                                            <img src={FirstPageImg} alt="First Page" />
                                        </button>

                                        <button type="button" onClick={() => goToPreviousPage(1)}>
                                            <img src={PreviousPageImg} alt="Previous Page" />
                                        </button>
                                    </div>
                                }

                                <div className="current-page-number">
                                    <p>{currentPage} / {totalPages}</p>
                                </div>

                                {currentPage < totalPages && currentPage !== totalPages &&
                                    <div className="button-group">
                                        <button type="button" onClick={() => goToNextPage(1)}>
                                            <img src={NextPageImg} alt="Next Page" />
                                        </button>

                                        <button type="button" onClick={() => goToNextPage('last')}>
                                            <img src={LastPageImg} alt="Last Page" />
                                        </button>
                                    </div>
                                }
                                {currentPage === totalPages &&
                                    <button type="submit">Submit</button>
                                }
                            </div>
                        </form>
                    </section>
                }
            </main>
        </>
    );
};