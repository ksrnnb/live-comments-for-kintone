declare namespace chrome {
  namespace storage {
    type StorageArea = "sync" | "local" | "managed" | "session";
    type StorageChange<T = unknown> = { oldValue?: T; newValue?: T };

    interface AreaApi {
      get(defaults: Record<string, unknown>): Promise<Record<string, unknown>>;
      set(items: Record<string, unknown>): Promise<void>;
    }

    const sync: AreaApi;

    const onChanged: {
      addListener(
        cb: (changes: Record<string, StorageChange>, area: StorageArea) => void,
      ): void;
    };
  }
}
