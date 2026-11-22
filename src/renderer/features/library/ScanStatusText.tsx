import { useLibraryStore } from '@renderer/state/libraryStore';
import { Text } from '@renderer/ui';

export function ScanStatusText() {
  const status = useLibraryStore((s) => s.status);
  if (!status?.scanning && !status?.failed) return null;
  const text = status.scanning
    ? status.total
      ? `Analyzing songs… ${status.done} of ${status.total}`
      : 'Looking for songs…'
    : `${status.failed} file${status.failed === 1 ? '' : 's'} couldn’t be read.`;
  return (
    <Text variant="caption" tone="muted">
      {text}
    </Text>
  );
}
