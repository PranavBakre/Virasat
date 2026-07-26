# OpenAI provider

The OpenAI path sits alongside Sarvam behind the voice-provider selector. The
selected provider owns all three language operations for the next turn:
transcription, one-field extraction, and speech. It never owns claim derivation.

## Server configuration

```bash
OPENAI_API_KEY=sk-proj-…
VOICE_PROVIDER=openai

# Optional overrides
OPENAI_TRANSCRIBE_MODEL=gpt-4o-transcribe
OPENAI_EXTRACTION_MODEL=gpt-5.6-luna
OPENAI_TTS_MODEL=gpt-4o-mini-tts
```

Only the Bun server reads the key. The browser sends PCM16 audio to Virasat's
existing WebSocket and never receives provider credentials.

## Operations

| Task | API | Default | Virasat behavior |
|---|---|---|---|
| Speech to text | `POST /v1/audio/transcriptions` | `gpt-4o-transcribe` | Wrap the short 16 kHz mono PCM clip in a WAV container and transcribe on release |
| Answer extraction | `POST /v1/responses` | `gpt-5.6-luna` | Strict JSON Schema; one pending field only; reasoning effort `none` |
| Text to speech | `POST /v1/audio/speech` | `gpt-4o-mini-tts` | Stream MP3 chunks using the authored question text |

The extraction model is the latency/cost-oriented family tier because this is a
small classification task. It returns only `{"value": ...}` and cannot add a
claim, document, form, or legal rule.

Current references:

- [Speech to text](https://developers.openai.com/api/docs/guides/speech-to-text)
- [Text to speech](https://developers.openai.com/api/docs/guides/text-to-speech)
- [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs)

## Failure posture

Missing keys disable only that provider's microphone path. API errors leave
typed answers and the deterministic claims engine available. A provider switch
does not reset the profile or reorder the claims register.
