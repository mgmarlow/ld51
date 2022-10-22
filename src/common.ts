import wordList from "../data/words.txt?raw";

const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
// Ordered by relative ease
const vowels = "aeiou".split("");
const consonants = "bcdfghklmnprsty".split("");
const extrahard = "vwjqxz".split("");

export const reversed = (arr: string[]) => arr.slice().reverse();

const sample = (n: number, arr: any[]) => {
  const rst = [];
  const cp = arr.slice();

  for (let i = 0; i < n; i++) {
    const index = Math.floor(Math.random() * cp.length);
    const letter = cp.splice(index, 1)[0];
    rst.push(letter);
  }

  return rst;
};

const hashedWordList = wordList
  .split("\n")
  .reduce((acc: Record<string, number>, cur: string) => {
    acc[cur.toLowerCase()] = 1;

    return acc;
  }, {});

const wordContainsOnlyLetters = (word: string, letters: string[]) => {
  return word.split("").findIndex((letter) => !letters.includes(letter)) === -1;
};

export const getScore = (word: string) => {
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

export const isValidWord = (
  word: string,
  alreadyGuessed: string[],
  letters: string[]
) => {
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

export const padLeft = (pad: string, n: number) => {
  const str = n.toString();
  return str.length > 1 ? str : `${pad}${str}`;
};

export const formatTime = (sec: number) => {
  const minutes = Math.floor(sec / 60);
  const seconds = sec % 60;

  return `00:${padLeft("0", minutes)}:${padLeft("0", seconds)}`;
};

export const getRandomLetters = (): string[] => {
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
