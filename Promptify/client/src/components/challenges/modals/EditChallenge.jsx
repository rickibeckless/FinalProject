import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../../context/AuthProvider.jsx";
import LoadingScreen from "../../global/LoadingScreen.jsx";
import MessagePopup from "../../global/MessagePopup.jsx";
import CloseImg from "../../../assets/close.svg";

export default function LoginModal({ toggleEditChallenge, challenge }) {
    const environment = import.meta.env.VITE_NODE_ENV; // 'development' or 'production'
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(""); // set to message to display in message popup
    const { user } = useContext(AuthContext);
  

    return (
        <>
            {loading ? <LoadingScreen /> : null}

            <div id="modalOverlay"></div>
            <div id="edit-challenge-form-modal" className="modal">
                <div className="modal-content">
                    <button type="button" className="account-form-modal-close-btn" onClick={() => toggleEditChallenge('edit', 'close')}>
                        <img src={CloseImg} alt="Close Modal" />
                    </button>

                    <h2>Edit '{challenge.name}'</h2>

                </div>

                {message && <MessagePopup message={message} setMessage={setMessage} />}
            </div>
        </>
    );
};