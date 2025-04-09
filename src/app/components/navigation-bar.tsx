"use client";

import { useRouter } from 'next/navigation';

export default function NavigationBar() {
    const router = useRouter();
    return (
        <nav className="bg-white/5 backdrop-blur-sm rounded-lg mx-auto">
            <div className="flex items-center justify-between">
                <div className="flex items-left p-2">
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => router.push('/')}
                        className="text-white text-sm bg-white/10 hover:bg-white/15 px-2 py-1.5 rounded-lg transition-colors font-medium min-w-[90px] text-center"
                        >
                            Home
                        </button>
                        <button 
                            onClick={() => router.push('/spotify')}
                            className="text-white text-sm bg-green-500 hover:bg-green-600 px-2 py-1.5 rounded-lg transition-colors font-medium min-w-[90px] text-center"
                        >
                            Spotify
                        </button>
                        <button 
                            onClick={() => router.push('/apple')}
                            className="text-white text-sm bg-pink-500 hover:bg-pink-600 px-2 py-1.5 rounded-lg transition-colors font-medium min-w-[90px] text-center"
                        >
                            Apple Music
                        </button>
                        <button 
                            onClick={() => router.push('/sync')}
                            className="text-white text-sm bg-gradient-to-r from-green-500 to-pink-500 px-2 py-1.5 rounded-lg transition-all duration-300 font-medium min-w-[90px] text-center"
                        >
                            Sync
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
