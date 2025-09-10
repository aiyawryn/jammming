import React from "react";

function PlaylistListItem({ name, playlistId }) {
    return (
        <div style={{ marginBottom: "8px" }}>
            <strong>{name}</strong> <span style={{ color: "#888" }}>({playlistId})</span>
        </div>
    );
}

export default PlaylistListItem;