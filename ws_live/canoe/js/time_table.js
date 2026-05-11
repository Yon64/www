const socket = io();

socket.on('update_time_table', (data) => {
    if (data.title) document.querySelector('.title').textContent = data.title;
    if (data.place) document.querySelector('.place').textContent = data.place;
    if (data.date) document.querySelector('.date').textContent = data.date;

    // Clear existing content
    for (let i = 1; i <= 10; i++) {
        const row = document.querySelector(`.row${i}`);
        if (!row) continue;
        
        row.querySelector(`.time`).textContent = '';
        row.querySelector(`.phase`).textContent = '';
        row.querySelector(`.categ`).textContent = '';
        const etatEl = row.querySelector(`.etat`);
        etatEl.textContent = '';
        etatEl.className = 'etat'; // Reset classes
        row.classList.remove('visible');
    }

    if (Array.isArray(data.rows)) {
        data.rows.slice(0, 10).forEach((rowData, idx) => {
            const i = idx + 1;
            const row = document.querySelector(`.row${i}`);
            if (!row) return;

            row.querySelector(`.time`).textContent = rowData.time || '';
            row.querySelector(`.phase`).textContent = rowData.phase || '';
            row.querySelector(`.categ`).textContent = rowData.categ || '';

            // Gestion de l'état
            const state = parseFloat(rowData.state);
            const etatEl = row.querySelector(`.etat`);
            etatEl.className = 'etat'; // Reset
            
            if (state === 2) {
                etatEl.textContent = 'OFFICIAL';
                etatEl.classList.add('official');
            } else if (state === 1) {
                etatEl.textContent = 'LIVE';
                etatEl.classList.add('live');
            } else if (state === 0) {
                etatEl.textContent = 'SCHEDULED';
                etatEl.classList.add('scheduled');
            } else {
                etatEl.textContent = '';
            }

            // Animation appearance
            setTimeout(() => {
                row.classList.add('visible');
            }, idx * 100);
        });
    }
});

function Init() {
    console.log("Time Table Graphic Initialized");
}

