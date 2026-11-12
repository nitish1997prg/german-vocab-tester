// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import RegistrationForm from "./registration-form";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it("keeps the registration form open and explains an existing email conflict", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 409 }));
  render(<RegistrationForm />);
  fireEvent.change(screen.getByLabelText(/FIRST NAME/), { target: { value: "Alex" } });
  fireEvent.change(screen.getByLabelText(/EMAIL ADDRESS/), { target: { value: "alex@example.com" } });
  fireEvent.click(screen.getByRole("button", { name: "SEND VERIFICATION CODE" }));

  expect((await screen.findByRole("alert")).textContent).toContain("An account with this email already exists.");
  expect(screen.queryByText("Check your inbox.")).toBeNull();
  expect(screen.getByLabelText(/EMAIL ADDRESS/)).toBeTruthy();
});
