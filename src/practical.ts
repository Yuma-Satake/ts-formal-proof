// コンパイラが実際に検査している範囲だけを使った、アプリケーションコードの例。
// 実行: 同ディレクトリの check.sh

// ---------- 1. 網羅性: 到達できない分岐が never（偽）であることを検査させる ----------

type PaymentMethod =
  | { readonly kind: "card"; readonly last4: string }
  | { readonly kind: "bank"; readonly bank: string }
  | { readonly kind: "convenience" };

const assertNever = (x: never): never => {
  throw new Error(`unreachable: ${JSON.stringify(x)}`);
};

const paymentLabel = (m: PaymentMethod): string => {
  switch (m.kind) {
    case "card":
      return `card ${m.last4}`;
    case "bank":
      return `bank ${m.bank}`;
    case "convenience":
      return "convenience store";
    default:
      return assertNever(m);
  }
};

const incompleteLabel = (m: PaymentMethod): string => {
  switch (m.kind) {
    case "card":
      return "card";
    case "bank":
      return "bank";
    default:
      // @ts-expect-error convenience の処理が漏れているため m は never にならない
      return assertNever(m);
  }
};

// ---------- 2. 状態遷移: 許されない順序の呼び出しをコンパイルエラーにする ----------

type OrderStatus = "draft" | "paid" | "shipped";

interface Order<S extends OrderStatus> {
  readonly id: string;
  readonly status: S;
}

const pay = (o: Order<"draft">): Order<"paid"> => ({ ...o, status: "paid" });
const ship = (o: Order<"paid">): Order<"shipped"> => ({ ...o, status: "shipped" });

const draftOrder: Order<"draft"> = { id: "order-1", status: "draft" };
const shippedOrder = ship(pay(draftOrder));

// @ts-expect-error 未払いの注文は出荷できない
ship(draftOrder);

// 型は支払いの事実までは保証しない。Order<"paid"> は pay を通さなくても直接書ける
const forgedPaidOrder: Order<"paid"> = { id: "order-2", status: "paid" };
const shippedForged = ship(forgedPaidOrder);

export { paymentLabel, incompleteLabel, shippedOrder, shippedForged };
