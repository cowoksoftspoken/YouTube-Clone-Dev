import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";

function getYouTubeClient(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.youtube({ version: "v3", auth });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const accessToken = searchParams.get("accessToken");

    if (!accessToken) {
      return NextResponse.json(
        { error: "Missing access token" },
        { status: 401 }
      );
    }

    const youtube = getYouTubeClient(accessToken);

    const channelResponse = await youtube.channels.list({
      part: ["contentDetails"],
      mine: true,
    });

    const uploadsPlaylistId =
      channelResponse.data.items?.[0]?.contentDetails?.relatedPlaylists
        ?.uploads;

    if (!uploadsPlaylistId) {
      return NextResponse.json(
        { error: "Failed to fetch uploads playlist" },
        { status: 404 }
      );
    }

    const videoResponse = await youtube.playlistItems.list({
      part: ["id", "snippet", "status"],
      playlistId: uploadsPlaylistId,
      maxResults: 10,
    });

    return NextResponse.json(videoResponse.data.items);
  } catch (error) {
    console.error("Error fetching videos:", error);
    return NextResponse.json(
      { error: "Failed to fetch videos" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { videoId, title, description, accessToken } = await req.json();

    if (!videoId || !title || !description || !accessToken) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const youtube = getYouTubeClient(accessToken);
    const videoResponse = await youtube.videos.list({
      part: ["snippet"],
      id: videoId,
    });

    const video = videoResponse.data.items?.[0];

    if (!video) {
      throw new Error("Video tidak ditemukan!");
    }

    const categoryId = video.snippet?.categoryId?.toString() || "22";

    await youtube.videos.update({
      part: ["snippet"],
      requestBody: {
        id: videoId,
        snippet: {
          title,
          description,
          categoryId,
        },
      },
    });

    return NextResponse.json({ message: "Video updated successfully" });
  } catch (error) {
    console.error("Error updating video:", error);
    return NextResponse.json(
      { error: "Failed to update video" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { videoId, accessToken } = await req.json();

    if (!videoId || !accessToken) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const youtube = getYouTubeClient(accessToken);

    await youtube.videos.delete({ id: videoId });

    return NextResponse.json({ message: "Video deleted successfully" });
  } catch (error) {
    console.error("Error deleting video:", error);
    return NextResponse.json(
      { error: "Failed to delete video" },
      { status: 500 }
    );
  }
}
