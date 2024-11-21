import { Outlet } from "react-router-dom";
import Header from "./components/global/Header.jsx";
import Footer from "./components/global/Footer.jsx";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleUp } from "@fortawesome/free-solid-svg-icons";

import './App.css';

const environment = import.meta.env.NODE_ENV;
export const environmentUrl = environment === 'production' ? import.meta.env.PRODUCTION_URL : import.meta.env.BACKEND_URL;

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
            <button id="scroll-top-btn" type="button" title="Scroll To Top" onClick={scrollToTop}>
                <FontAwesomeIcon icon={faCircleUp} />
            </button>
            <Footer />
        </>
    );
};

export default App;