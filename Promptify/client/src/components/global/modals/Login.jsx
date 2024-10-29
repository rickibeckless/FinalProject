import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../../context/AuthProvider.jsx";
import LoadingScreen from "../LoadingScreen.jsx";
import MessagePopup from "../MessagePopup.jsx";

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

    return (
        <>
            {loading ? <LoadingScreen /> : null}

            <div id="modalOverlay"></div>
            <div id="sign-up-modal" className="modal">
                <button type="button" onClick={() => toggleModal('login', 'close')}>X</button>
                <div className="modal-content">
                    <h2>Login</h2>
                    <form id="sign-up-form" className="modal-form" onSubmit={handleSubmit}>
                        <div className="form-input-holder">
                            <label htmlFor="username_email">Username or Email<span className="form-input-required-asterisk">*</span></label>
                            <input type="text" id="username_email" name="username_email" placeholder="john_doe" value={userForm.username_email} onFocus={() => handleFocus('username_email-input')} onChange={handleChange} required />
                        </div>

                        <div className="form-input-holder">
                            <label htmlFor="password">Password<span className="form-input-required-asterisk">*</span></label>
                            <input type="password" id="password" name="password" placeholder="aBcd_123" value={userForm.password} onFocus={() => handleFocus('password-input')} onChange={handleChange} required />
                        </div>

                        <button type="submit" className={`login-btn ${tooManyAttempts ? "attempts-error" : ""}`}>Login</button>
                        {tooManyAttempts && <p className="attempts-error">Too many login attempts. Please try again after <span className="attempts-error-timer">{attemptsTimer}</span> seconds.</p>}
                    </form>
                    <p>Don't have an account? <button type="button" onClick={() => toggleModal('sign-up', 'login')}>Sign Up</button></p>
                </div>

                {message && <MessagePopup message={message} setMessage={setMessage} />}
            </div>
        </>
    );
};