"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface InstagramEmbedProps {
  username: string;
  url: string;
}

export function InstagramEmbed({ username, url }: InstagramEmbedProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Instagram doesn't allow direct profile embedding, but we can show a preview
  // In production, you'd use Instagram Graph API with proper authentication
  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-white/40 mb-4" />
        <p className="text-sm text-white/60">Loading Instagram profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 min-h-[400px]">
        <p className="text-sm text-red-400 mb-4">{error}</p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-white/60 hover:text-white underline"
        >
          View on Instagram
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Profile Header */}
      <div className="flex items-center gap-4 pb-4 border-b border-white/10">
        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl">
          {username.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white">@{username}</h3>
          <p className="text-sm text-white/60">Instagram Profile</p>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition"
        >
          View Profile
        </a>
      </div>

      {/* Embedded Profile Preview */}
      <div className="rounded-xl overflow-hidden bg-black/20 border border-white/10">
        <div className="aspect-square bg-gradient-to-br from-purple-900/20 to-pink-900/20 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold">
              {username.charAt(0).toUpperCase()}
            </div>
            <p className="text-white/80 font-medium">@{username}</p>
            <p className="text-sm text-white/60">Click to view full profile on Instagram</p>
          </div>
        </div>
      </div>

      {/* Note about Instagram API */}
      <div className="rounded-lg bg-white/5 border border-white/10 p-4">
        <p className="text-xs text-white/50 leading-relaxed">
          <strong>Note:</strong> Instagram requires API access for full profile embedding. 
          To show live posts and analytics, integrate with Instagram Graph API.
        </p>
      </div>

      {/* Alternative: Embed individual posts if you have post URLs */}
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="aspect-square rounded-lg bg-white/5 border border-white/10 flex items-center justify-center cursor-pointer hover:bg-white/10 transition"
            onClick={() => window.open(url, "_blank")}
          >
            <span className="text-xs text-white/40">Post {i}</span>
          </div>
        ))}
      </div>
    </div>
  );
}


