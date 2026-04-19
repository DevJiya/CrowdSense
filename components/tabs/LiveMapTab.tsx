"use client";

import { useSimulation } from "@/components/SimulationContext";
import { Map, MapMarker, MarkerContent, MarkerTooltip, MapControls } from "@/components/ui/map";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function LiveMapTab() {
  const { currentStadium, zones, alerts } = useSimulation();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-black tracking-tighter text-zinc-200 uppercase">{currentStadium.name} Intelligence Map</h2>
        <div className="flex gap-4 text-[10px] font-bold">
          <div className="flex items-center gap-1.5 text-green-500">
            <span className="size-2 rounded-full bg-green-500" />
            SAFE: {Object.values(zones).filter(z => z.level === 'safe').length}
          </div>
          <div className="flex items-center gap-1.5 text-yellow-500">
            <span className="size-2 rounded-full bg-yellow-500" />
            MODERATE: {Object.values(zones).filter(z => z.level === 'moderate').length}
          </div>
          <div className="flex items-center gap-1.5 text-red-500">
            <span className="size-2 rounded-full bg-red-500 animate-pulse" />
            RISKY: {Object.values(zones).filter(z => z.level === 'risky').length}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 h-[650px] rounded-2xl border border-zinc-800 overflow-hidden relative shadow-2xl shadow-blue-500/5">
          {/* Neural Scan Overlay */}
          <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
             <div className="absolute w-full h-[20%] bg-gradient-to-b from-transparent via-blue-500/10 to-transparent animate-[scan_4s_linear_infinite]" />
          </div>

          <Map 
            center={currentStadium.location as [number, number]} 
            zoom={16.5}
            styles={{
              dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
            }}
          >
            <MapControls showZoom showLocate showFullscreen />
            
            {Object.values(zones).map(z => (
              <MapMarker key={z.name} longitude={z.coords[0]} latitude={z.coords[1]}>
                <MarkerContent>
                  <div className={cn(
                    "size-10 rounded-full border-2 flex items-center justify-center text-[10px] font-black transition-all duration-700 shadow-xl",
                    z.level === 'risky' 
                      ? "bg-red-600 border-red-200 text-white animate-pulse scale-125 shadow-red-500/50" 
                      : (z.level === 'moderate' ? "bg-yellow-500 border-yellow-200 text-black" : "bg-blue-600 border-blue-200 text-white")
                  )}>
                    {z.density}%
                  </div>
                </MarkerContent>
                <MarkerTooltip>
                  <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl">
                    <div className="font-black text-xs mb-1 uppercase tracking-widest text-zinc-100">{z.name}</div>
                    <div className="text-[10px] text-zinc-400 font-bold mb-2">TELEMETRY DATA</div>
                    <div className="space-y-1">
                      <div className="flex justify-between gap-4 text-[10px] text-zinc-500"><span>Occupancy</span><span className="text-zinc-200">{z.people.toLocaleString()}</span></div>
                      <div className="flex justify-between gap-4 text-[10px] text-zinc-500"><span>Density</span><span className="text-zinc-200">{z.density}%</span></div>
                      <div className="flex justify-between gap-4 text-[10px] text-zinc-500"><span>Status</span><span className={cn("font-black", z.level==='risky'?'text-red-500':'text-green-500')}>{z.level.toUpperCase()}</span></div>
                    </div>
                  </div>
                </MarkerTooltip>
              </MapMarker>
            ))}
          </Map>

          {/* Floating Map UI */}
          <div className="absolute top-6 left-6 z-20 space-y-2 pointer-events-none">
             <div className="bg-zinc-950/80 backdrop-blur-md border border-zinc-800 p-4 rounded-xl shadow-2xl">
                <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-3">Live Map Legend</div>
                <div className="space-y-2">
                   <div className="flex items-center gap-2 text-[10px] font-bold"><div className="size-2 rounded-full bg-red-600 animate-pulse"></div> CRITICAL SECTOR</div>
                   <div className="flex items-center gap-2 text-[10px] font-bold"><div className="size-2 rounded-full bg-yellow-500"></div> HIGH DENSITY</div>
                   <div className="flex items-center gap-2 text-[10px] font-bold"><div className="size-2 rounded-full bg-blue-600"></div> NOMINAL FLOW</div>
                </div>
             </div>
          </div>
        </div>

        <Card className="border-zinc-800 bg-zinc-950/50 flex flex-col">
          <CardHeader>
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Neural Event Log</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar max-h-[550px]">
            {alerts.slice(0, 15).map(a => (
              <div key={a.id} className="flex gap-3 items-start p-3 rounded-lg bg-zinc-900/30 border border-zinc-800/50 hover:border-zinc-700 transition-colors animate-in slide-in-from-right-5">
                <div className={cn(
                  "size-2 mt-1 rounded-full shrink-0",
                  a.category === 'danger' ? "bg-red-500 animate-pulse" : (a.category === 'warn' ? "bg-yellow-500" : "bg-blue-500")
                )} />
                <div className="space-y-1">
                  <div className="text-[10px] font-black text-zinc-300 leading-relaxed">{a.msg}</div>
                  <div className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">{a.time} IST</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      
      <style jsx global>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(500%); }
        }
      `}</style>
    </div>
  );
}
