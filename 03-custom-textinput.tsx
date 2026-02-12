/**
 * Test 3: Custom TextInput with useCursor
 * - ink-text-input을 대체하는 커스텀 컴포넌트
 * - useCursor로 실제 커서 위치 동기화
 * - string-width로 CJK 폭 계산
 * - 커서 이동, 중간 삽입, 삭제 모두 지원
 */
import React, { useState, useCallback } from 'react';
import { render, Box, Text, useInput, useCursor } from 'ink';
import stringWidth from 'string-width';

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void;
  prompt?: string;
  row?: number;
}

function TextInput({ value, onChange, onSubmit, prompt = '> ', row = 0 }: TextInputProps) {
  const [cursorOffset, setCursorOffset] = useState(value.length);
  const { setCursorPosition } = useCursor();

  useInput((input, key) => {
    if (key.return) {
      onSubmit?.(value);
      return;
    }

    if (key.backspace || key.delete) {
      if (cursorOffset > 0) {
        const next = value.slice(0, cursorOffset - 1) + value.slice(cursorOffset);
        onChange(next);
        setCursorOffset((prev) => prev - 1);
      }
      return;
    }

    if (key.leftArrow) {
      setCursorOffset((prev) => Math.max(0, prev - 1));
      return;
    }

    if (key.rightArrow) {
      setCursorOffset((prev) => Math.min(value.length, prev + 1));
      return;
    }

    if (!key.ctrl && !key.meta && input) {
      const next = value.slice(0, cursorOffset) + input + value.slice(cursorOffset);
      onChange(next);
      setCursorOffset((prev) => prev + input.length);
    }
  });

  const textBeforeCursor = value.slice(0, cursorOffset);
  setCursorPosition({ x: stringWidth(prompt + textBeforeCursor), y: row });

  return (
    <Text>{prompt}{value}</Text>
  );
}

function App() {
  const [value, setValue] = useState('');
  const [submitted, setSubmitted] = useState<string[]>([]);

  const handleSubmit = useCallback((text: string) => {
    if (text.trim()) {
      setSubmitted((prev) => [...prev, text]);
      setValue('');
    }
  }, []);

  // row 0: header, row 1: desc, row 2: hint, row 3: blank
  // row 4+: submitted lines, then input
  const inputRow = 4 + submitted.length;

  return (
    <Box flexDirection="column">
      <Text bold color="cyan">Test 3: Custom TextInput (커서 이동 + 중간 삽입 지원)</Text>
      <Text dimColor>한글 입력, 화살표 이동, 중간 삽입/삭제를 테스트하세요.</Text>
      <Text dimColor>Enter로 제출, Ctrl+C로 종료</Text>
      <Text> </Text>
      {submitted.map((line, i) => (
        <Text key={i} dimColor>  {line}</Text>
      ))}
      <TextInput
        value={value}
        onChange={setValue}
        onSubmit={handleSubmit}
        row={inputRow}
      />
    </Box>
  );
}

render(<App />);
