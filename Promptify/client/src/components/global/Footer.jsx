import { useContext } from "react";
import { Link } from "react-router-dom";
import AuthContext from "../../context/AuthProvider.jsx";

import PromptifyLogo2 from "../../assets/android-chrome-192x192.png";

export default function Footer() {
    const { user } = useContext(AuthContext);

    return (
        <footer id="main-footer">
            <nav id="footer-navbar">
                <ul>
                    {user && user.is_admin === true ? (
                        <li>
                            <Link to="/admin">Admin</Link>
                            <div className="custom-bottom-border"></div>
                        </li>
                    ) : null}
                    <li>
                        <Link to="/about">About</Link>
                        <div className="custom-bottom-border"></div>
                    </li>
                    <li>
                        <Link to="/terms-of-service">Terms of Service</Link>
                        <div className="custom-bottom-border"></div>
                    </li>
                    <li>
                        <Link to="/help">Help</Link>
                        <div className="custom-bottom-border"></div>
                    </li>
                </ul>
            </nav>
            <p id="footer-cr-statement">
                <img src={PromptifyLogo2} alt="Promptify logo" />
                Copyright &copy; 2024 &nbsp;<Link id="footer-cr-link" to="https://github.com/rickibeckless" target="_blank" rel="noopener nofollow noreferrer" title="Ricki Beckless GitHub">Ricki Beckless.</Link> &nbsp;All rights reserved.
            </p>
        </footer>
    )
}