// Files on the start-project form go straight from the browser to Vercel Blob, so they never
// pass through this server (Vercel caps function bodies at 4.5 MB). This route only signs a
// short-lived upload token, and only for a request that exists and was created moments ago.
import type { Express } from "express";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { REQUEST_FILE_MAX_BYTES, REQUEST_FILE_TYPES, REQUEST_FILE_WINDOW_MS, requestFilePrefix } from "@shared/requestFiles";
import { getProjectRequestById } from "../db";
import { ENV } from "./env";

/** The request a file may be attached to, or an error message saying why not. */
export async function requestOpenForFiles(requestId: number) {
  const request = Number.isInteger(requestId) && requestId > 0 ? await getProjectRequestById(requestId) : undefined;
  if (!request) return { error: "Request not found." } as const;
  if (Date.now() - new Date(request.createdAt).getTime() > REQUEST_FILE_WINDOW_MS) return { error: "Files can no longer be added to this request." } as const;
  return { request } as const;
}

export function registerRequestFileUpload(app: Express) {
  app.post("/api/request-files", async (req, res) => {
    if (!ENV.blobReadWriteToken) {
      res.status(503).json({ error: "File storage is not configured." });
      return;
    }
    try {
      const result = await handleUpload({
        body: req.body as HandleUploadBody,
        request: req,
        token: ENV.blobReadWriteToken,
        onBeforeGenerateToken: async (pathname, clientPayload) => {
          const requestId = Number(JSON.parse(clientPayload ?? "{}").requestId);
          const open = await requestOpenForFiles(requestId);
          if ("error" in open) throw new Error(open.error);
          if (!pathname.startsWith(requestFilePrefix(requestId))) throw new Error("Invalid file path.");
          return {
            allowedContentTypes: REQUEST_FILE_TYPES,
            maximumSizeInBytes: REQUEST_FILE_MAX_BYTES,
            addRandomSuffix: true,
            validUntil: Date.now() + 15 * 60 * 1000,
          };
        },
      });
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Upload not allowed." });
    }
  });
}
