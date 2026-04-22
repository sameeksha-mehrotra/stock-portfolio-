/* ============================================================
   Portfolio Tracker — App Logic
   ============================================================ */

// ── Constants ────────────────────────────────────────────────
const STORAGE_KEY  = 'sm_portfolio_v2';
const PRICES_URL   = './data/prices.json';
const PORTFOLIO_URL= './data/portfolio.json';
const GROQ_API_KEY_KEY = 'sm_groq_api_key';

const TYPE_COLORS = {
  ETF:    '#38bdf8',
  Stock:  '#a78bfa',
  Cash:   '#fbbf24',
  Crypto: '#f472b6',
  Other:  '#94a3b8',
};

// ── Sector mapping ────────────────────────────────────────────
const SECTOR_COLORS = {
  'Broad Market':            '#6366f1',
  'Technology':              '#3b82f6',
  'Communication Services':  '#ec4899',
  'Consumer Discretionary':  '#f97316',
  'Consumer Staples':        '#84cc16',
  'Healthcare':              '#14b8a6',
  'Financials':              '#0ea5e9',
  'Energy':                  '#eab308',
  'Real Estate':             '#a855f7',
  'Industrials':             '#64748b',
  'Materials':               '#d97706',
  'Utilities':               '#10b981',
  'Dividend / Income':       '#f59e0b',
  'Crypto':                  '#f472b6',
  'Cash':                    '#fbbf24',
  'Unknown':                 '#94a3b8',
};

const SECTOR_ICONS = {
  'Broad Market':            'fa-globe',
  'Technology':              'fa-microchip',
  'Communication Services':  'fa-satellite-dish',
  'Consumer Discretionary':  'fa-cart-shopping',
  'Consumer Staples':        'fa-basket-shopping',
  'Healthcare':              'fa-heart-pulse',
  'Financials':              'fa-building-columns',
  'Energy':                  'fa-bolt',
  'Real Estate':             'fa-building',
  'Industrials':             'fa-industry',
  'Materials':               'fa-gem',
  'Utilities':               'fa-lightbulb',
  'Dividend / Income':       'fa-hand-holding-dollar',
  'Crypto':                  'fa-bitcoin-sign',
  'Cash':                    'fa-piggy-bank',
  'Unknown':                 'fa-circle-question',
};

const SECTOR_MAP = {
  // Broad Market ETFs
  VTI: 'Broad Market', VOO: 'Broad Market', SPY: 'Broad Market', IVV: 'Broad Market',
  QQQ: 'Technology',  ITOT: 'Broad Market', SCHB: 'Broad Market', VT: 'Broad Market',
  FZROX: 'Broad Market', FSKAX: 'Broad Market', SWTSX: 'Broad Market',
  // Dividend / Income ETFs
  SCHD: 'Dividend / Income', VYM: 'Dividend / Income', DVY: 'Dividend / Income',
  HDV: 'Dividend / Income', SPYD: 'Dividend / Income', DGRO: 'Dividend / Income',
  JEPI: 'Dividend / Income', DIVO: 'Dividend / Income',
  // Sector ETFs
  VGT: 'Technology', XLK: 'Technology', SOXX: 'Technology', SMH: 'Technology',
  VHT: 'Healthcare', XLV: 'Healthcare', IBB: 'Healthcare',
  VFH: 'Financials', XLF: 'Financials', KRE: 'Financials',
  VDE: 'Energy', XLE: 'Energy', OIH: 'Energy',
  VNQ: 'Real Estate', IYR: 'Real Estate', XLRE: 'Real Estate',
  VIS: 'Industrials', XLI: 'Industrials',
  VAW: 'Materials', XLB: 'Materials',
  VPU: 'Utilities', XLU: 'Utilities',
  VCR: 'Consumer Discretionary', XLY: 'Consumer Discretionary',
  VDC: 'Consumer Staples', XLP: 'Consumer Staples',
  VOX: 'Communication Services', XLC: 'Communication Services',
  // Individual stocks — Technology
  MSFT: 'Technology', AAPL: 'Technology', NVDA: 'Technology', AMD: 'Technology',
  INTC: 'Technology', CSCO: 'Technology', CRM: 'Technology', ADBE: 'Technology',
  ORCL: 'Technology', IBM: 'Technology', QCOM: 'Technology', TXN: 'Technology',
  NOW: 'Technology', SNOW: 'Technology', PLTR: 'Technology', UBER: 'Technology',
  // Communication Services
  GOOGL: 'Communication Services', GOOG: 'Communication Services',
  META: 'Communication Services', NFLX: 'Communication Services',
  DIS: 'Communication Services', T: 'Communication Services',
  VZ: 'Communication Services', CMCSA: 'Communication Services',
  TMUS: 'Communication Services', ATVI: 'Communication Services',
  SPOT: 'Communication Services', SNAP: 'Communication Services',
  // Consumer Discretionary
  TSLA: 'Consumer Discretionary', AMZN: 'Consumer Discretionary',
  NKE: 'Consumer Discretionary', MCD: 'Consumer Discretionary',
  HD: 'Consumer Discretionary', LOW: 'Consumer Discretionary',
  SBUX: 'Consumer Discretionary', TGT: 'Consumer Discretionary',
  BKNG: 'Consumer Discretionary', ABNB: 'Consumer Discretionary',
  GM: 'Consumer Discretionary', F: 'Consumer Discretionary',
  RIVN: 'Consumer Discretionary', LCID: 'Consumer Discretionary',
  // Consumer Staples
  WMT: 'Consumer Staples', KO: 'Consumer Staples', PEP: 'Consumer Staples',
  PG: 'Consumer Staples', COST: 'Consumer Staples', PM: 'Consumer Staples',
  MO: 'Consumer Staples', CL: 'Consumer Staples', GIS: 'Consumer Staples',
  // Healthcare
  JNJ: 'Healthcare', PFE: 'Healthcare', UNH: 'Healthcare', ABBV: 'Healthcare',
  MRK: 'Healthcare', BMY: 'Healthcare', LLY: 'Healthcare', AMGN: 'Healthcare',
  MRNA: 'Healthcare', BNTX: 'Healthcare', CVS: 'Healthcare', CI: 'Healthcare',
  // Financials
  'JPM': 'Financials', BAC: 'Financials', GS: 'Financials', V: 'Financials',
  MA: 'Financials', WFC: 'Financials', 'BRK-B': 'Financials', 'BRK-A': 'Financials',
  MS: 'Financials', C: 'Financials', AXP: 'Financials', PYPL: 'Financials',
  SQ: 'Financials', COIN: 'Financials',
  // Energy
  XOM: 'Energy', CVX: 'Energy', COP: 'Energy', SLB: 'Energy',
  OXY: 'Energy', PSX: 'Energy', MPC: 'Energy', VLO: 'Energy',
  // Industrials
  GE: 'Industrials', BA: 'Industrials', CAT: 'Industrials', MMM: 'Industrials',
  HON: 'Industrials', UNP: 'Industrials', RTX: 'Industrials', LMT: 'Industrials',
  DE: 'Industrials', FDX: 'Industrials', UPS: 'Industrials',
  // Materials
  GLD: 'Materials', SLV: 'Materials', FCX: 'Materials', NEM: 'Materials',
  GOLD: 'Materials', NUE: 'Materials', X: 'Materials',
  // Real Estate
  AMT: 'Real Estate', SPG: 'Real Estate', PLD: 'Real Estate', EQIX: 'Real Estate',
  PSA: 'Real Estate', O: 'Real Estate',
  // Utilities
  NEE: 'Utilities', SO: 'Utilities', DUK: 'Utilities', AEP: 'Utilities',
  // Crypto
  'BTC-USD': 'Crypto', 'ETH-USD': 'Crypto', 'BNB-USD': 'Crypto',
  'SOL-USD': 'Crypto', 'ADA-USD': 'Crypto', GBTC: 'Crypto', BITO: 'Crypto',
};

function getSector(ticker) {
  return SECTOR_MAP[ticker] || 'Unknown';
}

// ── State ────────────────────────────────────────────────────
let portfolio = null;   // { cash, holdings[], transactions[] }
let prices    = {};     // { ticker: { price, change, changePct, high52, low52 } }
let pricesUpdated = null;

let sortCol = 'value';
let sortAsc = false;

let tradeState = { ticker: null, mode: null }; // mode: 'buy'|'sell'
let editCostTicker = null;
let deleteTicker   = null;
let cashMode = 'deposit';

let allocationChart = null;

// ── Init ─────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', async () => {
  await loadPortfolio();
  await loadPrices();
  renderAll();
  setupNavScroll();
  initChat();
});

// ── Data: Portfolio ──────────────────────────────────────────
async function loadPortfolio() {
  const stored = localStorage.getItem(STORAGE_KEY);
  let local = null;
  if (stored) {
    try { local = JSON.parse(stored); } catch {}
  }

  // Always fetch remote — it's the source of truth for cash, holdings, watchlist
  try {
    const res = await fetch(PORTFOLIO_URL + '?v=' + Date.now());
    const remote = await res.json();
    portfolio = {
      cash:         remote.cash,
      holdings:     remote.holdings     || [],
      watchlist:    remote.watchlist    || [],
      transactions: local?.transactions || remote.transactions || [],
    };
    savePortfolio();
    return;
  } catch {}

  // Offline fallback — use whatever is in localStorage
  if (local) {
    portfolio = local;
    return;
  }
  portfolio = getDefaultPortfolio();
}

function savePortfolio() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolio));
}

function getDefaultPortfolio() {
  return {
    cash: 14830.61,
    holdings: [
      { ticker:'VTI',   name:'Vanguard Total Stock Market ETF',     type:'ETF',   shares:63.0772,  avgCost:340.27 },
      { ticker:'VOO',   name:'Vanguard S&P 500 ETF',                type:'ETF',   shares:29.4159,  avgCost:634.37 },
      { ticker:'VGT',   name:'Vanguard Information Technology ETF', type:'ETF',   shares:42.6938,  avgCost:737.60 },
      { ticker:'SCHD',  name:'Schwab US Dividend Equity ETF',       type:'ETF',   shares:255.001,  avgCost:31.61  },
      { ticker:'MSFT',  name:'Microsoft Corporation',               type:'Stock', shares:15.3544,  avgCost:397.27 },
      { ticker:'GOOGL', name:'Alphabet Inc. (Google)',              type:'Stock', shares:40.2935,  avgCost:314.88 },
      { ticker:'TSLA',  name:'Tesla, Inc.',                         type:'Stock', shares:59.0000,  avgCost:411.82 },
    ],
    transactions: [],
  };
}

// ── Data: Prices ─────────────────────────────────────────────
async function loadPrices(showSpinner = false) {
  if (showSpinner) {
    const icon = document.querySelector('#refreshBtn i');
    if (icon) icon.classList.add('spinning');
  }
  try {
    const res = await fetch(PRICES_URL + '?v=' + Date.now());
    const data = await res.json();
    prices = data.prices || {};
    const parsed = data.updated ? new Date(data.updated) : null;
    pricesUpdated = parsed && !isNaN(parsed) ? parsed : null;
    updateTimestampDisplay();
    return true;
  } catch {
    const isFile = location.protocol === 'file:';
    showToast(
      isFile
        ? 'Open the site via a local server (python3 -m http.server) to load prices'
        : 'Could not load prices — showing last known data',
      'error'
    );
    return false;
  } finally {
    if (showSpinner) {
      const icon = document.querySelector('#refreshBtn i');
      if (icon) icon.classList.remove('spinning');
    }
  }
}

async function refreshPrices() {
  const ok = await loadPrices(true);
  renderAll();
  if (ok) showToast('Prices refreshed', 'success');
}

function updateTimestampDisplay() {
  const el = document.getElementById('priceTimestamp');
  if (!el) return;
  if (pricesUpdated) {
    const opts = { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit', timeZoneName:'short' };
    el.innerHTML = `<i class="fa-regular fa-clock"></i> Updated ${pricesUpdated.toLocaleDateString('en-US', opts)}`;
  } else {
    el.textContent = 'Prices unavailable';
  }
}

// ── Calculations ─────────────────────────────────────────────
function getPrice(ticker)  { return prices[ticker]?.price  ?? null; }
function getChange(ticker) { return prices[ticker]?.change ?? 0; }
function getChangePct(ticker) { return prices[ticker]?.changePct ?? 0; }

function holdingValue(h) {
  const p = getPrice(h.ticker);
  return p !== null ? p * h.shares : h.avgCost * h.shares;
}

function holdingCost(h)  { return h.avgCost * h.shares; }
function holdingPL(h)    { return holdingValue(h) - holdingCost(h); }
function holdingPLPct(h) { const c = holdingCost(h); return c > 0 ? holdingPL(h) / c : 0; }

function todayChangeDollar(h) { return getChange(h.ticker) * h.shares; }

function totalInvested() { return portfolio.holdings.reduce((s, h) => s + holdingCost(h), 0); }
function totalSecuritiesValue() { return portfolio.holdings.reduce((s, h) => s + holdingValue(h), 0); }
function totalPortfolioValue() { return totalSecuritiesValue() + portfolio.cash; }
function totalPL()   { return portfolio.holdings.reduce((s, h) => s + holdingPL(h), 0); }
function totalPLPct(){ const i = totalInvested(); return i > 0 ? totalPL() / i : 0; }
function totalTodayChange() { return portfolio.holdings.reduce((s, h) => s + todayChangeDollar(h), 0); }
function totalTodayChangePct() {
  const sv = totalSecuritiesValue();
  return sv > 0 ? totalTodayChange() / sv : 0;
}
function portfolioWeight(h) {
  const tv = totalPortfolioValue();
  return tv > 0 ? holdingValue(h) / tv : 0;
}

// ── Rendering ────────────────────────────────────────────────
function renderAll() {
  renderSummaryCards();
  renderAllocationChart();
  renderMiniCards();
  renderHoldingsTable();
  renderSectorAnalysis();
  renderWatchlist();
  renderTransactions();
}

// Summary cards
function renderSummaryCards() {
  const tv   = totalPortfolioValue();
  const todC = totalTodayChange();
  const todP = totalTodayChangePct();
  const pl   = totalPL();
  const plP  = totalPLPct();
  const cash = portfolio.cash;
  const cashW= cash / tv;

  set('totalValue', fmt$(tv));
  set('totalSub', `Securities: ${fmt$(totalSecuritiesValue())} · Cash: ${fmt$(cash)}`);

  set('todayChange', `${todC >= 0 ? '+' : ''}${fmt$(todC)}`);
  el('todayChange').className = `stat-value ${todC >= 0 ? 'change-pos' : 'change-neg'}`;
  set('todaySub', `${fmtPct(todP, true)} today across all positions`);

  set('totalPL', `${pl >= 0 ? '+' : ''}${fmt$(pl)}`);
  el('totalPL').className = `stat-value ${pl >= 0 ? 'change-pos' : 'change-neg'}`;
  set('totalPLSub', `${fmtPct(plP, true)} total return on cost basis`);

  set('cashValue', fmt$(cash));
  set('cashSub', `${fmtPct(cashW)} of total portfolio`);
  const cBal = el('cashBalanceDisplay');
  if (cBal) cBal.innerHTML = `<div class="label">Cash Balance</div><div class="value">${fmt$(cash)}</div>`;

  set('holdingsCount', `${portfolio.holdings.length} position${portfolio.holdings.length !== 1 ? 's' : ''} · Total value ${fmt$(tv)}`);
}

// Allocation donut chart
function renderAllocationChart() {
  const holdings = sortedHoldings();
  const tv = totalPortfolioValue();

  const labels = [...holdings.map(h => h.ticker), 'Cash'];
  const values = [...holdings.map(h => holdingValue(h)), portfolio.cash];
  const colors = holdings.map(h => TYPE_COLORS[h.type] || TYPE_COLORS.Other);
  colors.push(TYPE_COLORS.Cash);

  const ctx = document.getElementById('allocationChart');
  if (!ctx) return;

  if (allocationChart) allocationChart.destroy();

  allocationChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors.map(c => c + 'cc'),
        borderColor: colors,
        borderWidth: 2,
        hoverOffset: 6,
      }],
    },
    options: {
      cutout: '70%',
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => {
              const pct = tv > 0 ? (ctx.raw / tv * 100).toFixed(1) : '0.0';
              return ` ${fmt$(ctx.raw)} (${pct}%)`;
            },
          },
        },
      },
      animation: { animateRotate: true, duration: 600 },
    },
  });

  // Center text
  const cc = el('chartCenter');
  if (cc) cc.innerHTML = `<div class="chart-center-value">${fmt$(tv)}</div><div class="chart-center-label">Total</div>`;

  // Legend
  const leg = el('chartLegend');
  if (leg) {
    leg.innerHTML = labels.map((lbl, i) => {
      const pct = tv > 0 ? (values[i] / tv * 100).toFixed(1) : '0.0';
      return `<div class="legend-item">
        <div class="legend-dot" style="background:${colors[i]}"></div>
        <span class="legend-label">${lbl}</span>
        <span class="legend-pct">${pct}%</span>
      </div>`;
    }).join('');
  }
}

// Mini cards (top holdings summary)
function renderMiniCards() {
  const grid = el('holdingsStatGrid');
  if (!grid) return;
  const tv = totalPortfolioValue();
  const sorted = [...portfolio.holdings].sort((a, b) => holdingValue(b) - holdingValue(a));

  grid.innerHTML = sorted.map(h => {
    const p     = getPrice(h.ticker);
    const chg   = getChange(h.ticker);
    const chgP  = getChangePct(h.ticker);
    const wt    = portfolioWeight(h);
    const color = TYPE_COLORS[h.type] || TYPE_COLORS.Other;
    const pos   = chg >= 0;
    return `
      <div class="holding-mini-card">
        <div class="mini-ticker" style="color:${color}">${h.ticker}</div>
        <div class="mini-name" title="${h.name}">${h.name}</div>
        <div class="mini-price">${p !== null ? fmt$(p) : '—'}</div>
        <div class="mini-change ${pos ? 'change-pos' : 'change-neg'}">
          ${pos ? '▲' : '▼'} ${fmt$(Math.abs(chg))} (${fmtPct(Math.abs(chgP))}) today
        </div>
        <div class="mini-weight">${fmtPct(wt)} of portfolio · ${fmtNum(h.shares)} shares</div>
        <div class="mini-bar">
          <div class="mini-bar-fill" style="width:${Math.min(wt*100*3, 100)}%;background:${color}88"></div>
        </div>
      </div>`;
  }).join('');
}

// Holdings table
function renderHoldingsTable() {
  const tbody = el('holdingsTbody');
  if (!tbody) return;
  const tv = totalPortfolioValue();
  const sorted = sortedHoldings();

  tbody.innerHTML = sorted.map(h => {
    const p    = getPrice(h.ticker);
    const disp = p !== null ? fmt$(p) : fmt$(h.avgCost);
    const chg  = getChange(h.ticker);
    const chgP = getChangePct(h.ticker);
    const val  = holdingValue(h);
    const pl   = holdingPL(h);
    const plP  = holdingPLPct(h);
    const wt   = portfolioWeight(h);
    const color= TYPE_COLORS[h.type] || TYPE_COLORS.Other;
    const h52  = prices[h.ticker]?.high52;
    const l52  = prices[h.ticker]?.low52;
    const pRange = (p && h52 && l52 && h52 > l52)
      ? Math.max(0, Math.min(100, (p - l52) / (h52 - l52) * 100)).toFixed(1)
      : null;

    const plClass = pl > 0 ? 'pl-pill--pos' : pl < 0 ? 'pl-pill--neg' : 'pl-pill--neu';
    const chgClass= chg > 0 ? 'change-pos' : chg < 0 ? 'change-neg' : 'change-neu';

    return `<tr>
      <td>
        <div class="ticker-cell">
          <span class="type-badge type-badge--${h.type.toLowerCase()}">${h.type}</span>
          <span class="ticker-symbol" style="color:${color}">${h.ticker}</span>
        </div>
      </td>
      <td class="hide-sm" style="color:var(--text-secondary);max-width:200px;overflow:hidden;text-overflow:ellipsis" title="${h.name}">${h.name}</td>
      <td class="hide-md" style="color:var(--text-muted);font-size:0.78rem">${h.type}</td>
      <td class="mono">${fmtNum(h.shares, 4)}</td>
      <td class="mono hide-sm" style="color:var(--text-muted)">${fmt$(h.avgCost)}</td>
      <td>
        <div class="mono" style="font-weight:600">${disp}</div>
        <div class="${chgClass}" style="font-size:0.72rem;font-family:var(--font-mono)">
          ${chg >= 0 ? '+' : ''}${fmt$(chg)} (${fmtPct(chgP, true)})
        </div>
        ${pRange !== null ? `<div class="range-bar">
          <div class="range-track"><div class="range-fill" style="width:${pRange}%"></div></div>
          <div class="range-labels"><span>${fmt$(l52, 0)}</span><span>${fmt$(h52, 0)}</span></div>
        </div>` : ''}
      </td>
      <td class="mono" style="font-weight:700">${fmt$(val)}</td>
      <td><span class="pl-pill ${plClass}">${pl >= 0 ? '+' : ''}${fmt$(pl)}<br><small>${fmtPct(plP, true)}</small></span></td>
      <td class="hide-sm">
        <div class="weight-cell">
          <span class="mono" style="font-size:0.8rem">${fmtPct(wt)}</span>
          <div class="weight-bar-bg"><div class="weight-bar-fill" style="width:${Math.min(wt*100*2,100)}%;background:${color}"></div></div>
        </div>
      </td>
      <td>
        <div class="action-cell">
          <button class="action-btn action-btn--buy"  onclick="showTradeModal('${h.ticker}','buy')">Buy</button>
          <button class="action-btn action-btn--sell" onclick="showTradeModal('${h.ticker}','sell')">Sell</button>
          <button class="action-btn action-btn--edit" onclick="showEditCostModal('${h.ticker}')" title="Edit position">⋯</button>
        </div>
      </td>
    </tr>`;
  }).join('');

  // Update sort indicators
  document.querySelectorAll('.holdings-table th').forEach(th => {
    th.classList.remove('sorted', 'desc');
    if (th.dataset.col === sortCol) {
      th.classList.add('sorted');
      if (!sortAsc) th.classList.add('desc');
    }
  });

  // Attach sort click handlers
  document.querySelectorAll('.holdings-table th[data-col]').forEach(th => {
    th.onclick = () => {
      if (sortCol === th.dataset.col) sortAsc = !sortAsc;
      else { sortCol = th.dataset.col; sortAsc = false; }
      renderHoldingsTable();
    };
  });
}

function sortedHoldings() {
  return [...portfolio.holdings].sort((a, b) => {
    let va, vb;
    switch (sortCol) {
      case 'ticker':  va = a.ticker;   vb = b.ticker;   break;
      case 'name':    va = a.name;     vb = b.name;     break;
      case 'type':    va = a.type;     vb = b.type;     break;
      case 'shares':  va = a.shares;   vb = b.shares;   break;
      case 'avgCost': va = a.avgCost;  vb = b.avgCost;  break;
      case 'price':   va = getPrice(a.ticker) ?? 0; vb = getPrice(b.ticker) ?? 0; break;
      case 'value':   va = holdingValue(a); vb = holdingValue(b); break;
      case 'pl':      va = holdingPL(a);    vb = holdingPL(b);    break;
      case 'weight':  va = portfolioWeight(a); vb = portfolioWeight(b); break;
      default:        va = holdingValue(a); vb = holdingValue(b);
    }
    if (typeof va === 'string') {
      return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
    }
    return sortAsc ? va - vb : vb - va;
  });
}

function toggleSort() {
  sortAsc = !sortAsc;
  renderHoldingsTable();
}

// Transactions
function renderTransactions() {
  const tbody = el('txTbody');
  const empty = el('txEmpty');
  const count = el('txCount');
  if (!tbody) return;

  const txs = [...(portfolio.transactions || [])].reverse();
  if (count) count.textContent = `${txs.length} transaction${txs.length !== 1 ? 's' : ''} logged`;

  if (txs.length === 0) {
    tbody.innerHTML = '';
    if (empty) empty.style.display = 'flex';
    return;
  }
  if (empty) empty.style.display = 'none';

  tbody.innerHTML = txs.map(tx => {
    const date = new Date(tx.date).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });
    const time = new Date(tx.date).toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' });
    const typeClass = `tx-badge--${tx.type.toLowerCase()}`;
    const total = tx.shares && tx.price ? tx.shares * tx.price : tx.amount || 0;
    const sign  = tx.type === 'Buy' || tx.type === 'Withdraw' ? '-' : '+';
    return `<tr>
      <td style="color:var(--text-muted)">${date}<br><small>${time}</small></td>
      <td><span class="tx-badge ${typeClass}">${tx.type}</span></td>
      <td class="mono" style="font-weight:700;color:${TYPE_COLORS[tx.assetType]||'inherit'}">${tx.ticker || '—'}</td>
      <td class="hide-sm" style="color:var(--text-secondary)">${tx.name || '—'}</td>
      <td class="mono">${tx.shares ? fmtNum(tx.shares, 4) : '—'}</td>
      <td class="mono">${tx.price  ? fmt$(tx.price)        : '—'}</td>
      <td class="mono" style="font-weight:700">${sign}${fmt$(Math.abs(total))}</td>
      <td class="hide-sm" style="color:var(--text-muted);font-size:0.8rem">${tx.notes || ''}</td>
    </tr>`;
  }).join('');
}

// ── Trade Modal ──────────────────────────────────────────────
function showTradeModal(ticker, mode) {
  const h = portfolio.holdings.find(x => x.ticker === ticker);
  if (!h) return;
  const p = getPrice(ticker) ?? h.avgCost;

  tradeState = { ticker, mode };

  set('tradeModalTitle', mode === 'buy' ? `Buy ${ticker}` : `Sell ${ticker}`);

  const info = el('tradeTickerInfo');
  info.innerHTML = `
    <div>
      <div class="modal-ticker-symbol" style="color:${TYPE_COLORS[h.type]||'inherit'}">${ticker}</div>
      <div class="modal-ticker-name">${h.name}</div>
    </div>
    <div class="modal-ticker-price">${fmt$(p)}<br><small style="color:var(--text-muted)">Market Price</small></div>`;

  const sharesInput = el('tradeShares');
  sharesInput.value = '';
  el('tradePrice').value  = p.toFixed(2);
  el('tradeNotes').value  = '';
  set('tradeTotal', '—');
  set('tradeCashAfter', '—');

  const hint = el('tradeSharesHint');
  if (mode === 'sell') {
    hint.textContent = `Max: ${fmtNum(h.shares, 4)} shares`;
    sharesInput.max  = h.shares;
    el('tradeCashLabel').textContent = 'Cash after sale';
    el('tradeConfirmBtn').textContent = 'Confirm Sell';
    el('tradeConfirmBtn').style.background = 'var(--red)';
  } else {
    hint.textContent = `Available cash: ${fmt$(portfolio.cash)}`;
    sharesInput.removeAttribute('max');
    el('tradeCashLabel').textContent = 'Cash after purchase';
    el('tradeConfirmBtn').textContent = 'Confirm Buy';
    el('tradeConfirmBtn').style.background = '';
  }

  openModal('tradeModal');
  sharesInput.focus();
}

function updateTradeTotal() {
  const shares = parseFloat(el('tradeShares').value) || 0;
  const price  = parseFloat(el('tradePrice').value)  || 0;
  const total  = shares * price;
  set('tradeTotal', fmt$(total));

  const mode   = tradeState.mode;
  const cashAfter = mode === 'buy'
    ? portfolio.cash - total
    : portfolio.cash + total;

  const cashEl = el('tradeCashAfter');
  cashEl.textContent = fmt$(cashAfter);
  cashEl.style.color = cashAfter < 0 ? 'var(--red)' : 'inherit';
}

function confirmTrade() {
  const { ticker, mode } = tradeState;
  const shares = parseFloat(el('tradeShares').value);
  const price  = parseFloat(el('tradePrice').value);
  const notes  = el('tradeNotes').value.trim();

  if (!shares || shares <= 0) { showToast('Enter a valid number of shares', 'error'); return; }
  if (!price  || price  <= 0) { showToast('Enter a valid price', 'error'); return; }

  const h = portfolio.holdings.find(x => x.ticker === ticker);
  if (!h) return;

  if (mode === 'buy') {
    const cost = shares * price;
    if (cost > portfolio.cash) {
      if (!confirm(`This purchase ($${cost.toFixed(2)}) exceeds your cash balance ($${portfolio.cash.toFixed(2)}). Proceed anyway?`)) return;
    }
    // Update avg cost (weighted average)
    const totalShares = h.shares + shares;
    h.avgCost = (h.avgCost * h.shares + price * shares) / totalShares;
    h.shares  = parseFloat(totalShares.toFixed(6));
    portfolio.cash = Math.max(0, portfolio.cash - cost);

    portfolio.transactions.push({
      date: new Date().toISOString(), type: 'Buy', ticker, name: h.name, assetType: h.type,
      shares, price, notes,
    });
    showToast(`Bought ${fmtNum(shares, 4)} shares of ${ticker}`, 'success');

  } else { // sell
    if (shares > h.shares) { showToast(`You only have ${fmtNum(h.shares, 4)} shares`, 'error'); return; }
    const proceeds = shares * price;
    h.shares = parseFloat((h.shares - shares).toFixed(6));
    portfolio.cash += proceeds;

    portfolio.transactions.push({
      date: new Date().toISOString(), type: 'Sell', ticker, name: h.name, assetType: h.type,
      shares, price, notes,
    });

    // Remove position if shares reach ~0
    if (h.shares < 0.0001) {
      portfolio.holdings = portfolio.holdings.filter(x => x.ticker !== ticker);
      showToast(`Closed position in ${ticker}`, 'success');
    } else {
      showToast(`Sold ${fmtNum(shares, 4)} shares of ${ticker}`, 'success');
    }
  }

  savePortfolio();
  closeModal('tradeModal');
  renderAll();
}

// ── Add Stock Modal ──────────────────────────────────────────
function showAddStockModal() {
  el('addTicker').value  = '';
  el('addName').value    = '';
  el('addShares').value  = '';
  el('addAvgCost').value = '';
  el('addType').value    = 'Stock';
  openModal('addStockModal');
  el('addTicker').focus();
}

function confirmAddStock() {
  const ticker  = el('addTicker').value.trim().toUpperCase();
  const name    = el('addName').value.trim();
  const type    = el('addType').value;
  const shares  = parseFloat(el('addShares').value);
  const avgCost = parseFloat(el('addAvgCost').value) || 0;

  if (!ticker)           { showToast('Enter a ticker symbol', 'error'); return; }
  if (!name)             { showToast('Enter the company/fund name', 'error'); return; }
  if (!shares || shares <= 0) { showToast('Enter a valid share count', 'error'); return; }

  if (portfolio.holdings.find(h => h.ticker === ticker)) {
    showToast(`${ticker} is already in your portfolio`, 'error'); return;
  }

  portfolio.holdings.push({ ticker, name, type, shares, avgCost });
  portfolio.transactions.push({
    date: new Date().toISOString(), type: 'Buy', ticker, name, assetType: type,
    shares, price: avgCost, notes: 'Initial position',
  });

  savePortfolio();
  closeModal('addStockModal');
  renderAll();
  showToast(`Added ${ticker} to your portfolio`, 'success');
}

// ── Edit Cost Modal ──────────────────────────────────────────
function showEditCostModal(ticker) {
  const h = portfolio.holdings.find(x => x.ticker === ticker);
  if (!h) return;
  editCostTicker = ticker;

  el('editCostTickerInfo').innerHTML = `
    <div>
      <div class="modal-ticker-symbol" style="color:${TYPE_COLORS[h.type]||'inherit'}">${ticker}</div>
      <div class="modal-ticker-name">${h.name}</div>
    </div>`;
  el('editCostValue').value  = h.avgCost;
  el('editSharesValue').value= h.shares;

  // Remove button wiring
  const btn = el('removePositionBtn');
  btn.onclick = () => showConfirmDelete(ticker);

  openModal('editCostModal');
}

function confirmEditCost() {
  const h = portfolio.holdings.find(x => x.ticker === editCostTicker);
  if (!h) return;

  const newCost   = parseFloat(el('editCostValue').value);
  const newShares = parseFloat(el('editSharesValue').value);

  if (newCost >= 0)   h.avgCost = newCost;
  if (newShares >= 0) h.shares  = newShares;

  savePortfolio();
  closeModal('editCostModal');
  renderAll();
  showToast(`Updated ${editCostTicker}`, 'success');
}

// ── Delete Confirm ───────────────────────────────────────────
function showConfirmDelete(ticker) {
  deleteTicker = ticker;
  const h = portfolio.holdings.find(x => x.ticker === ticker);
  set('confirmDeleteText', `Remove ${ticker} (${h?.name || ''}) from your portfolio? This cannot be undone.`);
  el('confirmDeleteBtn').onclick = confirmDelete;
  closeModal('editCostModal');
  openModal('confirmDelete');
}

function confirmDelete() {
  portfolio.holdings = portfolio.holdings.filter(x => x.ticker !== deleteTicker);
  savePortfolio();
  closeModal('confirmDelete');
  renderAll();
  showToast(`Removed ${deleteTicker}`, 'success');
}

// ── Cash Modal ───────────────────────────────────────────────
function showCashModal() {
  el('cashAmount').value = '';
  el('cashPreview').style.display = 'none';
  setCashMode('deposit');
  openModal('cashModal');
  el('cashAmount').focus();
}

function setCashMode(mode) {
  cashMode = mode;
  el('cashDepositTab') .classList.toggle('active', mode === 'deposit');
  el('cashWithdrawTab').classList.toggle('active', mode === 'withdraw');
  el('cashConfirmBtn').textContent = mode === 'deposit' ? 'Deposit' : 'Withdraw';
  updateCashPreview();
}

function updateCashPreview() {
  const amt = parseFloat(el('cashAmount').value) || 0;
  if (!amt) { el('cashPreview').style.display = 'none'; return; }
  el('cashPreview').style.display = 'flex';
  const after = cashMode === 'deposit' ? portfolio.cash + amt : portfolio.cash - amt;
  const afterEl = el('cashAfterPreview');
  afterEl.textContent = fmt$(after);
  afterEl.style.color = after < 0 ? 'var(--red)' : 'inherit';
}

function confirmCash() {
  const amt = parseFloat(el('cashAmount').value);
  if (!amt || amt <= 0) { showToast('Enter a valid amount', 'error'); return; }

  if (cashMode === 'withdraw' && amt > portfolio.cash) {
    showToast(`Insufficient cash (${fmt$(portfolio.cash)} available)`, 'error'); return;
  }

  const prev = portfolio.cash;
  portfolio.cash = cashMode === 'deposit' ? portfolio.cash + amt : portfolio.cash - amt;

  portfolio.transactions.push({
    date: new Date().toISOString(),
    type: cashMode === 'deposit' ? 'Deposit' : 'Withdraw',
    ticker: 'CASH', name: 'Cash',
    amount: amt, assetType: 'Cash',
    notes: cashMode === 'deposit' ? 'Cash deposit' : 'Cash withdrawal',
  });

  savePortfolio();
  closeModal('cashModal');
  renderAll();
  showToast(`${cashMode === 'deposit' ? 'Deposited' : 'Withdrew'} ${fmt$(amt)}`, 'success');
}

// ── Export ───────────────────────────────────────────────────
function exportTransactions() {
  const txs = portfolio.transactions;
  if (!txs.length) { showToast('No transactions to export', 'info'); return; }

  const headers = ['Date','Type','Ticker','Name','Shares','Price','Total','Notes'];
  const rows = txs.map(tx => {
    const total = tx.shares && tx.price ? (tx.shares * tx.price).toFixed(2) : (tx.amount || '').toString();
    return [
      new Date(tx.date).toLocaleDateString('en-US'),
      tx.type, tx.ticker || '', tx.name || '',
      tx.shares?.toFixed(4) || '', tx.price?.toFixed(2) || '',
      total, tx.notes || '',
    ].map(v => `"${String(v).replace(/"/g,'""')}"`).join(',');
  });

  const csv  = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = `portfolio-transactions-${fmtDate()}.csv`;
  a.click(); URL.revokeObjectURL(url);
  showToast('CSV downloaded', 'success');
}

// ── Modal Helpers ────────────────────────────────────────────
function openModal(id) {
  const overlay = el(id + 'Overlay');
  if (overlay) overlay.classList.add('open');
}

function closeModal(id) {
  const overlay = el(id + 'Overlay');
  if (overlay) overlay.classList.remove('open');
}

// Close modals on Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    ['tradeModal','addStockModal','editCostModal','cashModal','confirmDelete','addWatchModal']
      .forEach(id => closeModal(id));
  }
});

// ── Toast ────────────────────────────────────────────────────
function showToast(message, type = 'info') {
  const container = el('toastContainer');
  if (!container) return;

  const icons = { success: 'fa-check-circle', error: 'fa-circle-exclamation', info: 'fa-circle-info' };
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.innerHTML = `<i class="fa-solid ${icons[type] || icons.info}"></i> ${message}`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ── Nav scroll effect ────────────────────────────────────────
function setupNavScroll() {
  const nav = el('navbar');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.style.boxShadow = window.scrollY > 20 ? 'var(--shadow-md)' : '';
  }, { passive: true });
}

// ── Utilities ────────────────────────────────────────────────
function el(id)  { return document.getElementById(id); }
function set(id, val) { const e = el(id); if (e) e.textContent = val; }

function fmt$(n, decimals = 2) {
  if (n === null || n === undefined || isNaN(n)) return '—';
  return '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function fmtPct(n, signed = false) {
  if (n === null || n === undefined || isNaN(n)) return '—';
  const s = signed && n > 0 ? '+' : '';
  return s + (n * 100).toFixed(2) + '%';
}

function fmtNum(n, dec = 2) {
  if (n === null || n === undefined || isNaN(n)) return '—';
  return n.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

function fmtDate() {
  return new Date().toISOString().slice(0, 10);
}

// ══════════════════════════════════════════════════════════════════════════════
//  WATCHLIST
// ══════════════════════════════════════════════════════════════════════════════

const REASON_COLORS = {
  'International Diversification': '#6366f1',
  'Defensive / Fixed Income':      '#10b981',
  'Sector Gap — Healthcare':       '#14b8a6',
  'Sector Gap — Real Estate':      '#a855f7',
  'Small Cap Value Tilt':          '#f97316',
  'AI / Growth':                   '#3b82f6',
  'Dividend / Income':             '#f59e0b',
};

function reasonColor(reason) {
  if (!reason) return '#94a3b8';
  for (const [key, val] of Object.entries(REASON_COLORS)) {
    if (reason.toLowerCase().includes(key.toLowerCase().split(' ')[0].toLowerCase())) return val;
  }
  return '#a78bfa';
}

function renderWatchlist() {
  const grid = el('watchlistGrid');
  if (!grid) return;

  if (!portfolio.watchlist) portfolio.watchlist = [];

  const sub = el('watchlistSub');
  if (sub) sub.textContent = `${portfolio.watchlist.length} ticker${portfolio.watchlist.length !== 1 ? 's' : ''} on your radar`;

  if (portfolio.watchlist.length === 0) {
    grid.innerHTML = `<div class="watchlist-empty">
      <i class="fa-regular fa-eye fa-2x"></i>
      <p>No stocks on your watchlist yet. Click <strong>Add to Watchlist</strong> to start tracking.</p>
    </div>`;
    return;
  }

  grid.innerHTML = portfolio.watchlist.map((w, idx) => {
    const p      = getPrice(w.ticker);
    const chg    = getChange(w.ticker);
    const chgP   = getChangePct(w.ticker);
    const h52    = prices[w.ticker]?.high52;
    const l52    = prices[w.ticker]?.low52;
    const color  = TYPE_COLORS[w.type] || TYPE_COLORS.Other;
    const rColor = reasonColor(w.reason);
    const pos    = chg >= 0;

    const pRange = (p && h52 && l52 && h52 > l52)
      ? Math.max(0, Math.min(100, (p - l52) / (h52 - l52) * 100)).toFixed(1)
      : null;

    const targetDiff = (w.targetPrice && p)
      ? ((w.targetPrice - p) / p * 100)
      : null;

    const inPortfolio = portfolio.holdings.some(h => h.ticker === w.ticker);

    return `
      <div class="watch-card" id="watch-card-${idx}">
        <div class="watch-card-top">
          <div class="watch-card-identity">
            <span class="type-badge type-badge--${w.type.toLowerCase()}">${w.type}</span>
            <span class="watch-ticker" style="color:${color}">${w.ticker}</span>
          </div>
          <button class="watch-remove-btn" onclick="removeFromWatchlist(${idx})" title="Remove from watchlist">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="watch-name" title="${w.name}">${w.name}</div>

        ${w.reason ? `<div class="watch-reason" style="background:${rColor}18;color:${rColor}">${w.reason}</div>` : ''}

        <div class="watch-price-row">
          <div class="watch-price">${p !== null ? fmt$(p) : '—'}</div>
          ${p !== null ? `<div class="watch-change ${pos ? 'change-pos' : 'change-neg'}">
            ${pos ? '▲' : '▼'} ${fmt$(Math.abs(chg))} (${fmtPct(Math.abs(chgP))})
          </div>` : '<div class="watch-no-price">Price pending next update</div>'}
        </div>

        ${pRange !== null ? `<div class="range-bar" style="width:100%;margin:0.5rem 0 0.25rem">
          <div class="range-track"><div class="range-fill" style="width:${pRange}%"></div></div>
          <div class="range-labels"><span>${fmt$(l52, 0)}</span><span>52w</span><span>${fmt$(h52, 0)}</span></div>
        </div>` : ''}

        ${w.targetPrice ? `<div class="watch-target">
          <span>Target: ${fmt$(w.targetPrice)}</span>
          ${targetDiff !== null ? `<span class="${targetDiff >= 0 ? 'change-pos' : 'change-neg'}">${targetDiff >= 0 ? '+' : ''}${targetDiff.toFixed(1)}% to target</span>` : ''}
        </div>` : ''}

        ${w.notes ? `<div class="watch-notes">${w.notes}</div>` : ''}

        <div class="watch-actions">
          ${inPortfolio
            ? `<span class="watch-in-portfolio"><i class="fa-solid fa-check-circle"></i> In Portfolio</span>`
            : `<button class="btn btn-xs btn-primary" onclick="showAddStockFromWatch('${w.ticker}','${w.name.replace(/'/g,"\\'")}','${w.type}')">
                <i class="fa-solid fa-plus"></i> Add to Portfolio
              </button>`}
        </div>
      </div>`;
  }).join('');
}

function showAddWatchModal() {
  ['watchTicker','watchName','watchReason','watchNotes'].forEach(id => { if (el(id)) el(id).value = ''; });
  if (el('watchTarget')) el('watchTarget').value = '';
  if (el('watchType'))   el('watchType').value   = 'Stock';
  openModal('addWatchModal');
  el('watchTicker')?.focus();
}

function confirmAddWatch() {
  const ticker = (el('watchTicker')?.value || '').trim().toUpperCase();
  const name   = (el('watchName')?.value   || '').trim();
  const type   = el('watchType')?.value   || 'Stock';
  const reason = (el('watchReason')?.value || '').trim();
  const target = parseFloat(el('watchTarget')?.value) || null;
  const notes  = (el('watchNotes')?.value  || '').trim();

  if (!ticker) { showToast('Enter a ticker symbol', 'error'); return; }
  if (!name)   { showToast('Enter the company/fund name', 'error'); return; }

  if (!portfolio.watchlist) portfolio.watchlist = [];
  if (portfolio.watchlist.find(w => w.ticker === ticker)) {
    showToast(`${ticker} is already on your watchlist`, 'error'); return;
  }

  portfolio.watchlist.push({ ticker, name, type, reason, targetPrice: target, notes, addedDate: fmtDate() });
  savePortfolio();
  closeModal('addWatchModal');
  renderWatchlist();
  showToast(`Added ${ticker} to watchlist`, 'success');
}

function removeFromWatchlist(idx) {
  if (!portfolio.watchlist) return;
  const w = portfolio.watchlist[idx];
  portfolio.watchlist.splice(idx, 1);
  savePortfolio();
  renderWatchlist();
  showToast(`Removed ${w.ticker} from watchlist`, 'success');
}

function showAddStockFromWatch(ticker, name, type) {
  closeModal('addWatchModal');
  el('addTicker').value  = ticker;
  el('addName').value    = name;
  el('addType').value    = type;
  el('addShares').value  = '';
  el('addAvgCost').value = '';
  openModal('addStockModal');
  el('addShares')?.focus();
}

// ══════════════════════════════════════════════════════════════════════════════
//  SECTOR DIVERSIFICATION
// ══════════════════════════════════════════════════════════════════════════════

let sectorChart = null;

function buildSectorBreakdown() {
  const byName = {};
  for (const h of portfolio.holdings) {
    const sector = getSector(h.ticker);
    const val = holdingValue(h);
    if (!byName[sector]) {
      byName[sector] = {
        sector,
        color: SECTOR_COLORS[sector] || SECTOR_COLORS.Unknown,
        icon:  SECTOR_ICONS[sector]  || SECTOR_ICONS.Unknown,
        value: 0,
        tickers: [],
      };
    }
    byName[sector].value += val;
    byName[sector].tickers.push(h.ticker);
  }
  if (portfolio.cash > 0) {
    byName['Cash'] = {
      sector: 'Cash', color: SECTOR_COLORS.Cash, icon: SECTOR_ICONS.Cash,
      value: portfolio.cash, tickers: ['CASH'],
    };
  }
  return Object.values(byName).sort((a, b) => b.value - a.value);
}

function computeDiversityScore(sectors) {
  const tv = totalPortfolioValue();
  const sv = totalSecuritiesValue();
  let score = 100;
  const strengths = [], gaps = [], notes = [];

  const investedSectors = sectors.filter(s => s.sector !== 'Cash');
  const sectorNames = investedSectors.map(s => s.sector);

  const hasBroadMarket = portfolio.holdings.some(h =>
    ['VTI','VOO','SPY','IVV','ITOT','SCHB','VT','FZROX','FSKAX','SWTSX'].includes(h.ticker)
  );
  const hasDividend = portfolio.holdings.some(h =>
    ['SCHD','VYM','DVY','HDV','SPYD','DGRO','JEPI','DIVO'].includes(h.ticker)
  );

  if (hasBroadMarket) {
    strengths.push('Broad market ETFs (VTI/VOO) provide instant exposure across all 11 GICS sectors');
  } else {
    score -= 15;
    gaps.push('No broad market ETF — consider VTI or VOO for instant multi-sector diversification');
  }

  if (hasDividend) {
    strengths.push('Dividend ETF adds income-focused, defensive companies to balance growth holdings');
  } else {
    score -= 5;
    gaps.push('No dividend ETF — SCHD or VYM can add income stability and reduce volatility');
  }

  for (const s of investedSectors) {
    if (s.sector === 'Broad Market') continue;
    const pct = s.value / sv;
    if (pct > 0.45) {
      score -= 20;
      gaps.push(`${s.sector} is over-concentrated at ${(pct*100).toFixed(1)}% of securities — consider trimming`);
    } else if (pct > 0.28) {
      score -= 8;
      notes.push(`${s.sector} at ${(pct*100).toFixed(1)}% is elevated — monitor for further concentration`);
    }
  }

  const nonBroad = investedSectors.filter(s => s.sector !== 'Broad Market').length;
  if (nonBroad >= 4) {
    strengths.push(`${nonBroad} distinct sector exposures beyond broad market — solid spread`);
  } else if (nonBroad < 2) {
    score -= 15;
    gaps.push('Very few distinct sector bets — diversifying further would reduce single-sector risk');
  }

  if (!hasBroadMarket) {
    const missingMajor = ['Healthcare','Financials','Energy','Consumer Staples'].filter(s => !sectorNames.includes(s));
    if (missingMajor.length > 0) {
      score -= missingMajor.length * 3;
      gaps.push(`Missing major sectors: ${missingMajor.join(', ')}`);
    }
  } else {
    notes.push('Broad market ETFs indirectly cover Healthcare, Financials, Energy, and all other sectors');
  }

  const cashPct = portfolio.cash / tv;
  if (cashPct >= 0.06 && cashPct <= 0.20) {
    strengths.push(`${(cashPct*100).toFixed(1)}% cash reserve — healthy dry powder for opportunities`);
  } else if (cashPct > 0.25) {
    score -= 5;
    notes.push(`${(cashPct*100).toFixed(1)}% cash is high — deploying some into index ETFs could improve long-term returns`);
  }

  score = Math.max(10, Math.min(100, Math.round(score)));
  return { score, strengths, gaps, notes };
}

function renderSectorAnalysis() {
  const sectors = buildSectorBreakdown();
  const { score, strengths, gaps, notes } = computeDiversityScore(sectors);
  const tv = totalPortfolioValue();

  // Score badge
  const scoreBadge = el('diversityScore');
  if (scoreBadge) {
    const tier = score >= 80 ? ['Excellent','div-score--excellent']
               : score >= 65 ? ['Good','div-score--good']
               : score >= 45 ? ['Moderate','div-score--moderate']
               : ['Needs Work','div-score--weak'];
    scoreBadge.innerHTML = `
      <div class="div-score-ring ${tier[1]}">
        <span class="div-score-num">${score}</span>
        <span class="div-score-label">/ 100</span>
      </div>
      <div class="div-score-tier">${tier[0]}</div>`;
  }

  // Donut chart
  const ctx = document.getElementById('sectorChart');
  if (ctx) {
    if (sectorChart) sectorChart.destroy();
    const labels = sectors.map(s => s.sector);
    const values = sectors.map(s => s.value);
    const colors = sectors.map(s => s.color);
    sectorChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: colors.map(c => c + 'cc'),
          borderColor: colors,
          borderWidth: 2,
          hoverOffset: 6,
        }],
      },
      options: {
        cutout: '70%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => {
                const pct = tv > 0 ? (ctx.raw / tv * 100).toFixed(1) : '0.0';
                return ` ${fmt$(ctx.raw)} (${pct}%)`;
              },
            },
          },
        },
        animation: { animateRotate: true, duration: 600 },
      },
    });
    const cc = el('sectorChartCenter');
    if (cc) cc.innerHTML = `<div class="chart-center-value">${sectors.length}</div><div class="chart-center-label">Sectors</div>`;
  }

  // Legend
  const leg = el('sectorLegend');
  if (leg) {
    leg.innerHTML = sectors.map(s => {
      const pct = tv > 0 ? (s.value / tv * 100).toFixed(1) : '0.0';
      return `<div class="legend-item">
        <div class="legend-dot" style="background:${s.color}"></div>
        <span class="legend-label">${s.sector}</span>
        <span class="legend-pct">${pct}%</span>
      </div>`;
    }).join('');
  }

  // Sector cards
  const cardsEl = el('sectorCards');
  if (cardsEl) {
    cardsEl.innerHTML = sectors.filter(s => s.sector !== 'Cash').map(s => {
      const pct = tv > 0 ? (s.value / tv * 100) : 0;
      const barW = Math.min(pct * 2.5, 100).toFixed(1);
      return `
        <div class="sector-card">
          <div class="sector-card-header">
            <div class="sector-card-icon" style="background:${s.color}22;color:${s.color}">
              <i class="fa-solid ${s.icon}"></i>
            </div>
            <div class="sector-card-info">
              <div class="sector-card-name">${s.sector}</div>
              <div class="sector-card-tickers">${s.tickers.join(' · ')}</div>
            </div>
            <div class="sector-card-pct" style="color:${s.color}">${pct.toFixed(1)}%</div>
          </div>
          <div class="sector-bar-track">
            <div class="sector-bar-fill" style="width:${barW}%;background:${s.color}"></div>
          </div>
          <div class="sector-card-value">${fmt$(s.value)}</div>
        </div>`;
    }).join('');
  }

  // Insights panel
  const panel = el('insightsPanel');
  if (panel) {
    const makeItems = (arr, cls, icon) => arr.map(t =>
      `<div class="insight-item insight-item--${cls}"><i class="fa-solid ${icon}"></i><span>${t}</span></div>`
    ).join('');
    panel.innerHTML = `
      <div class="insights-title"><i class="fa-solid fa-lightbulb"></i> Diversification Insights</div>
      <div class="insights-grid">
        ${strengths.length ? `<div class="insights-group">
          <div class="insights-group-label insights-group-label--strength">Strengths</div>
          ${makeItems(strengths, 'strength', 'fa-check-circle')}
        </div>` : ''}
        ${gaps.length ? `<div class="insights-group">
          <div class="insights-group-label insights-group-label--gap">Gaps &amp; Actions</div>
          ${makeItems(gaps, 'gap', 'fa-triangle-exclamation')}
        </div>` : ''}
        ${notes.length ? `<div class="insights-group">
          <div class="insights-group-label insights-group-label--note">Notes</div>
          ${makeItems(notes, 'note', 'fa-circle-info')}
        </div>` : ''}
      </div>`;
  }
}

// ══════════════════════════════════════════════════════════════════════════════
//  AI CHAT ADVISOR
// ══════════════════════════════════════════════════════════════════════════════

let chatOpen = false;
let chatHistory = [];

function initChat() {
  const hasKey = !!localStorage.getItem(GROQ_API_KEY_KEY);
  const setup = el('chatApiSetup');
  const inputArea = el('chatInputArea');
  if (setup)     setup.style.display    = hasKey ? 'none' : 'flex';
  if (inputArea) inputArea.style.display = hasKey ? 'flex' : 'none';
  if (!hasKey) el('chatSubtitle') && (el('chatSubtitle').textContent = 'Free API key required');
  renderWelcomeMessage();
}

function renderWelcomeMessage() {
  const msgs = el('chatMessages');
  if (!msgs || msgs.children.length > 0) return;
  addChatBubble('ai', `Hi! I'm your **Portfolio Advisor** powered by Llama 3 (Groq). 📊\n\nTell me your investment goals and I'll analyze your actual holdings to give personalized advice — including specific steps, sector gaps, and curated resources.\n\n*Try: "I want moderate risk and steady growth — what should I change?"*`);
}

function toggleChat() {
  chatOpen = !chatOpen;
  const panel = el('chatPanel');
  const fab   = el('chatFab');
  if (panel) panel.classList.toggle('chat-panel--open', chatOpen);
  if (fab)   fab.classList.toggle('chat-fab--open', chatOpen);
  if (chatOpen) {
    setTimeout(() => {
      const inp = el('chatInput');
      if (inp) inp.focus();
      scrollChatToBottom();
    }, 150);
  }
}

function showApiKeySetup() {
  const setup = el('chatApiSetup');
  const input = el('chatInputArea');
  if (setup) setup.style.display = 'flex';
  if (input) input.style.display = 'none';
  const keyInput = el('apiKeyInput');
  if (keyInput) {
    const existing = localStorage.getItem(GROQ_API_KEY_KEY);
    if (existing) keyInput.value = existing;
    keyInput.focus();
  }
}

function saveApiKey() {
  const val = (el('apiKeyInput')?.value || '').trim();
  if (!val.startsWith('gsk_') || val.length < 40) {
    showToast('Key looks invalid — paste the full key from console.groq.com (starts with gsk_)', 'error');
    return;
  }
  localStorage.setItem(GROQ_API_KEY_KEY, val);
  const setup = el('chatApiSetup');
  const input = el('chatInputArea');
  if (setup) setup.style.display = 'none';
  if (input) input.style.display = 'flex';
  el('chatSubtitle') && (el('chatSubtitle').textContent = 'Powered by Llama 3 · Groq');
  showToast('API key saved', 'success');
}

function downloadChat() {
  if (!chatHistory.length) { showToast('No chat history to download', 'info'); return; }
  const lines = chatHistory.map(m => `${m.role === 'user' ? 'You' : 'Advisor'}: ${m.content}`).join('\n\n');
  const blob = new Blob([lines], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `portfolio-chat-${new Date().toISOString().slice(0,10)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

function clearChat() {
  chatHistory = [];
  const msgs = el('chatMessages');
  if (msgs) msgs.innerHTML = '';
  renderWelcomeMessage();
}

function handleChatKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendChatMessage();
  }
}

async function sendChatMessage() {
  const apiKey = localStorage.getItem(GROQ_API_KEY_KEY);
  if (!apiKey) { showApiKeySetup(); return; }

  const inp = el('chatInput');
  const userText = (inp?.value || '').trim();
  if (!userText) return;

  inp.value = '';
  inp.style.height = '';

  addChatBubble('user', userText);
  chatHistory.push({ role: 'user', content: userText });

  const loadingId = addChatLoading();
  el('chatSendBtn') && (el('chatSendBtn').disabled = true);

  try {
    const reply = await callClaudeAPI(apiKey, chatHistory);
    removeChatLoading(loadingId);
    addChatBubble('ai', reply);
    chatHistory.push({ role: 'assistant', content: reply });
  } catch (err) {
    removeChatLoading(loadingId);
    addChatBubble('ai', `⚠️ Error: ${err.message}\n\nIf this is a CORS error, try opening the site locally or check that your API key is valid.`);
  } finally {
    el('chatSendBtn') && (el('chatSendBtn').disabled = false);
  }
}

async function callClaudeAPI(apiKey, messages) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: buildPortfolioContext() },
        ...messages.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content })),
      ],
      max_tokens: 1500,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    let errMsg = `HTTP ${res.status}`;
    try { const j = await res.json(); errMsg = j.error?.message || errMsg; } catch {}
    throw new Error(errMsg);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || 'No response received.';
}

function buildPortfolioContext() {
  const tv  = totalPortfolioValue();
  const sv  = totalSecuritiesValue();
  const pl  = totalPL();
  const plP = totalPLPct();
  const sectors = buildSectorBreakdown();
  const date = new Date().toLocaleDateString('en-US', { month:'long', day:'numeric', year:'numeric' });

  const holdingsTable = portfolio.holdings.map(h => {
    const val = holdingValue(h);
    const wt  = (val / tv * 100).toFixed(1);
    const sector = getSector(h.ticker);
    return `• ${h.ticker} (${h.name}) — ${sector} — ${fmtNum(h.shares,4)} shares @ ${fmt$(getPrice(h.ticker) ?? h.avgCost)} = ${fmt$(val)} (${wt}% of portfolio)`;
  }).join('\n');

  const sectorTable = sectors.filter(s => s.sector !== 'Cash').map(s => {
    const pct = (s.value / tv * 100).toFixed(1);
    return `• ${s.sector}: ${fmt$(s.value)} (${pct}%) — [${s.tickers.join(', ')}]`;
  }).join('\n');

  return `You are an expert, friendly portfolio advisor. You have direct access to the user's real portfolio data below. Your goal is to help them diversify for maximum profit at moderate risk.

PORTFOLIO SNAPSHOT (as of ${date}):
Total Portfolio Value: ${fmt$(tv)}
Securities: ${fmt$(sv)} | Cash: ${fmt$(portfolio.cash)} (${(portfolio.cash/tv*100).toFixed(1)}% of portfolio)
Total Gain/Loss: ${pl >= 0 ? '+' : ''}${fmt$(pl)} (${fmtPct(plP, true)})

HOLDINGS:
${holdingsTable}

SECTOR BREAKDOWN:
${sectorTable}

USER INVESTMENT PHILOSOPHY: Diversification for maximum profit with moderate risk. Mix of growth ETFs, dividend income, and individual stocks.

INSTRUCTIONS FOR YOUR RESPONSES:
1. Always reference specific tickers and dollar amounts from the portfolio above
2. Give 3-5 concrete, actionable recommendations
3. Flag any concentration risks you notice
4. Suggest specific ETFs or sectors to fill gaps
5. End EVERY response with a "Resources" section containing 2-3 links to reputable financial education sources (Investopedia, Bogleheads, Morningstar, Vanguard Investor Education) — use real, stable URLs
6. Format using markdown: **bold** for key points, bullet lists for recommendations
7. Keep responses focused and under 400 words unless the question demands more depth`;
}

function addChatBubble(role, text) {
  const msgs = el('chatMessages');
  if (!msgs) return;

  const div = document.createElement('div');
  div.className = `chat-bubble chat-bubble--${role}`;

  const html = renderChatMarkdown(text);
  div.innerHTML = `<div class="chat-bubble-content">${html}</div>`;
  msgs.appendChild(div);
  scrollChatToBottom();
}

function addChatLoading() {
  const msgs = el('chatMessages');
  if (!msgs) return null;
  const id = 'chat-loading-' + Date.now();
  const div = document.createElement('div');
  div.className = 'chat-bubble chat-bubble--ai';
  div.id = id;
  div.innerHTML = `<div class="chat-bubble-content chat-loading"><span></span><span></span><span></span></div>`;
  msgs.appendChild(div);
  scrollChatToBottom();
  return id;
}

function removeChatLoading(id) {
  if (id) el(id)?.remove();
}

function scrollChatToBottom() {
  const msgs = el('chatMessages');
  if (msgs) msgs.scrollTop = msgs.scrollHeight;
}

function renderChatMarkdown(text) {
  // Process links first (before escaping)
  const linkPlaceholders = [];
  text = text.replace(/\[(.*?)\]\((https?:\/\/[^\s)]+)\)/g, (_, label, url) => {
    const idx = linkPlaceholders.length;
    linkPlaceholders.push(`<a href="${url}" target="_blank" rel="noopener" class="chat-link">${label} <i class="fa-solid fa-arrow-up-right-from-square" style="font-size:0.65em"></i></a>`);
    return `\x00LINK${idx}\x00`;
  });

  // Escape HTML
  text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Inline formatting
  text = text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>');

  // Restore links
  linkPlaceholders.forEach((link, i) => { text = text.replace(`\x00LINK${i}\x00`, link); });

  // Process line by line
  const lines = text.split('\n');
  const out = [];
  let inList = false;

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line) {
      if (inList) { out.push('</ul>'); inList = false; }
      continue;
    }
    const headMatch = line.match(/^#{1,3} (.+)/);
    if (headMatch) {
      if (inList) { out.push('</ul>'); inList = false; }
      out.push(`<h4>${headMatch[1]}</h4>`);
      continue;
    }
    const listMatch = line.match(/^(?:[*\-]|\d+\.) (.+)/);
    if (listMatch) {
      if (!inList) { out.push('<ul>'); inList = true; }
      out.push(`<li>${listMatch[1]}</li>`);
      continue;
    }
    if (inList) { out.push('</ul>'); inList = false; }
    out.push(`<p>${line}</p>`);
  }
  if (inList) out.push('</ul>');

  return out.join('');
}
