import { generateRandomStringWithoutSimilarChars } from './random.js';

interface IdUtilsConfig {
  idLength: number;
  generatedIdValidator: (id: string) => boolean;
}

export const idUtils = (config: IdUtilsConfig) => ({
  generateNewId (): string {
    function getRandomId(): string {
      const id = generateRandomStringWithoutSimilarChars(config.idLength);
      if (config.generatedIdValidator(id)) {
        return id;
      }
      return getRandomId();
    }

    return getRandomId();
  },
});
