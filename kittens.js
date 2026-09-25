// THE FAMILY — single source of truth for the six kittens.
// Edit here; the slider (index.html) and the kitten pages (kitten.html) both read it.
// Launch cadence: one kitten token every Tuesday evening. Set `ca` when a token goes live.
// Robinhood Chain + pons swap router (decoded from live transactions, selector 0x4d819a2a).
const CHAIN = { id: 4663, hex: "0x1237", name: "Robinhood Chain", rpc: "https://rpc.mainnet.chain.robinhood.com", explorer: "https://robinhoodchain.blockscout.com", weth: "0x0bd7d308f8e1639fab988df18a8011f41eacad73", router: "0xe492912F37C2A4eCa45D42DC67548F4C6Cd7ce2B", curveKind: 21 };
// `curve` = the token's bonding-curve contract on pons (set together with `ca` when a token launches).
const MAMA = { n: 0, name: "Mama", ticker: "LITTER", pair: "ETH", color: "#f3e4d3", ca: "0xAa2A90777994A29d659f1DEEB2E21Ae7de312b3A", curve: "0x61133fddc37fc61708465b1d78ae63ef5ed7b7b3", bio: "The mother. Runs the pace lane. Every fee on $LITTER buys her family's food." };
const KITTENS = [
  { n: 1, color: "#cfe8b3", name: "Hopper", sex: "♂", ticker: "HOPPER", pair: "NVDA", pairName: "NVIDIA",        launch: "2026-09-15", ca: null, curve: null,
    bio: "Named after NVIDIA's Hopper architecture — and after what he does to his siblings' heads. The AI kitten. Sleeps like a datacenter cools: constantly and expensively." },
  { n: 2, color: "#f5c6c0", name: "Melon",  sex: "♀", ticker: "MELON",  pair: "TSLA", pairName: "Tesla",         launch: "2026-09-22", ca: null, curve: null,
    bio: "Elon → Melon. Ships on her own schedule, which is never the announced one. Full self-driving toward the food bowl." },
  { n: 3, color: "#c9dcf5", name: "Rocket", sex: "♂", ticker: "ROCKET", pair: "SPCX", pairName: "SpaceX",        launch: "2026-09-29", ca: null, curve: null,
    bio: "The only kitten paired with a stock you can't buy anywhere but here. First to leave the pile. Pointed at orbit." },
  { n: 4, color: "#f7e3a1", name: "Roary",  sex: "♀", ticker: "ROARY",  pair: "GME",  pairName: "GameStop",      launch: "2026-10-06", ca: null, curve: null,
    bio: "Roaring Kitty's namesake. Tiny, loud, unbothered. Diamond paws since birth. Not leaving." },
  { n: 5, color: "#f6cfae", name: "Penny",  sex: "♀", ticker: "PENNY",  pair: "COIN", pairName: "Coinbase",      launch: "2026-10-13", ca: null, curve: null,
    bio: "The runt with the biggest opinions. Paired with Coinbase because every fortune starts with one penny." },
  { n: 6, color: "#d5d0ef", name: "Sailor", sex: "♂", ticker: "SAILOR", pair: "MSTR", pairName: "Strategy",      launch: "2026-10-20", ca: null, curve: null,
    bio: "Saylor → Sailor. Has never sold anything and never will. Buys the dip in mama's milk. Long everything." },
];

function kittenStatus(k) {
  if (k.ca) return "live";
  const now = new Date();
  const launch = new Date(k.launch + "T18:00:00Z"); // Tuesday evening
  const days = Math.ceil((launch - now) / 864e5);
  if (days <= 0 && now - launch < 864e5) return "tonight";
  return days <= 0 ? "pending" : "upcoming";
}

function kittenLaunchLabel(k) {
  const s = kittenStatus(k);
  if (s === "live") return "LIVE — trade now";
  if (s === "tonight") return "LAUNCHES TONIGHT";
  if (s === "pending") return "launch pending — CA soon";
  const d = new Date(k.launch + "T18:00:00Z");
  const days = Math.ceil((d - Date.now()) / 864e5);
  return `launches ${d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })} · in ${days}d`;
}
