/***********************
 * Produtos (inventados)
 ***********************/
const products = {
  electronics: [
    { id: 101, name: 'Smartphone Atlas X', price: 329.90, description: 'Um smartphone rápido e moderno com excelente bateria.' },
    { id: 102, name: 'Portátil Nebula 14"', price: 749.00, description: 'Portátil leve, ideal para trabalho e estudo.' },
    { id: 103, name: 'Auriculares Pro ANC', price: 89.90, description: 'Auriculares com cancelamento de ruído ativo.' },
    { id: 104, name: 'Monitor 27" IPS 144Hz', price: 229.00, description: 'Monitor IPS de alta taxa de atualização para gamers.' }
  ],
  watches: [
    { id: 201, name: 'Relógio Clássico Aço', price: 59.90, description: 'Relógio elegante em aço inoxidável.' },
    { id: 202, name: 'Smartwatch Pulse S2', price: 119.00, description: 'Smartwatch com monitorização de saúde.' },
    { id: 203, name: 'Relógio Desportivo XRun', price: 79.90, description: 'Relógio resistente à água para desporto.' }
  ],
  shoes: [
    { id: 301, name: 'Ténis Urban Street', price: 64.90, description: 'Ténis confortáveis para o dia a dia.' },
    { id: 302, name: 'Ténis Runner Air', price: 84.90, description: 'Ténis leves para corrida.' },
    { id: 303, name: 'Ténis Canvas Low', price: 49.90, description: 'Ténis em lona, estilo casual.' }
  ],
  earrings: [
    { id: 401, name: 'Brincos Prata Minimal', price: 24.90, description: 'Brincos minimalistas em prata.' },
    { id: 402, name: 'Brincos Argola XL', price: 19.90, description: 'Brincos de argola grandes, tendência.' },
    { id: 403, name: 'Brincos Pérola Clássica', price: 29.90, description: 'Brincos clássicos com pérola.' }
  ]
};


/***********************
 * Estado geral
 ***********************/
let cartItems = [];
let feedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]');

/***********************
 * Autenticação
 ***********************/
const users = [
  { username: 'root', password: 'root', isowner: true },
  { username: 'ola', password: 'ola', isowner: false }
];
let currentUser = null;

function showLogin(){ openModal('login-modal'); }
function showSignup(){ openModal('signup-modal'); }

function doLogin(){
  const u = document.getElementById('login-user').value.trim();
  const p = document.getElementById('login-pass').value.trim();
  const found = users.find(x => x.username === u && x.password === p);
  const err = document.getElementById('login-error');
  if(found){
    currentUser = { username: found.username, isowner: !!found.isowner };
    err.textContent = '';
    closeModals();
    updateAuthUI();
    if (document.getElementById('feedbacks').classList.contains('active')) renderFeedbackSection();
  } else {
    err.textContent = 'Credenciais inválidas.';
  }
}

function doSignup(){
  const u = document.getElementById('signup-user').value.trim();
  const p = document.getElementById('signup-pass').value.trim();
  const err = document.getElementById('signup-error');
  if(!u || !p){ err.textContent = 'Preenche ambos os campos.'; return; }
  if(users.some(x => x.username === u)){ err.textContent = 'Esse utilizador já existe.'; return; }
  users.push({ username:u, password:p, isowner:false });
  err.textContent = '';
  closeModals();
  openModal('login-modal');
  document.getElementById('login-user').value = u;
}

function logout(){
  currentUser = null;
  updateAuthUI();
  if (document.getElementById('feedbacks').classList.contains('active')) renderFeedbackSection();
}

function updateAuthUI(){
  const greeting = document.getElementById('greeting');
  const logoutBtn = document.getElementById('logout-btn');
  const authBtns = document.getElementById('auth-buttons');
  if(currentUser){
    greeting.style.display = 'inline';
    greeting.textContent = `Olá, ${currentUser.username}${currentUser.isowner ? ' (owner)' : ''}`;
    logoutBtn.style.display = 'inline-block';
    authBtns.style.display = 'none';
  }else{
    greeting.style.display = 'none';
    logoutBtn.style.display = 'none';
    authBtns.style.display = 'flex';
  }
}

/***********************
 * Modais
 ***********************/
function openModal(id){
  document.getElementById('modal-overlay').classList.remove('hidden');
  document.getElementById(id).classList.remove('hidden');
}
function closeModals(){
  document.getElementById('modal-overlay').classList.add('hidden');
  document.getElementById('login-modal').classList.add('hidden');
  document.getElementById('signup-modal').classList.add('hidden');
  document.getElementById('login-error').textContent = '';
  document.getElementById('signup-error').textContent = '';
}

/***********************
 * Navegação / Render
 ***********************/
function showCategory(category){
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  const section = document.getElementById(category);
  section.classList.add('active');

  if(category === 'home'){ renderHome(); }
  if(category === 'electronics'){ renderCategoryList('electronics'); }
  if(category === 'watches'){ renderCategoryList('watches'); }
  if(category === 'shoes'){ renderCategoryList('shoes'); }
  if(category === 'earrings'){ renderCategoryList('earrings'); }
  if(category === 'feedbacks'){ renderFeedbackSection(); }
}

function renderHome(){
  const s = document.getElementById('home');
  s.innerHTML = `
    <div class="home-card">
      <h1>Bem-vindo ao Got Everything</h1>
      <p>Explora as categorias na aba lateral e descobre produtos incríveis, baratos e de ótima qualidade.<br>
      Aproveita as novidades e deixa o teu feedback!</p>
      <h3>Últimos produtos</h3>
      <div id="home-products"></div>
    </div>
  `;
  let all = [...products.electronics, ...products.watches, ...products.shoes, ...products.earrings];
  shuffle(all);
  const homeProducts = s.querySelector('#home-products');
  all.slice(0,2).forEach(p => homeProducts.appendChild(productCard(p, findCategory(p.id))));
  addProductListeners();
}

function renderCategoryList(catKey){
  const s = document.getElementById(catKey);
  s.innerHTML = `<h2 style="margin-bottom:10px;">${titleFromKey(catKey)}</h2>`;
  products[catKey].forEach(p => s.appendChild(productCard(p, catKey)));
  addProductListeners(); // Adiciona aqui!
}

// Função para adicionar os listeners aos produtos
function addProductListeners() {
  document.querySelectorAll('.product').forEach(prod => {
    prod.addEventListener('click', () => {
      const title = prod.querySelector('h3').innerText;
      const desc = prod.dataset.description || 'Sem descrição';
      const img = prod.dataset.image || '';

      modalTitle.innerText = title;
      modalDesc.innerText = desc;
      modalImage.src = img;

      modal.classList.remove('hidden');
      overlay.classList.remove('hidden');
    });
  });
}

function productCard(p, cat){
  const div = document.createElement('div');
  div.className = 'product';
  div.dataset.description = p.description || 'Sem descrição';
  div.innerHTML = `
    <h3>${p.name}</h3>
    <p>Preço: ${p.price.toFixed(2)}€</p>
    <button class="add-cart-btn">Adicionar ao Carrinho</button>
  `;
  // Adiciona evento ao botão para não abrir o modal
  div.querySelector('.add-cart-btn').addEventListener('click', function(e){
    e.stopPropagation(); // Impede abrir modal
    addToCart(p.id, cat);
  });
  return div;
}

/***********************
 * Utilitários
 ***********************/
function shuffle(arr){
  for(let i=arr.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [arr[i],arr[j]] = [arr[j],arr[i]];
  }
}
function findCategory(id){
  for(const k in products){
    if(products[k].some(p => p.id === id)) return k;
  }
  return null;
}
function titleFromKey(k){
  return ({
    electronics:'Eletrónica',
    watches:'Relógios',
    shoes:'Ténis',
    earrings:'Brincos'
  })[k] || k;
}

/***********************
 * Carrinho (quantidade e visual melhorado)
 ***********************/
const cartBtn = document.getElementById('cart-btn');
const cartDrawer = document.getElementById('cart-drawer');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalEl = document.querySelector('.cart-total');

cartBtn.addEventListener('click', () => {
  cartDrawer.classList.toggle('active');
});

function addToCart(id, category){
  const product = products[category].find(p => p.id === id);
  if(!product) return;
  const existing = cartItems.find(item => item.id === id);
  if(existing){
    existing.qty++;
  } else {
    cartItems.push({ ...product, qty: 1 });
  }
  updateCart();
}

function removeFromCart(index){
  cartItems.splice(index,1);
  updateCart();
}

function changeQty(index, delta){
  cartItems[index].qty += delta;
  if(cartItems[index].qty < 1) cartItems[index].qty = 1;
  updateCart();
}

function updateCart(){
  cartItemsContainer.innerHTML = '';
  let total = 0;
  cartItems.forEach((item, index) => {
    total += item.price * item.qty;
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.style.display = 'flex';
    div.style.justifyContent = 'space-between';
    div.style.alignItems = 'center';
    div.style.marginBottom = '8px';
    div.style.borderBottom = '1px solid #ccc';
    div.style.paddingBottom = '4px';

    div.innerHTML = `
      <div style="flex:1;">
        <strong>${item.name}</strong><br>
        ${item.price.toFixed(2)}€ x ${item.qty} = ${(item.price*item.qty).toFixed(2)}€
      </div>
      <div style="display:flex; gap:4px; align-items:center;">
        <button onclick="changeQty(${index}, -1)">-</button>
        <button onclick="changeQty(${index}, 1)">+</button>
        <button onclick="removeFromCart(${index})">❌</button>
      </div>
    `;
    cartItemsContainer.appendChild(div);
  });
  cartTotalEl.textContent = `Total: ${total.toFixed(2)}€`;

  // Adiciona botão de pagar
  let payBtn = document.getElementById('pay-btn');
  if (!payBtn) {
    payBtn = document.createElement('button');
    payBtn.id = 'pay-btn';
    payBtn.textContent = 'Pagar';
    payBtn.style.marginTop = '16px';
    payBtn.style.width = '100%';
    payBtn.style.padding = '10px';
    payBtn.style.background = '#ffd700';
    payBtn.style.color = '#222';
    payBtn.style.fontWeight = 'bold';
    payBtn.style.borderRadius = '10px';
    payBtn.style.border = 'none';
    payBtn.style.cursor = 'pointer';
    payBtn.onclick = function() {
      window.location.href = 'pagamento.html'; // Novo lugar/página
    };
    cartItemsContainer.parentElement.appendChild(payBtn);
  }
}
/***********************
 * Feedbacks
 ***********************/
function renderFeedbackSection() {
  const s = document.getElementById('feedbacks');
  s.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.className = 'feedback-wrap';

  // Formulário de feedback
  if (currentUser) {
    const form = document.createElement('form');
    form.className = 'feedback-form';
    form.onsubmit = function(e) {
      e.preventDefault();
      addFeedback();
    };
    form.innerHTML = `
      <textarea id="feedback-text" placeholder="Escreve aqui a tua opinião..." required></textarea>
      <div class="stars-select">
        <label for="feedback-stars">Estrelas:</label>
        <select id="feedback-stars">
          <option value="0">0</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
        </select>
      </div>
      <button type="submit">Enviar</button>
    `;
    wrap.appendChild(form);
  } else {
    const hint = document.createElement('div');
    hint.className = 'feedback-login-hint';
    hint.innerHTML = `Para comentar, faz <button onclick="showLogin()">login</button> ou <button onclick="showSignup()">sign up</button>`;
    wrap.appendChild(hint);
  }

  // Lista de feedbacks
  const list = document.createElement('div');
  list.className = 'feedback-list';
  feedbacks.slice().reverse().forEach((f, i, arr) => {
    const originalIndex = feedbacks.length - 1 - i;
    const div = document.createElement('div');
    div.className = 'feedback-item';
div.innerHTML = `
  <p>${f.text}</p>
  <div class="feedback-meta">
    <span>${f.user}</span> &middot; 
    <span>${f.date || ''}</span> &middot; 
    <span>${'★'.repeat(f.stars || 0)}</span>
  </div>
  <div class="feedback-actions">
    ${(currentUser && (currentUser.isowner || currentUser.username === f.user)) 
      ? `<button onclick="removeFeedback(${originalIndex})">Apagar</button>` 
      : ''}
  </div>
`;
    list.appendChild(div);
  });
  wrap.appendChild(list);

  s.appendChild(wrap);
}

function addFeedback() {
  const text = document.getElementById('feedback-text').value.trim();
  const stars = parseInt(document.getElementById('feedback-stars').value, 10);
  if (!text || !currentUser) return;
  feedbacks.push({
    user: currentUser.username,
    text,
    stars,
    date: new Date().toLocaleString()
  });
  saveFeedbacks();
  renderFeedbackSection();
}

function removeFeedback(index) {
  feedbacks.splice(index, 1);
  saveFeedbacks();
  renderFeedbackSection();
}
function addFeedback() {
  const text = document.getElementById('feedback-text').value.trim();
  const stars = Number(document.getElementById('feedback-stars').value); // Corrigido!
  if (!text || !currentUser) return;
  feedbacks.push({
    user: currentUser.username,
    text,
    stars,
    date: new Date().toLocaleString()
  });
  saveFeedbacks();
  renderFeedbackSection();
}

function saveFeedbacks(){
  localStorage.setItem('feedbacks', JSON.stringify(feedbacks));
}

/***********************
 * Inicialização
 ***********************/
showCategory('home');
updateCart();
updateAuthUI();

// JS para abrir modal de produto
const modal = document.getElementById('product-modal');
const overlay = document.getElementById('modal-overlay');
const modalTitle = document.getElementById('modal-title');
const modalImage = document.getElementById('modal-image');
const modalDesc = document.getElementById('modal-description');
const modalClose = document.getElementById('modal-close');

document.querySelectorAll('.product').forEach(prod => {
  prod.addEventListener('click', () => {
    const title = prod.querySelector('h3').innerText;
    const desc = prod.dataset.description || 'Sem descrição';
    const img = prod.dataset.image || '';

    modalTitle.innerText = title;
    modalDesc.innerText = desc;
    modalImage.src = img;

    modal.classList.remove('hidden');
    overlay.classList.remove('hidden');
  });
});

modalClose.addEventListener('click', () => {
  modal.classList.add('hidden');
  overlay.classList.add('hidden');
});

overlay.addEventListener('click', () => {
  modal.classList.add('hidden');
  overlay.classList.add('hidden');
});

(function(){
  const canvas = document.getElementById('stars-bg');
  const ctx = canvas.getContext('2d');
  let w = window.innerWidth, h = window.innerHeight;
  canvas.width = w;
  canvas.height = h;

  function resize() {
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;
  }
  window.addEventListener('resize', resize);

  // Estrelas
  const numStars = 120;
  const stars = [];
  for(let i=0; i<numStars; i++){
    stars.push({
      x: Math.random()*w,
      y: Math.random()*h,
      r: Math.random()*1.2+0.5,
      speed: Math.random()*0.4+0.1
    });
  }

  function animate(){
    ctx.clearRect(0,0,w,h);
    for(const star of stars){
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, 2*Math.PI);
      ctx.fillStyle = "#fff";
      ctx.globalAlpha = Math.random()*0.5+0.5;
      ctx.fill();
      ctx.globalAlpha = 1;
      star.y += star.speed;
      if(star.y > h){
        star.y = 0;
        star.x = Math.random()*w;
      }
    }
    requestAnimationFrame(animate);
  }
  animate();
})();