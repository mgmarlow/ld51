import { useMemo, useEffect, useRef, useReducer } from "react";
import { useTransition, animated } from "@react-spring/web";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getScore,
  isValidWord,
  padLeft,
  reversed,
  getRandomLetters,
  formatTime,
} from "../common";
import Store from "../Store";

const Letter = ({ value }) => {
  return (
    <div
      className="bg-slate-600 text-slate-100 rounded inline
      py-4 sm:py-8 flex justify-center items-center uppercase text-xl md:text-3xl"
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

function Game() {
  const [state, dispatch] = useReducer(reducer, getInitialState());
  const store = useMemo(() => new Store(), []);
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

      store.saveScore(state.score, state.wordsGuessed);

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
          className="md:text-3xl p-6 md:h-20 bg-zinc-800 border rounded border-slate-200 min-w-full"
          value={guess}
          onChange={handleChange}
        />
      </form>

      <div>
        <Letters letters={letterBank} />
        <div className="sm:text-xl md:text-2xl mt-2">
          🔁 {padLeft("0", shuffleCounter)}
        </div>
      </div>

      <ul className="sm:text-xl md:text-3xl max-h-60 overflow-hidden">
        {reversed(wordsGuessed).map((guess, i) => (
          <li key={i}>{guess}</li>
        ))}
      </ul>
    </div>
  );
}

export default Game;
