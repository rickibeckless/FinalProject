import { useContext } from "react";
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
                            <a href="/admin">Admin</a>
                            <div className="custom-bottom-border"></div>
                        </li>
                    ) : null}
                    <li>
                        <a href="/about">About</a>
                        <div className="custom-bottom-border"></div>
                    </li>
                    <li>
                        <a href="/terms-of-service">Terms of Service</a>
                        <div className="custom-bottom-border"></div>
                    </li>
                    <li>
                        <a href="/help">Help</a>
                        <div className="custom-bottom-border"></div>
                    </li>
                </ul>
            </nav>
            <p id="footer-cr-statement">
                <img src={PromptifyLogo2} alt="Promptify logo" />
                Copyright &copy; 2024 &nbsp;<a id="footer-cr-link" href="https://github.com/rickibeckless" target="_blank" rel="noopener nofollow noreferrer" title="Ricki Beckless GitHub">Ricki Beckless</a>. All rights reserved.
            </p>
        </footer>
    )
}