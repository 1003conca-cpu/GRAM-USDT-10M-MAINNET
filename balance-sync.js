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
 *       eventStreamUrl: '/api/gram/events',
 *       getWalletAddress: () => tonConnectUI.account?.address
 *     });
 *   </script>
 *
 * Call from any deposit/withdraw flow:
 *   const result = await GramBalanceSync.waitForCommand({
 *     operationId: response.operationId,
 *     type: 'deposit'
 *   });
 *   // result is returned only after the other side confirms and both balances reload.
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
    eventStreamUrl: '',
    getWalletAddress: null,
    refreshMs: DEFAULT_REFRESH_MS,
    tonApiBaseUrl: 'https://tonapi.io/v2',
    tonApiKey: '',
  };
  let timer = null;
  let inFlight = null;
  let eventSource = null;
  let lastWalletAddress = '';
  let lastConfirmedSnapshot = null;
  const pendingOperations = new Map();

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

  async function refresh(reason = 'scheduled') {
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

    const detail = {
      masterAddress: MASTER_ADDRESS,
      walletAddress: walletAddress || null,
      inside: inside.status === 'fulfilled' ? inside.value : null,
      outside: outside.status === 'fulfilled' ? outside.value : null,
      errors: [inside, outside]
        .filter((result) => result.status === 'rejected')
        .map((result) => result.reason?.message || String(result.reason)),
      syncedAt: new Date().toISOString(),
      reason,
    };

    const complete = detail.errors.length === 0;
    if (complete) {
      // Commit both values together. Never show one newly-read side beside one stale side.
      lastConfirmedSnapshot = detail;
      updateText(SELECTORS.inside, `${detail.inside} GRAM`);
      updateText(SELECTORS.outside, `${detail.outside} GRAM`);
      setStatus('ok', 'Đã xác nhận và đồng bộ');
      for (const [operationId, operation] of pendingOperations) {
        if (!operation.serverConfirmed) continue;
        pendingOperations.delete(operationId);
        clearTimeout(operation.timeoutId);
        operation.resolve?.(detail);
        document.dispatchEvent(new CustomEvent('gram:command-confirmed', {
          detail: { operationId, payload: operation.confirmation, balances: detail },
        }));
      }
    } else {
      // Keep the last fully confirmed pair instead of displaying an estimated balance.
      setStatus('waiting', lastConfirmedSnapshot ? 'Đang chờ bên kia xác nhận' : 'Chưa có số dư đã xác nhận');
    }
    document.dispatchEvent(new CustomEvent('gram:balance-update', { detail }));
    return detail;
  }

  async function confirmOperation(operationId, payload = {}) {
    const id = String(operationId || '').trim();
    if (!id) return;
    const current = pendingOperations.get(id) || { operationId: id };
    pendingOperations.set(id, { ...current, serverConfirmed: true, confirmation: payload });
    setStatus('confirming', 'Bên kia đã báo, đang đọc lại hai số dư');
    await refresh(`operation:${id}`);
  }

  function failOperation(operationId, payload = {}) {
    const id = String(operationId || '').trim();
    if (!id) return;
    const operation = pendingOperations.get(id);
    pendingOperations.delete(id);
    clearTimeout(operation?.timeoutId);
    operation?.reject?.(new Error(payload.message || 'Command was not confirmed'));
    setStatus('error', payload.message || 'Lệnh không được xác nhận');
    document.dispatchEvent(new CustomEvent('gram:command-failed', {
      detail: { operationId: id, payload },
    }));
  }

  function handleServerEvent(event) {
    let payload;
    try {
      payload = JSON.parse(event.data);
    } catch {
      return;
    }
    const type = payload.type || event.type;
    const operationId = payload.operationId || payload.id;
    if (type === 'operation.confirmed') {
      confirmOperation(operationId, payload).catch(() => {});
    } else if (type === 'operation.failed') {
      failOperation(operationId, payload);
    } else if (type === 'balance.changed') {
      refresh('server:balance.changed').catch(() => {});
    }
  }

  function connectEvents() {
    if (eventSource) eventSource.close();
    eventSource = null;
    if (!config.eventStreamUrl || typeof EventSource === 'undefined') return;
    eventSource = new EventSource(config.eventStreamUrl, { withCredentials: true });
    eventSource.onmessage = handleServerEvent;
    ['operation.confirmed', 'operation.failed', 'balance.changed'].forEach((type) => {
      eventSource.addEventListener(type, handleServerEvent);
    });
    eventSource.onerror = () => {
      setStatus('waiting', 'Mất kênh xác nhận, đang tự kiểm tra lại');
    };
  }

  function trackCommand(operation) {
    const id = String(operation?.operationId || operation?.id || '').trim();
    if (!id) throw new Error('operationId is required');
    if (pendingOperations.has(id)) throw new Error(`Operation ${id} is already pending`);
    pendingOperations.set(id, { ...operation, startedAt: new Date().toISOString() });
    setStatus('pending', 'Đã gửi lệnh, đang chờ bên kia xác nhận');
    document.dispatchEvent(new CustomEvent('gram:command-pending', {
      detail: pendingOperations.get(id),
    }));
    // This deliberately does not alter either displayed balance.
    return id;
  }

  function waitForCommand(operation, options = {}) {
    const id = trackCommand(operation);
    const requestedTimeout = Number(options.timeoutMs ?? 120_000);
    const timeoutMs = Number.isFinite(requestedTimeout)
      ? Math.min(600_000, Math.max(10_000, requestedTimeout))
      : 120_000;

    return new Promise((resolve, reject) => {
      const current = pendingOperations.get(id);
      const timeoutId = setTimeout(() => {
        pendingOperations.delete(id);
        setStatus('waiting', 'Quá thời gian chờ, chưa có xác nhận từ bên kia');
        const error = new Error(`Operation ${id} confirmation timed out`);
        reject(error);
        document.dispatchEvent(new CustomEvent('gram:command-timeout', {
          detail: { operationId: id, timeoutMs },
        }));
      }, timeoutMs);
      pendingOperations.set(id, { ...current, resolve, reject, timeoutId });
    });
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
    connectEvents();
    schedule();
    return refresh('configure');
  }

  function setWalletAddress(address) {
    lastWalletAddress = String(address || '').trim();
    return refresh();
  }

  function stop() {
    clearInterval(timer);
    timer = null;
    if (inFlight) inFlight.abort();
    if (eventSource) eventSource.close();
    eventSource = null;
    for (const [operationId, operation] of pendingOperations) {
      clearTimeout(operation.timeoutId);
      operation.reject?.(new Error(`Operation ${operationId} stopped before confirmation`));
    }
    pendingOperations.clear();
  }

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) refresh().catch(() => {});
  });
  global.addEventListener('online', () => refresh().catch(() => {}));
  global.addEventListener('focus', () => refresh().catch(() => {}));

  global.GramBalanceSync = Object.freeze({
    MASTER_ADDRESS,
    configure,
    trackCommand,
    waitForCommand,
    refresh,
    setWalletAddress,
    stop,
  });
})(window);
