
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

    expect(config.theme_color).toBe("#176B63");
    expect(config.background_color).toBe("#FFFFFF");
  });
});
