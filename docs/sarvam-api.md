# Sarvam API reference

> Verified against `docs.sarvam.ai` on 26 July 2026. These are the only three
> endpoints v0.1 uses. Copy the shapes from here rather than guessing — a wrong
> header name costs 20 minutes of build time.

Base URL: `https://api.sarvam.ai`
Key: `SARVAM_API_KEY` in `.env` (format `sk_…`).

## Auth

Two different header conventions, depending on the endpoint. This trips people up.

| Endpoint | Header |
|---|---|
| `/speech-to-text` | `api-subscription-key: sk_…` |
| `/text-to-speech` | `api-subscription-key: sk_…` |
| `/v1/chat/completions` | `Authorization: Bearer sk_…` |

The chat endpoint is OpenAI-shaped; the speech endpoints are Sarvam-native.

## Streaming speech-to-text

Iteration 1 uses `client.speechToTextStreaming.connect()` from the official
`sarvamai` TypeScript SDK. The browser captures mono audio in an AudioWorklet,
resamples it to 16 kHz, encodes PCM16, and sends binary chunks to Bun. Bun alone
opens the Sarvam socket, pinned to `kn-IN`, `hi-IN`, or `en-IN`.

## Streaming speech-to-text (what the interview actually uses)

`client.speechToTextStreaming.connect(...)`. Two separate places declare the
audio format, and they do **not** take the same vocabulary:

| Where | Field | Value | Note |
|---|---|---|---|
| `connect()` | `input_audio_codec` | `pcm_s16le` | the real codec |
| `connect()` | `sample_rate` | `"16000"` | string here |
| `transcribe()` per frame | `encoding` | **`audio/wav`** | the only accepted value |
| `transcribe()` per frame | `sample_rate` | `16000` | number here |

`encoding: "audio/wav"` is a declared container, not an instruction to prepend a
RIFF header. The frames stay raw PCM16 — `input_audio_codec` is what actually
describes them. Sending the truthful-looking `pcm_s16le` fails Pydantic
validation server-side, and **Sarvam then closes the socket with code 1000**.

> A clean 1000 close looks exactly like an idle timeout. The only thing that
> distinguishes them is the in-band `{"type":"error"}` message Sarvam sends
> first — so the message handler must surface `type: "error"`, not just
> `type: "data"`. Filtering it out turns every protocol error into a phantom
> "connection keeps dropping".

Also worth knowing:

- The streaming socket has **no `mode` param**. `codemix` / `translate` /
  `verbatim` are REST-only, and `model` types as `saaras:v2.5` alone.
- `vad_signals: "true"` yields `START_SPEECH` / `END_SPEECH` events, and a
  transcript arrives on VAD segmentation without an explicit `flush()`.
- One socket survives `flush()` and serves an entire interview — it does not
  need reopening per utterance.
- Measured on a 2.9 s clip: `START_SPEECH` 373 ms, `END_SPEECH` 1619 ms,
  transcript 1830 ms.
- Bun needs `socket.socket.binaryType = "arraybuffer"`; the SDK defaults to the
  browser's `blob`, which Bun's WebSocket rejects.

## REST speech-to-text (fallback reference)

```
POST https://api.sarvam.ai/speech-to-text
Content-Type: multipart/form-data
api-subscription-key: sk_…
```

| Field | Value for virasat |
|---|---|
| `file` | wav/mp3/webm/ogg/flac/m4a — **under 30 seconds** for the REST endpoint |
| `model` | `saaras:v3` (default; 23 languages) |
| `mode` | `codemix` — people mix Kannada and English when talking about banks and forms. `transcribe` is the alternative. |
| `language_code` | `unknown` for auto-detect, or `kn-IN` / `en-IN` to pin it |

Response:

```json
{
  "request_id": "…",
  "transcript": "…",
  "language_code": "kn-IN",
  "language_probability": 0.97,
  "timestamps": { "words": [], "start_time_seconds": [], "end_time_seconds": [] }
}
```

Use `language_probability` as the low-confidence trigger for the re-ask path in
[architecture.md](architecture.md#failure-posture). Longer audio needs the Batch
API — out of scope; push-to-talk clips stay well under 30 s.

## Text-to-speech

```
POST https://api.sarvam.ai/text-to-speech
Content-Type: application/json
api-subscription-key: sk_…
```

```json
{
  "text": "…",
  "target_language_code": "kn-IN",
  "model": "bulbul:v3",
  "speaker": "shubh",
  "pace": 0.9
}
```

| Param | Range | Note |
|---|---|---|
| `text` | ≤ 2500 chars (v3) | Questions are one sentence; nowhere near the limit. |
| `target_language_code` | `kn-IN`, `en-IN`, … | Mirror the language STT detected. |
| `model` | `bulbul:v3` / `bulbul:v2` | v3. |
| `speaker` | default `shubh` (v3) | Pick one calm voice and keep it. |
| `pace` | 0.5–2.0 (v3) | Slightly slow — `0.9`. The listener is distressed and hearing form numbers. |
| `temperature` | 0.01–2.0 (v3 only) | Leave default; expressiveness is wrong for this context. |
| `output_audio_codec` | mp3, wav, opus, … | `wav` for the terminal loop, `mp3` for the browser. |

Response: `{ "request_id": "…", "audios": ["<base64>"] }` — **base64 strings, one
per chunk**. Decode and concatenate before playing.

Note: `pitch` is v2-only. Setting it on v3 does nothing.

Iteration 1 uses the SDK's typed `client.textToSpeech.convertStream()` with
`bulbul:v3` and relays MP3 chunks over the existing browser↔Bun WebSocket. In
`sarvamai@1.1.7`, the separate TTS WebSocket connect type accepts only
`bulbul:v2`; Virasat does not cast around that limitation.

## Chat completions

```
POST https://api.sarvam.ai/v1/chat/completions
Content-Type: application/json
Authorization: Bearer sk_…
```

| Model | Context | Use |
|---|---|---|
| `sarvam-30b` | 64K | Answer extraction — it is a classification task, speed wins |
| `sarvam-105b` | 128K | Reserve for phrasing if 30b sounds stiff |

OpenAI-compatible body. The parameter that matters most here:

```json
{
  "model": "sarvam-30b",
  "messages": [{ "role": "system", "content": "…" }],
  "temperature": 0.1,
  "response_format": {
    "type": "json_schema",
    "json_schema": { "…": "question-specific typed answer shape" }
  }
}
```

**Always use `response_format: json_schema` for answer extraction.** Routing
questions return one of a fixed set of enum values. The few label-only questions
(bank name and nominee name) return bounded short text that is never used to
decide entitlement. This is what enforces the deterministic boundary in
[architecture.md](architecture.md#the-one-architectural-boundary-that-matters) —
the model classifies what was said, it does not decide what is owed.

Other params: `top_p`, `max_tokens` (default 2048), `stream`, `reasoning_effort`
(`low` | `medium` | `high`), `tools`.

SDK note: `sarvamai@1.1.7` exposes `client.chat.completions(request)`, but its
request declaration omits `response_format`. Virasat uses a narrow request-type
intersection; the SDK serializes the complete object and sends the JSON schema.

## Not used in v0.1

Available, deliberately skipped — see [architecture.md](architecture.md#deliberately-not-built).

- **Document Intelligence** (PDF/image extraction, ≤50 MB) — would be the path
  to reading an actual passbook or policy document. Iteration 4+.
- **Translation / transliteration** (Mayura, Sarvam-Translate) — not needed;
  STT and TTS each handle their own language directly.
- **Voice agent integrations** (Twilio, Exotel, LiveKit, Pipecat) — streaming
  telephony. The stated reason for push-to-talk is that this is a multi-hour
  setup with no rubric payoff today.
- **Batch STT** — only needed for audio over 30 seconds.
