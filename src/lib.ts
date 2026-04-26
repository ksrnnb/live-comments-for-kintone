export const isVisible = (el: HTMLElement): boolean => {
  const cs = getComputedStyle(el);
  if (cs.display === "none" || cs.visibility === "hidden") return false;
  const opacity = parseFloat(cs.opacity);
  if (!Number.isFinite(opacity) || opacity <= 0) return false;
  const rect = el.getBoundingClientRect();
  return rect.width > 0 || rect.height > 0;
};

export const findClickTarget = (
  container: HTMLElement,
  sel: string,
): HTMLElement | null => {
  if (!isVisible(container)) return null;
  const target = container.querySelector<HTMLElement>(sel);
  if (!target || !isVisible(target)) return null;
  return target;
};

export const extractCount = (el: HTMLElement): number | null => {
  const match = el.textContent?.match(/\d+/);
  if (!match) return null;
  const n = Number(match[0]);
  return Number.isFinite(n) && n > 0 ? n : null;
};

export const buildSignal = (target: HTMLElement): string => {
  const count = extractCount(target);
  if (count !== null) return `c:${count}`;
  const text = target.textContent?.trim() ?? "";
  return `t:${text}`;
};
