import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { format, set } from 'date-fns';
import AuthContext from "../../context/AuthProvider.jsx";
import LoadingScreen from "../../components/global/LoadingScreen.jsx";
import MessagePopup from "../../components/global/MessagePopup.jsx";
import PageTitle from "../../components/global/PageTitle.jsx";
import SignUpModal from "../../components/global/modals/SignUp.jsx";
import LoginModal from "../../components/global/modals/Login.jsx";

import FirstPageImg from "../../assets/first_page.svg";
import LastPageImg from "../../assets/last_page.svg";
import NextPageImg from "../../assets/forward.svg";
import PreviousPageImg from "../../assets/backward.svg";

import "../../styles/challenges/create-challenge.css";

export default function CreateChallenge() {
    const [loading, setLoading] = useState(true); // set to false when done loading
    const [message, setMessage] = useState(""); // set to message to display in message popup
    const { user } = useContext(AuthContext);
    const [focusedInput, setFocusedInput] = useState(null);
    const totalPages = 5;
    const [currentPage, setCurrentPage] = useState(1);
    const [currentDateTime, setCurrentDateTime] = useState('');
    const [selectedLimitations, setSelectedLimitations] = useState([]);
    const [challengeForm, setChallengeForm] = useState({
        author_id: '',
        name: '',
        description: '',
        genre: '',
        prompt: '',
        skill_level: '',
        limitations: {
            time_limit: { min: null, max: null },
            word_limit: { min: null, max: null },
            character_limit: { min: null, max: null },
            required_phrase: []
        },
        start_date_time: '',
        end_date_time: '',
    });

    const token = localStorage.getItem("token");

    const navigate = useNavigate(); // used to navigate to a different page

    const [showSignUpModal, setShowSignUpModal] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);

    useEffect(() => {
        const checkUser = async () => {
            if (token) {
                if (user) {
                    setChallengeForm((prevForm) => ({
                        ...prevForm,
                        author_id: user.id,
                    }));
                }
                setLoading(false);
            } else {
                setLoading(false);
                setShowLoginModal(true);
            }
        };
        checkUser();
    }, [token, user]);

    const toggleModal = (type, previousType) => {
        if (previousType) {
            if (previousType === "sign-up") {
                setShowSignUpModal(false);
            } else if (previousType === "login") {
                setShowLoginModal(false);
            } else if (previousType === "close") {
                document.body.classList.remove("modal-open");
                navigate("/");
            };
        } else {
            document.body.classList.remove("modal-open");
        };

        if (type === "sign-up") {
            setShowSignUpModal(!showSignUpModal);
        } else if (type === "login") {
            setShowLoginModal(!showLoginModal);
        };
    };

    useEffect(() => {
        const now = new Date();
        const formattedDate = format(now, "yyyy-MM-dd'T'HH:mm");
        setCurrentDateTime(formattedDate);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (Object.keys(challengeForm.limitations).includes(name)) {
            setChallengeForm((prevForm) => ({
                ...prevForm,
                limitations: {
                    ...prevForm.limitations,
                    [name]: value
                }
            }));
        } else {
            setChallengeForm({
                ...challengeForm,
                [name]: value
            });
        }
    };

    const handleRangeChange = (e, type, limitType) => {
        const { value } = e.target;
        setChallengeForm((prevForm) => ({
            ...prevForm,
            limitations: {
                ...prevForm.limitations,
                [type]: {
                    ...prevForm.limitations[type],
                    [limitType]: value
                }
            }
        }));
    };

    const handleFocus = (input_field) => {
        setFocusedInput(input_field);
    };

    const handleLimitations = (e) => {
        const { name, checked } = e.target;

        if (checked) {
            setSelectedLimitations((prev) => [...prev, name]);
        } else {
            setSelectedLimitations((prev) => prev.filter((limitation) => limitation !== name));
        }

        setChallengeForm((prevForm) => ({
            ...prevForm,
            limitations: {
                ...prevForm.limitations,
                [name]: checked ? prevForm.limitations[name] : { min: '', max: '' }
            }
        }));
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

        if (challengeForm.limitations.required_phrase.includes('\n')) {
            setChallengeForm((prevForm) => ({
                ...prevForm,
                limitations: {
                    ...prevForm.limitations,
                    required_phrase: prevForm.limitations.required_phrase.split('\n')
                }
            }));
        }

        try {
            const response = await fetch('/api/challenges/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(challengeForm)
            });

            if (response.ok) {
                const data = await response.json();
                console.log(data);

                setMessage("Challenge created successfully!");

                setTimeout(() => {
                    setMessage(null);
                    navigate(`/challenges/${data[0].id}`);
                }, 3000);
            } else {
                const error = await response.json();
                setMessage(error.error);
            };
        } catch (error) {
            setMessage("An unexpected error occurred. Please try again.");
        };

        setLoading(false);
    };

    return (
        <>
            {loading ? <LoadingScreen /> : null}
            <PageTitle title="Create Challenge | Promptify" />

            <main id="create-challenge-body" className="container">
                <h2>New Challenge</h2>

                {user ? (
                    <form id="create-challenge-form" onSubmit={handleSubmit}>
                        {currentPage === 1 && (
                            <div className="form-page">
                                <div className="create-challenge-form-input-holder">
                                    <label htmlFor="name">Name:<span className="form-input-required-asterisk">*</span></label>
                                    <input type="text" id="name" name="name" placeholder="New Challenge" value={challengeForm.name} onFocus={() => handleFocus('name-input')} onChange={handleChange} required />
                                </div>

                                <div className="create-challenge-form-input-holder">
                                    <label htmlFor="description">Description:<span className="form-input-required-asterisk">*</span></label>
                                    <textarea id="description" name="description" placeholder="Describe your challenge here." value={challengeForm.description} onFocus={() => handleFocus('description-input')} onChange={handleChange} required />
                                </div>
                            </div>
                        )}

                        {currentPage === 2 && (
                            <div className="form-page">
                                <div className="create-challenge-form-input-holder">
                                    <label htmlFor="skill_level">Skill Level:<span className="form-input-required-asterisk">*</span></label>
                                    <select id="skill_level" name="skill_level" value={challengeForm.skill_level} onFocus={() => handleFocus('skill_level-input')} onChange={handleChange} required>
                                        <option value="">Select a skill level</option>
                                        <option value="beginner">Beginner</option>
                                        <option value="intermediate">Intermediate</option>
                                        <option value="advanced">Advanced</option>
                                    </select>
                                </div>

                                <div className="create-challenge-form-input-holder">
                                    <label htmlFor="genre">Genre:<span className="form-input-required-asterisk">*</span></label>
                                    <select id="genre" name="genre" value={challengeForm.genre} onFocus={() => handleFocus('genre-input')} onChange={handleChange} required>
                                        <option value="">Select a genre</option>
                                        <option value="fantasy">Fantasy</option>
                                        <option value="non-fiction">Non-Fiction</option>
                                        <option value="thriller">Thriller</option>
                                        <option value="poetry">Poetry</option>
                                        <option value="general">General</option>
                                    </select>
                                </div>

                                <div className="create-challenge-form-input-holder">
                                    <label htmlFor="limitations">Does your prompt have any limitations?</label>
                                    <div className="limitations-checkboxes">

                                        <div className="limitation-checkbox-holder">
                                            <input
                                                type="checkbox"
                                                id="time_limit"
                                                name="time_limit"
                                                onFocus={() => handleFocus('time_limit-input')}
                                                onChange={handleLimitations}
                                            />
                                            <label htmlFor="time_limit">Time Limit</label>

                                            {selectedLimitations.includes('time_limit') && (
                                                <div className="limitations-input">
                                                    <input
                                                        type="number"
                                                        id="time_limit-min"
                                                        name="time_limit_min"
                                                        placeholder="Min time limit"
                                                        value={challengeForm.limitations.time_limit?.min || ''}
                                                        onFocus={() => handleFocus('time_limit-min')}
                                                        onChange={(e) => handleRangeChange(e, 'time_limit', 'min')}
                                                    />
                                                    <input
                                                        type="number"
                                                        id="time_limit-max"
                                                        name="time_limit_max"
                                                        placeholder="Max time limit"
                                                        value={challengeForm.limitations.time_limit?.max || ''}
                                                        onFocus={() => handleFocus('time_limit-max')}
                                                        onChange={(e) => handleRangeChange(e, 'time_limit', 'max')}
                                                    />
                                                    {focusedInput === 'time_limit-min' && <p>Enter minimum time in minutes</p>}
                                                    {focusedInput === 'time_limit-max' && <p>Enter maximum time in minutes</p>}
                                                </div>
                                            )}
                                        </div>

                                        <div className="limitation-checkbox-holder">
                                            <input
                                                type="checkbox"
                                                id="word_limit"
                                                name="word_limit"
                                                onFocus={() => handleFocus('word_limit-input')}
                                                onChange={handleLimitations}
                                            />
                                            <label htmlFor="word_limit">Word Limit</label>

                                            {selectedLimitations.includes('word_limit') && (
                                                <div className="limitations-input">
                                                    <input
                                                        type="number"
                                                        id="word_limit-min"
                                                        name="word_limit_min"
                                                        placeholder="Min word limit"
                                                        value={challengeForm.limitations.word_limit?.min || ''}
                                                        onFocus={() => handleFocus('word_limit-min')}
                                                        onChange={(e) => handleRangeChange(e, 'word_limit', 'min')}
                                                    />
                                                    <input
                                                        type="number"
                                                        id="word_limit-max"
                                                        name="word_limit_max"
                                                        placeholder="Max word limit"
                                                        value={challengeForm.limitations.word_limit?.max || ''}
                                                        onFocus={() => handleFocus('word_limit-max')}
                                                        onChange={(e) => handleRangeChange(e, 'word_limit', 'max')}
                                                    />
                                                    {focusedInput === 'word_limit-min' && <p>Minimum word limit</p>}
                                                    {focusedInput === 'word_limit-max' && <p>Maximum word limit</p>}
                                                </div>
                                            )}
                                        </div>

                                        <div className="limitation-checkbox-holder">
                                            <input
                                                type="checkbox"
                                                id="character_limit"
                                                name="character_limit"
                                                onFocus={() => handleFocus('character_limit-input')}
                                                onChange={handleLimitations}
                                            />
                                            <label htmlFor="character_limit">Character Limit</label>

                                            {selectedLimitations.includes('character_limit') && (
                                                <div className="limitations-input">
                                                    <input
                                                        type="number"
                                                        id="character_limit-min"
                                                        name="character_limit_min"
                                                        placeholder="Min character limit"
                                                        value={challengeForm.limitations.character_limit?.min || ''}
                                                        onFocus={() => handleFocus('character_limit-min')}
                                                        onChange={(e) => handleRangeChange(e, 'character_limit', 'min')}
                                                    />
                                                    <input
                                                        type="number"
                                                        id="character_limit-max"
                                                        name="character_limit_max"
                                                        placeholder="Max character limit"
                                                        value={challengeForm.limitations.character_limit?.max || ''}
                                                        onFocus={() => handleFocus('character_limit-max')}
                                                        onChange={(e) => handleRangeChange(e, 'character_limit', 'max')}
                                                    />
                                                    {focusedInput === 'character_limit-min' && <p>Minimum character limit</p>}
                                                    {focusedInput === 'character_limit-max' && <p>Maximum character limit</p>}
                                                </div>
                                            )}
                                        </div>

                                        <div className="limitation-checkbox-holder">
                                            <input
                                                type="checkbox"
                                                id="required_phrase"
                                                name="required_phrase"
                                                onFocus={() => handleFocus('required_phrase-input')}
                                                onChange={handleLimitations}
                                            />
                                            <label htmlFor="required_phrase">Required Phrase</label>

                                            {selectedLimitations.includes('required_phrase') && (
                                                // <div className="limitations-input">
                                                //     <input
                                                //         type="text"
                                                //         id="required_phrase-input"
                                                //         name="required_phrase"
                                                //         placeholder="Enter required phrase(s)"
                                                //         value={challengeForm.limitations.required_phrase || ''}
                                                //         onFocus={() => handleFocus('required_phrase-input')}
                                                //         onChange={handleChange}
                                                //     />
                                                //     {focusedInput === 'required_phrase-input' && <p>Enclose each phrase in `backticks`</p>}
                                                // </div>
                                                <div className="limitations-input">
                                                    <textarea
                                                        id="required_phrase-input"
                                                        name="required_phrase"
                                                        placeholder="Enter required phrase(s), one per line"
                                                        value={challengeForm.limitations.required_phrase || ''}
                                                        onFocus={() => handleFocus('required_phrase-input')}
                                                        onChange={handleChange}
                                                    />
                                                    {focusedInput === 'required_phrase-input' && <p>Separate each phrase with a new line.</p>}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentPage === 3 && (
                            <div className="form-page">
                                <div className="create-challenge-form-input-holder">
                                    <label htmlFor="prompt">Prompt:<span className="form-input-required-asterisk">*</span></label>
                                    <textarea id="prompt" name="prompt" placeholder="Enter your prompt here." value={challengeForm.prompt} onFocus={() => handleFocus('prompt-input')} onChange={handleChange} required />
                                </div>
                            </div>
                        )}

                        {currentPage === 4 && (
                            <div className="form-page">
                                <div className="create-challenge-form-input-holder">
                                    <label htmlFor="start_date_time">Start Date & Time:<span className="form-input-required-asterisk">*</span></label>
                                    <input type="datetime-local" id="start_date_time" min={currentDateTime} name="start_date_time" value={challengeForm.start_date_time} onFocus={() => handleFocus('start_date_time-input')} onChange={handleChange} required />
                                </div>

                                <div className="create-challenge-form-input-holder">
                                    <label htmlFor="end_date_time">End Date & Time:<span className="form-input-required-asterisk">*</span></label>
                                    <input type="datetime-local" id="end_date_time" min={currentDateTime} name="end_date_time" value={challengeForm.end_date_time} onFocus={() => handleFocus('end_date_time-input')} onChange={handleChange} required />
                                </div>
                            </div>
                        )}

                        {currentPage === totalPages && (
                            <div className="form-page">
                                <h3>Review Your Challenge</h3>

                                <div className="create-challenge-form-input-holder">
                                    <label htmlFor="name">Name:</label>
                                    <p>{challengeForm.name}</p>
                                </div>

                                <div className="create-challenge-form-input-holder">
                                    <label htmlFor="description">Description:</label>
                                    <p>{challengeForm.description}</p>
                                </div>

                                <div className="create-challenge-form-input-holder">
                                    <label htmlFor="genre">Genre:</label>
                                    <p>{challengeForm.genre}</p>
                                </div>

                                <div className="create-challenge-form-input-holder">
                                    <label htmlFor="skill_level">Skill Level:</label>
                                    <p>{challengeForm.skill_level}</p>
                                </div>

                                <div className="create-challenge-form-input-holder">
                                    <label htmlFor="limitations">Restrictions:</label>
                                    <ul>
                                        {challengeForm.limitations.time_limit.min || challengeForm.limitations.time_limit.max ? (
                                            <li>
                                                Time Limit:
                                                {challengeForm.limitations.time_limit.min && <span>{challengeForm.limitations.time_limit.min} minutes</span>}
                                                {challengeForm.limitations.time_limit.max && <span> - {challengeForm.limitations.time_limit.max} minutes</span>}
                                            </li>
                                        ) : null}

                                        {challengeForm.limitations.word_limit.min || challengeForm.limitations.word_limit.max ? (
                                            <li>
                                                Word Limit:
                                                {challengeForm.limitations.word_limit.min && <span>{challengeForm.limitations.word_limit.min} words</span>}
                                                {challengeForm.limitations.word_limit.max && <span> - {challengeForm.limitations.word_limit.max} words</span>}
                                            </li>
                                        ) : null}

                                        {challengeForm.limitations.character_limit.min || challengeForm.limitations.character_limit.max ? (
                                            <li>
                                                Character Limit:
                                                {challengeForm.limitations.character_limit.min && <span>{challengeForm.limitations.character_limit.min} characters</span>}
                                                {challengeForm.limitations.character_limit.max && <span> - {challengeForm.limitations.character_limit.max} characters</span>}
                                            </li>
                                        ) : null}

                                        {challengeForm.limitations.required_phrase ? (
                                            challengeForm.limitations.required_phrase?.includes('\n') ? (
                                                <>
                                                    <li>Required Phrases:</li>
                                                    {challengeForm.limitations.required_phrase.split('\n').map((phrase, index) => (
                                                        <li key={index}>- {phrase}</li>
                                                    ))}
                                                </>
                                            ) : (
                                                <li>Required Phrase: {challengeForm.limitations.required_phrase}</li>
                                            )
                                        ) : null}
                                    </ul>
                                </div>

                                <div className="create-challenge-form-input-holder">
                                    <label htmlFor="prompt">Prompt:</label>
                                    <p>{challengeForm.prompt}</p>
                                </div>

                                <div className="create-challenge-form-input-holder">
                                    <label htmlFor="start_date_time">Start Date & Time:</label>
                                    <p>{challengeForm.start_date_time}</p>
                                </div>

                                <div className="create-challenge-form-input-holder">
                                    <label htmlFor="end_date_time">End Date & Time:</label>
                                    <p>{challengeForm.end_date_time}</p>
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
                ) : <p>Please log in or create an account to create a challenge.</p>}

                {message && <MessagePopup message={message} setMessage={setMessage} />}
                {showSignUpModal && <SignUpModal toggleModal={toggleModal} />}
                {showLoginModal && <LoginModal toggleModal={toggleModal} />}
            </main>
        </>
    );
};