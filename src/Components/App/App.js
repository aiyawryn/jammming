import React, { useState, useEffect } from "react";
import styles from "./App.module.css";
import SearchResults from "../SearchResults/SearchResults";
import Playlist from "../Playlist/Playlist";
import SearchBar from "../SearchBar/SearchBar";
import PlaylistList from "../PlaylistList/PlaylistList";
import { Spotify } from "../../util/Spotify";

function App() {
  const [searchResults, setSearchResults] = useState([]);
  const [playlistName, setPlaylistName] = useState("My Playlist");
  const [pendingTracks, setPendingTracks] = useState([]);
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [selectedPlaylistTracks, setSelectedPlaylistTracks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function handleAuthRedirect() {
      await Spotify.handleRedirect();
      const token = await Spotify.getAccessToken();

      if (token) {
        await fetchUserPlaylists();
      }

      const lastTerm = localStorage.getItem("lastSearchTerm");
      if (token && lastTerm) {
        await search(lastTerm);
        localStorage.removeItem("lastSearchTerm");
      }

      const restoredName = localStorage.getItem("tempPlaylistName");
      const restoredTracks = JSON.parse(localStorage.getItem("tempPlaylistTracks"));

      if (restoredName) setPlaylistName(restoredName);
      if (restoredTracks) setPendingTracks(restoredTracks);

      localStorage.removeItem("tempPlaylistName");
      localStorage.removeItem("tempPlaylistTracks");

      setIsAuthenticating(false);
    }

    handleAuthRedirect();
  }, []);

  async function fetchUserPlaylists() {
    const playlists = await Spotify.getUserPlaylists();
    setUserPlaylists(playlists);
  }

  async function handleSelectPlaylist(playlist) {
    setSelectedPlaylist(playlist);
    const tracks = await Spotify.getPlaylistTracks(playlist.playlistId);
    setSelectedPlaylistTracks(tracks);
    setPendingTracks([]);
    return tracks;
  }

  async function handleDeletePlaylist(playlistId) {
    const confirmed = window.confirm("คุณต้องการลบ Playlist นี้จริงหรือ?");
    if (!confirmed) return;

    const success = await Spotify.deletePlaylist(playlistId);
    if (success) {
      await fetchUserPlaylists();
      if (selectedPlaylist?.playlistId === playlistId) {
        setSelectedPlaylist(null);
        setSelectedPlaylistTracks([]);
        setPendingTracks([]);
      }
    }
  }

  function addTrack(track) {
    const alreadyPending = pendingTracks.find((t) => t.id === track.id);
    const alreadyInPlaylist = selectedPlaylistTracks.find((t) => t.id === track.id);

    if (!alreadyPending && !alreadyInPlaylist) {
      setPendingTracks((prev) => [...prev, track]);
    }
  }

  function removeTrack(track) {
    setPendingTracks((prev) => prev.filter((t) => t.id !== track.id));
  }

  function updatePlaylistName(name) {
    setPlaylistName(name);
  }

  async function savePlaylist() {
    setIsSaving(true);
    const token = await Spotify.getAccessToken();
    if (!token) {
      localStorage.setItem("tempPlaylistName", playlistName);
      localStorage.setItem("tempPlaylistTracks", JSON.stringify(pendingTracks));
      await Spotify.initiateAuthFlow();
      setIsSaving(false);
      return;
    }

    const newTracks = selectedPlaylist
      ? pendingTracks.filter(
        (track) => !selectedPlaylistTracks.some((existing) => existing.id === track.id)
      )
      : pendingTracks;

    if (newTracks.length === 0) {
      console.log("No new tracks to add.");
      setIsSaving(false);
      return;
    }

    const trackURIs = newTracks.map((t) => t.uri);

    let success;
    if (selectedPlaylist) {
      success = await Spotify.addTracksToPlaylist(selectedPlaylist.playlistId, trackURIs);
      const updatedTracks = await Spotify.getPlaylistTracks(selectedPlaylist.playlistId);
      setSelectedPlaylistTracks(updatedTracks);
    } else {
      success = await Spotify.savePlaylist(playlistName, trackURIs);
      await fetchUserPlaylists();
    }

    if (success) {
      setPendingTracks([]);
      if (!selectedPlaylist) {
        setPlaylistName("New Playlist");
      }
    }

    setIsSaving(false);
  }

  async function search(term) {
    setIsLoading(true);
    localStorage.setItem("lastSearchTerm", term);

    const token = await Spotify.getAccessToken();
    if (!token) {
      localStorage.setItem("tempPlaylistName", playlistName);
      localStorage.setItem("tempPlaylistTracks", JSON.stringify(pendingTracks));
      await Spotify.initiateAuthFlow();
      setIsLoading(false);
      return;
    }

    try {
      const results = await Spotify.search(term);
      setSearchResults(Array.isArray(results) ? results : []);
    } catch (error) {
      console.error("Search failed:", error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleCloseSelectedPlaylist() {
    setSelectedPlaylist(null);
    setSelectedPlaylistTracks([]);
    setPendingTracks([]);
  }

  async function handleRemoveTrackFromSpotify(track) {
    if (!selectedPlaylist) return;

    const success = await Spotify.removeTrackFromPlaylist(selectedPlaylist.playlistId, track.uri);
    if (success) {
      const updatedTracks = await Spotify.getPlaylistTracks(selectedPlaylist.playlistId);
      setSelectedPlaylistTracks(updatedTracks);
    }
  }

  return (
    <div className={styles.App}>
      <h1>
        Ja<span className={styles.highlight}>mmm</span>ing
      </h1>

      {isAuthenticating ? (
        <p className={styles.loading}>Signing in to Spotify…</p>
      ) : (
        <>
          <SearchBar onSearch={search} />

          <div className={styles["App-mainGrid"]}>
            <div className={styles["App-leftPane"]}>
              <SearchResults
                results={searchResults}
                onAdd={addTrack}
                onUndo={removeTrack}
                isLoading={isLoading}
                pendingTracks={pendingTracks} // ✅ ใช้ชื่อที่ถูกต้อง
                selectedPlaylistTracks={selectedPlaylistTracks}
                selectedPlaylist={selectedPlaylist}
              />
            </div>

            <div className={styles["App-rightPane"]}>
              <div className={styles["App-halfHeightBox"]}>
                <Playlist
                  playlistName={selectedPlaylist?.name || playlistName}
                  playlistTracks={pendingTracks}
                  pendingTracks={pendingTracks}
                  onRemove={removeTrack}
                  onRemoveFromSpotify={handleRemoveTrackFromSpotify}
                  onNameChange={updatePlaylistName}
                  onSave={savePlaylist}
                  isSaving={isSaving}
                  selectedPlaylist={selectedPlaylist}
                  selectedPlaylistTracks={selectedPlaylistTracks}
                  onCloseSelected={handleCloseSelectedPlaylist}
                />
              </div>
              <div className={styles["App-halfHeightBox"]}>
                <PlaylistList
                  playlists={userPlaylists}
                  onSelect={handleSelectPlaylist}
                  onDelete={handleDeletePlaylist}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;