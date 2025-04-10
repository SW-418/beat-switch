"use client";

import NavigationBar from "../components/navigation-bar";

export default function Apple() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center font-[family-name:var(--font-geist-sans)] w-[90%] mx-auto text-center">
      <div className="top-0 absolute pt-4 w-[90%] mx-auto">
        <NavigationBar />
      </div>
      <h1 className="text-4xl font-bold mb-8"> Apple Music </h1>
      <h2 className="text-2xl font-bold mb-8"> Hold on there brother we&apos;re still working on this </h2>
    </div>
  );
}
