# Compatibility and validation scope

Validation date: 2026-10-08. The following distinguishes installation/configuration, live host execution, and actual media generation, without letting a pass at one level stand in for another.

## Installation and configuration upgrades

In an isolated Git workspace, the official skills CLI actually ran `skills add <local release package> --skill huashu-art-motion --agent <host> --yes --copy`, installing each target twice in a row. All three targets — claude-code, codex and kimi-code-cli — succeeded, and the media.json outside the install directory stayed byte-for-byte unchanged. What's validated here is preference retention after an overwriting reinstall; it doesn't claim to fully simulate every historical version or every installer's update implementation.

Old voice configuration merges with new default fields without being rewritten; the new image capability remains unchosen and unauthorized. The CLI in Codex's installed copy read the original system preference and revision, without reverting to the public default.

## Live host runs

- Codex CLI 0.160.1: a real session loaded the installed skill and guides, and ran the unconfigured state, generation disabled, no tools, importing an existing image, and saving a private system preference; the output image was byte-for-byte identical to the source, and configuration sources were as expected.
- Claude Code 2.1.287: installation and the local CLI work; the live session returned 429 due to the test environment's weekly quota, so the model execution regression wasn't completed. It can't be marked as passing live on this basis, nor can it be judged incompatible.
- Kimi Code CLI 0.38.0: installation and the local CLI work; the live session returned 403 due to the test account's access permissions, so the model execution regression wasn't completed. In this version non-interactive `--prompt` can't be combined with `--auto` or `--yolo`; after correcting the retry command it was still an account 403.

These sessions used isolated workspaces and media configuration, reusing the machine's existing logins; they weren't three brand-new accounts. Once Claude/Kimi account conditions recover, the live cases still need to be rerun. Tool capabilities depend on the actual session; you can't infer from a host's name that it definitely has image generation.

## Actual media and automated tests

macOS system voices and Volcengine cloning have completed real short-sentence generation; the current Codex session actually called its built-in image generation, producing a 1536×1024 PNG with transparent pixels, and passed plan → tool call → receipt → project copy and SHA acceptance. The image tool call was made by the agent; the CLI didn't make it on its behalf. This test only proves the integration path and file properties; it doesn't replace judgment of artistic quality.

Automated tests cover configuration merging, permission tightening, concurrent writes, old PCM output, incomplete voice streams, image feature/cost selection, cross-session plans, configuration revocation, concurrent image replacement and release object checks. CI runs on Linux; real system voices are validated only on macOS, and system voice backends for Windows/Linux are not yet implemented.

## Minimal reproducible checks

```sh
python scripts/capabilities.py status --config <an empty JSON file> --explain
python scripts/capabilities.py image-status --config <JSON forbidding image generation> --mode generate
python scripts/capabilities.py use-image --file <an existing PNG> --out <project>/images/new_file.png
python -m unittest discover -s tests -v
```

Actual image tool validation follows images.md, forming a snapshot from the current tool schema; with no tools it explicitly returns unavailable, and a fictional tool can't be used to fake success. CI without credentials or authorization never calls paid media services.
