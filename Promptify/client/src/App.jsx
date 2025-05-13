import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "./components/global/Header.jsx";
import Footer from "./components/global/Footer.jsx";
import KnownIssue from "./components/global/modals/KnownIssue.jsx";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleExclamation, faCircleUp } from "@fortawesome/free-solid-svg-icons";

import './App.css';

const environment = import.meta.env.VITE_NODE_ENV;
export const environmentUrl = environment === 'production' ? import.meta.env.VITE_PRODUCTION_URL : import.meta.env.VITE_BACKEND_URL;

function App() {
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    const [showIssueModal, setShowIssueModal] = useState(false);

    useEffect(() => {
        setShowIssueModal(true);
        document.body.classList.add("modal-open");
    }, []);

    const toggleModal = (type) => {
        if (type === "showIssues") {
            document.body.classList.toggle("modal-open");
            setShowIssueModal(true);
        } else if (type === "close") {
            document.body.classList.remove("modal-open");
            setShowIssueModal(false);
        }
    };

    return (
        <>
            <Header />

            {showIssueModal && <KnownIssue toggleModal={toggleModal} />}
            
            <Outlet />

            <button id="known-issue-btn" className="global-btn" type="button" title="There Are Known Issues!" onClick={() => toggleModal("showIssues")}>
                <FontAwesomeIcon icon={faCircleExclamation} />
            </button>
            <button id="scroll-top-btn" className="global-btn" type="button" title="Scroll To Top" onClick={scrollToTop}>
                <FontAwesomeIcon icon={faCircleUp} />
            </button>

            <Footer />
        </>
    );
};

export default App;