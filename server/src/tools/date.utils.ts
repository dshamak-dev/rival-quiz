export function compareDates(
  valueA: Date | string | number,
  valueB: Date | string | number
): number {
  if (!valueA) {
    return -1;
  }

  if (!valueB) {
    return 1;
  }

  const dateA = new Date(valueA);
  const dateB = new Date(valueB);

  return dateA.getTime() - dateB.getTime();
}
