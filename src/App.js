import { useEffect, useState } from "react";
import "./App.css";
import axios from "axios";
import { Howl } from "howler";

const TITLES = {
  NAME: "Versus My Playlist",
  PLAYLIST: "Chose one playlist",
  TRACK: "Pick the better song",
};

function App() {
  const CLIENT_ID = "ad1d9256da1648fe842417e4533e59e8";
  const REDIRECT_URI = "http://localhost:3000";
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
  const RESPONSE_TYPE = "token";
  const SCOPE = "playlist-read-private";
  const MINIMUM_PLAYLIST_SIZE = 25;

  const [token, setToken] = useState("");
  const [playlists, setPlaylists] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [title, setTitle] = useState(TITLES.NAME);
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
        playlist.tracks.total >= MINIMUM_PLAYLIST_SIZE &&
        playlist.owner.id !== "spotify"
    );

    const sortedPlaylist = filteredPlaylists.sort(
      (a, b) => b.tracks.total - a.tracks.total
    );

    setPlaylists(sortedPlaylist);
    setTitle(TITLES.PLAYLIST);
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

  const renderTracks = () => {
    const max = tracks.length;
    const min = 2;
    const a = Math.floor(Math.random() * (max - min + 1)) + min;

    return tracks.slice(a - 2, a).map((track) => {
      const trackObj = track.track;
      return (
        <div
          key={trackObj.id}
          className="track"
          onClick={() => onTrackClick(trackObj)}
        >
          <img
            className="track-image"
            src={trackObj.album.images[0].url}
            alt={trackObj.name}
          />
          <div className="track-info">
            <p className="track-name">{trackObj.name}</p>
            <p className="track-artist">{trackObj.artists[0].name}</p>
            <p className="track-artist">{trackObj.popularity}</p>
          </div>
        </div>
      );
    });
  };

  const onPlaylistClick = (playlist) => {
    getPlaylistTracks(playlist);
    setTitle(TITLES.TRACK);
  };

  const onTrackClick = (track) => {
    console.log(track);
    const sound = new Howl({
      src: [track.preview_url],
      html5: true,
    });
    sound.play();
  };

  const backToPlaylistClick = () => {
    setTracks([]);
    setBackToPlaylist(false);
    setTitle(TITLES.PLAYLIST);
  };

  const logout = () => {
    setPlaylists([]);
    setToken("");
    setTitle(TITLES.NAME);
    window.localStorage.removeItem("token");
  };

  const shouldRenderPlaylists =
    playlists.length > 0 && tracks.length === 0 && token;

  const shouldRenderTracks = tracks.length !== 0 && token;

  return (
    <div className="App">
      <header className="App-header">
        <h2>{title}</h2>
        {shouldRenderPlaylists && (
          <div className="playlists-container">{renderPlaylists()}</div>
        )}
        {shouldRenderTracks && (
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
          <div className="action-buttons">
            {backToPlaylist && (
              <button className="spotify-logout" onClick={backToPlaylistClick}>
                Back To Playlists
              </button>
            )}
            <button className="spotify-logout" onClick={logout}>
              Logout
            </button>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
