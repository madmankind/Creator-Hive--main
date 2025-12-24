"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface TikTokEmbedProps {
  username?: string;
  url?: string;
}

export function TikTokEmbed({ username, url }: TikTokEmbedProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        <p className="text-sm text-white/60">Loading TikTok profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 min-h-[400px]">
        <p className="text-sm text-red-400 mb-4">{error}</p>
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-white/60 hover:text-white underline"
          >
            View on TikTok
          </a>
        )}
      </div>
    );
  }

  const displayUsername = username || "TikTok Creator";

  return (
    <div className="space-y-4">
      {/* Profile Header */}
      <div className="flex items-center gap-4 pb-4 border-b border-white/10">
        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-cyan-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl">
          {displayUsername.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white">
            {username ? `@${username}` : displayUsername}
          </h3>
          <p className="text-sm text-white/60">TikTok Profile</p>
        </div>
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-900 transition border border-white/20"
          >
            View Profile
          </a>
        )}
      </div>

      {/* TikTok Profile Preview */}
      <div className="rounded-xl overflow-hidden bg-black/20 border border-white/10">
        <div className="aspect-[9/16] bg-gradient-to-br from-cyan-900/20 to-pink-900/20 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold">
              {displayUsername.charAt(0).toUpperCase()}
            </div>
            <p className="text-white/80 font-medium">
              {username ? `@${username}` : displayUsername}
            </p>
            <p className="text-sm text-white/60">Click to view full profile on TikTok</p>
          </div>
        </div>
      </div>

      {/* TikTok Video Grid Preview */}
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="aspect-[9/16] rounded-lg bg-white/5 border border-white/10 flex items-center justify-center cursor-pointer hover:bg-white/10 transition relative overflow-hidden group"
            onClick={() => url && window.open(url, "_blank")}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition" />
            <span className="text-xs text-white/40 relative z-10">Video {i}</span>
            <div className="absolute bottom-1 right-1 text-white/60 text-[10px]">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.41-.63.47-1.07 1.27-1.15 2.16-.07 1.12.33 2.2 1.02 2.96.72.85 1.84 1.39 3.01 1.38 1.23-.01 2.41-.58 3.11-1.61.64-1.01.8-2.3.4-3.48-.36-1.04-1.2-1.9-2.24-2.25-.9-.3-1.9-.22-2.78.23-.01-.93-.01-1.86-.02-2.79z"/>
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* Note about TikTok API */}
      <div className="rounded-lg bg-white/5 border border-white/10 p-4">
        <p className="text-xs text-white/50 leading-relaxed">
          <strong>Note:</strong> For live TikTok content embedding, integrate with TikTok's 
          oEmbed API or TikTok for Developers API. Individual video embeds are available 
          via TikTok's embed widget.
        </p>
      </div>
    </div>
  );
}


