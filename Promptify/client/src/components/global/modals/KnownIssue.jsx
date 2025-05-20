import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import LoadingScreen from "../LoadingScreen.jsx";
import MessagePopup from "../MessagePopup.jsx";
import CloseImg from "../../../assets/close.svg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";
import "../../../styles/global/known-issue.css";

export default function KnownIssue({ toggleModal }) {
    const [loading, setLoading] = useState(true); // set to false when done loading
    const [message, setMessage] = useState(""); // set to message to display in message popup
    const [currentIssues, setCurrentIssues] = useState([]);
    
    useEffect(() => { // runs once when the page loads
        async function fetchIssues() {
            try {
                const response = await fetch('/api/issues/current');
                const data = await response.json();

                if (response.ok) {
                    setCurrentIssues(data.filter(issue => issue.status === 'approved'));
                } else {
                    setMessage(data.error);
                }
            } catch (error) {
                console.error('Error fetching issues:', error);
                setMessage('An unexpected error occurred while fetching issues.');
            } finally {
                setLoading(false); // set to false when done loading
            }
        };

        fetchIssues();
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
                        <h2>Have an issue?</h2>
                        <h3>Check current issues or report a new one!</h3>
                    </div>

                    <ul id="known-issue-modal-list">
                        {currentIssues.length > 0 ? (
                            currentIssues.map((issue) => (
                                <li key={issue.id} className="known-issue-modal-list-item">
                                    <h4 className="known-issue-modal-list-item-header">{issue.title}</h4>
                                    <ul className="known-issue-modal-list-item-information">
                                        <li className="known-issue-modal-list-item-information-item">{issue.description}</li>
                                        <li className="known-issue-modal-list-item-information-date">{new Date(issue.date).toLocaleDateString()}</li>
                                    </ul>
                                </li>
                            ))
                        ) : (
                            <li key="no-known-issues-1" className="known-issue-modal-list-item">
                                <h4 className="known-issue-modal-list-item-header">All good! No known issues at this time!</h4>
                                <ul className="known-issue-modal-list-item-information">
                                    <li className="known-issue-modal-list-item-information-date">{new Date().toLocaleDateString()}</li>
                                </ul>
                            </li>
                        )}
                    </ul>

                    <div id="known-issue-modal-footer">
                        <p>
                            Do you have an issue?
                            <button type="button" id="known-issue-modal-btn" onClick={() => toggleModal("reportIssue")}>Report it!</button>
                        </p>
                        <p>
                            For the full log of issues please
                            visit: <Link onClick={() => toggleModal("close")} id="footer-cr-link" to="/issue-log" title="Promptify Issue Log">Issue Log</Link>
                        </p>
                        <p>
                            For updates on <i>Promptify</i> please 
                            visit: <Link id="footer-cr-link" to="https://github.com/rickibeckless/FinalProject" target="_blank" rel="noopener nofollow noreferrer" title="Promptify GitHub">GitHub<sup><FontAwesomeIcon icon={faArrowUpRightFromSquare} /></sup></Link>
                        </p>
                        <p>
                            For a demo of <i>Promptify</i> please
                            visit:  <Link id="footer-cr-link" to="https://www.youtube.com/watch?v=DaxxJaa_lGM" target="_blank" rel="noopener nofollow noreferrer" title="Promptify YouTube Demo">YouTube<sup><FontAwesomeIcon icon={faArrowUpRightFromSquare} /></sup></Link>
                        </p>
                    </div>
                </div>

                {message && <MessagePopup message={message} setMessage={setMessage} />}
            </div>
        </>
    );
};