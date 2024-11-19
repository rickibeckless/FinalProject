import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import LoadingScreen from "../../components/global/LoadingScreen.jsx";
import MessagePopup from "../../components/global/MessagePopup.jsx";
import PageTitle from "../../components/global/PageTitle.jsx";
import ChallengeCard from "../../components/challenges/ChallengeCard.jsx";
import ChallengeFilers from "../../components/challenges/ChallengeFilters.jsx";
import "../../styles/challenges/all-challenges.css";

import FilterImg from "../../assets/filter.svg";

export default function AllChallenges() {
    const [loading, setLoading] = useState(true); // set to false when done loading
    const [message, setMessage] = useState(""); // set to message to display in message popup

    const [challenges, setChallenges] = useState(null);
    const [showFiltersModal, setShowFiltersModal] = useState(window.innerWidth >= 767);
    const [showFiltersModalButton, setShowFiltersModalButton] = useState(window.innerWidth <= 767);
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("end-date");
    const [sortOrder, setSortOrder] = useState("desc");
    const [showEnded, setShowEnded] = useState(false);

    const baseFilters = (bool) => ({
        limitations: {
            timeLimit: bool,
            wordLimit: bool,
            characterLimit: bool,
            requiredPhrase: bool
        },
        status: {
            upcoming: bool,
            inProgress: bool,
            scoring: bool
        },
        genre: {
            poetry: bool,
            nonFiction: bool,
            fantasy: bool,
            thriller: bool,
            general: bool
        },
        points: {
            "50-70": bool,
            "70-100": bool,
            "100+": bool
        },
        skillLevel: {
            beginner: bool,
            intermediate: bool,
            advanced: bool
        },
        participationCount: {
            "0-10": bool,
            "10-50": bool,
            "50-100": bool,
            "100+": bool
        }
    });
    const [filters, setFilters] = useState(baseFilters(false));
    const [isFiltered, setIsFiltered] = useState(false);

    const navigate = useNavigate(); // used to navigate to a different page

    const handleFilterModal = () => {
        setShowFiltersModal(prev => !prev);
    };

    const handleFilters = (e) => {
        const { name, value, checked } = e.target;

        setFilters(prev => ({
            ...prev,
            [name]: {
                ...prev[name],
                [value]: checked
            }
        }));

        if (filters !== baseFilters(false)) setIsFiltered(true);
    };

    const handleAllFilter = (e, type) => {
        e.preventDefault();

        if (type === "clear") {
            setFilters(baseFilters(false));
        } else if (type === "select") {
            setFilters(baseFilters(true));
        }

        if (filters !== baseFilters(false)) setIsFiltered(true);
        // if showFiltersModal is true, then close it
        if (showFiltersModal) setShowFiltersModal(false);
    };

    const handleSearch = (e) => {
        setSearch(e.target.value);
    };

    useEffect(() => {
        const handleResize = () => {
            setShowFiltersModal(window.innerWidth >= 767);
            setShowFiltersModalButton(window.innerWidth <= 767);
        };

        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        async function fetchChallenges() {
            const response = await fetch(`/api/challenges`);
            let data = await response.json();

            if (response.ok) {
                setChallenges(data);
                setLoading(false);
            } else {
                setMessage(data.message);
            };
        };

        fetchChallenges();
    }, []);

    const handleShowEnded = (e) => {
        setShowEnded(e.target.checked);

        if (window.innerWidth <= 767 && showFiltersModal) setShowFiltersModal(false);
    };    

    const handleSort = (e, type) => {
        e.preventDefault();

        if (type === "by") {
            setSortBy(e.target.value);
        } else if (type === "order") {
            setSortOrder(e.target.value);
        }
    };

    const sortedChallenges = useMemo(() => {
        if (!challenges) return [];

        const sortedArray = [...challenges];

        if (sortBy === "submissions") {
            sortedArray.sort((a, b) => {
                return sortOrder === "asc"
                    ? a.participation_count - b.participation_count
                    : b.participation_count - a.participation_count
                    ;
            });
        } else if (sortBy === "end-date") {
            sortedArray.sort((a, b) => {
                return sortOrder === "asc"
                    ? new Date(b.end_date_time) - new Date(a.end_date_time)
                    : new Date(a.end_date_time) - new Date(b.end_date_time)
                    ;
            });
        } else if (sortBy === "start-date") {
            sortedArray.sort((a, b) => {
                return sortOrder === "asc"
                    ? new Date(a.start_date_time) - new Date(b.start_date_time)
                    : new Date(b.start_date_time) - new Date(a.start_date_time)
                    ;
            });
        };

        if (showEnded) {
            return sortedArray;
        } else {
            return sortedArray.filter((challenge) => challenge.status !== "ended");
        }
    }, [challenges, sortBy, sortOrder, showEnded]);

    const filterChallenges = (challenges) => {
        return challenges.filter((challenge) => {
            const matchesFilters = Object.entries(filters).every(([filterCategory, filterValues]) => {
                if (Object.values(filterValues).includes(true)) {
                    return Object.entries(filterValues).some(([filter, isSelected]) => {
                        if (isSelected) {
                            if (filterCategory === "limitations") {
                                if (filter === "timeLimit") {
                                    return challenge.limitations.time_limit.max !== null || challenge.limitations.time_limit.min !== null;
                                } else if (filter === "wordLimit") {
                                    return challenge.limitations.word_limit.max !== null || challenge.limitations.word_limit.min !== null;
                                } else if (filter === "characterLimit") {
                                    return challenge.limitations.character_limit.max !== null || challenge.limitations.character_limit.min !== null;
                                } else if (filter === "requiredPhrase") {
                                    return challenge.limitations.required_phrase.max !== null || challenge.limitations.required_phrase.min !== null;
                                }
                            } else if (filterCategory === "status") {
                                if (filter === "upcoming") {
                                    return challenge.status === "upcoming";
                                } else if (filter === "inProgress") {
                                    return challenge.status === "in-progress";
                                } else if (filter === "scoring") {
                                    return challenge.status === "scoring";
                                } 
                                // else if (filter === "ended") {
                                //     return challenge.status === "ended";
                                // }
                            } else if (filterCategory === "genre") {
                                if (filter === "nonFiction") {
                                    return challenge.genre === "non-fiction";
                                } else if (filter === "thriller") {
                                    return challenge.genre === "thriller";
                                } else if (filter === "fantasy") {
                                    return challenge.genre === "fantasy";
                                } else if (filter === "general") {
                                    return challenge.genre === "general";
                                } else if (filter === "poetry") {
                                    return challenge.genre === "poetry";
                                }
                            } else if (filterCategory === "points") {
                                if (filter === "50-70") {
                                    return challenge.available_points >= 50 && challenge.available_points <= 70;
                                } else if (filter === "70-100") {
                                    return challenge.available_points > 70 && challenge.available_points <= 100;
                                } else if (filter === "100+") {
                                    return challenge.available_points > 100;
                                }
                            } else if (filterCategory === "skillLevel") {
                                return challenge.skill_level === filter;
                            } else if (filterCategory === "participationCount") {
                                if (filter === "0-10") {
                                    return challenge.participation_count >= 0 && challenge.participation_count <= 10;
                                } else if (filter === "10-50") {
                                    return challenge.participation_count > 10 && challenge.participation_count <= 50;
                                } else if (filter === "50-100") {
                                    return challenge.participation_count > 50 && challenge.participation_count <= 100;
                                } else if (filter === "100+") {
                                    return challenge.participation_count > 100;
                                }
                            }
                        }
                    });
                }
                return true;
            });

            const matchesSearch = challenge.name.toLowerCase().includes(search.toLowerCase());

            return matchesFilters && matchesSearch;
        });
    };

    return (
        <>
            {loading ? <LoadingScreen /> : null}
            <PageTitle title="Challenges | Promptify" />

            <main id="all-challenges-body" className="container left-aside-right-section">
                <aside className="left-aside" id="all-challenges-left">
                    {showFiltersModalButton && 
                        <button id="filter-challenges-button" title="Filter Challenges" className="challenge-card-button" onClick={handleFilterModal}>
                            <img src={FilterImg} alt="Filter Challenges" />
                        </button>
                    }

                    {showFiltersModal &&
                        <>
                            <form id="search-challenges-form" className="challenges-form">
                                <div className="filter-challenges-form-input-holder">
                                    <label htmlFor="search-challenges">Search:</label>
                                    <input type="search" id="search-challenges" name="search-challenges" placeholder="Search challenges" value={search} onChange={handleSearch} />
                                </div>
                            </form>

                            <form id="sort-challenges-form" className="challenges-form">
                                <div className="filter-challenges-form-input-holder">
                                    <label htmlFor="sort-by">Sort By:</label>
                                    <select id="sort-by" name="sort-by" onChange={(e) => handleSort(e, "by")}>
                                        <option value="end-date">End Date</option>
                                        <option value="start-date">Start Date</option>
                                        <option value="submissions">Submissions</option>
                                    </select>
                                </div>

                                <div className="filter-challenges-form-input-holder">
                                    <label htmlFor="sort-order">Sort Order:</label>
                                    <select id="sort-order" name="sort-order" onChange={(e) => handleSort(e, "order")}>
                                        <option value="desc">Descending</option>
                                        <option value="asc">Ascending</option>
                                    </select>
                                </div>

                                <div className="limits-holder">
                                    <label>
                                        <input type="checkbox" name="show-ended" value="show-ended" onChange={handleShowEnded} checked={showEnded} />
                                        <span className="custom-checkbox"></span>
                                        Show Ended 
                                    </label>
                                </div>
                            </form>

                            <form id="filter-challenges-form" className="challenges-form">
                                <div className="filter-challenges-form-input-holder">
                                    <label htmlFor="filter-challenges">Filter:</label>

                                    <fieldset className="filter-challenges">
                                        <legend>Limitations</legend>
                                        <div className="limits-holder">
                                            <label><input type="checkbox" name="limitations" value="timeLimit" onChange={(e) => handleFilters(e)} checked={filters.limitations.timeLimit} /><span className="custom-checkbox"></span> Time Limit</label>
                                            <label><input type="checkbox" name="limitations" value="wordLimit" onChange={(e) => handleFilters(e)} checked={filters.limitations.wordLimit} /><span className="custom-checkbox"></span> Word Limit</label>
                                            <label><input type="checkbox" name="limitations" value="characterLimit" onChange={(e) => handleFilters(e)} checked={filters.limitations.characterLimit} /><span className="custom-checkbox"></span> Character Limit</label>
                                            <label><input type="checkbox" name="limitations" value="requiredPhrase" onChange={(e) => handleFilters(e)} checked={filters.limitations.requiredPhrase} /><span className="custom-checkbox"></span> Required Phrase</label>
                                        </div>
                                    </fieldset>

                                    <fieldset className="filter-challenges">
                                        <legend>Status</legend>
                                        <div className="limits-holder">
                                            <label><input type="checkbox" name="status" value="upcoming" onChange={(e) => handleFilters(e)} checked={filters.status.upcoming} /><span className="custom-checkbox"></span> Upcoming</label>
                                            <label><input type="checkbox" name="status" value="inProgress" onChange={(e) => handleFilters(e)} checked={filters.status.inProgress} /><span className="custom-checkbox"></span> In Progress</label>
                                            <label><input type="checkbox" name="status" value="scoring" onChange={(e) => handleFilters(e)} checked={filters.status.scoring} /><span className="custom-checkbox"></span> Scoring</label>
                                        </div>
                                    </fieldset>

                                    <fieldset className="filter-challenges">
                                        <legend>Genre</legend>
                                        <div className="limits-holder">
                                            <label><input type="checkbox" name="genre" value="nonFiction" onChange={(e) => handleFilters(e)} checked={filters.genre.nonFiction} /><span className="custom-checkbox"></span> Non-Fiction</label>
                                            <label><input type="checkbox" name="genre" value="thriller" onChange={(e) => handleFilters(e)} checked={filters.genre.thriller} /><span className="custom-checkbox"></span> Thriller</label>
                                            <label><input type="checkbox" name="genre" value="fantasy" onChange={(e) => handleFilters(e)} checked={filters.genre.fantasy} /><span className="custom-checkbox"></span> Fantasy</label>
                                            <label><input type="checkbox" name="genre" value="general" onChange={(e) => handleFilters(e)} checked={filters.genre.general} /><span className="custom-checkbox"></span> General</label>
                                            <label><input type="checkbox" name="genre" value="poetry" onChange={(e) => handleFilters(e)} checked={filters.genre.poetry} /><span className="custom-checkbox"></span> Poetry</label>
                                        </div>
                                    </fieldset>

                                    <fieldset className="filter-challenges">
                                        <legend>Points</legend>
                                        <div className="limits-holder">
                                            <label><input type="checkbox" name="points" value="50-70" onChange={(e) => handleFilters(e)} checked={filters.points["50-70"]} /><span className="custom-checkbox"></span> 50-70</label>
                                            <label><input type="checkbox" name="points" value="70-100" onChange={(e) => handleFilters(e)} checked={filters.points["70-100"]} /><span className="custom-checkbox"></span> 70-100</label>
                                            <label><input type="checkbox" name="points" value="100+" onChange={(e) => handleFilters(e)} checked={filters.points["100+"]} /><span className="custom-checkbox"></span> 100+</label>
                                        </div>
                                    </fieldset>

                                    <fieldset className="filter-challenges">
                                        <legend>Skill Level</legend>
                                        <div className="limits-holder">
                                            <label><input type="checkbox" name="skillLevel" value="beginner" onChange={(e) => handleFilters(e)} checked={filters.skillLevel.beginner} /><span className="custom-checkbox"></span> Beginner</label>
                                            <label><input type="checkbox" name="skillLevel" value="intermediate" onChange={(e) => handleFilters(e)} checked={filters.skillLevel.intermediate} /><span className="custom-checkbox"></span> Intermediate</label>
                                            <label><input type="checkbox" name="skillLevel" value="advanced" onChange={(e) => handleFilters(e)} checked={filters.skillLevel.advanced} /><span className="custom-checkbox"></span> Advanced</label>
                                        </div>
                                    </fieldset>

                                    <fieldset className="filter-challenges">
                                        <legend>Participation Count</legend>
                                        <div className="limits-holder">
                                            <label><input type="checkbox" name="participationCount" value="0-10" onChange={(e) => handleFilters(e)} checked={filters.participationCount["0-10"]} /><span className="custom-checkbox"></span> 0-10</label>
                                            <label><input type="checkbox" name="participationCount" value="10-50" onChange={(e) => handleFilters(e)} checked={filters.participationCount["10-50"]} /><span className="custom-checkbox"></span> 10-50</label>
                                            <label><input type="checkbox" name="participationCount" value="50-100" onChange={(e) => handleFilters(e)} checked={filters.participationCount["50-100"]} /><span className="custom-checkbox"></span> 50-100</label>
                                            <label><input type="checkbox" name="participationCount" value="100+" onChange={(e) => handleFilters(e)} checked={filters.participationCount["100+"]} /><span className="custom-checkbox"></span> 100+</label>
                                        </div>
                                    </fieldset>
                                </div>

                                <button type="button" className="challenge-card-button" onClick={(e) => handleAllFilter(e, 'select')}>Select All Filters</button>
                                <button type="reset" className="challenge-card-button" onClick={(e) => handleAllFilter(e, 'clear')}>Clear All Filters</button>
                            </form>
                        </>
                    }
                </aside>

                <section className="right-section" id="all-challenges-right">
                    <h1>Current Challenges</h1>

                    <ChallengeFilers filters={filters} setFilters={setFilters} />

                    <ul id="challenges-list">
                        {challenges?.length === 0 ? (
                            <p key={`default-empty-challenge-list`}>Nothing yet!</p>
                        ) : search ? (
                            sortedChallenges.filter((challenge) => challenge.name.toLowerCase().includes(search.toLowerCase())).map((challenge, index) => (
                                <ChallengeCard challenge={challenge} />
                            ))
                        ) : isFiltered ? (
                            filterChallenges(sortedChallenges).map((challenge, index) => (
                                <ChallengeCard key={index} challenge={challenge} />
                            ))
                        ) : (
                            sortedChallenges.map((challenge) => (
                                <ChallengeCard challenge={challenge} />
                            ))
                        )}
                    </ul>
                </section>

                {message && <MessagePopup message={message} setMessage={setMessage} />}
            </main>
        </>
    );
};