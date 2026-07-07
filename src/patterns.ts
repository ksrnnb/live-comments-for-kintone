export type Pattern = {
  readonly id: string;
  readonly label: string;
  readonly container: string;
  /** クリック対象のセレクタ。空文字なら container 自身をクリックする。 */
  readonly click: string;
};

export const PATTERNS: ReadonlyArray<Pattern> = [
  {
    id: "threadComment",
    label: "スレッドの新着コメント（旧UI）",
    container: ".ocean-ui-comment-unread-notification",
    click: ".ocean-ui-comment-unread-notification-text",
  },
  {
    // フロントエンド刷新後ではクラス名がハッシュ化されて安定しないため、
    // ユーザー向け文言が入る title 属性で検出する。ボタン自身がクリック対象。
    id: "threadCommentNewFrontend",
    label: "スレッドの新着コメント（新UI）",
    container: 'button[title*="新着コメントがあります"]',
    click: "",
  },
  {
    id: "recordDetailComment",
    label: "レコード詳細画面の新着コメント",
    container: ".new-arrival-comment-notification",
    click: ".new-arrival-comment-notification-button",
  },
  {
    id: "notificationScreen",
    label: "通知画面の新着通知",
    container: '[class*="_newItemsButton_"]',
    click: "button",
  },
];

export type EnabledMap = Record<string, boolean>;

export const DEFAULT_ENABLED: EnabledMap = Object.fromEntries(
  PATTERNS.map((pattern) => [pattern.id, true]),
);

export const STORAGE_KEY = "enabled";

export const mergeEnabled = (
  stored: Partial<EnabledMap> | undefined,
): EnabledMap => {
  const result: EnabledMap = { ...DEFAULT_ENABLED };
  for (const [id, value] of Object.entries(stored ?? {})) {
    if (value !== undefined) {
      result[id] = value;
    }
  }
  return result;
};

export type EnabledDiff = {
  readonly toEnable: ReadonlyArray<Pattern>;
  readonly toDisable: ReadonlyArray<Pattern>;
};

const isOn = (map: EnabledMap, id: string): boolean => map[id] ?? true;

export const diffEnabled = (prev: EnabledMap, next: EnabledMap): EnabledDiff => {
  const toEnable: Pattern[] = [];
  const toDisable: Pattern[] = [];
  for (const pattern of PATTERNS) {
    const was = isOn(prev, pattern.id);
    const now = isOn(next, pattern.id);
    if (was === now) {
      continue;
    }
    if (now) {
      toEnable.push(pattern);
    } else {
      toDisable.push(pattern);
    }
  }
  return { toEnable, toDisable };
};
