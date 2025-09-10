# 🎧 Jammming — Build Your Spotify Playlist

Jammming is a React application that allows users to search for tracks via the Spotify API, create custom playlists, and save them directly to their Spotify account. Designed with a clean, responsive UI and robust state management, Jammming delivers a smooth and reliable music curation experience.

---

## 🚀 Features

- 🔍 Search for tracks using Spotify’s real-time API
- ➕ Add or remove tracks from your custom playlist
- 💾 Save playlists directly to your Spotify account
- 🧠 Handles ghost tracks and stale API responses gracefully
- 🧪 Built-in fallback logic for authentication and playlist recovery
- 🎨 Minimal, premium UI with elegant styling

---

## 🛠️ Tech Stack

| Technology     | Purpose                            |
|----------------|------------------------------------|
| React          | UI Framework                       |
| CSS Modules    | Scoped styling per component       |
| Spotify API    | Music data & playlist integration  |
| LocalStorage   | Session persistence                |
| ESLint + Prettier | Code quality & formatting       |

---

## 📦 Installation

```bash
git clone https://github.com/your-username/jammming.git
cd jammming
npm install
npm start

---

## 🔐 Environment Setup
Create a .env file in the root directory:
REACT_APP_SPOTIFY_CLIENT_ID=your-client-id-here
REACT_APP_REDIRECT_URI=http://localhost:3000/callback


⚠️ Do not commit .env to GitHub. Ensure .gitignore includes .env.

---

## 📁 Folder Structure
jammming/
├── src/
│   ├── Components/
│   │   ├── PlaylistList/
│   │   │   ├── PlaylistList.js
│   │   │   ├── PlaylistListItem.js
│   │   │   └── PlaylistListItem.module.css
│   │   ├── SearchBar/
│   │   │   ├── SearchBar.js
│   │   │   └── SearchBar.module.css
│   │   ├── SearchResults/
│   │   │   ├── SearchResults.js
│   │   │   └── SearchResults.module.css
│   │   ├── Track/
│   │   │   ├── Track.js
│   │   │   └── Track.module.css
│   │   ├── Tracklist/
│   │   │   ├── Tracklist.js
│   │   │   └── Tracklist.module.css
│   ├── util/
│   │   ├── pkceUtil.js
│   │   └── Spotify.js
│   ├── index.css
│   └── index.js
├── .env
├── .gitignore
├── package.json
├── package-lock.json
└── README.md

---

## 🧑‍💻 Author
Aiyawarin — perfectionist frontend developer
Focused on reliability, visual elegance, and user trust.

## 📄 License
This project is licensed under the MIT License.
Feel free to fork, remix, and build upon it — just don’t leak your Spotify credentials 😉

---
