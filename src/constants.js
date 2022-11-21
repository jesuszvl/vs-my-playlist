export const TITLES = {
  NAME: "Vs My Playlist",
  PLAYLIST: "Pick a playlist",
  TRACK: "Tap to hear a preview",
};

export const ACTIONS = {
  NEXT: "Pick song",
  LOGOUT: "Logout",
  PLAYLIST: "Back to playlist",
};

export const MINIMUM_PLAYLIST_SIZE = 10;

const isDevelopment = process.env.NODE_ENV === "development";

const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const CLIENT_ID = "ad1d9256da1648fe842417e4533e59e8";
const REDIRECT_URI = isDevelopment
  ? "http://localhost:3000"
  : "https://jesuszvl.github.io/vs-my-playlist/";
const RESPONSE_TYPE = "token";
const SCOPE = encodeURIComponent(
  "playlist-read-private playlist-modify-private playlist-modify-public"
);

export const AUTH_HREF = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`;
