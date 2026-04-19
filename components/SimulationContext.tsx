"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

type ZoneLevel = 'safe' | 'moderate' | 'risky';

export interface Zone {
  name: string;
  density: number;
  trust: number;
  level: ZoneLevel;
  people: number;
  coords: [number, number]; // [lng, lat]
}

export interface Alert {
  id: string;
  type: 'Emergency' | 'Warning' | 'Resolved' | 'Update';
  category: 'danger' | 'warn' | 'safe' | 'info';
  msg: string;
  time: string;
  stadium: string;
}

export interface UserReport {
  id: string;
  user: string;
  initials: string;
  msg: string;
  time: string;
}

interface StadiumData {
  id: string;
  name: string;
  capacity: number;
  location: [number, number];
  zones: string[];
}

const STADIUMS: Record<string, StadiumData> = {
  wankhede: { 
    id: 'wankhede',
    name: "Wankhede Stadium, Mumbai", 
    capacity: 33108, 
    location: [72.8258, 18.9389],
    zones: ["Gate A North", "Gate B South", "Upper Deck East", "Lower Deck West", "VIP Lounge", "Food Court", "Press Box", "Parking Zone A"] 
  },
  eden: { 
    id: 'eden',
    name: "Eden Gardens, Kolkata", 
    capacity: 66349, 
    location: [88.3426, 22.5646],
    zones: ["Club House", "B Block North", "C Block South", "North Stand", "South Stand", "VIP Pavilion", "Media Centre", "Outer Ring"] 
  },
  chinnaswamy: { 
    id: 'chinnaswamy',
    name: "M. Chinnaswamy Stadium, Bengaluru", 
    capacity: 40000, 
    location: [77.5983, 12.9784],
    zones: ["West Stand", "East Stand", "North Block", "South Block", "Executive Box", "Parking Zone B", "Gate 1 Entry", "Concessions Area"] 
  }
};

interface SimulationState {
  currentStadium: StadiumData;
  zones: Record<string, Zone>;
  alerts: Alert[];
  reports: UserReport[];
  occupancy: number;
  totalCrowd: number;
  riskyCount: number;
  avgTrust: number;
  vibe: string;
  unreadAlerts: number;
}

interface SimulationContextValue extends SimulationState {
  setStadium: (id: string) => void;
  markAlertsAsRead: () => void;
}

const SimulationContext = createContext<SimulationContextValue | null>(null);

export function SimulationProvider({ children }: { children: React.ReactNode }) {
  const [stadiumId, setStadiumId] = useState('wankhede');
  const [state, setState] = useState<SimulationState>(() => {
    const s = STADIUMS['wankhede'];
    const zones: Record<string, Zone> = {};
    s.zones.forEach(z => {
      zones[z] = {
        name: z,
        density: 15 + Math.random() * 25,
        trust: 80 + Math.random() * 20,
        level: 'safe',
        people: 0,
        coords: [s.location[0] + (Math.random() - 0.5) * 0.005, s.location[1] + (Math.random() - 0.5) * 0.005]
      };
    });
    return {
      currentStadium: s,
      zones,
      alerts: [],
      reports: [],
      occupancy: 0,
      totalCrowd: 0,
      riskyCount: 0,
      avgTrust: 0,
      vibe: 'Festive',
      unreadAlerts: 0
    };
  });

  const getIST = () => new Date().toLocaleTimeString('en-US', { hour12: false, timeZone: 'Asia/Kolkata' });

  const setStadium = useCallback((id: string) => {
    const s = STADIUMS[id];
    if (!s) return;
    setStadiumId(id);
    const zones: Record<string, Zone> = {};
    s.zones.forEach(z => {
      zones[z] = {
        name: z,
        density: 15 + Math.random() * 25,
        trust: 80 + Math.random() * 20,
        level: 'safe',
        people: 0,
        coords: [s.location[0] + (Math.random() - 0.5) * 0.005, s.location[1] + (Math.random() - 0.5) * 0.005]
      };
    });
    setState(prev => ({
      ...prev,
      currentStadium: s,
      zones,
      alerts: [],
      reports: [],
      unreadAlerts: 0
    }));
  }, []);

  const markAlertsAsRead = useCallback(() => {
    setState(prev => ({ ...prev, unreadAlerts: 0 }));
  }, []);

  // Simulation Timers
  useEffect(() => {
    const physicsTimer = setInterval(() => {
      setState(prev => {
        const newZones = { ...prev.zones };
        let risky = 0;
        let totalP = 0;
        let totalT = 0;
        const s = prev.currentStadium;

        Object.keys(newZones).forEach(k => {
          const z = { ...newZones[k] };
          const drift = Math.floor(Math.random() * 13) - 6;
          z.density = Math.max(5, Math.min(99, Math.floor(z.density + drift)));
          z.trust = Math.max(40, Math.min(100, Math.floor(z.trust + (Math.random() * 4 - 2))));
          z.level = z.density <= 45 ? 'safe' : (z.density <= 70 ? 'moderate' : 'risky');
          if (z.level === 'risky') risky++;
          z.people = Math.floor((s.capacity / s.zones.length) * (z.density / 100));
          totalP += z.people;
          totalT += z.trust;
          newZones[k] = z;
        });

        const occ = Math.floor((totalP / s.capacity) * 100);
        const vibes = ['Electric', 'Festive', 'Tense', 'Energetic', 'Cautious'];
        
        return {
          ...prev,
          zones: newZones,
          occupancy: occ,
          totalCrowd: totalP,
          riskyCount: risky,
          avgTrust: Math.floor(totalT / s.zones.length),
          vibe: Math.random() > 0.8 ? vibes[Math.floor(Math.random() * vibes.length)] : prev.vibe
        };
      });
    }, 3000);

    const alertTimer = setInterval(() => {
      setState(prev => {
        const cat = prev.riskyCount >= 3 ? 'danger' : (prev.riskyCount >= 1 ? 'warn' : (Math.random() > 0.4 ? 'safe' : 'info'));
        const type = { danger: 'Emergency', warn: 'Warning', safe: 'Resolved', info: 'Update' }[cat] as Alert['type'];
        const zonesArr = Object.keys(prev.zones);
        const randomZone = zonesArr[Math.floor(Math.random() * zonesArr.length)];
        const msg = `${type}: Activity detected near ${randomZone}.`;
        
        const newAlert: Alert = {
          id: Date.now().toString(),
          type,
          category: cat,
          msg,
          time: getIST(),
          stadium: prev.currentStadium.name
        };

        return {
          ...prev,
          alerts: [newAlert, ...prev.alerts].slice(0, 50),
          unreadAlerts: prev.unreadAlerts + 1
        };
      });
    }, 5000);

    const reportTimer = setInterval(() => {
      setState(prev => {
        const users = ["Rahul M", "Priya K", "Amit S", "Sneha R", "Dhruv P", "Meena J", "Arjun T", "Kavya N"];
        const msgs = ["The queue at Gate 1 is really long", "Food court is absolutely packed", "Exit on the south side is smooth", "Security check is moving fast", "Upper deck has great views", "Parking is a nightmare outside"];
        const user = users[Math.floor(Math.random() * users.length)];
        const newReport: UserReport = {
          id: Date.now().toString(),
          user,
          initials: user.split(' ').map(n => n[0]).join(''),
          msg: msgs[Math.floor(Math.random() * msgs.length)],
          time: getIST()
        };
        return {
          ...prev,
          reports: [newReport, ...prev.reports].slice(0, 50)
        };
      });
    }, 7000);

    return () => {
      clearInterval(physicsTimer);
      clearInterval(alertTimer);
      clearInterval(reportTimer);
    };
  }, []);

  return (
    <SimulationContext.Provider value={{ ...state, setStadium, markAlertsAsRead }}>
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation() {
  const context = useContext(SimulationContext);
  if (!context) throw new Error('useSimulation must be used within SimulationProvider');
  return context;
}
