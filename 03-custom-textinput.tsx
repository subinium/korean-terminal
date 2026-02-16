/**
 * Test 3: Custom TextInput with useCursor
 * - Mirrors the cursor-ime example from ink PR #876
 * - Uses splitAt/charCount for codepoint-aware text manipulation
 * - Syncs real terminal cursor position via useCursor
 * - Uses string-width for CJK column width calculation
 * - Supports cursor movement, middle insertion, and deletion
 */
import React, { useState, useCallback } from 'react';
import { render, Box, Text, useInput, useCursor } from 'ink';
import stringWidth from 'string-width';

function splitAt(string_: string, index: number): [string, string] {
  const chars = [...string_];
  return [chars.slice(0, index).join(''), chars.slice(index).join('')];
}

function charCount(string_: string): number {
  return [...string_].length;
}

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void;
  prompt?: string;
  row?: number;
}

function TextInput({ value, onChange, onSubmit, prompt = '> ', row = 0 }: TextInputProps) {
  const [cursorIndex, setCursorIndex] = useState(0);
  const { setCursorPosition } = useCursor();

  useInput((input, key) => {
    if (key.return) {
      onSubmit?.(value);
      return;
    }

    if (key.backspace || key.delete) {
      if (cursorIndex > 0) {
        const [before, after] = splitAt(value, cursorIndex);
        const [kept] = splitAt(before, charCount(before) - 1);
        onChange(kept + after);
        setCursorIndex(previous => previous - 1);
      }
      return;
    }

    if (key.leftArrow) {
      setCursorIndex(previous => Math.max(0, previous - 1));
      return;
    }

    if (key.rightArrow) {
      setCursorIndex(previous => Math.min(charCount(value), previous + 1));
      return;
    }

    if (key.upArrow || key.downArrow) {
      return;
    }

    if (!key.ctrl && !key.meta && input) {
      const [before, after] = splitAt(value, cursorIndex);
      onChange(before + input + after);
      setCursorIndex(previous => previous + charCount(input));
    }
  });

  const beforeCursor = splitAt(value, cursorIndex)[0];
  setCursorPosition({ x: stringWidth(prompt + beforeCursor), y: row });

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
      <Text bold color="cyan">Test 3: Custom TextInput (cursor movement + middle insertion)</Text>
      <Text dimColor>Try Korean input, arrow keys, middle insertion/deletion.</Text>
      <Text dimColor>Enter to submit, Ctrl+C to exit</Text>
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
