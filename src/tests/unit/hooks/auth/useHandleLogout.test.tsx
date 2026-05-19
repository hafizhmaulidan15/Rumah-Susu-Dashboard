import { act, renderHook } from "@testing-library/react";
import { toast } from "sonner";

import { useHandleLogout } from "@/hooks/auth/useHandleLogout";
import { signOut as _signOut } from "@/services/auth/auth-client";
import { useLayoutStore } from "@/store/layoutStore";

// signOut is always defined in test env (mocked in vitest.setup.ts)
const signOut = _signOut as NonNullable<typeof _signOut>;

vi.mock("@/utils/presentationMode", () => ({
  isPresentationModeClient: vi.fn(() => false),
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn() },
}));

describe("useHandleLogout", () => {
  const reloadMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useLayoutStore.setState({ isLoggingOut: false });
    vi.mocked(signOut).mockResolvedValue(undefined as never);
    Object.defineProperty(window, "location", {
      value: { reload: reloadMock },
      writable: true,
    });
  });

  it("calls signOut and reloads page on success", async () => {
    const { result } = renderHook(() => useHandleLogout());

    await act(async () => {
      await result.current.handleLogout();
    });

    expect(signOut).toHaveBeenCalled();
    expect(reloadMock).toHaveBeenCalled();
  });

  it("sets isLoggingOut to true during logout", async () => {
    let capturedLoggingOut = false;
    vi.mocked(signOut).mockImplementation(async () => {
      capturedLoggingOut = useLayoutStore.getState().isLoggingOut;
      return undefined as never;
    });

    const { result } = renderHook(() => useHandleLogout());

    await act(async () => {
      await result.current.handleLogout();
    });

    expect(capturedLoggingOut).toBe(true);
  });

  it("sets error and resets isLoggingOut on failure", async () => {
    vi.mocked(signOut).mockRejectedValue(new Error("Logout failed"));

    const { result } = renderHook(() => useHandleLogout());

    await act(async () => {
      await result.current.handleLogout();
    });

    expect(result.current.error).toContain("Logout failed");
    expect(useLayoutStore.getState().isLoggingOut).toBe(false);
  });

  it("shows toast in presentation mode", async () => {
    const { isPresentationModeClient } =
      await import("@/utils/presentationMode");
    vi.mocked(isPresentationModeClient).mockReturnValue(true);

    const { result } = renderHook(() => useHandleLogout());

    await act(async () => {
      await result.current.handleLogout();
    });

    expect(toast.error).toHaveBeenCalled();
    expect(signOut).not.toHaveBeenCalled();
    vi.mocked(isPresentationModeClient).mockReturnValue(false);
  });
});
