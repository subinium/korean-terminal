/**
 * Test 1: WITHOUT useCursor (current ink-text-input approach)
 * - Fake cursor via chalk.inverse()
 * - Real terminal cursor is hidden
 * - IME composition window appears at wrong position (broken)
 */
import React, { useState } from 'react';
import { render, Box, Text, useInput } from 'ink';
import chalk from 'chalk';

function App() {
  const [text, setText] = useState('');
  const [cursorOffset, setCursorOffset] = useState(0);

  useInput((input, key) => {
    if (key.backspace || key.delete) {
      if (cursorOffset > 0) {
        setText((prev) => prev.slice(0, cursorOffset - 1) + prev.slice(cursorOffset));
        setCursorOffset((prev) => prev - 1);
      }
      return;
    }

    if (key.leftArrow) {
      setCursorOffset((prev) => Math.max(0, prev - 1));
      return;
    }

    if (key.rightArrow) {
      setCursorOffset((prev) => Math.min(text.length, prev + 1));
      return;
    }

    if (key.return) {
      return;
    }

    if (!key.ctrl && !key.meta && input) {
      setText((prev) => prev.slice(0, cursorOffset) + input + prev.slice(cursorOffset));
      setCursorOffset((prev) => prev + input.length);
    }
  });

  // Fake cursor rendering (same approach as ink-text-input)
  let rendered = '';
  let i = 0;
  for (const char of text) {
    rendered += i === cursorOffset ? chalk.inverse(char) : char;
    i++;
  }
  if (cursorOffset >= text.length) {
    rendered += chalk.inverse(' ');
  }

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="red">Test 1: WITHOUT useCursor (fake cursor)</Text>
      <Text dimColor>Try typing Korean/CJK. The IME window will appear at the wrong position.</Text>
      <Text dimColor>Ctrl+C to exit</Text>
      <Text> </Text>
      <Text>&gt; {rendered}</Text>
    </Box>
  );
}

render(<App />);
