# Optional voice: configuring, skipping, and existing assets

This page covers optional voice: existing audio, macOS system voices, and Volcengine voice cloning. For the image channel, see the [image capability guide](images.md). Configuration shares one external file; no services or plugins are installed.

## Before use

Check only when the task needs voice; silent animations go straight into the picture workflow. If the user has already provided a suitable audio track, use it unless they explicitly ask for new voiceover. Audio-only tasks don't need to start animation design or review.

`S` stands for the skill directory actually read this time; it isn't fixed to the author's machine or any agent-specific directory. Claude Code, Codex and Kimi all call the same CLI, with no dependence on agent-specific hooks.

```sh
python "$S/scripts/capabilities.py" status --explain
# Add --project only when you need to read a trusted project's preferences
python "$S/scripts/capabilities.py" status --project <project> --explain
```

The check only reads this tool's configuration, the specified credential sources of the selected adapter, and necessary local dependencies; it doesn't verify over the network. `configured_unverified` means the conditions to call are met, but you can't say the account or voice quality has been verified; only `needs_configuration` requires choosing a voice option, and `prompt:false` means the user once chose to configure manually, so don't ask again proactively. Success of an actual request is judged by the output and the receipt.

When configuration is missing the first time, ask only about the one thing needed this time: use the recording, a system voice, your own clone, or skip. If the user has already specified, carry out their choice directly; when a new cloud call / payment / training is involved, use the authorization already given for this time, and if there's none, explain what's missing. Never ask the user to paste a key into the chat.

## Scope of saving, and skipping

An ordinary choice applies only to this time; only when the user says "from now on / by default / remember" is it saved as the user default. Ordinary configuration lives outside the install directory: on macOS/Linux `$XDG_CONFIG_HOME/huashu/media.json` (or `~/.config/huashu/media.json` if unset), on Windows `%APPDATA%/huashu/media.json`. `HUASHU_CONFIG_HOME` can override the directory; `--config` replaces the default user file.

After collecting choices, the agent generates non-sensitive JSON and hands it to the script to write; the script never blocks waiting on stdin interaction.

```sh
# Example JSON: {"preferences":{"voice":{"mode":"system"}}}
python "$S/scripts/capabilities.py" configure --scope user --input <choice.json>
python "$S/scripts/capabilities.py" skip --scope task  # not saved, skip this time
python "$S/scripts/capabilities.py" skip --scope user  # enable manually later, don't keep asking
python "$S/scripts/capabilities.py" reset --field preferences.voice
python "$S/scripts/capabilities.py" reset --field onboarding.voice
```

"Skip this time" is recorded in this task's state; the next action must not reopen the questionnaire. No answer is not consent, and configure is not run. When a batch run is missing required configuration it exits non-zero with the reason; only if the user accepts a basic preview can a silent preview be delivered, and it can't be called a complete narrated film.

Preference order: this call's parameters → project preferences → user preferences → public defaults. A project's `<project>/.huashu/media.json` accepts only limited preferences and `deny` policies; it can't hold credentials or private voice bindings, or grant permissions. `status --explain` shows where each field comes from; writes take a cross-process lock, and `--expected-revision` prevents a whole-file edit based on an old configuration from overwriting a newer one.

## Three voice paths

```sh
# 1. Reuse existing audio, preserved byte for byte with metadata generated; if no copy is needed, reference the original track directly
python "$S/scripts/capabilities.py" use-audio --audio original_recording.wav --out <project>/audio/voiceover.wav
# 2. System voice: macOS only, fixed 48kHz WAV; for Chinese text it defaults to an installed Mandarin voice
python "$S/scripts/capabilities.py" say "the text to read" --mode system --out <project>/audio/voiceover.wav
# 3. A configured and authorized Volcengine clone
python "$S/scripts/capabilities.py" say "the text to read" --mode clone --out <project>/audio/voiceover.wav
# The legacy call stays compatible and shares the same configuration
python "$S/scripts/koubo.py" say "the confirmed pickup line" --out <project>/audio/pickup.wav \
  --fit 3.5 --match original_track.wav --match-ss 10 --match-t 3.5
```

Existing outputs are never overwritten. On success an adjacent `<audio file>.json` is written, recording duration, sample rate, SHA and source; clones record the requested model, never claiming it as the actual model reported by the server. Raw PCM is first accepted as container audio before being exported as s16le, with sample rate and mono format written into the sidecar. System voices don't support applying Volcengine's model and speaking-rate parameters.

The public default is "no voice option chosen", not the author's voice. The suggested Volcengine defaults are expressive, fidelity mode, speaking rate 0; users can adjust them in `provider_options.volcengine`. Private configuration can keep a different speaking rate and voice. Full fields are in `schemas/media.schema.json`; don't guess fields.

Existing platform voices don't need retraining:

```sh
python "$S/scripts/capabilities.py" bind --name narrator --speaker-id S_xxx --default
```

bind only registers a local alias; it doesn't call the platform, doesn't change the existing `~/.koubo/voices.json`, and doesn't turn on cloud calls automatically. `--default` only changes the default reference; generation still needs clone selected.

## Volcengine configuration and authorization

Credentials are read from process environment variables; you can also point the private `bindings.volcengine.env_file` at an existing file, or use `KOUBO_ENV` temporarily. Environment variables take precedence; .env files in the current directory, home directory or the author's workspace are never scanned automatically. The configuration stores variable names / file references, not key values.

Enabling cloud cloning requires: `preferences.voice.mode=clone`, a resolvable voice, and both `policy.cloud` and `policy.paid_api` set to allow, or explicit authorization from the user for this time. `--allow-cloud` and `--allow-paid-api` only express authorization already given for this time; they aren't a way for the tool to get around the rules, and they can't override deny. When users change their own prohibitions, change the corresponding configuration explicitly first; host/organization restrictions still apply. A project can only tighten, never authorize.

Network proxying is controlled by the private `bindings.volcengine.trust_env`, and the public default follows the environment; don't impose one machine's proxy-failure experience on every installer. Basic configuration / existing audio need only the Python standard library; audio acceptance needs ffprobe, system voices and fitting need ffmpeg, and Volcengine additionally needs requests. Missing dependencies are reported, never installed automatically.

Training is a separate operation, requiring an explicit voice slot and authorization for this training; `--force` only skips the low-level check, not authorization. Only passing `--default` makes the training result the registry default.

```sh
python "$S/scripts/koubo.py" train --audio my_recording.wav --speaker S_xxx --name "My voice" \
  --allow-cloud --allow-paid-api --allow-voice-training
```

Training changes the remote voice. The authorization flags in the example may only be used after the user has actually agreed; don't treat it as a routine prerequisite for synthesis.

## Acceptance and failure

Fitting keeps the original coarse adjustment + atempo, generating at most 3 times; each attempt may be billed. If the final difference exceeds ±0.05 seconds it returns a failure and keeps the `.unfitted` candidate, never claiming the duration passes. Synthesis must receive the server's final success message; near-empty, silent or error responses don't commit a final output. A network timeout may have been accepted by the server, so the result is marked uncertain and the request isn't blindly repeated.

Production films still need a word-by-word listen-back and test listening for proper names; the CLI doesn't automatically do three-candidate selection or ASR. Pickups should check seams, subtitles and the picture timeline; if you're already using video-pipeline, hook into its paste-back and subtitle workflow, and independent users can use their own edit project.

## Maintenance and evolution

Source: 2026-10-08, implementation of P0/P1 capability configuration. Before use, read this page and the related API experience; reproducible interface failures get a test first, then the code fix. Public parameter rules go on this page or in `narration-api.md`, with date and scope; personal listening choices go into private configuration / private feedback and can't become public hard requirements. Correcting an old conclusion means editing the original text; upgrading configuration must not clear preferences or automatically enable new capabilities.
