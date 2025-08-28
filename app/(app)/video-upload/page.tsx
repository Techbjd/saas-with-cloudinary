'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { UploadIcon, XIcon, AlertCircleIcon } from 'lucide-react';

const MAX_FILE_SIZE = 70 * 1024 * 1024; // 70MB

export default function VideoUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const { theme: activeTheme, systemTheme } = useTheme();
  const currentTheme = activeTheme === 'system' ? systemTheme : activeTheme;
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Theme styles
  const getThemeStyles = () => {
    switch (currentTheme) {
      case 'dark':
        return {
          container: 'bg-gray-900 text-white',
          card: 'bg-gray-800 border-gray-700',
          input: 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500',
          textarea: 'bg-gray-700 border-gray-600 text-white placeholder-gray-400',
          label: 'text-gray-200',
          fileInput: 'file:bg-gray-600 file:text-white bg-gray-700 border-gray-600 hover:bg-gray-600',
          button: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white',
          progressBg: 'progress-base-300',
          progressPrimary: 'progress-primary',
          alert: 'bg-red-900/50 text-red-200 border-red-700',
        };
      case 'dracula':
        return {
          container: 'bg-purple-950 text-purple-100',
          card: 'bg-purple-900 border-purple-800',
          input: 'bg-purple-800 border-purple-600 text-white placeholder-purple-300 focus:border-pink-500',
          textarea: 'bg-purple-800 border-purple-600 text-white placeholder-purple-300',
          label: 'text-purple-200',
          fileInput: 'file:bg-purple-600 file:text-white bg-purple-800 border-purple-600 hover:bg-purple-700',
          button: 'bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 text-white',
          progressBg: 'progress-base-300',
          progressPrimary: 'progress-primary',
          alert: 'bg-red-900/60 text-red-200 border-red-800',
        };
      case 'ocean':
        return {
          container: 'bg-blue-50 text-blue-900',
          card: 'bg-white border-blue-200',
          input: 'bg-white border-blue-300 text-blue-900 placeholder-blue-600 focus:border-blue-500',
          textarea: 'bg-white border-blue-300 text-blue-900 placeholder-blue-600',
          label: 'text-blue-800',
          fileInput: 'file:bg-blue-100 file:text-blue-800 bg-white border-blue-300 hover:bg-blue-50',
          button: 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white',
          progressBg: 'progress-blue-200',
          progressPrimary: 'progress-blue-500',
          alert: 'bg-red-100 text-red-800 border-red-300',
        };
      case 'forest':
        return {
          container: 'bg-green-50 text-green-900',
          card: 'bg-white border-green-200',
          input: 'bg-white border-green-300 text-green-900 placeholder-green-600 focus:border-green-500',
          textarea: 'bg-white border-green-300 text-green-900 placeholder-green-600',
          label: 'text-green-800',
          fileInput: 'file:bg-green-100 file:text-green-800 bg-white border-green-300 hover:bg-green-50',
          button: 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white',
          progressBg: 'progress-green-200',
          progressPrimary: 'progress-green-500',
          alert: 'bg-red-100 text-red-800 border-red-300',
        };
      default:
        return {
          container: 'bg-white text-gray-900',
          card: 'bg-white border-gray-200',
          input: 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-indigo-500',
          textarea: 'bg-white border-gray-300 text-gray-900 placeholder-gray-500',
          label: 'text-gray-700',
          fileInput: 'file:bg-gray-100 file:text-gray-800 bg-white border-gray-300 hover:bg-gray-50',
          button: 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white',
          progressBg: 'progress-base-300',
          progressPrimary: 'progress-primary',
          alert: 'bg-red-100 text-red-800 border-red-300',
        };
    }
  };

  const themeStyles = getThemeStyles();

  if (!mounted) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;

    if (!selectedFile) return;

    // Validate file type
    if (!selectedFile.type.startsWith('video/')) {
      setError('Please select a valid video file (MP4, WebM, MOV).');
      setFile(null);
      return;
    }

    // Validate size
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError(`Video is too large. Maximum size is 70MB. This file is ${(selectedFile.size / 1024 / 1024).toFixed(1)}MB.`);
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setError(null);
  };

  const removeFile = () => setFile(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a video file.');
      return;
    }

    setIsUploading(true);
    setUploadPercent(0);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('originalSize', file.size.toString()); // Critical for backend

    try {
      // Add timeout and detailed error logging
      await axios.post('/api/video-upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 300000, // 5 minutes
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadPercent(percent);
          }
        },
      });

      router.push('/home');
    } catch (err: any) {
      console.error('Upload error details:', err);

      // Better error messages
      if (err.code === 'ECONNABORTED') {
        setError('Upload timed out. File may be too large or connection slow.');
      } else if (err.response?.status === 413) {
        setError('Payload too large. Video exceeds backend limits.');
      } else if (err.response?.data?.error) {
        setError(`Upload failed: ${err.response.data.error}`);
      } else if (err.request) {
        setError('No response from server. Check your network or backend.');
      } else {
        setError('Upload failed. Please try again.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={`min-h-screen py-8 px-4 transition-colors duration-300 ${themeStyles.container}`}>
      <div className="max-w-3xl mx-auto">
        <div className={`card shadow-xl rounded-2xl p-6 sm:p-8 transition ${themeStyles.card}`}>
          <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
            🎥 Upload Video
          </h1>
          <p className={`mb-6 text-sm ${themeStyles.label}`}>
            Upload and manage your videos with Cloudinary’s powerful media API.
          </p>

          {/* Error Alert */}
          {error && (
            <div className={`mb-6 p-4 rounded-lg border flex items-start gap-3 text-sm ${themeStyles.alert}`}>
              <AlertCircleIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
              <button onClick={() => setError(null)} className="ml-auto hover:bg-black/10 rounded-full p-1">
                <XIcon className="w-4 h-4" />
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className={`block mb-2 font-medium ${themeStyles.label}`}>Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`input input-bordered w-full ${themeStyles.input}`}
                placeholder="Enter video title"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className={`block mb-2 font-medium ${themeStyles.label}`}>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`textarea textarea-bordered w-full ${themeStyles.textarea}`}
                placeholder="Describe your video"
                rows={4}
              />
            </div>

            {/* File Upload */}
            <div>
              <label className={`block mb-2 font-medium ${themeStyles.label}`}>Video File</label>
              {!file ? (
                <label className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${themeStyles.fileInput}`}>
                  <UploadIcon className="w-8 h-8 opacity-60" />
                  <span className="mt-2">Click to upload or drag and drop</span>
                  <span className="text-xs opacity-70">MP4, WebM, MOV up to 70MB</span>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
              ) : (
                <div className={`flex items-center gap-3 p-3 border rounded-lg ${themeStyles.fileInput}`}>
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                    <span className="text-xs">🎥</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs opacity-70">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    disabled={isUploading}
                    className="btn btn-circle btn-ghost btn-sm hover:bg-red-100 dark:hover:bg-red-900"
                  >
                    <XIcon className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Progress */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadPercent}%</span>
                </div>
                <progress
                  className={`progress w-full h-2 ${themeStyles.progressBg} ${themeStyles.progressPrimary}`}
                  value={uploadPercent}
                  max="100"
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isUploading || !file}
              className={`btn w-full py-3 font-medium transition-transform active:scale-95 ${
                isUploading ? 'opacity-80 cursor-not-allowed' : ''
              } ${themeStyles.button}`}
            >
              {isUploading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Uploading...
                </>
              ) : (
                <>
                  <UploadIcon className="w-5 h-5" />
                  Upload Video
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}