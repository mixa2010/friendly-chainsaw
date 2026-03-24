/* --- SYSTEM CORE --- */
const Core = {
    hacks: { currencyFix: null, weatherFix: null, forcedNum: null },
    
    init() {
        const th = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', th);
        
        const saved = localStorage.getItem('ru_hacks');
        if(saved) this.hacks = JSON.parse(saved);
        
        // Автозапуск валюты
        if(document.getElementById('currency_board')) Tools.currency();
    },

    toggleSidebar() { document.querySelector('.sidebar').classList.toggle('is-open'); },
    
    switch(id, el) {
        if(el) {
            document.querySelectorAll('.menu-list a').forEach(a => a.classList.remove('is-active'));
            el.classList.add('is-active');
        }
        document.querySelectorAll('.tool-section').forEach(s => s.classList.remove('active'));
        const target = document.getElementById('tool_' + id);
        if(target) target.classList.add('active');
        document.querySelector('.sidebar').classList.remove('is-open');
        
        // Автообновление данных при переключении
        if(id === 'currency') Tools.currency();
    },

    toggleTheme() {
        const root = document.documentElement;
        const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        root.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
    },

    toggleMute() {
        // Простая заглушка, т.к. звуки не критичны для серьезного приложения
        alert('Звук: ' + (localStorage.getItem('muted') ? 'ВКЛ' : 'ВЫКЛ'));
    },

    // --- CONSOLE LOGIC ---
    openConsole() {
        document.getElementById('hacker_overlay').style.display = 'flex';
        document.getElementById('hacker_input').focus();
        this.log("ROOT ACCESS: GRANTED");
    },
    
    closeConsole() { document.getElementById('hacker_overlay').style.display = 'none'; },
    
    log(txt) {
        const box = document.getElementById('hacker_log');
        box.innerHTML += `<div>> ${txt}</div>`;
        box.scrollTop = box.scrollHeight;
    },
    
    exec(cmd) {
        this.log(cmd);
        const [c, ...args] = cmd.toLowerCase().split(' ');
        const val = args[0];

        if(c === 'help') {
            this.log("usd [value] - Fix USD rate");
            this.log("temp [value] - Fix Weather Temp");
            this.log("force [num] - Force Random Number");
            this.log("reset - Clear all");
        } 
        else if (c === 'usd') {
            this.hacks.currencyFix = parseFloat(val);
            this.saveHacks();
            this.log(`USD FIXED TO: ${val}`);
        }
        else if (c === 'temp') {
            this.hacks.weatherFix = parseInt(val);
            this.saveHacks();
            this.log(`TEMP FIXED TO: ${val}`);
        }
        else if (c === 'force') {
            this.hacks.forcedNum = parseInt(val);
            this.saveHacks();
            this.log(`NUM FORCED TO: ${val}`);
        }
        else if (c === 'reset') {
            this.hacks = { currencyFix: null, weatherFix: null, forcedNum: null };
            this.saveHacks();
            this.log("SYSTEM RESET");
        }
        else if (c === 'exit') this.closeConsole();
        else this.log("Unknown command");
        
        document.getElementById('hacker_input').value = '';
    },
    
    saveHacks() { localStorage.setItem('ru_hacks', JSON.stringify(this.hacks)); }
};

document.addEventListener('DOMContentLoaded', () => Core.init());
document.getElementById('hacker_input').addEventListener('keydown', (e) => {
    if(e.key === 'Enter') Core.exec(e.target.value);
});
