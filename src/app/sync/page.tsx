"use client";

import NavigationBar from "../components/navigation-bar";

export default function Sync() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center font-[family-name:var(--font-geist-sans)] w-[90%] mx-auto text-center">
            <div className="top-0 absolute pt-4 w-[90%] mx-auto">
                <NavigationBar />
            </div>
            <h1 className="text-4xl font-bold mb-8"> Sync </h1>
        </div>
    );
}
