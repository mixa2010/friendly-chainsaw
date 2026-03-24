/* --- HACKER SYSTEM V2.1 --- */
const HackSystem = {
    state: {
        forcedNum: null, bannedNum: null, probNum: null, probVal: 0,
        coinFix: null
    },
    init: function() {
        const saved = localStorage.getItem('hack_data_rus');
        if(saved) try { this.state = JSON.parse(saved); } catch(e){}
        this.renderConsole();
    },
    save: function() { localStorage.setItem('hack_data_rus', JSON.stringify(this.state)); },
    renderConsole: function() {
        const input = document.getElementById('hacker_cmd');
        if(!input) return;
        input.addEventListener('keydown', (e) => {
            if(e.key === 'Enter') {
                const val = input.value.trim();
                if(val) this.runCommand(val);
                input.value = '';
            }
        });
    },
    log: function(msg, isError=false) {
        const div = document.createElement('div');
        div.textContent = `> ${msg}`;
        div.style.color = isError ? '#ff4444' : '#00ff00';
        const out = document.getElementById('hacker_output');
        if(out) { out.appendChild(div); out.scrollTop = out.scrollHeight; }
    },
    open: function() {
        document.getElementById('hacker_terminal').style.display = 'flex';
        document.getElementById('hacker_cmd').focus();
        const out = document.getElementById('hacker_output');
        out.innerHTML = '';
        this.log("ROOT ACCESS GRANTED [RU SERVER]");
        this.log("--------------------");
        let active = false;
        if(this.state.forcedNum) { this.log(`[!] Force Num: ${this.state.forcedNum}`); active=true; }
        if(this.state.bannedNum) { this.log(`[!] Ban Num: ${this.state.bannedNum}`); active=true; }
        if(this.state.coinFix) { this.log(`[!] Coin Fix: ${this.state.coinFix}`); active=true; }
        if(!active) this.log("System Normal.");
        this.log("--------------------");
    },
    close: function() { document.getElementById('hacker_terminal').style.display = 'none'; },
    runCommand: function(str) {
        this.log(str);
        const parts = str.split(' ');
        const cmd = parts[0].toLowerCase();
        switch(cmd) {
            case 'help':
                this.log("force [num] | ban [num] | prob [num] [%]");
                this.log("coin [orel/reshka] | clear | reset | exit");
                break;
            case 'force':
                this.state.forcedNum = parseInt(parts[1]); this.state.bannedNum = null;
                this.save(); this.log("FORCE ENABLED"); break;
            case 'ban':
                this.state.bannedNum = parseInt(parts[1]); this.state.forcedNum = null;
                this.save(); this.log("BAN ENABLED"); break;
            case 'prob':
                this.state.probNum = parseInt(parts[1]); this.state.probVal = parseInt(parts[2]);
                this.save(); this.log(`PROBABILITY SET`); break;
            case 'coin':
                this.state.coinFix = (parts[1] === 'orel') ? 'heads' : (parts[1] === 'reshka' ? 'tails' : null);
                this.save(); this.log(`COIN FIXED`); break;
            case 'clear':
                document.getElementById('hacker_output').innerHTML = ''; break;
            case 'reset':
                this.state = { forcedNum: null, bannedNum: null, probNum: null, probVal: 0, coinFix: null };
                this.save(); this.log("SYSTEM RESET"); break;
            case 'exit': this.close(); break;
            default: this.log("Error: Unknown Command", true);
        }
    }
};
function closeConsole() { HackSystem.close(); }

// --- AUDIO & UI UTILS ---
const AudioContext = window.AudioContext || window.webkitAudioContext;
const ctx = new AudioContext();
let isMuted = localStorage.getItem('isMuted') === 'true';

function toggleMute() {
    isMuted = !isMuted;
    localStorage.setItem('isMuted', isMuted);
    document.getElementById('sound_toggle').innerHTML = isMuted ? '<span class="icon has-text-grey"><i class="fas fa-volume-mute"></i></span>' : '<span class="icon has-text-primary"><i class="fas fa-volume-up"></i></span>';
}

function playTone(freq, type, duration) {
    if (isMuted) return;
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type; osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + duration);
}

const SFX = {
    click: () => playTone(800, 'sine', 0.1),
    win: () => { if(!isMuted) { playTone(523, 'triangle', 0.2); setTimeout(()=>playTone(783, 'triangle', 0.4), 150); } },
    roll: () => { if(!isMuted) for(let i=0; i<5; i++) setTimeout(()=>playTone(200+Math.random()*200, 'sawtooth', 0.05), i*60); }
};

document.addEventListener('DOMContentLoaded', () => {
    HackSystem.init();
    if(localStorage.getItem('isMuted') === 'true') toggleMute();
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    generatePalette();
});

function switchTool(id, el) {
    SFX.click();
    document.querySelectorAll('.menu-list a').forEach(a => a.classList.remove('is-active'));
    if(el) el.classList.add('is-active');
    document.querySelectorAll('.tool-section').forEach(s => s.classList.remove('active'));
    document.getElementById('tool_' + id).classList.add('active');
    if(window.innerWidth < 768) document.querySelector('.sidebar').classList.add('is-hidden-mobile');
}

function addToHistory(text) {
    const log = document.getElementById('history_log');
    if(log.querySelector('.is-italic')) log.innerHTML = '';
    const item = document.createElement('div');
    item.className = "history-item";
    item.innerHTML = `<span class="has-text-grey-light mr-2">${new Date().toLocaleTimeString()}</span> <span>${text}</span>`;
    log.prepend(item);
    if(log.children.length > 20) log.removeChild(log.lastChild);
}

function clearHistory() {
    document.getElementById('history_log').innerHTML = '<div class="is-size-7 has-text-grey-light is-italic">История пуста...</div>';
    SFX.click();
}

function fireConfetti() { if(typeof confetti === 'function') confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#ffffff', '#0039a6', '#d52b1e'] }); }
function toggleTheme() {
    const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
}

// --- TOOLS ---

// 1. Numbers
function generateStandard() {
    SFX.click();
    const minInput = document.getElementById('std_min').value;
    if(minInput.toLowerCase() === 'admin' || minInput.toLowerCase() === 'hack') {
        HackSystem.open(); document.getElementById('std_min').value = '1'; return;
    }
    const min = parseInt(minInput) || 1;
    const max = parseInt(document.getElementById('std_max').value) || 100;
    const count = Math.min(parseInt(document.getElementById('std_count').value) || 1, 1000);
    
    let res = [];
    if(HackSystem.state.forcedNum !== null) {
        res = Array(count).fill(HackSystem.state.forcedNum);
    } else {
        for(let i=0; i<count; i++) {
            if(HackSystem.state.probNum !== null && Math.random()*100 <= HackSystem.state.probVal) {
                res.push(HackSystem.state.probNum); continue;
            }
            let num;
            do { num = Math.floor(Math.random()*(max-min+1))+min; } while(num === HackSystem.state.bannedNum);
            res.push(num);
        }
    }
    document.getElementById('res_standard').innerHTML = res.map(n => `<span class="res-tag">${n}</span>`).join('');
    addToHistory(`Числа: ${res.slice(0,5).join(', ')}${res.length>5?'...':''}`);
}

// 2. QR Generator
function generateQR() {
    SFX.click();
    const text = document.getElementById('qr_text').value.trim();
    if(!text) return alert('Введите текст!');
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(text)}`;
    document.getElementById('qr_result').innerHTML = `<img src="${url}" alt="QR">`;
    addToHistory('QR Code создан');
}

// 3. Teams
function generateTeams() {
    SFX.click();
    const names = document.getElementById('team_names').value.split('\n').map(n=>n.trim()).filter(n=>n);
    if(names.length===0) return;
    names.sort(() => Math.random() - 0.5);
    const count = parseInt(document.getElementById('team_count').value);
    let html = '';
    for(let i=0; i<count; i++) {
        html += `<div class="column is-half"><div class="glass-box p-4"><h3 class="title is-5">Группа ${i+1}</h3><ul>${names.filter((_,x)=>x%count===i).map(n=>`<li>${n}</li>`).join('')}</ul></div></div>`;
    }
    document.getElementById('res_teams').innerHTML = html;
    SFX.win(); fireConfetti();
}

// 4. Coin
function flipCoin() {
    SFX.roll();
    const face = document.querySelector('.coin-face');
    face.style.transition = "transform 0.5s"; face.style.transform = "rotateY(720deg)";
    setTimeout(() => {
        face.style.transition = "none"; face.style.transform = "rotateY(0deg)";
        let isHeads = Math.random() < 0.5;
        if(HackSystem.state.coinFix === 'heads') isHeads = true;
        if(HackSystem.state.coinFix === 'tails') isHeads = false;
        face.innerHTML = isHeads ? '<i class="fas fa-ruble-sign"></i>' : '<i class="fas fa-eagle"></i>';
        document.getElementById('coin_result').innerText = isHeads ? "ОРЕЛ" : "РЕШКА";
        addToHistory(`Монетка: ${isHeads ? "Орел" : "Решка"}`);
    }, 500);
}

// 5. Dice
function rollDice(num) {
    SFX.roll();
    const count = num || Math.floor(Math.random()*3)+1;
    let sum=0, html='';
    for(let i=0;i<count;i++){
        const v = Math.floor(Math.random()*6)+1; sum+=v;
        html += `<i class="fas fa-dice-${['one','two','three','four','five','six'][v-1]} fa-3x mx-2"></i>`;
    }
    document.getElementById('res_dice').innerHTML = html;
    addToHistory(`Кубики: ${sum}`);
}

// 6. Utils
function generatePassword() {
    const chars = "abcdefghijklmnopqrstuvwxyz" + (document.getElementById('chk_upper').checked?"ABCDEFGHIJKLMNOPQRSTUVWXYZ":"") + (document.getElementById('chk_num').checked?"0123456789":"") + (document.getElementById('chk_sym').checked?"!@#$%^&*":"");
    const len = document.getElementById('pass_len').value;
    let pass = ""; const arr = new Uint32Array(len); window.crypto.getRandomValues(arr);
    for(let i=0; i<len; i++) pass += chars[arr[i] % chars.length];
    document.getElementById('pass_output').value = pass;
    SFX.click();
}
function copyPass() {
    const t = document.getElementById('pass_output').value;
    if(t) navigator.clipboard.writeText(t).then(()=>{SFX.win(); alert("Скопировано!");});
}
function shakeBall() {
    SFX.roll();
    setTimeout(()=>{
        document.getElementById('ball_answer').innerText = ["Да","Нет","Возможно","Точно","Вряд ли"][Math.floor(Math.random()*5)];
        SFX.click();
    }, 500);
}
function generatePalette() {
    const c = document.getElementById('color_container'); c.innerHTML='';
    for(let i=0;i<5;i++){
        const h = '#'+Math.floor(Math.random()*16777215).toString(16).padStart(6,'0');
        const d=document.createElement('div'); d.className='column color-swatch'; d.style.backgroundColor=h;
        d.onclick=()=>{navigator.clipboard.writeText(h); SFX.win(); alert(h);}; c.appendChild(d);
    }
}
