"use client";
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import VideoCard from "@/app/components/ui/VideoCard";
import { Video } from "../../generated/prisma";
import { motion } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";

function Home() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVideos = useCallback(async () => {
    try {
      const response = await axios.get("/api/videos");
      if (Array.isArray(response.data)) {
        setVideos(response.data);
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (error) {
      console.log(error);
      setError("Failed to fetch videos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  // ✅ Fixed handleDownload function for Cloudinary direct download + Toast
  const handleDownload = useCallback((url: string, title: string) => {
    const link = document.createElement("a");
    const downloadUrl = url.includes("fl_attachment")
      ? url
      : `${url}?fl_attachment=${encodeURIComponent(title)}.mp4`;

    link.href = downloadUrl;
    link.setAttribute("download", `${title}.mp4`);
    link.setAttribute("target", "_blank");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Download started: ${title}`);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-r from-pink-200 via-purple-200 to-indigo-200">
        {/* Zigzag Loading Animation */}
        <div className="flex space-x-3">
          <span className="w-4 h-4 bg-pink-500 rounded-full animate-bounce"></span>
          <span className="w-4 h-4 bg-purple-600 rounded-full animate-bounce [animation-delay:-0.2s]"></span>
          <span className="w-4 h-4 bg-yellow-400 rounded-full animate-bounce [animation-delay:-0.4s]"></span>
          <span className="w-4 h-4 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.6s]"></span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto p-6"
      >
        <h1 className="text-3xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
          🎬 Video Gallery
        </h1>
        {videos.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-lg text-gray-500"
          >
            No videos available
          </motion.div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {videos.map((video) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <VideoCard video={video} onDownload={handleDownload} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </>
  );
}

export default Home;