// Swipe-to-trade for The Litter — ETH wallet on Robinhood Chain, through the pons swap router.
// Buy: swap([{kind:21, tokenIn: WETH, tokenOut: TOKEN, pool: curve, 0,0,0,"0x",0x0,0x0}], 0x0, amountIn, minOut, deadline) with msg.value = amountIn.
// Sell: approve(router, amount) then the same swap with tokenIn/tokenOut flipped, value 0.
// Every trade is confirmed by the user in their wallet; this code only prepares the transaction.
const ROUTER_ABI = ["function swap((uint8,address,address,address,uint24,int24,address,bytes,address,bytes32)[] path, address recipient, uint256 amountIn, uint256 minOut, uint256 deadline) payable"];
const ERC20_ABI = ["function balanceOf(address) view returns (uint256)", "function allowance(address,address) view returns (uint256)", "function approve(address,uint256) returns (bool)", "function decimals() view returns (uint8)"];

async function ensureChain(eth) {
  const cur = await eth.request({ method: "eth_chainId" });
  if (cur.toLowerCase() === CHAIN.hex) return;
  try { await eth.request({ method: "wallet_switchEthereumChain", params: [{ chainId: CHAIN.hex }] }); }
  catch (e) {
    if (e.code !== 4902) throw e;
    await eth.request({ method: "wallet_addEthereumChain", params: [{ chainId: CHAIN.hex, chainName: CHAIN.name, rpcUrls: [CHAIN.rpc], blockExplorerUrls: [CHAIN.explorer], nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 } }] });
  }
}
function pathFor(token, side) {
  const [tIn, tOut] = side === "buy" ? [CHAIN.weth, token.ca] : [token.ca, CHAIN.weth];
  return [[CHAIN.curveKind, tIn, tOut, token.curve, 0, 0, ethers.ZeroAddress, "0x", ethers.ZeroAddress, ethers.ZeroHash]];
}
// Quote from the live curve price (the router's swap() returns no value, so it can't be read via eth_call).
// Bonding curves move with size — keep trades small or raise slippage.
function quoteFromMarket(market, side, amountIn) {
  if (!market || !market.priceUsd || !market.ethUsd) throw new Error("no live price yet");
  const priceEth = market.priceUsd / market.ethUsd; // ETH per token
  if (side === "buy") return ethers.parseUnits((Number(ethers.formatEther(amountIn)) / priceEth).toFixed(0), 18);
  return ethers.parseEther((Number(ethers.formatUnits(amountIn, 18)) * priceEth).toFixed(18));
}
async function executeTrade({ token, side, amountIn, slippageBps, market, onStatus }) {
  const eth = window.ethereum; if (!eth) throw new Error("No ETH wallet found");
  await ensureChain(eth);
  const provider = new ethers.BrowserProvider(eth);
  const signer = await provider.getSigner();
  const from = await signer.getAddress();
  const expected = quoteFromMarket(market, side, amountIn);
  const minOut = expected - (expected * BigInt(slippageBps)) / 10000n;
  const deadline = Math.floor(Date.now() / 1000) + 600;
  if (side === "sell") {
    const erc = new ethers.Contract(token.ca, ERC20_ABI, signer);
    const allowance = await erc.allowance(from, CHAIN.router);
    if (allowance < amountIn) { onStatus("Approve $" + token.ticker + " in your wallet…"); const tx = await erc.approve(CHAIN.router, amountIn); await tx.wait(); }
  }
  const router = new ethers.Contract(CHAIN.router, ROUTER_ABI, signer);
  onStatus("Confirm the swap in your wallet…");
  const tx = await router.swap(pathFor(token, side), ethers.ZeroAddress, amountIn, minOut, deadline, { value: side === "buy" ? amountIn : 0n });
  onStatus("Submitted — waiting for the chain…");
  const rc = await tx.wait();
  return { hash: tx.hash, expected, ok: rc.status === 1 };
}
async function tokenBalance(address, token) {
  const provider = new ethers.JsonRpcProvider(CHAIN.rpc);
  return new ethers.Contract(token.ca, ERC20_ABI, provider).balanceOf(address);
}
async function ethBalance(address) {
  return new ethers.JsonRpcProvider(CHAIN.rpc).getBalance(address);
}
