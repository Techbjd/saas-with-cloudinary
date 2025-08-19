"use client";
import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

function VideoUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);

  const router = useRouter();
  const MAX_FILE_SIZE = 70 * 1024 * 1024; // 70 MB

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      alert("File size too large");
      return;
    }

    setIsUploading(true);
    setUploadPercent(0);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("originalSize", file.size.toString());

    try {
      await axios.post("/api/video-upload", formData, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadPercent(percent);
          }
        },
      });
      router.push("/");
    } catch (error) {
      console.log(error);
      alert("Failed to upload video");
    } finally {
      setIsUploading(false);
      setUploadPercent(0);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Upload Video</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">
            <span className="label-text">Title</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input input-bordered w-full border-white placeholder-black"
            placeholder="Enter video title"
            required
          />
        </div>
        <div>
          <label className="label">
            <span className="label-text">Description</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="textarea textarea-bordered w-full border-white placeholder-black"
            placeholder="Enter video description"
          />
        </div>
        <div>
          <label className="label">
            <span className="label-text">Video File</span>
          </label>
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="file-input file-input-bordered w-full"
            required
          />
        </div>

        {isUploading && (
          <div className="mt-4">
            <progress
              className="progress progress-primary w-full"
              value={uploadPercent}
              max={100}
            />
            <span className="text-sm">{uploadPercent}%</span>
          </div>
        )}

        <button type="submit" className="btn btn-primary" disabled={isUploading}>
          {isUploading ? "Uploading..." : "Upload Video"}
        </button>
      </form>
    </div>
  );
}

export default VideoUpload;
