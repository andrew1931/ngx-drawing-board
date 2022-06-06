import { IDrawGridConfig } from '../types';

export const validate = {

  size: (width: number, height: number) => {

    if (isNaN(width) || typeof width !== 'number') {
      throw new Error('Width should be a number');
    }

    if (isNaN(height) || typeof height !== 'number') {
      throw new Error('Height should be a number');
    }
  },

  grid: (gridConfig: IDrawGridConfig) => {
    if (isNaN(gridConfig.strokeWidth) || typeof gridConfig.strokeWidth !== 'number') {
      throw new Error('Grid strokeWidth should be a number');
    }

    if (gridConfig.strokeWidth < 0) {
      throw new Error('Grid strokeWidth should be >= 0');
    }

    if (isNaN(gridConfig.cellSize) || typeof gridConfig.cellSize !== 'number') {
      throw new Error('Grid cellSize should be a number');
    }

    if (gridConfig.cellSize <= 0) {
      throw new Error('Grid cellSize should be > 0');
    }
  }

}
