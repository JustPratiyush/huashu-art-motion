# Volcengine Doubao Voice Cloning 2.0 · interface details and test notes

The historical interface notes are from 2026-09-13, with the query section updated 2026-09-18; new users should configure via capabilities.md first, and service limits are whatever the actual response says at call time. Official docs: the "Doubao Speech" library in the Volcengine documentation center (LibraryID 6561).

## Authentication

Old console (APP ID + Access Token):

```
X-Api-App-Id:      {APPID}
X-Api-Access-Key:  {Access Token}
X-Api-Resource-Id: volc.megatts.voiceclone   # training / query
                   seed-icl-2.0              # synthesis
X-Api-Request-Id:  {uuid}
Content-Type:      application/json
```

The new console uses `X-Api-Key` instead (from API Key management). The old one is officially being phased out.

## Three endpoints

| Use | Path |
|---|---|
| Train a voice | `POST /api/v3/tts/voice_clone` |
| Query status | `POST /api/v3/tts/get_voice` |
| Synthesize | `POST /api/v3/tts/unidirectional` (HTTP chunked streaming) |

The host is always `https://openspeech.bytedance.com`.

### Training

```json
{
  "speaker_id": "S_xxxxxxxx",
  "audio": { "data": "<base64>", "format": "wav" },
  "source": 2,
  "language": 0,
  "model_type": 5
}
```

- **Only `model_type: 5` is Clone 2.0.** Omitting it or passing another value trains 1.0.
- **The request body has a single `audio` object, not an `audios` array.** The v1 interface used an array; v3 changed it;
  passing an array returns `45000000 add unmapped key audios`.
- Optional: `text` (the text matching the reference audio; the server does a WER check and returns `45001109` if it differs too much),
  `enable_audio_denoise` (denoising, at a cost to similarity),
  `disable_volume_normalization` (turns off volume normalization so synthesized volume tracks the reference audio more closely).
- The returned `status`: 0 NotFound / 1 Training / 2 Success / 3 Failed / 4 Active.
  **Both 2 and 4 can be synthesized directly.**
- `speaker_status` in the response is an array containing both the 1.0 and 2.0 versions;
  the entry with `model_type: 5` is 2.0, and each carries a `demo_audio` preview link valid for one hour.

### Query (tested 2026-09-18)

The v3 `get_voice` request body uses the singular `{"speaker_id":"S_xxxxxxxx"}`, not a `speaker_ids` array. Query multiple slots one by one; HTTP errors must be reported explicitly and never treated as "the voice doesn't exist". `koubo.py voices` has been fixed accordingly.

### Synthesis

```json
{
  "user": { "uid": "koubo" },
  "req_params": {
    "text": "...",
    "speaker": "S_xxxxxxxx",
    "model": "seed-tts-2.0-expressive",
    "tone_fidelity": true,
    "audio_params": { "format": "wav", "sample_rate": 48000, "speech_rate": -20 }
  }
}
```

The response is streamed, one JSON per line, with the audio in base64 chunks in the `data` field; concatenated they make the complete file.

## Two counterintuitive parameter locations

1. **`speech_rate` must go inside `audio_params`.** Placed at the top level of `req_params` it is **silently ignored** —
   no error, a 200 response, normal audio, but the speaking rate doesn't budge.
   Measured: `audio_params.speech_rate = -50` turned the same sentence from 10.36s into 21.53s (exactly 2×).
   Range `[-50, 100]`, default 0, 100 = 2.0× speed, -50 = 0.5× speed, linear.
   `speed_ratio` is also silently ignored (wherever it's placed) — that's a parameter name from another product line.

2. **`tone_fidelity` goes at the top level of `req_params`**, not in `audio_params`. It only takes effect for 2.0 voices.

## Sample rate

`sample_rate` supports `[8000, 16000, 22050, 24000, 32000, 44100, 48000]`, **and the default is only 24000**.
When pasting back into a 48k edit project, you must pass 48000 explicitly, otherwise it sounds muffled.
`ogg_opus` only supports 48000. For streaming, the official recommendation is pcm rather than wav.

## Other limits

- The **10MB limit on reference audio applies to the raw file, not after base64** (measured: a 9.16MB wav passes).
  Supports wav / mp3 / ogg / m4a / aac / pcm; pcm only at 24k mono.
- Keep synthesis text under about 300 characters per call (about 60 seconds of audio); split long texts yourself and join them.
- Each voice slot has 15 training attempts and can be retrained and overwritten repeatedly.
- The "voice upgrade" endpoint (`/api/v3/tts/upgrade_voice`) only migrates V1→V3;
  **it can't add reference audio to an existing voice**. To change the reference audio, retrain the same slot.

## Common error codes

| Code | Meaning | What to do |
|---|---|---|
| `45000000` | Wrong request body field | Look at the unmapped key in the message |
| `45001122` | `no speaker detected` | No voice in the reference audio. Check the average level first; below -36dB it's basically noise floor |
| `45001109` | `WERError` | The `text` passed doesn't match the audio; remove text or correct it |
| `45000030` | `resource not granted` | The service for this Resource-Id isn't activated |

## Network

`openspeech.bytedance.com` is a mainland-China endpoint. If the machine has a socks proxy on,
**passing `proxies=None` to requests is not enough to bypass it** — it still reads `ALL_PROXY` from the environment,
showing up as intermittent `SSL: UNEXPECTED_EOF_WHILE_READING`.
Affected environments can set `bindings.volcengine.trust_env=false`; the default follows the environment proxy and doesn't force a bypass on every user.

## On "how long the reference audio should be"

In past listening comparisons, a longer clean narration reference sounded more like the original voice than thirty seconds did. That's experience with a single voice, not a universal default for all voices; go by test listening to the user's own samples and the current service limits.

I ran one duration-gradient test (nested samples of 15/30/60/120/200/400 seconds, 3 syntheses per tier),
comparing median fundamental frequency and spectral centroid against the real voice; the differences between tiers (1.7%~8.5%) and the
standard deviation among the three runs in the same tier (1.7~9.5) were of the same magnitude, so **these two metrics can't tell them apart**.

But that's no refutation — these two metrics only cover the pitch and brightness of the timbre,
**and say nothing about prosody, pauses, breaths or tone**, which are exactly the main components of "does it sound like the person".
A metric failing to show a difference doesn't mean there's no difference. Trust your ears.
