import "./Track.css";

const Track = ({ track, onTrackClick, isSelected }) => {
  const handleClick = () => {
    onTrackClick(track);
  };

  const getArtistsName = () => {
    const artists = track.artists.map((artist) => {
      return artist.name;
    });
    return artists.join(", ");
  };

  return (
    <div
      className={isSelected ? "track-selected" : "track"}
      onClick={handleClick}
    >
      <img
        className="track-image"
        src={track.album.images[0].url}
        alt={track.name}
      />
      <div className="track-info">
        <p className="track-name">{track.name}</p>
        <p className="track-artist">{getArtistsName()}</p>
        <p className="track-popularity">{track.popularity}%</p>
      </div>
    </div>
  );
};

export default Track;
