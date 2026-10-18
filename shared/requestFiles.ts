// Rules for files attached to a project request, shared by the start-project form and the server.

export const REQUEST_FILE_MAX_BYTES = 50 * 1024 * 1024;
export const REQUEST_FILE_MAX_COUNT = 10;
/** Files may be attached only this long after the request is created. */
export const REQUEST_FILE_WINDOW_MS = 2 * 60 * 60 * 1000;

export const REQUEST_FILE_TYPES = [
  "image/*",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/zip",
  "application/x-zip-compressed",
];
/** The file picker's `accept` attribute for the same types. */
export const REQUEST_FILE_ACCEPT = "image/*,.pdf,.doc,.docx,.zip";

/** Every file of request 42 lives under `requests/42/`. */
export const requestFilePrefix = (requestId: number) => `requests/${requestId}/`;
