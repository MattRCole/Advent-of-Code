import { BigDenary } from "https://deno.land/x/bigdenary@1.0.0/mod.ts";
import { getArray, splice } from "./array.ts";

export const multiplyMatrixByScalar = (
  matrix: number[][],
  scalar: number,
): number[][] => {
  return matrix.map((row) => row.map((n) => n * scalar));
};

// slices the matrix along a column. follows javascript slice rules
// returns a copy of the matrix
export const sliceMatrixByColumn = <N extends number | BigDenary>(
  matrix: N[][],
  start?: number,
  end?: number,
) => {
  return matrix.map((r) => r.slice(start, end));
};

// slices the matrix along a row, follows javascript slice rules
// returns a copy of the matrix
export const sliceMatrixByRow = <N extends number | BigDenary>(
  matrix: N[][],
  start?: number,
  end?: number,
) => {
  return matrix.slice(start, end).map((r) => [...r]);
};
export const spliceMatrixByRow = <N extends number | BigDenary>(
  matrix: N[][],
  deleteIndex: number,
  deleteCount: number,
  ...newRows: N[][]
) => {
  return splice(matrix, deleteIndex, deleteCount, ...newRows);
};

export const getIdentityMatrix = (size: number): number[][] =>
  getArray(size).map((_, y) => getArray(size).map((_, x) => x === y ? 1 : 0));

export const getInverseOfMatrix = (matrix: number[][]): number[][] | false => {
  if (matrix.length === 0) return [];
  if (!matrix.every((row) => row.length === matrix.length)) {
    throw new Error(
      `Cannot multiply a matrix of ${matrix.length}x${
        matrix[0].length
      } (or a row is not equal to ${matrix.length}.)`,
    );
  }

  // basically a copy-paste of Adrew Ippoliti's blog post on this.
  // archival link: https://web.archive.org/web/20210406035905/http://blog.acipo.com/matrix-inversion-in-javascript/

  const matrixSize = matrix.length;
  const identityMatrix = getIdentityMatrix(matrixSize);
  let augmentedMatrix = matrix.map((r, y) => [...r, ...identityMatrix[y]]);

  for (let diagI = 0; diagI < matrixSize; diagI++) {
    const currentDiagonalValue = augmentedMatrix[diagI][diagI];
    if (currentDiagonalValue === 0) {
      for (
        let followingRowIndex = diagI + 1;
        followingRowIndex < matrixSize;
        followingRowIndex++
      ) {
        if (augmentedMatrix[followingRowIndex][diagI] !== 0) {
          const currentRow = augmentedMatrix[diagI];
          const rowToSwapWith = augmentedMatrix[followingRowIndex];

          // swap the rows
          augmentedMatrix = spliceMatrixByRow(
            augmentedMatrix,
            diagI,
            1,
            rowToSwapWith,
          );
          augmentedMatrix = spliceMatrixByRow(
            augmentedMatrix,
            followingRowIndex,
            1,
            currentRow,
          );
          break;
        }
      }
      if (augmentedMatrix[diagI][diagI] === 0) return false as false;
    }
    const divisor = augmentedMatrix[diagI][diagI];
    const rowIndex = diagI;

    // divide to get the correct value in the desired position
    augmentedMatrix = spliceMatrixByRow(
      augmentedMatrix,
      rowIndex,
      1,
      augmentedMatrix[rowIndex].map((val) => val / divisor),
    );

    // zero out all other values in the new identity portion of the augmented matrix
    augmentedMatrix = augmentedMatrix.map((r, y) => {
      if (y === rowIndex) return r;
      const valueToZero = r[diagI];

      // it's already zero, we're done
      if (valueToZero === 0) return r;

      return r.map((v, x) => v - (valueToZero * augmentedMatrix[rowIndex][x]));
    });
  }
  // isolate the new inverse matrix
  return sliceMatrixByColumn(augmentedMatrix, matrixSize);
};

export const matrixMultiply = (a: number[][], b: number[][]) => {
  if (a[0].length !== b.length) {
    throw new Error(
      `Cannot matrix multiply unless a.x length === b.y length a.x: ${
        a[0].length
      }, b.y: ${b.length}`,
    );
  }
  const resultMatrix = getArray(a.length).map(() => getArray(b[0].length, 0));
  for (let y = 0; y < a.length; y++) {
    for (let x = 0; x < b[0].length; x++) {
      for (let commonIndex = 0; commonIndex < b.length; commonIndex++) {
        resultMatrix[y][x] += a[y][commonIndex] * b[commonIndex][x];
      }
    }
  }
  return resultMatrix;
};
