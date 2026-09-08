// THE FAMILY — single source of truth for the six kittens.
// Edit here; the slider (index.html) and the kitten pages (kitten.html) both read it.
// Launch cadence: one kitten token every Tuesday evening. Set `ca` when a token goes live.
const KITTENS = [
  { n: 1, name: "Chip",   sex: "♂", ticker: "CHIP",   pair: "NVDA", pairName: "NVIDIA",        launch: "2026-09-15", ca: null,
    bio: "The AI kitten. Sleeps like a datacenter cools — constantly and expensively. Paired with the chip that runs the world." },
  { n: 2, name: "Melon",  sex: "♀", ticker: "MELON",  pair: "TSLA", pairName: "Tesla",         launch: "2026-09-22", ca: null,
    bio: "Elon → Melon. Ships on her own schedule, which is never the announced one. Full self-driving toward the food bowl." },
  { n: 3, name: "Rocket", sex: "♂", ticker: "ROCKET", pair: "SPCX", pairName: "SpaceX",        launch: "2026-09-29", ca: null,
    bio: "The only kitten paired with a stock you can't buy anywhere but here. First to leave the pile. Pointed at orbit." },
  { n: 4, name: "Roary",  sex: "♀", ticker: "ROARY",  pair: "GME",  pairName: "GameStop",      launch: "2026-10-06", ca: null,
    bio: "Roaring Kitty's namesake. Tiny, loud, unbothered. Diamond paws since birth. Not leaving." },
  { n: 5, name: "Penny",  sex: "♀", ticker: "PENNY",  pair: "COIN", pairName: "Coinbase",      launch: "2026-10-13", ca: null,
    bio: "The runt with the biggest opinions. Paired with Coinbase because every fortune starts with one penny." },
  { n: 6, name: "Sailor", sex: "♂", ticker: "SAILOR", pair: "MSTR", pairName: "Strategy",      launch: "2026-10-20", ca: null,
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
  const d = new Date(k.launch + "T18:00:00Z");
  const days = Math.ceil((d - Date.now()) / 864e5);
  return `launches ${d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })} · in ${days}d`;
}
