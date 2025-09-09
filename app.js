const { createClient } = window.supabase;
const SUPABASE_URL = "https://dnygudxhimjksxedzckl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRueWd1ZHhoaW1qa3N4ZWR6Y2tsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NzA5NTEsImV4cCI6MjA3MjM0Njk1MX0.VysJaMOWnPpkg0ty4F68C5G_fI7gw8iabDL4SE_mzWI";
const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const $ = (id)=>document.getElementById(id);
const show = (id)=>$(id).classList.remove('hide');
const hide = (id)=>$(id).classList.add('hide');
const fmt = (n,d=0)=>Number(n||0).toLocaleString('es-PE',{maximumFractionDigits:d,minimumFractionDigits:d});
const todayKey = ()=> new Date().toISOString().slice(0,10);
const toast = (msg)=>{ const t=$("toast"); t.textContent=msg; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),2600); };
const LS = { get:(k,f)=>{ try{ return JSON.parse(localStorage.getItem(k))??f }catch{ return f } }, set:(k,v)=>localStorage.setItem(k,JSON.stringify(v)), del:(k)=>localStorage.removeItem(k) };

// --- Perfil
async function getUser(){ const { data:{ user } } = await sb.auth.getUser(); return user||null; }
async function getProfile(userId){ const { data, error } = await sb.from('profiles').select('*').eq('id', userId).maybeSingle(); if(error){ console.warn('profiles select', error.message); return null } return data||null }
async function ensureProfile(){ const user = await getUser(); if(!user) return null; let prof = await getProfile(user.id); if(!prof){ const { error } = await sb.from('profiles').insert({ id:user.id, display_name:user.email }); if(error) console.warn('profiles insert', error.message); prof = await getProfile(user.id) } return prof }
function setLoggedUI(user){ show('topbar'); hide('hero-guest'); show('dashboard'); $('userBadge').textContent=user.email }
function setGuestUI(){ hide('topbar'); show('hero-guest'); hide('dashboard') }

// --- Auth flows
async function doSignup(){ const email=($('suEmail').value||'').trim(); const password=$('suPass').value||''; const btn=$('btnDoSignup'); const msg=$('suMsg'); msg.textContent=''; if(!email||!password||password.length<6){ msg.textContent='Completa correo y una contraseña de al menos 6 caracteres.'; return } btn.disabled=true; try{ const { error }=await sb.auth.signUp({ email, password, options:{ emailRedirectTo: window.location.origin } }); if(error) throw error; msg.textContent='Cuenta creada. Verifica tu correo y luego inicia sesión.' }catch(err){ msg.textContent='Error: '+(err?.message||'No se pudo crear la cuenta') } finally{ btn.disabled=false } }
async function doLogin(){ const email=($('liEmail').value||'').trim(); const password=$('liPass').value||''; const btn=$('btnDoLogin'); const msg=$('liMsg'); msg.textContent=''; if(!email||!password){ msg.textContent='Ingresa tu correo y contraseña.'; return } btn.disabled=true; try{ const { error }=await sb.auth.signInWithPassword({ email, password }); if(error) throw error }catch(err){ msg.textContent='Error de acceso: '+(err?.message||'verifica tus datos') } finally{ btn.disabled=false } }
async function doForgot(){ const email=($('liEmail').value||'').trim(); const msg=$('liMsg'); if(!email){ msg.textContent='Escribe tu correo para enviarte el enlace de recuperación.'; return } try{ const { error }=await sb.auth.resetPasswordForEmail(email,{ redirectTo: window.location.origin+'#type=recovery' }); if(error) throw error; msg.textContent='Te enviamos un enlace para reestablecer tu contraseña.' }catch(err){ msg.textContent='No se pudo enviar el correo: '+(err?.message||'intenta de nuevo') } }

// --- Tabs
const tabs=['resumen','calculadora','comidas','progreso'];
function setTab(name){ tabs.forEach(id=>{ const btn=document.querySelector(`button[data-tab="${id}"]`); const sec=$(id); const active=id===name; if(btn) btn.setAttribute('aria-current', active?'page':'false'); if(sec) sec.classList.toggle('hide', !active); }) }

// --- Cálculo macros
function mifflinStJeor({sex,age,height,weight}){ const s=sex==='male'?5:-161; return (10*weight)+(6.25*height)-(5*age)+s }
function tdee({bmr,activity}){ return bmr*activity }
function goalAdj(kcal,goal){ if(goal==='deficit') return kcal*0.90; if(goal==='surplus') return kcal*1.10; return kcal }
function splitMacros({weight,kcal,proteinGPerKg,fatPct}){ const pG=proteinGPerKg*weight; const pKcal=pG*4; const fKcal=(fatPct/100)*kcal; const fG=fKcal/9; const cKcal=Math.max(kcal-pKcal-fKcal,0); const cG=cKcal/4; const fiber=Math.round((kcal/1000)*14); return {kcal:Math.round(kcal),pG:Math.round(pG),cG:Math.round(cG),fG:Math.round(fG),fiber} }
function calcAndRender(){ const sex=$('sex').value, age=+$('age').value, height=+$('height').value, weight=+$('weight').value; const activity=+$('activity').value, goal=$('goal').value; const proteinGPerKg=+$('protein').value, fatPct=+$('fatPct').value; if(!sex||!age||!height||!weight||!activity||!goal||!proteinGPerKg||!fatPct){ $('calcMsg').textContent='Completa todos los campos.'; return } if(fatPct<15||fatPct>40){ $('calcMsg').textContent='El % de grasa debe estar entre 15% y 40%.'; return } const bmr=mifflinStJeor({sex,age,height,weight}); const kcal=goalAdj(tdee({bmr,activity}),goal); const out=splitMacros({weight,kcal,proteinGPerKg,fatPct}); $('outKcal').textContent=fmt(out.kcal); $('outProt').textContent=`${fmt(out.pG)} g`; $('outCarb').textContent=`${fmt(out.cG)} g`; $('outFat').textContent=`${fmt(out.fG)} g`; $('outFiber').textContent=`${fmt(out.fiber)} g`; show('calcOut'); $('calcMsg').textContent='Cálculo actualizado ✅'; LS.set('last_calc',{sex,age,height,weight,activity,goal,proteinGPerKg,fatPct,out,ts:Date.now()}) }

// --- Foods & Diary
function escapeHtml(s){ return (s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])) }
function normalizeFood(f){ return { id:f.id||crypto.randomUUID(), name:(f.name||'').trim(), brand:(f.brand||'').trim(), serving:+f.serving, kcal:+f.kcal, p:+f.p, c:+f.c, g:+f.g, fi:+f.fi } }
function saveFoodLocal(food){ const list=LS.get('foods',[]); const idx=list.findIndex(x=>x.name.toLowerCase()===food.name.toLowerCase() && x.brand.toLowerCase()===food.brand.toLowerCase()); if(idx>-1) list[idx]=food; else list.unshift(food); LS.set('foods',list); return food }
async function saveFoodSupabase(food){ try{ const user=await getUser(); if(!user) return; await sb.from('foods').upsert({ user_id:user.id, food }) }catch(err){ console.warn('foods upsert', err?.message) } }
function renderFoods(filter=''){ const tbody=$('foodsTable'); tbody.innerHTML=''; const list=LS.get('foods',[]); const q=(filter||'').toLowerCase(); list.filter(x=>x.name.toLowerCase().includes(q)||x.brand.toLowerCase().includes(q)).slice(0,200).forEach(f=>{ const tr=document.createElement('tr'); tr.innerHTML=`<td><strong>${escapeHtml(f.name)}</strong> <small class="muted">${escapeHtml(f.brand||'')}</small></td><td>${fmt(f.serving)} g</td><td>${fmt(f.kcal)}</td><td>${fmt(f.p,1)}</td><td>${fmt(f.c,1)}</td><td>${fmt(f.g,1)}</td><td class="right"><button class="btn btn-soft" data-add="${f.id}">+ diario</button></td>`; tbody.appendChild(tr) }) }
function logToDay(food,qty){ const key='day:'+todayKey(); const rows=LS.get(key,[]); rows.push({ id:crypto.randomUUID(), fid:food.id, name:food.name, brand:food.brand, serving:food.serving, qty, kcal:food.kcal*qty, p:food.p*qty, c:food.c*qty, g:food.g*qty }); LS.set(key,rows); renderDay(); renderSummary() }
function removeFromDay(id){ const key='day:'+todayKey(); const rows=LS.get(key,[]).filter(r=>r.id!==id); LS.set(key,rows); renderDay(); renderSummary() }
function totals(rows){ return rows.reduce((a,r)=>({kcal:a.kcal+r.kcal,p:a.p+r.p,c:a.c+r.c,g:a.g+r.g}),{kcal:0,p:0,c:0,g:0}) }
function renderDay(){ $('todayLabel').textContent=todayKey(); const key='day:'+todayKey(); const rows=LS.get(key,[]); const tbody=$('dayTable'); tbody.innerHTML=''; rows.forEach(r=>{ const tr=document.createElement('tr'); tr.innerHTML=`<td><strong>${escapeHtml(r.name)}</strong> <small class="muted">${escapeHtml(r.brand||'')}</small></td><td>${fmt(r.serving)} g</td><td>${fmt(r.qty,2)}</td><td>${fmt(r.kcal)}</td><td>${fmt(r.p,1)}</td><td>${fmt(r.c,1)}</td><td>${fmt(r.g,1)}</td><td class="right"><button class="btn" data-del="${r.id}">Eliminar</button></td>`; tbody.appendChild(tr) }); const t=totals(rows); $('totKcal').textContent=fmt(t.kcal); $('totProt').textContent=fmt(t.p,1); $('totCarb').textContent=fmt(t.c,1); $('totFat').textContent=fmt(t.g,1) }
function renderSummary(){ const key='day:'+todayKey(); const rows=LS.get(key,[]); const t=totals(rows); const targets=LS.get('targets:'+todayKey(),null); let kcal=0,p=0,c=0,g=0; if(targets){ kcal=targets.kcal; p=targets.pG; c=targets.cG; g=targets.fG } $('sumCalGoal').textContent=kcal?fmt(kcal):'—'; $('sumProtGoal').textContent=p?fmt(p):'—'; $('sumCarbGoal').textContent=c?fmt(c):'—'; $('sumFatGoal').textContent=g?fmt(g):'—'; $('sumCalIn').textContent=fmt(t.kcal); $('sumProtIn').textContent=fmt(t.p,1); $('sumCarbIn').textContent=fmt(t.c,1); $('sumFatIn').textContent=fmt(t.g,1); const pct=(v,goal)=>!goal?0:Math.min(Math.round((v/goal)*100),100); $('barCal').style.width=pct(t.kcal,kcal)+'%'; $('barProt').style.width=pct(t.p,p)+'%'; $('barCarb').style.width=pct(t.c,c)+'%'; $('barFat').style.width=pct(t.g,g)+'%' }
function renderAdherence(){ const host=$('adherence'); host.innerHTML=''; const days=[...Array(7).keys()].map(i=>{ const d=new Date(); d.setDate(d.getDate()-i); return d.toISOString().slice(0,10) }).reverse(); const frag=document.createDocumentFragment(); days.forEach(d=>{ const rows=LS.get('day:'+d,[]); const t=totals(rows); const targets=LS.get('targets:'+d,null)||LS.get('targets:'+todayKey(),null); const kcalTarget=targets?.kcal||2000; const pct=Math.min(Math.round((t.kcal/kcalTarget)*100),130); const wrap=document.createElement('div'); wrap.className='stack-8'; wrap.innerHTML=`<div class="row" style="justify-content:space-between"><strong>${d}</strong><small class="muted">${fmt(t.kcal)} / ${fmt(kcalTarget)} kcal</small></div><div class="bar"><span style="width:${pct}%"></span></div>`; frag.appendChild(wrap) }); host.appendChild(frag) }

// --- UI Events
document.addEventListener('click',(e)=>{ const t=e.target; if(t.matches('nav.tabs button')) setTab(t.dataset.tab); if(t.id==='btnLogout'||t.id==='btnHeaderLogout') logout(); if(t.id==='btnOpenSignup') openModal('signupModal'); if(t.id==='btnOpenLogin') openModal('loginModal'); if(t.id==='btnCloseSignup') closeModal('signupModal'); if(t.id==='btnCloseLogin') closeModal('loginModal'); if(t.id==='btnProfile') openProfileModal(); if(t.id==='btnCloseProfile') closeModal('profileModal'); if(t.dataset.add){ const f=LS.get('foods',[]).find(x=>x.id===t.dataset.add); const qty=parseFloat($('logQty').value||'1')||1; if(f){ logToDay(f,qty); toast('Registrado en el diario.') } } if(t.dataset.del) removeFromDay(t.dataset.del); if(t.id==='btnClearDay'){ if(confirm('¿Seguro de limpiar el diario de hoy?')){ LS.set('day:'+todayKey(),[]); renderDay(); renderSummary() } } if(t.id==='btnQuickAdd'){ setTab('comidas'); $('fName').focus() } if(t.id==='btnDoSignup') doSignup(); if(t.id==='btnDoLogin') doLogin(); if(t.id==='btnForgot') doForgot(); });
$('foodSearch').addEventListener('input',()=>renderFoods($('foodSearch').value));
$('macroForm').addEventListener('submit',(e)=>{ e.preventDefault(); calcAndRender() });
$('btnSavePreset').addEventListener('click', async ()=>{ const last=LS.get('last_calc'); if(!last){ toast('Primero calcula tus macros.'); return } const presets=LS.get('presets',[]); presets.unshift({ id:crypto.randomUUID(), ...last }); LS.set('presets',presets); toast('Preset guardado.'); try{ const user=await getUser(); if(user){ await sb.from('macro_presets').insert({ user_id:user.id, payload:last }) } }catch(err){ console.warn('macro_presets insert',err?.message) } });
$('btnSetTodayTargets').addEventListener('click',()=>{ const last=LS.get('last_calc'); if(!last){ toast('Primero calcula y guarda un preset.'); return } LS.set('targets:'+todayKey(), last.out); toast('Metas de hoy actualizadas.'); renderSummary() });
$('foodForm').addEventListener('submit', async (e)=>{ e.preventDefault(); const food=normalizeFood({ name:$('fName').value, brand:$('fBrand').value, serving:$('fServing').value, kcal:$('fKcal').value, p:$('fProtein').value, c:$('fCarb').value, g:$('fFat').value, fi:$('fFiber').value }); if(!food.name||!food.serving){ $('foodMsg').textContent='Completa al menos nombre y ración.'; return } saveFoodLocal(food); renderFoods($('foodSearch').value); $('foodMsg').textContent='Alimento guardado ✅'; try{ await saveFoodSupabase(food) }catch{} });
$('btnLogFood').addEventListener('click',()=>{ const food=normalizeFood({ name:$('fName').value, brand:$('fBrand').value, serving:$('fServing').value, kcal:$('fKcal').value, p:$('fProtein').value, c:$('fCarb').value, g:$('fFat').value, fi:$('fFiber').value }); if(!food.name||!food.serving){ $('foodMsg').textContent='Completa al menos nombre y ración.'; return } saveFoodLocal(food); const qty=parseFloat($('logQty').value||'1')||1; logToDay(food,qty); toast('Registrado en el diario.'); renderFoods($('foodSearch').value) });

// --- Modales & sesión
function openModal(id){ show(id); document.body.style.overflow='hidden' }
function closeModal(id){ hide(id); document.body.style.overflow='' }
async function openProfileModal(){ const user=await getUser(); if(!user) return; const profile=await getProfile(user.id); $('profEmail').value=user.email||''; $('profName').value=profile?.display_name||''; openModal('profileModal') }
$('btnSaveProfile').addEventListener('click', async ()=>{ const user=await getUser(); if(!user) return; const display_name=( $('profName').value||'' ).trim()||user.email; const { error }=await sb.from('profiles').upsert({ id:user.id, display_name }); $('profMsg').textContent= error?('Error: '+error.message):'Guardado ✅' });
async function logout(){ await sb.auth.signOut(); setGuestUI(); toast('Sesión cerrada') }

// --- Boot
(async ()=>{
  $('year').textContent=new Date().getFullYear();
  const hash=window.location.hash||"";
  if(hash.includes('access_token')&&hash.includes('refresh_token')){ const p=new URLSearchParams(hash.substring(1)); await sb.auth.setSession({ access_token:p.get('access_token'), refresh_token:p.get('refresh_token') }); history.replaceState({},document.title,window.location.pathname) }
  if(hash.includes('type=recovery')) openModal('loginModal');

  sb.auth.onAuthStateChange(async (event, session)=>{ const user=session?.user||null; if(user){ setLoggedUI(user); await ensureProfile(); closeModal('loginModal'); closeModal('signupModal'); toast('Sesión iniciada') } else { setGuestUI() } });

  const { data:{ user } } = await sb.auth.getUser();
  if(user){ setLoggedUI(user); await ensureProfile() } else { setGuestUI() }
  setTab('resumen'); renderFoods(''); renderDay(); renderSummary(); renderAdherence();
})();

