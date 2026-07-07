import { findClickTarget, buildSignal } from "./lib.js";
import {
  PATTERNS,
  DEFAULT_ENABLED,
  STORAGE_KEY,
  mergeEnabled,
  diffEnabled,
  type Pattern,
  type EnabledMap,
} from "./patterns.js";

const observers = new WeakMap<HTMLElement, MutationObserver>();
const lastSignal = new WeakMap<HTMLElement, string>();

let enabled: EnabledMap = { ...DEFAULT_ENABLED };

const tryClick = (container: HTMLElement, selector: string): void => {
  const target = findClickTarget(container, selector);
  if (!target) {
    lastSignal.delete(container);
    return;
  }
  const signal = buildSignal(target);
  if (lastSignal.get(container) === signal) {
    return;
  }
  lastSignal.set(container, signal);
  try {
    target.click();
  } catch (error) {
    console.warn("[live-comments-for-kintone] click failed", error);
  }
};

const watch = (container: HTMLElement, selector: string): void => {
  if (observers.has(container)) {
    return;
  }
  tryClick(container, selector);
  const observer = new MutationObserver(() => tryClick(container, selector));
  observer.observe(container, {
    attributes: true,
    attributeFilter: ["style", "class", "title"],
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
  for (const pattern of PATTERNS) {
    if (!enabled[pattern.id]) {
      continue;
    }
    if (root instanceof HTMLElement && root.matches(pattern.container)) {
      watch(root, pattern.click);
    }
    root
      .querySelectorAll<HTMLElement>(pattern.container)
      .forEach((container) => watch(container, pattern.click));
  }
};

const undiscover = (root: Element): void => {
  for (const pattern of PATTERNS) {
    if (root instanceof HTMLElement && root.matches(pattern.container)) {
      unwatch(root);
    }
    root.querySelectorAll<HTMLElement>(pattern.container).forEach(unwatch);
  }
};

const enablePattern = (pattern: Pattern): void => {
  if (document.body instanceof HTMLElement && document.body.matches(pattern.container)) {
    watch(document.body, pattern.click);
  }
  document
    .querySelectorAll<HTMLElement>(pattern.container)
    .forEach((container) => watch(container, pattern.click));
};

const disablePattern = (pattern: Pattern): void => {
  document.querySelectorAll<HTMLElement>(pattern.container).forEach(unwatch);
};

const globalObserver = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        discover(node as Element);
      }
    });
    mutation.removedNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        undiscover(node as Element);
      }
    });
  }
});

chrome.storage.sync.get({ [STORAGE_KEY]: DEFAULT_ENABLED }).then((stored) => {
  enabled = mergeEnabled(stored[STORAGE_KEY] as Partial<EnabledMap> | undefined);
  discover(document);
  globalObserver.observe(document.body, { childList: true, subtree: true });
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "sync") {
    return;
  }
  const change = changes[STORAGE_KEY];
  if (!change) {
    return;
  }
  const next = mergeEnabled(change.newValue as Partial<EnabledMap> | undefined);
  const { toEnable, toDisable } = diffEnabled(enabled, next);
  enabled = next;
  toEnable.forEach(enablePattern);
  toDisable.forEach(disablePattern);
});
