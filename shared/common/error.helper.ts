export function getErrorMessage(error: any): string | null {
  const type = typeof error;

  switch (type) {
    case "object": {
      return error ? error.message : "";
    }
    case "string": {
      return error;
    }
    default: {
      return null;
    }
  }
}
