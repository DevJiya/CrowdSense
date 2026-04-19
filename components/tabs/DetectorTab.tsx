"use client";

import { useSimulation } from "@/components/SimulationContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function DetectorTab() {
  const { riskyCount, zones, alerts } = useSimulation();
  
  const anomalies = Object.values(zones).filter(z => z.density > 80 || z.trust < 50);

  return (
    <div className="space-y-6">
      <Card className={cn(
        "border-zinc-800 bg-zinc-950/50 transition-colors duration-500",
        anomalies.length > 0 ? "border-red-900/50" : "border-green-900/50"
      )}>
        <CardContent className="py-10 flex flex-col items-center text-center">
          <div className={cn(
            "size-12 rounded-full mb-6 flex items-center justify-center animate-pulse",
            anomalies.length > 0 ? "bg-red-500" : "bg-green-500"
          )}>
            <div className="size-4 bg-white rounded-full" />
          </div>
          <h2 className="text-2xl font-black tracking-tighter mb-2">
            {anomalies.length > 0 ? `${anomalies.length} ANOMALIES DETECTED` : "ALL SYSTEMS NORMAL"}
          </h2>
          <p className="text-sm text-zinc-500 font-medium">Neural Sensor Array: Active Monitoring</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-zinc-800 bg-zinc-950/50">
          <CardHeader>
            <CardTitle className="text-xs font-black uppercase tracking-widest text-zinc-500">Active Threat Monitor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {anomalies.length > 0 ? (
              anomalies.map(z => (
                <div key={z.name} className="p-4 border border-red-900/30 bg-red-950/10 rounded-lg">
                  <div className="font-black text-xs text-red-500 mb-1 uppercase tracking-widest">High Density Anomaly</div>
                  <p className="text-sm text-zinc-200">
                    Threshold breach in <span className="font-bold text-white">{z.name}</span>. 
                    Current density at <span className="font-black text-red-400">{z.density}%</span>.
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-zinc-700 font-bold uppercase tracking-widest text-xs">
                No active threats
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-950/50">
          <CardHeader>
            <CardTitle className="text-xs font-black uppercase tracking-widest text-zinc-500">Detection Log</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {alerts.filter(a => a.category === 'danger' || a.category === 'warn').map(a => (
              <div key={a.id} className="p-2 border-b border-zinc-900 font-mono text-[10px] flex gap-3">
                <span className="text-blue-500 shrink-0">[{a.time}]</span>
                <span className="text-zinc-400"><span className="text-zinc-200 font-bold">BREACH:</span> {a.msg}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border-zinc-800 bg-zinc-950/50">
        <CardHeader>
          <CardTitle className="text-xs font-black uppercase tracking-widest text-zinc-500">Neural Sensor Array (32 Nodes)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            {Array.from({ length: 32 }).map((_, i) => {
              const status = Math.random() > 0.9 ? 'offline' : (Math.random() > 0.7 ? 'degraded' : 'online');
              return (
                <div key={i} className={cn(
                  "p-2 border rounded-md text-center transition-all duration-1000",
                  status === 'online' ? "border-green-900/30 text-green-500" : (status === 'degraded' ? "border-yellow-900/30 text-yellow-500" : "border-red-900/30 text-red-500")
                )}>
                  <div className="text-[8px] font-black opacity-50 mb-1">SNSR-{i+1}</div>
                  <div className="text-[7px] font-bold uppercase tracking-tighter">{status}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
