/**
 * Test 2: WITH useCursor (ink 6.7.0 새 API)
 * - 실제 터미널 커서를 올바른 위치로 이동
 * - IME 후보창이 정확한 위치에 표시됨
 * - string-width로 CJK 더블 폭 문자 처리
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
      <Text bold color="green">Test 2: WITH useCursor (실제 커서)</Text>
      <Text dimColor>한글을 입력해보세요. IME 후보창이 커서 위치에 뜨는지 확인하세요.</Text>
      <Text dimColor>Ctrl+C to exit</Text>
      <Text> </Text>
      <Text>{prompt}{text}</Text>
    </Box>
  );
}

render(<App />);
