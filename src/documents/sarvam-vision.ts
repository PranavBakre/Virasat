import { strFromU8, unzipSync, zipSync } from "fflate";

const BASE_URL = "https://api.sarvam.ai/doc-digitization/job/v1";
const TERMINAL_STATES = new Set(["Completed", "PartiallyCompleted", "Failed"]);

type ApiObject = Record<string, unknown>;

function headers(apiKey: string): HeadersInit {
  return {
    "api-subscription-key": apiKey,
    "Content-Type": "application/json",
  };
}

async function apiJson(
  url: string,
  apiKey: string,
  init: RequestInit,
): Promise<ApiObject> {
  const response = await fetch(url, init);
  if (!response.ok) {
    throw new Error(`Document parsing failed (${response.status}): ${await response.text()}`);
  }
  const value: unknown = await response.json();
  if (!value || typeof value !== "object") throw new Error("Document parser returned an invalid response");
  return value as ApiObject;
}

function urlFromMap(value: unknown, filename?: string): string {
  if (!value || typeof value !== "object") throw new Error("Document parser did not return a file URL");
  const entries = Object.entries(value as ApiObject);
  const selected = entries.find(([name]) => !filename || name === filename)?.[1] ?? entries[0]?.[1];
  if (typeof selected === "string") return selected;
  if (selected && typeof selected === "object") {
    const candidate = selected as ApiObject;
    const url = candidate.file_url ?? candidate.upload_url ?? candidate.url;
    if (typeof url === "string") return url;
  }
  throw new Error("Document parser did not return a usable file URL");
}

function prepareUpload(file: File, bytes: Uint8Array): { name: string; bytes: Uint8Array; type: string } {
  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    return { name: /\.pdf$/i.test(file.name) ? file.name : `${file.name}.pdf`, bytes, type: "application/pdf" };
  }
  const extension = file.type === "image/png" ? "png" : "jpg";
  const imageName = file.name.match(/\.(png|jpe?g)$/i) ? file.name : `scan.${extension}`;
  return {
    name: `${file.name.replace(/\.[^.]+$/, "") || "scan"}.zip`,
    bytes: zipSync({ [imageName]: bytes }),
    type: "application/zip",
  };
}

async function waitForCompletion(jobId: string, apiKey: string): Promise<void> {
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    const status = await apiJson(`${BASE_URL}/${jobId}/status`, apiKey, {
      headers: headers(apiKey),
    });
    const state = String(status.job_state ?? "");
    if (TERMINAL_STATES.has(state)) {
      if (state === "Failed") throw new Error(String(status.error_message || "Document parsing failed"));
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 1_500));
  }
  throw new Error("Document parsing timed out");
}

function extractedText(bytes: Uint8Array, contentType: string): string {
  if (!contentType.includes("zip")) return strFromU8(bytes);
  const files = unzipSync(bytes);
  const preferred = Object.entries(files).filter(([name]) => /\.(md|html|json|txt)$/i.test(name));
  return preferred
    .map(([name, content]) => `\n${name}\n${strFromU8(content)}`)
    .join("\n")
    .replace(/<[^>]+>/g, " ")
    .slice(0, 500_000);
}

export async function digitizeDocument(
  file: File,
  apiKey: string,
  language: string,
): Promise<string> {
  const originalBytes = new Uint8Array(await file.arrayBuffer());
  const upload = prepareUpload(file, originalBytes);
  const created = await apiJson(BASE_URL, apiKey, {
    method: "POST",
    headers: headers(apiKey),
    body: JSON.stringify({
      job_parameters: {
        language,
        output_format: "md",
      },
    }),
  });
  const jobId = String(created.job_id ?? "");
  if (!jobId) throw new Error("Document parser did not create a job");

  const links = await apiJson(`${BASE_URL}/upload-files`, apiKey, {
    method: "POST",
    headers: headers(apiKey),
    body: JSON.stringify({ job_id: jobId, files: [upload.name] }),
  });
  const uploadUrl = urlFromMap(links.upload_urls, upload.name);
  const uploaded = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": upload.type },
    body: Uint8Array.from(upload.bytes).buffer,
  });
  if (!uploaded.ok) throw new Error(`Document upload failed (${uploaded.status})`);

  await apiJson(`${BASE_URL}/${jobId}/start`, apiKey, {
    method: "POST",
    headers: headers(apiKey),
    body: "{}",
  });
  await waitForCompletion(jobId, apiKey);

  const downloads = await apiJson(`${BASE_URL}/${jobId}/download-files`, apiKey, {
    method: "POST",
    headers: headers(apiKey),
    body: "{}",
  });
  const downloadUrl = urlFromMap(downloads.download_urls);
  const output = await fetch(downloadUrl);
  if (!output.ok) throw new Error(`Document output download failed (${output.status})`);
  return extractedText(
    new Uint8Array(await output.arrayBuffer()),
    output.headers.get("content-type") ?? "application/zip",
  );
}
