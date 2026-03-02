import React from 'react';
import { Text } from 'ink';
import Spinner from 'ink-spinner';

export default function StatusLine({ text }: { text: string }) {
  return (
    <Text>
      <Text color="magenta"><Spinner type="dots" /></Text>
      <Text dimColor> {text}</Text>
    </Text>
  );
}
