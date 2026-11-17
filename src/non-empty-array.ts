declare const nonEmptyBrand: unique symbol;

// 「空でない」という証明のラベル（ブランド）を付けた配列
export type NonEmptyArray<T> = T[] & { readonly [nonEmptyBrand]: true };

// 証明を作る関数。空ならnullを返す
export const parseNonEmpty = <T>(xs: T[]): NonEmptyArray<T> | null =>
  xs.length > 0 ? (xs as NonEmptyArray<T>) : null;

// 証明がないと呼べない関数。undefinedのチェックが不要になる
export const safeHead = <T>(xs: NonEmptyArray<T>): T => xs[0];

export const ids = parseNonEmpty([1, 2, 3]);

export const firstId = ids === null ? null : safeHead(ids);

// 空配列にラベルを付けて嘘をつける。型検査は通るが、実行時はundefinedになる
export const fake = [] as unknown as NonEmptyArray<number>;

export const lie = safeHead(fake);
