import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../context/AuthProvider.jsx";
import LoadingScreen from "../../components/global/LoadingScreen.jsx";
import MessagePopup from "../../components/global/MessagePopup.jsx";
import PageTitle from "../../components/global/PageTitle.jsx";

export default function CreateChallenge() {
    const [loading, setLoading] = useState(true); // set to false when done loading
    const [message, setMessage] = useState(""); // set to message to display in message popup
    const { user } = useContext(AuthContext);
    const [focusedInput, setFocusedInput] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [challengeForm, setChallengeForm] = useState({
        author_id: user?.id,
        name: '',
        description: '',
        genre: '',
        prompt: '',
        skill_level: '',
        limitations: {
            time_limit: '',
            word_limit: '',
            character_limit: '',
            required_phrase: ''
        },
        start_date_time: '',
        end_date_time: '',
    });

    const navigate = useNavigate(); // used to navigate to a different page

    useEffect(() => { // runs once when the page loads
        setLoading(false); // set to false when done loading
    }, []); // the empty array means this effect will only run once

    const handleChange = (e) => {
        setChallengeForm({
            ...challengeForm,
            [e.target.name]: e.target.value
        });
    };

    const handleFocus = (input_field) => {
        setFocusedInput(input_field);
    };

    const goToNextPage = () => {
        setCurrentPage((prevPage) => prevPage + 1);
    };

    const goToPreviousPage = () => {
        setCurrentPage((prevPage) => prevPage - 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

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
                    navigate(`/challenges/${data.id}`);
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

            <main id="new-challenge-body" className="container">
                <h2>Sign Up</h2>
                <form id="new-challenge-form" onSubmit={handleSubmit}>
                    {currentPage === 1 && (
                        <>
                            <div className="form-input-holder">
                                <label htmlFor="name">Name:<span className="form-input-required-asterisk">*</span></label>
                                <input type="text" id="name" name="name" placeholder="New Challenge" value={challengeForm.name} onFocus={() => handleFocus('name-input')} onChange={handleChange} required />
                            </div>

                            <div className="form-input-holder">
                                <label htmlFor="description">Description:<span className="form-input-required-asterisk">*</span></label>
                                <textarea id="description" name="description" placeholder="Describe your challenge here." value={challengeForm.description} onFocus={() => handleFocus('description-input')} onChange={handleChange} required />
                            </div>

                            <button type="button" onClick={goToNextPage}>Next</button>
                        </>
                    )}

                    {currentPage === 2 && (
                        <>
                            <div className="form-input-holder">
                                <label htmlFor="skill_level">Skill Level:<span className="form-input-required-asterisk">*</span></label>
                                <select id="skill_level" name="skill_level" value={challengeForm.skill_level} onFocus={() => handleFocus('skill_level-input')} onChange={handleChange} required>
                                    <option value="">Select a skill level</option>
                                    <option value="beginner">Beginner</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="advanced">Advanced</option>
                                </select>
                            </div>

                            <div className="form-input-holder">
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

                            <div className="form-input-holder">
                                <label htmlFor="limitations">Does your prompt have any restrictions?</label>
                                <div className="limitations-checkboxes">
                                    <div>
                                        <input type="checkbox" id="time_limit" name="time_limit" value={challengeForm.limitations.time_limit} onFocus={() => handleFocus('time_limit-input')} onChange={handleChange} />
                                        <label htmlFor="time_limit">Time Limit</label>
                                    </div>
                                    <div>
                                        <input type="checkbox" id="word_limit" name="word_limit" value={challengeForm.limitations.word_limit} onFocus={() => handleFocus('word_limit-input')} onChange={handleChange} />
                                        <label htmlFor="word_limit">Word Limit</label>
                                    </div>
                                    <div>
                                        <input type="checkbox" id="character_limit" name="character_limit" value={challengeForm.limitations.character_limit} onFocus={() => handleFocus('character_limit-input')} onChange={handleChange} />
                                        <label htmlFor="character_limit">Character Limit</label>
                                    </div>
                                    <div>
                                        <input type="checkbox" id="required_phrase" name="required_phrase" value={challengeForm.limitations.required_phrase} onFocus={() => handleFocus('required_phrase-input')} onChange={handleChange} />
                                        <label htmlFor="required_phrase">Required Phrase</label>
                                    </div>
                                </div>
                            </div>

                            <button type="button" onClick={goToPreviousPage}>Back</button>
                            <button type="button" onClick={goToNextPage}>Next</button>
                        </>
                    )}

                    {currentPage === 3 && (
                        <>
                            <div className="form-input-holder">
                                <label htmlFor="prompt">Prompt:<span className="form-input-required-asterisk">*</span></label>
                                <textarea id="prompt" name="prompt" placeholder="Enter your prompt here." value={challengeForm.prompt} onFocus={() => handleFocus('prompt-input')} onChange={handleChange} required />
                            </div>

                            <button type="button" onClick={goToPreviousPage}>Back</button>
                            <button type="button" onClick={goToNextPage}>Next</button>
                        </>
                    )}

                    {currentPage === 4 && (
                        <>
                            <div className="form-input-holder">
                                <label htmlFor="start_date_time">Start Date & Time:<span className="form-input-required-asterisk">*</span></label>
                                <input type="datetime-local" id="start_date_time" name="start_date_time" value={challengeForm.start_date_time} onFocus={() => handleFocus('start_date_time-input')} onChange={handleChange} required />
                            </div>

                            <div className="form-input-holder">
                                <label htmlFor="end_date_time">End Date & Time:<span className="form-input-required-asterisk">*</span></label>
                                <input type="datetime-local" id="end_date_time" name="end_date_time" value={challengeForm.end_date_time} onFocus={() => handleFocus('end_date_time-input')} onChange={handleChange} required />
                            </div>

                            <button type="button" onClick={goToPreviousPage}>Back</button>
                            <button type="button" onClick={goToNextPage}>Next</button>
                        </>
                    )}

                    {currentPage === 5 && (
                        <>
                            <h3>Review Your Challenge</h3>

                            <div className="form-input-holder">
                                <label htmlFor="name">Name:</label>
                                <p>{challengeForm.name}</p>
                            </div>

                            <div className="form-input-holder">
                                <label htmlFor="description">Description:</label>
                                <p>{challengeForm.description}</p>
                            </div>

                            <div className="form-input-holder">
                                <label htmlFor="genre">Genre:</label>
                                <p>{challengeForm.genre}</p>
                            </div>

                            <div className="form-input-holder">
                                <label htmlFor="skill_level">Skill Level:</label>
                                <p>{challengeForm.skill_level}</p>
                            </div>

                            <div className="form-input-holder">
                                <label htmlFor="limitations">Restrictions:</label>
                                <ul>
                                    {challengeForm.limitations.time_limit && <li>Time Limit</li>}
                                    {challengeForm.limitations.word_limit && <li>Word Limit</li>}
                                    {challengeForm.limitations.character_limit && <li>Character Limit</li>}
                                    {challengeForm.limitations.required_phrase && <li>Required Phrase</li>}
                                </ul>
                            </div>

                            <div className="form-input-holder">
                                <label htmlFor="prompt">Prompt:</label>
                                <p>{challengeForm.prompt}</p>
                            </div>

                            <div className="form-input-holder">
                                <label htmlFor="start_date_time">Start Date & Time:</label>
                                <p>{challengeForm.start_date_time}</p>
                            </div>

                            <div className="form-input-holder">
                                <label htmlFor="end_date_time">End Date & Time:</label>
                                <p>{challengeForm.end_date_time}</p>
                            </div>

                            <p>Everything correct?</p>
                            <button type="submit">Create Challenge</button>

                            <p>Need to make changes?</p>
                            <button type="button" onClick={goToPreviousPage}>Back</button>
                        </>
                    )}
                </form>

                {message && <MessagePopup message={message} setMessage={setMessage} />}
            </main>
        </>
    );
};