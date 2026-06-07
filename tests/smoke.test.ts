import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildQuotePdf } from "../src/lib/quotePdf";
import { predictCampaignLocal } from "../src/lib/ml-fallback";
import { rateLimit } from "../src/lib/rateLimit";

describe("quote PDF", () => {
  it("generates a valid PDF buffer", () => {
    const pdf = buildQuotePdf({
      vehicleName: "GR Supra",
      trimName: "GR",
      color: "Rouge Matador",
      basePrice: 520000,
      options: [{ label: "Jantes 19 pouces", amount: 10000 }],
      totalPrice: 530000,
      downPayment: 106000,
      termMonths: 48,
      monthlyPayment: 9800,
      annualRate: 5.9,
    });
    assert.ok(Buffer.isBuffer(pdf));
    assert.equal(pdf.subarray(0, 5).toString(), "%PDF-");
    assert.ok(pdf.length > 200);
  });
});

describe("ML fallback", () => {
  it("returns campaign prediction without external service", () => {
    const result = predictCampaignLocal({
      vehicle_category: "SUV",
      price_range: "300k-500k",
      season: "summer",
      target_segment: "families",
    });
    assert.ok(result.campaign_type);
    assert.ok(result.channel);
    assert.ok(typeof result.predicted_roi === "number");
  });
});

describe("rate limit helper", () => {
  it("blocks after max requests", () => {
    const key = `test-${Date.now()}`;
    assert.equal(rateLimit(key, 3, 60_000), true);
    assert.equal(rateLimit(key, 3, 60_000), true);
    assert.equal(rateLimit(key, 3, 60_000), true);
    assert.equal(rateLimit(key, 3, 60_000), false);
  });
});
