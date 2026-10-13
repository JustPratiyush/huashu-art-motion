# Maintenance and extension

Public code and public recommendations live in the package; personal platforms, voices and credential references are stored outside the install directory. Don't turn personal experience into default authorization for everyone.

## Local checks

```sh
python -m pip install requests Pillow
# ffmpeg/ffprobe must also be installed on the system; they are not installed automatically when the skill is activated
python -m unittest discover -s tests -v
```

Unit tests don't call real voice / image-generation services. Real host acceptance is in the [compatibility notes](references/compatibility.md). A new adapter must state clearly: configuration, probing, request and output contracts, and failure behavior; you can't claim compatibility with another platform just by swapping base_url.

## Image tool bridging

Read the [image guide](references/images.md). The host provides the actual tool declarations, the agent makes the calls, and the CLI generates the plan and accepts the output. A receipt is not platform-signed proof of origin. Existing images, generation disabled, no tools, unknown billing, reference-image permissions and generation failures all need coverage.

A standalone image API executor remains an optional extension; this version doesn't install anything automatically, register accounts, or borrow other agents' logins.

## Keeping user configuration across updates

The install directory may be replaced; a user's media.json must never be written into it. Old configuration gains new fields by merging with defaults; new capabilities default to unchosen/unauthorized, and existing voices are never automatically retrained or reset. When a field's meaning changes, provide an explicit migration and rollback method.

## Release checks

After reviewing changes, stage this release's public files, then generate the file manifest:

```sh
python scripts/check_release.py manifest --repo .
git add release-manifest.json
python scripts/check_release.py check --repo . --ref INDEX
# After committing, check all outgoing commits, replacing base with the actual remote baseline
python scripts/check_release.py check --repo . --ref HEAD --base origin/main
```

It checks Git objects, not just files on disk; credentials written in an intermediate commit and then deleted are checked too. The manifest only proves the set of reviewed files is consistent; it doesn't replace code review, real media acceptance or license checks. Never bypass the check or rewrite history to disguise something as a first release.

When reusing code, also keep the existing license boundaries of the fonts, stroke-order data and character demos. Personal feedback stays in personal configuration; only methods and interface experience with reproducible evidence go into public docs, marked with date, scope and validation status.
