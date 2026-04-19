"use client";

import { useState } from "react";
import { useSimulation } from "@/components/SimulationContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type FilterType = 'all' | 'danger' | 'warn' | 'safe' | 'info';

export default function AlertsTab() {
  const { alerts, riskyCount, tick, markAlertsAsRead } = useSimulation();
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredAlerts = alerts.filter(a => filter === 'all' || a.category === filter);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="TOTAL ALERTS" value={alerts.length} color="text-blue-400" />
        <StatCard 
          title="ACTIVE EMERGENCIES" 
          value={riskyCount} 
          color="text-red-500" 
          indicator={riskyCount > 0} 
        />
        <StatCard title="CLEARED TODAY" value={tick * 2} color="text-green-500" />
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {(['all', 'danger', 'warn', 'safe', 'info'] as FilterType[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-4 py-2 rounded text-[10px] font-black uppercase tracking-widest transition-all",
              filter === f 
                ? "bg-zinc-100 text-black" 
                : "bg-zinc-900 text-zinc-500 hover:text-zinc-300 border border-zinc-800"
            )}
          >
            {f === 'all' ? 'All Alerts' : f === 'danger' ? 'Emergency' : f === 'warn' ? 'Warning' : f === 'safe' ? 'Resolved' : 'Info'}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map(a => (
            <div 
              key={a.id} 
              className={cn(
                "p-4 border-l-4 rounded bg-zinc-950/50 transition-all duration-500 slide-in-top",
                a.category === 'danger' ? "border-red-500 bg-red-500/5" : (a.category === 'warn' ? "border-yellow-500 bg-yellow-500/5" : (a.category === 'safe' ? "border-green-500 bg-green-500/5" : "border-blue-500 bg-blue-500/5"))
              )}
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2">
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "text-[9px] font-black uppercase px-2 py-0.5 rounded",
                    a.category === 'danger' ? "bg-red-500 text-white" : (a.category === 'warn' ? "bg-yellow-500 text-black" : (a.category === 'safe' ? "bg-green-500 text-white" : "bg-blue-500 text-white"))
                  )}>
                    {a.type}
                  </span>
                  <span className="text-xs font-bold text-zinc-100">{a.msg}</span>
                </div>
                <div className="text-[10px] font-bold text-zinc-600 flex items-center gap-3">
                  <span>{a.stadium}</span>
                  <span>{a.time} IST</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 text-zinc-600 font-bold uppercase tracking-widest text-xs">
            No alerts found matching this filter
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, color, indicator }: { title: string, value: string | number, color: string, indicator?: boolean }) {
  return (
    <Card className="border-zinc-800 bg-zinc-950/50 overflow-hidden">
      <CardContent className="pt-6 relative">
        {indicator && <div className="absolute top-2 right-2 size-2 bg-red-500 rounded-full animate-ping" />}
        <div className="text-[10px] font-black tracking-widest text-zinc-500 mb-1">{title}</div>
        <div className={cn("text-2xl font-black tracking-tighter", color)}>{value}</div>
      </CardContent>
    </Card>
  );
}
