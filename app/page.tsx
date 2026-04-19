"use client";

import { useState, useEffect } from "react";
import { SimulationProvider, useSimulation } from "@/components/SimulationContext";
import { cn } from "@/lib/utils";
import { Alert, AlertContent, AlertDescription, AlertIcon, AlertTitle } from "@/components/ui/alert-1";
import { AlertCircle, Info, Terminal } from "lucide-react";
import OverviewTab from "@/components/tabs/OverviewTab";
import LiveMapTab from "@/components/tabs/LiveMapTab";
import AlertsTab from "@/components/tabs/AlertsTab";
import AIAssistantTab from "@/components/tabs/AIAssistantTab";
import TrustPanelTab from "@/components/tabs/TrustPanelTab";
import DetectorTab from "@/components/tabs/DetectorTab";
import SafetyVibeTab from "@/components/tabs/SafetyVibeTab";
import InsightsTab from "@/components/tabs/InsightsTab";

type TabId = 'home' | 'map' | 'alerts' | 'assistant' | 'trust' | 'detector' | 'safety' | 'insights';

function DashboardContent() {
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const { riskyCount, unreadAlerts, alerts, currentStadium } = useSimulation();
  const [activeToasts, setActiveToasts] = useState<any[]>([]);

  // Monitor for new alerts to show as toasts
  useEffect(() => {
    if (alerts.length > 0) {
      const latest = alerts[0];
      setActiveToasts(prev => [latest, ...prev].slice(0, 3));
      const timer = setTimeout(() => {
        setActiveToasts(prev => prev.filter(t => t.id !== latest.id));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alerts]);

  const tabs: { id: TabId, label: string }[] = [
    { id: 'home', label: 'Overview' },
    { id: 'map', label: 'Live Map' },
    { id: 'alerts', label: 'Alerts' },
    { id: 'assistant', label: 'AI Assistant' },
    { id: 'trust', label: 'Trust' },
    { id: 'detector', label: 'Detector' },
    { id: 'safety', label: 'Vibe' },
    { id: 'insights', label: 'Insights' },
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500/30 font-sans">
      
      {/* Notification Stack using alert-1.tsx UI */}
      <div className="fixed top-20 right-6 z-[100] flex flex-col gap-3 w-[400px] pointer-events-none">
        {activeToasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto animate-in slide-in-from-right-10 fade-in duration-300">
            <Alert 
              variant={toast.category === 'danger' ? 'destructive' : 'primary'} 
              appearance="solid" 
              close={true}
              onClose={() => setActiveToasts(prev => prev.filter(t => t.id !== toast.id))}
            >
              <AlertIcon>
                {toast.category === 'danger' ? <AlertCircle className="size-4" /> : <Info className="size-4" />}
              </AlertIcon>
              <AlertContent>
                <AlertTitle className="text-[10px] font-black uppercase tracking-widest">{toast.type}</AlertTitle>
                <AlertDescription className="text-xs font-medium">{toast.msg}</AlertDescription>
              </AlertContent>
            </Alert>
          </div>
        ))}
      </div>

      {/* Emergency Header */}
      {riskyCount >= 3 && (
        <div className="bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.2em] py-2 text-center animate-pulse sticky top-0 z-[110]">
          CRITICAL ALERT: {riskyCount} SECTORS BREACHED AT {currentStadium.name.toUpperCase()}
        </div>
      )}

      {/* Navigation */}
      <nav className="border-b border-zinc-800 bg-black/80 backdrop-blur-md sticky top-0 z-[100]">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-6 bg-blue-600 rounded flex items-center justify-center font-black text-xs italic shadow-lg shadow-blue-500/20">CS</div>
            <span className="font-black tracking-tighter text-lg uppercase">CrowdSense<span className="text-blue-500">Pro</span></span>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all relative whitespace-nowrap",
                  activeTab === tab.id ? "text-white" : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                {tab.label}
                {tab.id === 'alerts' && unreadAlerts > 0 && (
                  <span className="absolute top-1 right-1 size-2 bg-red-500 rounded-full animate-pulse" />
                )}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)]" />
                )}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">
            <div className="flex items-center gap-2">
              <div className="size-1.5 bg-red-500 rounded-full animate-pulse" />
              LIVE FEED
            </div>
            <div>{new Date().toLocaleTimeString('en-GB')} IST</div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-6 py-8">
        {activeTab === 'home' && <OverviewTab />}
        {activeTab === 'map' && <LiveMapTab />}
        {activeTab === 'alerts' && <AlertsTab />}
        {activeTab === 'assistant' && <AIAssistantTab />}
        {activeTab === 'trust' && <TrustPanelTab />}
        {activeTab === 'detector' && <DetectorTab />}
        {activeTab === 'safety' && <SafetyVibeTab />}
        {activeTab === 'insights' && <InsightsTab />}
      </main>
    </div>
  );
}

export default function Page() {
  return (
    <SimulationProvider>
      <DashboardContent />
    </SimulationProvider>
  );
}
