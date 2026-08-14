import { describe, it, expect, beforeEach } from "vitest";
import {
  getBusinessInfoDraftKey,
  readBusinessInfoDraft,
  writeBusinessInfoDraft,
  clearBusinessInfoDraft,
} from "@/lib/business-info-draft";

describe("business info draft storage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("should scope the draft by user id", () => {
    expect(getBusinessInfoDraftKey("user-1")).toBe("muwoyo-business-info-draft-user-1");
    expect(getBusinessInfoDraftKey(null)).toBeNull();
    expect(getBusinessInfoDraftKey(undefined)).toBeNull();
  });

  it("should not reuse a draft from another user", () => {
    const anotherUserDraft = {
      business_name: "Empresa X",
      ai_name: "IA X",
    };

    writeBusinessInfoDraft("user-1", anotherUserDraft as any);

    expect(readBusinessInfoDraft("user-2")).toBeNull();
    expect(readBusinessInfoDraft("user-1")).toEqual(anotherUserDraft);
  });

  it("should clear only the current user draft", () => {
    writeBusinessInfoDraft("user-1", { business_name: "Empresa A" } as any);
    writeBusinessInfoDraft("user-2", { business_name: "Empresa B" } as any);

    clearBusinessInfoDraft("user-1");

    expect(readBusinessInfoDraft("user-1")).toBeNull();
    expect(readBusinessInfoDraft("user-2")).toEqual({ business_name: "Empresa B" });
  });
});
