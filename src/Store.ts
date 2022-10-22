const STORAGE_KEY = "scores";
const MAX_SCORES = 10;

class Store {
  id: number;
  _scores: Record<number, { score: number; nWordsGuessed: number }> = {};

  constructor() {
    this.id = this.createSessionId();

    try {
      this._scores =
        JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") || {};
    } catch (e) {
      this._scores = {};
    }
  }

  createSessionId(): number {
    return Math.floor(new Date().getTime() / 1000);
  }

  saveScore(score: number, wordsGuessed: string[]) {
    this._scores[this.id] = {
      score,
      nWordsGuessed: wordsGuessed.length,
    };
    this.saveScores();
  }

  get topScores() {
    return Object.entries(this._scores)
      .map(([_, v]) => v.score)
      .sort((a, b) => b - a)
      .slice(0, MAX_SCORES);
  }

  toJson() {
    return JSON.stringify(this._scores);
  }

  saveScores() {
    localStorage.setItem(STORAGE_KEY, this.toJson());
  }
}

export default Store;
