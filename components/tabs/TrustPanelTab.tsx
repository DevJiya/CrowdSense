"use client";

import { useSimulation } from "@/components/SimulationContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function TrustPanelTab() {
  const { zones, riskyCount } = useSimulation();

  return (
    <div className="space-y-6">
      <Card className="border-zinc-800 bg-zinc-950/50">
        <CardHeader>
          <CardTitle className="text-xs font-black uppercase tracking-widest text-zinc-500">Zone Information Reliability</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.values(zones).map(z => (
            <div key={z.name} className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-zinc-300">{z.name} Reliability</span>
                <span className={cn(
                  z.trust > 75 ? "text-green-500" : (z.trust > 50 ? "text-yellow-500" : "text-red-500")
                )}>{Math.round(z.trust)}%</span>
              </div>
              <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full transition-all duration-500",
                    z.trust > 75 ? "bg-green-500" : (z.trust > 50 ? "bg-yellow-500" : "bg-red-500")
                  )}
                  style={{ width: `${z.trust}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <BehaviorCard title="Crowd Cooperation" value={Math.floor(70 + Math.random() * 25)} />
        <BehaviorCard title="Panic Risk Level" value={riskyCount > 2 ? 'HIGH' : (riskyCount > 0 ? 'MODERATE' : 'LOW')} color={riskyCount > 2 ? 'text-red-500' : (riskyCount > 0 ? 'text-yellow-500' : 'text-green-500')} />
        <BehaviorCard title="Info Spread" value="Normal" />
        <BehaviorCard title="Compliance" value={`${Math.floor(60 + Math.random() * 30)}%`} />
      </div>

      <Card className="border-zinc-800 bg-zinc-950/50">
        <CardHeader>
          <CardTitle className="text-xs font-black uppercase tracking-widest text-zinc-500">Zone Vibe Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-zinc-900">
          {Object.values(zones).map(z => {
            const vibe = z.density < 30 ? 'Calm' : (z.density < 55 ? 'Active' : (z.density < 75 ? 'Tense' : 'Panicked'));
            const desc = z.density < 30 ? "Relaxed and well spread out" : (z.density < 55 ? "Normal movement" : (z.density < 75 ? "Noticeable crowding" : "Dangerously high pressure"));
            return (
              <div key={z.name} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="font-bold text-sm text-zinc-300">{z.name}</div>
                <div className="flex items-center gap-6">
                  <div className={cn(
                    "text-[10px] font-black uppercase px-3 py-1 rounded min-w-[80px] text-center",
                    z.density > 75 ? "bg-red-500/20 text-red-500" : (z.density > 55 ? "bg-yellow-500/20 text-yellow-500" : "bg-zinc-800 text-zinc-400")
                  )}>
                    {vibe}
                  </div>
                  <div className="text-xs text-zinc-500 italic">"{desc}"</div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

function BehaviorCard({ title, value, color }: { title: string, value: string | number, color?: string }) {
  return (
    <Card className="border-zinc-800 bg-zinc-950/50">
      <CardContent className="pt-6">
        <div className="text-[10px] font-black tracking-widest text-zinc-600 mb-1">{title}</div>
        <div className={cn("text-xl font-black", color || "text-zinc-200")}>{value}</div>
      </CardContent>
    </Card>
  );
}
