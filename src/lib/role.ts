export type Role = "buyer" | "seller";

const KEY = "user_role";

export function setRole(role: Role) {
  try {
    localStorage.setItem(KEY, role);
  } catch {
    // ignore
  }
}

export function getRole(): Role | null {
  try {
    const v = localStorage.getItem(KEY) as Role | null;
    return v === "buyer" || v === "seller" ? v : null;
  } catch {
    return null;
  }
}

export function clearRole() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
