/**
 * Desc: Join a challenge page, used to join a challenge.
*/

// general imports
import { useEffect, useState, useContext } from "react";
import { useNavigate, useLocation, Link, useParams } from "react-router-dom";
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

    const [submissionForm, setSubmissionForm] = useState({
        title: '',
        summary: '',
        content: '',
        genre: ''
    });

    useEffect(() => { // runs once when the page loads
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

                    if (data[0].limitations.word_limit.min) {
                        setWordMin(data[0].limitations.word_limit.min);
                    };

                    if (data[0].limitations.word_limit.max) {
                        setWordMax(data[0].limitations.word_limit.max);
                    };

                    if (data[0].limitations.character_limit.min) {
                        setCharacterMin(data[0].limitations.character_limit.min);
                    };

                    if (data[0].limitations.character_limit.max) {
                        setCharacterMax(data[0].limitations.character_limit.max);
                    };

                    if (data[0].limitations.time_limit.max) {
                        setTimeLimit(data[0].limitations.time_limit.max);
                    };

                    fetchAuthor(data[0].author_id);

                    setLoading(false);
                } else {
                    console.error("JoinChallenge.jsx - fetchChallenge() - error fetching challenge:", response.statusText);
                    setMessage("Error fetching challenge. Please try again later.");
                    setLoading(false);
                };
            } catch (error) {
                console.error("JoinChallenge.jsx - fetchChallenge() - error fetching challenge:", error);
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
        setTimer(setInterval(() => {
            let time = 0;

            if (timeLimit !== null) {
                time = timeLimit;

                if (time <= 0) {
                    clearInterval(timer);
                    handleSubmit();
                } else {
                    time -= 1;
                };
            } else {
                time += 1;
            };
        }, 1000));
    };

    const handleCancel = () => {
        clearInterval(timer);
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
        // setWordCount(content.split(' ').length);
        // setCharacterCount(content.length);
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
        e.preventDefault();
        setLoading(true);
        clearInterval(timer);
        const now = new Date();
        const formattedDateTime = now.toISOString();
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
                console.error("JoinChallenge.jsx - handleSubmit() - error creating submission:", response.statusText);
                setMessage("Error creating submission. Please try again later.");
                setLoading(false);
            };
        } catch (error) {
            console.error("JoinChallenge.jsx - handleSubmit() - error creating submission:", error);
            setMessage("Error creating submission. Please try again later.");
            setLoading(false);
        }

        setOpenSubmissionForm(false);
    };

    const toolbar = document.querySelector('.ql-toolbar');
    useEffect(() => {
        async function setToolbar() {
            toolbar.innerHTML = `
                <div class="ql-toolbar ql-snow">
                    <span class="ql-formats">
                        <button type="button" class="ql-bold">
                            <svg viewBox="0 0 18 18">
                                <path class="ql-stroke"
                                    d="M5,4H9.5A2.5,2.5,0,0,1,12,6.5v0A2.5,2.5,0,0,1,9.5,9H5A0,0,0,0,1,5,9V4A0,0,0,0,1,5,4Z">
                                </path>
                                <path class="ql-stroke"
                                    d="M5,9h5.5A2.5,2.5,0,0,1,13,11.5v0A2.5,2.5,0,0,1,10.5,14H5a0,0,0,0,1,0,0V9A0,0,0,0,1,5,9Z">
                                </path>
                            </svg>
                        </button>
                        <button type="button" class="ql-italic">
                            <svg viewBox="0 0 18 18">
                                <line class="ql-stroke" x1="7" x2="13" y1="4" y2="4"></line>
                                <line class="ql-stroke" x1="5" x2="11" y1="14" y2="14"></line>
                                <line class="ql-stroke" x1="8" x2="10" y1="14" y2="4"></line>
                            </svg>
                        </button>
                        <button type="button" class="ql-underline">
                            <svg viewBox="0 0 18 18">
                                <path class="ql-stroke" d="M5,3V9a4.012,4.012,0,0,0,4,4H9a4.012,4.012,0,0,0,4-4V3"></path>
                                <rect class="ql-fill" height="1" rx="0.5" ry="0.5" width="12" x="3" y="15"></rect>
                            </svg>
                        </button>
                    </span>
                    <span class="ql-formats">
                        <button type="button" class="ql-clean">
                            <svg class="" viewBox="0 0 18 18">
                                <line class="ql-stroke" x1="5" x2="13" y1="3" y2="3"></line>
                                <line class="ql-stroke" x1="6" x2="9.35" y1="12" y2="3"></line>
                                <line class="ql-stroke" x1="11" x2="15" y1="11" y2="15"></line>
                                <line class="ql-stroke" x1="15" x2="11" y1="11" y2="15"></line>
                                <rect class="ql-fill" height="1" rx="0.5" ry="0.5" width="7" x="2" y="14"></rect>
                            </svg>
                        </button>
                    </span>
                </div>
            `;
        };

        setToolbar();
    }, [openSubmissionForm, toolbar]);

    return (
        <> {/* React fragment (shorthand), used to return multiple elements. Pages usually start with fragment */}
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
                    <button type="button" onClick={handleStart}>Start</button>
                ) : (
                    <button type="button" onClick={handleCancel}>Cancel</button>
                )}

                {openSubmissionForm &&
                    <section id="submission-section">

                        <form id="submission-form" onSubmit={(e) => handleSubmit(e)}>
                            {currentPage === 1 && (
                                <div className="form-page">
                                    <div className="create-challenge-form-input-holder">
                                        <label htmlFor="title">Title:<span className="form-input-required-asterisk">*</span></label>
                                        <input type="text" id="title" name="title" placeholder="New Challenge" value={submissionForm.title} onFocus={() => handleFocus('title-input')} onChange={(e) => handlePreContentChange(e)} required />
                                    </div>
                                </div>
                            )}

                            {currentPage === 2 && (
                                <div className="form-page">
                                    <div className="create-challenge-form-input-holder">
                                        <ReactQuill theme="snow" value={submissionForm.content} onChange={(e) => handleContentChange(e)} />
                                    </div>
                                    <div className="create-challenge-form-input-holder">
                                        <p>{wordCount}/{wordMax}</p>
                                        <p>{characterCount}/{characterMax}</p>
                                        {timeLimit && <p>Time remaining: {timeLimit}</p>}
                                        <p>{timer}</p>
                                    </div>
                                    <div className="create-challenge-form-input-holder">
                                        {submissionForm.content}
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
                                    <button type="submit">Create Challenge</button>
                                }
                            </div>
                        </form>
                    </section>
                }
            </main>
        </>
    );
};