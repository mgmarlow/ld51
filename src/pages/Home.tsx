import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/play");
  };

  return (
    <div className="max-w-prose mx-auto prose prose-invert">
      <h2>How to play</h2>

      <p>
        Enter as many words as you can using only the displayed letters. Once
        the timer runs out, you're toast! Luckily every word you submit gives
        you a tiny bit more breathing room.
      </p>
      <p>What's the highest score you can reach?</p>
      <ul>
        <li>The game is over once the countdown timer hits 0.</li>
        <li>
          Each new word extends the countdown timer (longer words buy you more
          time).
        </li>
        <li>The letter bank shuffles randomly every 10 seconds.</li>
        <li>Words must be two or more letters.</li>
        <li>No duplicate words allowed (duplicate letters are fine).</li>
      </ul>

      <button
        className="border rounded mt-4 py-3 px-8 font-bold text-2xl"
        onClick={handleClick}
      >
        Play
      </button>
    </div>
  );
}

export default Home;
