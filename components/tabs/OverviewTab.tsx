"use client";

import { useSimulation } from "@/components/SimulationContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function OverviewTab() {
  const { currentStadium, zones, alerts, reports, occupancy, totalCrowd, riskyCount, avgTrust, setStadium } = useSimulation();

  return (
    <div className="space-y-6">
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['wankhede', 'eden', 'chinnaswamy'].map(id => (
          <button
            key={id}
            onClick={() => setStadium(id)}
            className={cn(
              "px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap",
              currentStadium.id === id ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            )}
          >
            {id}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="TOTAL CROWD" value={totalCrowd.toLocaleString()} color="text-blue-400" />
        <StatCard title="OCCUPANCY" value={`${occupancy}%`} color={occupancy > 80 ? "text-red-500" : "text-green-500"} />
        <StatCard title="RISKY ZONES" value={riskyCount} color={riskyCount > 0 ? "text-red-500" : "text-green-500"} />
        <StatCard title="AVG TRUST" value={`${avgTrust}%`} color={avgTrust > 75 ? "text-green-500" : "text-yellow-500"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-zinc-800 bg-zinc-950/50">
          <CardHeader>
            <CardTitle className="text-xs font-black uppercase tracking-widest text-zinc-500">Zone Status Grid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.values(zones).map(z => (
                <div 
                  key={z.name} 
                  className={cn(
                    "p-4 border-l-4 rounded bg-zinc-900/50 hover:bg-zinc-900 transition-colors cursor-pointer",
                    z.level === 'risky' ? "border-red-500 animate-pulse" : (z.level === 'moderate' ? "border-yellow-500" : "border-green-500")
                  )}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-sm text-zinc-200">{z.name}</span>
                    <span className={cn(
                      "text-[10px] font-black uppercase px-2 py-0.5 rounded",
                      z.level === 'risky' ? "bg-red-500/20 text-red-500" : (z.level === 'moderate' ? "bg-yellow-500/20 text-yellow-500" : "bg-green-500/20 text-green-500")
                    )}>{z.level}</span>
                  </div>
                  <div className="text-[10px] text-zinc-500 mb-2">
                    👤 {z.people.toLocaleString()}  |  📍 {z.density}%
                  </div>
                  <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full transition-all duration-500",
                        z.level === 'risky' ? "bg-red-500" : (z.level === 'moderate' ? "bg-yellow-500" : "bg-green-500")
                      )}
                      style={{ width: `${z.density}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-950/50">
          <CardHeader>
            <CardTitle className="text-xs font-black uppercase tracking-widest text-zinc-500">Live Activity Feed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {[...alerts, ...reports].sort((a, b) => parseInt(b.id) - parseInt(a.id)).slice(0, 20).map(item => {
              const isAlert = 'category' in item;
              return (
                <div key={item.id} className={cn(
                  "p-3 border rounded text-xs transition-all duration-300 slide-in-right",
                  isAlert 
                    ? `border-${item.category === 'danger' ? 'red' : (item.category === 'warn' ? 'yellow' : 'blue')}-500/30 bg-${item.category === 'danger' ? 'red' : (item.category === 'warn' ? 'yellow' : 'blue')}-500/5`
                    : "border-zinc-800 bg-zinc-900/30"
                )}>
                  <div className="flex justify-between items-center mb-1">
                    <span className={cn(
                      "font-black uppercase text-[9px]",
                      isAlert ? "text-blue-400" : "text-zinc-500"
                    )}>
                      {isAlert ? item.type : item.user}
                    </span>
                    <span className="text-[9px] text-zinc-600">{item.time}</span>
                  </div>
                  <p className={cn("font-medium", isAlert ? "text-zinc-200" : "text-zinc-400")}>{item.msg}</p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, color }: { title: string, value: string | number, color: string }) {
  return (
    <Card className="border-zinc-800 bg-zinc-950/50">
      <CardContent className="pt-6">
        <div className="text-[10px] font-black tracking-widest text-zinc-500 mb-1">{title}</div>
        <div className={cn("text-2xl font-black tracking-tighter", color)}>{value}</div>
      </CardContent>
    </Card>
  );
}
