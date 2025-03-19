"use client";

import { usePiP } from "@/contexts/PIPContext";
import { Expand, Square, X } from "lucide-react";
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

  const pipWidth = 320;
  const pipHeight = 208;

  const [position, setPosition] = useState({
    x:
      typeof window !== "undefined"
        ? Math.max(0, window.innerWidth - pipWidth - 20)
        : 0,
    y:
      typeof window !== "undefined"
        ? Math.max(0, window.innerHeight - pipHeight - 20)
        : 0,
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
        playerVars: {
          autoplay: 1,
          controls: 0,
          rel: 0,
          modestbranding: 1,
          showinfo: 0,
        },
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
        x: Math.max(0, Math.min(window.innerWidth - pipWidth, newX)),
        y: Math.max(0, Math.min(window.innerHeight - pipHeight, newY)),
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

  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => ({
        x: Math.max(0, Math.min(window.innerWidth - pipWidth, prev.x)),
        y: Math.max(0, Math.min(window.innerHeight - pipHeight, prev.y)),
      }));
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  if (!isPiP || !videoId) return null;

  return (
    <>
      <div
        className="fixed bottom-4 right-4 w-80 h-52 z-52 dark:bg-black dark:shadow-lg bg-slate-100 shadow-md rounded-lg overflow-hidden group"
        style={{
          top: position.y,
          left: position.x,
          width: pipWidth,
          height: pipHeight,
        }}
        onMouseDown={(e) => {
          setDragging(true);
          setOffset({ x: e.clientX - position.x, y: e.clientY - position.y });
        }}
      >
        <div id="floating-iframe" className="w-full h-full"></div>

        <div className="absolute bottom-0 left-0 flex gap-3 rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black via-black/50 to-transparent w-full">
          <button
            className="text-gray-300 hover:opacity-70 p-2 transition-opacity"
            onClick={() => setIsPiP(false)}
          >
            <X className="w-4 h-4" />
          </button>
          <button
            className="text-gray-300 p-2 hover:opacity-70 transition-opacity"
            onClick={() => {
              setIsPiP(false);
              router.push(`/watch?v=${videoId}`);
            }}
          >
            <Expand className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
}
