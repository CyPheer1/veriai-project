export interface AuthUserResponse {
  id: string;
  email: string;
  plan: string;
  dailySubmissionCount: number;
  lastSubmissionDate: string | null;
  createdAt: string;
}

export interface AuthResponse {
  tokenType: string;
  accessToken: string;
  expiresAt: string;
  user: AuthUserResponse;
}

export interface SubmissionAcceptedResponse {
  submissionId: string;
  status: string;
  submittedAt: string;
  message: string;
}

export interface FrontendModelAttribution {
  name: string;
  score: number;
}

export interface FrontendSegment {
  text: string;
  isAI: boolean;
}

export interface FrontendChunkScore {
  text: string;
  score: number;
}

export interface FrontendStats {
  analyzed: number;
  flagged: number;
  clean: number;
}

export interface FrontendResultsResponse {
  aiScore: number;
  humanScore: number;
  confidence: number;
  label: string;
  model: string;
  submittedText: string;
  wordCount: number;
  modelAttributions: FrontendModelAttribution[];
  segments: FrontendSegment[];
  chunks: FrontendChunkScore[];
  stats: FrontendStats;
}

export interface SubmissionDetailResponse {
  submissionId: string;
  status: string;
  sourceType: string;
  sourceFilename: string | null;
  processingMode: string;
  wordCount: number;
  originalText: string;
  submittedAt: string;
  startedAt: string | null;
  completedAt: string | null;
  errorMessage: string | null;
  frontendPayload: FrontendResultsResponse | null;
}

export interface SubmissionListItemResponse {
  submissionId: string;
  status: string;
  sourceType: string;
  processingMode: string;
  wordCount: number;
  submittedAt: string;
  completedAt: string | null;
  globalLabel: string | null;
  globalConfidence: number | null;
  errorMessage: string | null;
}

export interface SubmissionPageResponse {
  items: SubmissionListItemResponse[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
}

interface ApiErrorPayload {
  message?: string;
  error?: string;
  status?: number;
}

export class ApiRequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
  }
}

const env = import.meta.env as Record<string, string | undefined>;
const API_BASE_URL = env.VITE_API_BASE_URL ?? "http://localhost:8080";

function buildUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const normalizedBase = API_BASE_URL.endsWith("/")
    ? API_BASE_URL.slice(0, -1)
    : API_BASE_URL;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

async function parseError(response: Response): Promise<string> {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    try {
      const payload = (await response.json()) as ApiErrorPayload;
      if (payload.message && payload.message.trim().length > 0) {
        return payload.message;
      }
      if (payload.error && payload.error.trim().length > 0) {
        return payload.error;
      }
    } catch {
      // Ignore JSON parse errors and fallback to generic message.
    }
  }

  const text = await response.text();
  if (text.trim().length > 0) {
    return text;
  }

  return `HTTP ${response.status}`;
}

async function requestJson<T>(
  path: string,
  init: RequestInit = {},
  token?: string,
): Promise<T> {
  const headers = new Headers(init.headers ?? {});
  headers.set("Accept", "application/json");

  const hasFormDataBody = init.body instanceof FormData;
  if (!hasFormDataBody && init.body != null && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(buildUrl(path), {
    ...init,
    headers,
  });

  if (!response.ok) {
    const message = await parseError(response);
    throw new ApiRequestError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function loginRequest(email: string, password: string): Promise<AuthResponse> {
  return requestJson<AuthResponse>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function registerRequest(
  email: string,
  password: string,
  plan: string = "FREE",
): Promise<AuthResponse> {
  return requestJson<AuthResponse>("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, plan }),
  });
}

export async function meRequest(token: string): Promise<AuthUserResponse> {
  return requestJson<AuthUserResponse>("/api/v1/auth/me", { method: "GET" }, token);
}

export async function submitTextRequest(
  token: string,
  text: string,
): Promise<SubmissionAcceptedResponse> {
  return requestJson<SubmissionAcceptedResponse>("/api/v1/submissions/text", {
    method: "POST",
    body: JSON.stringify({ text }),
  }, token);
}

export async function submitFileRequest(
  token: string,
  file: File,
): Promise<SubmissionAcceptedResponse> {
  const formData = new FormData();
  formData.append("file", file);

  return requestJson<SubmissionAcceptedResponse>("/api/v1/submissions/file", {
    method: "POST",
    body: formData,
  }, token);
}

export async function getSubmissionRequest(
  token: string,
  submissionId: string,
): Promise<SubmissionDetailResponse> {
  return requestJson<SubmissionDetailResponse>(`/api/v1/submissions/${submissionId}`, { method: "GET" }, token);
}

export async function listSubmissionsRequest(
  token: string,
  page: number = 0,
  size: number = 20,
): Promise<SubmissionPageResponse> {
  const query = new URLSearchParams({
    page: String(page),
    size: String(size),
  }).toString();

  return requestJson<SubmissionPageResponse>(`/api/v1/submissions?${query}`, { method: "GET" }, token);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function pollSubmissionResult(
  token: string,
  submissionId: string,
  options?: { intervalMs?: number; timeoutMs?: number },
): Promise<SubmissionDetailResponse> {
  const intervalMs = options?.intervalMs ?? 1500;
  const timeoutMs = options?.timeoutMs ?? 90000;
  const start = Date.now();

  let latest: SubmissionDetailResponse | null = null;

  while (Date.now() - start <= timeoutMs) {
    latest = await getSubmissionRequest(token, submissionId);

    if (latest.status === "COMPLETED" || latest.status === "ERROR") {
      return latest;
    }

    await delay(intervalMs);
  }

  if (latest) {
    return latest;
  }

  throw new ApiRequestError("Timed out while waiting for analysis result", 408);
}

export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiRequestError) {
    return error.message;
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return fallback;
}
