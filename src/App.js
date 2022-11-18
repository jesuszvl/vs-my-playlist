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
  const [tracks, setTracks] = useState([]);
  const [title, setTitle] = useState(DEFAULT_TITLE);
  const [backToPlaylist, setBackToPlaylist] = useState(false);

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

    const filteredPlaylists = data.items.filter(
      (playlist) =>
        playlist.tracks.total >= 30 && playlist.owner.id !== "spotify"
    );

    const sortedPlaylist = filteredPlaylists.sort(
      (a, b) => a.tracks.total - b.tracks.total
    );

    setPlaylists(sortedPlaylist);
    setTitle("Chose one playlist to sort");
  };

  const renderPlaylists = () => {
    return playlists.map((playlist) => {
      return (
        <div
          className="spotify-playlist"
          key={playlist.id}
          onClick={() => onPlaylistClick(playlist)}
        >
          <img className="playlist-image" src={playlist.images[0].url} alt="" />
          <span className="playlist-title">{playlist.name}</span>
        </div>
      );
    });
  };

  const onPlaylistClick = (playlist) => {
    getPlaylistTracks(playlist);
    setTitle("Pick the better song");
  };

  const getPlaylistTracks = async (playlist) => {
    const { data } = await axios.get(playlist.tracks.href, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setTracks(data.items);
    setBackToPlaylist(true);
  };

  const onTrackClick = (trackId) => {
    console.log(trackId);
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
            onClick={() => onTrackClick(track.track.id)}
          />
        ) : (
          <div>No Image</div>
        )}
        <p>{track.track.name}</p>
      </div>
    ));
  };

  const backToPlaylistClick = () => {
    setTracks([]);
    setBackToPlaylist(false);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h2>{title}</h2>
        {playlists.length > 0 && tracks.length === 0 && token && (
          <div className="playlists-container">{renderPlaylists()}</div>
        )}
        {tracks.length !== 0 && token && (
          <div className="tracks-container">{renderTracks()}</div>
        )}
        {!token ? (
          <a
            href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`}
            className="spotify-login"
          >
            Login with Spotify
          </a>
        ) : (
          <>
            {backToPlaylist && (
              <button className="spotify-logout" onClick={backToPlaylistClick}>
                Back To Playlists
              </button>
            )}
            <button className="spotify-logout" onClick={logout}>
              Logout
            </button>
          </>
        )}
      </header>
    </div>
  );
}

export default App;
