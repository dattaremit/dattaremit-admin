import { api, setTokenGetter } from "../api";

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  jest.clearAllMocks();
  setTokenGetter(async () => "test-token-123");
});

function mockResponse(data: unknown, status = 200) {
  mockFetch.mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
  });
}

describe("api client", () => {
  describe("getDashboardStats", () => {
    it("should call /admin/stats with auth header", async () => {
      mockResponse({ success: true, data: { totalUsers: 10 } });

      const result = await api.getDashboardStats();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/admin/stats"),
        expect.objectContaining({
          headers: expect.objectContaining({
            "x-auth-token": "test-token-123",
          }),
        }),
      );
      expect(result.data.totalUsers).toBe(10);
    });
  });

  describe("getUsers", () => {
    it("should include pagination params", async () => {
      mockResponse({ success: true, data: { users: [], total: 0 } });

      await api.getUsers(2, 10);

      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain("page=2");
      expect(url).toContain("limit=10");
    });

    it("should include search param when provided", async () => {
      mockResponse({ success: true, data: { users: [], total: 0 } });

      await api.getUsers(1, 20, "john");

      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain("search=john");
    });

    it("should include status param when provided", async () => {
      mockResponse({ success: true, data: { users: [], total: 0 } });

      await api.getUsers(1, 20, undefined, "ACTIVE");

      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain("status=ACTIVE");
    });
  });

  describe("createUser", () => {
    it("should POST with user data", async () => {
      mockResponse({ success: true, data: { id: "user-1" } });

      await api.createUser({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        phoneNumberPrefix: "+1",
        phoneNumber: "1234567890",
        dateOfBirth: "1990-01-01",
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/admin/users"),
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining("John"),
        }),
      );
    });
  });

  describe("error handling", () => {
    it("should throw on 401", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: "Unauthorized" }),
      });

      await expect(api.getDashboardStats()).rejects.toThrow("Unauthorized");
    });

    it("should throw on 403", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ message: "Forbidden" }),
      });

      await expect(api.getDashboardStats()).rejects.toThrow("Forbidden");
    });

    it("should throw with message from response body", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: "Internal server error" }),
      });

      await expect(api.getDashboardStats()).rejects.toThrow("Internal server error");
    });

    it("should handle json parse failure in error response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => { throw new Error("Parse failed"); },
      });

      await expect(api.getDashboardStats()).rejects.toThrow("Request failed");
    });
  });

  describe("deleteUser", () => {
    it("should call DELETE method", async () => {
      mockResponse({ success: true });

      await api.deleteUser("user-123");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/admin/users/user-123"),
        expect.objectContaining({ method: "DELETE" }),
      );
    });
  });

  describe("changeUserRole", () => {
    it("should PATCH with role in body", async () => {
      mockResponse({ success: true, data: { role: "ADMIN" } });

      await api.changeUserRole("user-123", "ADMIN");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/admin/users/user-123/role"),
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({ role: "ADMIN" }),
        }),
      );
    });
  });

  describe("updateSetting", () => {
    it("should PUT with key and value", async () => {
      mockResponse({ success: true });

      await api.updateSetting("weekly_limit", "5000");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/admin/settings"),
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify({ key: "weekly_limit", value: "5000" }),
        }),
      );
    });
  });

  describe("without token", () => {
    it("should not include auth header when no token getter set", async () => {
      setTokenGetter(async () => null);
      mockResponse({ success: true, data: {} });

      await api.getDashboardStats();

      const headers = mockFetch.mock.calls[0][1].headers;
      expect(headers["x-auth-token"]).toBeUndefined();
    });
  });
});
