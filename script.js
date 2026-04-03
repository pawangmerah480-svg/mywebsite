// ================================================
//  POLYORACLE — AI PREDICTION BOT
//  script.js — Full Logic & AI Integration
// ================================================

const CLAUDE_API = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-20250514";

// ── STATE ──
let state = {
  markets: [],
  history: [],
  backtestLog: [],
  chatHistory: [],
  profile: { name: "User", risk: "medium", favCat: "all", lang: "id" },
  activeTab: "scanner",
  currentImage: null,
  lang: "id"
};

// ── LOAD FROM LOCALSTORAGE ──
function loadState() {
  try {
    const saved = localStorage.getItem("polyoracle_state");
    if (saved) {
      const parsed = JSON.parse(saved);
      state.markets = parsed.markets || [];
      state.history = parsed.history || [];
      state.backtestLog = parsed.backtestLog || [];
      state.profile = parsed.profile || state.profile;
    }
  } catch (e) { console.warn("Load state error:", e); }
}

function saveState() {
  try {
    localStorage.setItem("polyoracle_state", JSON.stringify({
      markets: state.markets,
      history: state.history,
      backtestLog: state.backtestLog,
      profile: state.profile
    }));
  } catch (e) { console.warn("Save state error:", e); }
}

// ── TOAST ──
function showToast(msg, type = "info") {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.className = `toast show ${type}`;
  setTimeout(() => el.className = "toast", 3000);
}

// ── TAB NAVIGATION ──
function initTabs() {
  document.querySelectorAll(".nav-item").forEach(btn => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.tab;
      document.querySelectorAll(".nav-item").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(`tab-${tab}`)?.classList.add("active");
      state.activeTab = tab;
      if (tab === "history") renderHistory();
      if (tab === "backtest") renderBacktestStats();
    });
  });
}

// ── CATEGORY CHIPS ──
function initChips() {
  document.querySelectorAll(".chip").forEach(chip => {
    chip.addEventListener("click", () => {
      document.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      renderMarkets(chip.dataset.cat);
    });
  });
}

// ── CLAUDE API CALL ──
async function callClaude(messages, systemPrompt = null, imageBase64 = null, imageMime = null) {
  const body = {
    model: MODEL,
    max_tokens: 1000,
    messages: messages,
    tools: [{ type: "web_search_20250305", name: "web_search" }]
  };
  if (systemPrompt) body.system = systemPrompt;

  const response = await fetch(CLAUDE_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || "API Error");
  }

  const data = await response.json();
  const text = data.content
    .filter(b => b.type === "text")
    .map(b => b.text)
    .join("\n");
  return text;
}

// ── SYSTEM PROMPT (AI PERSONA) ──
function getSystemPrompt() {
  const riskMap = {1:"sangat konservatif",2:"konservatif",3:"medium",4:"agresif",5:"sangat agresif"};
  return `Kamu adalah PolyOracle, AI prediction analyst untuk Polymarket — platform prediksi pasar terkemuka.

PERAN & KEAHLIAN:
- Menganalisis probabilitas "true" vs harga pasar menggunakan data historis, berita, dan sentimen
- Memberikan prediksi dengan confidence level yang jelas dan step-by-step reasoning (Chain-of-Thought)
- Mendeteksi value bet: ketika harga pasar lebih rendah/tinggi dari probabilitas sebenarnya
- Memberikan rekomendasi BUY YES / BUY NO / SKIP dengan alasan yang transparan
- Analisis sentimen dari berita terkini, Twitter/X, Reddit, dan forum crypto
- Mengenali pola historis dari event serupa

PROFIL USER:
- Risk tolerance: ${riskMap[document.getElementById("riskSlider")?.value || 3]}
- Modal: ${document.getElementById("modalSize")?.value || 1000} USDC
- Bahasa output: ${state.lang === "id" ? "Bahasa Indonesia" : "English"}

FORMAT RESPONS:
Selalu sertakan:
1. 🎯 PREDIKSI: Probabilitas TRUE yang kamu estimasi (%)
2. 📊 VS PASAR: Harga pasar saat ini vs estimasimu (edge)
3. 💡 REKOMENDASI: BUY YES / BUY NO / SKIP + alasan singkat
4. 🔍 CONFIDENCE: High (>70%) / Medium (40-70%) / Low (<40%)
5. 📝 REASONING: Step-by-step chain-of-thought (3-5 langkah)
6. ⚠️ DISCLAIMER: "Ini bukan financial advice."

Gunakan web search untuk mencari berita dan data terkini jika relevan.
Jadilah akurat, transparan, dan tidak pernah menjamin profit.`;
}

// ── ADD MARKET & ANALYZE ──
async function addMarket() {
  const title = document.getElementById("marketTitle").value.trim();
  const yes = parseFloat(document.getElementById("marketYes").value);
  const no = parseFloat(document.getElementById("marketNo").value);
  const volume = document.getElementById("marketVolume").value;
  const deadline = document.getElementById("marketDeadline").value;
  const category = document.getElementById("marketCategory").value;
  const context = document.getElementById("marketContext").value.trim();

  if (!title) { showToast("Judul market wajib diisi!", "error"); return; }
  if (isNaN(yes)) { showToast("Masukkan probabilitas YES!", "error"); return; }

  const market = {
    id: Date.now(),
    title, yes, no: no || (100 - yes), volume, deadline, category, context,
    aiAnalysis: null, aiStatus: "analyzing",
    addedAt: new Date().toISOString()
  };

  state.markets.unshift(market);
  renderMarkets();
  clearForm();

  // Run AI Analysis
  try {
    const prompt = `Analisis market Polymarket berikut:

**MARKET**: ${title}
**Harga YES saat ini**: ${yes}%
**Harga NO saat ini**: ${no || (100 - yes)}%
**Volume**: ${volume ? volume + " USDC" : "Tidak diketahui"}
**Deadline**: ${deadline || "Tidak diketahui"}
**Kategori**: ${category}
${context ? `**Context tambahan**: ${context}` : ""}

Berikan analisis lengkap dengan format yang sudah ditentukan. Gunakan web search untuk mencari berita terkini terkait topik ini.`;

    const result = await callClaude(
      [{ role: "user", content: prompt }],
      getSystemPrompt()
    );

    market.aiAnalysis = result;
    market.aiStatus = "done";
    
    // Save to history
    state.history.unshift({
      id: Date.now(),
      type: "market-scan",
      title: market.title,
      result: result,
      date: new Date().toISOString()
    });

    saveState();
    renderMarkets();
    updateProfileStats();
    showToast("✅ Analisis selesai!", "success");
  } catch (err) {
    market.aiStatus = "error";
    market.aiAnalysis = `❌ Error: ${err.message}`;
    renderMarkets();
    showToast("❌ Gagal analisis: " + err.message, "error");
  }
}

// ── RENDER MARKETS ──
function renderMarkets(filterCat = "all") {
  const grid = document.getElementById("marketsGrid");
  const emptyState = document.getElementById("emptyState");
  
  const filtered = filterCat === "all"
    ? state.markets
    : state.markets.filter(m => m.category === filterCat);

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="empty-state" id="emptyState"><div class="empty-icon">◈</div><p>Belum ada market. Tambahkan market di atas untuk mulai analisis.</p></div>`;
    return;
  }

  grid.innerHTML = filtered.map(m => {
    const yesWidth = Math.min(100, Math.max(0, m.yes));
    const noWidth = Math.min(100, Math.max(0, m.no));
    
    let badgeClass = "analyzing", badgeText = "⏳ Menganalisis...";
    if (m.aiStatus === "done") {
      const rec = getRecommendation(m.aiAnalysis);
      badgeClass = rec.class;
      badgeText = rec.text;
    } else if (m.aiStatus === "error") {
      badgeClass = "negative"; badgeText = "❌ Analisis gagal";
    }

    const catEmoji = {politics:"🗳",crypto:"₿",sports:"⚽",entertainment:"🎬",economy:"📉",custom:"🔧"}[m.category] || "◈";

    return `<div class="market-card" onclick="openMarketModal(${m.id})">
      <div class="mc-header">
        <div class="mc-title">${m.title}</div>
        <div class="mc-category">${catEmoji} ${m.category}</div>
      </div>
      <div class="mc-probs">
        <div class="prob-bar-wrap">
          <div class="prob-label"><span>YES</span><span>${m.yes}%</span></div>
          <div class="prob-bar"><div class="prob-fill-yes" style="width:${yesWidth}%"></div></div>
        </div>
        <div class="prob-bar-wrap">
          <div class="prob-label"><span>NO</span><span>${m.no}%</span></div>
          <div class="prob-bar"><div class="prob-fill-no" style="width:${noWidth}%"></div></div>
        </div>
      </div>
      <div class="mc-meta">
        ${m.volume ? `<span>📊 $${Number(m.volume).toLocaleString()}</span>` : ""}
        ${m.deadline ? `<span>⏰ ${m.deadline}</span>` : ""}
        <span>🕒 ${timeAgo(m.addedAt)}</span>
      </div>
      <div class="mc-ai-badge ${badgeClass}">${badgeText}</div>
      <div class="mc-actions" onclick="event.stopPropagation()">
        <button class="mc-btn" onclick="openMarketModal(${m.id})">🔍 Detail</button>
        <button class="mc-btn" onclick="reanalyzeMarket(${m.id})">🔄 Ulang</button>
        <button class="mc-btn delete" onclick="deleteMarket(${m.id})">🗑 Hapus</button>
      </div>
    </div>`;
  }).join("");
}

function getRecommendation(text) {
  if (!text) return { class: "neutral", text: "⏳ Pending..." };
  const upper = text.toUpperCase();
  if (upper.includes("BUY YES") || upper.includes("BELI YES")) return { class: "positive", text: "✅ Rekomendasi: BUY YES" };
  if (upper.includes("BUY NO") || upper.includes("BELI NO")) return { class: "negative", text: "🔴 Rekomendasi: BUY NO" };
  if (upper.includes("SKIP")) return { class: "neutral", text: "⚪ Rekomendasi: SKIP" };
  return { class: "neutral", text: "🤖 AI telah menganalisis" };
}

function openMarketModal(id) {
  const m = state.markets.find(x => x.id === id);
  if (!m) return;
  document.getElementById("modalMarketTitle").textContent = m.title;
  document.getElementById("modalMarketContent").innerHTML = `
    <div style="display:flex;gap:20px;margin-bottom:16px;">
      <div class="pred-metric"><span class="pred-metric-val green">${m.yes}%</span><span class="pred-metric-lbl">Harga YES</span></div>
      <div class="pred-metric"><span class="pred-metric-val red">${m.no}%</span><span class="pred-metric-lbl">Harga NO</span></div>
      ${m.volume ? `<div class="pred-metric"><span class="pred-metric-val cyan">$${Number(m.volume).toLocaleString()}</span><span class="pred-metric-lbl">Volume</span></div>` : ""}
    </div>
    <div class="result-card" style="margin:0;">
      <h3>🤖 Analisis AI</h3>
      ${m.aiStatus === "analyzing" ? `<div style="display:flex;gap:6px;align-items:center;color:var(--accent)"><div class="spinner"></div> Sedang menganalisis...</div>` : ""}
      ${m.aiStatus === "done" ? formatAnalysis(m.aiAnalysis) : ""}
      ${m.aiStatus === "error" ? `<p style="color:var(--red)">${m.aiAnalysis}</p>` : ""}
    </div>`;
  document.getElementById("marketModal").style.display = "flex";
}

function formatAnalysis(text) {
  if (!text) return "";
  return `<div style="font-size:13px;line-height:1.7;white-space:pre-wrap;">${escHtml(text)}</div>
  <div class="disclaimer">⚠️ Ini adalah analisis AI, bukan financial advice. Selalu lakukan riset mandiri sebelum membuat keputusan investasi.</div>`;
}

function escHtml(str) {
  return str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

async function reanalyzeMarket(id) {
  const m = state.markets.find(x => x.id === id);
  if (!m) return;
  m.aiStatus = "analyzing";
  m.aiAnalysis = null;
  renderMarkets();
  showToast("🔄 Mengulang analisis...", "info");

  try {
    const prompt = `Analisis ulang market Polymarket: "${m.title}"\nHarga YES: ${m.yes}%, NO: ${m.no}%\n${m.context ? "Context: "+m.context : ""}`;
    const result = await callClaude([{ role: "user", content: prompt }], getSystemPrompt());
    m.aiAnalysis = result;
    m.aiStatus = "done";
    saveState();
    renderMarkets();
    showToast("✅ Analisis selesai!", "success");
  } catch (err) {
    m.aiStatus = "error";
    m.aiAnalysis = `❌ ${err.message}`;
    renderMarkets();
    showToast("❌ Gagal: " + err.message, "error");
  }
}

function deleteMarket(id) {
  state.markets = state.markets.filter(m => m.id !== id);
  saveState();
  renderMarkets();
  showToast("🗑 Market dihapus", "info");
}

function clearForm() {
  ["marketTitle","marketYes","marketNo","marketVolume","marketContext"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  document.getElementById("marketDeadline").value = "";
}

// ── CHAT (PREDICT TAB) ──
function initChat() {
  const input = document.getElementById("chatInput");
  const sendBtn = document.getElementById("sendBtn");
  const imageUpload = document.getElementById("imageUpload");

  input.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  sendBtn.addEventListener("click", sendMessage);

  imageUpload.addEventListener("change", async e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      state.currentImage = {
        base64: reader.result.split(",")[1],
        mime: file.type
      };
      document.getElementById("imagePreview").src = reader.result;
      document.getElementById("imagePreviewArea").style.display = "flex";
    };
    reader.readAsDataURL(file);
    showToast("📎 Gambar siap dikirim", "info");
  });

  document.getElementById("removeImageBtn").addEventListener("click", () => {
    state.currentImage = null;
    document.getElementById("imagePreviewArea").style.display = "none";
    document.getElementById("imageUpload").value = "";
  });

  // Templates
  document.querySelectorAll(".template-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const templates = {
        "predict-basic": "Analisis market ini dan berikan prediksi probabilitas TRUE:\n[Tempel judul market dan harga di sini]",
        "sentiment": "Lakukan analisis sentimen untuk topik berikut dan bagaimana pengaruhnya ke market Polymarket terkait:\n[Masukkan topik]",
        "value-bet": "Cek apakah ini value bet:\nMarket: [judul]\nHarga YES pasar: [%]\nMenurutmu probabilitas TRUE-nya berapa?",
        "historical": "Cari pola historis untuk event serupa:\n[Deskripsikan event]",
        "compare": "Bandingkan dua market ini:\nMarket 1: [judul]\nMarket 2: [judul]\nMana yang lebih baik untuk di-bet?",
        "weekly-report": "Buatkan strategy report mingguan untuk trader Polymarket dengan fokus kategori [pilih: crypto/politik/olahraga]. Sertakan top market yang perlu diperhatikan minggu ini."
      };
      document.getElementById("chatInput").value = templates[btn.dataset.template] || "";
      document.getElementById("chatInput").focus();
    });
  });

  // Risk slider
  document.getElementById("riskSlider").addEventListener("input", e => {
    const labels = ["", "Konservatif", "Low Risk", "Medium Risk", "High Risk", "Agresif"];
    document.getElementById("riskDisplay").textContent = labels[e.target.value];
  });
}

async function sendMessage() {
  const input = document.getElementById("chatInput");
  const text = input.value.trim();
  if (!text && !state.currentImage) return;

  const sendBtn = document.getElementById("sendBtn");
  sendBtn.disabled = true;
  sendBtn.innerHTML = `<div class="spinner" style="border-top-color:#fff;"></div>`;

  // Build user message
  let userContent;
  if (state.currentImage) {
    userContent = [
      { type: "image", source: { type: "base64", media_type: state.currentImage.mime, data: state.currentImage.base64 } },
      { type: "text", text: text || "Analisis gambar Polymarket ini dan berikan prediksi lengkap." }
    ];
  } else {
    userContent = text;
  }

  appendChatMessage("user", text || "📎 [Gambar dikirim]");
  input.value = "";
  document.getElementById("imagePreviewArea").style.display = "none";
  state.currentImage = null;
  document.getElementById("imageUpload").value = "";

  // Show thinking
  const thinkingId = appendThinking();

  // Build messages history
  state.chatHistory.push({ role: "user", content: userContent });
  if (state.chatHistory.length > 20) state.chatHistory = state.chatHistory.slice(-20);

  try {
    const result = await callClaude(state.chatHistory, getSystemPrompt());
    removeThinking(thinkingId);
    appendChatMessage("bot", result);
    state.chatHistory.push({ role: "assistant", content: result });

    // Save to history
    state.history.unshift({
      id: Date.now(),
      type: "chat",
      title: text.slice(0, 80) || "Chat dengan AI",
      result: result,
      date: new Date().toISOString()
    });
    if (state.history.length > 100) state.history = state.history.slice(0, 100);
    saveState();
    updateProfileStats();

  } catch (err) {
    removeThinking(thinkingId);
    appendChatMessage("bot", `❌ Error: ${err.message}. Pastikan API key valid.`);
  }

  sendBtn.disabled = false;
  sendBtn.innerHTML = "↑";
}

function appendChatMessage(role, text) {
  const container = document.getElementById("chatMessages");
  const div = document.createElement("div");
  div.className = `chat-message ${role}`;
  div.innerHTML = `
    <div class="chat-avatar">${role === "bot" ? "◈" : "👤"}</div>
    <div class="chat-bubble">${role === "bot" ? markdownToHtml(text) : escHtml(text).replace(/\n/g, "<br>")}</div>`;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  return div;
}

function appendThinking() {
  const id = "thinking-" + Date.now();
  const container = document.getElementById("chatMessages");
  const div = document.createElement("div");
  div.className = "chat-message bot"; div.id = id;
  div.innerHTML = `<div class="chat-avatar">◈</div><div class="chat-bubble thinking-bubble"><div class="thinking-dot"></div><div class="thinking-dot"></div><div class="thinking-dot"></div></div>`;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  return id;
}

function removeThinking(id) {
  document.getElementById(id)?.remove();
}

function markdownToHtml(text) {
  return escHtml(text)
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`(.*?)`/g, `<code style="background:var(--bg-input);padding:2px 6px;border-radius:4px;font-family:var(--font-mono);font-size:11px;">$1</code>`)
    .replace(/^### (.*)/gm, `<h4 style="color:var(--accent);margin:10px 0 6px;font-family:var(--font-display);">$1</h4>`)
    .replace(/^## (.*)/gm, `<h3 style="color:var(--accent);margin:10px 0 6px;">$1</h3>`)
    .replace(/^- (.*)/gm, `<li style="margin-bottom:4px;">$1</li>`)
    .replace(/(<li.*<\/li>)+/g, m => `<ul style="padding-left:16px;margin:6px 0;">${m}</ul>`)
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br>");
}

// ── SENTIMENT ANALYSIS ──
async function analyzeSentiment() {
  const topic = document.getElementById("sentimentTopic").value.trim();
  const context = document.getElementById("sentimentContext").value.trim();
  if (!topic) { showToast("Masukkan topik!", "error"); return; }

  const btn = document.getElementById("analyzeSentimentBtn");
  btn.disabled = true;
  btn.innerHTML = `<span class="spinner"></span> Menganalisis...`;

  const resultDiv = document.getElementById("sentimentResult");
  resultDiv.style.display = "block";
  resultDiv.innerHTML = `<div style="color:var(--accent);display:flex;align-items:center;gap:8px;"><div class="spinner" style="border-top-color:var(--accent);border-color:rgba(0,229,255,0.2);"></div> Menganalisis sentimen & mencari berita terkini...</div>`;

  try {
    const prompt = `Lakukan Sentiment & News Intelligence Analysis untuk topik Polymarket berikut:

**TOPIK**: ${topic}
${context ? `**CONTEXT TAMBAHAN**: ${context}` : ""}

Analisis yang diminta:
1. 📰 RINGKASAN BERITA TERKINI - Cari dan rangkum berita relevan terbaru
2. 🐦 SENTIMEN SOSIAL MEDIA - Estimasi sentimen Twitter/X, Reddit, forum crypto
3. 📊 KLASIFIKASI SENTIMEN - Overall: Bullish/Bearish/Neutral + skor (-100 s/d +100)
4. 🎯 DAMPAK KE MARKET - Bagaimana sentimen ini mempengaruhi probabilitas market
5. 🔑 KEY FACTORS - 3-5 faktor utama yang mendorong sentimen
6. ⚡ SIGNAL STRENGTH - Strong/Medium/Weak

Gunakan web search untuk data aktual.`;

    const result = await callClaude([{ role: "user", content: prompt }], getSystemPrompt());
    
    resultDiv.innerHTML = `
      <h3>🧠 Hasil Sentiment Analysis: ${escHtml(topic)}</h3>
      <div style="font-size:13px;line-height:1.7;white-space:pre-wrap;">${markdownToHtml(result)}</div>
      <div class="disclaimer">⚠️ Analisis sentimen bersifat estimatif. Bukan financial advice.</div>`;

    state.history.unshift({ id: Date.now(), type: "sentiment", title: topic, result, date: new Date().toISOString() });
    saveState();
    showToast("✅ Analisis sentimen selesai!", "success");
  } catch (err) {
    resultDiv.innerHTML = `<p style="color:var(--red)">❌ Error: ${err.message}</p>`;
    showToast("❌ Gagal: " + err.message, "error");
  }

  btn.disabled = false;
  btn.innerHTML = "🧠 Analisis Sentimen";
}

// ── ARBITRAGE DETECTOR ──
async function detectArbitrage() {
  const mA = document.getElementById("arbMarketA").value.trim();
  const yesA = parseFloat(document.getElementById("arbYesA").value);
  const noA = parseFloat(document.getElementById("arbNoA").value);
  const mB = document.getElementById("arbMarketB").value.trim();
  const yesB = parseFloat(document.getElementById("arbYesB").value);
  const noB = parseFloat(document.getElementById("arbNoB").value);

  if (!mA || !mB || isNaN(yesA) || isNaN(yesB)) {
    showToast("Lengkapi semua field!", "error"); return;
  }

  const btn = document.getElementById("detectArbBtn");
  btn.disabled = true;
  btn.innerHTML = `<span class="spinner"></span> Mendeteksi...`;

  const resultDiv = document.getElementById("arbResult");
  resultDiv.style.display = "block";

  // Quick local check
  const totalA = yesA + noA;
  const totalB = yesB + noB;
  const hasMispricingA = Math.abs(totalA - 100) > 3;
  const hasMispricingB = Math.abs(totalB - 100) > 3;

  try {
    const prompt = `Deteksi peluang Arbitrage dan Mispricing untuk dua market Polymarket berikut:

**MARKET A**: ${mA}
- YES: ${yesA}% | NO: ${noA}%
- Total: ${totalA}% (harusnya 100%)

**MARKET B**: ${mB}
- YES: ${yesB}% | NO: ${noB}%
- Total: ${totalB}% (harusnya 100%)

Analisis:
1. ⚡ ARBITRAGE OPPORTUNITY - Apakah ada peluang arbitrage antar market?
2. 🎯 MISPRICING DETECTION - Apakah ada harga yang salah?
3. 💰 EXPECTED PROFIT - Estimasi profit jika ada peluang
4. 🛡 RISIKO - Apa risikonya?
5. 📋 STRATEGI - Langkah konkret untuk eksekusi (jika ada peluang)
6. ✅/❌ KESIMPULAN - Ada peluang atau tidak?

Gunakan web search jika perlu data terkini tentang kedua market.`;

    const result = await callClaude([{ role: "user", content: prompt }], getSystemPrompt());

    const hasOpportunity = result.toLowerCase().includes("peluang") && (result.toLowerCase().includes("ada") || result.toLowerCase().includes("yes"));

    resultDiv.innerHTML = `
      <div class="arb-alert ${hasMispricingA || hasMispricingB ? "opportunity" : "no-opportunity"}">
        ${hasMispricingA ? "⚡ Mispricing terdeteksi di Market A! " : ""}
        ${hasMispricingB ? "⚡ Mispricing terdeteksi di Market B! " : ""}
        ${(!hasMispricingA && !hasMispricingB) ? "✅ Harga kedua market terlihat normal" : ""}
      </div>
      <h3>🤖 Analisis Arbitrage AI</h3>
      <div style="font-size:13px;line-height:1.7;white-space:pre-wrap;">${markdownToHtml(result)}</div>
      <div class="disclaimer">⚠️ Arbitrage di prediction market memiliki risiko. Lakukan due diligence.</div>`;

    state.history.unshift({ id: Date.now(), type: "arbitrage", title: `Arb: ${mA} vs ${mB}`, result, date: new Date().toISOString() });
    saveState();
    showToast("✅ Deteksi selesai!", "success");
  } catch (err) {
    resultDiv.innerHTML = `<p style="color:var(--red)">❌ Error: ${err.message}</p>`;
  }

  btn.disabled = false;
  btn.innerHTML = "⚡ Deteksi Arbitrage";
}

// ── KELLY CRITERION ──
function calcKelly() {
  const trueProb = parseFloat(document.getElementById("kellyTrueProb").value) / 100;
  const marketProb = parseFloat(document.getElementById("kellyMarketProb").value) / 100;
  const bankroll = parseFloat(document.getElementById("kellyBankroll").value);
  const fraction = parseFloat(document.getElementById("kellyFraction").value) || 0.25;

  if (isNaN(trueProb) || isNaN(marketProb) || isNaN(bankroll)) {
    showToast("Lengkapi semua field!", "error"); return;
  }

  // Kelly Formula: f = (p * b - q) / b
  // where b = (1 - marketProb) / marketProb (odds), p = trueProb, q = 1 - trueProb
  const b = (1 - marketProb) / marketProb;
  const p = trueProb;
  const q = 1 - trueProb;
  const kellyFull = (p * b - q) / b;
  const kellyAdjusted = kellyFull * fraction;
  const betAmount = Math.max(0, kellyAdjusted * bankroll);
  const edge = (trueProb - marketProb) * 100;
  const expectedReturn = betAmount * ((1 - marketProb) / marketProb);

  const resultDiv = document.getElementById("kellyResult");
  resultDiv.style.display = "block";

  if (kellyFull <= 0) {
    resultDiv.innerHTML = `
      <h3>📊 Hasil Kelly Criterion</h3>
      <div class="arb-alert no-opportunity">❌ SKIP — Tidak ada edge. Kelly negatif: ${(kellyFull * 100).toFixed(2)}%</div>
      <p style="color:var(--text-secondary);font-size:13px;">True probability (${(trueProb*100).toFixed(1)}%) lebih rendah dari harga pasar (${(marketProb*100).toFixed(1)}%). Tidak ada value bet di sini.</p>`;
    return;
  }

  resultDiv.innerHTML = `
    <h3>📊 Hasil Kelly Criterion</h3>
    <div class="kelly-number">${betAmount.toFixed(2)} USDC</div>
    <p style="text-align:center;color:var(--text-secondary);font-size:12px;margin-bottom:16px;">Jumlah optimal untuk di-bet (${(fraction*100).toFixed(0)}% Kelly)</p>
    <div class="kelly-breakdown">
      <div class="pred-metric"><span class="pred-metric-val cyan">${(kellyFull * 100).toFixed(2)}%</span><span class="pred-metric-lbl">Full Kelly %</span></div>
      <div class="pred-metric"><span class="pred-metric-val gold">${(kellyAdjusted * 100).toFixed(2)}%</span><span class="pred-metric-lbl">Fractional Kelly</span></div>
      <div class="pred-metric"><span class="pred-metric-val ${edge > 0 ? "green" : "red"}">${edge > 0 ? "+" : ""}${edge.toFixed(2)}%</span><span class="pred-metric-lbl">Edge</span></div>
      <div class="pred-metric"><span class="pred-metric-val green">+${expectedReturn.toFixed(2)}</span><span class="pred-metric-lbl">Expected Return</span></div>
    </div>
    <div class="confidence-bar-wrap" style="margin-top:12px;">
      <div class="confidence-label"><span>Kekuatan Edge</span><span>${edge.toFixed(2)}%</span></div>
      <div class="confidence-bar"><div class="confidence-fill ${edge > 15 ? "high" : edge > 7 ? "medium" : "low"}" style="width:${Math.min(100, edge * 3)}%"></div></div>
    </div>
    <div class="disclaimer">⚠️ Kelly Criterion adalah alat matematis. Selalu gunakan fractional Kelly (25-50%) untuk manajemen risiko.</div>`;

  showToast("✅ Kalkulasi Kelly selesai!", "success");
}

// ── BACKTEST LOG ──
function logPrediction() {
  const market = document.getElementById("btMarket").value.trim();
  const predProb = parseFloat(document.getElementById("btPredProb").value);
  const entryPrice = parseFloat(document.getElementById("btEntryPrice").value);
  const amount = parseFloat(document.getElementById("btAmount").value);
  const outcome = document.getElementById("btOutcome").value;
  const category = document.getElementById("btCategory").value;

  if (!market || isNaN(predProb) || isNaN(entryPrice) || isNaN(amount) || !outcome) {
    showToast("Lengkapi semua field!", "error"); return;
  }

  let pnl = null;
  if (outcome === "win") {
    const payout = amount * ((100 - entryPrice) / entryPrice);
    pnl = payout;
  } else if (outcome === "loss") {
    pnl = -amount;
  }

  const entry = {
    id: Date.now(), market, predProb, entryPrice, amount,
    outcome, category, pnl,
    edge: predProb - entryPrice,
    date: new Date().toISOString()
  };

  state.backtestLog.unshift(entry);
  saveState();
  renderBacktestStats();
  renderBacktestTable();

  // Reset
  ["btMarket","btPredProb","btEntryPrice","btAmount"].forEach(id => document.getElementById(id).value = "");
  document.getElementById("btOutcome").value = "";
  showToast("✅ Prediksi tercatat!", "success");
}

function renderBacktestStats() {
  const log = state.backtestLog;
  const completed = log.filter(e => e.outcome !== "pending");
  const wins = completed.filter(e => e.outcome === "win");
  const totalPnl = completed.reduce((acc, e) => acc + (e.pnl || 0), 0);
  const totalInvested = completed.reduce((acc, e) => acc + e.amount, 0);
  const winRate = completed.length > 0 ? (wins.length / completed.length * 100).toFixed(1) : "—";
  const roi = totalInvested > 0 ? ((totalPnl / totalInvested) * 100).toFixed(1) : "—";

  document.getElementById("backtestStats").innerHTML = `
    <div class="bstat"><span class="bstat-val">${log.length}</span><span class="bstat-lbl">Total Prediksi</span></div>
    <div class="bstat"><span class="bstat-val" style="color:${winRate > 50 ? "var(--green)" : "var(--red)"}">${winRate}%</span><span class="bstat-lbl">Win Rate</span></div>
    <div class="bstat"><span class="bstat-val" style="color:${totalPnl >= 0 ? "var(--green)" : "var(--red)"}">${totalPnl >= 0 ? "+" : ""}${totalPnl.toFixed(2)}</span><span class="bstat-lbl">Total P&L (USDC)</span></div>
    <div class="bstat"><span class="bstat-val" style="color:${roi >= 0 ? "var(--green)" : "var(--red)"}">${roi !== "—" ? (roi >= 0 ? "+" : "") + roi + "%" : "—"}</span><span class="bstat-lbl">ROI</span></div>`;

  updateProfileStats(winRate, log.length, roi);
  renderBacktestTable();
}

function renderBacktestTable() {
  const tbody = document.getElementById("backtestBody");
  if (state.backtestLog.length === 0) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="8">Belum ada data. Log prediksi pertama Anda!</td></tr>`;
    return;
  }
  tbody.innerHTML = state.backtestLog.map(e => `
    <tr>
      <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${e.market}">${e.market}</td>
      <td style="font-family:var(--font-mono)">${e.predProb}%</td>
      <td style="font-family:var(--font-mono)">${e.entryPrice}%</td>
      <td style="font-family:var(--font-mono);color:${e.edge > 0 ? "var(--green)" : "var(--red)"}">${e.edge > 0 ? "+" : ""}${e.edge.toFixed(1)}%</td>
      <td style="font-family:var(--font-mono)">${e.amount} USDC</td>
      <td class="outcome-${e.outcome}">${e.outcome === "win" ? "✅ WIN" : e.outcome === "loss" ? "❌ LOSS" : "⏳ Pending"}</td>
      <td class="${e.pnl === null ? "" : e.pnl >= 0 ? "pnl-positive" : "pnl-negative"}">${e.pnl === null ? "—" : (e.pnl >= 0 ? "+" : "") + e.pnl.toFixed(2)}</td>
      <td>${e.category}</td>
    </tr>`).join("");
}

function updateProfileStats(winRate, predictions, roi) {
  if (winRate !== undefined) document.getElementById("statWinRate").textContent = winRate !== "—" ? winRate + "%" : "—";
  if (predictions !== undefined) document.getElementById("statPredictions").textContent = predictions;
  if (roi !== undefined) document.getElementById("statROI").textContent = roi !== "—" ? (roi >= 0 ? "+" : "") + roi + "%" : "—";
}

// ── PORTFOLIO ANALYSIS ──
async function analyzePortfolio() {
  const desc = document.getElementById("portfolioDesc").value.trim();
  if (!desc) { showToast("Deskripsikan portfolio Anda!", "error"); return; }

  const btn = document.getElementById("analyzePortfolioBtn");
  btn.disabled = true;
  btn.innerHTML = `<span class="spinner"></span> Menganalisis...`;

  const resultDiv = document.getElementById("portfolioResult");
  resultDiv.style.display = "block";
  resultDiv.innerHTML = `<div style="color:var(--accent)"><div class="spinner" style="display:inline-block;border-top-color:var(--accent);border-color:rgba(0,229,255,0.2);"></div> Menganalisis portfolio...</div>`;

  try {
    const prompt = `Berikan Portfolio Analysis & Simulation untuk trader Polymarket berikut:

**DESKRIPSI PORTFOLIO**: ${desc}

**DATA HISTORIS BOT** (dari backtest log):
- Total prediksi: ${state.backtestLog.length}
- Win rate: ${state.backtestLog.filter(e=>e.outcome==="win").length}/${state.backtestLog.filter(e=>e.outcome!=="pending").length}

Analisis yang diminta:
1. 📊 PORTFOLIO ASSESSMENT - Evaluasi strategi saat ini
2. 🎯 ALOKASI OPTIMAL - Distribusi modal yang disarankan per kategori
3. 📈 PROYEKSI RETURN - Estimasi return dalam 30 hari (optimis/realistis/pesimis)
4. ⚠️ RISK MANAGEMENT - Batasan per-bet, stop-loss, diversifikasi
5. 💡 REKOMENDASI STRATEGI - 3-5 saran konkret untuk meningkatkan performa
6. 📋 WEEKLY REPORT TEMPLATE - Template report mingguan yang bisa dipakai
7. 🔝 TOP KATEGORI - Kategori market terbaik untuk fokus saat ini

Gunakan web search untuk market Polymarket yang aktif dan relevan saat ini.`;

    const result = await callClaude([{ role: "user", content: prompt }], getSystemPrompt());

    resultDiv.innerHTML = `
      <h3>💼 Analisis Portfolio</h3>
      <div style="font-size:13px;line-height:1.7;white-space:pre-wrap;">${markdownToHtml(result)}</div>
      <div class="disclaimer">⚠️ Proyeksi return adalah estimasi, bukan jaminan. Selalu kelola risiko dengan bijak.</div>`;

    state.history.unshift({ id: Date.now(), type: "portfolio", title: "Portfolio Analysis", result, date: new Date().toISOString() });
    saveState();
    showToast("✅ Analisis portfolio selesai!", "success");
  } catch (err) {
    resultDiv.innerHTML = `<p style="color:var(--red)">❌ Error: ${err.message}</p>`;
  }

  btn.disabled = false;
  btn.innerHTML = "💼 Analisis Portfolio";
}

// ── HISTORY ──
function renderHistory() {
  const container = document.getElementById("historyList");
  const query = document.getElementById("historySearch").value.toLowerCase();
  const filtered = state.history.filter(h =>
    h.title.toLowerCase().includes(query) || (h.result || "").toLowerCase().includes(query)
  );

  if (filtered.length === 0) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">🕒</div><p>Belum ada riwayat analisis.</p></div>`;
    return;
  }

  container.innerHTML = filtered.map(h => `
    <div class="history-item" onclick="expandHistory(${h.id})">
      <div class="history-item-header">
        <div class="history-item-title">${typeIcon(h.type)} ${escHtml(h.title)}</div>
        <div class="history-item-date">${formatDate(h.date)}</div>
      </div>
      <div class="history-item-snippet">${escHtml((h.result || "").slice(0, 120))}...</div>
    </div>`).join("");
}

function typeIcon(type) {
  const icons = { "chat":"💬", "market-scan":"📡", "sentiment":"🧠", "arbitrage":"⚡", "portfolio":"💼" };
  return icons[type] || "◈";
}

function expandHistory(id) {
  const h = state.history.find(x => x.id === id);
  if (!h) return;
  document.getElementById("modalMarketTitle").textContent = `${typeIcon(h.type)} ${h.title}`;
  document.getElementById("modalMarketContent").innerHTML = `
    <div style="font-size:12px;color:var(--text-muted);margin-bottom:12px;font-family:var(--font-mono)">${formatDate(h.date)}</div>
    <div style="font-size:13px;line-height:1.7;white-space:pre-wrap;">${markdownToHtml(h.result || "")}</div>`;
  document.getElementById("marketModal").style.display = "flex";
}

// ── PROFILE ──
function initProfile() {
  document.getElementById("editProfileBtn").addEventListener("click", () => {
    document.getElementById("editName").value = state.profile.name;
    document.getElementById("editRisk").value = state.profile.risk;
    document.getElementById("editFavCat").value = state.profile.favCat;
    document.getElementById("editLang").value = state.profile.lang;
    document.getElementById("profileModal").style.display = "flex";
  });

  document.getElementById("closeProfileModal").addEventListener("click", () => {
    document.getElementById("profileModal").style.display = "none";
  });

  document.getElementById("saveProfileBtn").addEventListener("click", () => {
    state.profile.name = document.getElementById("editName").value || "User";
    state.profile.risk = document.getElementById("editRisk").value;
    state.profile.favCat = document.getElementById("editFavCat").value;
    state.profile.lang = document.getElementById("editLang").value;
    state.lang = state.profile.lang;
    document.getElementById("profileName").textContent = state.profile.name;
    const riskLabels = {"very-low":"🟢 Very Low","low":"🔵 Low","medium":"🟡 Medium","high":"🟠 High","very-high":"🔴 Very High"};
    document.getElementById("profileRisk").textContent = "Risk: " + riskLabels[state.profile.risk];
    document.getElementById("profileModal").style.display = "none";
    saveState();
    showToast("✅ Profil disimpan!", "success");
  });

  document.getElementById("closeMarketModal").addEventListener("click", () => {
    document.getElementById("marketModal").style.display = "none";
  });

  // Close on backdrop
  [document.getElementById("profileModal"), document.getElementById("marketModal")].forEach(modal => {
    modal.addEventListener("click", e => { if (e.target === modal) modal.style.display = "none"; });
  });
}

// ── SETTINGS ──
function initSettings() {
  document.getElementById("settingsBtn").addEventListener("click", () => {
    document.getElementById("editProfileBtn").click();
  });

  document.getElementById("langToggle").addEventListener("click", () => {
    state.lang = state.lang === "id" ? "en" : "id";
    document.getElementById("langToggle").textContent = `🌐 ${state.lang.toUpperCase()}`;
    showToast(`🌐 Bahasa: ${state.lang === "id" ? "Indonesia" : "English"}`, "info");
  });
}

// ── HISTORY CONTROLS ──
function initHistoryControls() {
  document.getElementById("historySearch").addEventListener("input", renderHistory);
  document.getElementById("clearHistoryBtn").addEventListener("click", () => {
    if (confirm("Hapus semua riwayat?")) {
      state.history = [];
      saveState();
      renderHistory();
      showToast("🗑 Riwayat dihapus", "info");
    }
  });
  document.getElementById("exportHistoryBtn").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(state.history, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "polyoracle_history.json"; a.click();
    URL.revokeObjectURL(url);
    showToast("📥 Exported!", "success");
  });
}

// ── UTILITIES ──
function timeAgo(isoDate) {
  const now = new Date(), then = new Date(isoDate);
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return "baru saja";
  if (diff < 3600) return `${Math.floor(diff/60)}m lalu`;
  if (diff < 86400) return `${Math.floor(diff/3600)}j lalu`;
  return `${Math.floor(diff/86400)}h lalu`;
}

function formatDate(isoDate) {
  try {
    return new Date(isoDate).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
  } catch { return isoDate; }
}

// ── INIT ──
function init() {
  loadState();
  initTabs();
  initChips();
  initChat();
  initProfile();
  initSettings();
  initHistoryControls();

  // Buttons
  document.getElementById("addMarketBtn").addEventListener("click", addMarket);
  document.getElementById("clearFormBtn").addEventListener("click", clearForm);
  document.getElementById("analyzeSentimentBtn").addEventListener("click", analyzeSentiment);
  document.getElementById("detectArbBtn").addEventListener("click", detectArbitrage);
  document.getElementById("calcKellyBtn").addEventListener("click", calcKelly);
  document.getElementById("logPredBtn").addEventListener("click", logPrediction);
  document.getElementById("analyzePortfolioBtn").addEventListener("click", analyzePortfolio);

  // Load saved profile
  if (state.profile.name !== "User") {
    document.getElementById("profileName").textContent = state.profile.name;
  }
  const riskLabels = {"very-low":"🟢 Very Low","low":"🔵 Low","medium":"🟡 Medium","high":"🟠 High","very-high":"🔴 Very High"};
  document.getElementById("profileRisk").textContent = "Risk: " + (riskLabels[state.profile.risk] || "Medium");

  // Render saved markets
  if (state.markets.length > 0) {
    renderMarkets();
  }

  // Render backtest
  if (state.backtestLog.length > 0) {
    renderBacktestStats();
  }

  console.log("🔮 PolyOracle initialized");
}

document.addEventListener("DOMContentLoaded", init);
