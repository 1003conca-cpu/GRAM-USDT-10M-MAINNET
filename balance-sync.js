/**
 * GRAM 10M balance synchronizer.
 *
 * One source updates both balances:
 *   - inside: the signed-in website account (from the website's own API)
 *   - outside: the connected TON wallet (read directly from TON API)
 *
 * Minimal markup:
 *   <span data-gram-balance="inside">--</span>
 *   <span data-gram-balance="outside">--</span>
 *   <span data-gram-sync-status></span>
 *
 * Load and configure:
 *   <script src="./balance-sync.js"></script>
 *   <script>
 *     GramBalanceSync.configure({
 *       internalBalanceUrl: '/api/gram/balance',
 *       getWalletAddress: () => tonConnectUI.account?.address
 *     });
 *   </script>
 *
 * The internal endpoint must return one of:
 *   { "balance": "123.45" }
 *   { "data": { "balance": "123.45" } }
 *   { "gram": "123.45" }
 *   { "availableBalance": "123.45" }
 */
(function gramBalanceSyncBootstrap(global) {
  'use strict';

  const MASTER_ADDRESS = 'EQDnJJ4GUHj84M1wJeMy5lQG5pmN4hZDI6OJy-7fKgg4VZSQ';
  const DEFAULT_REFRESH_MS = 15_000;
  const MIN_REFRESH_MS = 5_000;
  const SELECTORS = Object.freeze({
    inside: '[data-gram-balance="inside"]',
    outside: '[data-gram-balance="outside"]',
    status: '[data-gram-sync-status]',
  });

  let config = {
    internalBalanceUrl: '',
    getWalletAddress: null,
    refreshMs: DEFAULT_REFRESH_MS,
    tonApiBaseUrl: 'https://tonapi.io/v2',
    tonApiKey: '',
  };
  let timer = null;
  let inFlight = null;
  let lastWalletAddress = '';

  function normalizeNumber(value) {
    if (value === null || value === undefined || value === '') return null;
    const normalized = String(value).replace(/,/g, '').trim();
    if (!/^-?\d+(\.\d+)?$/.test(normalized)) return null;
    return normalized;
  }

  function formatUnits(rawValue, decimals) {
    const raw = String(rawValue || '0').replace(/^\+/, '');
    if (!/^\d+$/.test(raw)) throw new Error('Invalid on-chain balance');
    const scale = Math.max(0, Number(decimals) || 0);
    const padded = raw.padStart(scale + 1, '0');
    const whole = scale ? padded.slice(0, -scale) : padded;
    const fraction = scale ? padded.slice(-scale).replace(/0+$/, '') : '';
    const value = fraction ? `${whole}.${fraction}` : whole;
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  function formatDecimal(value) {
    const normalized = normalizeNumber(value);
    if (normalized === null) return '--';
    const [whole, fraction = ''] = normalized.split('.');
    const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return fraction ? `${grouped}.${fraction.replace(/0+$/, '')}`.replace(/\.$/, '') : grouped;
  }

  function updateText(selector, text) {
    document.querySelectorAll(selector).forEach((node) => {
      node.textContent = text;
    });
  }

  function setStatus(state, message) {
    document.querySelectorAll(SELECTORS.status).forEach((node) => {
      node.textContent = message;
      node.dataset.state = state;
    });
  }

  function readInternalValue(payload) {
    return payload?.balance ?? payload?.data?.balance ?? payload?.gram ?? payload?.availableBalance ?? null;
  }

  async function fetchInsideBalance(signal) {
    if (!config.internalBalanceUrl) {
      throw new Error('Missing internalBalanceUrl');
    }
    const response = await fetch(config.internalBalanceUrl, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
      headers: { Accept: 'application/json' },
      signal,
    });
    if (!response.ok) throw new Error(`Internal balance request failed (${response.status})`);
    const value = normalizeNumber(readInternalValue(await response.json()));
    if (value === null) throw new Error('Internal balance response is invalid');
    return formatDecimal(value);
  }

  async function fetchOutsideBalance(walletAddress, signal) {
    const endpoint = `${config.tonApiBaseUrl}/accounts/${encodeURIComponent(walletAddress)}/jettons/${encodeURIComponent(MASTER_ADDRESS)}`;
    const headers = { Accept: 'application/json' };
    if (config.tonApiKey) headers.Authorization = `Bearer ${config.tonApiKey}`;
    const response = await fetch(endpoint, { cache: 'no-store', headers, signal });
    if (response.status === 404) return '0';
    if (!response.ok) throw new Error(`TON balance request failed (${response.status})`);
    const payload = await response.json();
    const decimals = payload?.jetton?.decimals ?? 9;
    return formatUnits(payload?.balance ?? '0', decimals);
  }

  function resolveWalletAddress() {
    const configured = typeof config.getWalletAddress === 'function' ? config.getWalletAddress() : '';
    const tonConnectAddress = global.tonConnectUI?.account?.address || '';
    return String(configured || tonConnectAddress || lastWalletAddress || '').trim();
  }

  async function refresh() {
    if (inFlight) inFlight.abort();
    inFlight = new AbortController();
    const signal = inFlight.signal;
    const walletAddress = resolveWalletAddress();

    setStatus('syncing', 'Đang đồng bộ...');
    const insidePromise = fetchInsideBalance(signal);
    const outsidePromise = walletAddress
      ? fetchOutsideBalance(walletAddress, signal)
      : Promise.reject(new Error('TON wallet is not connected'));

    const [inside, outside] = await Promise.allSettled([insidePromise, outsidePromise]);
    if (signal.aborted) return;

    if (inside.status === 'fulfilled') updateText(SELECTORS.inside, `${inside.value} GRAM`);
    else updateText(SELECTORS.inside, '--');

    if (outside.status === 'fulfilled') updateText(SELECTORS.outside, `${outside.value} GRAM`);
    else updateText(SELECTORS.outside, '--');

    const detail = {
      masterAddress: MASTER_ADDRESS,
      walletAddress: walletAddress || null,
      inside: inside.status === 'fulfilled' ? inside.value : null,
      outside: outside.status === 'fulfilled' ? outside.value : null,
      errors: [inside, outside]
        .filter((result) => result.status === 'rejected')
        .map((result) => result.reason?.message || String(result.reason)),
      syncedAt: new Date().toISOString(),
    };

    const complete = detail.errors.length === 0;
    setStatus(complete ? 'ok' : 'partial', complete ? 'Đã đồng bộ' : 'Chưa đồng bộ đủ');
    document.dispatchEvent(new CustomEvent('gram:balance-update', { detail }));
    return detail;
  }

  function schedule() {
    clearInterval(timer);
    timer = setInterval(() => {
      if (!document.hidden) refresh().catch(() => {});
    }, config.refreshMs);
  }

  function configure(options = {}) {
    config = {
      ...config,
      ...options,
      refreshMs: Math.max(MIN_REFRESH_MS, Number(options.refreshMs ?? config.refreshMs)),
    };
    schedule();
    return refresh();
  }

  function setWalletAddress(address) {
    lastWalletAddress = String(address || '').trim();
    return refresh();
  }

  function stop() {
    clearInterval(timer);
    timer = null;
    if (inFlight) inFlight.abort();
  }

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) refresh().catch(() => {});
  });
  global.addEventListener('online', () => refresh().catch(() => {}));
  global.addEventListener('focus', () => refresh().catch(() => {}));

  global.GramBalanceSync = Object.freeze({
    MASTER_ADDRESS,
    configure,
    refresh,
    setWalletAddress,
    stop,
  });
})(window);
