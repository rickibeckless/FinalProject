import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import LoadingScreen from "../LoadingScreen.jsx";
import MessagePopup from "../MessagePopup.jsx";
import CloseImg from "../../../assets/close.svg";
import "../../../styles/global/known-issue.css";

export default function KnownIssue({ toggleModal }) {
    const [loading, setLoading] = useState(true); // set to false when done loading
    const [message, setMessage] = useState(""); // set to message to display in message popup
    
    useEffect(() => { // runs once when the page loads
        setLoading(false); // set to false when done loading
    }, []); // the empty array means this effect will only run once

    return (
        <>
            {loading ? <LoadingScreen /> : null}
            <div id="modalOverlay"></div>

            <div id="known-issue-modal" className="modal">
                <div className="modal-content">
                    <button type="button" className="account-form-modal-close-btn" onClick={() => toggleModal('close')}>
                        <img src={CloseImg} alt="Close Modal" />
                    </button>
                    <div className="account-form-modal-header">
                        <h2>Known Issues!</h2>
                        <h3>Hello and Welcome to Promptify!</h3>
                    </div>

                    <ul id="known-issue-modal-list">
                        <li className="known-issue-modal-list-item">
                            <h4 className="known-issue-modal-list-item-header"></h4>
                            <ul className="known-issue-modal-list-item-information">
                                <li className="known-issue-modal-list-item-information-item">

                                </li>
                                <li className="known-issue-modal-list-item-information-date">
                                    
                                </li>
                            </ul>
                        </li>
                    </ul>

                    <div id="known-issue-modal-footer">
                        <p>
                            For updates on <i>Promptify</i> please 
                            visit: <Link id="footer-cr-link" to="https://github.com/rickibeckless/FinalProject" target="_blank" rel="noopener nofollow noreferrer" title="Promptify GitHub">GitHub</Link>
                        </p>
                        <p>
                            For a demo of <i>Promptify</i> please
                            visit:  <Link id="footer-cr-link" to="https://www.youtube.com/watch?v=DaxxJaa_lGM" target="_blank" rel="noopener nofollow noreferrer" title="Promptify YouTube Demo">YouTube</Link>
                        </p>
                    </div>
                </div>

                {message && <MessagePopup message={message} setMessage={setMessage} />}
            </div>
        </>
    );
};