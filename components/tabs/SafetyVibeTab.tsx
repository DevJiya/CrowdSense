"use client";

import { useSimulation } from "@/components/SimulationContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function SafetyVibeTab() {
  const { avgTrust, riskyCount, vibe, occupancy, zones } = useSimulation();
  
  const safetyScore = Math.max(0, avgTrust - (riskyCount * 8));
  const scoreColor = safetyScore > 70 ? "text-green-500" : (safetyScore > 40 ? "text-yellow-500" : "text-red-500");

  return (
    <div className="space-y-6">
      <Card className="border-zinc-800 bg-zinc-950/50">
        <CardContent className="py-12 flex flex-col items-center text-center">
          <div className="text-[10px] font-black tracking-[0.2em] text-zinc-500 mb-4 uppercase">Overall Safety Score</div>
          <div className={cn("text-7xl font-black tracking-tighter mb-4 transition-all duration-500", scoreColor)}>
            {safetyScore}
          </div>
          <div className="text-xl font-bold text-zinc-200">
            {safetyScore > 70 ? 'SAFE TO ATTEND' : (safetyScore > 40 ? 'EXERCISE CAUTION' : 'HIGH RISK EVENT')}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-zinc-800 bg-zinc-950/50">
          <CardHeader>
            <CardTitle className="text-xs font-black uppercase tracking-widest text-zinc-500">Atmosphere Readings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <VibeRow label="Overall Vibe" value={vibe} icon="✦" />
            <VibeRow label="Crowd Mood" value={riskyCount === 0 ? 'Excited' : (riskyCount < 3 ? 'Nervous' : 'Agitated')} icon="😊" />
            <VibeRow label="Noise Level" value="92dB (Loud)" icon="🔊" />
            <VibeRow label="Exit Pressure" value={occupancy > 80 ? 'High' : (occupancy > 60 ? 'Moderate' : 'Low')} icon="🚪" />
            <VibeRow label="Event Phase" value="Match in Progress" icon="⏲" />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-zinc-800 bg-zinc-950/50">
          <CardHeader>
            <CardTitle className="text-xs font-black uppercase tracking-widest text-zinc-500">Zone Safety Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.values(zones).map(z => (
              <div key={z.name} className="p-4 border border-zinc-900 rounded-lg bg-black/20">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-zinc-300">{z.name}</span>
                  <span className={cn(
                    "text-[8px] font-black px-2 py-0.5 rounded",
                    z.level === 'risky' ? "bg-red-500 text-white" : (z.level === 'moderate' ? "bg-yellow-500 text-black" : "bg-green-500 text-white")
                  )}>
                    {z.level.toUpperCase()}
                  </span>
                </div>
                <div className="h-1 bg-zinc-900 rounded-full mb-3">
                  <div 
                    className={cn("h-full", z.level === 'risky' ? "bg-red-500" : (z.level === 'moderate' ? "bg-yellow-500" : "bg-green-500"))}
                    style={{ width: `${z.density}%` }}
                  />
                </div>
                <p className="text-[10px] text-zinc-500 italic">
                  {z.level === 'safe' ? "Good to be in this zone. Movement is easy." : (z.level === 'moderate' ? "Zone getting busy. Stay alert." : "Avoid this zone immediately. High pressure.")}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function VibeRow({ label, value, icon }: { label: string, value: string, icon: string }) {
  return (
    <div className="flex items-center gap-4 py-2 border-b border-zinc-900 last:border-0">
      <span className="text-xl">{icon}</span>
      <div className="flex-1">
        <div className="text-[9px] font-black uppercase tracking-widest text-zinc-600">{label}</div>
        <div className="text-sm font-black text-blue-400">{value}</div>
      </div>
    </div>
  );
}
