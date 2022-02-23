const PACKAGES_DELIMITER = ' ';

export const parsePackages = (value: string): string[] => value.split(PACKAGES_DELIMITER);

export const parseThrottleLimit = (value: string): number => {
  try {
    const numberValue = Math.floor(Number(value));

    if (numberValue <= 0) {
      throw new Error('Throttle Value must be a positive number');
    }

    return numberValue;
  }
  catch (error) {
    throw error;
  }
}