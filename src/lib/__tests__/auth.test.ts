import { describe, it, expect } from "vitest";
import { encrypt, decrypt, SessionPayload } from "../auth";

describe("Authentication JWT helpers", () => {
  it("should encrypt and decrypt a session payload successfully", async () => {
    const payload: SessionPayload = {
      userId: "test-user-uuid",
      email: "test.student@stanford.edu",
      role: "STUDENT",
      username: "teststudent",
      fullName: "Test Student",
    };

    // Encrypt
    const token = await encrypt(payload);
    expect(token).toBeDefined();
    expect(typeof token).toBe("string");

    // Decrypt
    const decrypted = await decrypt(token);
    expect(decrypted).not.toBeNull();
    expect(decrypted?.userId).toBe(payload.userId);
    expect(decrypted?.email).toBe(payload.email);
    expect(decrypted?.role).toBe(payload.role);
    expect(decrypted?.username).toBe(payload.username);
    expect(decrypted?.fullName).toBe(payload.fullName);
  });

  it("should return null for invalid or tampered tokens", async () => {
    const badToken = "invalid.jwt.token.string";
    const result = await decrypt(badToken);
    expect(result).toBeNull();
  });
});
