import React from "react";
import styles from "./PlaylistList.module.css";

function PlaylistList({ playlists, onSelect, onDelete }) {
    return (
        <div className={styles.PlaylistList}>
            <h2>Your Spotify Playlists</h2>
            {playlists.length === 0 ? (
                <p style={{ color: "#ccc" }}>No playlists found.</p>
            ) : (
                playlists.map((playlist) => (
                    <div key={playlist.playlistId} className={styles["PlaylistList-item"]}>
                        <span
                            className={styles["PlaylistList-name"]}
                            onClick={() => onSelect(playlist)}
                        >
                            {playlist.name}
                        </span>
                        <button
                            className={styles["PlaylistList-deleteBtn"]}
                            onClick={() => onDelete(playlist.playlistId)}
                            title="Delete playlist"
                        >
                            ×
                        </button>
                    </div>
                ))
            )}
        </div>
    );
}

export default PlaylistList;