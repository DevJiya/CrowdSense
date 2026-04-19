"use client";

import { useState, useRef, useEffect } from "react";
import { useSimulation } from "@/components/SimulationContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
  time: string;
}

export default function AIAssistantTab() {
  const { currentStadium, zones, occupancy, riskyCount, totalCrowd, vibe } = useSimulation();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'ai',
      text: `Hello! I am your CrowdAI assistant for ${currentStadium.name}. I am monitoring ${Object.keys(zones).length} zones in real time. Currently ${Object.values(zones).filter(z => z.level === 'safe').length} zones are safe, ${Object.values(zones).filter(z => z.level === 'moderate').length} are moderate, and ${riskyCount} are risky. How can I help you stay safe today?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = (text?: string) => {
    const query = text || input.trim();
    if (!query) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const response = generateAIResponse(query);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: response,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 700);
  };

  const generateAIResponse = (q: string) => {
    const lower = q.toLowerCase();
    const riskyZones = Object.values(zones).filter(z => z.level === 'risky');
    const safeZones = Object.values(zones).filter(z => z.level === 'safe');

    if (lower.includes('situation') || lower.includes('overall')) {
      return `Venue analysis: Capacity is at ${occupancy}%. We have ${riskyCount} risky zones. Vibe is currently ${vibe}. ${riskyCount > 0 ? '⚠️ I suggest avoiding Gate 1 and the Food Court area.' : '✅ Movement is fluid across all sectors.'}`;
    }
    if (lower.includes('safe') || lower.includes('where')) {
      return `Current safe zones are: ${safeZones.slice(0, 3).map(z => z.name).join(', ')}. These areas have less than 40% density.`;
    }
    if (lower.includes('exit')) {
      const bestExit = safeZones[0]?.name || "Main Gates";
      return `For a quick exit, I recommend using ${bestExit}. Avoid the North Block as it's showing bottleneck signals.`;
    }
    return `I am monitoring ${currentStadium.name} telemetry. Currently, the crowd is ${vibe.toLowerCase()}. Do you want to know about safe zones or exit routes?`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[700px]">
      <Card className="lg:col-span-2 flex flex-col border-zinc-800 bg-zinc-950/50 overflow-hidden">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {messages.map(m => (
            <div key={m.id} className={cn(
              "flex flex-col max-w-[80%]",
              m.role === 'user' ? "ml-auto items-end" : "items-start"
            )}>
              <span className="text-[10px] font-black uppercase text-zinc-500 mb-1">
                {m.role === 'ai' ? 'CROWDAI' : 'YOU'}
              </span>
              <div className={cn(
                "p-4 rounded-2xl text-sm leading-relaxed",
                m.role === 'user' ? "bg-blue-600 text-white rounded-tr-none" : "bg-zinc-900 text-zinc-200 rounded-tl-none border border-zinc-800"
              )}>
                {m.text}
              </div>
              <span className="text-[9px] text-zinc-600 mt-1">{m.time}</span>
            </div>
          ))}
          {isTyping && (
            <div className="flex flex-col items-start">
              <span className="text-[10px] font-black uppercase text-zinc-500 mb-1">CROWDAI</span>
              <div className="bg-zinc-900 p-4 rounded-2xl rounded-tl-none border border-zinc-800 flex gap-1">
                <div className="size-1.5 bg-zinc-500 rounded-full animate-bounce" />
                <div className="size-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="size-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-zinc-800 bg-black/20">
          <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
            {["Situation", "Safe zones?", "Exit?", "Food area?", "Parking?"].map(chip => (
              <button 
                key={chip} 
                onClick={() => handleSend(chip)}
                className="px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-zinc-400 hover:text-white hover:border-zinc-600 transition-all whitespace-nowrap"
              >
                {chip}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Ask anything about the crowd..."
            />
            <Button onClick={() => handleSend()} className="bg-blue-600 hover:bg-blue-500">Send</Button>
          </div>
        </div>
      </Card>

      <div className="space-y-6">
        <Card className="border-zinc-800 bg-zinc-950/50">
          <CardHeader>
            <CardTitle className="text-xs font-black uppercase tracking-widest text-zinc-500">Live Context Panel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between text-xs font-bold text-zinc-300 mb-2">
                <span>Occupancy</span>
                <span>{occupancy}%</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className={cn("h-full transition-all duration-500", occupancy > 80 ? "bg-red-500" : "bg-blue-500")}
                  style={{ width: `${occupancy}%` }}
                />
              </div>
              <div className="text-[10px] text-zinc-500 mt-2 text-right">
                {totalCrowd.toLocaleString()} Attendees
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Current Vibe</div>
              <div className="text-2xl font-black text-blue-400 tracking-tighter uppercase">{vibe}</div>
            </div>

            <div className="space-y-3 pt-4 border-t border-zinc-900">
              {Object.values(zones).map(z => (
                <div key={z.name} className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "size-1.5 rounded-full",
                      z.level === 'risky' ? "bg-red-500" : (z.level === 'moderate' ? "bg-yellow-500" : "bg-green-500")
                    )} />
                    <span className="text-zinc-400 font-medium">{z.name}</span>
                  </div>
                  <span className="font-bold text-zinc-500">{z.density}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
