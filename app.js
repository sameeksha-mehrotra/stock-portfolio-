/* ============================================================
   Portfolio Tracker — App Logic
   ============================================================ */

// ── Constants ────────────────────────────────────────────────
const STORAGE_KEY  = 'sm_portfolio_v2';
const PRICES_URL   = './data/prices.json';
const PORTFOLIO_URL= './data/portfolio.json';

const TYPE_COLORS = {
  ETF:    '#38bdf8',
  Stock:  '#a78bfa',
  Cash:   '#fbbf24',
  Crypto: '#f472b6',
  Other:  '#94a3b8',
};

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
});

// ── Data: Portfolio ──────────────────────────────────────────
async function loadPortfolio() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try { portfolio = JSON.parse(stored); return; } catch {}
  }
  // First visit — load from portfolio.json in repo
  try {
    const res = await fetch(PORTFOLIO_URL + '?v=' + Date.now());
    portfolio = await res.json();
    // Ensure transactions array exists
    if (!portfolio.transactions) portfolio.transactions = [];
    savePortfolio();
  } catch {
    portfolio = getDefaultPortfolio();
  }
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
    pricesUpdated = data.updated ? new Date(data.updated) : null;
    updateTimestampDisplay();
  } catch {
    showToast('Could not load prices — showing last known data', 'error');
  } finally {
    if (showSpinner) {
      const icon = document.querySelector('#refreshBtn i');
      if (icon) icon.classList.remove('spinning');
    }
  }
}

async function refreshPrices() {
  await loadPrices(true);
  renderAll();
  showToast('Prices refreshed', 'success');
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
    ['tradeModal','addStockModal','editCostModal','cashModal','confirmDelete']
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
