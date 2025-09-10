import React from "react";
import styles from "./Playlist.module.css";
import Tracklist from "../Tracklist/Tracklist";

function Playlist({
    playlistName,
    playlistTracks = [],
    onRemove,
    onRemoveFromSpotify,
    onNameChange,
    onSave,
    isSaving = false,
    selectedPlaylist = null,
    selectedPlaylistTracks = [],
    pendingTracks = [],
    onCloseSelected,
}) {
    function handleNameChange({ target }) {
        onNameChange?.(target.value);
    }

    // ✅ รวม track จาก playlist ที่เลือก + track ที่เพิ่งเพิ่ม
    const trackMap = new Map();
    [...selectedPlaylistTracks, ...pendingTracks].forEach((t) => {
        trackMap.set(t.id, t);
    });
    const tracksToDisplay = selectedPlaylist ? Array.from(trackMap.values()) : playlistTracks;

    return (
        <div className={styles.Playlist}>
            {selectedPlaylist && (
                <button
                    className={styles["Playlist-closeBtn"]}
                    onClick={onCloseSelected}
                    title="Back to custom playlist"
                >
                    « Back
                </button>
            )}

            <input
                type="text"
                value={playlistName}
                onChange={handleNameChange}
                className={styles["Playlist-input"]}
                disabled={!!selectedPlaylist}
            />

            {tracksToDisplay.length === 0 ? (
                <p className={styles["Playlist-empty"]}>No tracks in this playlist.</p>
            ) : (
                <Tracklist
                    tracks={tracksToDisplay}
                    isRemoval={true}
                    onUndo={onRemove} // ✅ ใช้ onUndo แทน onRemove สำหรับ Undo
                    onRemoveFromSpotify={onRemoveFromSpotify}
                    pendingTracks={pendingTracks} // ✅ ส่งเข้าไปเพื่อให้ Track รู้ว่า track ไหน pending
                    selectedPlaylistTracks={selectedPlaylistTracks}
                />


            )}

            <button
                className={styles["Playlist-save"]}
                onClick={onSave}
                disabled={isSaving || tracksToDisplay.length === 0}
            >
                {isSaving
                    ? "Saving..."
                    : selectedPlaylist
                        ? "ADD TO SELECTED PLAYLIST"
                        : "SAVE AS NEW PLAYLIST"}
            </button>
        </div>
    );
}

export default Playlist;