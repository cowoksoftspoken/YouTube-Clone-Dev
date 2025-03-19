"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { File, Upload, Loader2, Eye, EyeOff, Link2 } from "lucide-react";

export default function UploadPage() {
  const { data: session } = useSession();
  const [video, setVideo] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [privacy, setPrivacy] = useState("public");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedVideo = e.target.files[0];
      setVideo(selectedVideo);
      setVideoPreview(URL.createObjectURL(selectedVideo));
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!video || !title || !description) throw new Error("fill all fields");
    setUploading(true);

    const formData = new FormData();
    formData.append("video", video);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("privacy", privacy);
    formData.append("accessToken", session?.accessToken as string);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setUploading(false);

    if (res.ok) {
      setMessage(`✅ Upload berhasil! Video ID: ${data.videoId}`);
      setVideo(null);
      setVideoPreview(null);
      setTitle("");
      setDescription("");
      setPrivacy("public");
    } else {
      setMessage("❌ Upload gagal: " + data.error);
    }
  };

  return (
    <div className="md:p-6 p-2 md:max-w-[80%] max-w-[100vw] mx-auto bg-background">
      <h1 className="text-2xl font-bold uppercase text-center">
        Upload Video TO Youtube
      </h1>
      {message && (
        <p className="mt-2 text-center text-green-600 font-semibold">
          {message}
        </p>
      )}

      <form onSubmit={handleUpload} className="mt-4 flex flex-col gap-4">
        {videoPreview && (
          <video
            src={videoPreview}
            controls
            className="w-full max-h-[300px] rounded-lg border shadow-md"
          />
        )}
        <label
          htmlFor="videoInput"
          className="flex items-center justify-center gap-2 p-4 border border-dashed rounded-md cursor-pointer hover:bg-[#272829]"
        >
          <File className="h-10 w-10 text-white" />
          <span className="text-white">
            {video ? "File Terpilih" : "Pilih File Video"}
          </span>
        </label>
        <input
          type="file"
          accept="video/*"
          onChange={handleVideoChange}
          required
          id="videoInput"
          className="hidden"
        />

        <div className="relative">
          <input
            type="text"
            placeholder="Judul Video"
            className="w-full p-3 border rounded-md pl-10"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <span className="absolute left-3 top-3 text-gray-500">
            <Upload size={20} />
          </span>
        </div>

        <div className="relative">
          <textarea
            placeholder="Deskripsi Video"
            className="w-full p-3 border rounded-md resize-none pl-10"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <span className="absolute left-3 top-3 text-gray-500">
            <File size={20} />
          </span>
        </div>

        <div className="relative">
          <select
            className="w-full p-3 border rounded-md appearance-none pl-10"
            value={privacy}
            onChange={(e) => setPrivacy(e.target.value)}
            required
          >
            <option value="public">Public</option>
            <option value="unlisted">Unlisted</option>
            <option value="private">Private</option>
          </select>
          <span className="absolute left-3 top-3 text-gray-500">
            {privacy === "public" ? (
              <Eye size={20} />
            ) : privacy === "unlisted" ? (
              <Link2 size={20} />
            ) : (
              <EyeOff size={20} />
            )}
          </span>
        </div>

        <button
          type="submit"
          disabled={uploading}
          className="w-full bg-[#272829] text-white p-3 rounded-md flex items-center justify-center gap-2 hover:bg-black transition"
        >
          {uploading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Uploading...
            </>
          ) : (
            <>
              <Upload size={20} />
              Upload
            </>
          )}
        </button>
      </form>
    </div>
  );
}
