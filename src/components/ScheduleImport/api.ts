import type { CsvRow, ImportReport } from "#/utilities/schedule/csv.ts";
import type { FinalisePlan } from "#/utilities/schedule/finalise.ts";
import type { ApplyResult, DraftResponse, DraftState, FinaliseOptions } from "#/utilities/schedule/types.ts";

export class ApiError extends Error {
	status: number;
	details?: unknown;

	constructor(message: string, status: number, details?: unknown) {
		super(message);
		this.status = status;
		this.details = details;
	}
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
	const response = await fetch(url, {
		credentials: "include",
		...init,
		headers: { "Content-Type": "application/json", ...init?.headers },
	});

	if (!response.ok) {
		const body = (await response.json().catch(() => null)) as { error?: string; details?: unknown } | null;
		throw new ApiError(body?.error ?? `Request failed (${response.status})`, response.status, body?.details);
	}

	return (await response.json()) as T;
}

/** `apiBase` is the URL the schedule endpoints are mounted under, e.g. `/api/schedule-drafts`. */
export function scheduleApi(apiBase: string, eventId: number) {
	const base = `${apiBase}/event/${eventId}`;
	const post = <T>(path: string, body: unknown = {}) =>
		request<T>(`${base}${path}`, { method: "POST", body: JSON.stringify(body) });

	return {
		base,
		load: () => request<DraftResponse>(base),
		save: (state: DraftState, expectedUpdatedAt: string | null) =>
			request<{ updatedAt: string }>(base, {
				method: "PATCH",
				body: JSON.stringify({ ...state, expectedUpdatedAt }),
			}),
		searchUsers: (query: string) =>
			request<{ id: string; username: string }[]>(`${base}/users?q=${encodeURIComponent(query)}`),
		importCsv: (csvRows: CsvRow[], defaultSetupMinutes: number) =>
			post<ImportReport>("/import", { csvRows, defaultSetupMinutes }),
		apply: (replaceUntracked = false) => post<ApplyResult>("/apply", { replaceUntracked }),
		reset: (resetSubmissions: boolean) =>
			post<{ runs: number; incentives: number; submissions: number }>("/reset", { resetSubmissions }),
		rebuild: () => post<{ rows: number }>("/rebuild"),
		finalise: (options: FinaliseOptions, dryRun: boolean) =>
			post<FinalisePlan>("/finalise", { ...options, dryRun }),
		submissionsCsvUrl: `${base}/submissions.csv`,
		horaroUrl: `${base}/horaro.json`,
	};
}

export type ScheduleApi = ReturnType<typeof scheduleApi>;
