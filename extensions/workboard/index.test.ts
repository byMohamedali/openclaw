import { fileURLToPath } from "node:url";
import { capturePluginRegistration } from "openclaw/plugin-sdk/plugin-test-runtime";
import { describe, expect, it, vi } from "vitest";

const { openSqlite } = vi.hoisted(() => ({ openSqlite: vi.fn(() => ({})) }));

vi.mock("./src/store.js", () => ({
  WorkboardStore: { openSqlite },
}));

import plugin from "./index.js";

describe("Workboard plugin registration", () => {
  it("passes configured concurrent owners to the shared store", () => {
    capturePluginRegistration({
      ...plugin,
      register(api) {
        plugin.register({
          ...api,
          pluginConfig: { concurrentOwners: ["parallel-worker"] },
          runtimeSource: fileURLToPath(new URL("./index.ts", import.meta.url)),
        });
      },
    });
    expect(openSqlite).toHaveBeenLastCalledWith(expect.any(URL), ["parallel-worker"]);
    expect(plugin.configSchema?.safeParse?.(undefined).success).toBe(true);
    expect(plugin.configSchema?.safeParse?.({ concurrentOwners: [7] }).success).toBe(false);
  });

  it("advertises its native route only while the plugin runtime is active", () => {
    const captured = capturePluginRegistration({
      id: "workboard",
      name: "Workboard",
      register(api) {
        plugin.register({
          ...api,
          runtimeSource: fileURLToPath(new URL("./index.ts", import.meta.url)),
        });
      },
    });

    expect(captured.controlUiDescriptors).toContainEqual({
      surface: "tab",
      id: "workboard",
      label: "Workboard",
      placement: "route:workboard",
      icon: "kanban",
      group: "control",
      requiredScopes: ["operator.read"],
    });
  });
});
