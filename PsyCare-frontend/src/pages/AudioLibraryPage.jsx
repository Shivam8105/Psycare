import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { FaPlay, FaPause, FaStop } from "react-icons/fa";
import heroBackground from '@/assets/hero-illustration.jpg';

// Updated list of 10 calm piano audio files with a new 'genre' property
const allAudios = [
  {
    track_title: "Peaceful Piano Lullaby",
    description: "A gentle tune to soothe the mind and prepare for rest.",
    duration: "3:45",
    file_url: "/audio/a1.mp3", // Note the path starts from the public folder
    genre: "Meditative",
  },
  {
    track_title: "Soft Moonlight Sonata",
    description: "A serene melody perfect for late-night relaxation.",
    duration: "4:15",
    file_url: "/audio/a2.mp3", // Use the correct file name
    genre: "Relaxing",
  },
  {
    track_title: "Morning Dewdrops",
    description: "Light and airy notes to bring a sense of calm.",
    duration: "5:02",
    file_url: "/audio/a3.mp3", // And the correct file name here
    genre: "Uplifting",
  },
  {
    track_title: "Nuvole Bianche",
    description: "A gentle tune to soothe the mind and prepare for rest.",
    duration: "3:45",
    file_url: "/audio/a4.mp3", // Note the path starts from the public folder
    genre: "Meditative",
  },
  {
    track_title: "River Flows in You",
    description: "A serene melody perfect for late-night relaxation.",
    duration: "4:15",
    file_url: "/audio/a5.mp3", // Use the correct file name
    genre: "Relaxing",
  },
];

const backgroundColors = [
  "bg-violet-100",
  "bg-cyan-100",
  "bg-pink-100",
];

const genreTags = ["All", "Calming", "Focus", "Meditative", "Uplifting", "Ambient", "Relaxing"];

export default function AudioLibraryPage() {
  const { title } = useParams();
  const [audioPlayer, setAudioPlayer] = useState(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedTag, setSelectedTag] = useState("All");

  const [visibleAudios, setVisibleAudios] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef(null);

  const fetchAudios = (selectedTag, currentPage) => {
    setLoading(true);
    const filteredList = selectedTag === "All"
      ? allAudios
      : allAudios.filter(audio => audio.genre === selectedTag);

    const newItems = filteredList.slice(0, currentPage * 5);

    setTimeout(() => {
      setVisibleAudios(newItems);
      setHasMore(newItems.length < filteredList.length);
      setLoading(false);
    }, 500);
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
          setPage(prevPage => prevPage + 1);
        }
      },
      { threshold: 1.0 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [loading, hasMore]);

  useEffect(() => {
    if (page > 1) {
      fetchAudios(selectedTag, page);
    }
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
      if (audioPlayer) {
        audioPlayer.pause();
      }
      const newPlayer = new Audio(file_url);
      newPlayer.loop = true; // Added loop attribute
      newPlayer.play();
      setAudioPlayer(newPlayer);
      setCurrentTrack(file_url);
      setIsPlaying(true);
    }
  };

  const handleStop = () => {
    if (audioPlayer) {
      audioPlayer.pause();
      audioPlayer.currentTime = 0;
      setIsPlaying(false);
      setCurrentTrack(null);
    }
  };

  useEffect(() => {
    return () => {
      if (audioPlayer) {
        audioPlayer.pause();
      }
    };
  }, [audioPlayer]);

  return (
    <div
      className="min-h-screen relative p-4 bg-gray-50 bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url(${heroBackground})` }}
    >
      <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-1"></div>

      <div className="relative z-20 mx-auto py-12 px-2 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">{title}</h1>

        <div className="flex justify-center flex-wrap gap-2 mb-10">
          {genreTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-4 py-1.5 rounded-full text-sm transition-colors shadow-sm
                ${selectedTag === tag ? "bg-violet-500 text-white" : "bg-white/70 text-gray-900 hover:bg-white"}`}
            >
              {tag}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {visibleAudios.map((audio, index) => (
            <div
              key={index}
              className={`rounded-xl shadow-lg px-8 py-4 flex justify-between items-center transition-transform hover:scale-105 ${backgroundColors[index % backgroundColors.length]}`}
            >
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  {audio.track_title}
                </h2>
                <p className="text-sm text-gray-600 mt-1">{audio.description}</p>
                {/* Time duration removed */}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handlePlayPause(audio.file_url)}
                  className={`p-3 rounded-full text-white transition-colors
                    ${currentTrack === audio.file_url && isPlaying ? 'bg-orange-500 hover:bg-orange-600' : 'bg-violet-400 hover:bg-violet-500'}`}
                >
                  {currentTrack === audio.file_url && isPlaying ? <FaPause /> : <FaPlay />}
                </button>
                <button
                  onClick={handleStop}
                  className="p-3 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  <FaStop />
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div ref={loaderRef} className="text-center py-8">
          {loading && <p className="text-gray-600">Loading more audios...</p>}
        </div>
        
        {!hasMore && !loading && (
          <p className="text-center text-gray-600">You've reached the end of the list.</p>
        )}
      </div>
    </div>
  );
}