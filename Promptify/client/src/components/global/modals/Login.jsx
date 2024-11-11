import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../../context/AuthProvider.jsx";
import LoadingScreen from "../LoadingScreen.jsx";
import MessagePopup from "../MessagePopup.jsx";
import CloseImg from "../../../assets/close.svg";
import LoginImg from "../../../assets/login.svg";
import GithubImg from "../../../assets/github.svg";

export default function LoginModal({ toggleModal }) {
    const [loading, setLoading] = useState(true); // set to false when done loading
    const [message, setMessage] = useState(""); // set to message to display in message popup
    const { login } = useContext(AuthContext);

    const [tooManyAttempts, setTooManyAttempts] = useState(false);
    let [attemptsTimer, setAttemptsTimer] = useState(60);

    const [focusedInput, setFocusedInput] = useState(null);
    const [userForm, setUserForm] = useState({
        username_email: '',
        password: ''
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
            const response = await fetch('/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userForm)
            });

            if (response.ok) {
                const data = await response.json();
                
                setTooManyAttempts(false);
                toggleModal('login');
                login(data.token);
            } else {
                const error = await response.json();
                setMessage(error.error);
            };
        } catch (error) {
            if (error.message === "Failed to fetch") {
                setMessage("An unexpected error occurred. Please try again.");
            } else {
                setMessage("Too many login attempts. Please try again after a minute.");
                setTooManyAttempts(true);

                const attemptsInterval = setInterval(() => {
                    attemptsTimer--;

                    setAttemptsTimer(attemptsTimer);

                    if (attemptsTimer === 0) {
                        clearInterval(attemptsInterval);
                        setAttemptsTimer(60);
                        return;
                    };
                }, 1000);

                setTimeout(() => {
                    setTooManyAttempts(false);
                }, 60000);
            };
        };

        setLoading(false);
    };

    const loginWithGithub = async () => {
        const popup = window.open(
            '/api/users/auth/github',
            'GitHub Login',
            'width=800,height=600'
        );
    
        const handleMessage = (event) => {    
            const { token } = event.data;
            if (token) {
                setTooManyAttempts(false);
                toggleModal('login');
                login(token);
    
                popup.close();
                window.removeEventListener('message', handleMessage);
                setMessage("Successfully logged in with GitHub...");
                setTimeout(() => {
                    setMessage("");
                }, 2000);
            }
        };
    
        window.addEventListener('message', handleMessage);
    
        const checkPopup = setInterval(() => {
            if (!popup || popup.closed || popup.closed === undefined) {
                clearInterval(checkPopup);
                setMessage("Login popup was blocked. Please allow popups and try again.");
                window.removeEventListener('message', handleMessage);
            }
        }, 1000);
    };    

    return (
        <>
            {loading ? <LoadingScreen /> : null}

            <div id="modalOverlay"></div>
            <div id="account-form-modal" className="login-form-modal modal">
                <div className="modal-content">
                    <button type="button" className="account-form-modal-close-btn" onClick={() => toggleModal('login', 'close')}>
                        <img src={CloseImg} alt="Close Modal" />
                    </button>
                    <div className="account-form-modal-header">
                        <h2>Login | Promptify</h2>
                        <p>Log in to create and share prompts!</p>
                    </div>
                    <form id="account-form" className="modal-form" onSubmit={handleSubmit}>
                        <div className="form-input-holder">
                            <label htmlFor="username_email">Username or Email<span className="form-input-required-asterisk">*</span></label>
                            <input type="text" id="username_email" name="username_email" placeholder="john_doe" value={userForm.username_email} onFocus={() => handleFocus('username_email-input')} onChange={handleChange} required />
                        </div>

                        <div className="form-input-holder">
                            <label htmlFor="password">Password<span className="form-input-required-asterisk">*</span></label>
                            <input type="password" id="password" name="password" placeholder="aBcd_123" value={userForm.password} onFocus={() => handleFocus('password-input')} onChange={handleChange} required />
                        </div>

                        <button type="submit" className={`account-form-submit-btn login-btn ${tooManyAttempts ? "attempts-error" : ""}`}>
                            Login
                            <img src={LoginImg} alt="Login" />
                        </button>
                        {tooManyAttempts && <p className="attempts-error">Too many login attempts. Please try again after <span className="attempts-error-timer">{attemptsTimer}</span> seconds.</p>}
                    </form>
                    <div className="other-account-btns">
                        <button type="button" className="github-account-btn" onClick={loginWithGithub}>
                            <img src={GithubImg} alt="GitHub Logo" />
                            <p>Login with GitHub</p>
                        </button>

                        <p>Don't have an account? <button type="button" onClick={() => toggleModal('sign-up', 'login')}>Sign Up</button></p>
                    </div>
                </div>

                {message && <MessagePopup message={message} setMessage={setMessage} />}
            </div>
        </>
    );
};