import React, { useState, useRef } from "react";
import { useParams } from "react-router-dom";
import heroBackground from '@/assets/hero-illustration.jpg';

// Helper function to convert a watch URL to an embed URL
const getEmbedUrl = (url) => {
  const videoId = url.split("v=")[1].split("&")[0];
  return `https://www.youtube.com/embed/${videoId}`;
};

// Initial data for the videos
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
  
  const [currentVideo, setCurrentVideo] = useState(videos[videos.length - 1].url + "?autoplay=1&rel=0");
  const videoRef = useRef(null);

  const handleVideoClick = (videoUrl) => {
    // Update the state with the URL of the clicked video and include autoplay and no-recommendations
    setCurrentVideo(videoUrl + "?autoplay=1&rel=0");
    // This will scroll the page to the very top, which is what you wanted
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      className="min-h-screen relative p-4 bg-gray-50 bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url(${heroBackground})` }}
    >
      <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-1"></div>

      <div className="relative z-20 mx-auto py-12 px-2 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">{title}</h1>

        <div className="max-w-4xl mx-auto bg-gradient-to-br from-violet-200/70 to-pink-200/70 rounded-xl shadow-2xl overflow-hidden mb-12 p-6" ref={videoRef}>
          <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
            <iframe
              className="w-full h-full"
              src={currentVideo}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video, index) => (
            <div
              key={video.id}
              onClick={() => handleVideoClick(video.url)}
              className="cursor-pointer bg-white rounded-xl shadow-lg overflow-hidden transition-transform hover:scale-105"
            >
              <div className="relative aspect-video">
                <img
                  src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h2 className="text-lg font-semibold text-gray-800">{video.title}</h2>
                <p className="text-sm text-gray-600 mt-1">{video.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}