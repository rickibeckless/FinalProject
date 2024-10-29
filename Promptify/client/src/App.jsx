import { Outlet } from "react-router-dom";
import Header from "./components/global/Header.jsx";
import Footer from "./components/global/Footer.jsx";

import './App.css';

function App() {

    return (
        <>
            <Header />
            <Outlet />
            <Footer />
        </>
    );
};

export default App;