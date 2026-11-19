# Form interactions through event DSL

`MForm` contains fields and form behavior. Titles are independent `MHeading` Blocks; status text is an independent `MRichText` bound to `MPageState.statusMessage`. API URLs and application names belong in `execute_ds` actions in a Block's top-level `events`. Form field rules remain in `items[].rules`. Field interactions belong in `items[].editor.events`.

## Form lifecycle

- `init`: emits `{ values }` once after the initial visible field controls have rendered and registered, outside the editor.
- `change`: emits `{ values, changedFields, source, valid, errors }` for changed user input. Partial validation checks patterns and permits incomplete required fields.
- `setValues({ values, emitChange? })` and `reset({ values?, emitChange? })` are silent by default. Explicit `emitChange: true` emits a programmatic change; equal values do not emit again.
- `submit()` validates all required fields and returns `{ values, valid, errors }`; it never calls an API. The button's click actions branch on `valid` before `execute_ds`.
- `setFieldOptions({ options: { fieldName: [...] } })` changes options without changing field values.
- `setStatus({ disabled?, loading?, showHints?, errors? })` updates form state. Errors have `{ field?, message }`. `showHints` controls `items[].rules.hint`, leaving permanent descriptions and validation errors visible. Hints default to visible; initialization actions can explicitly hide them before loading data. Changing status never emits a form change.

Store response IDs, versions and workflow state in `MPageState`. Use `call_block_method` to update it and silently populate the form. Save responses should update version and calculated fields, not overwrite newer user edits.

Status messages are written with `MPageState.merge({ value: { statusMessage: 'Saved' } })`. Configure `MRichText.content` using its visual variable editor, selecting that state Block and `statusMessage`. Static strings and constant/variable/flow bindings are supported; an explicit empty string stays empty. The title and status Blocks can be moved or removed independently, and neither is created internally by `MForm`.

## Event execution

```json
{
  "event": "change",
  "execution": {
    "debounceMs": 400,
    "concurrency": "serialLatest",
    "retry": "resumeUnconfirmed",
    "flushOn": ["hidden", "unmount"]
  },
  "actions": [],
  "onError": [],
  "onFinally": []
}
```

Replace the empty action arrays using the visual event/action editor. Without execution options, events execute immediately in parallel. `serialLatest` serializes executions and coalesces pending changes; `drop` ignores repeated triggers while running. `onError` receives `event.error.message`, `event.error.actionUuid`, `event.error.unconfirmed` and `event.originalEvent`; `onFinally` receives `event.originalEvent`.

`flush_event` and `retry_event` take `{ blockId, event }`. Submission should lock the form, flush its change event, validate, request submission, then unlock in `onFinally` unless submitted. A retry button is a normal DSL `MButton`.

`trigger_event` takes `{ blockId, event, payload? }` and returns `{ result }`, an array of matching handler results in configuration order. It executes the target Block's current DSL events with `event = payload` (default `{}`), preserving its page context and execution policies, and waits for all matching handlers. Missing targets/events, execution errors, and direct or indirect circular waits reject the calling action. This does not emit a Vue/DOM event or modify values.

For hint visibility, configure `MSelectField`'s `change` event inside `items[].editor.events`: a `switch_controller` matches `event.value` against `yes` and calls the form's `setStatus({ showHints: true })`, with a default branch setting it to `false`. After initialization calls `setValues`, use `trigger_event` with the restored value to reuse that same rule without starting autosave. Programmatic resets likewise remain silent; explicitly trigger the field event when linked presentation needs updating.

Only opt into `resumeUnconfirmed` for idempotent endpoints. Transport failures keep the exact resolved request and action checkpoint. A new change, explicit retry, or flush first confirms that request before executing newer work. Explicit business rejection is surfaced rather than automatically replayed. Lifecycle flush is best effort; browser termination cannot guarantee delivery.

## Migration

From `mokelay-server`, inspect with `node scripts/migrate-form-events.mjs --database`, then apply with `--apply --database`. The script backs up changed local pages in a private temporary directory, migrates asset and locally saved form configurations, and reports custom/conflicting chains rather than overwriting them. It reads the initialization API's record projection and defaults so display-only form fields stay out of response mappings. It also migrates old hint conditions into field events, extracts nonempty titles into `MHeading`, and moves status messages into `MPageState`/`MRichText`. Legacy field rules are merged onto items, with existing item rules taking precedence. The final configuration has no `MForm.data.draft` and uses ordinary form styles. Re-running an applied migration makes no changes. Only the offline migration reads legacy draft configuration; the runtime does not support it or `setStatus.message`. Backend draft-saving APIs and business record statuses are unchanged.
