import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

const cache = new Map();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const imageUrl = searchParams.get("url");
  const width = searchParams.get("width")
    ? parseInt(searchParams.get("width") as string)
    : 320;
  const format = searchParams.get("format") || "webp";
  const quality = searchParams.get("quality")
    ? parseInt(searchParams.get("quality") as string)
    : 100;

  if (!imageUrl) {
    return NextResponse.json(
      { error: "URL gambar diperlukan" },
      { status: 400 }
    );
  }

  const cacheKey = `${imageUrl}-${width}-${format}-${quality}`;

  if (cache.has(cacheKey)) {
    console.log(`🔥 Serving from cache: ${cacheKey}`);
    return new NextResponse(new Uint8Array(cache.get(cacheKey)), {
      headers: {
        "Content-Type": `image/${format}`,
        "Content-Length": cache.get(cacheKey).length.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }

  console.log(`🆕 Fetching new image: ${imageUrl}`);

  try {
    const response = await fetch(imageUrl);
    const buffer = await response.arrayBuffer();

    let image = sharp(Buffer.from(buffer)).resize(width, null, {
      kernel: "lanczos3",
    });

    if (format === "webp") {
      image = image.toFormat("webp", { quality, nearLossless: false });
    } else if (format === "jpeg" || format === "jpg") {
      image = image.toFormat("jpeg", {
        quality,
        progressive: true,
        mozjpeg: true,
      });
    } else if (format === "png") {
      image = image.toFormat("png", {
        quality,
        adaptiveFiltering: true,
        compressionLevel: 9,
      });
    }

    const optimizedImage = await image.toBuffer();

    cache.set(cacheKey, optimizedImage);
    console.log(`✅ Image cached: ${cacheKey}`);

    return new NextResponse(new Uint8Array(optimizedImage), {
      headers: {
        "Content-Type": `image/${format}`,
        "Content-Length": optimizedImage.length.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("❌ Error optimizing image:", error);
    return NextResponse.json(
      { error: "Gagal memproses gambar" },
      { status: 500 }
    );
  }
}
