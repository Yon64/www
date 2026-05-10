const wsMain = new ws.Context(wsParams.url, wsParams.port);
const socket = io();
const channel = new BroadcastChannel('canoe_offline_com');

function OnOpenWebSocketCommand() {
    wsMain.websocket.send(JSON.stringify({ key: '<race_load>', key_race: '*' }));
}

function OnCommandRaceLoad(objJSON) {
    canoe.SetRace(objJSON);
    
    // Request ranking data to get all participants and categories
    const cmd = { key: '<epreuve_load>', epreuve: '' };
    wsMain.websocket.send(JSON.stringify(cmd));
}

function OnCommandEpreuveLoad(objJSON) {
    canoe.SetRanking(objJSON);
    const tRanking = canoe.GetTableRanking();
    
    if (tRanking) {
        const categories = [];
        for (let i = 0; i < tRanking.GetNbRows(); i++) {
            const cat = tRanking.GetCell('Code_categorie', i);
            if (cat && !categories.includes(cat)) {
                categories.push(cat);
            }
        }
        
        // Sort categories alphabetically
        categories.sort();

        if (categories.length > 0) {
            updateSelect('startlistCategory', categories);
            updateSelect('rankingCategory', categories);
            updateSelect('epreuve', categories); // Cross category
        }
    }
}

function updateSelect(selectId, options) {
    const select = document.getElementById(selectId);
    if (!select) return;

    const currentValue = select.value;
    select.innerHTML = ''; // Clear old options
    
    options.forEach(value => {
        const opt = document.createElement('option');
        opt.value = value;
        opt.textContent = value;
        select.appendChild(opt);
    });
    
    // Try to restore previous selection
    if (options.includes(currentValue)) {
        select.value = currentValue;
    }
}

function Init() {
    wsMain.mapCommand.set('<race_load>', OnCommandRaceLoad);
    wsMain.mapCommand.set('<epreuve_load>', OnCommandEpreuveLoad);
    wsMain.OpenWebSocketCommand(OnOpenWebSocketCommand);
}

// Ensure Init runs after DOM is loaded
document.addEventListener('DOMContentLoaded', Init);

function triggerFileSelect(id) {
    document.getElementById(id).click();
}

function handleFileSelect(event, targetId) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const base64 = e.target.result;
        const targetInput = document.getElementById(targetId);
        
        if (targetId === 'weatherIcon') {
            // Special handling for weather icon if it's a select
            // Create a custom option for the custom image
            let customOption = targetInput.querySelector('option[value^="data:image"]');
            if (!customOption) {
                customOption = document.createElement('option');
                targetInput.appendChild(customOption);
            }
            customOption.value = base64;
            customOption.textContent = "📷 Image personnalisée";
            customOption.selected = true;
        }
        
        targetInput.value = base64;
        
        // Trigger visual feedback
        targetInput.style.backgroundColor = '#e8f5e9';
        setTimeout(() => targetInput.style.backgroundColor = '', 1000);
    };
    reader.readAsDataURL(file);
}

        function show(type) {
            socket.emit('show_graphic', type);
        }

        function showWithCategory(type, epreuve) {
            const url = `${type}.html?epreuve=${encodeURIComponent(epreuve)}`;
            socket.emit('show_graphic', { type, url });
        }

        function showWithConf(bib_odd, bib_even, rk_odd, rk_even) {
            var url = `tv_inrace.html`
            if(bib_even == 'even'){
                url += `?bib_filter=${encodeURIComponent(bib_even)}`;
            }else if(bib_odd == 'odd'){
                url += `?bib_filter=${encodeURIComponent(bib_odd)}`;
            }else if(rk_odd == 'odd'){
                url += `?bib_filter=${encodeURIComponent(rk_odd)}`;
            }else if(rk_even == 'even'){
                url += `?bib_filter=${encodeURIComponent(rk_even)}`;
            }

            console.log(url);
            socket.emit('show_graphic', { type: 'tv_inrace', url });
        }

        function hide(type) {
            socket.emit('hide_graphic', type);
        }

        function sendCourseData(e) {
            e.preventDefault();
            const data = {
                length: document.getElementById('courseLength').value,
                gates: document.getElementById('courseGates').value,
                upstream: document.getElementById('courseUpstream').value,
                image: document.getElementById('courseImage').value
            };
            socket.emit('update_course_data', data);
        }
        socket.on('update_course_data', (data) => {
            if (data.length) document.getElementById('courseLength').value = data.length;
            if (data.gates) document.getElementById('courseGates').value = data.gates;
            if (data.upstream) document.getElementById('courseUpstream').value = data.upstream;
            if (data.image) document.getElementById('courseImage').value = data.image;
        });

        function sendWeatherData(e) {
            e.preventDefault();
            const icon = document.getElementById('weatherIcon').value;
            let imagePath = icon ? `img/meteo/${icon}.png` : '';
            
            // If icon value is actually a base64 string (from file picker)
            if (icon && icon.startsWith('data:image')) {
                imagePath = icon;
            }

            const data = {
                air_temp: document.getElementById('airTemp').value,
                water_temp: document.getElementById('waterTemp').value,
                wind_speed: document.getElementById('windSpeed').value,
                image: imagePath
            };

            socket.emit('update_weather_data', data);
        }

        socket.on('update_weather_data', (data) => {
            if (data.air_temp) document.getElementById('airTemp').value = data.air_temp;
            if (data.water_temp) document.getElementById('waterTemp').value = data.water_temp;
            if (data.wind_speed) document.getElementById('windSpeed').value = data.wind_speed;
            
            if (data.image) {
                const match = data.image.match(/(\d+)\.png$/);
                if (match) document.getElementById('weatherIcon').value = match[1];
            }
        });

        
    let rowCount = 0;
    function addRow(row = {}) {
    const container = document.getElementById('rowsContainer');
    const div = document.createElement('div');
    div.classList.add('time-table-row');
    div.innerHTML = `
        <label>Heure: <input type="text" class="tt_time" value="${row.time || ''}"></label>
        <label>Phase: <input type="text" class="tt_phase" value="${row.phase || ''}"></label>
        <label>Catégorie: <input type="text" class="tt_categ" value="${row.categ || ''}"></label>
        <label>État: 
            <select class="tt_state">
                <option value="0" ${row.state == 0 ? 'selected' : ''}>SCHEDULED</option>
                <option value="1" ${row.state == 1 ? 'selected' : ''}>LIVE</option>
                <option value="2" ${row.state == 2 ? 'selected' : ''}>OFFICIAL</option>
            </select>
        </label>
        <button type="button" onclick="removeRow(this)">Supprimer</button>
        <br><br>
    `;
    container.appendChild(div);
}

function removeRow(button) {
    const div = button.closest('.time-table-row');
    if (div) div.remove();
}

    function sendTimeTable(e) {
        e.preventDefault();
        const rows = Array.from(document.querySelectorAll('#rowsContainer > div')).map(div => ({
            time: div.querySelector('.tt_time').value,
            phase: div.querySelector('.tt_phase').value,
            categ: div.querySelector('.tt_categ').value,
            state: div.querySelector('.tt_state').value
        }));

        const data = {
            title: document.getElementById('tt_title').value,
            place: document.getElementById('tt_place').value,
            date: document.getElementById('tt_date').value,
            rows
        };
        socket.emit('update_time_table', data);
    }

    socket.on('update_time_table', (data) => {
        document.getElementById('tt_place').value = data.place || '';
        document.getElementById('tt_title').value = data.title || '';
        document.getElementById('tt_date').value = data.date || '';

        document.getElementById('rowsContainer').innerHTML = '';
        if (Array.isArray(data.rows)) {
            data.rows.forEach(row => addRow(row));
        }
    });

    function sendIndivData(e) {
        e.preventDefault();
        const bib = parseInt(document.getElementById('indivBib').value, 10);
        const color = document.getElementById('indivColor').value;

        const data = { bib, color };
        socket.emit('update_indiv', data);
    }
    socket.on('update_indiv', (data) => {
        if (data.bib) document.getElementById('indivBib').value = data.bib;
        if (data.color) document.getElementById('indivColor').value = data.color;
    });

    
    function sendStCrossData(e) {
        e.preventDefault();
        const bib1 = parseInt(document.getElementById('bib1').value, 10);
        const color1 = document.getElementById('color1').value;
        const bib2 = parseInt(document.getElementById('bib2').value, 10);
        const color2 = document.getElementById('color2').value;
        const bib3 = parseInt(document.getElementById('bib3').value, 10);
        const color3 = document.getElementById('color3').value;
        const bib4 = parseInt(document.getElementById('bib4').value, 10);
        const color4 = document.getElementById('color4').value;
        const phase = document.getElementById('phase').value;
        const epreuve = document.getElementById('epreuve').value;
        const faute1 = document.getElementById('faute1').value;
        const faute2 = document.getElementById('faute2').value;
        const faute3 = document.getElementById('faute3').value;
        const faute4 = document.getElementById('faute4').value;
        const rank1 = document.getElementById('rank1').value;
        const rank2 = document.getElementById('rank2').value;
        const rank3 = document.getElementById('rank3').value;
        const rank4 = document.getElementById('rank4').value;


        const data = { bib1, color1, bib2, color2, bib3, color3, bib4, color4, phase, epreuve, faute1, faute2, faute3, faute4, rank1, rank2, rank3, rank4 };
        socket.emit('update_stCross', data);
    }
    socket.on('update_stCross', (data) => {
        if (data.bib1) document.getElementById('bib1').value = data.bib1;
        if (data.color1) document.getElementById('color1').value = data.color1;
        if (data.bib2) document.getElementById('bib2').value = data.bib2;
        if (data.color2) document.getElementById('color2').value = data.color2;
        if (data.bib3) document.getElementById('bib3').value = data.bib3;
        if (data.color3) document.getElementById('color3').value = data.color3;
        if (data.bib4) document.getElementById('bib4').value = data.bib4;
        if (data.color4) document.getElementById('color4').value = data.color4;
        if (data.phase) document.getElementById('phase').value = data.phase;
        if (data.epreuve) document.getElementById('epreuve').value = data.epreuve;
        if (data.faute1) document.getElementById('faute1').value = data.faute1;
        if (data.faute2) document.getElementById('faute2').value = data.faute2;
        if (data.faute3) document.getElementById('faute3').value = data.faute3;
        if (data.faute4) document.getElementById('faute4').value = data.faute4;
        if (data.rank1) document.getElementById('rank1').value = data.rank1;
        if (data.rank2) document.getElementById('rank2').value = data.rank2;
        if (data.rank3) document.getElementById('rank3').value = data.rank3;
        if (data.rank4) document.getElementById('rank4').value = data.rank4;

    });

    const jeuxDeCategories = {
        fr: ['INV', 'K1H', 'K1D', 'C1H', 'C1D'],
        int: ['FOR', 'K1M', 'K1W', 'C1M', 'C1W'],
        int2: ['FOR', 'MK1', 'WK1', 'MC1', 'WC1']
    };

    function onCategorySetChange(type) {
        const categories = jeuxDeCategories[type] || [];
        updateSelect('startlistCategory', categories);
        updateSelect('rankingCategory', categories);
    }

    function updateSelect(selectId, options) {
        const select = document.getElementById(selectId);
        if (!select) return;

        select.innerHTML = ''; // Clear old options
        options.forEach(value => {
            const opt = document.createElement('option');
            opt.value = value;
            opt.textContent = value;
            select.appendChild(opt);
        });
    }

    function newPoule() {
        document.getElementById('bib1').value = '';
        document.getElementById('color1').value = '--';
        document.getElementById('bib2').value = '';
        document.getElementById('color2').value = '--';
        document.getElementById('bib3').value = '';
        document.getElementById('color3').value = '--';
        document.getElementById('bib4').value = '';
        document.getElementById('color4').value = '--';
        document.getElementById('faute1').value = 'Clear';
        document.getElementById('faute2').value = 'Clear';
        document.getElementById('faute3').value = 'Clear';
        document.getElementById('faute4').value = 'Clear';
        document.getElementById('rank1').value = '-';
        document.getElementById('rank2').value = '-';
        document.getElementById('rank3').value = '-';
        document.getElementById('rank4').value = '-';
    }