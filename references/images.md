# Optional images: existing assets and the current agent's image generation

Image integration has two halves: the agent observes the current tools and calls them per the user's authorization; the script resolves the choice, checks the output and saves it to the project. The script doesn't simulate host tools, doesn't borrow other agents' logins, and doesn't switch image APIs automatically.

## Look at the task first, then the configuration

Import existing images directly with `use-image`. Code animations that need no images skip this page. For new image generation, first read explicit preferences in the rules loaded this time, then this tool's configuration; when the user has already asked for generation, proceed with the actual tools and existing authorization, without forcing a question just to fill in configuration.

```sh
# S is the skill directory actually loaded this time
python "$S/scripts/capabilities.py" image-status
python "$S/scripts/capabilities.py" use-image --file original.png --out <project>/images/asset.png
```

`preferences.image.mode` supports `unconfigured/off/existing/generate`, and provider is the current tool's exact ID or auto. `off` is a preference not to generate by default, which an explicit request for generation this time can override; `policy.image_generation=deny` is a prohibition that temporary authorization flags can't override. Save the user's explicit "forbid" as a policy, not just as a mode.

When configuration is missing the first time, ask only: existing assets / allow the current tool to generate / skip. `skip --capability image --scope task` isn't saved; `--scope user` means enable manually long-term. When the user chooses only for this time, don't save it as a long-term default. Existing voice configuration stays valid after upgrade; the new image capability stays unchosen and isn't authorized automatically.

## Snapshot of the current tools

The agent reads names and schemas from the tool list the current session already exposes (or the host's official tool search), confirms supported operations, then writes a snapshot within the task. It can't be inferred by scanning keys, installed skills or agent names. With no tools, write `tools: []`.

```json
{
  "host": "codex",
  "session_id": "unique ID for this task",
  "observed_at": 0,
  "tools": [{
    "id": "the actual current tool ID",
    "kind": "host",
    "operations": ["generate", "edit"],
    "reference_images": true,
    "transparent_background": true,
    "cost": "subscription",
    "network": "cloud"
  }]
}
```

The example isn't a capability declaration: `observed_at` must be filled with the Unix time of this session, and tool features and IDs must come from this session's actual schema; a snapshot is valid for 15 minutes. host may be codex, claude-code, kimi or other; kind may be host or mcp. Cost type is subscription/paid_api/unknown/none; network is cloud/local. A subscription doesn't mean unlimited quota; when cost is unclear use unknown, never none.

All three hosts go through this common contract. One Codex session having image_gen doesn't mean every Codex product surface has it; Claude Code/Kimi may use a suitable MCP image tool if one is exposed, and if not, import existing images or give a description of the assets still to be made. Never invent built-in tools of the same name for those two.

## Plan → host executes → acceptance

Request JSON:

```json
{
  "prompt": "the image description the user confirmed",
  "operation": "generate",
  "references": [],
  "transparent_background": true,
  "min_width": 512,
  "min_height": 512
}
```

For editing, use edit and provide reference files; relative paths are relative to the request JSON. The script verifies reference images decode and saves their hashes, and later changes invalidate the old plan.

```sh
python "$S/scripts/capabilities.py" image-plan --request request.json \
  --host-tools current_tools.json --session this-session-id --mode generate \
  --allow-image-generation --allow-cloud --out execution_plan.json
```

Authorization flags only express authorization the user has already given for this time. Uploading reference images to the cloud additionally needs `--allow-reference-upload`; an explicitly paid API needs `--allow-paid-api`; unknown cost needs `--allow-unknown-image-cost`. Long-term permission can be stored in the corresponding policy fields. A project can only set deny, never grant these rights. Prohibitions are handled first; when several allowed tools remain and none can be chosen clearly, it returns needs_selection rather than guessing a platform.

After getting `host_action_required`, the agent calls the tool with its real schema; the plan is a semantic requirement, not a cross-platform universal parameter body. Write the receipt only when generation succeeds:

```json
{
  "status": "success",
  "plan_id": "the ID in the execution plan",
  "session_id": "this session's ID",
  "tool_id": "the ID of the tool actually called",
  "output_sha256": "SHA256 of the actual output file"
}
```

Keep the actual tool-call record as the basis. The receipt is a call record provided by the agent, not a platform-signed authentication; reading PNG metadata alone can't prove which model generated it.

```sh
python "$S/scripts/capabilities.py" accept-image --plan execution_plan.json --receipt receipt.json \
  --host-tools current_tools.json --session this-session-id --file host_output.png \
  --out <project>/images/final_asset.png --allow-image-generation --allow-cloud
```

Acceptance rechecks the current authorization, image-related configuration, tools, session, reference images, file hash, actual dimensions and transparent pixels. A plan is valid for 1 hour; when the capability snapshot expires, refresh it first — you can't edit an old plan to pretend it's still valid. If either the original image or its sidecar exists, nothing is overwritten; static PNG/JPEG/WebP are supported and Pillow is required, which the tool doesn't install automatically. Image content and the reference identity still need a visual check; hash/dimensions can't replace looking at the image.

Once passed, it's copied into the project with an adjacent JSON containing dimensions, transparency, SHA, tool ID, plan association and `provenance: agent_reported_tool_call`. Don't reference the agent's cache as the project's final asset, and don't claim to have verified a model name the server didn't return.

## Extension and feedback

When adding an image API adapter, first choose a real provider, then implement its authentication, request, output and error protocols, and write success/failure contract tests. A URL that calls itself OpenAI-compatible doesn't automatically become a usable backend; this version has no generic API executor or self-installer. Existing MCP tools belong to the current agent's tool channel; execute them per their schema.

2026-10-08: P2 established the interface of selection → host action → asset acceptance. Before reuse, read this page and the provider's current tool documentation; for reproducible failures add a test and fix the original logic, and write personal preferences only into private configuration. Voice and images are enabled separately, and upgrades never widen existing authorization. Deterministic acceptance and conclusions about visual quality are recorded separately.
