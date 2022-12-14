import { useEffect, useState } from "react";
import "./App.css";
import axios from "axios";
import { Howl } from "howler";

import { RotatingLines } from "react-loader-spinner";

import Playlist from "./components/Playlist";
import Track from "./components/Track";
import ActionButton from "./components/ActionButton";

import { TITLES, ACTIONS, MINIMUM_PLAYLIST_SIZE, AUTH_HREF } from "./constants";

function App() {
  const [token, setToken] = useState("");
  const [playlists, setPlaylists] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [title, setTitle] = useState(TITLES.NAME);
  const [backToPlaylist, setBackToPlaylist] = useState(false);
  const [soundId, setSoundId] = useState("");
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [soundObj, setSoundObj] = useState(null);
  const [snapshot, setSnapshot] = useState("");
  const [rangeStart, setRangeStart] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

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
    } else if (token) {
      getUserPlaylists(token);
    }
    setToken(token);
  }, []);

  const getUserPlaylists = async (token) => {
    try {
      setIsLoading(true);
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
      setIsLoading(false);
    } catch (error) {
      console.log(error.response.data.error);
      window.localStorage.removeItem("token");
      setIsLoading(false);
    }
  };

  const getPlaylistTracks = async (playlist) => {
    setIsLoading(true);
    const { data } = await axios.get(playlist.tracks.href, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const max = data.items.length;
    const min = 2;
    const a = Math.floor(Math.random() * (max - min + 1)) + min;

    const randomTracks = data.items.slice(a - 2, a);

    setRangeStart(a - 1);
    setTracks(randomTracks);
    setBackToPlaylist(true);
    setIsLoading(false);
  };

  const updatePlaylistTracks = async (playlist) => {
    const bodyData = {
      snapshot_id: snapshot,
      range_start: rangeStart,
      insert_before: rangeStart - 1,
    };

    const { data } = await axios.put(playlist.tracks.href, bodyData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    setSnapshot(data.snapshot_id);
    getPlaylistTracks(playlist);
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
          const isSelected = selectedTrack?.id === trackObj.id;
          return (
            <Track
              key={trackObj.id}
              track={trackObj}
              onTrackClick={onTrackClick}
              isSelected={isSelected}
            />
          );
        })}
      </div>
    );
  };

  const renderActionButton = () => {
    const actionTitle = backToPlaylist
      ? selectedTrack
        ? ACTIONS.NEXT
        : ACTIONS.PLAYLIST
      : ACTIONS.LOGOUT;

    const handleActionClick = backToPlaylist
      ? selectedTrack
        ? onNextClick
        : onBackToPlaylistClick
      : onLogoutClick;

    return (
      <ActionButton
        title={actionTitle}
        onClick={handleActionClick}
        authHref={!token ? AUTH_HREF : null}
      />
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
    setSnapshot(playlist.snapshot_id);
    setTitle(TITLES.TRACK);
  };

  const onTrackClick = (track) => {
    if (selectedTrack) {
      if (selectedTrack.id !== track.id) {
        setSelectedTrack(track);
        playTrackPreview(track);
      } else {
        setSelectedTrack(null);
        pauseTrackPreview();
      }
    } else {
      setSelectedTrack(track);
      playTrackPreview(track);
    }
  };

  const pauseTrackPreview = () => {
    if (soundId) {
      soundObj.pause(soundId);
    }
  };

  const playTrackPreview = (track) => {
    pauseTrackPreview();

    const sound = new Howl({
      src: [track.preview_url],
      html5: true,
      volume: 0.5,
    });

    const id = sound.play();
    setSoundId(id);
    setSoundObj(sound);
  };

  const onNextClick = () => {
    const shouldUpdatePlaylist = selectedTrack.id === tracks[1].track.id;

    pauseTrackPreview();
    if (shouldUpdatePlaylist) {
      updatePlaylistTracks(selectedPlaylist);
    } else {
      getPlaylistTracks(selectedPlaylist);
    }
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

  const renderContent = () => {
    return (
      <>
        {renderInfo()}
        {renderPlaylists()}
        {renderTracks()}
      </>
    );
  };

  return (
    <div className="wrapper">
      <div className="header">{title}</div>
      <div className="content">
        {isLoading && (
          <div className="loader-container">
            <RotatingLines
              strokeColor="grey"
              strokeWidth="5"
              animationDuration="0.75"
              width="80"
              visible={true}
            />
          </div>
        )}
        {!isLoading && renderContent()}
      </div>
      <div className="footer">{renderActionButton()}</div>
    </div>
  );
}

export default App;
