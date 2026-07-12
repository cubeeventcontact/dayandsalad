/* 동작 로직 — 홈을 '5인 동등 라인업'으로 렌더 (특정 멤버 강조 없음)
   메뉴 데이터(MENU)는 menu-data.js 에서 먼저 로드됩니다. */

let currentMenu = null;

/* ===== 주문 상태 (localStorage) ===== */
const ORDER_KEY = 'dayand_order';
function getOrder(){
  try { return JSON.parse(localStorage.getItem(ORDER_KEY)); }
  catch(e){ return null; }
}
function saveOrder(order){
  localStorage.setItem(ORDER_KEY, JSON.stringify(order));
}
function renderOrderState(){
  const order = getOrder();
  const has = !!order;
  document.getElementById('trackEmpty').classList.toggle('hidden', has);
  document.getElementById('trackFilled').classList.toggle('hidden', !has);
  if(has){
    document.getElementById('tName').textContent = order.name || '-';
    document.getElementById('tAddr').textContent = order.addr || '주소 미입력';
    renderTrackPhoto(order);
  }
}

/* ===== 컨셉 공개 시간 판단 (서버 시간 기준 → 기기 시계 조작 무력화) ===== */
let REVEALED = false;  // 페이지 로드 시 1회 계산
async function initRevealState(){
  // ===== 데모 모드 (로컬에서만) =====
  //  ?reveal=1 → 공개 후 강제 / ?reveal=0 → 공개 전(블라인드) 강제 / 없음 → 실제 서버시간
  //  localhost 가 아니면 무시(배포된 실제 사이트엔 영향 없음)
  const isLocal = ['localhost', '127.0.0.1'].includes(location.hostname);
  const demo = isLocal ? new URLSearchParams(location.search).get('reveal') : null;
  if(window.FORCE_REVEAL){          // index-open.html 전용: 시간·호스트 무관하게 항상 공개(이미지 미리보기용)
    REVEALED = true;
  } else if(demo === '1' || demo === '0'){
    REVEALED = (demo === '1');
  } else {
    let now;
    try {
      const r = await fetch(location.href, { method:'HEAD', cache:'no-store' });
      const d = r.headers.get('Date');           // 서버가 내려주는 현재 시각(UTC)
      now = d ? new Date(d) : new Date();
    } catch(e){ now = new Date(); }              // 실패 시에만 기기시간 폴백
    REVEALED = (typeof REVEAL_AT !== 'undefined') && (now.getTime() >= new Date(REVEAL_AT).getTime());
  }
  // 공개 여부가 정해지면 메뉴 이미지(미리보기/썸네일/상세) + 메인배너 다시 반영
  renderLineup();
  renderMenu();
  renderBanner();
  if(currentMenu && document.getElementById('detail').classList.contains('active')){
    slotBg(document.getElementById('detailHero'), currentMenu, 'detail');
  }
}

/* 배달현황 사진 — 단일 고정 이미지 (전환 없음) */
function renderTrackPhoto(order){
  const mapEl = document.getElementById('map');
  if(!mapEl) return;
  mapEl.style.background = (typeof TRACK_IMG === 'string')
    ? `#1e1513 url('${TRACK_IMG}') center/cover`
    : 'linear-gradient(135deg,#3a2a28,#1e1513)';
  mapEl.innerHTML = '';
}

/* ===== 메뉴 이미지 슬롯 (공개 전 blind / 공개 후 preview·thumb·detail) =====
   파일이 없으면(404) 그라데이션 placeholder 유지 → 에셋 오기 전에도 화면 정상 */
function slotBg(el, m, type){
  if(!el) return;
  el.style.background = m.grad;                 // 기본 placeholder(그라데이션)
  el.style.backgroundSize = 'cover';
  el.style.backgroundPosition = 'center';
  const cfg = (typeof MENU_IMG !== 'undefined') && MENU_IMG[m.id];
  if(!cfg) return;
  const blind    = cfg[type + 'Blind'];                // 슬롯별 블라인드(previewBlind/thumbBlind/detailBlind)
  const target   = REVEALED ? cfg[type] : blind;       // 공개 후=해당 컷 / 공개 전=블라인드
  const fallback = REVEALED ? blind : null;            // 공개 이미지 없으면 블라인드로
  loadInto(el, target, fallback);
}
function loadInto(el, src, fallbackSrc){
  if(!src) return;
  const img = new Image();
  img.onload  = () => { el.style.background = `url('${src}') center/cover`; };
  img.onerror = () => { if(fallbackSrc) loadInto(el, fallbackSrc, null); };  // 없으면 fallback, 그것도 없으면 그라데이션 유지
  img.src = src;
}

/* 메인배너 — 공개 전 blind / 공개 후 banner (이미지 없으면 인라인 그라데이션 유지) */
function renderBanner(){
  const el = document.querySelector('.banner-wrap .slide');
  if(!el) return;
  const blind  = (typeof BANNER_BLIND === 'string') ? BANNER_BLIND : null;
  const reveal = (typeof BANNER_IMG === 'string') ? BANNER_IMG : null;
  loadInto(el, REVEALED ? reveal : blind, REVEALED ? blind : null);
}

/* 홈 렌더 — 5인 동등 라인업 (모두 같은 크기·스타일, 멤버 중심) */
function renderLineup(){
  const el = document.getElementById('homeLineup');
  if(!el) return;
  el.innerHTML = MENU.map(m=>`
    <div class="lineup-card" onclick="openDetail(${m.id})">
      <div class="photo" style="background:${m.grad}">
        <span class="mname">${m.member.replace(' PICK','')}</span>
      </div>
      <div class="body">
        <h4>${m.name}</h4>
        <div class="price">${m.price}원</div>
      </div>
    </div>`).join('');
  const photos = el.querySelectorAll('.lineup-card .photo');   // 미리보기 240×300
  MENU.forEach((m,i)=>{ if(photos[i]) slotBg(photos[i], m, 'preview'); });
}

/* 전체보기(menu 페이지) 메뉴 리스트 — 5종 전체 세로 리스트 */
function renderMenu(){
  const html = MENU.map(m=>`
    <div class="menu-card" onclick="openDetail(${m.id})">
      <div class="thumb" style="background:${m.grad}">
        <div class="badge">${m.badge}</div>
      </div>
      <div class="body">
        <h4>${m.name}</h4>
        <div class="desc">${m.desc}</div>
        <div class="meta">⭐ 5.0 · ${m.member}</div>
        <div class="price">${m.price}원 <small>· 무료배송</small></div>
      </div>
    </div>`).join('');
  const el = document.getElementById('menuList');
  if(el){
    el.innerHTML = html;
    const thumbs = el.querySelectorAll('.menu-card .thumb');   // 썸네일 240×240
    MENU.forEach((m,i)=>{ if(thumbs[i]) slotBg(thumbs[i], m, 'thumb'); });
  }
}

/* 상세 열기 */
let detailFrom = 'menu';
function openDetail(id){
  const active = document.querySelector('.screen.active');
  if(active) detailFrom = active.id;
  const m = MENU.find(x=>x.id===id);
  currentMenu = m;
  const hero = document.getElementById('detailHero');
  hero.innerHTML = '';         // 뒤로가기는 상단 고정 바(#detailTopbar)로 이동
  slotBg(hero, m, 'detail');   // 상세 840×600 (공개 전 블라인드)
  document.getElementById('detailTopTitle').textContent = m.name;
  document.getElementById('detailBody').innerHTML = `
    <div class="eyebrow">${m.badge} menu</div>
    <h2>${m.name}</h2>
    <div class="price">${m.price}원 <small>무료배송</small></div>
    <div class="long">${m.long}</div>
    <div class="nutri">
      <div><b>${m.kcal}</b><span>kcal</span></div>
      <div><b>${m.protein}</b><span>Serving Size</span></div>
      <div><b>${m.time}</b><span>조리시간</span></div>
    </div>
    <h3 style="font-size:15px;font-weight:800;margin-top:18px;">주요 성분</h3>
    <div class="ingredients">${m.ing.map(i=>`<span class="chip">${i}</span>`).join('')}</div>
    ${m.caution ? `<h3 style="font-size:15px;font-weight:800;margin-top:18px;color:var(--point);">주의 사항</h3>
    <p style="font-size:13px;color:var(--green-dark);line-height:1.6;margin-top:6px;">${m.caution}</p>` : ''}
  `;
  go('detail');
  const ds = document.getElementById('detailScroll');
  ds.scrollTop = 0;            // 새 상세 열 때 맨 위로
  document.getElementById('detailTopbar').classList.remove('scrolled');  // 바 초기화(투명)
}

/* 화면 전환 */
function go(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  const screen = document.getElementById(id);
  screen.classList.add('active');
  screen.scrollTop = 0;
  document.body.classList.toggle('on-detail', id==='detail');
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('on'));
  if(id==='home'||id==='menu') document.querySelector('.tab').classList.add('on');
  if(id==='track'){
    document.querySelectorAll('.tab')[1].classList.add('on');
    renderOrderState();
  }
}

/* 주문 폼 모달 */
function openOrder(){
  document.getElementById('orderTitle').textContent = '배송정보';
  document.getElementById('orderModal').classList.add('active');
}
function closeOrder(){ document.getElementById('orderModal').classList.remove('active'); }
document.getElementById('orderModal').addEventListener('click',e=>{
  if(e.target.id==='orderModal') closeOrder();
});

/* ===== 구글 폼 연동 ===== */
const GFORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSe80T6i-WwTEdqTHv-IgCr2PxSMETRAFGDprIBXfTTdqkBkcA/formResponse';
const GFORM_ENTRY = {
  name:  'entry.408976588',   // 받는 분
  phone: 'entry.667907544',   // 연락처
  addr:  'entry.1850214008',  // 배달 주소
  msg:   'entry.1549662368',  // 요청 사항
  menu:  'entry.1225035593'   // 주문메뉴
};
function sendToGoogleForm(d){
  const body = new URLSearchParams();
  body.append(GFORM_ENTRY.name,  d.name  || '');
  body.append(GFORM_ENTRY.phone, d.phone || '');
  body.append(GFORM_ENTRY.addr,  d.addr  || '');
  body.append(GFORM_ENTRY.msg,   d.msg   || '');
  body.append(GFORM_ENTRY.menu,  d.menu  || '');
  // no-cors: 응답은 못 읽지만 전송됨 → 결과는 구글 시트에서 확인
  return fetch(GFORM_URL, { method:'POST', mode:'no-cors',
    headers:{'Content-Type':'application/x-www-form-urlencoded'}, body });
}

/* 주문 제출 */
function submitOrder(){
  const name = document.getElementById('fName').value.trim();
  const phone = document.getElementById('fPhone').value.trim();
  const addr = document.getElementById('fAddr').value.trim();
  const msg = document.getElementById('fMsg').value.trim();
  const consent = document.getElementById('fConsent').checked;

  if(!name){ alert('받는 분을 입력해주세요.'); return; }   // 연락처는 선택
  if(!consent){ alert('개인정보 수집·이용 동의가 필요해요.'); return; }

  const data = { menu: currentMenu?.name, menuId: currentMenu?.id, name, phone, addr, msg, time:new Date().toISOString() };
  console.log('수집된 주문 데이터:', data);
  sendToGoogleForm(data);   // ← 구글 폼으로 전송

  saveOrder(data);
  closeOrder();
  renderOrderState();
  go('track');
}

/* ===== 공유하기 (프로모션 문구 + 링크 클립보드 복사) ===== */
// ▼ 공유 문구는 여기서 수정하세요
const SHARE_TEXT = '#나우즈가 데이앤을 위해 준비한 특별한 샐러드';
// 배포 후엔 실제 도메인이 자동으로 들어갑니다. 특정 URL 로 고정하려면 직접 입력하세요.
const PROMO_URL = location.origin + location.pathname;

function sharePromo(){
  const text = `${SHARE_TEXT}\n${PROMO_URL}`;
  // 1순위: 네이티브 공유 시트 (지원 기기 — 주로 모바일). 카톡·인스타 등으로 바로 전송
  if(navigator.share){
    navigator.share({ text: SHARE_TEXT, url: PROMO_URL }).catch(err=>{
      if(err && err.name === 'AbortError') return;  // 사용자가 공유 취소 → 아무 동작 안 함
      copyToClipboard(text);                         // 그 외 실패 시에만 복사로 폴백
    });
    return;
  }
  // 2순위: 공유 시트 미지원 → 클립보드 복사
  copyToClipboard(text);
}

/* 클립보드 복사 (공유 시트 미지원 시) */
function copyToClipboard(text){
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(text)
      .then(()=>showToast('링크가 복사되었어요'))
      .catch(()=>fallbackCopy(text));
  } else {
    fallbackCopy(text);
  }
}

/* 구형 브라우저 / file:// / 비보안 컨텍스트 대비 폴백 */
function fallbackCopy(text){
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed'; ta.style.top = '-1000px'; ta.style.opacity = '0';
  document.body.appendChild(ta); ta.focus(); ta.select();
  let ok = false;
  try { ok = document.execCommand('copy'); } catch(e){ ok = false; }
  document.body.removeChild(ta);
  showToast(ok ? '링크가 복사되었어요' : '복사에 실패했어요. 길게 눌러 복사해주세요');
}

/* 하단 토스트 안내 */
function showToast(msg){
  let t = document.getElementById('toast');
  if(!t){
    t = document.createElement('div');
    t.id = 'toast'; t.className = 'toast';
    (document.querySelector('.phone') || document.body).appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(()=>t.classList.remove('show'), 1900);
}

/* ===== 데스크탑 마우스 드래그로 가로 스크롤 (모바일 터치 스와이프는 기본 지원) ===== */
function enableDragScroll(el){
  if(!el) return;
  let isDown = false, startX = 0, startScroll = 0, moved = false;
  el.addEventListener('mousedown', e=>{
    isDown = true; moved = false;
    startX = e.pageX; startScroll = el.scrollLeft;
    el.classList.add('dragging');
  });
  window.addEventListener('mousemove', e=>{
    if(!isDown) return;
    const dx = e.pageX - startX;
    if(Math.abs(dx) > 4) moved = true;     // 4px 이상 움직이면 '드래그'로 간주
    el.scrollLeft = startScroll - dx;
  });
  window.addEventListener('mouseup', ()=>{
    if(!isDown) return;
    isDown = false; el.classList.remove('dragging');
  });
  // 드래그였다면 카드 클릭(상세 열기) 막기 (capture 단계에서 가로채기)
  el.addEventListener('click', e=>{
    if(moved){ e.preventDefault(); e.stopPropagation(); moved = false; }
  }, true);
}

/* 배너는 단일 이미지로 통일 — 슬라이드/도트/자동전환 로직 제거됨 */

renderLineup();      // 홈: 5인 동등 라인업
renderMenu();        // 전체보기: 5종 전체
renderBanner();      // 메인배너 (공개 전 블라인드)
renderOrderState();  // 주문 유무 반영
enableDragScroll(document.getElementById('homeLineup'));  // PC 마우스 드래그 스크롤
initRevealState();   // 서버 시간 확인 → 공개 여부 판단(메뉴 이미지·배너)

/* 상세 스크롤 시 상단 뒤로가기 바 페이드인(흰 배경) 토글 */
(function(){
  const ds = document.getElementById('detailScroll');
  const tb = document.getElementById('detailTopbar');
  if(ds && tb) ds.addEventListener('scroll', () => {
    tb.classList.toggle('scrolled', ds.scrollTop > 40);
  }, {passive:true});
})();
