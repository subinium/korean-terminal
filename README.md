# korean-terminal

Reproduction demos showing how CJK (Korean, Japanese, Chinese) IME composition breaks in [Ink](https://github.com/vadimdemedes/ink)-based terminal apps — and how to fix it with `useCursor` + `string-width`.

## The Problem

Terminal apps built with Ink (including Claude Code, Warp, etc.) hide the real terminal cursor and render a fake cursor using `chalk.inverse()`. The OS IME (Input Method Editor) relies on the **real cursor position** to place its composition window.

Result: the IME composition window appears at the **bottom-left corner** of the terminal instead of at the text cursor. This makes Korean/Japanese/Chinese input extremely difficult.

```
┌─────────────────────────────────────────┐
│ > Hello, type Korean here_              │  ← input area (fake cursor)
│                                         │
│                                         │
│ 한  ← IME window stuck here (broken!)   │  ← bottom-left corner
└─────────────────────────────────────────┘
```

## The Fix

Ink 6.7.0 added the [`useCursor`](https://github.com/vadimdemedes/ink/pull/866) hook, which positions the **real** terminal cursor at specified coordinates. Combined with [`string-width`](https://github.com/sindresorhus/string-width) for CJK double-width character handling, the IME window appears at the correct position.

```tsx
import { useCursor } from 'ink';
import stringWidth from 'string-width';

const { setCursorPosition } = useCursor();
setCursorPosition({
  x: stringWidth(prompt + textBeforeCursor),
  y: inputRow,
});
```

## Demos

| Script | Description | IME Behavior |
|--------|-------------|--------------|
| `npm run test1` | Fake cursor (`chalk.inverse`) | IME at bottom-left (broken) |
| `npm run test2` | `useCursor` with real cursor | IME at correct position (fixed) |
| `npm run test3` | Full TextInput + `useCursor` | IME at correct position (fixed) |

### Running

```bash
npm install
npm run test1  # broken: fake cursor, IME at wrong position
npm run test2  # fixed: useCursor positions IME correctly
npm run test3  # fixed: full TextInput with cursor movement
```

Switch your OS keyboard to Korean (or Japanese/Chinese) and start typing to see the difference.

## Why `string-width` Matters

CJK characters are **fullwidth** — each occupies 2 terminal columns:

| Text | `.length` | `stringWidth()` | Terminal Columns |
|------|-----------|------------------|-----------------|
| `abc` | 3 | 3 | 3 |
| `한글` | 2 | 4 | 4 |
| `あいう` | 3 | 6 | 6 |

Using `.length` for cursor positioning causes the cursor to drift left after every CJK character. `string-width` gives the correct column count.

## Related PRs

These PRs integrate `useCursor` into the Ink ecosystem to fix this issue:

- [`ink-text-input#93`](https://github.com/vadimdemedes/ink-text-input/pull/93) — Add IME cursor positioning via `cursorStart` prop
- [`ink#876`](https://github.com/vadimdemedes/ink/pull/876) — Enhance cursor-ime example with cursor movement and editing
- [`@inkjs/ui#23`](https://github.com/vadimdemedes/ink-ui/pull/23) — Add IME cursor support to TextInput
- [`claude-code#25186`](https://github.com/anthropics/claude-code/issues/25186) — Issue report for Claude Code

## How Hangul Composition Works

When typing the Korean syllable "한":

1. Press `ㅎ` — IME shows uncommitted consonant **ㅎ**
2. Press `ㅏ` — IME *replaces* ㅎ with syllable **하**
3. Press `ㄴ` — IME *replaces* 하 with completed syllable **한**

During steps 1–3, the character is "composing" — not yet confirmed. The OS draws this preview **at the terminal's real cursor position**. If the real cursor is hidden or at (0,0), the preview appears at the wrong location.

## License

MIT
