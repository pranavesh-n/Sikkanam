import { describe, it, expect } from "vitest";
import { verifyRequestOrigin } from "../../api/_utils/auth.js";

describe("CSRF Origin Verification", () => {
  it("should allow safe HTTP methods without verification", () => {
    const mockReq = {
      method: "GET",
      headers: {
        host: "sikkanam.vercel.app",
        origin: "https://evil.com",
      },
    };
    expect(verifyRequestOrigin(mockReq)).toBe(true);
  });

  it("should allow request if Origin matches Host", () => {
    const mockReq = {
      method: "POST",
      headers: {
        host: "sikkanam.vercel.app",
        origin: "https://sikkanam.vercel.app",
      },
    };
    expect(verifyRequestOrigin(mockReq)).toBe(true);
  });

  it("should allow request if Referer host matches Host", () => {
    const mockReq = {
      method: "POST",
      headers: {
        host: "sikkanam.vercel.app",
        referer: "https://sikkanam.vercel.app/profile",
      },
    };
    expect(verifyRequestOrigin(mockReq)).toBe(true);
  });

  it("should allow request in local development with ports", () => {
    const mockReq = {
      method: "POST",
      headers: {
        host: "localhost:3000",
        origin: "http://localhost:3000",
      },
    };
    expect(verifyRequestOrigin(mockReq)).toBe(true);
  });

  it("should block request if Origin does not match Host", () => {
    const mockReq = {
      method: "POST",
      headers: {
        host: "sikkanam.vercel.app",
        origin: "https://evil.com",
      },
    };
    expect(verifyRequestOrigin(mockReq)).toBe(false);
  });

  it("should block request if Referer does not match Host", () => {
    const mockReq = {
      method: "POST",
      headers: {
        host: "sikkanam.vercel.app",
        referer: "https://evil.com/malicious-attack",
      },
    };
    expect(verifyRequestOrigin(mockReq)).toBe(false);
  });

  it("should block request if both Origin and Referer are missing on unsafe methods", () => {
    const mockReq = {
      method: "POST",
      headers: {
        host: "sikkanam.vercel.app",
      },
    };
    expect(verifyRequestOrigin(mockReq)).toBe(false);
  });
});
