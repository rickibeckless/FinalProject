import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../context/AuthProvider.jsx";
import LoadingScreen from "../../components/global/LoadingScreen.jsx";
import MessagePopup from "../../components/global/MessagePopup.jsx";
import PageTitle from "../../components/global/PageTitle.jsx";
import ChallengeCard from "../../components/challenges/ChallengeCard.jsx";
import "../../styles/challenges/all-challenges.css";

export default function AllChallenges() {
    const [loading, setLoading] = useState(true); // set to false when done loading
    const [message, setMessage] = useState(""); // set to message to display in message popup
    const { user } = useContext(AuthContext);

    const [challenges, setChallenges] = useState(null);
    const [sortBy, setSortBy] = useState("date");
    const [showFiltersModal, setShowFiltersModal] = useState(window.innerWidth >= 900);
    const [showFiltersModalButton, setShowFiltersModalButton] = useState(window.innerWidth <= 900);
    const [search, setSearch] = useState("");
    const [filters, setFilters] = useState({
        sortBy: "date",
        sortOrder: "asc",
        limitations: {
            timeLimit: true,
            wordLimit: true,
            characterLimit: true,
            requiredPhrase: true
        },
        status: {
            upcoming: true,
            inProgress: true,
            scoring: true
        },
        genre: {
            poetry: true,
            nonFiction: true,
            fantasy: true,
            thriller: true,
            general: true
        },
        points: {
            "50-70": true,
            "70-90": true,
            "100+": true
        },
        skillLevel: {
            beginner: true,
            intermediate: true,
            advanced: true
        },
        participationCount: {
            "0-10": true,
            "10-50": true,
            "50-100": true,
            "100+": true
        }
    });

    const navigate = useNavigate(); // used to navigate to a different page

    const handleFilterModal = () => {
        setShowFiltersModal(prev => !prev);
    };

    const handleSearch = (e) => {
        setSearch(e.target.value);
    };

    const handleFilterChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (type === "checkbox") {
            setFilters(prev => ({
                ...prev,
                [name]: {
                    ...prev[name],
                    [value]: checked
                }
            }));
        } else {
            setFilters(prev => ({
                ...prev,
                [name]: value
            }));
        };
    };

    useEffect(() => {
        const handleResize = () => {
            setShowFiltersModal(window.innerWidth >= 900);
            setShowFiltersModalButton(window.innerWidth <= 900);
        };

        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        async function fetchChallenges() {
            const response = await fetch(`/api/challenges`);
            const data = await response.json();

            if (response.ok) {
                const sortedChallenges = data.sort((a, b) => {
                    if (sortBy === "date") {
                        return new Date(a.end_date_time) - new Date(b.end_date_time);
                    } else if (sortBy === "submissions") {
                        return a.submissions_count - b.submissions_count;
                    }
                    return 0;
                });

                setChallenges(sortedChallenges);
                //setChallenges(data);
                setLoading(false);
            } else {
                setMessage(data.message);
            };
        };

        fetchChallenges();
    }, []);

    return (
        <>
            {loading ? <LoadingScreen /> : null}
            <PageTitle title="Challenges | Promptify" />

            <main id="all-challenges-body" className="container left-aside-right-section">
                <aside className="left-aside" id="all-challenges-left">
                    {showFiltersModalButton && <button id="filter-challenges-button" onClick={handleFilterModal}>Filter Challenges</button>}

                    {showFiltersModal &&
                        <>
                            <form id="search-challenges-form" className="challenges-form">
                                <div className="filter-challenges-form-input-holder">
                                    <label htmlFor="search-challenges">Search:</label>
                                    <input type="text" id="search-challenges" name="search-challenges" placeholder="Search challenges" value={search} onChange={handleSearch} />
                                </div>
                            </form>

                            <form id="filter-challenges-form" className="challenges-form">
                                <div className="filter-challenges-form-input-holder">
                                    <label htmlFor="sort-by">Sort By:</label>
                                    <select id="sort-by" name="sort-by" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                        <option value="submissions">Submissions</option>
                                        <option value="date">Date</option>
                                    </select>
                                </div>

                                <div className="filter-challenges-form-input-holder">
                                    <label htmlFor="sort-order">Sort Order:</label>
                                    <select id="sort-order" name="sort-order">
                                        <option value="asc">Ascending</option>
                                        <option value="desc">Descending</option>
                                    </select>
                                </div>

                                <div className="filter-challenges-form-input-holder">
                                    <label htmlFor="filter-challenges">Filter:</label>

                                    <fieldset className="filter-challenges">
                                        <legend>Limitations</legend>
                                        <div className="limits-holder">
                                            <label><input type="checkbox" name="time-limit" /> Time Limit</label>
                                            <label><input type="checkbox" name="word-limit" /> Word Limit</label>
                                            <label><input type="checkbox" name="character-limit" /> Character Limit</label>
                                            <label><input type="checkbox" name="required-phrase" /> Required Phrase</label>
                                        </div>
                                    </fieldset>

                                    <fieldset className="filter-challenges">
                                        <legend>Status</legend>
                                        <div className="limits-holder">
                                            <label><input type="checkbox" name="upcoming" /> Upcoming</label>
                                            <label><input type="checkbox" name="in-progress" /> In Progress</label>
                                            <label><input type="checkbox" name="scoring" /> Scoring</label>
                                        </div>
                                    </fieldset>

                                    <fieldset className="filter-challenges">
                                        <legend>Genre</legend>
                                        <div className="limits-holder">
                                            <label><input type="checkbox" name="non-fiction" /> Non-Fiction</label>
                                            <label><input type="checkbox" name="thriller" /> Thriller</label>
                                            <label><input type="checkbox" name="fantasy" /> Fantasy</label>
                                            <label><input type="checkbox" name="general" /> General</label>
                                            <label><input type="checkbox" name="poetry" /> Poetry</label>
                                        </div>
                                    </fieldset>

                                    <fieldset className="filter-challenges">
                                        <legend>Points</legend>
                                        <div className="limits-holder">
                                            <label><input type="checkbox" name="50-70" /> 50-70</label>
                                            <label><input type="checkbox" name="70-90" /> 70-90</label>
                                            <label><input type="checkbox" name="100+" /> 100+</label>
                                        </div>
                                    </fieldset>

                                    <fieldset className="filter-challenges">
                                        <legend>Skill Level</legend>
                                        <div className="limits-holder">
                                            <label><input type="checkbox" name="beginner" /> Beginner</label>
                                            <label><input type="checkbox" name="intermediate" /> Intermediate</label>
                                            <label><input type="checkbox" name="advanced" /> Advanced</label>
                                        </div>
                                    </fieldset>

                                    <fieldset className="filter-challenges">
                                        <legend>Participation Count</legend>
                                        <div className="limits-holder">
                                            <label><input type="checkbox" name="0-10" /> 0-10</label>
                                            <label><input type="checkbox" name="10-50" /> 10-50</label>
                                            <label><input type="checkbox" name="50-100" /> 50-100</label>
                                            <label><input type="checkbox" name="100+" /> 100+</label>
                                        </div>
                                    </fieldset>
                                </div>

                                <button type="button">Select All Filters</button>
                                <button type="reset">Clear All Filters</button>
                                {/* <button type="submit">Search</button> */}
                            </form>
                        </>
                    }
                </aside>

                <section className="right-section" id="all-challenges-right">
                    <h1>Current Challenges</h1>

                    <article id="current-filters">
                        <h2>Current Filters</h2>
                        <ul>
                            
                        </ul>
                    </article>
                    
                    <ul id="challenges-list">
                        {challenges?.length === 0 ? (
                            <p key={`default-empty-challenge-list`}>Nothing yet!</p>
                        ) : search ? (
                            challenges?.filter(challenge => challenge.name.toLowerCase().includes(search.toLowerCase())).map((challenge, index) => (
                                <ChallengeCard sortBy={sortBy} challenge={challenge} index={index} />
                            ))
                        ) : (
                            challenges?.map((challenge, index) => (
                                <ChallengeCard sortBy={sortBy} challenge={challenge} index={index} />
                            ))
                        )}
                    </ul>
                </section>

                {message && <MessagePopup message={message} setMessage={setMessage} />}
            </main>
        </>
    );
};