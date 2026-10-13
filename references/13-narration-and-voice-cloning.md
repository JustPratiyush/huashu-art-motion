# 13 · Narration and voice cloning

The unified entry point and configuration are in the [optional voice guide](capabilities.md); interface details are in the [narration API](narration-api.md).

Existing recordings are used first; when new voiceover is needed, choose a system voice or a bound cloned voice according to the user's configuration. `scripts/koubo.py say/train/voices` keeps the legacy entry points and shares the same configuration, stored outside the install directory, with `scripts/capabilities.py`.

Each say generates only one take, without automatically running three candidates or ASR. Pickup recordings keep `--fit/--match`; afterwards you still have to verify the lines, proper names, seams and subtitles. The specific model, speaking rate, voice and authorization are not hard-coded in this document.
