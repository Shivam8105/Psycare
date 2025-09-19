import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { FaPlay, FaPause, FaStop } from "react-icons/fa";
import music_bg from "@/assets/music_bg.jpg";

// same audio array
const allAudios = [
  {
    track_title: "Peaceful Piano Lullaby",
    description: "A gentle tune to soothe the mind and prepare for rest.",
    duration: "3:45",
    file_url: "/audio/a1.mp3",
    genre: "Meditative",
  },
  {
    track_title: "Soft Moonlight Sonata",
    description: "A serene melody perfect for late-night relaxation.",
    duration: "4:15",
    file_url: "/audio/a2.mp3",
    genre: "Relaxing",
  },
  {
    track_title: "Morning Dewdrops",
    description: "Light and airy notes to bring a sense of calm.",
    duration: "5:02",
    file_url: "/audio/a3.mp3",
    genre: "Uplifting",
  },
  {
    track_title: "Nuvole Bianche",
    description: "A gentle tune to soothe the mind and prepare for rest.",
    duration: "3:45",
    file_url: "/audio/a4.mp3",
    genre: "Meditative",
  },
  {
    track_title: "River Flows in You",
    description: "A serene melody perfect for late-night relaxation.",
    duration: "4:15",
    file_url: "/audio/a5.mp3",
    genre: "Relaxing",
  },
];

const genreTags = ["All", "Meditative", "Relaxing", "Uplifting"];

export default function AudioLibraryPage() {
  const { title } = useParams();
  const [audioPlayer, setAudioPlayer] = useState(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedTag, setSelectedTag] = useState("All");

  // NEW: track progress
  const [progress, setProgress] = useState(0); // in seconds
  const [duration, setDuration] = useState(0);

  const [visibleAudios, setVisibleAudios] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef(null);

  const fetchAudios = (selectedTag, currentPage) => {
    setLoading(true);
    const filteredList =
      selectedTag === "All"
        ? allAudios
        : allAudios.filter((audio) => audio.genre === selectedTag);

    const newItems = filteredList.slice(0, currentPage * 5);

    setTimeout(() => {
      setVisibleAudios(newItems);
      setHasMore(newItems.length < filteredList.length);
      setLoading(false);
    }, 400);
  };

  useEffect(() => {
    setPage(1);
    setVisibleAudios([]);
    setHasMore(true);
    fetchAudios(selectedTag, 1);
  }, [selectedTag]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      },
      { threshold: 1.0 }
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [loading, hasMore]);

  useEffect(() => {
    if (page > 1) fetchAudios(selectedTag, page);
  }, [page]);
  
  const handlePlayPause = (file_url) => {
    if (audioPlayer && currentTrack === file_url) {
      if (isPlaying) {
        audioPlayer.pause();
        setIsPlaying(false);
      } else {
        audioPlayer.play();
        setIsPlaying(true);
      }
    } else {
      if (audioPlayer) audioPlayer.pause();
      const newPlayer = new Audio(file_url);
      newPlayer.loop = true;
      // NEW: set duration when loaded
      newPlayer.addEventListener("loadedmetadata", () => {
        setDuration(newPlayer.duration);
      });
      // NEW: update progress continuously
      newPlayer.addEventListener("timeupdate", () => {
        setProgress(newPlayer.currentTime);
      });
      newPlayer.play();
      setAudioPlayer(newPlayer);
      setCurrentTrack(file_url);
      setIsPlaying(true);
    }
  };

  const handleStop = () => {
    if (audioPlayer) {
      audioPlayer.pause();
      // NOTE: do NOT reset currentTime to 0 so it resumes where stopped
      setIsPlaying(false);
    }
  };

  // NEW: handle progress bar change
  const handleSeek = (e) => {
    if (audioPlayer) {
      const newTime = e.target.value;
      audioPlayer.currentTime = newTime;
      setProgress(newTime);
    }
  };

  useEffect(() => {
    return () => {
      if (audioPlayer) audioPlayer.pause();
    };
  }, [audioPlayer]);

  return (
    <div
      className="min-h-screen relative p-4 bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url(${music_bg})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/40 to-white/10 backdrop-blur-sm z-0"></div>

      <div className="relative z-10 mx-auto py-14 px-2 sm:px-6 lg:px-8 max-w-6xl">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-10 text-center ">
          {title}
        </h1>

        <div className="flex justify-center flex-wrap gap-3 mb-12">
          {genreTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-5 py-2 rounded-full text-sm font-medium shadow-sm backdrop-blur-md
                transition-all duration-300 ${
                  selectedTag === tag
                    ? "bg-gradient-primary text-white shadow-violet-200"
                    : "bg-white/70 text-gray-900 hover:bg-white"
                }`}
            >
              {tag}
            </button>
          ))}
        </div>

        <div className="space-y-7">
          {visibleAudios.map((audio, index) => (
            <div
              key={index}
              className="
                rounded-3xl p-6 shadow-md hover:shadow-2xl 
                bg-white/80 backdrop-blur-md border border-white/30
                transition-all hover:-translate-y-1
                flex flex-col gap-4
              "
            >
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div className="max-w-md">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {audio.track_title}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">{audio.description}</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handlePlayPause(audio.file_url)}
                    className={`p-3 rounded-full transition-colors shadow
                      ${
                        currentTrack === audio.file_url && isPlaying
                          ? "bg-orange-500 hover:bg-orange-600 text-white"
                          : "bg-gradient-primary hover:from-violet-500 hover:to-purple-500 text-white"
                      }`}
                  >
                    {currentTrack === audio.file_url && isPlaying ? (
                      <FaPause />
                    ) : (
                      <FaPlay />
                    )}
                  </button>
                  <button
                    onClick={handleStop}
                    className="p-3 rounded-full bg-gray-50 text-gray-700 hover:bg-gray-200 transition-colors shadow"
                  >
                    <FaStop />
                  </button>
                </div>
              </div>

              {/* NEW progress bar */}
              {currentTrack === audio.file_url && (
                <input
                  type="range"
                  min="0"
                  max={duration}
                  step="0.1"
                  value={progress}
                  onChange={handleSeek}
                  className="w-full accent-violet-500 cursor-pointer"
                />
              )}
            </div>
          ))}
        </div>

        <div ref={loaderRef} className="text-center py-8">
          {loading && <p className="text-gray-600">Loading more audios...</p>}
        </div>

        {!hasMore && !loading && (
          <p className="text-center text-gray-500 text-sm">
            You've reached the end of the list.
          </p>
        )}
      </div>
    </div>
  );
}