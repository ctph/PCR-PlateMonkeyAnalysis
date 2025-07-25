// DuplicateWellPosition.js
export function createGetNextUnusedWell() {
  const usedWells = {};  // Local to each render

  return function getNextUnusedWell(well, wellPositionMap) {
    const matches = Object.entries(wellPositionMap)
      .filter(([key]) => key.startsWith(`${well}_`))
      .map(([key, coords]) => [key, coords]);

    if (!usedWells[well]) usedWells[well] = 0;

    const index = usedWells[well];
    const match = matches[index];

    if (match) {
      usedWells[well]++;
      return match[1]; 
    }

    return null;
  };
}
