import React, { useState, useEffect } from "react";
import styles from "./SearchBar.module.css";

function SearchBar({ onSearch }) {
    const [term, setTerm] = useState("");

    useEffect(() => {
        const savedTerm = localStorage.getItem("lastSearchTerm");
        if (savedTerm) {
            setTerm(savedTerm);
        }
    }, []);


    function handleSearch() {
        if (term.trim()) {
            onSearch?.(term.trim());
        }
    }

    function handleTermChange({ target }) {
        setTerm(target.value);
    }

    return (
        <div className={styles.SearchBar}>
            <input
                type="text"
                value={term}
                onChange={handleTermChange}
                placeholder="Enter a song, album, or artist"
                className={styles["SearchBar-input"]}
            />
            <button className={styles.SearchButton} onClick={handleSearch}>
                SEARCH
            </button>
        </div>
    );
}

export default SearchBar;