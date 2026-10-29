
/**
 * @vitest-environment jsdom
 */

import {
  afterEach,
  describe,
  expect,
  it,
} from "vitest";

import {
  cleanup,
  render,
  screen,
} from "@testing-library/react";

import CompoundWordLoader from "./CompoundWordLoader";

afterEach(cleanup);

describe("CompoundWordLoader", () => {
  it("renders the default loading message", () => {
    render(<CompoundWordLoader />);

    expect(
      screen.getByText(
        "Generating your vocabulary questions..."
      )
    ).toBeTruthy();
  });

  it("renders a custom loading message", () => {
    render(
      <CompoundWordLoader
        message="Preparing more vocabulary questions..."
      />
    );

    expect(
      screen.getByText(
        "Preparing more vocabulary questions..."
      )
    ).toBeTruthy();
  });

  it("exposes an accessible loading status", () => {
    render(<CompoundWordLoader />);

    const status = screen.getByRole("status");

    expect(status.getAttribute("aria-live")).toBe(
      "polite"
    );
  });

  it("renders the compound word animation elements", () => {
    const { container } = render(
      <CompoundWordLoader />
    );

    expect(
      container.querySelectorAll(".compound-word-block")
        .length
    ).toBe(3);

    expect(
      container.querySelector(".compound-result")
        ?.textContent
    ).toContain("Wortschatztest");
  });

  it("hides decorative animation from screen readers", () => {
    const { container } = render(
      <CompoundWordLoader />
    );

    const animationContainer =
      container.querySelector(".compound-assembly")
        ?.parentElement;

    expect(
      animationContainer?.getAttribute("aria-hidden")
    ).toBe("true");
  });
});
