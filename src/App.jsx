import { useState, useEffect, useReducer } from "react";
import { ToastContainer, toast } from "react-toastify";
import wordList from "../data/words.txt?raw";
import "react-toastify/dist/ReactToastify.css";

const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");

// Ordered by relative ease
const vowels = "aeiou".split("");
const consonants = "bcdfghklmnprstvwy".split("");
const extrahard = "jqxz".split("");

const hashedWordList = wordList
  .split("\n")
  // Words can be any length, just worry about matching letters
  // .filter((word) => word.length <= 7)
  .reduce((acc, cur) => {
    acc[cur.toLowerCase()] = 1;

    return acc;
  }, {});

const wordContainsOnlyLetters = (word, letters) => {
  return word.split("").findIndex((letter) => !letters.includes(letter)) === -1;
};

const isValidWord = (word, alreadyGuessed, letters) => {
  // Words can be any length, just worry about matching letters
  /* if (word.length > 7) {
   *   return [false, "Too long!"];
   * }
   */

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

// TODO: Only occasionally assign extrahard.
const getRandomLetters = () => {
  return [
    ...sample(2, vowels),
    ...sample(4, consonants),
    ...sample(1, extrahard),
  ];
};

const Letter = ({ value }) => {
  return (
    <div className="bg-slate-600 text-slate-100 rounded inline w-16 h-16 flex justify-center items-center uppercase text-3xl">
      {value}
    </div>
  );
};

const Letters = ({ letters }) => {
  return (
    <div className="flex justify-between">
      {letters.map((l) => (
        <Letter key={l} value={l} />
      ))}
    </div>
  );
};

const getScore = (word) => {
  const base = word.length;
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

function Game({ onGameOver }) {
  const [state, dispatch] = useReducer(reducer, getInitialState());
  const { score, lives, counter, guess, wordsGuessed, letterBank } = state;

  const handleChange = (e) => {
    dispatch({ type: "update_guess", payload: e.target.value });
  };

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
      onGameOver(score);
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

function App() {
  const [state, setState] = useState("menu");
  const [finalScore, setFinalScore] = useState(100);

  const handleClick = () => {
    setState("play");
  };

  const handleGameOver = (score) => {
    setState("game_over");
    setFinalScore(score);
  };

  const content = (() => {
    switch (state) {
      case "play":
        return <Game onGameOver={handleGameOver} />;

      case "game_over":
        return (
          <div className="prose prose-xl prose-invert">
            <h2>Game over.</h2>
            <p>Your final score was +{finalScore}.</p>
            <button className="font-bold" onClick={handleClick}>
              Try again?
            </button>
          </div>
        );

      case "menu":
        return (
          <div className="prose prose-xl prose-invert">
            <h1>Shuffle Hussle</h1>

            <h2>How to play</h2>

            <p>
              Enter as many words as you can using only the letters shown on
              screen. Each word is worth an amount of score based on its length.
            </p>
            <ul>
              <li>The letters shuffle randomly every 10 seconds.</li>
              <li>
                If the letters shuffle and you haven't submitted a word, game
                over!
              </li>
              <li>No duplicate words allowed.</li>
            </ul>

            <button
              className="border rounded py-2 px-8 font-bold"
              onClick={handleClick}
            >
              Start
            </button>
          </div>
        );
    }
  })();

  return (
    <div>
      <div className="max-w-prose mx-auto my-10">{content}</div>

      <ToastContainer position="bottom-left" theme="dark" />
    </div>
  );
}

export default App;
