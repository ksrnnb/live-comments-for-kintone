import { findClickTarget, buildSignal } from "./lib.js";

type Pattern = { readonly container: string; readonly click: string };

const PATTERNS: ReadonlyArray<Pattern> = [
  {
    container: ".ocean-ui-comment-unread-notification",
    click: ".ocean-ui-comment-unread-notification-text",
  },
  {
    container: ".new-arrival-comment-notification",
    click: ".new-arrival-comment-notification-button",
  },
  {
    container: '[class*="_newItemsButton_"]',
    click: "button",
  },
];

const observers = new WeakMap<HTMLElement, MutationObserver>();
const lastSignal = new WeakMap<HTMLElement, string>();

const tryClick = (container: HTMLElement, sel: string): void => {
  const target = findClickTarget(container, sel);
  if (!target) {
    lastSignal.delete(container);
    return;
  }
  const signal = buildSignal(target);
  if (lastSignal.get(container) === signal) return;
  lastSignal.set(container, signal);
  try {
    target.click();
  } catch (e) {
    console.warn("[live-comments-for-kintone] click failed", e);
  }
};

const watch = (container: HTMLElement, sel: string): void => {
  if (observers.has(container)) return;
  tryClick(container, sel);
  const observer = new MutationObserver(() => tryClick(container, sel));
  observer.observe(container, {
    attributes: true,
    attributeFilter: ["style", "class"],
    childList: true,
    subtree: true,
    characterData: true,
  });
  observers.set(container, observer);
};

const unwatch = (container: HTMLElement): void => {
  observers.get(container)?.disconnect();
  observers.delete(container);
  lastSignal.delete(container);
};

const discover = (root: ParentNode): void => {
  for (const p of PATTERNS) {
    if (root instanceof HTMLElement && root.matches(p.container)) {
      watch(root, p.click);
    }
    root.querySelectorAll<HTMLElement>(p.container).forEach((c) => watch(c, p.click));
  }
};

const undiscover = (root: Element): void => {
  for (const p of PATTERNS) {
    if (root instanceof HTMLElement && root.matches(p.container)) {
      unwatch(root);
    }
    root.querySelectorAll<HTMLElement>(p.container).forEach(unwatch);
  }
};

discover(document);

const globalObserver = new MutationObserver((mutations) => {
  for (const m of mutations) {
    m.addedNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) discover(node as Element);
    });
    m.removedNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) undiscover(node as Element);
    });
  }
});
globalObserver.observe(document.body, { childList: true, subtree: true });
