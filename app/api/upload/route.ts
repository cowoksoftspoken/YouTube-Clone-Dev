import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";
import { createReadStream } from "fs";
import { writeFile } from "fs/promises";
import path from "path";
import os from "os";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("video") as File;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const accessToken = formData.get("accessToken");
    const privacy = formData.get("privacy") as string;

    if (!file || !title || !description || !accessToken || !privacy) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const tempFilePath = path.join(os.tmpdir(), file.name);
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    await writeFile(tempFilePath, fileBuffer);

    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken as string });

    const youtube = google.youtube({ version: "v3", auth });

    const videoMetadata = {
      snippet: { title, description },
      status: { privacyStatus: privacy },
    };

    const response = await youtube.videos.insert({
      part: ["snippet", "status"],
      requestBody: videoMetadata,
      media: {
        body: createReadStream(tempFilePath),
      },
    });

    return NextResponse.json({
      message: "Upload successful",
      videoId: response.data.id,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
