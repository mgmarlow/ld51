import { useMemo } from "react";
import { Link } from "react-router-dom";
import Store from "../Store";

const Leaderboard = () => {
  const scores = useMemo(() => new Store().topScores, []);

  return (
    <div className="max-w-prose mx-auto prose prose-invert">
      <h1>Leaderboard</h1>
      <p>Your recent scores are stored in your browser storage.</p>
      <>
        {scores.length > 0 ? (
          <ol className="text-3xl">
            {scores.map((score: number, i: number) => (
              <li key={i}>{score}</li>
            ))}
          </ol>
        ) : (
          <p>
            No recent scores found. <Link to="/play">Play a round</Link> and
            record your new highest score.
          </p>
        )}
      </>
    </div>
  );
};

export default Leaderboard;
