import { describe, it, expect, vi, afterEach } from "vitest";

const originalFirecrawlKey = process.env.FIRECRAWL_API_KEY;

afterEach(() => {
  vi.restoreAllMocks();
  vi.resetModules();
  if (originalFirecrawlKey === undefined) {
    delete process.env.FIRECRAWL_API_KEY;
  } else {
    process.env.FIRECRAWL_API_KEY = originalFirecrawlKey;
  }
});

describe("Plan Trips Grounding — Firecrawl Primary with ScrapeGraph Fallback", () => {
  it("uses Firecrawl as primary without calling ScrapeGraph when Firecrawl returns live snippets", async () => {
    process.env.FIRECRAWL_API_KEY = "fc-test-key-123";

    const scrapegraphSpy = vi.fn();
    vi.doMock("../../api/_utils/scrapegraphGrounding.js", async () => {
      const actual = await vi.importActual<typeof import("../../api/_utils/scrapegraphGrounding.js")>(
        "../../api/_utils/scrapegraphGrounding.js"
      );
      return {
        ...actual,
        queryScrapeGraphLiveIntelligence: scrapegraphSpy,
      };
    });

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [
          {
            title: "TTDC Hotel Tamil Nadu Ooty Tariff 2026",
            description: "Standard double room starts at Rs 1800 per night with breakfast.",
          },
        ],
      }),
    } as Response);

    const { getPlanGroundingContext } = await import("../../api/generatePlan.js");
    const context = await getPlanGroundingContext("Ooty");

    expect(fetchSpy).toHaveBeenCalledWith(
      "https://api.firecrawl.dev/v1/search",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer fc-test-key-123",
        }),
      })
    );
    expect(context).toContain("Firecrawl Live Web Findings");
    expect(context).toContain("TTDC Hotel Tamil Nadu Ooty Tariff 2026");
    expect(scrapegraphSpy).not.toHaveBeenCalled();
  });

  it("falls back to ScrapeGraph when Firecrawl key is missing", async () => {
    delete process.env.FIRECRAWL_API_KEY;

    vi.doMock("../../api/_utils/scrapegraphGrounding.js", async () => {
      const actual = await vi.importActual<typeof import("../../api/_utils/scrapegraphGrounding.js")>(
        "../../api/_utils/scrapegraphGrounding.js"
      );
      return {
        ...actual,
        queryScrapeGraphLiveIntelligence: vi.fn().mockResolvedValue({
          destination: "Yercaud",
          mcpResult: { snippets: ["Yercaud TTDC tariff Rs 1600"], source: "ScrapeGraph AI" },
          liveScrape: null,
          webSearch: null,
          benchmark: null,
        }),
        formatScrapeGraphGroundedContext: vi
          .fn()
          .mockReturnValue("=== SCRAPEGRAPH ===\nYercaud TTDC tariff Rs 1600"),
      };
    });

    const { getPlanGroundingContext } = await import("../../api/generatePlan.js");
    const context = await getPlanGroundingContext("Yercaud");

    expect(context).toContain("Yercaud TTDC tariff Rs 1600");
  });

  it("falls back to ScrapeGraph when Firecrawl returns an HTTP error", async () => {
    process.env.FIRECRAWL_API_KEY = "fc-test-key-456";

    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 429,
    } as Response);

    vi.doMock("../../api/_utils/scrapegraphGrounding.js", async () => {
      const actual = await vi.importActual<typeof import("../../api/_utils/scrapegraphGrounding.js")>(
        "../../api/_utils/scrapegraphGrounding.js"
      );
      return {
        ...actual,
        queryScrapeGraphLiveIntelligence: vi.fn().mockResolvedValue({
          destination: "Kodaikanal",
          mcpResult: { snippets: ["Kodaikanal boat ride Rs 250"], source: "ScrapeGraph AI" },
          liveScrape: null,
          webSearch: null,
          benchmark: null,
        }),
        formatScrapeGraphGroundedContext: vi
          .fn()
          .mockReturnValue("=== SCRAPEGRAPH ===\nKodaikanal boat ride Rs 250"),
      };
    });

    const { getPlanGroundingContext } = await import("../../api/generatePlan.js");
    const context = await getPlanGroundingContext("Kodaikanal");

    expect(context).toContain("Kodaikanal boat ride Rs 250");
  });

  it("degrades gracefully to verified benchmarks when both Firecrawl and ScrapeGraph fail", async () => {
    delete process.env.FIRECRAWL_API_KEY;

    vi.doMock("../../api/_utils/scrapegraphGrounding.js", async () => {
      const actual = await vi.importActual<typeof import("../../api/_utils/scrapegraphGrounding.js")>(
        "../../api/_utils/scrapegraphGrounding.js"
      );
      return {
        ...actual,
        queryScrapeGraphLiveIntelligence: vi.fn().mockRejectedValue(new Error("Offline")),
        formatScrapeGraphGroundedContext: vi.fn().mockReturnValue(""),
      };
    });

    const { getPlanGroundingContext } = await import("../../api/generatePlan.js");
    const context = await getPlanGroundingContext("Madurai");

    expect(typeof context).toBe("string");
    expect(context).toContain("Madurai");
  });
});

describe("Sikkanam AI Chat Grounding — Firecrawl Primary with ScrapeGraph Fallback", () => {
  it("uses Firecrawl live snippets as primary in api/chat.js", async () => {
    process.env.FIRECRAWL_API_KEY = "fc-chat-test-123";

    const scrapegraphSpy = vi.fn();
    vi.doMock("../../api/_utils/scrapegraphGrounding.js", async () => {
      const actual = await vi.importActual<typeof import("../../api/_utils/scrapegraphGrounding.js")>(
        "../../api/_utils/scrapegraphGrounding.js"
      );
      return {
        ...actual,
        queryScrapeGraphLiveIntelligence: scrapegraphSpy,
      };
    });

    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [
          {
            title: "Rameswaram TTDC Hotel & Bus Tariff 2026",
            description: "Current room tariff starts at Rs 1450 per night; SETC bus from Chennai Rs 620.",
          },
        ],
      }),
    } as Response);

    const { getChatGroundingContext } = await import("../../api/chat.js");
    const context = await getChatGroundingContext("Rameswaram", "2 day budget trip");

    expect(context).toContain("Firecrawl Live Web Findings");
    expect(context).toContain("Rameswaram TTDC Hotel & Bus Tariff 2026");
    expect(scrapegraphSpy).not.toHaveBeenCalled();
  });

  it("falls back to ScrapeGraph in api/chat.js when Firecrawl is unavailable", async () => {
    delete process.env.FIRECRAWL_API_KEY;

    vi.doMock("../../api/_utils/scrapegraphGrounding.js", async () => {
      const actual = await vi.importActual<typeof import("../../api/_utils/scrapegraphGrounding.js")>(
        "../../api/_utils/scrapegraphGrounding.js"
      );
      return {
        ...actual,
        queryScrapeGraphLiveIntelligence: vi.fn().mockResolvedValue({
          destination: "Thanjavur",
          mcpResult: { snippets: ["Thanjavur Palace entry Rs 50"], source: "ScrapeGraph AI" },
          liveScrape: null,
          webSearch: null,
          benchmark: null,
        }),
        formatScrapeGraphGroundedContext: vi
          .fn()
          .mockReturnValue("=== SCRAPEGRAPH ===\nThanjavur Palace entry Rs 50"),
      };
    });

    const { getChatGroundingContext } = await import("../../api/chat.js");
    const context = await getChatGroundingContext("Thanjavur", "day trip");

    expect(context).toContain("Thanjavur Palace entry Rs 50");
  });
});
