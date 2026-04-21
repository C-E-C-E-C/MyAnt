import type { AuthSession } from "../types/api";
import { getApiBaseUrl, requestApi } from "./http";

export interface VideoUploadSessionResponse {
  uploadUrl: string;
  fileUrl: string;
  objectKey: string;
  expiresInSeconds: number;
}

export interface VideoUploadTask {
  promise: Promise<string>;
  cancel: () => void;
}

function authHeaders(session?: AuthSession | null) {
  if (!session) {
    return {};
  }

  return {
    tokenName: session.tokenName,
    tokenValue: session.tokenValue,
  };
}

async function uploadFile(
  apiPath: string,
  file: File,
  session?: AuthSession | null,
  onProgress?: (progress: number) => void,
) {
  return new Promise<string>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const baseUrl = getApiBaseUrl();
    const requestUrl = `${baseUrl}${apiPath}`;
    const formData = new FormData();
    formData.append("file", file);

    xhr.open("POST", requestUrl, true);

    const headers = authHeaders(session);
    if (headers.tokenName && headers.tokenValue) {
      xhr.setRequestHeader(headers.tokenName, headers.tokenValue);
    }

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) {
        return;
      }

      const percent = Math.min(
        100,
        Math.max(0, (event.loaded / event.total) * 100),
      );
      onProgress?.(percent);
    };

    xhr.onerror = () => {
      reject(new Error("上传失败，请检查网络或后端服务是否可用"));
    };

    xhr.onabort = () => {
      reject(new Error("上传已取消"));
    };

    xhr.onload = () => {
      if (xhr.status < 200 || xhr.status >= 300) {
        reject(new Error(`上传失败：${xhr.status}`));
        return;
      }

      const rawText = xhr.responseText;
      if (!rawText) {
        reject(new Error("接口返回为空"));
        return;
      }

      let payload: unknown;
      try {
        payload = JSON.parse(rawText) as unknown;
      } catch {
        reject(new Error("上传响应格式异常"));
        return;
      }

      if (
        payload &&
        typeof payload === "object" &&
        "code" in payload &&
        "message" in payload &&
        "data" in payload
      ) {
        const response = payload as {
          code: number;
          message: string;
          data: unknown;
        };
        if (response.code !== 0) {
          reject(new Error(response.message || "上传失败"));
          return;
        }

        resolve(String(response.data ?? ""));
        return;
      }

      resolve(String(payload));
    };

    xhr.send(formData);
  });
}

export function uploadImageFile(
  file: File,
  session?: AuthSession | null,
  onProgress?: (progress: number) => void,
) {
  return uploadFile("/api/upload/image", file, session, onProgress);
}

function uploadToPresignedUrl(
  uploadUrl: string,
  file: File,
  onProgress?: (progress: number) => void,
): VideoUploadTask {
  const xhr = new XMLHttpRequest();

  const promise = new Promise<string>((resolve, reject) => {
    xhr.open("PUT", uploadUrl, true);

    if (file.type) {
      xhr.setRequestHeader("Content-Type", file.type);
    }

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) {
        return;
      }

      const percent = Math.min(
        100,
        Math.max(0, (event.loaded / event.total) * 100),
      );
      onProgress?.(percent);
    };

    xhr.onerror = () => {
      reject(new Error("上传失败，请检查网络或存储桶配置是否正常"));
    };

    xhr.onabort = () => {
      reject(new Error("上传已取消"));
    };

    xhr.onload = () => {
      if (xhr.status < 200 || xhr.status >= 300) {
        reject(new Error(`上传失败：${xhr.status}`));
        return;
      }

      resolve("");
    };

    xhr.send(file);
  });

  return {
    promise,
    cancel: () => xhr.abort(),
  };
}

export async function createVideoUploadTask(
  file: File,
  session?: AuthSession | null,
  onProgress?: (progress: number) => void,
) {
  const sessionResponse = await requestApi<VideoUploadSessionResponse>(
    "/api/upload/video/presign",
    {
      method: "POST",
      body: JSON.stringify({
        fileName: file.name,
        contentType: file.type,
      }),
      ...authHeaders(session),
    },
  );

  const task = uploadToPresignedUrl(
    sessionResponse.uploadUrl,
    file,
    onProgress,
  );
  return {
    promise: task.promise.then(() => sessionResponse.fileUrl),
    cancel: task.cancel,
  };
}
