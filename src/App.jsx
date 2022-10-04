import { useEffect, useRef, useReducer } from "react";
import { useTransition, animated } from "@react-spring/web";
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
  if (word.length < 2) {
    return [false, "Words must be two or more letters."];
  }

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
    <div
      className="bg-slate-600 text-slate-100 rounded inline
      py-4 sm:py-8 flex justify-center items-center uppercase text-3xl"
    >
      {value}
    </div>
  );
};

const Letters = ({ letters }) => {
  const transitions = useTransition(letters, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
  });

  const content = transitions((style, item) => (
    <animated.div className="flex-grow" style={style}>
      <Letter value={item} />
    </animated.div>
  ));

  return (
    <div className="flex justify-between space-x-4 sm:space-x-8">{content}</div>
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
    <div className="max-w-prose mx-auto space-y-10">
      <div className="flex flex-col sm:flex-row justify-between items-center">
        <Timer timeRemaining={timeRemaining} />
        <div className="text-2xl">+{score}</div>
      </div>

      <form onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          className="text-3xl p-6 h-20 bg-zinc-800 border rounded border-slate-200 min-w-full"
          value={guess}
          onChange={handleChange}
        />
      </form>

      <div>
        <Letters letters={letterBank} />
        <div className="text-2xl mt-2">🔁 {padLeft("0", shuffleCounter)}</div>
      </div>

      <ul className="text-3xl max-h-60 overflow-hidden">
        {reversed(wordsGuessed).map((guess, i) => (
          <li key={i}>{guess}</li>
        ))}
      </ul>
    </div>
  );
}

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

function App() {
  return (
    <div className="flex flex-col h-screen justify-between">
      <header className="p-4">
        <div className="max-w-prose mx-auto flex items-center space-x-4">
          <Link className="text-2xl text-slate-100 font-bold" to="/">
            Shuffle Hustle
          </Link>
          <Link to="/">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6"
            >
              <path
                fillRule="evenodd"
                d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 01-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.324 1.513 3.518 0 4.842a3.75 3.75 0 01-.837.552c-.676.328-1.028.774-1.028 1.152v.75a.75.75 0 01-1.5 0v-.75c0-1.279 1.06-2.107 1.875-2.502.182-.088.351-.199.503-.331.83-.727.83-1.857 0-2.584zM12 18a.75.75 0 100-1.5.75.75 0 000 1.5z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        </div>
      </header>

      <div className="container mx-auto my-10 p-2 flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/play" element={<Game />} />
          <Route path="/gameover" element={<GameOver />} />
          <Route path="*" element={<Home />} />
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

      <ToastContainer
        position="top-center"
        autoClose="1000"
        hideProgressBar={true}
        theme="dark"
        limit={3}
      />
    </div>
  );
}

export default App;
