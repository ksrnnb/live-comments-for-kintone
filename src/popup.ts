import {
  PATTERNS,
  DEFAULT_ENABLED,
  STORAGE_KEY,
  mergeEnabled,
  type EnabledMap,
} from "./patterns.js";

const list = document.getElementById("list") as HTMLUListElement;

const readEnabled = async (): Promise<EnabledMap> => {
  const stored = await chrome.storage.sync.get({ [STORAGE_KEY]: DEFAULT_ENABLED });
  return mergeEnabled(stored[STORAGE_KEY] as Partial<EnabledMap> | undefined);
};

const render = (enabled: EnabledMap): void => {
  list.replaceChildren();
  for (const pattern of PATTERNS) {
    const listItem = document.createElement("li");
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = enabled[pattern.id] ?? true;
    checkbox.addEventListener("change", async () => {
      const current = await readEnabled();
      current[pattern.id] = checkbox.checked;
      await chrome.storage.sync.set({ [STORAGE_KEY]: current });
    });
    label.append(checkbox, document.createTextNode(pattern.label));
    listItem.append(label);
    list.append(listItem);
  }
};

readEnabled().then(render);
