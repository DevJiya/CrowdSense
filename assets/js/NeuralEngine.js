/* Neural Intelligence Engine */
const STADIUMS = {
    wankhede: { 
        id: 'wankhede', name: "Wankhede Stadium, Mumbai", q: "Wankhede+Stadium+Mumbai", 
        sectors: [
            { n: "Sachin Tendulkar Stand", g: "Gate 4", t: 45, l: 30, d: 25 },
            { n: "Sunil Gavaskar Stand", g: "Gate 5", t: 30, l: 60, d: 20 },
            { n: "North Stand", g: "Gate 5", t: 30, l: 45, d: 30 }
        ],
        news: [], occ: 22 
    },
    eden: { 
        id: 'eden', name: "Eden Gardens, Kolkata", q: "Eden+Gardens+Kolkata", 
        sectors: [
            { n: "Club House", g: "Gate 1", t: 50, l: 50, d: 85 },
            { n: "Block G", g: "Gate 12", t: 35, l: 65, d: 75 },
            { n: "Main Pavilion", g: "Gate 4", t: 50, l: 30, d: 90 }
        ],
        news: [], occ: 82 
    },
    chinnaswamy: { 
        id: 'chinnaswamy', name: "M. Chinnaswamy, Bengaluru", q: "Chinnaswamy+Stadium+Bengaluru", 
        sectors: [
            { n: "President Box", g: "Gate 1", t: 40, l: 50, d: 15 },
            { n: "M1-M4 Stands", g: "Gate 17", t: 30, l: 65, d: 20 },
            { n: "P4 Stand", g: "Gate 21", t: 60, l: 40, d: 25 }
        ],
        news: [], occ: 18 
    }
};

let state = {
    stadium: 'eden',
    tab: 'home',
    tracked: ['wankhede', 'eden', 'chinnaswamy'],
    alerts: [],
    tick: 0,
    messages: [{ role: 'ai', text: "Neural Engine Modularized. Precision Sync Active." }]
};

const TABS = [
    { id: 'home', label: 'Home', icon: 'layout-grid' },
    { id: 'map', label: 'Live Map', icon: 'map' },
    { id: 'mood', label: 'Mood Detector', icon: 'brain' },
    { id: 'ai', label: 'AI Assistant', icon: 'cpu' },
    { id: 'alerts', label: 'Alerts', icon: 'bell' },
    { id: 'trust', label: 'Trust Panel', icon: 'shield' },
    { id: 'detector', label: 'Detector', icon: 'radar' },
    { id: 'vibe', label: 'Safety Vibe', icon: 'activity' },
    { id: 'insights', label: 'Insights', icon: 'bar-chart-3' }
];

async function fetchNews(id) {
    const s = STADIUMS[id];
    if (!s) return;
    try {
        const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=https://news.google.com/rss/search?q=${s.q}+news&hl=en-IN&gl=IN&ceid=IN:en`);
        const data = await response.json();
        STADIUMS[id].news = data.items.slice(0, 3).map(item => ({ t: item.title, s: item.source }));
        if (state.tab === 'home' || state.stadium === id) refresh();
    } catch (e) {
        STADIUMS[id].news = [{ t: "Match Day Intel: High Gate Pressure Detected.", s: "Neural Cache" }];
    }
}

function handleSearch(val) {
    if (!window.SECURITY) { console.error("Security Layer Missing"); return; }
    const cleanVal = SECURITY.sanitize(val);
    triggerToast(`Identifying Venue: "${cleanVal}"...`);
    const searchId = 'custom_' + Date.now();
    STADIUMS[searchId] = { id: searchId, name: cleanVal, q: encodeURIComponent(cleanVal), sectors: [{n: "Entry Gate 1", g: "G1", t:50, l:50, d:40}], news: [], occ: 45 };
    if (!state.tracked.includes(searchId)) state.tracked.push(searchId);
    setStadium(searchId);
    fetchNews(searchId);
}

function setStadium(id) {
    state.stadium = id;
    refresh();
    triggerToast(`Target Locked: ${STADIUMS[id].name.split(',')[0]}`);
}

function switchTab(id) {
    state.tab = id;
    refresh();
}

function simulate() {
    state.tick++;
    state.tracked.forEach(sid => {
        STADIUMS[sid].occ = Math.max(5, Math.min(99, Math.floor(STADIUMS[sid].occ + (Math.random() * 4 - 2))));
        STADIUMS[sid].sectors?.forEach(sec => {
            sec.d = Math.max(5, Math.min(99, Math.floor(sec.d + (Math.random() * 8 - 4))));
        });
    });

    if (state.tick % 5 === 0) {
        const s = STADIUMS[state.stadium];
        const high = s.sectors?.find(sec => sec.d > 80);
        if (high) {
            state.alerts.unshift({ venue: s.name.split(',')[0], msg: `${high.n} pressure breach (${high.g}).`, type: 'risky', time: new Date().toLocaleTimeString('en-GB') });
            triggerToast(`[ALERT] Gate Pressure Breach at ${high.g}`);
        }
    }
    refresh();
}

function triggerToast(msg) {
    const stack = document.getElementById('toast-container');
    if (!stack) return;
    const t = document.createElement('div');
    t.className = "toast pointer-events-auto";
    t.innerHTML = `<div class="text-[9px] font-black uppercase text-blue-500 mb-1 tracking-[0.2em]">Neural Intelligence</div><div class="text-[11px] font-bold text-zinc-200 leading-tight">${msg}</div>`;
    stack.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateY(-10px)'; setTimeout(()=>t.remove(), 400); }, 5000);
}

function refresh() {
    renderNav();
    const container = document.getElementById('tab-content');
    if (!container) return;
    const id = state.tab;
    if (id === 'home') renderHome(container);
    else if (id === 'map') renderMap(container);
    else if (id === 'mood') renderMood(container);
    else if (id === 'ai') renderAI(container);
    else if (id === 'alerts') renderAlerts(container);
    else if (id === 'trust') renderTrust(container);
    else if (id === 'detector') renderDetector(container);
    else if (id === 'vibe') renderVibe(container);
    else if (id === 'insights') renderInsights(container);
    lucide.createIcons();
}

function renderNav() {
    const nav = document.getElementById('main-nav');
    const selector = document.getElementById('stadium-selector');
    if (nav) nav.innerHTML = TABS.map(t => `<button onclick="switchTab('${t.id}')" class="tab-btn px-4 py-1 text-[11px] font-bold uppercase tracking-widest ${state.tab === t.id ? 'active text-white' : 'text-zinc-500'}">${t.label}</button>`).join('');
    if (selector) selector.innerHTML = state.tracked.map(sid => `<button onclick="setStadium('${sid}')" class="stadium-chip px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${state.stadium === sid ? 'active' : 'text-zinc-500'}">${STADIUMS[sid].name.split(',')[0]}</button>`).join('');
}

/* UI Rendering Functions */
function renderHome(c) {
    c.innerHTML = `<div class="h-full flex flex-col gap-6 overflow-y-auto no-scrollbar"><div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">${state.tracked.map(sid => `
        <div class="card p-6 border-l-4 ${STADIUMS[sid].occ > 75 ? 'border-l-red-500' : 'border-l-blue-500'}">
            <div class="flex justify-between items-start mb-4"><h3 class="text-xs font-black uppercase text-zinc-300">${STADIUMS[sid].name}</h3><span class="text-xl font-black ${STADIUMS[sid].occ > 75 ? 'text-red-500' : 'text-blue-500'}">${STADIUMS[sid].occ}%</span></div>
            <div class="space-y-2 mb-4">${STADIUMS[sid].sectors?.slice(0,2).map(sec => `<div class="flex justify-between text-[9px] font-bold"><span class="text-zinc-600">${sec.n}</span><span>${sec.d}%</span></div>`).join('') || ''}</div>
            <div class="pt-4 border-t border-[#222224]"><p class="text-[8px] font-black text-zinc-700 uppercase mb-2">Live News</p>${STADIUMS[sid].news?.slice(0,2).map(n => `<div class="text-[9px] text-zinc-500 truncate">● ${n.t}</div>`).join('') || ''}</div>
        </div>`).join('')}</div></div>`;
}

function renderMap(c) {
    const s = STADIUMS[state.stadium];
    c.innerHTML = `<div class="h-full map-container"><iframe width="100%" height="100%" frameborder="0" src="https://maps.google.com/maps?q=${s.q}&t=k&z=18&ie=UTF8&iwloc=&output=embed"></iframe><div class="absolute inset-0 z-10 pointer-events-none">${s.sectors?.map(sec => `
        <div class="heatmap-node" style="top:${sec.t}%; left:${sec.l}%; background: radial-gradient(circle, ${sec.d > 80 ? 'rgba(226,75,74,0.8)' : 'rgba(24,95,165,0.8)'} 0%, transparent 70%);"></div>
        <div class="pulse-core" style="top:${sec.t}%; left:${sec.l}%;"></div>
        <div class="heatmap-label" style="top:${sec.t}%; left:${sec.l}%;">${sec.n.toUpperCase()} | ${sec.g}<br/><span style="color:${sec.d > 80 ? '#E24B4A' : '#4ADE80'}">${sec.d}% DENSITY</span></div>`).join('') || ''}</div></div>`;
}

function renderMood(c) { c.innerHTML = `<div class="h-full grid grid-cols-2 gap-8"><div class="card p-8"><h2 class="text-[10px] font-black text-zinc-600 uppercase mb-8 tracking-widest">Sector Sentiment</h2><div class="space-y-4">${STADIUMS[state.stadium].sectors?.map(z => `<div class="flex justify-between items-center p-5 bg-black/30 border border-[#222224] rounded-xl"><span class="text-xs font-bold">${z.n}</span><span class="text-[10px] font-black uppercase" style="color:${z.d > 80 ? '#E24B4A' : '#1D9E75'}">${z.d > 80 ? 'Aggressive' : 'Calm'}</span></div>`).join('') || ''}</div></div><div class="card p-12 text-center flex flex-col justify-center"><div class="text-[10rem] font-black leading-none tracking-tighter" style="color:${STADIUMS[state.stadium].occ > 75 ? '#E24B4A' : '#1D9E75'}">${STADIUMS[state.stadium].occ > 75 ? 'RISKY' : 'CALM'}</div><p class="text-xl font-black uppercase text-zinc-500 mt-8 tracking-widest">Global Vibe</p></div></div>`; }
function renderAI(c) { c.innerHTML = `<div class="h-full grid grid-cols-3 gap-6"><div class="col-span-2 card flex flex-col overflow-hidden"><div class="flex-1 p-6 space-y-4 overflow-y-auto no-scrollbar" id="chat-box">${state.messages.map(m=>`<div class="flex flex-col ${m.role==='user'?'items-end':'items-start'}"><div class="text-[9px] font-black text-zinc-600 mb-1 uppercase">${m.role==='ai'?'CROWD AI':'YOU'}</div><div class="p-4 rounded-xl text-xs ${m.role==='user'?'bg-blue-600 text-white':'bg-[#18181B] text-zinc-300'} max-w-[80%]">${m.text}</div></div>`).join('')}</div><div class="p-4 border-t border-[#222224] flex gap-2"><input id="ai-in" type="text" placeholder="Query precision news..." class="flex-1 bg-black border border-[#222224] rounded-lg px-4 py-2 text-xs outline-none focus:border-[#185FA5]"><button onclick="aiSend()" class="bg-[#185FA5] px-6 rounded-lg text-[10px] font-black uppercase">Send</button></div></div><div class="card p-6 space-y-4"><p class="text-[10px] font-black text-zinc-600 uppercase mb-4 tracking-widest">Active Trackers</p>${state.tracked.map(sid=>`<div class="flex justify-between text-[10px] font-bold"><span class="text-zinc-500">${sid.toUpperCase()}</span><span>${STADIUMS[sid].occ}%</span></div>`).join('')}</div></div>`; }
function renderAlerts(c) { c.innerHTML = `<div class="h-full grid grid-cols-2 gap-4 overflow-y-auto no-scrollbar">${state.alerts.map(a => `<div class="card p-6 border-l-4" style="border-left-color:${a.type==='risky'?'#E24B4A':'#185FA5'}"><div class="flex justify-between mb-2 text-[10px] font-black uppercase text-zinc-600"><span>[${a.venue}] AI LOG</span><span>${a.time} IST</span></div><div class="text-sm font-bold text-zinc-200">${a.msg}</div></div>`).join('')}</div>`; }
function renderTrust(c) { c.innerHTML = `<div class="h-full flex flex-col justify-center max-w-2xl mx-auto w-full gap-6"><p class="text-[11px] font-black text-zinc-500 uppercase tracking-widest text-center">Signal Reliability: ${STADIUMS[state.stadium].name}</p>${STADIUMS[state.stadium].sectors?.map(z => `<div class="space-y-2"><div class="flex justify-between text-xs font-bold"><span>${z.n} Sensor</span><span>${Math.floor(90+Math.random()*10)}%</span></div><div class="h-1 bg-zinc-900 rounded-full overflow-hidden"><div class="h-full bg-blue-500" style="width:95%"></div></div></div>`).join('') || ''}</div>`; }
function renderDetector(c) { c.innerHTML = `<div class="h-full flex flex-col gap-8"><div class="card p-12 text-center flex-1 flex flex-col justify-center"><h2 class="text-5xl font-black tracking-tighter mb-4 uppercase">Neural Sensor Grid</h2></div><div class="grid grid-cols-8 gap-4">${Array.from({length:32}).map((_,i)=>`<div class="card p-3 text-center border-l-2" style="border-left-color:${Math.random()>0.8?'#E24B4A':'#1D9E75'}"><div class="text-[8px] font-black text-zinc-700 mb-1">SN-${i+1}</div><div class="text-[8px] font-bold text-zinc-500 uppercase">OK</div></div>`).join('')}</div></div>`; }
function renderVibe(c) { c.innerHTML = `<div class="h-full flex items-center justify-center text-center"><div><p class="text-[14px] font-black text-zinc-600 uppercase tracking-[0.4em] mb-12">Safety Index</p><div class="text-[20rem] font-black leading-none tracking-tighter" style="color:${STADIUMS[state.stadium].occ > 75 ? '#E24B4A' : '#1D9E75'}">${100 - STADIUMS[state.stadium].occ}</div></div></div>`; }
function renderInsights(c) { c.innerHTML = `<div class="h-full grid grid-cols-2 gap-8"><div class="card p-8 flex items-end gap-1 overflow-hidden">${Array.from({length:24}).map(()=>`<div class="flex-1 bg-blue-500/30 rounded-t" style="height:${30+Math.random()*60}%"></div>`).join('')}</div><div class="card p-8 flex flex-col justify-between"><p class="text-[11px] font-black text-zinc-500 uppercase tracking-widest">Neural Intel</p><p class="text-sm font-medium text-zinc-400 italic">"Monitoring gate-level activity. ${STADIUMS[state.stadium].name.split(',')[0]} is currently ${STADIUMS[state.stadium].occ > 75 ? 'under stress' : 'nominal'}."</p></div></div>`; }

function aiSend() {
    const i = document.getElementById('ai-in'); if(!i.value) return;
    state.messages.push({ role: 'user', text: SECURITY.sanitize(i.value) });
    setTimeout(() => {
        state.messages.push({ role: 'ai', text: `Analyzing regional news feeds. Kolkata (Eden Gardens) is under match-day pressure. Wankhede and Chinnaswamy remain optimal.` });
        refresh();
    }, 600);
    i.value = ''; refresh();
}

/* Initialization */
window.onload = () => {
    init();
};
