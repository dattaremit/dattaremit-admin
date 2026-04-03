import {
  STATUS_BADGE_VARIANT,
  ROLE_BADGE_VARIANT,
  ACTIVITY_TYPES,
  ACCOUNT_STATUSES,
  ACTIVITY_STATUSES,
  PIE_COLORS,
  DEFAULT_PAGE_SIZE,
} from "../constants";

describe("STATUS_BADGE_VARIANT", () => {
  it("should map ACTIVE to default", () => {
    expect(STATUS_BADGE_VARIANT["ACTIVE"]).toBe("default");
  });

  it("should map PENDING to secondary", () => {
    expect(STATUS_BADGE_VARIANT["PENDING"]).toBe("secondary");
  });

  it("should map REJECTED to destructive", () => {
    expect(STATUS_BADGE_VARIANT["REJECTED"]).toBe("destructive");
  });

  it("should map INITIAL to outline", () => {
    expect(STATUS_BADGE_VARIANT["INITIAL"]).toBe("outline");
  });

  it("should return undefined for unknown status", () => {
    expect(STATUS_BADGE_VARIANT["UNKNOWN"]).toBeUndefined();
  });
});

describe("ROLE_BADGE_VARIANT", () => {
  it("should map ADMIN to destructive", () => {
    expect(ROLE_BADGE_VARIANT["ADMIN"]).toBe("destructive");
  });

  it("should map USER to outline", () => {
    expect(ROLE_BADGE_VARIANT["USER"]).toBe("outline");
  });

  it("should map PROMOTER to secondary", () => {
    expect(ROLE_BADGE_VARIANT["PROMOTER"]).toBe("secondary");
  });
});

describe("ACTIVITY_TYPES", () => {
  it("should include common activity types", () => {
    expect(ACTIVITY_TYPES).toContain("TRANSFER");
    expect(ACTIVITY_TYPES).toContain("KYC_SUBMITTED");
    expect(ACTIVITY_TYPES).toContain("ACCOUNT_ACTIVATED");
  });

  it("should have at least 10 types", () => {
    expect(ACTIVITY_TYPES.length).toBeGreaterThanOrEqual(10);
  });
});

describe("ACCOUNT_STATUSES", () => {
  it("should contain all expected statuses", () => {
    expect(ACCOUNT_STATUSES).toEqual(["INITIAL", "ACTIVE", "PENDING", "REJECTED"]);
  });
});

describe("ACTIVITY_STATUSES", () => {
  it("should contain all expected statuses", () => {
    expect(ACTIVITY_STATUSES).toEqual(["PENDING", "COMPLETE", "FAILED"]);
  });
});

describe("PIE_COLORS", () => {
  it("should have 5 colors", () => {
    expect(PIE_COLORS).toHaveLength(5);
  });

  it("should use CSS custom properties", () => {
    PIE_COLORS.forEach((color) => {
      expect(color).toMatch(/^var\(--chart-\d\)$/);
    });
  });
});

describe("DEFAULT_PAGE_SIZE", () => {
  it("should be 20", () => {
    expect(DEFAULT_PAGE_SIZE).toBe(20);
  });
});
