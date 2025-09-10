import React from "react";
import styles from "./Track.module.css";

function Track({
    track = {},
    onAdd,
    onUndo,
    onRemoveFromSpotify,
    pendingTracks = [],
    selectedPlaylistTracks = [],
    selectedPlaylist = null,
    isRemoval = false,
}) {
    const isInSelectedPlaylist = selectedPlaylistTracks.some((t) => t.id === track.id);
    const isInPendingList = pendingTracks.some((t) => t.id === track.id);
    const isNewPlaylist = !selectedPlaylist;

    function renderTrackActionButton() {
        if (!track || !track.name) return null;

        // 🎯 ฝั่ง Playlist
        if (isRemoval) {
            if (isInPendingList) {
                return (
                    <button
                        className={styles["Track-undo"]}
                        onClick={() => onUndo?.(track)}
                        title="Undo pending add"
                    >
                        ⤺
                    </button>
                );
            }

            if (isInSelectedPlaylist) {
                return (
                    <button
                        className={styles["Track-removeSpotify"]}
                        onClick={() => onRemoveFromSpotify?.(track)}
                        title="Remove from Spotify playlist"
                    >
                        ×
                    </button>
                );
            }

            return null;
        }

        // 🎯 ฝั่ง Search Results
        if (isInPendingList) {
            return (
                <span
                    className={styles["Track-undo"]}
                    onClick={() => onUndo?.(track)}
                    title="Undo pending add"
                >
                    ⤺
                </span>
            );
        }

        if (!isNewPlaylist && isInSelectedPlaylist) {
            return (
                <span className={styles["Track-checkmark"]} title="Already in playlist">
                    ✔
                </span>
            );
        }

        return (
            <span
                className={styles["Track-action"]}
                onClick={() => onAdd?.(track)}
                title="Add to playlist"
            >
                +
            </span>
        );
    }

    return (
        <div className={styles.Track}>
            <div className={styles["Track-information"]}>
                <h3>{track.name || "Unknown Title"}</h3>
                <p>
                    {track.artist || "Unknown Artist"} | {track.album || "Unknown Album"}
                </p>
            </div>

            {track.preview_url && (
                <audio controls className={styles["Track-preview"]}>
                    <source src={track.preview_url} type="audio/mpeg" />
                    Your browser does not support the audio element.
                </audio>
            )}

            {renderTrackActionButton()}
        </div>
    );
}

export default Track;