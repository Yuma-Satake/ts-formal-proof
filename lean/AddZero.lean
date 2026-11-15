inductive N where
  | z : N
  | s : N → N

def add : N → N → N
  | .z, m => m
  | .s n, m => .s (add n m)

theorem add_zero (n : N) : add n .z = n := by
  induction n with
  | z => rfl
  | s k ih => simp [add, ih]
