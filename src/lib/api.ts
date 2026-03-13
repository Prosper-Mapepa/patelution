"use client";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token =
    typeof window !== "undefined"
      ? window.localStorage.getItem("patelution_token")
      : null;

  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed with ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  const text = await res.text();
  if (!text || !text.trim()) return undefined as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return undefined as T;
  }
}

/** Public request (no auth) for public pages e.g. Latest Americanos */
async function requestPublic<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed with ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  if (!text || !text.trim()) return undefined as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return undefined as T;
  }
}

export type AuthUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
};

export async function apiRegister(input: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}) {
  const result = await request<{ user: AuthUser; token: string }>(
    "/auth/register",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
  if (typeof window !== "undefined") {
    window.localStorage.setItem("patelution_token", result.token);
    window.localStorage.setItem("patelution_user_id", result.user.id);
  }
  return result;
}

export async function apiLogin(input: {
  email: string;
  password: string;
}) {
  const result = await request<{ user: AuthUser; token: string }>(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
  if (typeof window !== "undefined") {
    window.localStorage.setItem("patelution_token", result.token);
    window.localStorage.setItem("patelution_user_id", result.user.id);
  }
  return result;
}

export type Court = { id: string; name: string };
export type Participant = { id: string; displayName: string };
export type Match = {
  id: string;
  round: number;
  courtId: string;
  pairA: string;
  pairB: string;
  scoreA: number;
  scoreB: number;
};

export type Tournament = {
  id: string;
  name: string;
  format: string;
  maxScore: number;
  status: string;
  createdAt: string;
  ownerId?: string;
  courts?: Court[];
  participants?: Participant[];
  matches?: Match[];
};

export type StandingRow = {
  name: string;
  wins: number;
  ties: number;
  losses: number;
  points: number;
  matches: number;
};

export async function apiListTournaments() {
  return request<Tournament[]>("/tournaments");
}

/** List tournaments without auth (for public Latest Americanos page) */
export async function apiListTournamentsPublic() {
  return requestPublic<Tournament[]>("/tournaments");
}

/** Get one tournament without auth (for public Live Snapshot) */
export async function apiGetTournamentPublic(id: string) {
  return requestPublic<Tournament>(`/tournaments/${id}`);
}

export async function apiGetTournament(id: string) {
  return request<Tournament>(`/tournaments/${id}`);
}

export async function apiCreateTournament(input: {
  name: string;
  format: string;
  maxScore: number;
  courtNames: string[];
}) {
  const ownerId =
    typeof window !== "undefined"
      ? window.localStorage.getItem("patelution_user_id")
      : null;

  return request<Tournament>("/tournaments", {
    method: "POST",
    body: JSON.stringify({
      ...input,
      ownerId,
    }),
  });
}

export async function apiUpdateTournament(
  id: string,
  data: { name?: string; status?: string; maxScore?: number }
) {
  return request<Tournament>(`/tournaments/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function apiDeleteTournament(id: string) {
  return request<void>(`/tournaments/${id}`, { method: "DELETE" });
}

export async function apiAddParticipant(tournamentId: string, displayName: string) {
  return request<Participant>(`/tournaments/${tournamentId}/participants`, {
    method: "POST",
    body: JSON.stringify({ displayName }),
  });
}

export async function apiUpdateParticipant(
  participantId: string,
  displayName: string
) {
  return request<Participant>(`/tournaments/participants/${participantId}`, {
    method: "PATCH",
    body: JSON.stringify({ displayName }),
  });
}

export async function apiDeleteParticipant(participantId: string) {
  return request<void>(`/tournaments/participants/${participantId}`, {
    method: "DELETE",
  });
}

export async function apiListMatches(tournamentId: string) {
  return request<Match[]>(`/tournaments/${tournamentId}/matches`);
}

export async function apiCreateMatch(
  tournamentId: string,
  body: { courtId: string; round: number; pairA: string; pairB: string }
) {
  return request<Match>(`/tournaments/${tournamentId}/matches`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function apiUpdateMatchScore(
  matchId: string,
  scoreA: number,
  scoreB: number
) {
  return request<Match>(`/tournaments/matches/${matchId}/score`, {
    method: "PATCH",
    body: JSON.stringify({ scoreA, scoreB }),
  });
}

export async function apiGetStandings(tournamentId: string) {
  return request<StandingRow[]>(`/tournaments/${tournamentId}/standings`);
}

