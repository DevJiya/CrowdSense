// ══════════════════════════════════════════════════════
// AUTH.JS — Local Storage "Backend" (No Firebase)
// ══════════════════════════════════════════════════════

// ── SIGN UP ──
async function signUp(username, password) {
  showAuthLoading(true, 'signup');
  
  // Simulate network delay
  setTimeout(() => {
    let users = JSON.parse(localStorage.getItem('cs_users') || '[]');
    
    // Check if user exists
    if (users.find(u => u.username === username)) {
      showAuthError('signup', 'Username already taken.');
      showAuthLoading(false, 'signup');
      return;
    }

    const newUser = {
      uid: 'user_' + Date.now(),
      username: username,
      password: password,
      trustScore: 500,
      tier: 'Neutral',
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem('cs_users', JSON.stringify(users));
    localStorage.setItem('cs_current_user', JSON.stringify(newUser));

    window.location.href = 'index.html';
  }, 800);
}

// ── LOGIN ──
async function login(username, password) {
  showAuthLoading(true, 'login');

  setTimeout(() => {
    let users = JSON.parse(localStorage.getItem('cs_users') || '[]');
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
      localStorage.setItem('cs_current_user', JSON.stringify(user));
      window.location.href = 'index.html';
    } else {
      showAuthError('login', 'Invalid username or password.');
      showAuthLoading(false, 'login');
    }
  }, 800);
}

// ── LOGOUT ──
function logout() {
  localStorage.removeItem('cs_current_user');
  window.location.href = 'login.html';
}

// ── AUTH GUARD ──
function requireAuth(onUser) {
  const user = JSON.parse(localStorage.getItem('cs_current_user'));
  if (!user) {
    window.location.href = 'login.html';
  } else {
    onUser(user, user);
  }
}

// ── SUBMIT CROWD REPORT (Local Storage) ──
async function submitCrowdReport(uid, userName, type, location, detail) {
  const result = analyzeReport(detail);
  const reports = JSON.parse(localStorage.getItem('cs_reports') || '[]');
  
  const newReport = {
    id: Date.now(),
    uid, userName, type, location, detail,
    verdict: result.verdict,
    timestamp: new Date().toISOString()
  };

  reports.push(newReport);
  localStorage.setItem('cs_reports', JSON.stringify(reports));

  if (result.verdict === 'verified') {
    updateLocalScore(15);
    return { ok: true, msg: '✓ Verified. +15 TruthScore added.', score: 15 };
  } else if (result.verdict === 'suppressed') {
    updateLocalScore(-20);
    return { ok: false, msg: "⊘ Flagged — couldn't be verified. −20 TruthScore.", score: -20 };
  }
  return { ok: true, msg: '◎ Report queued for verification. +2 TruthScore.', score: 2 };
}

function analyzeReport(detail) {
  const lower = (detail || '').toLowerCase();
  const panicWords = ['fire','bomb','run','evacuate','danger','stampede','attack'];
  const hasPanic = panicWords.some(w => lower.includes(w));
  if (hasPanic) return { verdict: 'suppressed' };
  if (detail.match(/[A-Z]{4,}/) || (detail.match(/!/g) || []).length > 2) return { verdict: 'uncertain' };
  return { verdict: 'verified' };
}

function updateLocalScore(delta) {
  const user = JSON.parse(localStorage.getItem('cs_current_user'));
  if (user) {
    user.trustScore += delta;
    localStorage.setItem('cs_current_user', JSON.stringify(user));
    
    // Sync back to users list
    let users = JSON.parse(localStorage.getItem('cs_users') || '[]');
    let idx = users.findIndex(u => u.uid === user.uid);
    if (idx !== -1) {
      users[idx].trustScore = user.trustScore;
      localStorage.setItem('cs_users', JSON.stringify(users));
    }
  }
}

function getTierFromScore(score) {
  if (score >= 750) return { label: 'Trusted Reporter', cls: 'trusted' };
  if (score >= 400) return { label: 'Neutral Contributor', cls: 'neutral' };
  return { label: 'Low Reliability', cls: 'low' };
}

// ── UI HELPERS ──
function showAuthLoading(show, form) {
  const btn = document.getElementById(`${form}-btn`);
  if (!btn) return;
  btn.disabled = show;
  btn.textContent = show ? 'Connecting...' : (form === 'login' ? 'Enter Dashboard' : 'Create My Account');
}

function showAuthError(form, msg) {
  const el = document.getElementById(`${form}-error`);
  if (el) { el.textContent = msg; el.style.display = 'block'; }
}

function clearAuthError(form) {
  const el = document.getElementById(`${form}-error`);
  if (el) { el.textContent = ''; el.style.display = 'none'; }
}
