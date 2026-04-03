import { formatDate, formatMonthShort, formatActivityType } from "../utils";

describe("formatDate", () => {
  it("should format ISO date string to readable format", () => {
    expect(formatDate("2026-04-04T12:00:00Z")).toBe("Apr 4, 2026");
  });

  it("should handle date-only strings", () => {
    expect(formatDate("2025-01-15")).toBe("Jan 15, 2025");
  });
});

describe("formatMonthShort", () => {
  it("should format to abbreviated month and year", () => {
    expect(formatMonthShort("2026-04-01")).toBe("Apr '26");
  });

  it("should handle full ISO dates", () => {
    expect(formatMonthShort("2025-12-15T00:00:00Z")).toBe("Dec '25");
  });
});

describe("formatActivityType", () => {
  it("should replace underscores with spaces", () => {
    expect(formatActivityType("KYC_SUBMITTED")).toBe("KYC SUBMITTED");
  });

  it("should handle multiple underscores", () => {
    expect(formatActivityType("ACCOUNT_STATUS_CHANGED")).toBe("ACCOUNT STATUS CHANGED");
  });

  it("should handle types without underscores", () => {
    expect(formatActivityType("TRANSFER")).toBe("TRANSFER");
  });

  it("should handle empty string", () => {
    expect(formatActivityType("")).toBe("");
  });
});
