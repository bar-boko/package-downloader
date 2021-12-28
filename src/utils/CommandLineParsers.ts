const PACKAGES_DELIMITER = ' ';

export const parsePackages = (value: string): string[] => value.split(PACKAGES_DELIMITER);