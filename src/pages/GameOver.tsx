import { useLocation, useNavigate } from "react-router-dom";

function GameOver() {
  const { state } = useLocation();
  const { score: finalScore, wordsGuessed } = state || {
    score: 0,
    wordsGuessed: [],
  };
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/play");
  };

  return (
    <div className="max-w-prose mx-auto prose prose-invert">
      <h1>Game over.</h1>
      <p>Your finished with a final score of:</p>
      <p className="text-6xl">+{finalScore}</p>

      {wordsGuessed.length > 0 && (
        <p>You guessed: {wordsGuessed.join(", ")}.</p>
      )}

      <button className="font-bold" onClick={handleClick}>
        Try again?
      </button>
    </div>
  );
}

export default GameOver;
