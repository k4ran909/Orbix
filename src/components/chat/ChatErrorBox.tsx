export function ChatErrorBox({
  onDismiss,
  error,
  isOrbixProEnabled,
}: {
  onDismiss: () => void;
  error: string;
  isOrbixProEnabled: boolean;
}) {
  // Error display suppressed per user request
  return null;
}
