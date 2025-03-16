"use client";

import { usePiP } from "@/contexts/PIPContext";
import { Square, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type YT = {
  Player: new (elementId: string, options: any) => {
    seekTo: (seconds: number, allowSeekAhead: boolean) => void;
    destroy: () => void;
  };
};

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

type YouTubePlayerEvent = {
  target: YT.Player;
};

export default function FloatingPiP() {
  const { videoId, isPiP, setIsPiP, videoTime } = usePiP();
  const router = useRouter();
  const [player, setPlayer] = useState<any>(null);

  const [position, setPosition] = useState({
    x: window.innerWidth - 340,
    y: window.innerHeight - 200,
  });
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!isPiP || !videoId) {
      console.log("❌ PiP tidak aktif atau videoId kosong.");
      return;
    }

    const createPlayer = () => {
      const newPlayer = new window.YT.Player("floating-iframe", {
        videoId: videoId,
        playerVars: { autoplay: 1 },
        events: {
          onReady: (event: YouTubePlayerEvent) => {
            event.target.seekTo(videoTime, true);
          },
          onError: (error: any) => {
            console.error("⚠️ ERROR di YouTube Player:", error);
          },
        },
      });
      setPlayer(newPlayer);
    };

    if (!window.YT) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      document.body.appendChild(script);

      window.onYouTubeIframeAPIReady = () => {
        createPlayer();
      };
    } else {
      createPlayer();
    }

    return () => {
      if (player) {
        player.destroy();
        setPlayer(null);
      }
    };
  }, [isPiP, videoId, videoTime]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragging) return;

      const newX = e.clientX - offset.x;
      const newY = e.clientY - offset.y;

      setPosition({
        x: Math.max(0, Math.min(window.innerWidth - 320, newX)),
        y: Math.max(0, Math.min(window.innerHeight - 180, newY)),
      });
    };

    const handleMouseUp = () => {
      setDragging(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, offset]);

  if (!isPiP || !videoId) return null;

  return (
    <div
      className="fixed bottom-4 right-4 w-80 h-48 bg-black shadow-lg dark:bg-black dark:shadow-lg light:bg-slate-100 light:shadow-md rounded-lg overflow-hidden"
      style={{ top: position.y, left: position.x }}
      onMouseDown={(e) => {
        setDragging(true);
        setOffset({ x: e.clientX - position.x, y: e.clientY - position.y });
      }}
    >
      <div id="floating-iframe" className="w-full h-full"></div>

      <div className="absolute top-2 right-2 flex gap-3 bg-background rounded p-2">
        <button
          className="text-gray-300 hover:opacity-70 transition-opacity"
          onClick={() => setIsPiP(false)}
        >
          <X className="w-5 h-5" />
        </button>
        <button
          className="text-gray-300 hover:opacity-70 transition-opacity"
          onClick={() => {
            setIsPiP(false);
            router.push(`/watch/${videoId}`);
          }}
        >
          <Square className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
