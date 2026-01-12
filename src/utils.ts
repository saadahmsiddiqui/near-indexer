export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const base64ToBytes = (data: string) =>
  new Uint8Array(
    atob(data)
      .split("")
      .map(function (c) {
        return c.charCodeAt(0);
      })
  );
