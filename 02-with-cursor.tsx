/**
 * Test 2: WITH useCursor (ink 6.7.0 API)
 * - Moves the real terminal cursor to the correct position
 * - IME composition window appears at the cursor (fixed)
 * - Uses string-width for CJK double-width character handling
 */
import React, { useState } from 'react';
import { render, Box, Text, useInput, useCursor } from 'ink';
import stringWidth from 'string-width';

function App() {
  const [text, setText] = useState('');
  const { setCursorPosition } = useCursor();

  useInput((input, key) => {
    if (key.backspace || key.delete) {
      setText((prev) => prev.slice(0, -1));
      return;
    }

    if (key.return) {
      return;
    }

    if (!key.ctrl && !key.meta && input) {
      setText((prev) => prev + input);
    }
  });

  const prompt = '> ';
  // row 0: header, row 1: description, row 2: exit hint, row 3: blank, row 4: input
  setCursorPosition({ x: stringWidth(prompt + text), y: 4 });

  return (
    <Box flexDirection="column">
      <Text bold color="green">Test 2: WITH useCursor (real cursor)</Text>
      <Text dimColor>Try typing Korean/CJK. The IME window should appear at the cursor.</Text>
      <Text dimColor>Ctrl+C to exit</Text>
      <Text> </Text>
      <Text>{prompt}{text}</Text>
    </Box>
  );
}

render(<App />);
