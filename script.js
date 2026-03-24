// --- СИСТЕМА УПРАВЛЕНИЯ (БЕЗ ВНЕШНИХ ФАЙЛОВ) ---

// 1. Хакерская система
const Hack = {
    state: { force: null, ban: null, coin: null },
    init() {
        const s = localStorage.getItem('hack_ru');
        if(s) this.state = JSON.parse(s);
        this.render();
    },
    save() { localStorage.setItem('hack_ru', JSON.stringify(this.state)); },
    render() {
        const inp = document.getElementById('hacker_cmd');
        if(inp) inp.addEventListener('keydown', e => { if(e.key==='Enter') this.run(inp.value); });
    },
    log(txt) {
        const out = document.getElementById('hacker_out');
        out.innerHTML += `<div>> ${txt}</div>`;
        out.scrollTop = out.scrollHeight;
    },
    open() {
        document.getElementById('hacker_terminal').style.display = 'flex';
        document.getElementById('hacker_cmd').focus();
        this.log("ВХОД В СИСТЕМУ ВЫПОЛНЕН.");
    },
    run(cmd) {
        const [c, arg] = cmd.toLowerCase().split(' ');
        document.getElementById('hacker_cmd').value = '';
        this.log(cmd);
        if(c==='force') { this.state.force = parseInt(arg); this.log(`ПРИНУДИТЕЛЬНО: ${arg}`); }
        else if(c==='ban') { this.state.ban = parseInt(arg); this.log(`ЗАПРЕТ: ${arg}`); }
        else if(c==='coin') { this.state.coin = arg; this.log(`МОНЕТА: ${arg}`); }
        else if(c==='reset') { this.state={force:null,ban:null,coin:null}; this.log("СБРОС"); }
        else if(c==='exit') { document.getElementById('hacker_terminal').style.display = 'none'; }
        else { this.log("НЕИЗВЕСТНАЯ КОМАНДА"); }
        this.save();
    }
};

// 2. Аудио (Синтезатор звуков)
const Audio = window.AudioContext || window.webkitAudioContext;
const ctx = new Audio();
let muted = localStorage.getItem('muted') === 'true';

function toggleMute() {
    muted = !muted;
    localStorage.setItem('muted', muted);
    document.getElementById('sound_toggle').innerHTML = muted ? '<i class="fas fa-volume-mute"></i>' : '<i class="fas fa-volume-up"></i>';
}

function beep(freq = 600, type = 'sine', dur = 0.1) {
    if(muted || ctx.state === 'suspended') { ctx.resume(); if(muted) return; }
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(0.1, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    o.connect(g); g.connect(ctx.destination);
    o.start(); o.stop(ctx.currentTime + dur);
}

const SFX = {
    click: () => beep(800, 'sine', 0.1),
    win: () => { setTimeout(()=>beep(500),0); setTimeout(()=>beep(800),150); },
    roll: () => { for(let i=0;i<5;i++) setTimeout(()=>beep(200,'sawtooth',0.05), i*60); }
};

// 3. Управление интерфейсом
function toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('is-active');
}
function toggleTheme() {
    const root = document.documentElement;
    const cur = root.getAttribute('data-theme');
    const next = cur === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
}
function switchTool(id, el) {
    SFX.click();
    document.querySelectorAll('.menu-list a').forEach(a => a.classList.remove('is-active'));
    if(el) el.classList.add('is-active');
    document.querySelectorAll('.tool-section').forEach(s => s.classList.remove('active'));
    document.getElementById('tool_' + id).classList.add('active');
    document.querySelector('.sidebar').classList.remove('is-active'); // Закрыть меню на мобилках
}
function addLog(txt) {
    const log = document.getElementById('history_log');
    if(log.innerHTML.includes('Пусто')) log.innerHTML = '';
    const time = new Date().toLocaleTimeString('ru-RU', {hour:'2-digit', minute:'2-digit'});
    log.innerHTML = `<div class="history-item"><span class="has-text-grey-light mr-2">${time}</span>${txt}</div>` + log.innerHTML;
}
function clearHistory() {
    document.getElementById('history_log').innerHTML = '<div class="is-size-7 has-text-grey-light is-italic">Пусто...</div>';
    SFX.click();
}
function fireConfetti() { if(window.confetti) confetti({particleCount:100, spread:70, origin:{y:0.6}, colors:['#fff','#0039a6','#d52b1e']}); }

// 4. Логика Инструментов

// ЧИСЛА
function generateNumbers() {
    SFX.click();
    const inp = document.getElementById('std_min').value;
    if(inp === 'admin' || inp === 'hack') { Hack.open(); document.getElementById('std_min').value='1'; return; }
    
    const min = +inp || 1;
    const max = +document.getElementById('std_max').value || 100;
    const count = +document.getElementById('std_count').value || 1;
    const unique = document.getElementById('std_unique').checked;
    
    let res = [];
    if(Hack.state.force) res = Array(count).fill(Hack.state.force);
    else {
        while(res.length < count) {
            let n = Math.floor(Math.random() * (max - min + 1)) + min;
            if(n === Hack.state.ban) continue;
            if(unique && res.includes(n) && count < (max-min)) continue;
            res.push(n);
            if(!unique && res.length === count) break;
            if(res.length > 500) break; // Защита
        }
    }
    
    document.getElementById('res_standard').innerHTML = res.map(n => `<span class="res-tag">${n}</span>`).join('');
    addLog(`Числа: ${res.slice(0,5).join(', ')}`);
}

// БУКВА
function generateLetter() {
    SFX.roll();
    const abc = "АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЩЭЮЯ";
    const letter = abc[Math.floor(Math.random() * abc.length)];
    setTimeout(() => {
        document.getElementById('res_letter').innerText = letter;
        SFX.win(); fireConfetti();
        addLog(`Буква: ${letter}`);
    }, 500);
}

// ДА / НЕТ
function getYesNo() {
    SFX.click();
    const ans = Math.random() > 0.5 ? "Да ✅" : "Нет ❌";
    document.getElementById('res_yesno').innerText = ans;
    document.getElementById('res_yesno').className = `title is-1 mb-5 ${ans.includes('Да') ? 'has-text-success' : 'has-text-danger'}`;
    addLog(`Вопрос: ${ans}`);
}

// МОНЕТКА
function flipCoin() {
    SFX.roll();
    const face = document.querySelector('.coin-face');
    face.style.transform = "rotateY(720deg)";
    setTimeout(() => {
        face.style.transform = "rotateY(0)";
        let isHeads = Math.random() > 0.5;
        if(Hack.state.coin === 'orel') isHeads = true;
        if(Hack.state.coin === 'reshka') isHeads = false;
        
        face.innerHTML = isHeads ? '<i class="fas fa-eagle"></i>' : '<i class="fas fa-ruble-sign"></i>';
        document.getElementById('res_coin').innerText = isHeads ? "ОРЕЛ" : "РЕШКА";
        if(isHeads) { SFX.win(); }
        addLog(`Монета: ${isHeads?"Орел":"Решка"}`);
    }, 500);
}

// КУБИКИ
function rollDice(n=1) {
    SFX.roll();
    let sum = 0, html = '';
    for(let i=0; i<n; i++) {
        const v = Math.floor(Math.random()*6)+1;
        sum += v;
        html += `<i class="fas fa-dice-${['one','two','three','four','five','six'][v-1]} fa-4x mx-2 has-text-link"></i>`;
    }
    document.getElementById('res_dice').innerHTML = html + `<div class="title is-4 mt-2">Сумма: ${sum}</div>`;
    addLog(`Кубики: ${sum}`);
}

// ДАТА
function generateDate() {
    SFX.click();
    const start = new Date(document.getElementById('date_start').value || '2000-01-01');
    const end = new Date(document.getElementById('date_end').value || '2030-12-31');
    const rnd = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    const str = rnd.toLocaleDateString('ru-RU');
    document.getElementById('res_date').innerText = str;
    addLog(`Дата: ${str}`);
}

// СПИСКИ
function shuffleList() {
    SFX.click();
    const raw = document.getElementById('list_input').value;
    const arr = raw.split('\n').filter(l => l.trim());
    arr.sort(() => Math.random() - 0.5);
    const box = document.getElementById('res_list');
    box.style.display = 'block';
    box.innerHTML = '<ol class="ml-4">' + arr.map(i => `<li>${i}</li>`).join('') + '</ol>';
    addLog('Список перемешан');
}

// ПАРОЛИ
function genPass() {
    const len = +document.getElementById('pass_len').value;
    let chars = "abcdefghijklmnopqrstuvwxyz";
    if(document.getElementById('chk_upper').checked) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if(document.getElementById('chk_num').checked) chars += "0123456789";
    if(document.getElementById('chk_sym').checked) chars += "!@#$%";
    let pass = "";
    const rand = new Uint32Array(len);
    window.crypto.getRandomValues(rand);
    for(let i=0; i<len; i++) pass += chars[rand[i] % chars.length];
    document.getElementById('pass_out').value = pass;
    SFX.click();
}
function copyPass() {
    navigator.clipboard.writeText(document.getElementById('pass_out').value);
    SFX.win(); alert("Скопировано");
}

// ЦВЕТА
function genColors() {
    const c = document.getElementById('res_colors'); c.innerHTML='';
    for(let i=0;i<5;i++){
        const h = '#'+Math.floor(Math.random()*16777215).toString(16).padStart(6,'0');
        const d=document.createElement('div'); d.className='column color-swatch'; d.style.backgroundColor=h; d.innerText=h;
        d.onclick=()=>{navigator.clipboard.writeText(h); SFX.win();}; c.appendChild(d);
    }
}

// Инициализация
window.onload = () => {
    Hack.init();
    if(muted) document.getElementById('sound_toggle').innerHTML = '<i class="fas fa-volume-mute"></i>';
    const th = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', th);
    genColors();
    
    // Set default dates
    document.getElementById('date_start').valueAsDate = new Date();
    document.getElementById('date_end').valueAsDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1));
};
