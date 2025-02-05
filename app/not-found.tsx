import Image from "next/image";

export default function NotFound() {
  return (
    <div className="flex justify-center flex-col items-center h-full">
      <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
      <p className="text-lg">The page you are looking for does not exist.</p>
      <Image
        src="/not-found.avif"
        className="rounded-full mt-4 w-20 h-20"
        alt="404"
        width={400}
        height={400}
      />
    </div>
  );
}
