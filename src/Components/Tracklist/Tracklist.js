import React from "react";
import styles from "./Tracklist.module.css";
import Track from "../Track/Track";

function Tracklist({
    tracks = [],
    isRemoval = false,
    onAdd,
    onRemove,
    onUndo,
    onRemoveFromSpotify,
    pendingTracks = [],
    selectedPlaylistTracks = [],
    selectedPlaylist = null,
}) {
    if (tracks.length === 0) {
        return (
            <div className={styles.Tracklist}>
                <p className={styles.empty} aria-live="polite">
                    🎧 No songs to display yet
                </p>
            </div>
        );
    }

    return (
        <div className={styles.Tracklist}>
            {tracks.map((track) => (
                <Track
                    key={track.id}
                    track={track}
                    isRemoval={isRemoval}
                    onAdd={onAdd}
                    onRemove={onRemove}
                    onRemoveFromSpotify={onRemoveFromSpotify}
                    onUndo={onUndo}
                    pendingTracks={pendingTracks} // ✅ ส่งเข้า Track
                    selectedPlaylistTracks={selectedPlaylistTracks}
                    selectedPlaylist={selectedPlaylist}
                />
            ))}
        </div>
    );
}

export default Tracklist;