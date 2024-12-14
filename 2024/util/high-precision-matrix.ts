import {
  BDCompare,
  BigDenary,
} from "https://deno.land/x/bigdenary@1.0.0/mod.ts";
import { getArray } from "./array.ts";
import { sliceMatrixByColumn, spliceMatrixByRow } from "./matrix.ts";

export const getIdentityMatrix = (size: number) =>
  getArray(size).map((_, y) =>
    getArray(size).map((_, x) => x === y ? new BigDenary(1) : new BigDenary(0))
  );

export const getInverseOfMatrix = (
  matrix: BigDenary[][],
): BigDenary[][] | false => {
  if (matrix.length === 0) return [];
  if (!matrix.every((row) => row.length === matrix.length)) {
    throw new Error(
      `Cannot get inverse of matrix of ${matrix.length}x${
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
    if (currentDiagonalValue.equals(0)) {
      for (
        let followingRowIndex = diagI + 1;
        followingRowIndex < matrixSize;
        followingRowIndex++
      ) {
        if (augmentedMatrix[followingRowIndex][diagI].equals(0) === false) {
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
      if (augmentedMatrix[diagI][diagI].comparedTo(0) === BDCompare.Equal) {
        return false as false;
      }
    }
    const divisor = augmentedMatrix[diagI][diagI];
    const rowIndex = diagI;

    // divide to get the correct value in the desired position
    augmentedMatrix = spliceMatrixByRow(
      augmentedMatrix,
      rowIndex,
      1,
      augmentedMatrix[rowIndex].map((val) => val.dividedBy(divisor)),
    );

    // zero out all other values in the new identity portion of the augmented matrix
    augmentedMatrix = augmentedMatrix.map((r, y) => {
      if (y === rowIndex) return r;
      const valueToZero = r[diagI];

      // it's already zero, we're done
      if (valueToZero.equals(0)) return r;

      return r.map((v, x) =>
        v.minus(valueToZero.multipliedBy(augmentedMatrix[rowIndex][x]))
      );
    });
  }
  // isolate the new inverse matrix
  return sliceMatrixByColumn(augmentedMatrix, matrixSize);
};

export const matrixMultiply = (a: BigDenary[][], b: BigDenary[][]) => {
  if (a[0].length !== b.length) {
    throw new Error(
      `Cannot matrix multiply unless a.x length === b.y length a.x: ${
        a[0].length
      }, b.y: ${b.length}`,
    );
  }
  const resultMatrix = getArray(a.length).map(() =>
    getArray(b[0].length, new BigDenary(0))
  );
  for (let y = 0; y < a.length; y++) {
    for (let x = 0; x < b[0].length; x++) {
      for (let commonIndex = 0; commonIndex < b.length; commonIndex++) {
        resultMatrix[y][x] = resultMatrix[y][x].add(
          a[y][commonIndex].multipliedBy(b[commonIndex][x]),
        );
      }
    }
  }
  return resultMatrix;
};

export const getHighPrecisionMatrix = (matrix: number[][]) =>
  matrix.map((r) => r.map((n) => new BigDenary(n)));
export const getLowPrecisionMatrix = (matrix: BigDenary[][]) =>
  matrix.map((r) => r.map((n) => n.valueOf()));
