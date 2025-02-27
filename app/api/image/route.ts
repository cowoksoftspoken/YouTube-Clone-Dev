import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const imageUrl = searchParams.get("url");
  const width = searchParams.get("width")
    ? parseInt(searchParams.get("width") as string)
    : 320;
  const format = searchParams.get("format") || "webp";

  if (!imageUrl) {
    return NextResponse.json(
      { error: "URL gambar diperlukan" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(imageUrl);
    const buffer = await response.arrayBuffer();

    let image = sharp(Buffer.from(buffer)).resize(width);

    if (format === "webp") {
      image = image.toFormat("webp");
    } else if (format === "jpeg") {
      image = image.toFormat("jpeg");
    }

    const optimizedImage = await image.toBuffer();

    return new NextResponse(optimizedImage, {
      headers: {
        "Content-Type": `image/${format}`,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error optimizing image:", error);
    return NextResponse.json(
      { error: "Gagal memproses gambar" },
      { status: 500 }
    );
  }
}
