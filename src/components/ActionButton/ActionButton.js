import "./ActionButton.css";

const ActionButton = ({ onClick, title, authHref }) => {
  return (
    <div className="button-container">
      {authHref ? (
        <a href={authHref} className="spotify-login">
          Login with Spotify
        </a>
      ) : (
        <button className="button" onClick={onClick}>
          {title}
        </button>
      )}
    </div>
  );
};

export default ActionButton;
