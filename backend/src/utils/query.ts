import { Request } from "express";

export function getQueryString(
  req: Request,
  key: string
): string | undefined {
  const value = req.query[key];

  return typeof value === "string" ? value : undefined;
}
