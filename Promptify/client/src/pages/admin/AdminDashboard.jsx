/**
 * Desc: Admin dashboard page, displays admin information and allows admin to manage the website.
 * File: Promptify/client/src/pages/admin/AdminDashboard.jsx
*/

// general imports
import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import DOMPurify from 'dompurify';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'

// sets the page title, used by all pages in the format "Page Title | Promptify"
import PageTitle from "../../components/global/PageTitle.jsx"; // note: modals will not use this component

// loading screen for when the page is loading (also used for transitions and testing)
import LoadingScreen from "../../components/global/LoadingScreen.jsx";

// message popup for errors, warnings, and successes
import MessagePopup from "../../components/global/MessagePopup.jsx";

// import any images or assets here

// import any styles here
import "../../styles/admin/dashboard.css"; // styling for the admin dashboard

// some pages may also need to import utils, hooks, or context
import AuthContext from "../../context/AuthProvider.jsx"; // context used for authentication

export default function AdminDashboard() {
    const { user, loading: authLoading } = useContext(AuthContext); // get context used for authentication
    const [loading, setLoading] = useState(true); // set to false when done loading
    const [message, setMessage] = useState(""); // set to message to display in message popup

    const navigate = useNavigate(); // used to navigate to a different page

    const [newUsers, setNewUsers] = useState([]);
    const [showNewUserForm, setShowNewUserForm] = useState(false);

    const [users, setUsers] = useState({});
    const [showNotificationForm, setShowNotificationForm] = useState(false);
    const [openNotificationDropdown, setOpenNotificationDropdown] = useState(false);
    const [notificationForm, setNotificationForm] = useState({
        title: "",
        content: "",
        type: "general",
        to: [],
    });

    useEffect(() => {
        if (!authLoading) {
            if (user && user.is_admin) {
                async function fetchUsers() {
                    const response = await fetch("/api/users", {
                        method: "GET",
                        headers: {
                            role: user.is_admin ? "admin" : "user",
                        },
                    });

                    let data = await response.json();
                    if (response.ok) {
                        data = data.filter(userData => userData.username !== "deleted_user" && userData.username !== "PromptifyBot" && userData.username !== user.username);
                        if (data.length > 0) setUsers(data);
                    } else {
                        console.error(data.error);
                    }
                };

                fetchUsers();
                setLoading(false);
            } else {
                navigate("/404");
            }
        }
    }, [authLoading, user, navigate]);

    const handleResetFullDatabase = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/admin/default/reset/${user.id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    role: user.is_admin ? "admin" : "user",
                },
            });

            const data = await response.json();
            if (data.error) {
                setMessage(data.error);
            } else {
                setMessage(data.message);
            };

            setLoading(false);
        } catch (error) {
            console.error(error);
            setMessage("An error occurred. Please try again.");
            setLoading(false);
        };
    };

    const handleSeedDefaultUsers = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/admin/default/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    role: user.is_admin ? "admin" : "user",
                },
            });

            const data = await response.json();
            if (data.error) {
                setMessage(data.error);
            } else {
                setMessage(data.message);
            };

            setLoading(false);
        } catch (error) {
            console.error(error);
            setMessage("An error occurred. Please try again.");
            setLoading(false);
        };
    };

    const handleSeedDefaultChallenges = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/admin/default/challenges", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    role: user.is_admin ? "admin" : "user",
                },
            });

            const data = await response.json();
            if (data.error) {
                setMessage(data.error);
            } else {
                setMessage(data.message);
            };

            setLoading(false);
        } catch (error) {
            console.error(error);
            setMessage("An error occurred. Please try again.");
            setLoading(false);
        };
    };

    const toggleNotificationForm = () => {
        setShowNotificationForm(!showNotificationForm);
        setShowNewUserForm(false);
    };

    const toggleUserForm = () => {
        setShowNewUserForm(!showNewUserForm);
        setShowNotificationForm(false);

        if (newUsers.length === 0) {
            addNewUserForm();
        }
    };

    const handleRemoveUserForm = (index) => {
        const updatedUsers = newUsers.filter((user, i) => i !== index);
        setNewUsers(updatedUsers);

        if (updatedUsers.length === 0) {
            setShowNewUserForm(false);
        }
    };

    const toggleNotificationDropdown = () => {
        setOpenNotificationDropdown(!openNotificationDropdown);
    };

    const handleNotificationChange = (e) => {
        setNotificationForm({
            ...notificationForm,
            [e.target.name]: e.target.value,
        });
    };

    const handleToChange = (e) => {
        if (e.target.checked) {
            setNotificationForm({
                ...notificationForm,
                to: [...notificationForm.to, e.target.value],
            });
        } else {
            setNotificationForm({
                ...notificationForm,
                to: notificationForm.to.filter(id => id !== e.target.value),
            });
        }
    };

    const handleCancelNotification = () => {
        setNotificationForm({
            title: '',
            content: '',
            to: [],
        });
        if (openNotificationDropdown) toggleNotificationDropdown();
        toggleNotificationForm();
    };

    const handleSendNotification = async (e) => {
        e.preventDefault();

        if (!notificationForm.title || !notificationForm.content || !notificationForm.to.length === 0) {
            setMessage("Please fill out all fields.");
            return;
        }

        try {
            setLoading(true);
            const response = await fetch("/api/notifications/new", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    role: user.is_admin ? "admin" : "user",
                },
                body: JSON.stringify(notificationForm),
            });

            const data = await response.json();
            if (data.error) {
                setMessage(data.error);
            } else {
                setMessage(data.message);
            };

            setLoading(false);
            setNotificationForm({
                title: '',
                content: '',
                to: [],
            });
            toggleNotificationDropdown();
            toggleNotificationForm();
        } catch (error) {
            console.error(error);
            setMessage("An error occurred. Please try again.");
            setLoading(false);
        };
    };

    const addNewUserForm = () => {
        setNewUsers([...newUsers, { username: '', email: '', password: '', about: '', profile_picture_url: '' }]);
    };

    const handleUserChange = (index, e) => {
        const { name, value } = e.target;
        const updatedUsers = newUsers.map((user, i) => (i === index ? { ...user, [name]: value } : user));
        setNewUsers(updatedUsers);
    };

    const handleSubmitAllUsers = async () => {
        try {
            const response = await fetch('/api/admin/default/batch/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    role: user.is_admin ? 'admin' : 'user',
                },
                body: JSON.stringify(newUsers),
            });

            const data = await response.json();
            if (data.error) {
                setMessage(data.error);
            } else {
                setMessage(data.message);
                setNewUsers([]);
                setShowNewUserForm(false);
            }

            toggleUserForm();
        } catch (error) {
            console.error(error);
            setMessage('An error occurred. Please try again.');
        }
    };

    const modules = {
        toolbar: '#toolbar'
    };

    const formats = [
        'bold', 'italic', 'underline', 'strike',
        'align', 'image', 'video', 
        'clean', 'header', 'list', 'indent'
    ];

    return (
        <> {/* React fragment (shorthand), used to return multiple elements. Pages usually start with fragment */}
            <PageTitle title="Admin Dashboard | Promptify" />
            {loading ? <LoadingScreen /> : null}
            {message && <MessagePopup message={message} setMessage={setMessage} />}

            <main id="admin-dashboard-body" className="container">
                <h1>Admin Dashboard</h1>

                <div className="admin-dashboard-action-btns">
                    <button type="button" onClick={handleResetFullDatabase}>Reset Full Database</button>
                    <button type="button" onClick={handleSeedDefaultUsers}>Seed Default Users</button>
                    <button type="button" onClick={handleSeedDefaultChallenges}>Seed Default Challenges</button>

                    <button type="button" onClick={() => toggleNotificationForm()}>New Notification</button>
                    <button type="button" onClick={() => toggleUserForm()}>Add Users</button>
                </div>

                {showNotificationForm && (
                    <>
                        <form id="notification-form" className="admin-dashboard-form">
                            <div className="form-input-holder">
                                <label htmlFor="title">Title:</label>
                                <input type="text" id="title" name="title" value={notificationForm.title} onChange={handleNotificationChange} />
                            </div>

                            <div className="form-input-holder">
                                <label htmlFor="type">Type:</label>
                                <select id="type" name="type" value={notificationForm.type} onChange={handleNotificationChange}>
                                    <option value="general">General (New Feature, Update, Bug Fix)</option>
                                    <option value="challenge_activity">Challenge Activity (Start, End, Deleted, Bookmarked)</option>
                                    <option value="review_update">Review Update (Daily, Weekly)</option>
                                    <option value="submission_interaction">Submission Interaction (Upvote, Comment, Reply)</option>
                                    <option value="account_update">Account Update</option>
                                    <option value="follow_activity">Follow Activity (New Follower, Author Challenges, Author Submissions)</option>
                                </select>
                            </div>

                            <div className="form-input-holder">
                                <label htmlFor="content">Content:</label>

                                <div id="toolbar">
                                    <span className="ql-formats">
                                        <button className="ql-bold"></button>
                                        <button className="ql-italic"></button>
                                        <button className="ql-underline"></button>
                                        <button className="ql-strike"></button>
                                        <button className="ql-indent" value="-1"></button>
                                        <button className="ql-indent" value="+1"></button>
                                        <button className="ql-list" value="ordered"></button>
                                        <button className="ql-list" value="bullet"></button>
                                        <button className="ql-image"></button>
                                        <button className="ql-video"></button>
                                        <button className="ql-link"></button>
                                        <select className="ql-align"></select>
                                        <select className="ql-header"></select>
                                        <button className="ql-clean"></button>
                                    </span>
                                </div>

                                <ReactQuill id="content" name="content" formats={formats} modules={modules} placeholder="Notification Content Here..." theme="snow" value={notificationForm.content} onChange={(content) => setNotificationForm({...notificationForm, content: DOMPurify.sanitize(content)})} />
                            </div>

                            <div className="form-input-holder">
                                <label htmlFor="to">To:</label>

                                {openNotificationDropdown && (
                                    <div id="notification-dropdown">
                                        {users?.length > 0 ? (
                                            <>
                                                <div className="notification-dropdown-holder">
                                                    <input type="checkbox" id="all" name="all" value="all" onChange={(e) => handleToChange(e)} />
                                                    <label htmlFor="all">All Users</label>
                                                </div>

                                                {users?.map(user => (
                                                    <div key={user.id} className="notification-dropdown-holder">
                                                        <input type="checkbox" id={user.id} name={user.id} value={user.id} onChange={(e) => handleToChange(e)} />
                                                        <label htmlFor={user.id}>
                                                            <img className="quick" src={user.profile_picture_url} alt={`${user.username} Profile Picture`} />
                                                            {user.username}
                                                        </label>
                                                    </div>
                                                ))}
                                            </>
                                        ) : <div className="notification-dropdown-holder"><p>No valid users found!</p></div>}
                                    </div>
                                )}

                                <button type="button" className="admin-dashboard-add-btn" onClick={toggleNotificationDropdown}>Select Recipients</button>
                            </div>
                        </form>

                        <div id="notification-form-btn-holder">
                            <button id="notification-form-cancel-btn" type="button" onClick={handleCancelNotification}>Cancel</button>
                            <button id="notification-form-submit-btn" type="submit" onClick={(e) => handleSendNotification(e)}>Send Notification</button>
                        </div>
                    </>
                )}

                {showNewUserForm && (
                    <>
                        {newUsers.map((newUser, index) => (
                            <form id="new-user-form" className="admin-dashboard-form" key={index}>
                                <div className="form-input-holder">
                                    <label htmlFor={`username-${index}`}>Username:</label>
                                    <input
                                        type="text"
                                        id={`username-${index}`}
                                        name="username"
                                        value={newUser.username}
                                        onChange={(e) => handleUserChange(index, e)}
                                    />
                                </div>

                                <div className="form-input-holder">
                                    <label htmlFor={`email-${index}`}>Email:</label>
                                    <input
                                        type="email"
                                        id={`email-${index}`}
                                        name="email"
                                        value={newUser.email}
                                        onChange={(e) => handleUserChange(index, e)}
                                    />
                                </div>

                                <div className="form-input-holder">
                                    <label htmlFor={`password-${index}`}>Password:</label>
                                    <input
                                        type="password"
                                        id={`password-${index}`}
                                        name="password"
                                        value={newUser.password}
                                        onChange={(e) => handleUserChange(index, e)}
                                    />
                                </div>

                                <div className="form-input-holder">
                                    <label htmlFor={`about-${index}`}>About:</label>
                                    <textarea
                                        id={`about-${index}`}
                                        name="about"
                                        value={newUser.about}
                                        onChange={(e) => handleUserChange(index, e)}
                                    />
                                </div>

                                <div className="form-input-holder">
                                    <label htmlFor={`profile_picture_url-${index}`}>Profile Picture URL:</label>
                                    <input
                                        type="text"
                                        id={`profile_picture_url-${index}`}
                                        name="profile_picture_url"
                                        value={newUser.profile_picture_url}
                                        onChange={(e) => handleUserChange(index, e)}
                                    />
                                </div>

                                <button type="button" onClick={() => handleRemoveUserForm(index)}>Remove User</button>
                            </form>
                        ))}

                        <div id="new-user-form-btns">
                            <button type="button" className="admin-dashboard-add-btn" onClick={addNewUserForm}>Add New User</button>
                            <button type="button" onClick={handleSubmitAllUsers}>Submit All Users</button>
                        </div>
                    </>
                )}
            </main>
        </>
    );
};