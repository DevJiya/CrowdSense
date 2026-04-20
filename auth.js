// ══════════════════════════════════════════════════════
// AUTH.JS — Firebase Authentication & Realtime Database
// ══════════════════════════════════════════════════════

// ── SIGN UP ──
async function signUp(email, password) {
  showAuthLoading(true, 'signup');
  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    // Google Services: Write to Realtime Database
    await rtdb.ref('users/' + user.uid).set({
      username: email.split('@')[0],
      trustScore: 500,
      tier: 'Neutral',
      createdAt: new Date().toISOString()
    });

    window.location.href = 'index.html';
  } catch (error) {
    showAuthError('signup', error.message);
    showAuthLoading(false, 'signup');
  }
}

// ── LOGIN ──
async function login(email, password) {
  showAuthLoading(true, 'login');
  try {
    await auth.signInWithEmailAndPassword(email, password);
    window.location.href = 'index.html';
  } catch (error) {
    showAuthError('login', 'Invalid credentials.');
    showAuthLoading(false, 'login');
  }
}

// ── LOGOUT ──
function logout() {
  auth.signOut().then(() => {
    window.location.href = 'login.html';
  });
}

// ── AUTH GUARD ──
function requireAuth(onUser) {
  auth.onAuthStateChanged((user) => {
    if (user) {
      // Fetch user profile from RTDB
      rtdb.ref('users/' + user.uid).once('value').then((snapshot) => {
        const profile = snapshot.val() || { trustScore: 500, username: user.email };
        onUser(user, profile);
      });
    } else {
      window.location.href = 'login.html';
    }
  });
}

// ── SUBMIT CROWD REPORT (Firebase RTDB) ──
async function submitCrowdReport(uid, userName, type, location, detail) {
  const result = analyzeReport(detail);
  
  const newReportRef = rtdb.ref('reports').push();
  await newReportRef.set({
    uid, userName, type, location, detail,
    verdict: result.verdict,
    timestamp: new Date().toISOString()
  });

  if (result.verdict === 'verified') {
    await updateLocalScore(uid, 15);
    return { ok: true, msg: '✓ Verified. +15 TruthScore added.', score: 15 };
  } else if (result.verdict === 'suppressed') {
    await updateLocalScore(uid, -20);
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

async function updateLocalScore(uid, delta) {
  const userRef = rtdb.ref('users/' + uid);
  const snapshot = await userRef.once('value');
  const user = snapshot.val();
  if (user) {
    await userRef.update({
      trustScore: user.trustScore + delta
    });
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
