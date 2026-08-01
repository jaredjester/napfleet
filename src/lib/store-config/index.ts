import type { StoreConfigProvider } from "./types";
import { createDbProvider } from "./db-provider";
import { createFileProvider } from "./file-provider";

let _provider: StoreConfigProvider | null = null;

/**
 * Get the configured StoreConfigProvider.
 *
 * Set STORE_CONFIG_PROVIDER=db to use the database-backed provider.
 * Defaults to "file" (reads from src/content/).
 */
export function getStoreConfig(): StoreConfigProvider {
  if (_provider) return _provider;

  const mode = process.env.STORE_CONFIG_PROVIDER || "file";
  if (mode === "db") {
    _provider = createDbProvider();
  } else {
    _provider = createFileProvider();
  }

  return _provider;
}

/**
 * Reset cached provider (useful for tests).
 */
export function resetStoreConfig(): void {
  _provider = null;
}

// Re-export types
export type {
  StoreConfigProvider,
  CreateProductInput,
  CreateVariantInput,
  UpdateProductInput,
  StoreExport,
  ImportPreview,
  ImportResult,
  ImportMode,
} from "./types";
