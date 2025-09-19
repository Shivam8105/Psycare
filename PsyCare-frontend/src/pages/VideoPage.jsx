import React, { useState, useRef } from "react";
import { useParams } from "react-router-dom";
import musicBackground from "@/assets/music_bg.jpg";

// Helper function to convert a YouTube URL to embed URL
const getEmbedUrl = (url) => {
  const videoId = url.split("v=")[1].split("&")[0];
  return `https://www.youtube.com/embed/${videoId}`;
};

const videos = [
  {
    id: "rkZl2gsLUp4",
    title: "How To Deal With Depression",
    url: getEmbedUrl("https://www.youtube.com/watch?v=rkZl2gsLUp4"),
    description: "A practical guide to managing daily challenges.",
  },
  {
    id: "ds9pEAB72kI",
    title: "How to Overcome Loneliness and Depression",
    url: getEmbedUrl("https://youtube.com/watch?v=ds9pEAB72kI"),
    description: "Learn simple techniques to stay present and reduce anxiety.",
  },
  {
    id: "qq0DBeFdDlM",
    title: "The Cure For Loneliness and Depression",
    url: getEmbedUrl("https://www.youtube.com/watch?v=qq0DBeFdDlM"),
    description: "Finding your inner strength.",
  },
  {
    id: "wOGqlVqyvCM",
    title: "Depression is a Sickness, NOT a Sin",
    url: getEmbedUrl("https://www.youtube.com/watch?v=wOGqlVqyvCM"),
    description: "A motivational talk about depression.",
  },
  {
    id: "XCxHsgKY03I",
    title: "You Are Not Alone",
    url: getEmbedUrl("https://www.youtube.com/watch?v=XCxHsgKY03I"),
    description: "A message of hope and support.",
  },
  {
    id: "a1Y1ocyudjs",
    title: "How To Cope With Depression (And How I Did It)",
    url: getEmbedUrl("https://www.youtube.com/watch?v=a1Y1ocyudjs"),
    description: "A personal story of overcoming depression.",
  },
];

export default function VideoPage() {
  const { title } = useParams();
  const [currentVideo, setCurrentVideo] = useState(
    videos[videos.length - 1].url + "?autoplay=1&rel=0"
  );
  const videoRef = useRef(null);

  const handleVideoClick = (videoUrl) => {
    setCurrentVideo(videoUrl + "?autoplay=1&rel=0");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div
      className="min-h-screen relative w-full overflow-hidden"
      style={{
        backgroundImage: `url(${musicBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/40 to-white/10 backdrop-blur-sm  z-0"></div>

      <div className="relative z-10 flex flex-col items-center justify-start min-h-screen py-10 px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-black mb-10 text-center font-poppins drop-shadow-lg">
          {title}
        </h1>

        {/* Full-screen Video */}
        <div className="w-full max-w-7xl aspect-video mb-12 shadow-2xl rounded-xl overflow-hidden">
          <iframe
            className="w-full h-full"
            src={currentVideo}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>

        {/* Video Thumbnails */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl">
          {videos.map((video) => (
            <div
              key={video.id}
              onClick={() => handleVideoClick(video.url)}
              className="cursor-pointer relative overflow-hidden rounded-xl shadow-xl transition-transform hover:scale-105 hover:shadow-2xl"
            >
              <div className="relative aspect-video">
                <img
                  src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              </div>
              <div className="p-4 bg-white/70 backdrop-blur-md">
                <h2 className="text-lg font-semibold text-gray-900">{video.title}</h2>
                <p className="text-sm text-gray-700 mt-1">{video.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}