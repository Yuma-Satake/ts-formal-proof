export const isString = (x: unknown): x is string => typeof x === "string";

export const shout = (v: unknown): string => {
  if (isString(v)) {
    return v.toUpperCase();
  }
  return "";
};

// 述語の本体は検査されない。常にtrueを返す宣言でもコンパイルを通る
export const isNumberWrong = (_x: unknown): _x is number => true;

export const lengthOfFixed = (v: unknown): number => {
  if (isNumberWrong(v)) {
    return v.toFixed(2).length;
  }
  return 0;
};
