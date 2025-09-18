import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import heroBackground from '@/assets/hero-illustration.jpg';

// Hardcoded list of games with links to embeddable sources
const games = [
  {
    title: "Mindful Maze",
    description: "Navigate a maze by staying calm and focused. Lose focus, and the walls disappear.",
    game_url: "/games/mindful_maze_game.html"
  },
  {
    title: "Jigsaw Puzzle",
    description: "A simple puzzle game to calm your mind.",
    game_url: "/games/jigsaw_puzzle_game.html"
  },
  {
    title: "Classic Tetris",
    description: "A fun and challenging game to improve your focus and concentration.",
    game_url: "https://tetris.com/play-tetris"
  },
  {
    title: "Jungle Bubble Shooter",
    description: "A classic puzzle game that helps with focus and timing.",
    game_url: "https://poki.com/en/g/jungle-bubble-shooter-mania?embed=1"
  },
  {
    title: "Brain Test",
    description: "A calming tile-matching game that sharpens your mind.",
    game_url: "https://poki.com/en/g/brain-test-tricky-puzzles"
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
      className={`relative ${currentGameUrl ? 'min-h-screen bg-black' : 'min-h-screen py-12 px-4 bg-gray-50 bg-cover bg-center bg-fixed'}`}
      style={currentGameUrl ? {} : { backgroundImage: `url(${heroBackground})` }}
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
          <div className="relative z-20 mx-auto max-w-4xl">
            <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">{title}</h1>
            <div className="space-y-6">
              {games.map((game, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-lg p-6 flex justify-between items-center transition-transform hover:scale-105"
                >
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">{game.title}</h2>
                    <p className="text-sm text-gray-600 mt-1">{game.description}</p>
                  </div>
                  <button
                    onClick={() => handlePlayGame(game.game_url)}
                    className="bg-violet-500 text-white px-6 py-2 rounded-full shadow-lg hover:bg-violet-600 transition-colors"
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
