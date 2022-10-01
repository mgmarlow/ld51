import { useEffect, useRef, useReducer } from "react";
import {
  useNavigate,
  useLocation,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import wordList from "../data/words.txt?raw";
import "react-toastify/dist/ReactToastify.css";

const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
// Ordered by relative ease
const vowels = "aeiou".split("");
const consonants = "bcdfghklmnprsty".split("");
const extrahard = "vwjqxz".split("");

const hashedWordList = wordList.split("\n").reduce((acc, cur) => {
  acc[cur.toLowerCase()] = 1;

  return acc;
}, {});

const wordContainsOnlyLetters = (word, letters) => {
  return word.split("").findIndex((letter) => !letters.includes(letter)) === -1;
};

const isValidWord = (word, alreadyGuessed, letters) => {
  if (alreadyGuessed.includes(word)) {
    return [false, "Already guessed!"];
  }

  if (!wordContainsOnlyLetters(word, letters)) {
    return [false, "Word includes invalid letters."];
  }

  if (!!hashedWordList[word]) {
    return [true];
  } else {
    return [false, "Unknown word."];
  }
};

const sample = (n, arr) => {
  const rst = [];
  const cp = arr.slice();

  for (let i = 0; i < n; i++) {
    const index = Math.floor(Math.random() * cp.length);
    const letter = cp.splice(index, 1)[0];
    rst.push(letter);
  }

  return rst;
};

const getRandomLetters = () => {
  // Guarantee 1 vowel and 2 consonants
  const base = [...sample(1, vowels), ...sample(2, consonants)];

  return base.concat(
    // Grab two remaining letters totally randomly
    sample(
      2,
      alphabet.filter((l) => !base.includes(l))
    )
  );
};

const Letter = ({ value }) => {
  return (
    <div className="bg-slate-600 text-slate-100 rounded inline w-20 h-20 flex justify-center items-center uppercase text-3xl">
      {value}
    </div>
  );
};

const Letters = ({ letters }) => {
  return (
    <div className="flex justify-between space-x-4">
      {letters.map((l) => (
        <Letter key={l} value={l} />
      ))}
    </div>
  );
};

const getScore = (word) => {
  const base = word.split("").reduce((acc, cur) => {
    if (extrahard.includes(cur)) {
      return acc + 10;
    } else {
      return acc + 1;
    }
  }, 0);

  if (word.length > 5) {
    return base + 5;
  }

  return base;
};

const reversed = (arr) => arr.slice().reverse();

const padLeft = (pad, n) => {
  const str = n.toString();
  return str.length > 1 ? str : `${pad}${str}`;
};

const formatTime = (sec) => {
  const minutes = Math.floor(sec / 60);
  const seconds = sec % 60;

  return `00:${padLeft("0", minutes)}:${padLeft("0", seconds)}`;
};

const getInitialState = () => ({
  state: "play",
  score: 0,
  shuffleCounter: 10,
  timeRemaining: 30,
  guess: "",
  letterBank: getRandomLetters(),
  wordsGuessed: [],
});

const reducer = (state, action) => {
  switch (action.type) {
    case "log_valid_guess":
      return {
        ...state,
        guess: "",
        timeRemaining: state.timeRemaining + action.payload.length,
        score: state.score + getScore(action.payload),
        wordsGuessed: state.wordsGuessed.concat(action.payload),
      };

    case "tick":
      const newCount = state.shuffleCounter - 1;
      const newTimeRemaining = state.timeRemaining - 1;

      if (newCount === 0) {
        return {
          ...state,
          shuffleCounter: 10,
          letterBank: getRandomLetters(),
          timeRemaining: newTimeRemaining,
        };
      } else {
        return {
          ...state,
          shuffleCounter: state.shuffleCounter - 1,
          timeRemaining: newTimeRemaining,
        };
      }

    case "update_guess":
      const guess = action.payload.trim().toLowerCase();
      return { ...state, guess };

    default:
      console.error("invalid action");
      return state;
  }
};

const Timer = ({ timeRemaining }) => {
  let color = "text-slate-200";

  if (timeRemaining < 10) {
    color = "text-red-500";
  }

  if (timeRemaining > 30) {
    color = "text-green-500";
  }

  return <div className={`text-7xl ${color}`}>{formatTime(timeRemaining)}</div>;
};

function Game() {
  const [state, dispatch] = useReducer(reducer, getInitialState());
  const inputRef = useRef();
  const {
    score,
    timeRemaining,
    shuffleCounter,
    guess,
    wordsGuessed,
    letterBank,
  } = state;

  const handleChange = (e) => {
    dispatch({ type: "update_guess", payload: e.target.value });
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // TODO: Add letter flash on re-render
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: "tick" });
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  if (timeRemaining === 0) {
    return <Navigate to="/gameover" state={{ score, wordsGuessed }} />;
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    const [valid, error] = isValidWord(guess, wordsGuessed, letterBank);
    if (valid) {
      if (guess.length >= 5) {
        toast.success("SPECTACULAR WORD!");
      }

      if (guess.includes("z") || guess.includes("q") || guess.includes("j")) {
        toast.success("NICE JOB!");
      }

      dispatch({ type: "log_valid_guess", payload: guess });
    } else {
      toast.error(error);
      dispatch({ type: "update_guess", payload: "" });
    }
  };

  return (
    <div className="space-y-2">
      <Timer timeRemaining={timeRemaining} />

      <div className="flex justify-between items-center">
        <div>
          <ul className="text-3xl h-28 overflow-hidden">
            {reversed(wordsGuessed).map((guess, i) => (
              <li key={i}>{guess}</li>
            ))}
          </ul>
        </div>
        <div className="text-6xl">+{score}</div>
      </div>

      <div>
        <form className="my-6" onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            className="text-3xl p-6 h-20 bg-zinc-800 border rounded border-slate-200 min-w-full"
            value={guess}
            onChange={handleChange}
          />
        </form>

        <Letters letters={letterBank} />
        <div className="text-2xl mt-2">🔁 {padLeft("0", shuffleCounter)}</div>
      </div>
    </div>
  );
}

function GameOver() {
  const { state } = useLocation();
  const { score: finalScore, wordsGuessed } = state || {};
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/play");
  };

  return (
    <div className="prose prose-xl prose-invert">
      <h2>Game over.</h2>
      <p>Your finished with a final score of:</p>
      <p className="text-6xl">+{finalScore}</p>
      <p>You guessed: {wordsGuessed.join(", ")}.</p>
      <button className="font-bold" onClick={handleClick}>
        Try again?
      </button>
    </div>
  );
}

function Home() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/play");
  };

  return (
    <div className="prose prose-invert">
      <h2>How to play</h2>

      <p>
        Enter as many words as you can using only the displayed letters. Once
        the timer runs out, you're toast! Luckily every word you submit gives
        you a tiny bit more breathing room.
      </p>
      <p>What's the highest score you can reach?</p>
      <ul>
        <li>The game is over once the countdown timer hits 0.</li>
        <li>Each new word extends the countdown timer.</li>
        <li>The letter bank shuffles randomly every 10 seconds.</li>
        <li>No duplicates allowed!</li>
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

function App() {
  return (
    <div>
      <div className="flex flex-col justify-between min-h-screen">
        <div className="max-w-prose mx-auto my-10">
          <h1 className="text-2xl mb-10 text-slate-100 font-bold">
            Shuffle Hustle
          </h1>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/play" element={<Game />} />
            <Route path="/gameover" element={<GameOver />} />
          </Routes>
        </div>

        <footer className="p-12">
          <div className="max-w-prose mx-auto">
            <Link className="font-bold" to="/">
              Shuffle Hustle
            </Link>
            . A{" "}
            <a className="font-bold" href="https://ldjam.com/">
              ld51
            </a>{" "}
            game by{" "}
            <a className="font-bold" href="https://mgmarlow.com">
              Graham Marlow
            </a>
          </div>
        </footer>
      </div>

      <ToastContainer
        position="top-center"
        autoClose="1500"
        hideProgressBar={true}
        theme="dark"
      />
    </div>
  );
}

export default App;
