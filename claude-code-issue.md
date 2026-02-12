# Korean IME composition window appears at wrong position (bottom-left of terminal)

## Summary

When typing Korean (or other CJK languages) in Claude Code, the IME composition/candidate window renders at the **bottom-left corner of the terminal** instead of at the cursor position. This makes Korean input extremely difficult — the composing character appears far from where text is being typed.

## Environment

- **OS**: macOS (Darwin 25.2.0)
- **Claude Code model**: Opus 4.6
- **Input method**: macOS default Korean input (2-set / du-beol-sik)
- **Terminal**: iTerm2 / Terminal.app (reproducible in both)

## Steps to Reproduce

1. Launch Claude Code in a terminal on macOS.
2. Switch to Korean input method.
3. Type Korean text in the input prompt (e.g., keystrokes for "한글").
4. Observe where the IME composition window appears.

## Expected Behavior

The IME composition window should appear **directly adjacent to the text cursor** in the input field.

## Actual Behavior

The IME composition window appears at the **bottom-left corner of the terminal**, completely detached from the input area:

1. **Split attention**: The composing syllable (ㅎ → 하 → 한) appears far from where text is inserted.
2. **Disorienting feel**: Characters feel "pushed away" or "lagging" due to spatial disconnect.
3. **Affects all CJK input**: Korean, Japanese, and Chinese users all experience this.

## Screenshot

- **Top**: Claude Code input with Korean text: `3으로 가자 쫝 병렬처리. 지금 내 문제는 정확히 이해했지?`
- **Middle**: Status bar `→ korean-terminal Opus 4.6 [ctx: 53%]`
- **Bottom-left**: Composing character `이` appears detached from input area

*(Screenshot attached)*

## Technical Analysis

### Root Cause

Claude Code uses React Ink, which hides the real terminal cursor and renders a fake cursor via `chalk.inverse()`. macOS IME relies on the real terminal cursor position to place the composition window. Since the real cursor is hidden, the IME window falls back to position (0,0).

### The Fix: Ink's `useCursor` API

Ink 6.7.0 introduced `useCursor` (PR #866) which moves the **real terminal cursor** to specified coordinates after each render:

```tsx
import { useCursor } from 'ink';
import stringWidth from 'string-width';

const { setCursorPosition } = useCursor();
setCursorPosition({
  x: stringWidth(prompt + textBeforeCursor),
  y: inputRow,
});
```

**Local verification**: Tested with `ink@6.7.0` + `useCursor` — IME composition window appears at the correct position. Korean input works as expected.

## Related Issues

- #1547, #2620, #3045, #16372, #19207, #21382

## Proposed Fix

1. Integrate `useCursor` from ink >=6.7.0 into Claude Code's text input component
2. Use `string-width` for CJK-aware cursor column calculation
3. Show the real terminal cursor alongside the existing visual cursor

### Upstream PRs

- [`ink-text-input` #93](https://github.com/vadimdemedes/ink-text-input/pull/93): Add IME cursor positioning via `useCursor`
- [`@inkjs/ui` #24](https://github.com/vadimdemedes/ink-ui/pull/24): Add IME cursor positioning to TextInput
- [`ink` #875](https://github.com/vadimdemedes/ink/pull/875): Improve cursor-ime example with full TextInput
- [`ink` #866](https://github.com/vadimdemedes/ink/pull/866): `useCursor` hook (merged)
- [`ink` #872](https://github.com/vadimdemedes/ink/pull/872): `<Cursor>` component (open)

### Reproduction

Available at [korean-terminal](https://github.com/subinium/korean-terminal):

| Script | Description | IME behavior |
|--------|-------------|--------------|
| `npm run test1` | Fake cursor (current behavior) | IME at bottom-left (broken) |
| `npm run test2` | `useCursor` with real cursor | IME at correct position (fixed) |
| `npm run test3` | Full TextInput + `useCursor` | IME at correct position (fixed) |
