import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import LoadingScreen from "../../components/global/LoadingScreen.jsx";
import MessagePopup from "../../components/global/MessagePopup.jsx";
import PageTitle from "../../components/global/PageTitle.jsx";

export default function IssueLog() {
    const [loading, setLoading] = useState(true); // set to false when done loading
    const [message, setMessage] = useState(""); // set to message to display in message popup

    const adminKey = import.meta.env.VITE_ADMIN_KEY;
    const [adminView, setAdminView] = useState(false);
    const [adminKeyInput, setAdminKeyInput] = useState("");
    
    const [allIssues, setAllIssues] = useState([]);
    const [currentIssues, setCurrentIssues] = useState([]);
    const [unapprovedIssues, setUnapprovedIssues] = useState([]);
    const [archivedIssues, setArchivedIssues] = useState([]);
    
    async function fetchIssues() {
        try {
            const response = await fetch('/api/issues/list');
            const data = await response.json();

            if (response.ok && data.length > 0) {
                setAllIssues(data);
                setCurrentIssues(data.filter(issue => issue.status === 'approved'));
                setUnapprovedIssues(data.filter(issue => issue.status === 'unapproved'));
                setArchivedIssues(data.filter(issue => issue.status === 'archived'));
            } else if (response.ok && data.length === 0) {
                return;
            } else {
                setMessage(data.error);
            };
        } catch (error) {
            console.error('Error fetching issues:', error);
            setMessage('An unexpected error occurred while fetching issues.');
        } finally {
            setLoading(false); // set to false when done loading
        };
    };

    useEffect(() => {
        fetchIssues();
    }, []); // the empty array means this effect will only run once

    const openAdminKeyCheck = () => {
        if (adminView) {
            setAdminView(false);
            setMessage("Admin view disabled.");
        } else {
            const adminKeyInput = prompt("Enter the admin key to toggle admin view:");
            if (adminKeyInput === adminKey) {
                setAdminView(true);
                setMessage(`Admin view enabled.`);
            } else {
                setAdminView(false);
                setMessage("Invalid admin key.");
            };
        };
    };

    const handleIssueApprove = async (issueId) => {
        const issue = allIssues.find(issue => issue.id === issueId);
        if (issue) {
            const updatedIssue = { ...issue, status: "approved", approved: true };
            try {
                const response = await fetch(`/api/issues/${issueId}/approve`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        role: 'admin'
                    },
                    body: JSON.stringify(updatedIssue)
                });

                if (response.ok) {
                    setMessage("Issue approved successfully.");
                    fetchIssues();
                } else {
                    setMessage("Failed to approve the issue.");
                };
            } catch (error) {
                console.error('Error approving issue:', error);
                setMessage('An unexpected error occurred while approving the issue.');
            };
        };
    };

    const handleIssueArchive = async (issueId) => {
        const archiveReason = prompt("Enter the reason for archiving this issue:");            

        const issue = allIssues.find(issue => issue.id === issueId);
        if (issue) {
            const updatedIssue = { ...issue, status: "archived", archive_reason: archiveReason || 'No reason provided' };
            try {
                const response = await fetch(`/api/issues/${issueId}/archive`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        role: 'admin'
                    },
                    body: JSON.stringify(updatedIssue)
                });

                if (response.ok) {
                    setMessage("Issue archived successfully.");
                    fetchIssues();
                } else {
                    setMessage("Failed to archive the issue.");
                };
            } catch (error) {
                console.error('Error archiving issue:', error);
                setMessage('An unexpected error occurred while archiving the issue.');
            };
        };
    };

    const handleIssueDelete = async (issueId) => {
        const issue = allIssues.find(issue => issue.id === issueId);
        if (issue) {
            try {
                const response = await fetch(`/api/issues/${issueId}/delete`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        role: 'admin'
                    }
                });

                if (response.ok) {
                    setMessage("Issue deleted successfully.");
                    fetchIssues();
                } else {
                    setMessage("Failed to delete the issue.");
                };
            } catch (error) {
                console.error('Error approving issue:', error);
                setMessage('An unexpected error occurred while deleting the issue.');
            };
        };
    };

    const handleIssueDeleteAll = async (type) => {
        const confirmDelete = confirm(`Are you sure you want to delete all ${type} issues? This action cannot be undone.`);
        if (confirmDelete) {
            try {
                const response = await fetch(`/api/issues/${type}/delete`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        role: 'admin'
                    }
                });

                if (response.ok) {
                    setMessage("All issues deleted successfully.");
                    fetchIssues();
                } else {
                    setMessage("Failed to delete all issues.");
                };
            } catch (error) {
                console.error('Error deleting all issues:', error);
                setMessage('An unexpected error occurred while deleting all issues.');
            };
        };
    };

    const handleIssueArchiveAll = async () => {
        const confirmArchive = confirm("Are you sure you want to archive all current issues? This action cannot be undone.");
        if (confirmArchive) {
            try {
                const response = await fetch(`/api/issues/current/archive`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        role: 'admin'
                    }
                });

                if (response.ok) {
                    setMessage("All current issues archived successfully.");
                    fetchIssues();
                } else {
                    setMessage("Failed to archive all current issues.");
                };
            } catch (error) {
                console.error('Error archiving all current issues:', error);
                setMessage('An unexpected error occurred while archiving all current issues.');
            };
        };
    };

    return (
        <div className="footer-page-body container">
            <PageTitle title="Issue Log | Promptify" />

            <header className="footer-header">
                <h1>Issue Log</h1>
                <p>Check past and current Promptify issues.</p>

                <p>Admin? <button type="button" id="toggle-admin-btn" onClick={() => openAdminKeyCheck()}>Toggle Admin View</button></p>
            </header>

            <section className="footer-section" id="current-issues">
                <h2>Current Issues</h2>
                <p>
                    Here are some of the current issues that have been reported 
                    and are being worked on:
                </p>
                
                {currentIssues.length > 0 ? (
                    <>
                        <ul>
                            {currentIssues.map((issue) => (
                                <li key={issue.id} className="footer-issue-list-item">
                                    <h4 className="footer-issue-list-item-header">{issue.title}</h4>
                                    <ul className="footer-issue-list-item-information">
                                        <li className="footer-issue-list-item-information-item">{issue.description}</li>
                                        <li className="footer-issue-list-item-information-date"><b>Submitted:</b> {new Date(issue.date).toLocaleDateString()}—{new Date(issue.date).toLocaleTimeString()}</li>
                                    </ul>
                                    {adminView && (
                                        <div className="footer-issue-list-item-admin">
                                            <button type="button" className="footer-issue-list-item-admin-btn" onClick={() => handleIssueArchive(issue.id)}>Archive</button>
                                            <button type="button" className="footer-issue-list-item-admin-btn" onClick={() => handleIssueDelete(issue.id)}>Delete</button>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>

                        {adminView && (
                            <>
                                <ul id="unapproved-issues-list">
                                    {unapprovedIssues.length > 0 ? (
                                        unapprovedIssues.map((issue) => (
                                            <li key={issue.id} className="footer-issue-list-item">
                                                <h4 className="footer-issue-list-item-header">{issue.title}</h4>
                                                <ul className="footer-issue-list-item-information">
                                                    <li className="footer-issue-list-item-information-item">{issue.description}</li>
                                                    <li className="footer-issue-list-item-information-date"><b>Submitted:</b> {new Date(issue.date).toLocaleDateString()}—{new Date(issue.date).toLocaleTimeString()}</li>
                                                </ul>
                                                <div className="footer-issue-list-item-admin">
                                                    <button type="button" className="footer-issue-list-item-admin-btn" onClick={() => handleIssueApprove(issue.id)}>Approve</button>
                                                    <button type="button" className="footer-issue-list-item-admin-btn" onClick={() => handleIssueDelete(issue.id)}>Delete</button>
                                                </div>
                                            </li>
                                        ))
                                    ) : (
                                        <li key="no-unapproved-issues" className="footer-issue-list-item">No unapproved issues at this time!</li>
                                    )}
                                </ul>

                                {(unapprovedIssues.length + archivedIssues.length) > 1 && (
                                    <div className="footer-issue-list-item-admin">
                                        <button type="button" className="footer-issue-list-item-admin-btn" onClick={() => handleIssueDeleteAll("current")}>Delete All</button>
                                        <button type="button" className="footer-issue-list-item-admin-btn" onClick={() => handleIssueArchiveAll()}>Archive All</button>
                                    </div>
                                )}
                            </>
                        )}
                    </>
                ) : (
                    <p>No current issues at this time!</p>
                )}
            </section>

            <section className="footer-section" id="archived-issues">
                <h2>Archived Issues</h2>
                <p>
                    Here are some of the past issues that have been reported and 
                    have been resolved or dismissed:
                </p>
                
                {archivedIssues.length > 0 ? (
                    <>
                        <ul>
                            {archivedIssues.map((issue) => (
                                <li key={issue.id} className="footer-issue-list-item">
                                    <h4 className="footer-issue-list-item-header">{issue.title}</h4>
                                    <ul className="footer-issue-list-item-information">
                                        <li className="footer-issue-list-item-information-item">{issue.description}</li>
                                        <li className="footer-issue-list-item-information-item"><b>Archive Reason:</b> {issue.archive_reason}</li>
                                        <li className="footer-issue-list-item-information-date"><b>Submitted:</b> {new Date(issue.submitted_date).toLocaleDateString()}—{new Date(issue.submitted_date).toLocaleTimeString()}</li>
                                        <li className="footer-issue-list-item-information-date"><b>Archived:</b> {new Date(issue.date).toLocaleDateString()}—{new Date(issue.date).toLocaleTimeString()}</li>
                                    </ul>

                                    {adminView && (
                                        <div className="footer-issue-list-item-admin">
                                            <button type="button" className="footer-issue-list-item-admin-btn" onClick={() => handleIssueDelete(issue.id)}>Delete</button>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>

                        {(adminView && archivedIssues.length > 1) && (
                            <div className="footer-issue-list-item-admin">
                                <button type="button" className="footer-issue-list-item-admin-btn" onClick={() => handleIssueDeleteAll("archived")}>Delete All</button>
                            </div>
                        )}
                    </>
                ) : (
                    <p>No archived issues at this time!</p>
                )}
            </section>

            <section className="footer-section" id="future-projects">
                <h2>Future Projects</h2>
                <p>
                    Promptify is always evolving! Here are some of the future 
                    projects that are being worked on:
                </p>
                
                <ul>
                    <li>Enhance notification system</li>
                    <li>Integrate AI model to create AI generated prompts</li>
                </ul>
            </section>

            {loading && <LoadingScreen />}
            {message && <MessagePopup message={message} setMessage={setMessage} />}
        </div>
    );
}