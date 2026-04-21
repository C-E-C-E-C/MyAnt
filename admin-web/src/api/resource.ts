import type { AuthSession } from "../types/api";
import { requestRaw } from "./http";

function authHeaders(session?: AuthSession | null) {
  if (!session) {
    return {};
  }

  return {
    tokenName: session.tokenName,
    tokenValue: session.tokenValue,
  };
}

export function fetchResourceList<T>(
  apiPath: string,
  session?: AuthSession | null,
) {
  return requestRaw<T[]>(`${apiPath}/list`, {
    method: "GET",
    ...authHeaders(session),
  });
}

export function saveResource<T>(
  apiPath: string,
  payload: T,
  session?: AuthSession | null,
) {
  return requestRaw<boolean>(apiPath, {
    method: "POST",
    body: JSON.stringify(payload),
    ...authHeaders(session),
  });
}

export function updateResource<T>(
  apiPath: string,
  payload: T,
  session?: AuthSession | null,
) {
  return requestRaw<boolean>(apiPath, {
    method: "PUT",
    body: JSON.stringify(payload),
    ...authHeaders(session),
  });
}

export function deleteResource(
  apiPath: string,
  id: string | number,
  session?: AuthSession | null,
) {
  return requestRaw<boolean>(`${apiPath}/${id}`, {
    method: "DELETE",
    ...authHeaders(session),
  });
}
