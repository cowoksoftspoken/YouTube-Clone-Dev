const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

export async function fetchVideos(pageToken: string | null = null) {
  const params = new URLSearchParams({
    part: "snippet,statistics,contentDetails",
    chart: "mostPopular",
    maxResults: "12",
    regionCode: "ID",
    key: API_KEY!,
  });

  if (pageToken) {
    params.append("pageToken", pageToken);
  }

  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?${params}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch videos");
  }

  return response.json();
}

export async function fetchChannelDetails(channelId: string) {
  const params = new URLSearchParams({
    part: "snippet,statistics",
    id: channelId,
    key: API_KEY!,
  });

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?${params}`,
      {
        next: {
          revalidate: 3600,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch channel details: ${response.statusText}`
      );
    }

    const data = await response.json();
    if (!data.items || data.items.length === 0) {
      throw new Error("Channel not found");
    }

    return data.items[0];
  } catch (error) {
    console.error("Error fetching channel details:", error);
    throw error;
  }
}

export async function fetchChannelVideos(
  channelId: string,
  pageToken: string | null = null
) {
  const params = new URLSearchParams({
    part: "snippet",
    channelId: channelId,
    order: "date",
    maxResults: "20",
    key: API_KEY!,
  });

  if (pageToken) {
    params.append("pageToken", pageToken);
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?${params}`,
      {
        next: {
          revalidate: 3600,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch channel videos: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching channel videos:", error);
    throw error;
  }
}

export async function fetchVideoDetails(videoId: string) {
  const params = new URLSearchParams({
    part: "snippet,statistics",
    id: videoId,
    key: API_KEY!,
  });

  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?${params}`,
    {
      next: {
        revalidate: 3600,
      },
    }
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch video details: ${response.statusText}`);
  }

  const data = await response.json();
  return data.items[0];
}

export async function searchVideos(
  query: string,
  pageToken: string | null = null
) {
  const params = new URLSearchParams({
    part: "snippet",
    q: query,
    type: "video",
    maxResults: "20",
    key: API_KEY!,
  });

  if (pageToken) {
    params.append("pageToken", pageToken);
  }

  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/search?${params}`
  );
  if (!response.ok) {
    throw new Error(`"Failed to search videos" ${response.statusText}`);
  }

  return response.json();
}

export async function fetchChannelPlaylists(
  channelId: string,
  pageToken: string | null = null
) {
  const params = new URLSearchParams({
    part: "snippet,contentDetails",
    channelId: channelId,
    maxResults: "10",
    key: API_KEY!,
  });

  if (pageToken) {
    params.append("pageToken", pageToken);
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/playlists?${params}`,
      {
        next: {
          revalidate: 3600,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch channel playlists: ${response.statusText}`
      );
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching channel playlists:", error);
    throw error;
  }
}

export async function fetchSearchSuggestions(query: string): Promise<string[]> {
  const params = new URLSearchParams({
    part: "snippet",
    type: "search",
    q: query,
    maxResults: "10",
    key: API_KEY!,
  });

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?${params}`
    );
    if (!response.ok) {
      throw new Error(
        `Failed to fetch search suggestions: ${response.statusText}`
      );
    }
    const data = await response.json();
    return data.items.map((item: any) => item.snippet.title);
  } catch (error) {
    console.error("Error fetching search suggestions:", error);
    return [];
  }
}

export async function fetchChannelAbout(channelId: string) {
  const params = new URLSearchParams({
    part: "snippet,statistics,brandingSettings",
    id: channelId,
    key: API_KEY!,
  });

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?${params}`,
      {
        next: {
          revalidate: 3600,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch channel about: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.items || data.items.length === 0) {
      throw new Error("Channel not found");
    }

    return data.items[0];
  } catch (error) {
    console.error("Error fetching channel about:", error);
    throw error;
  }
}

export async function fetchPlaylistDetails(playlistId: string) {
  const params = new URLSearchParams({
    part: "snippet,contentDetails",
    id: playlistId,
    key: API_KEY!,
  });

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/playlists?${params}`,
      {
        next: {
          revalidate: 3600,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch playlist details: ${response.statusText}`
      );
    }

    const data = await response.json();
    if (!data.items || data.items.length === 0) {
      throw new Error("Playlist not found");
    }

    return data.items[0];
  } catch (error) {
    console.error("Error fetching playlist details:", error);
    throw error;
  }
}

export async function fetchPlaylistVideos(
  playlistId: string,
  pageToken: string | null = null
) {
  const params = new URLSearchParams({
    part: "snippet",
    playlistId: playlistId,
    maxResults: "50",
    key: API_KEY!,
  });

  if (pageToken) {
    params.append("pageToken", pageToken);
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?${params}`,
      {
        next: {
          revalidate: 3600,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch playlist videos: ${response.statusText}`
      );
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching playlist videos:", error);
    throw error;
  }
}

export async function fetchComments(
  videoId: string,
  pageToken: string | null = null
) {
  const params = new URLSearchParams({
    part: "snippet",
    videoId: videoId,
    maxResults: "20",
    key: API_KEY!,
  });

  if (pageToken) {
    params.append("pageToken", pageToken);
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/commentThreads?${params}`,
      {
        next: {
          revalidate: 3600,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch comments: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching comments:", error);
    throw error;
  }
}

export async function fetchCommentReplies(
  commentId: string,
  pageToken: string | null = null
) {
  const params = new URLSearchParams({
    part: "snippet",
    parentId: commentId,
    maxResults: "20",
    key: API_KEY!,
  });

  if (pageToken) {
    params.append("pageToken", pageToken);
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/comments?${params}`,
      {
        next: {
          revalidate: 3600,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch comment replies: ${response.statusText}`
      );
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching comment replies:", error);
    throw error;
  }
}
