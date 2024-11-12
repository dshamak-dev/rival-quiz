export function getGreetingText() {
  const date = new Date();
  const hours = date.getHours();

  if (hours < 12) {
    return "good morning";
  } else if (hours < 18) {
    return "how are you doing?";
  } else {
    return "good evening";
  }
}

export function formatDate(value: Date | string | number, format: string | null = null): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value)

  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}