/**
 * GRAM 10M Mainnet wallet balance watcher.
 * Reads only confirmed TON on-chain state for the canonical Jetton master.
 */
(function gramWalletBalanceBootstrap(global) {
  'use strict';

  const MASTER_ADDRESS = 'EQDnJJ4GUHj84M1wJeMy5lQG5pmN4hZDI6OJy-7fKgg4VZSQ';
  const DEFAULT_REFRESH_MS = 15_000;
  const MIN_REFRESH_MS = 5_000;

  let config = {
    getWalletAddress: null,
    refreshMs: DEFAULT_REFRESH_MS,
    tonApiBaseUrl: 'https://tonapi.io/v2',
    tonApiKey: '',
  };
  let timer = null;
  let controller = null;
  let lastWalletAddress = '';
  let lastRawBalance = null;

  const selectAll = (selector) => Array.from(document.querySelectorAll(selector));

  function setText(selector, value) {
    selectAll(selector).forEach((node) => { node.textContent = value; });
  }

  function setStatus(state, message) {
    selectAll('[data-gram-sync-status]').forEach((node) => {
      node.dataset.state = state;
      node.textContent = message;
    });
  }

  function resolveWalletAddress() {
    const configured = typeof config.getWalletAddress === 'function'
      ? config.getWalletAddress()
      : '';
    return String(configured || lastWalletAddress || '').trim();
  }

  function parseBalance(payload) {
    const raw = String(payload?.balance ?? '0');
    if (!/^\d+$/.test(raw)) throw new Error('Số dư on-chain không hợp lệ');
    const decimals = Math.max(0, Number(payload?.jetton?.decimals ?? 9));
    return { raw: BigInt(raw), decimals };
  }

  function formatUnits(raw, decimals) {
    const digits = raw.toString().padStart(decimals + 1, '0');
    const whole = decimals ? digits.slice(0, -decimals) : digits;
    const fraction = decimals ? digits.slice(-decimals).replace(/0+$/, '') : '';
    const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return fraction ? `${grouped}.${fraction}` : grouped;
  }

  function shortAddress(address) {
    return address.length > 18 ? `${address.slice(0, 8)}…${address.slice(-8)}` : address;
  }

  function notifyReceived(amount, balance) {
    const message = `Đã nhận ${amount} GRAM · Số dư mới ${balance} GRAM`;
    setStatus('received', message);
    document.dispatchEvent(new CustomEvent('gram:received', {
      detail: { amount, balance, walletAddress: lastWalletAddress, masterAddress: MASTER_ADDRESS },
    }));
    if ('Notification' in global && Notification.permission === 'granted') {
      new Notification('Ví đã nhận GRAM', { body: message });
    }
  }

  async function fetchBalance(walletAddress, signal) {
    const endpoint = `${config.tonApiBaseUrl}/accounts/${encodeURIComponent(walletAddress)}/jettons/${encodeURIComponent(MASTER_ADDRESS)}`;
    const headers = { Accept: 'application/json' };
    if (config.tonApiKey) headers.Authorization = `Bearer ${config.tonApiKey}`;
    const response = await fetch(endpoint, { cache: 'no-store', headers, signal });
    if (response.status === 404) return { raw: 0n, decimals: 9 };
    if (!response.ok) throw new Error(`Không đọc được TON (${response.status})`);
    return parseBalance(await response.json());
  }

  async function refresh(reason = 'scheduled') {
    const walletAddress = resolveWalletAddress();
    if (!walletAddress) {
      lastRawBalance = null;
      setText('[data-gram-wallet-address]', 'Chưa kết nối');
      setText('[data-gram-balance="wallet"]', '-- GRAM');
      setStatus('waiting', 'Kết nối ví OKX để xem số dư');
      return null;
    }

    if (controller) controller.abort();
    controller = new AbortController();
    setText('[data-gram-wallet-address]', shortAddress(walletAddress));
    setStatus('syncing', 'Đang đọc số dư on-chain…');

    try {
      const current = await fetchBalance(walletAddress, controller.signal);
      const changedWallet = walletAddress !== lastWalletAddress;
      const previous = changedWallet ? null : lastRawBalance;
      const formatted = formatUnits(current.raw, current.decimals);

      lastWalletAddress = walletAddress;
      lastRawBalance = current.raw;
      setText('[data-gram-balance="wallet"]', `${formatted} GRAM`);

      if (previous !== null && current.raw > previous) {
        notifyReceived(formatUnits(current.raw - previous, current.decimals), formatted);
      } else {
        setStatus('ok', 'Số dư đã xác nhận trên TON');
      }

      const detail = {
        balance: formatted,
        rawBalance: current.raw.toString(),
        walletAddress,
        masterAddress: MASTER_ADDRESS,
        reason,
        syncedAt: new Date().toISOString(),
      };
      document.dispatchEvent(new CustomEvent('gram:balance-update', { detail }));
      return detail;
    } catch (error) {
      if (error?.name === 'AbortError') return null;
      setStatus('error', error?.message || 'Không thể đồng bộ số dư');
      throw error;
    }
  }

  function schedule() {
    clearInterval(timer);
    timer = setInterval(() => {
      if (!document.hidden) refresh().catch(() => {});
    }, config.refreshMs);
  }

  function configure(options = {}) {
    const requestedRefreshMs = Number(options.refreshMs ?? config.refreshMs);
    config = {
      ...config,
      ...options,
      refreshMs: Number.isFinite(requestedRefreshMs)
        ? Math.max(MIN_REFRESH_MS, requestedRefreshMs)
        : DEFAULT_REFRESH_MS,
    };
    schedule();
    return refresh('configure');
  }

  function setWalletAddress(address) {
    const next = String(address || '').trim();
    if (next !== lastWalletAddress) lastRawBalance = null;
    lastWalletAddress = next;
    return refresh('wallet-changed');
  }

  async function enableNotifications() {
    if (!('Notification' in global)) return 'unsupported';
    return Notification.requestPermission();
  }

  function stop() {
    clearInterval(timer);
    timer = null;
    if (controller) controller.abort();
  }

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) refresh('visible').catch(() => {});
  });
  global.addEventListener('online', () => refresh('online').catch(() => {}));
  global.addEventListener('focus', () => refresh('focus').catch(() => {}));

  global.GramWalletBalance = Object.freeze({
    MASTER_ADDRESS,
    configure,
    enableNotifications,
    refresh,
    setWalletAddress,
    stop,
  });
})(window);
