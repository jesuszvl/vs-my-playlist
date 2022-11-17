import { useEffect, useState } from "react";
import "./App.css";
import axios from "axios";

const DEFAULT_TITLE = "Versus My Playlist";

function App() {
  const CLIENT_ID = "ad1d9256da1648fe842417e4533e59e8";
  const REDIRECT_URI = "http://localhost:3000";
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
  const RESPONSE_TYPE = "token";
  const SCOPE = "playlist-read-private";

  const [token, setToken] = useState("");
  const [playlists, setPlaylists] = useState([]);
  const [versusPlaylist, setVersusPlaylist] = useState("");
  const [tracks, setTracks] = useState([]);
  const [title, setTitle] = useState(DEFAULT_TITLE);

  useEffect(() => {
    const hash = window.location.hash;
    let token = window.localStorage.getItem("token");

    if (!token && hash) {
      token = hash
        .substring(1)
        .split("&")
        .find((elem) => elem.startsWith("access_token"))
        .split("=")[1];

      window.location.hash = "";
      window.localStorage.setItem("token", token);
    } else {
      getUserPlaylists(token);
    }
    setToken(token);
  }, []);

  const logout = () => {
    setPlaylists([]);
    setToken("");
    setTitle(DEFAULT_TITLE);
    window.localStorage.removeItem("token");
  };

  const getUserPlaylists = async (token) => {
    const { data } = await axios.get(
      "https://api.spotify.com/v1/me/playlists",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          limit: 50,
        },
      }
    );
    setPlaylists(data.items);
    setTitle("Chose one playlist to sort...");
  };

  const renderPlaylists = () => {
    return playlists.map((playlist) => {
      return (
        <div
          className="spotify-playlist"
          key={playlist.id}
          onClick={() => onPlaylistClick(playlist.id)}
        >
          <img className="playlist-image" src={playlist.images[0].url} alt="" />
          <span className="playlist-title">{playlist.name}</span>
        </div>
      );
    });
  };

  const onPlaylistClick = (playlist) => {
    console.log(playlist);
  };

  const getPlaylistTracks = (playlistId) => {
    const { data } = axios.get(
      "https://api.spotify.com/v1/playlists/2NzyWV9sT9rnKMncFHCkJG",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: {
          uris: [],
        },
      }
    );
  };

  const onTrackClick = (trackId) => {
    getPlaylistTracks();
  };

  const renderTracks = () => {
    const max = tracks.length;
    const min = 2;
    const a = Math.floor(Math.random() * (max - min + 1)) + min;
    return tracks.slice(a - 2, a).map((track) => (
      <div key={track.track.id}>
        {track.track.album.images.length ? (
          <img
            width={"150px"}
            src={track.track.album.images[0].url}
            alt=""
            onClick={onTrackClick(track.track.id)}
          />
        ) : (
          <div>No Image</div>
        )}
        <p>{track.track.name}</p>
      </div>
    ));
  };

  return (
    <div className="App">
      <header className="App-header">
        <h2>{title}</h2>
        {playlists && token && (
          <div className="playlists-container">{renderPlaylists()}</div>
        )}
        {!token ? (
          <a
            href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`}
            className="spotify-login"
          >
            Login with Spotify
          </a>
        ) : (
          <button className="spotify-logout" onClick={logout}>
            Logout
          </button>
        )}
      </header>
    </div>
  );
}

export default App;
