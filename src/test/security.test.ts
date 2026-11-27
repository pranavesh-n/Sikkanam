import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as auth from "../../api/_utils/auth.js";

vi.mock("../../api/_utils/db.js", () => ({
  connectToDatabase: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../api/_utils/models.js", () => ({
  Wishlist: {
    find: vi.fn().mockResolvedValue([]),
    findOne: vi.fn().mockResolvedValue(null),
    deleteMany: vi.fn().mockResolvedValue({ deletedCount: 0 }),
  },
  Feedback: {
    find: vi.fn(),
    findOneAndDelete: vi.fn().mockResolvedValue(null),
  },
}));

function createMockRes() {
  const res = {
    statusCode: 200,
    headers: {} as Record<string, unknown>,
    body: undefined as unknown,
    ended: undefined as unknown,
    setHeader(key: string, value: unknown) {
      this.headers[key] = value;
      return this;
    },
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(data: unknown) {
      this.body = data;
      return this;
    },
    end(data?: unknown) {
      this.ended = data;
      return this;
    },
  };
  return res;
}

function createAuthedReq(method: string, overrides: Record<string, unknown> = {}) {
  const baseHeaders = {
    host: "sikkanam.vercel.app",
    origin: "https://sikkanam.vercel.app",
    "user-agent": "vitest-agent",
    "accept-language": "en-US",
  };
  const token = auth.signToken(
    { id: "user-123", email: "user@example.com" },
    "1h",
    { headers: baseHeaders }
  );
  return {
    method,
    headers: {
      ...baseHeaders,
      cookie: `token=${token}`,
    },
    query: {},
    body: {},
    ...overrides,
  };
}

describe("Security Controls", () => {
  const originalFirecrawlUrl = process.env.FIRECRAWL_API_URL;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    if (originalFirecrawlUrl === undefined) {
      delete process.env.FIRECRAWL_API_URL;
    } else {
      process.env.FIRECRAWL_API_URL = originalFirecrawlUrl;
    }
  });

  it("signs and verifies a valid token roundtrip and rejects a tampered token", () => {
    const req = {
      headers: { "user-agent": "vitest-agent", "accept-language": "en-US" },
    };
    const token = auth.signToken({ id: "u1", email: "a@b.com" }, "1h", req);
    const decoded = auth.verifyToken(token, req);

    expect(decoded).toBeTruthy();
    expect(decoded.id).toBe("u1");
    expect(decoded.email).toBe("a@b.com");

    const parts = token.split(".");
    const tampered = `${parts[0]}.${parts[1]}.tampered_sig`;
    expect(auth.verifyToken(tampered, req)).toBeNull();
  });

  it("allows trusted CORS origins and blocks untrusted origins", () => {
    const getAllowedCorsOrigin = (auth as Record<string, unknown>).getAllowedCorsOrigin as
      | ((req: { headers: { origin: string } }) => string | null | false | undefined)
      | undefined;

    expect(typeof getAllowedCorsOrigin).toBe("function");
    expect(getAllowedCorsOrigin!({ headers: { origin: "https://sikkanam.vercel.app" } })).toBe(
      "https://sikkanam.vercel.app"
    );
    expect(getAllowedCorsOrigin!({ headers: { origin: "http://localhost:5173" } })).toBe(
      "http://localhost:5173"
    );
    expect(getAllowedCorsOrigin!({ headers: { origin: "https://evil.example" } })).toBeFalsy();
  });

  it("rejects an unsigned forged JWT (alg: none) in api/auth/login.js with 401", async () => {
    const { default: loginHandler } = await import("../../api/auth/login.js");

    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: "invalid_token" }),
    } as Response);

    const header = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString("base64url");
    const payload = Buffer.from(
      JSON.stringify({ email: "forged@example.com", sub: "forged-uid" })
    ).toString("base64url");
    const forgedToken = `${header}.${payload}.`;

    const req = {
      method: "POST",
      headers: {
        host: "sikkanam.vercel.app",
        origin: "https://sikkanam.vercel.app",
      },
      body: { idToken: forgedToken },
    };
    const res = createMockRes();

    await loginHandler(req, res);
    expect(res.statusCode).toBe(401);
  });

  it("rejects NoSQL operator object destinationId in api/wishlist.js with 400", async () => {
    const { default: wishlistHandler } = await import("../../api/wishlist.js");

    const req = createAuthedReq("POST", {
      body: { destinationId: { $ne: "" } },
    });
    const res = createMockRes();

    await wishlistHandler(req, res);
    expect(res.statusCode).toBe(400);
  });

  it("rejects invalid ObjectId on DELETE in api/feedback.js with 400", async () => {
    const { default: feedbackHandler } = await import("../../api/feedback.js");

    const req = createAuthedReq("DELETE", {
      query: { id: "not-a-valid-object-id" },
    });
    const res = createMockRes();

    await feedbackHandler(req, res);
    expect(res.statusCode).toBe(400);
  });

  it("blocks cloud metadata SSRF URL in firecrawlGrounding.js", async () => {
    const { queryFirecrawlLive } = await import("../../api/_utils/firecrawlGrounding.js");

    process.env.FIRECRAWL_API_URL = "http://169.254.169.254/latest/meta-data";
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({}),
    } as Response);

    await queryFirecrawlLive("ooty", "Ooty");

    for (const call of fetchSpy.mock.calls) {
      expect(String(call[0])).not.toContain("169.254.169.254");
    }
  });
});
