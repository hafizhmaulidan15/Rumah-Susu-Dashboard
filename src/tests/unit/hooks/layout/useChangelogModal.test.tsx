import { renderHook, waitFor } from "@testing-library/react";

import { useChangelogModal } from "@/components/layout/navbar/hooks/useChangelogModal";

describe("useChangelogModal", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("starts in loading state", () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => new Promise(() => {})),
    );
    const { result } = renderHook(() => useChangelogModal());
    expect(result.current.isLoading).toBe(true);
    expect(result.current.changelogContent).toBe("");
  });

  it("sets content after successful fetch", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          text: () => Promise.resolve("# Test Changelog"),
        }),
      ),
    );

    const { result } = renderHook(() => useChangelogModal());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.changelogContent).toBe("# Test Changelog");
    expect(result.current.error).toBeNull();
  });

  it("sets error on fetch failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 404,
        }),
      ),
    );

    const { result } = renderHook(() => useChangelogModal());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
  });
});
