
import { describe, expect, it } from "vitest";
import manifest from "./manifest";

describe("PWA manifest", () => {
  it("defines the application identity", () => {
    const config = manifest();

    expect(config.name).toBe(
      "German Vocabulary Tester"
    );

    expect(config.short_name).toBe(
      "German Vocab"
    );

    expect(config.id).toBe("/");
  });

  it("opens the application in standalone mode", () => {
    const config = manifest();

    expect(config.start_url).toBe("/");
    expect(config.scope).toBe("/");
    expect(config.display).toBe("standalone");
  });

  it("uses the application theme colour", () => {
    const config = manifest();

    expect(config.theme_color).toBe("#0F1117");
    expect(config.background_color).toBe("#0F1117");
  });

  
  it("includes standard and maskable app icons", () => {
    const config = manifest();

    expect(config.icons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          src: "/icons/icon-192.png",
          sizes: "192x192",
        }),
        expect.objectContaining({
          src: "/icons/icon-512.png",
          sizes: "512x512",
        }),
        expect.objectContaining({
          src: "/icons/icon-maskable-512.png",
          purpose: "maskable",
        }),
      ])
    );
  });

});
