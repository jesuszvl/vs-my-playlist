import "./Playlist.css";

const Playlist = ({ playlist, onPlaylistClick }) => {
  return (
    <div
      className="playlist"
      key={playlist.id}
      onClick={() => onPlaylistClick(playlist)}
    >
      <img className="playlist-image" src={playlist.images[0].url} alt="" />
      <div className="playlist-info">
        <span className="playlist-title">{playlist.name}</span>
        <span className="playlist-size">{playlist.tracks.total} tracks</span>
      </div>
    </div>
  );
};

export default Playlist;
