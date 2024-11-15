import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquare, faSquareCheck } from '@fortawesome/free-solid-svg-icons';
import AuthContext from "../../../context/AuthProvider.jsx";
import LoadingScreen from "../LoadingScreen.jsx";
import MessagePopup from "../MessagePopup.jsx";
import CloseImg from "../../../assets/close.svg";
import LoginImg from "../../../assets/login.svg";
import GithubImg from "../../../assets/github.svg";

export default function SignUpModal({ toggleModal }) {
    const { login } = useContext(AuthContext);
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

    const handleBlur = () => {
        setFocusedInput(null);
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
                await response.json();
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

    const signupWithGithub = async () => {
        const popup = window.open(
            'https://promptify-ur5z.onrender.com/api/users/auth/github', // changed to deployed URL
            'GitHub Sign Up',
            'width=800,height=600'
        );
    
        const handleMessage = (event) => {    
            const { token } = event.data;
            if (token) {
                toggleModal('sign-up');
                login(token);
    
                popup.close();
                window.removeEventListener('message', handleMessage);
                setMessage("Successfully signed up with GitHub...");
                setTimeout(() => {
                    setMessage("");
                }, 2000);
            }
        };
    
        window.addEventListener('message', handleMessage);
    
        const checkPopup = setInterval(() => {
            if (!popup || popup.closed || popup.closed === undefined) {
                clearInterval(checkPopup);
                setMessage("Sign Up popup was blocked. Please allow popups and try again.");
                window.removeEventListener('message', handleMessage);
            }
        }, 1000);
    }; 

    return (
        <>
            {loading ? <LoadingScreen /> : null}

            <div id="modalOverlay"></div>
            <div id="account-form-modal" className="sign-up-form-modal modal">
                <div className="modal-content">
                    <button type="button" className="account-form-modal-close-btn" onClick={() => toggleModal('sign-up', 'close')}>
                        <img src={CloseImg} alt="Close" />
                    </button>
                    <div className="account-form-modal-header">
                        <h2>Sign Up | Promptify</h2>
                        <p>Sign up to start creating and sharing prompts!</p>
                    </div>
                    <form id="account-form" className="modal-form" onSubmit={handleSubmit}>
                        <div className="form-input-holder">
                            <label htmlFor="username">Username<span className="form-input-required-asterisk">*</span></label>
                            <input type="text" id="username" name="username" placeholder="john_doe" value={userForm.username} onFocus={() => handleFocus('username-input')} onBlur={() => handleBlur()} onChange={handleChange} required />
                            
                            <div className={`form-input-add no-show-element ${focusedInput === 'username-input' ? "show" : ""}`}>
                                <p>Username must be unique, no special characters (sans underscores _), and at least:</p>

                                <ul className="input-requirements-list">
                                    <li className="input-requirement">
                                        {userForm.username.length >= 8 ? <FontAwesomeIcon className="input-requirement-icon after" icon={faSquareCheck} /> : <FontAwesomeIcon className="input-requirement-icon before" icon={faSquare} /> } 8 characters
                                    </li>
                                </ul>
                                
                                {userForm.username.match(/[^A-Za-z0-9_]/) ? (
                                    <>
                                        <p className="input-requirements-error">Username cannot contain these characters:</p>
                                        <ul className="input-requirements-error">
                                            {[...new Set(userForm.username.match(/[^A-Za-z0-9_]/g))].map((char, index) => (
                                                <li key={index} className="input-requirements-error">{char}</li>
                                            ))}
                                        </ul>
                                    </>
                                ) : null}
                            </div>
                        </div>

                        <div className="form-input-holder">
                            <label htmlFor="email">Email<span className="form-input-required-asterisk">*</span></label>
                            <input type="email" id="email" name="email" placeholder="jdoe@email.com" value={userForm.email} onFocus={() => handleFocus('email-input')} onBlur={() => handleBlur()} onChange={handleChange} required />
                            
                            <div className={`form-input-add no-show-element ${focusedInput === 'email-input' ? "show" : ""}`}>
                                <p>We will never share your email with anyone else.</p>
                            </div>
                        </div>

                        <div className="form-input-holder">
                            <label htmlFor="password">Password<span className="form-input-required-asterisk">*</span></label>
                            <input type="password" id="password" name="password" placeholder="aBcd_123" value={userForm.password} onFocus={() => handleFocus('password-input')} onBlur={() => handleBlur()} onChange={handleChange} required />
                            
                            <div className={`form-input-add no-show-element ${focusedInput === 'password-input' ? "show" : ""}`}>
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
                            <input type="password" id="confirmPassword" name="confirmPassword" placeholder="aBcd_123" value={userForm.confirmPassword} onFocus={() => handleFocus('confirm-password-input')} onBlur={() => handleBlur()} onChange={handleChange} required />
                            
                            <div className={`form-input-add no-show-element ${focusedInput === 'confirm-password-input' ? "show" : ""}`}>
                                <p>Re-enter your password to confirm.</p>
                                {userForm.password !== userForm.confirmPassword ? <p className="input-requirements-error">Passwords do not match.</p> : null}
                            </div>
                        </div>

                        <button type="submit" className="account-form-submit-btn sign-up-btn">
                            Sign Up
                            <img src={LoginImg} alt="Sign Up" />
                        </button>
                    </form>
                    <div className="other-account-btns">
                        <button type="button" className="github-account-btn" onClick={signupWithGithub}>
                            <img src={GithubImg} alt="GitHub Logo" />
                            <p>Sign Up with GitHub</p>
                        </button>

                        <p>Already have an account? <button type="button" onClick={() => toggleModal('login', 'sign-up')}>Log in</button></p>
                    </div>
                </div>
            </div>
            {message && <MessagePopup message={message} setMessage={setMessage} />}
        </>
    );
};