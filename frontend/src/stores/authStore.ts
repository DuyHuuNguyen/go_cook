type AuthStatus = "authorized" | "unauthorized" | "forbidden" | "unknown";

let status: AuthStatus = "unknown";

const listeners = new Set<(state: AuthStatus) => void>();

export const authStore = {
  setAuthStatus(newAuthStatus: AuthStatus) {
    if (newAuthStatus === status) return;

    status = newAuthStatus;
    listeners.forEach((listener) => listener(status));
  },

  isUnAuthorized() {
    return status === "unauthorized";
  },

  isUnknown() {
    return status === "unknown";
  },

  isAuthorized() {
    return status === "authorized";
  },

  isForbidden() {
    return status === "forbidden";
  },

  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
