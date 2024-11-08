import { Outlet } from "react-router-dom";
import Header from "./components/global/Header.jsx";
import Footer from "./components/global/Footer.jsx";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleUp } from "@fortawesome/free-solid-svg-icons";

import './App.css';

function App() {
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }

    return (
        <>
            <Header />
            <Outlet />
            <button id="scroll-top-btn" type="button" onClick={scrollToTop}>
                <FontAwesomeIcon icon={faCircleUp} />
            </button>
            <Footer />
        </>
    );
};

export default App;