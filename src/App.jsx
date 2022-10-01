import { useState, useEffect, useMemo } from "react";
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

const isValidWord = (word, alreadyGuessed, letters, _specialLetter) => {
  // Words can be any length, just worry about matching letters
  /* if (word.length > 7) {
   *   return [false, "Too long!"];
   * }
   */

  if (alreadyGuessed.includes(word)) {
    return [false, "Already guessed!"];
  }

  // TOO HARD!
  // if (!word.includes(specialLetter)) {
  //   return [false, `Missing special letter: ${specialLetter}.`];
  // }

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

const Letters = ({ letters, specialLetter }) => {
  return (
    <div>
      {letters.map((l) => (l === specialLetter ? `(${l})` : l)).join(", ")}
    </div>
  );
};

function App() {
  const [count, setCount] = useState(10);
  const [letterBank, setLetterBank] = useState(getRandomLetters);
  const [text, setText] = useState("");
  const [lives, setLives] = useState(3);
  const [wordsGuessed, setWordsGuessed] = useState([]);
  const [wordsGuessedThisCycle, setWordsGuessedThisCycle] = useState(0);

  const specialLetter = useMemo(() => {
    return undefined;
    // TOO HARD!
    // return sample(1, letterBank)[0];
  }, [letterBank]);

  const handleChange = (e) => {
    setText(e.target.value);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((count) => count - 1);
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (count === 0) {
      setCount(10);
      setLetterBank(getRandomLetters());
      if (wordsGuessedThisCycle === 0) {
        setLives((lives) => lives - 1);
      }
      setWordsGuessedThisCycle(0);
    }
  }, [count]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const [valid, error] = isValidWord(
      text,
      wordsGuessed,
      letterBank,
      specialLetter
    );
    if (valid) {
      setWordsGuessed((words) => words.concat(text));
      setWordsGuessedThisCycle((n) => n + 1);
    } else {
      toast.error(error);
    }
  };

  return (
    <div>
      <div>
        {lives}, {count}
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
            <input className="border" value={text} onChange={handleChange} />
          </form>

          <Letters letters={letterBank} specialLetter={specialLetter} />
        </div>
      </div>

      <ToastContainer />
    </div>
  );
}

export default App;
