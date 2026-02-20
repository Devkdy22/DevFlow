import {
  AUTH_TOKEN_KEY,
  applyAuthHeader,
  clearAuthToken,
  formatBearerToken,
  persistAuthToken,
  readAuthToken,
  type StorageLike,
} from "../../../packages/core/src";
import { APP_NAVIGATION_BASE } from "../../../packages/navigation/src/base";

describe("workspace libraries", () => {
  describe("@devflow/core auth", () => {
    const makeMemoryStorage = (): StorageLike & { dump: Record<string, string> } => {
      const dump: Record<string, string> = {};
      return {
        dump,
        getItem: key => dump[key] ?? null,
        setItem: (key, value) => {
          dump[key] = value;
        },
        removeItem: key => {
          delete dump[key];
        },
      };
    };

    test("토큰 저장/조회/삭제가 동작한다", () => {
      const storage = makeMemoryStorage();

      expect(readAuthToken(storage)).toBeNull();

      persistAuthToken(storage, "abc-token");
      expect(storage.dump[AUTH_TOKEN_KEY]).toBe("abc-token");
      expect(readAuthToken(storage)).toBe("abc-token");

      clearAuthToken(storage);
      expect(readAuthToken(storage)).toBeNull();
    });

    test("Authorization 헤더를 세팅/삭제한다", () => {
      const headers: Record<string, string> = {};

      applyAuthHeader(headers, "my-token");
      expect(headers.Authorization).toBe("Bearer my-token");
      expect(formatBearerToken("my-token")).toBe("Bearer my-token");

      applyAuthHeader(headers, null);
      expect(headers.Authorization).toBeUndefined();
      expect(formatBearerToken(null)).toBeUndefined();
    });
  });

  describe("@devflow/navigation", () => {
    test("기본 내비게이션 항목이 정의되어 있다", () => {
      expect(APP_NAVIGATION_BASE.length).toBeGreaterThan(0);
      expect(APP_NAVIGATION_BASE.map(item => item.path)).toEqual(
        expect.arrayContaining(["/dashboard", "/tasks", "/schedule", "/retrospective"])
      );
    });
  });
});
