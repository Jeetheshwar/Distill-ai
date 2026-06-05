import {
  extractAuthToken,
  validateSchemaMode,
  validateAudioFile,
  safeJsonParse,
} from "../app/api/extract/helpers";

describe("extract helpers", () => {
  describe("extractAuthToken", () => {
    it("returns null for missing or invalid header", () => {
      expect(extractAuthToken(null)).toBeNull();
      expect(extractAuthToken("invalid")).toBeNull();
      expect(extractAuthToken("Bearer ")).toBeNull();
    });

    it("accepts the mock key", () => {
      expect(extractAuthToken("Bearer sk_mock_pro_key_9281")).toBe("sk_mock_pro_key_9281");
    });

    it("accepts valid Groq keys", () => {
      expect(extractAuthToken("Bearer gsk_12345")).toBe("gsk_12345");
    });

    it("rejects unknown keys", () => {
      expect(extractAuthToken("Bearer random_key")).toBeNull();
    });
  });

  describe("validateSchemaMode", () => {
    it("defaults to standup for unknown schemas", () => {
      expect(validateSchemaMode("invalid")).toBe("standup");
      expect(validateSchemaMode(null)).toBe("standup");
    });

    it("accepts retro", () => {
      expect(validateSchemaMode("retro")).toBe("retro");
    });
  });

  describe("validateAudioFile", () => {
    it("returns error for files over 100MB", () => {
      // Mock File object
      const largeFile = {
        size: 101 * 1024 * 1024,
        type: "audio/wav",
      } as unknown as File;
      expect(validateAudioFile(largeFile)).toBe("File size exceeds 100MB limit.");
    });

    it("returns error for non-audio types", () => {
      const textFile = {
        size: 1000,
        type: "text/plain",
      } as unknown as File;
      expect(validateAudioFile(textFile)).toBe("Invalid file type. Only audio files are supported.");
    });

    it("returns null for valid audio files", () => {
      const validFile = {
        size: 50 * 1024 * 1024,
        type: "audio/mp3",
      } as unknown as File;
      expect(validateAudioFile(validFile)).toBeNull();
    });
  });

  describe("safeJsonParse", () => {
    it("parses valid JSON", () => {
      const result = safeJsonParse('{"key":"value"}');
      expect(result).toEqual({ key: "value" });
    });

    it("returns error object for invalid JSON", () => {
      const result = safeJsonParse("invalid json");
      expect(result).toHaveProperty("error");
    });
  });
});
