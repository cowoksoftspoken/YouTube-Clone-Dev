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
    throw new Error("Failed to fetch video details");
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
    throw new Error("Failed to search videos");
  }

  return response.json();
}
