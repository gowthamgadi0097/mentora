export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function percent(score: number, total: number) {
  return total > 0 ? Math.round((score / total) * 100) : 0;
}

export function json(data: unknown, status = 200) {
  return Response.json(data, { status });
}
