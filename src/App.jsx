import { useEffect, useRef, useReducer } from "react";
import {
  useNavigate,
  useLocation,
  Routes,
  Route,
  Link,
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

const formatTime = (sec) => `00:00:${sec > 9 ? sec : "0" + sec}`;

const getInitialState = () => ({
  state: "play",
  score: 0,
  counter: 10,
  lives: 1,
  guess: "",
  letterBank: getRandomLetters(),
  wordsGuessed: [],
  wordsGuessedThisCycle: 0,
});

const reducer = (state, action) => {
  switch (action.type) {
    case "log_valid_guess":
      return {
        ...state,
        guess: "",
        score: state.score + getScore(action.payload),
        wordsGuessed: state.wordsGuessed.concat(action.payload),
        wordsGuessedThisCycle: state.wordsGuessedThisCycle + 1,
      };

    case "tick":
      const newCount = state.counter - 1;

      if (newCount === 0) {
        return {
          ...state,
          counter: 10,
          letterBank: getRandomLetters(),
          lives:
            state.wordsGuessedThisCycle > 0 ? state.lives : state.lives - 1,
          wordsGuessedThisCycle: 0,
        };
      } else {
        return { ...state, counter: state.counter - 1 };
      }

    case "update_guess":
      return { ...state, guess: action.payload };

    default:
      console.error("invalid action");
      return state;
  }
};

function Game() {
  const [state, dispatch] = useReducer(reducer, getInitialState());
  const navigate = useNavigate();
  const inputRef = useRef();
  const { score, lives, counter, guess, wordsGuessed, letterBank } = state;

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

  useEffect(() => {
    if (lives === 0) {
      navigate("/gameover", { state: score });
    }
  }, [lives]);

  useEffect(() => {});

  const handleSubmit = (e) => {
    e.preventDefault();

    const [valid, error] = isValidWord(guess, wordsGuessed, letterBank);
    if (valid) {
      dispatch({ type: "log_valid_guess", payload: guess });
    } else {
      toast.error(error);
    }
  };

  return (
    <div className="space-y-2">
      <div className="text-6xl">{formatTime(counter)}</div>

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
      </div>
    </div>
  );
}

function GameOver() {
  const { state: finalScore } = useLocation();
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/play");
  };

  return (
    <div className="prose prose-xl prose-invert">
      <h2>Game over.</h2>
      <p>Your finished with a final score of:</p>
      <p className="text-6xl">+{finalScore}</p>
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
        Enter as many words as you can using only the letters shown on screen.
        Each word is worth an amount of score based on its length.
      </p>
      <ul>
        <li>The letters shuffle randomly every 10 seconds.</li>
        <li>
          If the letters shuffle and you haven't submitted a word, game over!
        </li>
        <li>No duplicate words allowed.</li>
        <li>Earn more points for encorporating harder letters.</li>
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
            Shuffle Hussle
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
              Shuffle Hussle
            </Link>
            . a ld51 game by{" "}
            <a className="font-bold" href="https://mgmarlow.com">
              Graham Marlow
            </a>
          </div>
        </footer>
      </div>

      <ToastContainer position="bottom-left" theme="dark" />
    </div>
  );
}

export default App;
