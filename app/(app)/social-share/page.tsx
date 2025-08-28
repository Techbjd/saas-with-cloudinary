'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CldImage } from 'next-cloudinary';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadIcon, DownloadIcon, ImageIcon, RefreshCwIcon } from 'lucide-react';
import { useTheme } from 'next-themes';

const socialFormats = {
  'Instagram Square (1:1)': { width: 1080, height: 1080, aspectRatio: '1:1' },
  'Instagram Portrait (4:5)': { width: 1080, height: 1350, aspectRatio: '4:5' },
  'Twitter Post (16:9)': { width: 1200, height: 675, aspectRatio: '16:9' },
  'Twitter Header (3:1)': { width: 1500, height: 500, aspectRatio: '3:1' },
  'Facebook Cover (205:78)': { width: 820, height: 312, aspectRatio: '205:78' },
} as const satisfies Record<string, { width: number; height: number; aspectRatio: string }>;

type SocialFormat = keyof typeof socialFormats;


function isValidSocialFormat(value: string): value is SocialFormat {
  return Object.keys(socialFormats).includes(value);
}

export default function SocialShare() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<SocialFormat>('Instagram Square (1:1)');
  const [isUploading, setIsUploading] = useState(false);
  const [isTransforming, setIsTransforming] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  const { theme: activeTheme, systemTheme } = useTheme();
  const currentTheme = activeTheme === 'system' ? systemTheme : activeTheme;

  useEffect(() => {
    if (uploadedImage) setIsTransforming(true);
  }, [selectedFormat, uploadedImage]);


  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/image-upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');

      const data = await res.json();
      setUploadedImage(data.publicId);
    } catch (error) {
      console.error(error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Download handler
  const handleDownload = () => {
    if (!imageRef.current) return;

    fetch(imageRef.current.src)
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${selectedFormat.replace(/\s+/g, '_').replace(/[()]/g, '').toLowerCase()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      })
      .catch(() => alert('Download failed'));
  };

  // Theme styles
  const getThemeStyles = () => {
    switch (currentTheme) {
      case 'dark':
        return {
          container: 'bg-gray-900 text-gray-100',
          card: 'bg-gray-800/90 backdrop-blur-sm border-gray-700',
          title: 'bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400',
          input: 'bg-gray-700 border-gray-600 focus:border-purple-500',
          select: 'bg-gray-700 border-gray-600 text-white',
          previewBg: 'bg-gray-700 border-gray-600',
          button: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700',
          loading: 'text-purple-400',
        };
      case 'dracula':
        return {
          container: 'bg-purple-950 text-purple-100',
          card: 'bg-purple-900/95 backdrop-blur-sm border-purple-800',
          title: 'bg-gradient-to-r from-pink-500 via-red-500 to-yellow-300',
          input: 'bg-purple-800 border-purple-600 focus:border-pink-500',
          select: 'bg-purple-800 border-purple-600 text-purple-100',
          previewBg: 'bg-purple-900 border-purple-700',
          button: 'bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700',
          loading: 'text-pink-400',
        };
      case 'ocean':
        return {
          container: 'bg-blue-50 text-blue-900',
          card: 'bg-white/80 backdrop-blur-sm border-blue-200',
          title: 'bg-gradient-to-r from-blue-500 via-cyan-400 to-teal-300',
          input: 'bg-white border-blue-300 focus:border-blue-500',
          select: 'bg-white border-blue-300 text-blue-900',
          previewBg: 'bg-blue-50 border-blue-200',
          button: 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600',
          loading: 'text-blue-500',
        };
      case 'forest':
        return {
          container: 'bg-green-50 text-green-900',
          card: 'bg-white/80 backdrop-blur-sm border-green-200',
          title: 'bg-gradient-to-r from-green-600 via-emerald-500 to-teal-400',
          input: 'bg-white border-green-300 focus:border-green-500',
          select: 'bg-white border-green-300 text-green-900',
          previewBg: 'bg-green-50 border-green-200',
          button: 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700',
          loading: 'text-green-500',
        };
      default:
        return {
          container: 'bg-white text-gray-900',
          card: 'bg-white/90 backdrop-blur-sm border-gray-200',
          title: 'bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500',
          input: 'bg-white border-gray-300 focus:border-indigo-500',
          select: 'bg-white border-gray-300 text-gray-900',
          previewBg: 'bg-gray-50 border-gray-200',
          button: 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600',
          loading: 'text-indigo-500',
        };
    }
  };

  const themeStyles = getThemeStyles();

  return (
    <div className={`min-h-screen px-4 py-8 sm:px-6 lg:px-8 transition-colors duration-300 ${themeStyles.container}`}>
      {/* Header */}
      <div className="max-w-5xl mx-auto text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 bg-clip-text text-transparent" style={{ background: themeStyles.title }}>
          🎨 Social Media Image Formatter
        </h1>
        <p className={`text-lg opacity-80 ${currentTheme === 'dark' || currentTheme === 'dracula' ? 'text-gray-300' : 'text-gray-600'}`}>
          Upload, crop, and download your images in perfect social media dimensions.
        </p>
      </div>

      {/* Main Card */}
      <div className={`max-w-3xl mx-auto rounded-2xl shadow-2xl border overflow-hidden transition-all duration-300 ${themeStyles.card}`}>
        <div className="p-6 sm:p-8">
          {/* Upload */}
          <div className="text-center mb-8">
            <label
              htmlFor="upload"
              className={`relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-all hover:border-purple-400 ${
                isUploading ? 'opacity-70 cursor-not-allowed' : ''
              } ${themeStyles.input}`}
            >
              {isUploading ? (
                <>
                  <RefreshCwIcon className={`w-8 h-8 animate-spin mb-2 ${themeStyles.loading}`} />
                  <span>Uploading...</span>
                </>
              ) : uploadedImage ? (
                <>
                  <ImageIcon className="w-8 h-8 opacity-70" />
                  <span className="mt-2 font-medium">Change Image</span>
                </>
              ) : (
                <>
                  <UploadIcon className="w-8 h-8 opacity-70" />
                  <span className="mt-2 font-medium">Click to upload or drag and drop</span>
                  <span className="text-sm opacity-60">PNG, JPG, WEBP up to 10MB</span>
                </>
              )}
              <input id="upload" type="file" accept="image/*" onChange={handleFileUpload} className="hidden" disabled={isUploading} />
            </label>
          </div>

          {/* Format Selector */}
          {uploadedImage && (
            <div className="mb-8">
              <label className="block mb-3 font-semibold">Select Format</label>
              <select
                value={selectedFormat}
                onChange={(e) => {
                  const value = e.target.value;
                  if (isValidSocialFormat(value)) setSelectedFormat(value);
                }}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:outline-none transition ${themeStyles.select}`}
              >
                {Object.entries(socialFormats).map(([format, config]) => (
                  <option key={format} value={format}>
                    {format} ({config.width}×{config.height})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Preview */}
          {uploadedImage && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-3">Preview</h3>
              <div
                className={`relative mx-auto rounded-xl overflow-hidden shadow-lg border ${themeStyles.previewBg}`}
                style={{
                  width: `${socialFormats[selectedFormat].width / 4}px`,
                  height: `${socialFormats[selectedFormat].height / 4}px`,
                }}
              >
                {isTransforming && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 z-10">
                    <RefreshCwIcon className={`w-8 h-8 animate-spin ${themeStyles.loading}`} />
                  </div>
                )}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedFormat}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CldImage
                      width={socialFormats[selectedFormat].width}
                      height={socialFormats[selectedFormat].height}
                      src={uploadedImage}
                      sizes="50vw"
                      alt="Formatted social image"
                      crop="fill"
                      gravity="auto"
                      ref={imageRef}
                      onLoad={() => setIsTransforming(false)}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Download Button */}
          {uploadedImage && (
            <div className="flex justify-end">
              <button
                onClick={handleDownload}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium active:scale-95 transition ${themeStyles.button}`}
              >
                <DownloadIcon className="w-5 h-5" />
                Download for {selectedFormat.split(' ')[0]}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-8 text-sm opacity-60">
        Powered by{' '}
        <a href="https://cloudinary.com" target="_blank" rel="noopener noreferrer" className="font-medium hover:underline">
          Cloudinary
        </a>{' '}
        • Perfect for Instagram, Twitter & Facebook
      </div>
    </div>
  );
}