/**
 * Desc: Challenge Filters component for the challenges page
 *      This component will display the filters for the challenges page
 * File: Promptify/client/src/components/challenges/ChallengeFilters.jsx
*/

// general imports
import { useEffect, useState, useContext } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";

// loading screen for when the page is loading (also used for transitions and testing)
// message popup for errors, warnings, and successes
// some pages may also need to import utils, hooks, or context
// styling for page will be imported here
import "../../styles/challenges/all-challenge-filters.css";

// import any images or assets here

export default function ChallengeFilters({ filters, setFilters }) {
    const getActiveFilterTags = () => {
        const activeTags = [];
    
        const filterLabels = {
            limitations: {
                timeLimit: "Time Limit",
                requiredPhrase: "Required Phrase",
                wordLimit: "Word Limit",
                characterLimit: "Character Limit",
            },
            status: {
                upcoming: "Upcoming",
                inProgress: "In Progress",
                scoring: "Scoring",
            },
            genre: {
                nonFiction: "Non-Fiction",
                fantasy: "Fantasy",
                thriller: "Thriller",
                poetry: "Poetry",
                general: "General",
            },
            skillLevel: {
                beginner: "Beginner",
                intermediate: "Intermediate",
                advanced: "Advanced",
            },
            participationCount: {
                "0-10": "0-10 Participants",
                "10-50": "10-50 Participants",
                "50-100": "50-100 Participants",
                "100+": "100+ Participants",
            },
            points: {
                "50-70": "50-70 Points",
                "70-100": "70-100 Points",
                "100+": "100+ Points",
            },
        };
    
        for (const [key, value] of Object.entries(filters)) {
            if (typeof value === "object") {
                for (const [subKey, isSelected] of Object.entries(value)) {
                    if (isSelected && filterLabels[key] && filterLabels[key][subKey]) {
                        activeTags.push({ label: filterLabels[key][subKey], key, subKey });
                    }
                }
            }
        }
    
        return activeTags;
    };

    const activeTags = getActiveFilterTags();

    const removeFilter = (tag) => {
        setFilters(prevFilters => {
            const newFilters = { ...prevFilters };
            if (newFilters[tag.key] && newFilters[tag.key][tag.subKey] !== undefined) {
                newFilters[tag.key][tag.subKey] = false;
            }
            return newFilters;
        });
    };

    return (
        <article id="current-filters">
            {activeTags.length > 0 && (
                <>
                    <ul className="current-filters-list">
                        {activeTags.map((tag, index) => (
                            <li key={index} className="filter-tag" onClick={() => removeFilter(tag)}>
                                {tag.label}
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </article>
    );
};
