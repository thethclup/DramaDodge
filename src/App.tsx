import { useState, useEffect } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { GameState } from './game/engine';
import { useAccount, useConnect, useDisconnect, useSignMessage, useSendTransaction, useSendCalls } from 'wagmi';
import { concat, Hex } from 'viem';
import { BUILDER_CODE } from './lib/erc8021';
import { SiweMessage } from 'siwe';
import { Sun } from 'lucide-react';

const BUILDER_SUFFIX = '0x07626173656170700080218021802180218021802180218021' as Hex;

export default function App() {
  const { address, isConnected } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();

  const [isPlaying, setIsPlaying] = useState(false);
  const [triggerReset, setTriggerReset] = useState(0);
  const [gameState, setGameState] = useState<GameState>({
    score: 0, distance: 0, hype: 0, isGameOver: false, isPaused: false, combo: 0
  });

  const [leaderboard, setLeaderboard] = useState<{address: string, score: number}[]>([]);

  useEffect(() => {
    if (gameState.isGameOver) {
      setIsPlaying(false);
    }
  }, [gameState.isGameOver]);

  const startGame = () => {
    setIsPlaying(true);
    setTriggerReset(prev => prev + 1);
  };

  const handleSignScore = async () => {
    if (!isConnected || !address) return alert("Please connect wallet first!");
    
    try {
      const message = new SiweMessage({
        domain: window.location.host,
        address: address as string,
        statement: `I survived Drama Dodger! Score: ${gameState.score}, Hype: ${Math.floor(gameState.distance)}. Builder Code: ${BUILDER_CODE}.`,
        uri: window.location.origin,
        version: '1',
        chainId: 8453, // Base Mainnet
        nonce: '12345678', // Base MCP or standard SIWE requires a nonce
      });
      // A real app would get nonce from backend. Using a mock nonce here.
      const preparedMessage = message.prepareMessage();
      const signature = await signMessageAsync({ account: address as `0x${string}`, message: preparedMessage });
      
      console.log("SIWE Signature:", signature);
      alert(`Score securely signed on-chain!\nScore: ${gameState.score}`);
      // Mock saving to a leaderboard
      setLeaderboard(prev => [...prev, { address: address.substring(0, 6) + '...', score: gameState.score }].sort((a,b)=>b.score - a.score));

    } catch(err) {
      console.error(err);
      alert("Failed to sign score.");
    }
  };

  const { sendTransactionAsync } = useSendTransaction();
  const { sendCallsAsync } = useSendCalls();

  const sendGMTransaction = async () => {
    if (!isConnected) return alert("Connect Wallet!");
    try {
      if (sendCallsAsync) {
        try {
          const txId = await sendCallsAsync({
            calls: [
              {
                to: '0xcD0dd3716C5561De47a24949335dF8a8CD8F71a3',
                value: 0n,
                data: '0x',
              }
            ],
            capabilities: {
              dataSuffix: {
                value: BUILDER_SUFFIX,
                optional: true,
              }
            }
          });
          console.log("GM Transaction calls sent!", txId);
          alert(`GM Transaction sent via sendCalls! ID: ${txId}`);
          return;
        } catch (e) {
          console.warn("sendCalls failed or not fully supported by wallet, falling back to EOA sendTransaction...");
        }
      }

      const calldata = '0x';
      const attributedCalldata = concat([calldata, BUILDER_SUFFIX]);
      
      const tx = await sendTransactionAsync({
        to: '0xcD0dd3716C5561De47a24949335dF8a8CD8F71a3',
        data: attributedCalldata,
        value: 0n,
      });
      console.log("GM Transaction successful! Hash:", tx);
      alert(`GM Transaction sent! Hash: ${tx}`);
    } catch (err) {
      console.error(err);
      alert("Failed to send GM Transaction.");
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#050505] text-white font-sans overflow-hidden border-4 lg:border-[12px] border-[#1a1a1a]">
      {/* Top Header */}
      <div className="flex justify-between items-center px-4 py-4 lg:px-12 lg:py-8 bg-[#111] border-b-2 border-[#333] shadow-[0_0_30px_rgba(0,255,100,0.1)]">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#00FF00] font-bold hidden sm:block">Total Distance</span>
          <span className="text-3xl lg:text-5xl font-black italic text-white tracking-tighter">{Math.floor(gameState.distance)}<span className="text-xl lg:text-2xl ml-1 opacity-50">m</span></span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#FF00FF] font-bold hidden sm:block">Social Score</span>
          <span className="text-4xl lg:text-6xl font-black italic text-[#FF00FF] [text-shadow:2px_2px_0px_#440044] lg:[text-shadow:4px_4px_0px_#440044] tracking-tight">{gameState.score}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#00FFFF] font-bold hidden sm:block">Hype Meter</span>
          <div className="flex items-center gap-4">
            <span className="text-2xl lg:text-4xl font-black">{Math.floor(gameState.hype)}%</span>
            <div className="w-24 lg:w-48 h-6 bg-[#222] rounded-full border border-[#00FFFF] overflow-hidden hidden md:block">
              <div className="h-full bg-gradient-to-r from-[#00FFFF] to-[#0055FF] shadow-[0_0_15px_#00FFFF] transition-all duration-200" style={{ width: `${gameState.hype}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row relative min-h-0">
        
        {/* Left Sidebar (Trending / Arsenal) */}
        <div className="hidden lg:flex w-64 border-r border-[#222] bg-[#0a0a0a] p-6 flex-col gap-6 overflow-y-auto">
          <div className="text-xs font-bold uppercase tracking-widest text-zinc-500">Trending Drama</div>
          <div className="flex flex-col gap-4">
            <div className="p-3 bg-[#1a0a0a] border-l-2 border-red-500 rounded">
              <div className="text-[10px] text-red-400 font-bold uppercase">Hot!</div>
              <div className="text-sm italic">"Elon Tweeted..."</div>
            </div>
            <div className="p-3 bg-[#0a1a0a] border-l-2 border-green-500 rounded">
              <div className="text-[10px] text-green-400 font-bold uppercase">Bullish</div>
              <div className="text-sm italic">"GM Gang Spammers"</div>
            </div>
            <div className="p-3 bg-[#1a0a1a] border-l-2 border-purple-500 rounded">
              <div className="text-[10px] text-purple-400 font-bold uppercase">FUD Wave</div>
              <div className="text-sm italic">"SEC is watching..."</div>
            </div>
          </div>

          <div className="mt-auto">
            <div className="text-xs font-bold uppercase text-zinc-500 mb-2">My Arsenal</div>
            <div className="grid grid-cols-2 gap-2">
              <div className="aspect-square bg-[#222] rounded border border-[#444] flex flex-col items-center justify-center p-2">
                <div className="text-xl">🤡</div>
                <div className="text-[8px] mt-1 text-center">CLOWN MASK</div>
              </div>
              <div className="aspect-square bg-[#00FF00]/20 rounded border border-[#00FF00] flex flex-col items-center justify-center p-2">
                <div className="text-xl text-[#00FF00]">⚡</div>
                <div className="text-[8px] mt-1 text-center">VIRAL DASH</div>
              </div>
            </div>
          </div>
        </div>

        {/* Center Canvas Area */}
        <div className="flex-1 relative overflow-hidden bg-[radial-gradient(circle_at_center,_#111_0%,_#000_100%)] flex flex-col items-center justify-center">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#333 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
          
          <div className="absolute bottom-10 left-10 text-white opacity-5 pointer-events-none hidden md:block">
            <div className="text-8xl font-black tracking-tighter">DODGER</div>
          </div>
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-20 hidden lg:block">
             <div className="w-[800px] h-[1px] bg-white"></div>
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1px] h-[800px] bg-white"></div>
          </div>
          
          {/* Main Game Container */}
          <div className="relative w-full max-w-2xl h-full flex items-center justify-center p-0 z-10">
            {/* Start Screen */}
            {!isPlaying && !gameState.isGameOver && (
               <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm p-6 text-center">
                   <div className="absolute left-10 top-[20%] w-24 h-24 bg-[#00FF00] rounded-xl flex items-center justify-center border-4 border-white shadow-[0_0_30px_rgba(0,255,0,0.5)] rotate-[-12deg] hidden md:flex animate-pulse">
                     <span className="text-3xl font-black text-black">BASED</span>
                   </div>
                   <div className="absolute right-[10%] top-[30%] px-6 py-2 bg-red-600 font-black italic text-2xl skew-x-[-15deg] shadow-[5px_5px_0_black] hidden md:block">
                     RATIO
                   </div>

                   <div className="text-6xl mb-6 animate-bounce">🤡</div>
                   <h2 className="text-5xl font-black mb-4 text-white drop-shadow-[0_0_15px_rgba(0,255,255,0.8)] italic tracking-tighter uppercase">DODGE THE DRAMA</h2>
                   <p className="text-[#00FFFF] text-sm md:text-base mb-8 font-bold tracking-widest uppercase">Swipe/Tap top to Jump. Bottom to Slide.</p>
                   <button 
                       onClick={startGame}
                       className="w-full max-w-sm py-5 rounded-none border-b-4 border-r-4 border-black font-black text-2xl text-black bg-[#00FF00] hover:bg-[#00cc00] hover:translate-y-[2px] hover:translate-x-[2px] hover:border-b-2 hover:border-r-2 active:scale-95 transition-all uppercase tracking-tighter"
                   >
                       ENTER THE TRENCHES
                   </button>
               </div>
            )}

            {/* Game Over Screen */}
            {!isPlaying && gameState.isGameOver && (
               <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#110000]/90 backdrop-blur-md p-6 text-center border-[12px] border-[#440000]">
                   <div className="text-7xl mb-4 animate-pulse">📉</div>
                   <h2 className="text-6xl font-black text-[#FF0000] mb-2 [text-shadow:4px_4px_0px_#440000] italic tracking-tighter uppercase">REKT.</h2>
                   <div className="bg-red-950/80 border-l-4 border-[#FF0000] p-4 mb-8">
                     <p className="text-white font-mono text-lg uppercase tracking-widest">Score: <span className="text-[#00FF00] font-black">{gameState.score}</span> | Combo: <span className="text-[#FF00FF] font-black">{gameState.combo}</span></p>
                   </div>
                   
                   <div className="flex flex-col gap-4 w-full max-w-sm">
                     <button 
                         onClick={handleSignScore}
                         disabled={!isConnected}
                         className="w-full py-4 rounded-none border-b-4 border-[#440044] font-black italic text-xl text-white bg-[#FF00FF] hover:bg-[#cc00cc] disabled:bg-[#333] disabled:text-[#666] disabled:border-[#222] transition-colors uppercase tracking-tight flex items-center justify-center gap-3"
                     >
                         {isConnected ? "✍️ RECORD THIS RUN ON-CHAIN" : "🔒 CONNECT WALLET"}
                     </button>
                     
                     <button 
                         onClick={startGame}
                         className="w-full py-4 rounded-none border-b-4 border-zinc-600 font-black italic text-xl text-black bg-white hover:bg-zinc-200 transition-colors uppercase tracking-tight"
                     >
                         🔄 APE BACK IN
                     </button>

                     {isConnected && (
                       <div className="flex justify-center mt-2">
                         <button 
                           onClick={sendGMTransaction}
                           className="px-3 py-2 rounded-lg bg-[#E8A020]/20 hover:bg-[#E8A020]/30 border border-[#E8A020]/40 text-[#E8A020] transition-colors flex items-center gap-2 font-['Cinzel'] text-xs font-bold"
                         >
                           <Sun size={16} />
                           Say GM
                         </button>
                       </div>
                     )}
                   </div>
               </div>
            )}

            <div className="w-full h-full relative flex items-center justify-center p-2 md:p-8">
              <GameCanvas isStarted={isPlaying} onStateChange={setGameState} triggerReset={triggerReset} />
            </div>
            
          </div>
        </div>

        {/* Right Sidebar (Leaderboard / Actions) */}
        <div className="w-full md:w-72 lg:w-80 border-t md:border-t-0 md:border-l border-[#222] bg-[#0a0a0a] p-4 lg:p-6 flex flex-col shrink-0">
          <div className="text-xs font-bold uppercase tracking-widest text-[#00FF00] mb-4">On-Chain Leaderboard</div>
          
          <div className="flex flex-col gap-3 overflow-y-auto max-h-48 md:max-h-none flex-1">
            {leaderboard.length === 0 ? (
                <div className="flex items-center justify-between p-3 bg-white/5 rounded border border-white/10 opacity-50">
                   <span className="text-xs font-bold italic">No legends yet. Be the first!</span>
                </div>
            ) : (
                leaderboard.slice(0,5).map((l, i) => (
                    <div key={i} className={`flex items-center justify-between p-3 rounded border ${i === 0 ? 'bg-[#00FF00]/10 border-[#00FF00]/50' : 'bg-white/5 border-white/10'}`}>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-bold ${i === 0 ? 'text-[#00FF00] italic' : 'opacity-30'}`}>0{i+1}</span>
                        <div className={`w-6 h-6 rounded-full ${i === 0 ? 'bg-white border-2 border-[#00FF00]' : 'bg-[#FF00FF]'}`}></div>
                        <span className={`text-sm font-bold ${i === 0 ? 'text-[#00FF00]' : ''}`}>{l.address}</span>
                      </div>
                      <span className="text-xs font-mono">{l.score}</span>
                    </div>
                ))
            )}
          </div>

          <div className="mt-4 md:mt-auto pt-6 border-t border-[#222] flex flex-row md:flex-col gap-3 shrink-0">
            {isConnected && (
              <button 
                onClick={sendGMTransaction}
                className="px-3 py-2 rounded-lg bg-[#E8A020]/20 hover:bg-[#E8A020]/30 border border-[#E8A020]/40 text-[#E8A020] transition-colors flex items-center gap-2 font-['Cinzel'] text-xs font-bold"
              >
                <Sun size={16} />
                Say GM
              </button>
            )}
            <div 
              onClick={() => alert("Trustless Agents ERC-8004 Stub Called")}
              className="flex-1 md:flex-none p-3 lg:p-4 bg-[#FF00FF]/20 rounded-none border border-[#FF00FF] text-center cursor-pointer hover:bg-[#FF00FF]/30 active:scale-95 transition-all group flex flex-col justify-center"
            >
              <div className="text-sm font-black italic uppercase text-[#FF00FF] group-hover:text-white">DEPLOY AGENT</div>
            </div>
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="bg-[#000] p-3 lg:p-4 flex items-center justify-between text-[10px] lg:text-[11px] font-mono border-t border-[#222] shrink-0">
        <div className="flex items-center gap-2 lg:gap-6">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${isConnected ? 'bg-[#00FF00]' : 'bg-red-500'}`}></div>
            <span className="text-zinc-400 hidden sm:inline">BASE MAINNET: </span>
            <span className={isConnected ? "text-white uppercase font-bold" : "text-zinc-500 uppercase"}>
              {isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>
          {isConnected ? (
              <div className="flex items-center gap-2 bg-[#222] px-2 py-1 ml-2">
                <span className="text-zinc-500 italic hidden md:inline">WALLET:</span>
                <span className="text-[#00FF00] cursor-pointer hover:underline" onClick={() => disconnect()}>
                  {address?.substring(0,6)}...{address?.substring(address.length - 4)} <span className="text-zinc-500 hidden sm:inline">(Disconnect)</span>
                </span>
              </div>
          ) : (
              <button 
                  onClick={() => connect({ connector: connectors[0] })}
                  className="px-2 lg:px-3 py-1 bg-[#00FF00] text-black font-bold uppercase hover:bg-white ml-2 transition-colors cursor-pointer"
              >
                  Connect Wallet
              </button>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-zinc-500 uppercase hidden md:inline">Builder: {BUILDER_CODE}</span>
          <span className="px-2 lg:px-3 py-1 bg-white text-black font-black uppercase tracking-tighter">v1.1.0</span>
        </div>
      </div>
      
    </div>
  );
}
