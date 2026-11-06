
import {
  describe,
  expect,
  it,
} from "vitest";

import {
  RegisterSchema,
  LoginSchema,
  VerifyOtpSchema,
  ResendOtpSchema,
} from "./auth-schemas";

describe("Authentication schemas", () => {
  it("accepts valid registration data", () => {
    const result = RegisterSchema.parse({
      firstName: "Anna",
      lastName: "Müller",
      email: "Anna@Example.com",
    });

    expect(result).toEqual({
      firstName: "Anna",
      lastName: "Müller",
      email: "anna@example.com",
    });
  });

  it("allows an optional last name", () => {
    const result = RegisterSchema.parse({
      firstName: "Max",
      email: "max@example.com",
    });

    expect(result.lastName).toBeUndefined();
  });

  it("rejects an empty first name", () => {
    const result = RegisterSchema.safeParse({
      firstName: "   ",
      email: "max@example.com",
    });

    expect(result.success).toBe(false);
  });

  it("rejects malformed email addresses", () => {
    const result = LoginSchema.safeParse({
      email: "invalid-email",
    });

    expect(result.success).toBe(false);
  });

  it("accepts a valid OTP", () => {
    const result = VerifyOtpSchema.safeParse({
      flow: "login",
      email: "max@example.com",
      code: "123456",
    });

    expect(result.success).toBe(true);
  });

  it("rejects an OTP with the wrong length", () => {
    const result = VerifyOtpSchema.safeParse({
      flow: "login",
      email: "max@example.com",
      code: "12345",
    });

    expect(result.success).toBe(false);
  });

  it("rejects non-numeric OTPs", () => {
    const result = VerifyOtpSchema.safeParse({
      flow: "registration",
      email: "max@example.com",
      code: "12AB56",
    });

    expect(result.success).toBe(false);
  });

  it("rejects invalid authentication flows", () => {
    const result = ResendOtpSchema.safeParse({
      flow: "password-reset",
      email: "max@example.com",
    });

    expect(result.success).toBe(false);
  });

  it("rejects unexpected registration fields", () => {
    const result = RegisterSchema.safeParse({
      firstName: "Max",
      email: "max@example.com",
      isAdmin: true,
    });

    expect(result.success).toBe(false);
  });
});
