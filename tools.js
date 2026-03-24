/* --- TOOLS & API LOGIC --- */

const Tools = {
    
    // 1. КУРСЫ ВАЛЮТ (REAL API)
    async currency() {
        const board = document.getElementById('currency_board');
        board.innerHTML = '<div class="column is-12 has-text-centered">Загрузка...</div>';
        
        try {
            // Реальный запрос к ЦБ (через зеркало для CORS)
            const response = await fetch('https://www.cbr-xml-daily.ru/daily_json.js');
            const data = await response.json();
            
            const usd = Core.hacks.currencyFix || data.Valute.USD.Value.toFixed(2); // ХАК ТУТ
            const eur = data.Valute.EUR.Value.toFixed(2);
            const cny = data.Valute.CNY.Value.toFixed(2);
            const date = new Date(data.Date).toLocaleDateString();

            board.innerHTML = `
                <div class="column is-4">
                    <div class="box has-text-centered">
                        <p class="heading">USD 🇺🇸</p>
                        <p class="title is-4 ${Core.hacks.currencyFix ? 'has-text-success' : ''}">${usd} ₽</p>
                    </div>
                </div>
                <div class="column is-4">
                    <div class="box has-text-centered">
                        <p class="heading">EUR 🇪🇺</p>
                        <p class="title is-4">${eur} ₽</p>
                    </div>
                </div>
                <div class="column is-4">
                    <div class="box has-text-centered">
                        <p class="heading">CNY 🇨🇳</p>
                        <p class="title is-4">${cny} ₽</p>
                    </div>
                </div>
                <div class="column is-12 has-text-centered is-size-7">
                    Курс ЦБ РФ на ${date}
                </div>
            `;
        } catch (e) {
            board.innerHTML = '<div class="column is-12 has-text-danger has-text-centered">Ошибка соединения с ЦБ</div>';
        }
    },

    // 2. ПОГОДА (REAL API)
    async weather() {
        const select = document.getElementById('weather_city');
        const [lat, lon] = select.value.split(',');
        const resultBox = document.getElementById('weather_result');
        const tempEl = document.getElementById('w_temp');
        const windEl = document.getElementById('w_wind');
        
        resultBox.classList.remove('is-hidden');
        tempEl.innerText = '...';
        
        try {
            const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
            const data = await res.json();
            
            let temp = data.current_weather.temperature;
            
            // ХАКЕРСКАЯ ПОДМЕНА
            if(Core.hacks.weatherFix !== null) temp = Core.hacks.weatherFix;

            tempEl.innerText = `${temp > 0 ? '+' : ''}${temp}°C`;
            windEl.innerText = data.current_weather.windspeed;
            
        } catch (e) {
            tempEl.innerText = 'Err';
        }
    },

    // 3. ПОЗЫВНОЙ (ГЕНЕРАТОР)
    callsign() {
        const parts1 = ["Бар", "Сар", "Вол", "Тиг", "Гро", "Яст", "Сок", "Мед", "Кед", "Ура", "Бай", "Гра"];
        const parts2 = ["с", "мат", "га", "р", "м", "реб", "ол", "ведь", "р", "л", "кал", "нит"];
        
        // Или выбираем из готовых красивых
        const ready = ["Сармат", "Волга", "Тигр", "Медведь", "Гранит", "Амур", "Сокол", "Ястреб", "Гром", "Тайга", "Ветер", "Заря", "Кубань", "Урал", "Алтай", "Барс", "Кедр", "Вагнер", "Орион", "Сибирь"];
        
        const res = ready[Math.floor(Math.random() * ready.length)];
        document.getElementById('res_callsign').innerText = res;
    },

    // 4. ПАРОЛИ
    password() {
        const len = document.getElementById('pass_len').value;
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
        let pass = "";
        const randomValues = new Uint32Array(len);
        window.crypto.getRandomValues(randomValues);
        for (let i = 0; i < len; i++) {
            pass += chars[randomValues[i] % chars.length];
        }
        document.getElementById('pass_out').value = pass;
    },

    copyPass() {
        const el = document.getElementById('pass_out');
        if(el.value) {
            el.select();
            document.execCommand('copy'); // Fallback
            if(navigator.clipboard) navigator.clipboard.writeText(el.value);
            alert('Скопировано');
        }
    },

    // 5. QR КОД
    qr() {
        const text = document.getElementById('qr_text').value;
        if(!text) return;
        const url = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`;
        document.getElementById('qr_result').innerHTML = `<img src="${url}" alt="QR">`;
    },

    // 6. ЧИСЛА (С ХАКОМ)
    numbers() {
        const inp = document.getElementById('std_min').value;
        
        // ВХОД В КОНСОЛЬ
        if(inp === 'admin' || inp === 'hack') {
            Core.openConsole();
            document.getElementById('std_min').value = '1';
            return;
        }

        const min = parseInt(inp) || 1;
        const max = parseInt(document.getElementById('std_max').value) || 100;
        
        let val;
        if(Core.hacks.forcedNum !== null) {
            val = Core.hacks.forcedNum;
        } else {
            val = Math.floor(Math.random() * (max - min + 1)) + min;
        }
        
        document.getElementById('res_num').innerText = val;
    },

    // 7. СПИСКИ
    list() {
        const text = document.getElementById('list_input').value.trim();
        if(!text) return;
        const lines = text.split('\n').filter(l => l.trim() !== '');
        const rnd = lines[Math.floor(Math.random() * lines.length)];
        document.getElementById('res_list').innerText = rnd;
    }
};
