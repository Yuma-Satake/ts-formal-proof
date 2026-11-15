// TypeScriptの型検査を証明検査器として使う実験。
// 実行: 同ディレクトリの check.sh（tscで型検査だけ行う。出力が空なら全ての証明が検査を通った状態）

// ---------- Part 1: 命題論理（型 = 命題、その型を持つ値 = 証明） ----------

type And<P, Q> = readonly [P, Q];
type Or<P, Q> = { readonly tag: "L"; readonly value: P } | { readonly tag: "R"; readonly value: Q };
type Not<P> = (p: P) => never;

const modusPonens = <P, Q>([p, f]: And<P, (p: P) => Q>): Q => f(p);

const andComm = <P, Q>([p, q]: And<P, Q>): And<Q, P> => [q, p];

const orComm = <P, Q>(x: Or<P, Q>): Or<Q, P> =>
  x.tag === "L" ? { tag: "R", value: x.value } : { tag: "L", value: x.value };

const contrapositive =
  <P, Q>(f: (p: P) => Q) =>
  (nq: Not<Q>): Not<P> =>
  (p) =>
    nq(f(p));

const doubleNegIntro =
  <P>(p: P): Not<Not<P>> =>
  (np) =>
    np(p);

const deMorgan1 = <P, Q>(n: Not<Or<P, Q>>): And<Not<P>, Not<Q>> => [
  (p) => n({ tag: "L", value: p }),
  (q) => n({ tag: "R", value: q }),
];

const deMorgan2 =
  <P, Q>([np, nq]: And<Not<P>, Not<Q>>): Not<Or<P, Q>> =>
  (x) =>
    x.tag === "L" ? np(x.value) : nq(x.value);

// ---------- Part 2: 証明できない命題（直観主義論理） ----------

// 二重否定除去 ¬¬P → P は証明できない
// @ts-expect-error (p: P) => P は (p: P) => never に代入できない
const doubleNegElim = <P>(nnp: Not<Not<P>>): P => nnp((p: P) => p);

// 排中律 P ∨ ¬P は証明できない（Pの値もPの否定も作れない）
// @ts-expect-error
const excludedMiddle = <P>(): Or<P, Not<P>> => ({ tag: "L", value: undefined });

// ---------- Part 3: 型レベル自然数と等式 ----------

type Z = { readonly tag: "Z" };
interface S<N> {
  readonly tag: "S";
  readonly pred: N;
}
type Nat = Z | S<Nat>;

type Add<A extends Nat, B> = A extends S<infer P extends Nat> ? S<Add<P, B>> : B;
type Mul<A extends Nat, B extends Nat> = A extends S<infer P extends Nat> ? Add<B, Mul<P, B>> : Z;

type One = S<Z>;
type Two = S<One>;
type Three = S<Two>;
type Four = S<Three>;
type Six = S<S<Four>>;

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
type Assert<T extends true> = T;

type Thm_1_plus_2 = Assert<Equal<Add<One, Two>, Three>>;
type Thm_2_times_3 = Assert<Equal<Mul<Two, Three>, Six>>;
type Thm_add_comm_2_3 = Assert<Equal<Add<Two, Three>, Add<Three, Two>>>;

// 誤った命題は検査に通らない
// @ts-expect-error 1 + 2 = 4 は偽
type Wrong_1_plus_2 = Assert<Equal<Add<One, Two>, Four>>;

// 0 + n = n は Add の定義からそのまま計算できるため任意のNで通る
type Thm_zero_plus_n<N extends Nat> = Assert<Equal<Add<Z, N>, N>>;

// n + 0 = n は第1引数Aで場合分けする定義では任意のNで計算が止まり、通らない（帰納法が必要）
// @ts-expect-error
type Stuck_n_plus_zero<N extends Nat> = Assert<Equal<Add<N, Z>, N>>;

// 個別の具体的なNでは通る
type Thm_3_plus_zero = Assert<Equal<Add<Three, Z>, Three>>;

// ---------- Part 4: 型システムの抜け穴 ----------

// any を経由すると任意の型の値、つまり任意の命題の「証明」を作れる
const proveAnything = <P>(): P => undefined as any;
const proofOfFalse: never = proveAnything<never>();

export {
  modusPonens,
  andComm,
  orComm,
  contrapositive,
  doubleNegIntro,
  deMorgan1,
  deMorgan2,
  doubleNegElim,
  excludedMiddle,
  proveAnything,
  proofOfFalse,
};
export type {
  Thm_1_plus_2,
  Thm_2_times_3,
  Thm_add_comm_2_3,
  Wrong_1_plus_2,
  Thm_zero_plus_n,
  Stuck_n_plus_zero,
  Thm_3_plus_zero,
};
