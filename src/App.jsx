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
    return [false, "Words can only contain displayed letters."];
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

const Letters = ({ letters }) => {
  return <div>{letters.join(", ")}</div>;
};

const reducer = (state, action) => {
  switch (action.type) {
    case "log_valid_guess":
      return {
        ...state,
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

const initialState = {
  state: "play",
  counter: 10,
  lives: 3,
  guess: "",
  letterBank: getRandomLetters(),
  wordsGuessed: [],
  wordsGuessedThisCycle: 0,
};

function Game() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { lives, counter, guess, wordsGuessed, letterBank } = state;

  const handleChange = (e) => {
    dispatch({ type: "update_guess", payload: e.target.value });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: "tick" });
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

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
    <div>
      <div>
        {lives}, {counter}
      </div>

      <div className="flex">
        <div>
          <h3>Guessed list</h3>
          <ul>
            {wordsGuessed.map((guess) => (
              <li key={guess}>{guess}</li>
            ))}
          </ul>
        </div>

        <div>
          <form onSubmit={handleSubmit}>
            <input className="border" value={guess} onChange={handleChange} />
          </form>

          <Letters letters={letterBank} />
        </div>
      </div>

      <ToastContainer />
    </div>
  );
}

function App() {
  const [begin, setBegin] = useState(false);

  const handleClick = () => {
    setBegin(true);
  };

  if (begin) {
    return <Game />;
  }

  return (
    <div>
      How to play: ...
      <button onClick={handleClick}>Start</button>
    </div>
  );
}

export default App;
