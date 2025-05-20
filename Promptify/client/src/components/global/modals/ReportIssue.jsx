import { useEffect, useState } from "react";
import LoadingScreen from "../LoadingScreen.jsx";
import MessagePopup from "../MessagePopup.jsx";
import CloseImg from "../../../assets/close.svg";
import "../../../styles/global/known-issue.css";

export default function ReportIssue({ toggleModal }) {
    const adminKey = import.meta.env.VITE_ADMIN_KEY;
    const [loading, setLoading] = useState(true); // set to false when done loading
    const [message, setMessage] = useState(""); // set to message to display in message popup
    const [issueForm, setIssueForm] = useState({
        title: "",
        description: "",
        admin_key: "",
        status: "unapproved",
        approved: false,
    });

    useEffect(() => { // runs once when the page loads
        setLoading(false); // set to false when done loading
    }, []); // the empty array means this effect will only run once

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setIssueForm((prevForm) => ({
            ...prevForm,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!issueForm.title || !issueForm.description) {
            setMessage("Please fill in all fields.");
            setLoading(false);
            return;
        };

        const confirmedStatus = issueForm.admin_key && issueForm.admin_key === adminKey ? "approved" : "unapproved";
        const confirmedApproved = issueForm.admin_key && issueForm.admin_key === adminKey ? true : false;

        const newIssueForm = {
            title: issueForm.title,
            description: issueForm.description,
            status: confirmedStatus,
            approved: confirmedApproved,
        };

        try {
            const response = await fetch('/api/issues/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    role: (issueForm.admin_key === adminKey) ? 'admin' : 'guest'
                },
                body: JSON.stringify(newIssueForm)
            });

            const data = await response.json();

            if (response.ok) {
                setMessage("Issue submitted successfully!");
                setIssueForm({ title: "", description: "", admin_key: "", status: "unapproved", approved: false });
                setTimeout(() => {
                    toggleModal('close');
                }, 2000);
            } else if (data.error) {
                setMessage(data.error);
            } else {
                setMessage(data.error);
            }
        } catch (error) {
            console.error('Error submitting issue:', error);
            setMessage('An unexpected error occurred while submitting the issue.');
        } finally {
            setLoading(false);
        };
    };

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
                    </div>

                    <form id="account-form" className="modal-form" onSubmit={handleSubmit}>
                        <div className="form-input-holder">
                            <label htmlFor="title">Title<span className="form-input-required-asterisk">*</span></label>
                            <input type="text" id="title" name="title" placeholder="Issue Title" value={issueForm.title} onChange={handleInputChange} required />
                        </div>

                        <div className="form-input-holder">
                            <label htmlFor="description">Description<span className="form-input-required-asterisk">*</span></label>
                            <textarea id="description" name="description" placeholder="Describe the issue..." value={issueForm.description} onChange={handleInputChange} required />
                        </div>

                        <div className="form-input-holder">
                            <label htmlFor="admin_key">Admin Key (optional)</label>
                            <input type="password" id="admin_key" name="admin_key" placeholder="Admin Key" value={issueForm.admin_key} onChange={handleInputChange} />
                        </div>

                        <button type="submit" className="account-form-submit-btn sign-up-btn">Submit Issue</button>
                    </form>
                </div>

                {message && <MessagePopup message={message} setMessage={setMessage} />}
            </div>
        </>
    );
};