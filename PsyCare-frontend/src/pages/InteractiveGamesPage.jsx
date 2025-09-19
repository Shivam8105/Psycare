import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import musicBackground from "@/assets/music_bg.jpg"; // relaxing music background

// Hardcoded list of games with links to embeddable sources
const games = [
  {
    title: "Maze Puzzle",
    description: "Navigate a maze by staying calm and focused.",
    game_url: "/games/mindful_maze_game.html",
  },
  {
    title: "Jigsaw Puzzle",
    description: "A simple puzzle game to calm your mind.",
    game_url: "/games/jigsaw_puzzle_game.html",
  },
  {
    title: "Save Your Snake",
    description: "Eat food, grow your snake, but don’t hit the walls!",
    game_url: "/games/snake_game.html",
  },
  {
    title: "Tic-Tac-Toe",
    description: "Play Tic-Tac-Toe with dynamic board sizes (3x3, 4x4, 5x5).",
    game_url: "/games/tictactoe.html", // ✅ your new game file
  },
  {
    title: "Rock Paper Scissors",
    description: "Challenge the computer in a classic Rock-Paper-Scissors game.",
    game_url: "/games/rock_paper_scissors.html", // ✅ add your HTML file here
  },
];

export default function InteractiveGamesPage() {
  const { title } = useParams();
  const [currentGameUrl, setCurrentGameUrl] = useState(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const headerRef = useRef(null);

  // Detect header height dynamically
  useEffect(() => {
    const headerEl = document.querySelector("header"); // Assuming your header is <header>
    if (headerEl) {
      setHeaderHeight(headerEl.offsetHeight);

      const resizeObserver = new ResizeObserver(() => {
        setHeaderHeight(headerEl.offsetHeight);
      });
      resizeObserver.observe(headerEl);

      return () => resizeObserver.disconnect();
    }
  }, []);

  const handlePlayGame = (url) => {
    setCurrentGameUrl(url);
  };

  const handleGoBack = () => {
    setCurrentGameUrl(null);
  };

  return (
    <div
      className={`relative ${
        currentGameUrl
          ? "min-h-screen bg-black"
          : "min-h-screen py-12 px-4 bg-cover bg-center bg-fixed"
      }`}
      style={currentGameUrl ? {} : { backgroundImage: `url(${musicBackground})` }}
    >
      {currentGameUrl && (
        <div
          className="relative z-[50] w-full"
          style={{ height: `calc(100vh - ${headerHeight}px)` }}
        >
          {/* Floating Back Button */}
          <button
            onClick={handleGoBack}
            className="absolute top-4 left-4 z-[60] bg-white/90 text-gray-800 px-5 py-2 rounded-full shadow-lg hover:bg-violet-500 hover:text-white transition-colors"
          >
            ← Back to Games List
          </button>

          {/* Game Iframe */}
          <iframe
            src={currentGameUrl}
            title="Interactive Game"
            className="w-full h-full"
            allowFullScreen
            frameBorder="0"
          ></iframe>
        </div>
      )}

      {currentGameUrl === null && (
        <>
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-1"></div>
          <div className="relative z-20 mx-auto max-w-5xl">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-10 text-center font-poppins drop-shadow-lg">
              {title}
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {games.map((game, index) => (
                <div
                  key={index}
                  className="
                    bg-white/80 backdrop-blur-md border border-white/30
                    rounded-3xl shadow-md hover:shadow-2xl
                    transition-all hover:-translate-y-1
                    flex flex-col justify-between p-6
                  "
                >
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {game.title}
                    </h2>
                    <p className="text-sm text-gray-700 mt-2">{game.description}</p>
                  </div>
                  <button
                    onClick={() => handlePlayGame(game.game_url)}
                    className="mt-4 px-6 py-2 bg-gradient-to-r from-violet-400 to-purple-400 text-white rounded-full shadow-lg hover:from-violet-500 hover:to-purple-500 transition-colors"
                  >
                    Play
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}