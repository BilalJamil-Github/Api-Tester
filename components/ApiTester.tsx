"use client";
import { useState } from "react";
import axios from "axios";

const TABS = [
  { id: "params", label: "Params" },
  { id: "auth", label: "Authorization" },
  { id: "headers", label: "Headers" },
  { id: "body", label: "Body" },
];


const box =
  "w-full rounded-lg border border-[#222c27] bg-[#0d1210] px-3 py-2 font-mono text-sm text-[#e3ece7] outline-none placeholder:text-[#5d6d65] focus:border-[#5eead4]";

const cell =
  "w-full bg-transparent px-3 py-2 font-mono text-sm text-[#e3ece7] outline-none placeholder:text-[#5d6d65] focus:bg-[#0d1210]";

function parseHeaders(text: string): Record<string, string> {
  const trimmed = text.trim();
  if (!trimmed) return {};
  if (trimmed.startsWith("{")) return JSON.parse(trimmed);
  const result: Record<string, string> = {};
  trimmed.split("\n").forEach((line) => {
    const index = line.indexOf(":");
    if (index > 0) {
      const key = line.slice(0, index).trim();
      const value = line.slice(index + 1).trim();
      if (key) result[key] = value;
    }
  });
  return result;
}

export default function ApiTester() {
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("");
  const [tab, setTab] = useState("params");
  const [headersText, setHeadersText] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [authType, setAuthType] = useState("none");
  const [token, setToken] = useState("");
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  type Row = { id: number; key: string; value: string };
  const [rows, setRows] = useState<Row[]>([
  { id: 0, key: "", value: "" },
  { id: 1, key: "", value: "" },
  { id: 2, key: "", value: "" },
     ]);
   const [nextId, setNextId] = useState(3);

const addRow = () => {
  setRows([...rows, { id: nextId, key: "", value: "" }]);
  setNextId(nextId + 1);
};

const deleteRow = (id: number) => {
  setRows(rows.filter((r) => r.id !== id));
};

const updateRow = (id: number, field: "key" | "value", val: string) => {
  setRows(rows.map((r) => (r.id === id ? { ...r, [field]: val } : r)));
};
  async function handleSend() {
    if (loading) return;

    if (!url.trim()) {
      setResponse({
        status: "Error",
        statusText: "URL is required",
        data: { error: "Please enter a destination API URL." },
      });
      return;
    }

    const startTime = performance.now();
    setLoading(true);

    try {
      const finalHeaders: Record<string, string> = {
        "Content-Type": "application/json",
        ...parseHeaders(headersText),
      };


    const query = new URLSearchParams(
  rows
    .filter((r) => r.key.trim())
    .map((r): [string, string] => [r.key.trim(), r.value])
).toString();


      if (authType === "bearer" && token.trim()) {
        finalHeaders.Authorization = `Bearer ${token.trim()}`;
        console.log(finalHeaders)
      }

        let baseURL = url.trim();
        const finalURL = query
      ? `${baseURL}${baseURL.includes("?") ? "&" : "?"}${query}`
      : baseURL; 

        console.log("Dekho " , {
        method,
        url: finalURL,
        headersText: finalHeaders,
        bodyText: method === "GET" ? "" : bodyText,
      })

      const res = await axios.post("/api/proxy", {
        method,
        url: finalURL,
        headersText: finalHeaders,
        bodyText: method === "GET" ? "" : bodyText,
      });

      setResponse({
        status: res.status,
        statusText: res.statusText,
        data: res.data,
      });
    } catch (err: any) {
      const res = err.response;
      setResponse({
        status: res?.status ?? "Error",
        statusText: res?.statusText ?? err.message,
        data: res?.data ?? {
          error: err.message,
          message: "Request failed. Check URL, headers, body and server.",
        },
      });
    } finally {
      setResponseTime(Math.round(performance.now() - startTime));
      setLoading(false);
    }
  }

  const statusOk =
    typeof response?.status === "number" && response.status < 400;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 p-4 text-[#e3ece7]">
      <div className="flex gap-2">
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="rounded-lg border border-[#2a3630] bg-[#161e1a] px-3 py-2 text-white outline-none"
        >
          <option>GET</option>
          <option>POST</option>
          <option>PUT</option>
          <option>DELETE</option>
        </select>

        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://api.example.com/users"
          className="flex-1 rounded-lg border border-[#2a3630] bg-[#161e1a] px-3 py-2 outline-none placeholder:text-[#5d6d65]"
        />

        <button
          onClick={handleSend}
          disabled={loading}
          className="rounded-lg bg-[#5eead4] px-5 py-2 font-semibold text-black hover:bg-[#4dd2be] transition-colors disabled:opacity-60"
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </div>

      <div className="rounded-xl border border-[#222c27] bg-[#131a17]">
        <div className="flex gap-5 border-b border-[#222c27] px-4">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={
                tab === t.id
                  ? "border-b-2 border-[#5eead4] py-3 text-sm text-[#5eead4]"
                  : "border-b-2 border-transparent py-3 text-sm text-[#8a9a92] hover:text-[#e3ece7]"
              }
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-4">
          {tab === "params" && (
            <div className="space-y-3">
              <div className="overflow-hidden rounded-lg border border-[#222c27]">
                <div className="grid grid-cols-[1fr_1fr_40px] bg-[#0d1210] text-[11px] tracking-wider text-[#7d8d85]">
                  <div className="px-3 py-2">KEY</div>
                  <div className="border-l border-[#222c27] px-3 py-2">VALUE</div>
                  <div />
                </div>

         
               {rows.map((r) => (
  <div
    key={r.id}
    className="grid grid-cols-[1fr_1fr_40px] border-t border-[#222c27]"
  >
    <input
      value={r.key}
      onChange={(e) => updateRow(r.id, "key", e.target.value)}
      placeholder="key"
      aria-label="Key"
      className={cell}
    />
    <input
      value={r.value}
      onChange={(e) => updateRow(r.id, "value", e.target.value)}
      placeholder="value"
      aria-label="Value"
      className={`${cell} border-l border-[#222c27]`}
    />
    <button
      aria-label="Delete row"
      onClick={() => deleteRow(r.id)}
      className="border-l border-[#222c27] text-[#7d8d85] hover:text-red-400 flex items-center justify-center text-lg"
    >
      &times;
    </button>
  </div>
))}
              </div>
              <button
                onClick={addRow}
                className="text-sm text-[#5eead4] hover:underline"
              >
                + Add row
              </button>
            </div>
          )}

          {tab === "auth" && (
            <div className="space-y-3">
              <select
                value={authType}
                onChange={(e) => setAuthType(e.target.value)}
                aria-label="Auth type"
                className={`${box} sm:w-56 bg-[#161e1a]`}
              >
                <option value="none">No Auth</option>
                <option value="bearer">Bearer Token</option>
              </select>
              {authType === "bearer" && (
                <input
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="eyJhbGciOi..."
                  aria-label="Bearer token"
                  className={box}
                />
              )}
            </div>
          )}

          {tab === "headers" && (
            <textarea
              value={headersText}
              onChange={(e) => setHeadersText(e.target.value)}
              placeholder={"Accept: application/json\nContent-Type: application/json"}
              className={`${box} h-32 resize-none`}
            />
          )}

          {tab === "body" && (
            <div className="space-y-2">
              <div className="text-xs text-[#7d8d85]">raw &middot; JSON</div>
              <textarea
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                placeholder={'{\n  "name": "hello"\n}'}
                className={`${box} h-40 resize-none`}
              />
            </div>
          )}
        </div>
      </div>

      {response && (
        <div className="rounded-xl border border-[#222c27] bg-[#131a17] p-4 space-y-3">
          <div className="flex gap-4 text-sm">
            <span className={statusOk ? "text-[#5eead4]" : "text-red-400"}>
              {response.status} {response.statusText}
            </span>
            {responseTime !== null && (
              <span className="text-[#8a9a92]">{responseTime} ms</span>
            )}
          </div>
          <pre className="max-h-96 overflow-auto rounded-lg bg-[#0d1210] p-3 font-mono text-xs text-[#e3ece7]">
            {JSON.stringify(response.data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}