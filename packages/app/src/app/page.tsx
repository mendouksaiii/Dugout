export default function Home() {
  return (
    <main className="min-h-screen bg-dugout-black flex flex-col items-center justify-center gap-6 px-4">
      <div className="text-center animate-fade-in">
        <p className="text-dugout-electric font-mono text-sm tracking-[0.3em] uppercase mb-4">
          World Cup 2026 · On X Layer
        </p>
        <h1 className="font-display text-8xl md:text-[10rem] text-dugout-gold leading-none tracking-wider">
          DUGOUT
        </h1>
        <p className="text-dugout-muted mt-4 text-lg font-sans max-w-md mx-auto">
          Draft real World Cup players as NFTs. Challenge managers to matchday
          battles. Win on-chain.
        </p>
      </div>

      <div className="flex gap-4 mt-4">
        <div className="px-6 py-3 bg-dugout-gold text-dugout-black font-sans font-semibold rounded-sm cursor-pointer hover:bg-dugout-gold-light transition-colors">
          Build Your Squad
        </div>
        <div className="px-6 py-3 border border-dugout-muted-2 text-dugout-muted font-sans rounded-sm cursor-pointer hover:border-dugout-gold hover:text-dugout-gold transition-colors">
          View Squad Wars
        </div>
      </div>

      <div className="absolute bottom-6 flex items-center gap-2 text-dugout-muted-2 text-xs font-mono">
        <span className="w-2 h-2 rounded-full bg-dugout-electric animate-pulse" />
        Deployed on X Layer
      </div>
    </main>
  );
}
