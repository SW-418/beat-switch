"use client";

import NavigationBar from "./components/navigation-bar";

export default function Home() {
  return (
        <div className="min-h-screen flex flex-col items-center justify-center font-[family-name:var(--font-geist-sans)] w-[90%] mx-auto text-center">
          <div className="top-0 absolute pt-4 w-[90%] mx-auto">
            <NavigationBar />
          </div>
          <h1 className="text-4xl font-bold mb-8"> Beat Switch </h1>
          <h2 className="text-2xl font-bold mb-8"> Generate playlists and sync tracks between Spotify and Apple Music </h2>
        </div>
  );
}
