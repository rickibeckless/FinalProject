import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquare, faSquareCheck } from '@fortawesome/free-solid-svg-icons';
import LoadingScreen from "../LoadingScreen.jsx";
import MessagePopup from "../MessagePopup.jsx";

export default function SignUpModal({ toggleModal }) {
    const [loading, setLoading] = useState(true); // set to false when done loading
    const [message, setMessage] = useState(""); // set to message to display in message popup
    const [focusedInput, setFocusedInput] = useState(null);
    const [userForm, setUserForm] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const navigate = useNavigate(); // used to navigate to a different page

    useEffect(() => { // runs once when the page loads
        setLoading(false); // set to false when done loading
    }, []); // the empty array means this effect will only run once

    const handleChange = (e) => {
        setUserForm({
            ...userForm,
            [e.target.name]: e.target.value
        });
    };

    const handleFocus = (input_field) => {
        setFocusedInput(input_field);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (userForm.password !== userForm.confirmPassword) {
                setMessage("Passwords do not match.");
                setLoading(false);
                return;
            };

            const response = await fetch('/api/users/sign-up', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userForm)
            });

            if (response.ok) {
                const data = await response.json();
                console.log(data);

                setMessage("User created successfully!");

                setTimeout(() => {
                    setMessage(null);
                    //toggleModal('sign-up');
                    toggleModal('login', 'sign-up')
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

            <div id="modalOverlay"></div>
            <div id="sign-up-modal" className="modal">
                <button type="button" onClick={() => toggleModal('sign-up', 'close')}>X</button>
                <div className="modal-content">
                    <h2>Sign Up</h2>
                    <form id="sign-up-form" className="modal-form" onSubmit={handleSubmit}>
                        <div className="form-input-holder">
                            <label htmlFor="username">Username<span className="form-input-required-asterisk">*</span></label>
                            <input type="text" id="username" name="username" placeholder="john_doe" value={userForm.username} onFocus={() => handleFocus('username-input')} onChange={handleChange} required />
                            
                            <div className={`form-input-add ${focusedInput !== 'username-input' ? " no-show-element" : ""}`}>
                                <p>Username must be unique, no special characters (sans underscores _), and at least:</p>

                                <ul className="input-requirements-list">
                                    <li className="input-requirement">
                                        {userForm.username.length >= 8 ? <FontAwesomeIcon className="input-requirement-icon after" icon={faSquareCheck} /> : <FontAwesomeIcon className="input-requirement-icon before" icon={faSquare} /> } 8 characters
                                    </li>
                                </ul>
                                
                                {userForm.username.match(/[^A-Za-z0-9_]/) ? 
                                    <ul className="input-requirements-error">Not allowed:
                                        {userForm.username.match(/[^A-Za-z0-9_]/g)?.map((char, index) => {
                                            return <li key={index} className="input-requirements-error">{char}</li>
                                        })}
                                    </ul>
                                    : null
                                }
                            </div>
                        </div>

                        <div className="form-input-holder">
                            <label htmlFor="email">Email<span className="form-input-required-asterisk">*</span></label>
                            <input type="email" id="email" name="email" placeholder="jdoe@email.com" value={userForm.email} onFocus={() => handleFocus('email-input')} onChange={handleChange} required />
                            
                            <div className={`form-input-add ${focusedInput !== 'email-input' ? " no-show-element" : ""}`}>
                                <p>We will never share your email with anyone else.</p>
                            </div>
                        </div>

                        <div className="form-input-holder">
                            <label htmlFor="password">Password<span className="form-input-required-asterisk">*</span></label>
                            <input type="password" id="password" name="password" placeholder="aBcd_123" value={userForm.password} onFocus={() => handleFocus('password-input')} onChange={handleChange} required />
                            
                            <div className={`form-input-add ${focusedInput !== 'password-input' ? " no-show-element" : ""}`}>
                                <p>Password must contain at least:</p>
                                <ul className="input-requirements-list">
                                    <li className="input-requirement">
                                        {userForm.password.length >= 8 ? <FontAwesomeIcon className="input-requirement-icon after" icon={faSquareCheck} /> : <FontAwesomeIcon className="input-requirement-icon before" icon={faSquare} /> } 8 characters
                                    </li>

                                    <li className="input-requirement">
                                        {userForm.password.match(/[A-Z]/) ? <FontAwesomeIcon className="input-requirement-icon after" icon={faSquareCheck} /> : <FontAwesomeIcon className="input-requirement-icon before" icon={faSquare} /> } one uppercase letter
                                    </li>

                                    <li className="input-requirement">
                                        {userForm.password.match(/[a-z]/) ? <FontAwesomeIcon className="input-requirement-icon after" icon={faSquareCheck} /> : <FontAwesomeIcon className="input-requirement-icon before" icon={faSquare} /> } one lowercase letter
                                    </li>

                                    <li className="input-requirement">
                                        {userForm.password.match(/[0-9]/) ? <FontAwesomeIcon className="input-requirement-icon after" icon={faSquareCheck} /> : <FontAwesomeIcon className="input-requirement-icon before" icon={faSquare} /> } one number
                                    </li>

                                    <li className="input-requirement">
                                        {userForm.password.match(/[^A-Za-z0-9]/) ? <FontAwesomeIcon className="input-requirement-icon after" icon={faSquareCheck} /> : <FontAwesomeIcon className="input-requirement-icon before" icon={faSquare} /> } one special character
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="form-input-holder">
                            <label htmlFor="confirmPassword">Confirm Password<span className="form-input-required-asterisk">*</span></label>
                            <input type="password" id="confirmPassword" name="confirmPassword" placeholder="aBcd_123" value={userForm.confirmPassword} onFocus={() => handleFocus('confirm-password-input')} onChange={handleChange} required />
                            
                            <div className={`form-input-add ${focusedInput !== 'confirm-password-input' ? " no-show-element" : ""}`}>
                                <p>Re-enter your password to confirm.</p>
                                {userForm.password !== userForm.confirmPassword ? <p className="input-requirements-error">Passwords do not match.</p> : null}
                            </div>
                        </div>

                        <button type="submit">Sign Up</button>
                    </form>
                    <p>Already have an account? <button type="button" onClick={() => toggleModal('login', 'sign-up')}>Log in</button></p>
                </div>

                {message && <MessagePopup message={message} setMessage={setMessage} />}
            </div>
        </>
    );
};