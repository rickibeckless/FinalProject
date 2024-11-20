import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../../context/AuthProvider.jsx";
import LoadingScreen from "../../global/LoadingScreen.jsx";
import MessagePopup from "../../global/MessagePopup.jsx";
import CloseImg from "../../../assets/close.svg";

export default function EditChallenge({ toggleEditChallenge, challenge, user, author }) {
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

    const [selectedLimitations, setSelectedLimitations] = useState([]);
    const [focusedInput, setFocusedInput] = useState('');
    const [message, setMessage] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (challenge) {
            setChallengeForm(challenge);
            const selectedKeys = Object.keys(challenge.limitations).filter(
                (key) => challenge.limitations[key] && challenge.limitations[key].min !== null
            );
            setSelectedLimitations(selectedKeys);
        }
    }, [challenge]);

    const handleFocus = (fieldName) => {
        setFocusedInput(fieldName);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setChallengeForm((prev) => ({ ...prev, [name]: value }));
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
                [name]: checked ? prevForm.limitations[name] : { min: '', max: '' },
            },
        }));
    };

    const handleRangeChange = (e, limitationType, rangeType) => {
        const { value } = e.target;
        setChallengeForm((prev) => ({
            ...prev,
            limitations: {
                ...prev.limitations,
                [limitationType]: {
                    ...prev.limitations[limitationType],
                    [rangeType]: value,
                },
            },
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        setMessage('Challenge successfully updated!');
    };

    const handleDelete = () => {
        async function deleteChallenge() {
            try {
                const response = await fetch(`/api/challenges/${challenge.id}/delete`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        role: user.is_admin ? 'admin' : user.id === author.id ? 'author' : 'user'
                    }
                });
                if (!response.ok) {
                    throw new Error('Failed to delete challenge');
                }
                setMessage('Challenge successfully deleted!');
                toggleEditChallenge('delete', 'close');
                navigate('/challenges');
            } catch (err) {
                setMessage(err.message);
            }
        }

        deleteChallenge();
    };

    return (
        <>
            <div id="modalOverlay"></div>
            <div id="edit-challenge-form-modal" className="modal">
                <div className="modal-content">
                    <form id="account-form" onSubmit={handleSubmit}>
                        <h2 className="account-form-modal-header">Edit Challenge</h2>
                        {challenge.status === "upcoming" ? (
                            <>
                                <div className="form-input-holder">
                                    <label htmlFor="name">Name:</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={challengeForm.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
        
                                <div className="form-input-holder">
                                    <label htmlFor="description">Description:</label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        value={challengeForm.description}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
        
                                <div className="form-input-holder">
                                    <label htmlFor="skill_level">Skill Level:</label>
                                    <select
                                        id="skill_level"
                                        name="skill_level"
                                        value={challengeForm.skill_level}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select a skill level</option>
                                        <option value="beginner">Beginner</option>
                                        <option value="intermediate">Intermediate</option>
                                        <option value="advanced">Advanced</option>
                                    </select>
                                </div>
        
                                <div className="form-input-holder">
                                    <label htmlFor="genre">Genre:</label>
                                    <select
                                        id="genre"
                                        name="genre"
                                        value={challengeForm.genre}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select a genre</option>
                                        <option value="fantasy">Fantasy</option>
                                        <option value="non-fiction">Non-Fiction</option>
                                        <option value="thriller">Thriller</option>
                                        <option value="poetry">Poetry</option>
                                        <option value="general">General</option>
                                    </select>
                                </div>
        
                                <div className="form-input-holder">
                                    <label>Limitations:</label>
                                    <div className="limitations">
                                        {['time_limit', 'word_limit', 'character_limit'].map((limitation) => (
                                            <div key={limitation} className="limitation">
                                                <input
                                                    type="checkbox"
                                                    id={limitation}
                                                    name={limitation}
                                                    checked={selectedLimitations.includes(limitation)}
                                                    onChange={handleLimitations}
                                                />
                                                <label htmlFor={limitation}>
                                                    {limitation.replace('_', ' ').toUpperCase()}
                                                </label>
                                                {selectedLimitations.includes(limitation) && (
                                                    <div>
                                                        <input
                                                            type="number"
                                                            name={`${limitation}_min`}
                                                            placeholder="Min"
                                                            value={challengeForm.limitations[limitation]?.min || ''}
                                                            onChange={(e) => handleRangeChange(e, limitation, 'min')}
                                                        />
                                                        <input
                                                            type="number"
                                                            name={`${limitation}_max`}
                                                            placeholder="Max"
                                                            value={challengeForm.limitations[limitation]?.max || ''}
                                                            onChange={(e) => handleRangeChange(e, limitation, 'max')}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
        
                                <div className="form-input-holder">
                                    <label htmlFor="prompt">Prompt:</label>
                                    <textarea
                                        id="prompt"
                                        name="prompt"
                                        value={challengeForm.prompt}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
        
                                <button type="submit">Update Challenge</button>
                            </>
                        ) : (
                            <p>Challenges can't be edited after they've begun, but admins can delete it!</p>
                        )}

                        <button type="button" className="danger-red-btn challenge-card-button" onClick={() => handleDelete()}>Delete Challenge</button>
                        <button type="button" className="challenge-card-button" onClick={() => toggleEditChallenge('edit', 'close')}>Cancel</button>
                    </form>
                </div>
            </div>
            {message && <MessagePopup message={message} setMessage={setMessage} />}
        </>
    );
};