// script.js
// Responsável por ler os produtos do Firestore e renderizar a grade na index.html
// Usa o mesmo firebaseConfig que você já forneceu.

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDlzVS8ZkI4bVAmcFyKH1PDojvTXGYXyso",
  authDomain: "primezilla-70b94.firebaseapp.com",
  projectId: "primezilla-70b94",
  storageBucket: "primezilla-70b94.firebasestorage.app",
  appId: "1:910803172382:web:db82186d77b8281f13020f"
};

const PHONE = '5567992018672'; // seu WhatsApp (formato wa.me)

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function esc(s){ return String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

function createCard(p){
  const priceText = p.price ? `${p.currency||'R$'} ${Number(p.price).toFixed(2)}` : 'Consultar valores';
  const img = p.imageUrl || p.image || 'placeholder.png';

  const card = document.createElement('div');
  card.className = 'card';

  card.innerHTML = `
    <div class="media"><img src="${esc(img)}" alt="${esc(p.name)}"></div>
    <div class="info">
      <h3>${esc(p.name)}</h3>
      <p class="price">${esc(priceText)}</p>
      <div class="controls">
        <label>Qtd
          <select class="qty"><option>1</option><option>2</option><option>3</option></select>
        </label>
        <label class="variantLabel">${p.type === 'pod' ? 'Sabor' : 'Cor'}
          <select class="variant">${(p.options||[]).map(o=>`<option>${esc(o)}</option>`).join('')}</select>
        </label>
        <label>Pagamento
          <select class="pay"><option>PIX</option><option>Dinheiro</option><option>Cartão</option></select>
        </label>
        <button class="btnBuy">Comprar (WhatsApp)</button>
      </div>
    </div>
  `;

  // evento do botão
  card.querySelector('.btnBuy').addEventListener('click', ()=>{
    const qtd = card.querySelector('.qty').value;
    const variant = card.querySelector('.variant').value || '-';
    const pay = card.querySelector('.pay').value;
    const variantLabel = (p.type === 'pod') ? 'Sabor' : 'Cor';
    const valorText = p.price ? `${p.currency||'R$'} ${Number(p.price).toFixed(2)}` : 'Consultar valores';

    const text = encodeURIComponent(
      `Olá! Tenho interesse no produto: ${p.name}\nQuantidade: ${qtd}\n${variantLabel}: ${variant}\nValor: ${valorText}\nForma de Pagamento: ${pay}`
    );
    window.open(`https://wa.me/${PHONE}?text=${text}`, '_blank');
  });

  return card;
}

document.addEventListener('DOMContentLoaded', ()=>{
  const grid = document.getElementById('productsGrid');
  if(!grid){
    console.error('Elemento #productsGrid não encontrado na página. Verifique index.html');
    return;
  }

  grid.innerHTML = '<p>Carregando produtos...</p>';

  const q = query(collection(db, 'products'), orderBy('createdAt','desc'));
  onSnapshot(q, snap => {
    grid.innerHTML = '';
    let count = 0;
    snap.forEach(doc => {
      const p = doc.data();
      if(!p) return;
      // alguns usuários salvam produto sem "active" — considerar ativo por padrão
      if(p.active === false) return;
      const card = createCard(p);
      grid.appendChild(card);
      count++;
    });
    if(count === 0) grid.innerHTML = '<p>Nenhum produto disponível.</p>';
  }, err=>{
    console.error('Erro ao ler produtos:', err);
    grid.innerHTML = '<p>Erro ao carregar produtos. Verifique console.</p>';
  });
});
