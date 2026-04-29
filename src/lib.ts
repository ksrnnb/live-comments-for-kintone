export const isVisible = (element: HTMLElement): boolean => {
  const computedStyle = getComputedStyle(element);
  if (computedStyle.display === "none" || computedStyle.visibility === "hidden") {
    return false;
  }
  const opacity = parseFloat(computedStyle.opacity);
  if (!Number.isFinite(opacity) || opacity <= 0) {
    return false;
  }
  const rect = element.getBoundingClientRect();
  return rect.width > 0 || rect.height > 0;
};

export const findClickTarget = (
  container: HTMLElement,
  selector: string,
): HTMLElement | null => {
  const target = container.querySelector<HTMLElement>(selector);
  if (!target || !isVisible(target)) {
    return null;
  }
  return target;
};

export const extractCount = (element: HTMLElement): number | null => {
  const match = element.textContent?.match(/\d+/);
  if (!match) {
    return null;
  }
  const count = Number(match[0]);
  return Number.isFinite(count) && count > 0 ? count : null;
};

export const buildSignal = (target: HTMLElement): string => {
  const count = extractCount(target);
  if (count !== null) {
    return `c:${count}`;
  }
  const text = target.textContent?.trim() ?? "";
  return `t:${text}`;
};
