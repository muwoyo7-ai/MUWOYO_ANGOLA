export const BUSINESS_INFO_DRAFT_PREFIX = "muwoyo-business-info-draft";

export const getBusinessInfoDraftKey = (userId?: string | null) => {
  if (!userId) return null;
  return `${BUSINESS_INFO_DRAFT_PREFIX}-${userId}`;
};

export const readBusinessInfoDraft = (userId?: string | null) => {
  if (typeof window === "undefined") return null;
  const key = getBusinessInfoDraftKey(userId);
  if (!key) return null;

  const raw = window.localStorage.getItem(key);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    window.localStorage.removeItem(key);
    return null;
  }
};

export const writeBusinessInfoDraft = (userId: string | null | undefined, value: unknown) => {
  if (typeof window === "undefined") return;
  const key = getBusinessInfoDraftKey(userId);
  if (!key) return;

  window.localStorage.setItem(key, JSON.stringify(value));
};

export const clearBusinessInfoDraft = (userId?: string | null) => {
  if (typeof window === "undefined") return;
  const key = getBusinessInfoDraftKey(userId);
  if (!key) return;

  window.localStorage.removeItem(key);
};
