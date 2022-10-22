import { Routes, Route, Link } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Home from "./pages/Home";
import GameOver from "./pages/GameOver";
import Game from "./pages/Game";
import Leaderboard from "./pages/Leaderboard";

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
          <Link to="/scores">Scores</Link>
        </div>
      </header>

      <div className="container mx-auto my-10 p-2 flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/play" element={<Game />} />
          <Route path="/gameover" element={<GameOver />} />
          <Route path="/scores" element={<Leaderboard />} />
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
