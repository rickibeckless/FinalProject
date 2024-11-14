/**
 * Desc: Delete user modal component for the user's settings page.
 *    This component displays a modal that allows the user to delete their account.
 * File: Promptify/client/src/components/user/DeleteUserModal.jsx
*/

// general imports
import { useEffect, useState, useContext } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";

// some pages may also need to import utils, hooks, or context
import AuthContext from "../../context/AuthProvider.jsx";

// message popup for errors, warnings, and successes
import MessagePopup from "../../components/global/MessagePopup.jsx";

// close icon
import CloseImg from "../../assets/close.svg";

export default function DeleteUser({ toggleModal }) {
    const { user, logout } = useContext(AuthContext);
    const [verification, setVerification] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleDelete = async () => {
        if (verification === `DELETE ${user.username}`) {
            const response = await fetch(`/api/users/${user.id}/delete`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    role: user.is_admin ? "admin" : "user",
                },
            });

            if (response.ok) {
                const data = await response.json();
                console.log(data);
                logout();
                setMessage("User deleted successfully");

                setTimeout(() => {
                    navigate("/");
                }, 2000);
            } else {
                console.error("Error deleting user");
            }
        }
    };

    return (
        <>
            <div id="modalOverlay"></div>
            <div id="account-form-modal" className="delete-form-modal modal">
                <div className="modal-content">
                    <button type="button" className="account-form-modal-close-btn" onClick={() => toggleModal('delete', 'close')}>
                        <img src={CloseImg} alt="Close Modal" />
                    </button>
                    <div className="account-form-modal-header">
                        <h2>Delete Account</h2>
                        <p>WARNING: This action cannot be undone!</p>
                    </div>
                    <form id="account-form" className="modal-form" onSubmit={handleDelete}>
                        <div className="form-input-holder">
                            <label htmlFor="verification">Type "DELETE {user.username}" to confirm:</label>
                            <input
                                type="text"
                                id="verification"
                                name="verification"
                                value={verification}
                                onChange={(e) => setVerification(e.target.value)}
                                required
                            />
                        </div>
                        {verification !== `DELETE ${user.username}` ? (
                            <p className="attempts-error">Incorrect verification</p>
                        ) : (
                            <button type="submit" className="btn btn-danger">
                                Delete Account
                            </button>
                        )}
                    </form>
                </div>

                {message && <MessagePopup message={message} setMessage={setMessage} />}
            </div>
        </>
    );
};