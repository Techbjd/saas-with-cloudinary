'use client';

import React, { useState, useEffect, useCallback ,useRef} from 'react';
import { getCldImageUrl, getCldVideoUrl } from "next-cloudinary";
import { Download, Clock, FileDown, FileUp } from "lucide-react";
import dayjs from 'dayjs';
import relativeTime from "dayjs/plugin/relativeTime";
import { filesize } from "filesize";
import { Video } from "../../generated/prisma";
import { useTheme } from "next-themes";
import toast from 'react-hot-toast';



dayjs.extend(relativeTime);

interface VideoCardProps {
  video: Video;
  onDownload?: (url: string, title: string) => void; // optional if using internal download
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onDownload }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const { theme: activeTheme, systemTheme } = useTheme();
  const currentTheme = activeTheme === "system" ? systemTheme : activeTheme;
const videoRef = useRef<HTMLVideoElement>(null);
  const themeStyles = (() => {
    switch (currentTheme) {
      case "dark":
      case "dracula":
        return {
          card: "bg-gray-800 border-gray-700",
          title: "text-white",
          text: "text-gray-300",
          meta: "text-gray-400",
          highlight: "text-purple-400",
          button: "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white",
        };
      case "ocean":
        return {
          card: "bg-white border-blue-200",
          title: "text-blue-900",
          text: "text-blue-800",
          meta: "text-blue-600",
          highlight: "text-blue-600",
          button: "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white",
        };
      case "forest":
        return {
          card: "bg-white border-green-200",
          title: "text-green-900",
          text: "text-green-800",
          meta: "text-green-600",
          highlight: "text-green-600",
          button: "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white",
        };
      default:
        return {
          card: "bg-white border-gray-200",
          title: "text-gray-900",
          text: "text-gray-600",
          meta: "text-gray-500",
          highlight: "text-indigo-600",
          button: "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white",
        };
    }
  })();

  const getThumbnailUrl = useCallback((publicId: string) => {
    return getCldImageUrl({
      src: publicId,
      width: 400,
      height: 225,
      crop: "fill",
      gravity: "auto",
      format: "jpg",
      quality: "auto",
      assetType: "video",
    });
  }, []);

  const getPreviewVideoUrl = useCallback((publicId: string) => {
    return getCldVideoUrl({
      src: publicId,
      width: 400,
      height: 225,
      rawTransformations: ["e_preview:duration_15:max_seg_9:min_seg_dur_1"],
    });
  }, []);

  const getFullVideoUrl = useCallback((publicId: string) => {
    return getCldVideoUrl({
      src: publicId,
      width: 1920,
      height: 1080,
    });
  }, []);

  const formatSize = useCallback((size: number) => filesize(size), []);
  const formatDuration = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }, []);

  const downloadVideo = async () => {
    if (onDownload) {
      onDownload(getFullVideoUrl(video.publicId), video.title);
      return;
    }

    try {
      setIsDownloading(true);
      const videoUrl = getFullVideoUrl(video.publicId);

      const response = await fetch(videoUrl);
      if (!response.ok) throw new Error("Network response was not ok");

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${video.title}.mp4`;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
      window.open(getFullVideoUrl(video.publicId), "_blank");
    } finally {
      setIsDownloading(false);
    }
  };

  const compressionPercentage = Math.round(
    (1 - Number(video.compressedSize) / Number(video.originalSize)) * 100
  );

  useEffect(() => {
    setPreviewError(false);
  }, [isHovered]);

  const handlePreviewError = () => setPreviewError(true);
const handleDelete = async () => {


  if (!confirm('Are you sure you want to delete this video?')) return;

  try {
    const res = await fetch('/api/videos/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicId: video.publicId }),
    });

    if (res.ok) {
      toast.success('Video deleted');
      // Optionally trigger refresh
      window.location.reload(); // or use a callback
    } else {
      throw new Error('Delete failed');
    }
  } catch (err) {
    toast.error('Failed to delete video');
  }
};
  return (
<div
  className={`max-w-md w-full border rounded-2xl shadow-xl overflow-hidden transition-transform duration-300 hover:scale-[1.02] ${themeStyles.card}`}
  onMouseEnter={() => setIsHovered(true)}
  onMouseLeave={() => setIsHovered(false)}
>
<figure
  className="relative w-full h-56 md:h-64 lg:h-72 overflow-hidden rounded-t-2xl shadow-md"
  onMouseEnter={() => videoRef.current?.play()}
  onMouseLeave={() => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0; // reset to first frame
    }
  }}
>
  <video
    ref={videoRef}
    src={getPreviewVideoUrl(video.publicId)}
    muted
    loop
    poster={getThumbnailUrl(video.publicId)}
    className="w-full h-full object-cover"
  />

  {/* Duration badge */}
  <div className="absolute bottom-3 right-3 bg-black/70 px-3 py-1 rounded-lg text-xs text-white flex items-center gap-1 shadow-sm">
    <Clock size={14} />
    <span>{formatDuration(video.duration)}</span>
  </div>
</figure>


  {/* Card Body */}
  <div className="p-5 flex flex-col justify-between h-full">
    {/* Title */}
    <h2 className={`font-bold text-lg mb-2 truncate ${themeStyles.title}`}>{video.title}</h2>

    {/* Description */}
    {video.description && (
      <p className={`text-sm mb-3 line-clamp-2 ${themeStyles.text}`}>{video.description}</p>
    )}

    {/* Uploaded info */}
    <p className={`text-xs mb-4 ${themeStyles.meta}`}>
      Uploaded {dayjs(video.createdAt).fromNow()}
    </p>

    {/* Original / Compressed Sizes */}
    <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
      <div className="flex items-center gap-2">
        <FileUp size={16} className={themeStyles.highlight} />
        <div>
          <div className={`font-medium ${themeStyles.meta}`}>Original</div>
          <div className={themeStyles.text}>{formatSize(Number(video.originalSize))}</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <FileDown size={16} className={themeStyles.highlight} />
        <div>
          <div className={`font-medium ${themeStyles.meta}`}>Compressed</div>
          <div className={themeStyles.text}>{formatSize(Number(video.compressedSize))}</div>
        </div>
      </div>
    </div>

    {/* Compression Saved + Buttons */}
    <div className="flex justify-between items-center">
      <div className={`text-xs font-medium ${themeStyles.meta}`}>
        Saved: <span className={themeStyles.highlight}>{compressionPercentage}%</span>
      </div>

      <div className="flex gap-3">
        <button
          className={`btn btn-sm flex items-center gap-2 px-4 py-2 rounded-lg text-white text-xs font-medium shadow-lg ${themeStyles.button} ${isDownloading ? "loading" : ""}`}
          onClick={downloadVideo}
          disabled={isDownloading}
        >
          <Download className="w-3 h-3" /> {isDownloading ? "Downloading..." : "Download"}
        </button>

        <button
          onClick={handleDelete}
          className={`btn btn-sm px-4 py-2 rounded-lg text-white text-xs font-medium shadow-lg ${themeStyles.button} hover:opacity-90 transition-opacity duration-200`}
        >
          Delete
        </button>
      </div>
    </div>
  </div>
</div>


);
};
export default VideoCard;









