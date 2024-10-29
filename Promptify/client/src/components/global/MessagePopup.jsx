export default function MessagePopup({ message, setMessage }) {
    return (
        <div className="message-popup">
            <h3 className="message-popup-content">{message}</h3>
            <button className="message-popup-close" onClick={() => setMessage("")}>Close</button>
        </div>
    )
};