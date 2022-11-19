import { useState } from "react";
import "./Track.css";

const Track = ({ track, onTrackClick }) => {
  const [isSelected, setIsSelected] = useState(false);

  const handleClick = () => {
    setIsSelected(!isSelected);
    //onTrackClick(track)
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
        <p className="track-artist">{track.artists[0].name}</p>
        <p className="track-artist">{track.popularity}</p>
      </div>
    </div>
  );
};

export default Track;
