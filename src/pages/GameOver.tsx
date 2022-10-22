import { Link, useLocation } from "react-router-dom";

function GameOver() {
  const { state } = useLocation();
  const { score: finalScore, wordsGuessed } = state || {
    score: 0,
    wordsGuessed: [],
  };

  return (
    <>
      <div className="max-w-prose mx-auto prose prose-invert">
        <div className="text-xl">
          <h1>Game over.</h1>
          <p>Your finished with a final score of:</p>
          <p className="text-6xl">+{finalScore}</p>
          {wordsGuessed.length > 0 && (
            <p>You guessed: {wordsGuessed.join(", ")}.</p>
          )}
        </div>

        <div className="text-xl mb-4">
          <Link className="font-bold" to="/play">
            Try again?
          </Link>
        </div>

        <div className="text-xl">
          <Link to="/scores">View scores</Link>
        </div>
      </div>
    </>
  );
}

export default GameOver;
