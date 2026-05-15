import {
  hasValidAuthUrl,
  isPresentationMode,
  isPresentationModeClient,
} from "@/utils/presentationMode";

describe("presentationMode utilities", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("hasValidAuthUrl", () => {
    it("returns false when NEXT_PUBLIC_AUTH_URL is empty", () => {
      vi.stubEnv("NEXT_PUBLIC_AUTH_URL", "");
      expect(hasValidAuthUrl()).toBe(false);
    });

    it("returns true for valid http URL", () => {
      vi.stubEnv("NEXT_PUBLIC_AUTH_URL", "http://localhost:3000/api/auth");
      expect(hasValidAuthUrl()).toBe(true);
    });

    it("returns true for valid https URL", () => {
      vi.stubEnv("NEXT_PUBLIC_AUTH_URL", "https://api.example.com/api/auth");
      expect(hasValidAuthUrl()).toBe(true);
    });

    it("returns false for invalid URL scheme", () => {
      vi.stubEnv("NEXT_PUBLIC_AUTH_URL", "ftp://files.example.com");
      expect(hasValidAuthUrl()).toBe(false);
    });
  });

  describe("isPresentationMode", () => {
    it("returns true when no auth URL", () => {
      vi.stubEnv("NEXT_PUBLIC_AUTH_URL", "");
      expect(isPresentationMode()).toBe(true);
    });

    it("returns false when valid auth URL exists", () => {
      vi.stubEnv("NEXT_PUBLIC_AUTH_URL", "http://localhost:3000/api/auth");
      expect(isPresentationMode()).toBe(false);
    });
  });

  describe("isPresentationModeClient", () => {
    it("returns true when NEXT_PUBLIC_AUTH_URL is missing", () => {
      vi.stubEnv("NEXT_PUBLIC_AUTH_URL", "");
      expect(isPresentationModeClient()).toBe(true);
    });

    it("returns false when valid NEXT_PUBLIC_AUTH_URL exists", () => {
      vi.stubEnv("NEXT_PUBLIC_AUTH_URL", "http://localhost:3000/api/auth");
      expect(isPresentationModeClient()).toBe(false);
    });
  });
});
