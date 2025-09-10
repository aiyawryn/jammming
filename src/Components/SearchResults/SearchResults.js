import React from "react";
import styles from "./SearchResults.module.css";
import Tracklist from "../Tracklist/Tracklist";

function SearchResults({
    results = [],
    onAdd,
    onUndo,
    isLoading,
    pendingTracks = [], // ✅ เปลี่ยนชื่อให้ชัดเจน
    selectedPlaylistTracks = [],
    selectedPlaylist = null,
}) {
    if (isLoading) {
        return (
            <div className={styles.SearchResults}>
                <h2>Results</h2>
                <div className={styles.loading} aria-live="polite">
                    🔄 looking for a song
                </div>
            </div>
        );
    }

    if (results.length === 0) {
        return (
            <div className={styles.SearchResults}>
                <h2>Results</h2>
                <div className={styles.empty} aria-live="polite">
                    🔍 No results to display
                </div>
            </div>
        );
    }

    return (
        <div className={styles.SearchResults}>
            <h2>Results</h2>
            <Tracklist
                tracks={results}
                isRemoval={false}
                onAdd={onAdd}
                onUndo={onUndo}
                pendingTracks={pendingTracks} // ✅ ส่งเข้า Tracklist
                selectedPlaylistTracks={selectedPlaylistTracks}
                selectedPlaylist={selectedPlaylist}
            />
        </div>
    );
}

export default SearchResults;