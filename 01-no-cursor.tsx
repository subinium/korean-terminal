/**
 * Test 1: WITHOUT useCursor (기존 ink-text-input 방식)
 * - 가짜 커서 (chalk.inverse)
 * - 실제 터미널 커서 숨김
 * - 한글 IME 조합이 깨지는 케이스
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

  // Fake cursor rendering (ink-text-input 방식)
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
      <Text bold color="red">Test 1: WITHOUT useCursor (가짜 커서)</Text>
      <Text dimColor>한글을 입력해보세요. IME 후보창 위치와 조합 상태를 확인하세요.</Text>
      <Text dimColor>Ctrl+C to exit</Text>
      <Text> </Text>
      <Text>&gt; {rendered}</Text>
    </Box>
  );
}

render(<App />);
