export const promise = {
  timeout (timeout: number): Promise<void> {
    return new Promise((resolve): void => {
      setTimeout(() => resolve(), timeout);
    });
  },
};
