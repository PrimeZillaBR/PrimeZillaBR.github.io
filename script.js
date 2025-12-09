import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyD1VSEtXVbAdmVFxH1PDOyjTXGYX9so",
  authDomain: "primezilla-70894.firebaseapp.com",
  projectId: "primezilla-70894",
  storageBucket: "primezilla-70894.appspot.com",
  appId: "1:910889123782:web:b012886d70b287181302e0"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
// script.js - Carrega produtos do produtos.json e renderiza no site

const PHONE = "5567992018672"; // Seu WhatsApp
const DATA_URL = "https://primezillabr.github.io/produtos.json"; // Arquivo no GitHub

function esc(s) {
  return String(s || "").replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[m]));
}

function createCard(p) {
  const priceText = p.price ? `R$ ${Number(p.price).toFixed(2)}` : "Consultar";
  const img = p.imageUrl || "placeholder.png";

  const card = document.createElement("div");
  card.className = "card";

  card.innerHTML = `
    <div class="media">
      <img src="${esc(img)}" alt="${esc(p.name)}">
    </div>
    <div class="info">
      <h3>${esc(p.name)}</h3>
      <p class="price">${esc(priceText)}</p>

      <div class="controls">
        <label>Qtd
          <select class="qty"><option>1</option><option>2</option><option>3</option></select>
        </label>

        ${
          p.type === "pod"
            ? `
        <label>Sabor
          <select class="variant">
            ${(p.options || []).map(o => `<option>${esc(o)}</option>`).join("")}
          </select>
        </label>`
            : `
        <label>Cor
          <select class="variant">
            ${(p.options || []).map(o => `<option>${esc(o)}</option>`).join("")}
          </select>
        </label>`
        }

        <label>Pagamento
          <select class="pay"><option>PIX</option><option>Dinheiro</option><option>Cartão</option></select>
        </label>

        <button class="btnBuy">Comprar pelo WhatsApp</button>
      </div>
    </div>
  `;

  card.querySelector(".btnBuy").addEventListener("click", () => {
    const qtd = card.querySelector(".qty").value;
    const variant = card.querySelector(".variant").value;
    const pay = card.querySelector(".pay").value;
    const label = p.type === "pod" ? "Sabor" : "Cor";

    const text = encodeURIComponent(
      `Olá! Tenho interesse no produto: ${p.name}\nQuantidade: ${qtd}\n${label}: ${variant}\nValor: ${priceText}\nPagamento: ${pay}`
    );
    window.open(`https://wa.me/${PHONE}?text=${text}`, "_blank");
  });

  return card;
}

async function loadProducts() {
  const grid = document.getElementById("productsGrid");
  if (!grid) return;

  grid.innerHTML = "<p>Carregando produtos...</p>";

  try {
    const res = await fetch(DATA_URL + "?t=" + Date.now());
    const list = await res.json();

    grid.innerHTML = "";

    if (!list.length) {
      grid.innerHTML = "<p>Nenhum produto disponível.</p>";
      return;
    }

    list.forEach((p) => {
      const card = createCard(p);
      grid.appendChild(card);
    });

  } catch (e) {
    console.error("Erro ao carregar:", e);
    grid.innerHTML = "<p>Erro ao carregar produtos.</p>";
  }
}

document.addEventListener("DOMContentLoaded", loadProducts);
