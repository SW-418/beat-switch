export default function NavigationBar({ setActiveView }: { setActiveView: (view: 'home' | 'spotify' | 'apple') => void }) {
    return (
        <nav className="bg-white/5 backdrop-blur-sm rounded-lg mx-auto">
            <div className="flex-1 items-left justify-between p-2 pl-2 pr-2">
                <button 
                    onClick={() => setActiveView('home')}
                    className="text-white text-sm bg-white/10 hover:bg-white/15 px-4 py-1.5 rounded-lg transition-colors font-medium min-w-[90px] text-center"
                >
                    Home
                </button>
                <button 
                    onClick={() => setActiveView('spotify')}
                    className="text-white text-sm bg-white/10 hover:bg-white/15 px-2 py-1.5 rounded-lg transition-colors font-medium min-w-[90px] text-center"
                >
                    Spotify
                </button>
                <button 
                    disabled={true}
                    onClick={() => setActiveView('apple')}
                    className="text-white text-sm bg-white/10 hover:bg-white/15 px-2 py-1.5 rounded-lg transition-colors font-medium min-w-[90px] text-center"
                >
                    Apple Music
                </button>
            </div>
        </nav>
    );
}
