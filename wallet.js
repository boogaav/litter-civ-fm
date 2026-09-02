// Sign-in-with-wallet for litter.civ.fm — Phantom (SOL) + MetaMask/any EIP-1193 (ETH).
const LITTER_API = "https://litter-api.boogaav.workers.dev";

function walletSession() {
  try { return JSON.parse(localStorage.getItem("litterWallet")); } catch { return null; }
}
const shortAddr = (a) => a.length > 12 ? a.slice(0, 5) + "…" + a.slice(-4) : a;

async function litterConnect(kind) {
  let address, chain, signature;
  if (kind === "sol") {
    const p = window.solana ?? window.phantom?.solana;
    if (!p) { window.open("https://phantom.app", "_blank"); return null; }
    address = (await p.connect()).publicKey.toString();
    chain = "sol";
  } else {
    const e = window.ethereum;
    if (!e) { window.open("https://metamask.io", "_blank"); return null; }
    address = (await e.request({ method: "eth_requestAccounts" }))[0];
    chain = "eth";
  }
  const { nonce, message } = await (await fetch(LITTER_API + "/auth/nonce", {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ address }),
  })).json();

  if (chain === "sol") {
    const p = window.solana ?? window.phantom?.solana;
    const signed = await p.signMessage(new TextEncoder().encode(message), "utf8");
    signature = btoa(String.fromCharCode(...signed.signature));
  } else {
    signature = await window.ethereum.request({ method: "personal_sign", params: [message, address] });
  }

  const res = await (await fetch(LITTER_API + "/auth/verify", {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ address, chain, nonce, signature }),
  })).json();
  if (!res.token) throw new Error(res.error ?? "login failed");
  try { localStorage.setItem("litterWallet", JSON.stringify(res)); } catch {}
  return res;
}

function litterDisconnect() {
  try { localStorage.removeItem("litterWallet"); } catch {}
}

// Renders the connect control into the element with id "walletBox".
function mountWalletButton(onChange) {
  const box = document.getElementById("walletBox");
  if (!box) return;
  const render = () => {
    const s = walletSession();
    if (s) {
      box.innerHTML = `<span class="badge liveai" style="cursor:pointer" title="click to disconnect">${s.chain === "sol" ? "◎" : "Ξ"} ${shortAddr(s.address)}</span>`;
      box.firstChild.onclick = () => { litterDisconnect(); render(); onChange?.(null); };
    } else {
      box.innerHTML = `<span class="badge" style="cursor:pointer">connect ◎ SOL</span> <span class="badge" style="cursor:pointer">connect Ξ ETH</span>`;
      const [sol, eth] = box.querySelectorAll("span");
      sol.onclick = async () => { try { const r = await litterConnect("sol"); if (r) { render(); onChange?.(r); } } catch (e) { alert(e.message); } };
      eth.onclick = async () => { try { const r = await litterConnect("eth"); if (r) { render(); onChange?.(r); } } catch (e) { alert(e.message); } };
    }
  };
  render();
}
