import { useEffect, useState, useCallback, useMemo } from "react";

export type Deal = {
  id: string;
  name: string;
  value: number;
  commission: number;
  createdAt: string;
};

export type ProductPreset = {
  id: string;
  name: string;
  value: number;
};

const STORAGE_KEY_DEALS = "metrorate:deals";
const STORAGE_KEY_HUSHED = "metrorate:isHushed";
const STORAGE_KEY_RATE = "metrorate:rate";
const STORAGE_KEY_PRESETS = "metrorate:presets";
const STORAGE_KEY_PAID = "metrorate:isPaid";

const DAILY_FREE_DEAL_LIMIT = 10;

export type ParsedDeal = {
  name: string;
  value: number;
  commission: number;
};

const DEFAULT_RATE = 0.1;

const DEFAULT_PRESETS: ProductPreset[] = [
  { id: "starter-10k", name: "Starter Package", value: 10000 },
  { id: "premium-25k", name: "Premium Client", value: 25000 },
  { id: "enterprise-50k", name: "Enterprise Deal", value: 50000 }
];

export function parseDeal(
  input: string,
  rate: number = DEFAULT_RATE
): ParsedDeal | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const parts = trimmed.split(/\s+/);
  if (parts.length < 2) return null;

  const amountToken = parts[parts.length - 1];
  const name = parts.slice(0, -1).join(" ");

  const match = amountToken.match(/^([\d,.]+)(k|K)?$/);
  if (!match) return null;

  const numeric = parseFloat(match[1].replace(/,/g, ""));
  if (Number.isNaN(numeric)) return null;

  const isK = Boolean(match[2]);
  const value = isK ? numeric * 1000 : numeric;
  const commission = Math.round(value * rate * 100) / 100;

  return { name, value, commission };
}

const hasChromeStorage =
  typeof chrome !== "undefined" && !!chrome.storage?.local;

async function loadFromStorage<T>(key: string, fallback: T): Promise<T> {
  if (!hasChromeStorage) return fallback;
  return new Promise<T>((resolve) => {
    chrome.storage.local.get([key], (result) => {
      if (chrome.runtime?.lastError) {
        resolve(fallback);
        return;
      }
      resolve((result[key] as T | undefined) ?? fallback);
    });
  });
}

async function saveToStorage<T>(key: string, value: T): Promise<void> {
  if (!hasChromeStorage) return;
  return new Promise<void>((resolve) => {
    chrome.storage.local.set({ [key]: value }, () => {
      resolve();
    });
  });
}

export function useCommission() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [presets, setPresets] = useState<ProductPreset[]>(DEFAULT_PRESETS);
  const [isHushed, setIsHushed] = useState(false);
  const [commissionRate, setCommissionRate] = useState(DEFAULT_RATE);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const [
        storedDeals,
        storedHushed,
        storedRate,
        storedPresets,
        storedPaid
      ] = await Promise.all([
        loadFromStorage<Deal[]>(STORAGE_KEY_DEALS, []),
        loadFromStorage<boolean>(STORAGE_KEY_HUSHED, false),
        loadFromStorage<number>(STORAGE_KEY_RATE, DEFAULT_RATE),
        loadFromStorage<ProductPreset[]>(STORAGE_KEY_PRESETS, DEFAULT_PRESETS),
        loadFromStorage<boolean>(STORAGE_KEY_PAID, false)
      ]);

      if (cancelled) return;
      setDeals(storedDeals);
      setIsHushed(storedHushed);
      setCommissionRate(storedRate);
      setPresets(storedPresets);
      setIsPaid(storedPaid);
      setIsLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (isLoading) return;
    saveToStorage(STORAGE_KEY_DEALS, deals);
  }, [deals, isLoading]);

  useEffect(() => {
    if (isLoading) return;
    saveToStorage(STORAGE_KEY_HUSHED, isHushed);
  }, [isHushed, isLoading]);

  useEffect(() => {
    if (isLoading) return;
    saveToStorage(STORAGE_KEY_RATE, commissionRate);
  }, [commissionRate, isLoading]);

  useEffect(() => {
    if (isLoading) return;
    saveToStorage(STORAGE_KEY_PRESETS, presets);
  }, [presets, isLoading]);

  useEffect(() => {
    if (isLoading) return;
    saveToStorage(STORAGE_KEY_PAID, isPaid);
  }, [isPaid, isLoading]);

  const addDealFromInput = useCallback(
    (input: string) => {
      const parsed = parseDeal(input, commissionRate);
      if (!parsed) return null;

      const newDeal: Deal = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: parsed.name,
        value: parsed.value,
        commission: parsed.commission,
        createdAt: new Date().toISOString()
      };

      setDeals((prev) => [newDeal, ...prev]);
      return newDeal;
    },
    [commissionRate]
  );

  const addDealPreset = useCallback(
    (name: string, value: number) => {
      const commission =
        Math.round(value * commissionRate * 100) / 100;

      const newDeal: Deal = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name,
        value,
        commission,
        createdAt: new Date().toISOString()
      };

      setDeals((prev) => [newDeal, ...prev]);
      return newDeal;
    },
    [commissionRate]
  );

  const addPreset = useCallback((name: string, value: number) => {
    const trimmedName = name.trim();
    if (!trimmedName || !Number.isFinite(value) || value <= 0) return null;

    const preset: ProductPreset = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: trimmedName,
      value
    };

    setPresets((prev) => [preset, ...prev]);
    return preset;
  }, []);

  const removePreset = useCallback((id: string) => {
    setPresets((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const removeDeal = useCallback((id: string) => {
    setDeals((prev) => prev.filter((deal) => deal.id !== id));
  }, []);

  const clearDeals = useCallback(() => {
    setDeals([]);
  }, []);

  const totalValue = useMemo(
    () => deals.reduce((sum, deal) => sum + deal.value, 0),
    [deals]
  );

  const totalCommission = useMemo(
    () => deals.reduce((sum, deal) => sum + deal.commission, 0),
    [deals]
  );

  const dealsTodayCount = useMemo(() => {
    const today = new Date();
    return deals.reduce((count, deal) => {
      const created = new Date(deal.createdAt);
      if (
        created.getFullYear() === today.getFullYear() &&
        created.getMonth() === today.getMonth() &&
        created.getDate() === today.getDate()
      ) {
        return count + 1;
      }
      return count;
    }, 0);
  }, [deals]);

  const isAtFreeLimit = !isPaid && dealsTodayCount >= DAILY_FREE_DEAL_LIMIT;

  return {
    deals,
    presets,
    addDealFromInput,
    addDealPreset,
    addPreset,
    removePreset,
    removeDeal,
    clearDeals,
    totalValue,
    totalCommission,
    dealsTodayCount,
    freeDailyLimit: DAILY_FREE_DEAL_LIMIT,
    isHushed,
    setIsHushed,
    isPaid,
    setIsPaid,
    commissionRate,
    setCommissionRate,
    isAtFreeLimit,
    isLoading
  };
}

