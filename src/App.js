import { useEffect, useState } from "react";
import "./App.css";
import axios from "axios";
import { Howl, Howler } from "howler";

import Playlist from "./components/Playlist";
import Track from "./components/Track";

const TITLES = {
  NAME: "Vs My Playlist",
  PLAYLIST: "Pick a playlist",
  TRACK: "Pick the better song",
};

const CLIENT_ID = "ad1d9256da1648fe842417e4533e59e8";
const REDIRECT_URI = "https://jesuszvl.github.io/vs-my-playlist/";
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const RESPONSE_TYPE = "token";
const SCOPE = "playlist-read-private";
const MINIMUM_PLAYLIST_SIZE = 15;

function App() {
  const [token, setToken] = useState("");
  const [playlists, setPlaylists] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [title, setTitle] = useState(TITLES.NAME);
  const [backToPlaylist, setBackToPlaylist] = useState(false);
  const [soundId, setSoundId] = useState("");
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);

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

    const max = data.items.length;
    const min = 2;
    const a = Math.floor(Math.random() * (max - min + 1)) + min;

    const randomTracks = data.items.slice(a - 2, a);

    setTracks(randomTracks);
    setBackToPlaylist(true);
  };

  const renderPlaylists = () => {
    const shouldRenderPlaylists =
      playlists.length > 0 && tracks.length === 0 && token;

    if (!shouldRenderPlaylists) return null;

    return playlists.map((playlist) => {
      return (
        <Playlist
          key={playlist.id}
          playlist={playlist}
          onPlaylistClick={onPlaylistClick}
        />
      );
    });
  };

  const renderTracks = () => {
    const shouldRenderTracks = tracks.length !== 0 && token;

    if (!shouldRenderTracks) return null;

    const max = tracks.length;
    const min = 2;
    const a = Math.floor(Math.random() * (max - min + 1)) + min;

    return (
      <div className="tracks-container">
        {tracks.slice(a - 2, a).map((track) => {
          const trackObj = track.track;
          return (
            <Track
              key={trackObj.id}
              track={trackObj}
              onTrackClick={onTrackClick}
            />
          );
        })}
      </div>
    );
  };

  const renderActionButton = () => {
    const isLogin = !token;

    const actionTitle = backToPlaylist
      ? selectedTrack
        ? "Next"
        : "Back To Playlists"
      : "Logout";

    const handleActionClick = backToPlaylist
      ? selectedTrack
        ? onNextClick
        : onBackToPlaylistClick
      : onLogoutClick;

    return (
      <div className="action-buttons">
        {isLogin ? (
          <a
            href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`}
            className="spotify-login"
          >
            Login with Spotify
          </a>
        ) : (
          <div className="action-buttons">
            <button className="spotify-button" onClick={handleActionClick}>
              {actionTitle}
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderInfo = () => {
    return (
      <>
        {!token && (
          <p className="subtitle">
            Sort any playlist based on track preferences
          </p>
        )}
      </>
    );
  };

  const onPlaylistClick = (playlist) => {
    getPlaylistTracks(playlist);
    setSelectedPlaylist(playlist);
    setTitle(TITLES.TRACK);
  };

  const onTrackClick = (track) => {
    if (selectedTrack) {
      setSelectedTrack(null);
    } else {
      setSelectedTrack(track);
    }
    //if (soundId) {
    //  Howler.pause(soundId);
    //  setSoundId("");
    //} else {
    //  const sound = new Howl({
    //    src: [track.preview_url],
    //    html5: true,
    //  });
    //const id = sound.play();
    //setSoundId(id);
    //}
  };

  const onNextClick = () => {
    getPlaylistTracks(selectedPlaylist);
    setSelectedTrack(null);
  };

  const onBackToPlaylistClick = () => {
    setTracks([]);
    setBackToPlaylist(false);
    setSelectedTrack(null);
    setSelectedPlaylist(null);
    setTitle(TITLES.PLAYLIST);
  };

  const onLogoutClick = () => {
    setPlaylists([]);
    setToken("");
    setTitle(TITLES.NAME);
    window.localStorage.removeItem("token");
  };

  return (
    <div className="wrapper">
      <div className="header">{title}</div>
      <div className="content">
        {renderInfo()}
        {renderPlaylists()}
        {renderTracks()}
      </div>
      <div className="footer">{renderActionButton()}</div>
    </div>
  );
}

export default App;
