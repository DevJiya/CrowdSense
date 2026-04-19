"use client";

import { useSimulation } from "@/components/SimulationContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function InsightsTab() {
  const { currentStadium, riskyCount, avgTrust, occupancy, zones, alerts, reports, totalCrowd, vibe } = useSimulation();
  
  const safeCount = Object.values(zones).filter(z => z.level === 'safe').length;
  const moderateCount = Object.values(zones).filter(z => z.level === 'moderate').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <MiniStat title="Risky" value={riskyCount} color="border-red-500" />
        <MiniStat title="Trust" value={`${avgTrust}%`} color="border-blue-500" />
        <MiniStat title="Load" value={`${occupancy}%`} color="border-purple-500" />
        <MiniStat title="Safe" value={safeCount} color="border-green-500" />
        <MiniStat title="Alerts" value={alerts.length} color="border-yellow-500" />
        <MiniStat title="Reports" value={reports.length} color="border-zinc-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-zinc-800 bg-zinc-950/50">
          <CardHeader>
            <CardTitle className="text-xs font-black uppercase tracking-widest text-zinc-500">Neural Occupancy Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-[200px] flex items-end gap-1">
            {/* Simulated bar chart */}
            {Array.from({ length: 24 }).map((_, i) => {
              const height = 40 + Math.random() * 50;
              return (
                <div 
                  key={i} 
                  className="flex-1 bg-blue-600/40 hover:bg-blue-600 transition-all cursor-pointer rounded-t-sm"
                  style={{ height: `${height}%` }}
                />
              );
            })}
          </CardContent>
          <div className="px-6 pb-4 flex justify-between text-[8px] font-black text-zinc-600 uppercase tracking-widest">
            <span>T-60M</span>
            <span>Real-Time Neural Stream</span>
            <span>LIVE</span>
          </div>
        </Card>

        <Card className="border-zinc-800 bg-zinc-950/50">
          <CardHeader>
            <CardTitle className="text-xs font-black uppercase tracking-widest text-zinc-500">Zone Safety Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            <DistributionBar label="Safe Zones" count={safeCount} total={8} color="bg-green-500" />
            <DistributionBar label="Moderate Zones" count={moderateCount} total={8} color="bg-yellow-500" />
            <DistributionBar label="Risky Zones" count={riskyCount} total={8} color="bg-red-500" />
          </CardContent>
        </Card>
      </div>

      <Card className="border-zinc-800 bg-zinc-950/50">
        <CardHeader>
          <CardTitle className="text-xs font-black uppercase tracking-widest text-zinc-500">Auto-Generated Intel Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-6 border border-zinc-900 bg-black/40 rounded-xl space-y-4">
            <p className="text-sm text-zinc-400 leading-relaxed">
              <span className="font-black text-zinc-200">{currentStadium.name}</span> is currently operating at <span className="font-black text-blue-400">{occupancy}% capacity</span> with <span className="font-black text-zinc-200">{totalCrowd.toLocaleString()} attendees</span>. 
              Neural analysis identifies <span className="font-black text-green-500">{safeCount} stable zones</span> and <span className="font-black text-red-500">{riskyCount} active anomalies</span>. 
              Average information reliability is calibrated at {avgTrust}%.
            </p>
            <div className="p-4 bg-zinc-900/50 rounded-lg border-l-4 border-blue-500">
              <div className="text-[10px] font-black text-blue-400 mb-2 uppercase tracking-widest">Recommended Action</div>
              <p className="text-xs text-zinc-300 font-medium italic">
                {riskyCount === 0 
                  ? "Neural patterns are stable. Continue baseline monitoring." 
                  : (riskyCount < 3 ? "Sector bottlenecking detected. Recommend manual verification of Gate A and Food Court." : "Critical density surge. Immediate rapid response deployment to risky sectors required.")}
              </p>
            </div>
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-zinc-600">
              <span>Sensor Delta: +4.2% / min</span>
              <span>Crowd Vibe: {vibe}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MiniStat({ title, value, color }: { title: string, value: string | number, color: string }) {
  return (
    <div className={cn("p-4 border bg-zinc-950/50 rounded-lg", color)}>
      <div className="text-[9px] font-black uppercase tracking-widest text-zinc-600 mb-1">{title}</div>
      <div className="text-lg font-black tracking-tighter text-zinc-200">{value}</div>
    </div>
  );
}

function DistributionBar({ label, count, total, color }: { label: string, count: number, total: number, color: string }) {
  const percentage = (count / total) * 100;
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-400">
        <span>{label}</span>
        <span>{count} / {total}</span>
      </div>
      <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
        <div 
          className={cn("h-full transition-all duration-1000", color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
