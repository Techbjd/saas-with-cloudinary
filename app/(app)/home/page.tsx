'use client';

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Video } from '../../generated/prisma';
import VideoCard from '@/app/components/ui/VideoCard';
import { motion } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import { useTheme } from 'next-themes';

// Main Component
export default function Home() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Theme handling
  const { theme: activeTheme, systemTheme } = useTheme();
  const currentTheme = activeTheme === 'system' ? systemTheme : activeTheme;
  const [mounted, setMounted] = useState(false);

  // Mark as mounted after first render
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch videos
  const fetchVideos = useCallback(async () => {
    try {
      const res = await axios.get('/api/videos');
      if (Array.isArray(res.data)) {
        setVideos(res.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err: any) {
      console.error('Failed to fetch videos:', err);
      setError('Could not load videos. Please try again.');
      toast.error('Failed to load videos');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  // Handle download with toast
  const handleDownload = useCallback((url: string, title: string) => {
    const link = document.createElement('a');
    const downloadUrl = url.includes('fl_attachment')
      ? url
      : `${url}?fl_attachment=true`;

    link.href = downloadUrl;
    link.setAttribute('download', `${title}.mp4`);
    link.setAttribute('target', '_blank');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(` Downloading: ${title}`);
  }, []);

  // Theme styles
  const getThemeStyles = () => {
    switch (currentTheme) {
      case 'dark':
        return {
          container: 'bg-gray-900 text-white',
          title: 'text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400',
          empty: 'text-gray-400',
          loadingBg: 'bg-gray-900',
          cardBg: 'bg-gray-800',
        };
      case 'dracula':
        return {
          container: 'bg-purple-950 text-purple-100',
          title: 'text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-red-300 to-yellow-200',
          empty: 'text-purple-400',
          loadingBg: 'bg-purple-950',
          cardBg: 'bg-purple-900',
        };
      case 'ocean':
        return {
          container: 'bg-blue-50 text-blue-900',
          title: 'text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-400',
          empty: 'text-blue-600',
          loadingBg: 'bg-blue-50',
          cardBg: 'bg-white',
        };
      case 'forest':
        return {
          container: 'bg-green-50 text-green-900',
          title: 'text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-emerald-500 to-teal-400',
          empty: 'text-green-600',
          loadingBg: 'bg-green-50',
          cardBg: 'bg-white',
        };
      default:
        return {
          container: 'bg-white text-gray-900',
          title: 'text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500',
          empty: 'text-gray-500',
          loadingBg: 'bg-gradient-to-r from-pink-200 via-purple-200 to-indigo-200',
          cardBg: 'bg-white',
        };
    }
  };

  const themeStyles = getThemeStyles();

  //  Prevent rendering before mount (fixes theme mismatch)
  if (!mounted) {
    return (
      <div className={`flex items-center justify-center h-screen ${themeStyles.loadingBg}`}>
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
      {/* Toast Notifications */}
      <Toaster position="top-right" />

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`min-h-screen px-4 py-8 sm:px-6 lg:px-8 ${themeStyles.container}`}
      >
        {/* Header */}
        <h1 className={`text-3xl sm:text-4xl font-extrabold mb-6 ${themeStyles.title}`}>
          🎬 Video Gallery
        </h1>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-sm">
            {error}
            <button
              onClick={fetchVideos}
              className="ml-2 underline hover:text-red-900"
            >
              Retry
            </button>
          </div>
        )}

        {/* Video Grid */}
        {loading ? (
          <div className="text-center my-10">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : videos.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center my-16"
          >
            <p className={`text-lg ${themeStyles.empty}`}>No videos uploaded yet.</p>
            <button
              onClick={fetchVideos}
              className="btn btn-outline btn-sm mt-4 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Refresh
            </button>
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
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <VideoCard video={video} onDownload={handleDownload} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Footer */}
        <div className="mt-16 text-center text-sm opacity-70">
          <p>Create, manage, and deliver dynamic visual experiences.</p>
          <p className="mt-1">
            Powered by{' '}
            <a
              href="https://cloudinary.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:underline"
            >
              Cloudinary
            </a>{' '}
            • Trusted by 1.3M+ developers
          </p>
        </div>
      </motion.div>
    </>
  );
}