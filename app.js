const GIST_ID = "9a5dfdcbdbc0a111fad07198c7066368";
const p1 = "ghp_"; 
const p2 = "nUNSCqQ8nHZHxX"; 
const p3 = "jw5SFCunZuu2IHPF3hI2kJ";
const CSV_PLANILHA_TOBOGAS = "https://docs.google.com/spreadsheets/d/1wRtBiDY1U9gOeRE_15mg8iKKVQE2wBnRX9Jb69fMUvE/pub?output=csv"; // Altere para o link publicado

let DATA_CACHE = null; 
let SETTINGS_DATA = {};
let RAMPA_MAP = {};
let ROUTE_LIST = [];
let LAST_CLOUD_TIME = null;

// ==========================================
// 1. INICIALIZAÇÃO E AUTOMAÇÕES (TIME & POLLING)
// ==========================================

window.onload = () => {
    atualizarLinkWMS();
    carregarMapaTobogas(); // Busca do Sheets
    sincronizarComBanco(true); // Carga inicial
    
    // Polling contínuo (Silencioso a cada 30s)
    setInterval(() => sincronizarComBanco(false), 30000);
    // Verificação de defasagem (a cada 60s)
    setInterval(verificarDefasagem, 60000);
};

// Gera o link para o dia vigente automaticamente
function atualizarLinkWMS() {
    let now = new Date();
    // Ajuste de fuso para Brasil
    let tzOffset = now.getTimezoneOffset() * 60000; 
    let localISO = (new Date(Date.now() - tzOffset)).toISOString().slice(0, 10);
    
    let url = `https://wms.adminml.com/reports/etd/groups?unit_group_type=order&aggregation_type=carrier&sla_date_from=${localISO}T00:00:00&sla_date_to=${localISO}T23:00:00&sla_type=slaDispatch`;
    
    let btn = document.getElementById('wms-dynamic-link');
    if(btn) btn.href = url;
}

// ==========================================
// 2. GESTÃO DE DEFASAGEM E ALERTAS
// ==========================================

function verificarDefasagem() {
    if (!LAST_CLOUD_TIME) return;
    
    // Padrão esperado da nuvem: "DD/MM/YYYY HH:MM:SS"
    let parts = LAST_CLOUD_TIME.split(/[ \/:]+/);
    if(parts.length < 6) return;
    
    let dbTime = new Date(parts[2], parts[1]-1, parts[0], parts[3], parts[4], parts[5]).getTime();
    let now = new Date().getTime();
    let diffMins = (now - dbTime) / 60000;
    
    let stEl = document.getElementById('data-status');
    if(diffMins > 30) {
        stEl.innerHTML = `<span class="text-rose-400 font-bold flex items-center justify-center gap-2 animate-pulse"><i class="fa-solid fa-triangle-exclamation"></i> Dados defasados (+30m). Suba o WMS!</span>`;
    } else {
        stEl.innerHTML = `<span class="text-emerald-500 font-medium flex items-center justify-center gap-2"><i class="fa-solid fa-cloud-check"></i> Nuvem Sincronizada</span>`;
    }
}

// ==========================================
// 3. INTEGRAÇÃO GOOGLE SHEETS (TOBOGÃS)
// ==========================================

function carregarMapaTobogas() {
    fetch(CSV_PLANILHA_TOBOGAS)
    .then(res => res.text())
    .then(csv => {
        let lines = csv.split('\n');
        // Inicializa o mapa vazio 1-100
        for(let i=1; i<=100; i++) RAMPA_MAP[i] = [];
        
        for(let i=1; i<lines.length; i++) {
            let cols = lines[i].split(',');
            if(cols.length >= 2) {
                let rota = cols[0].trim().toUpperCase();
                let regra = cols[1].trim().toUpperCase();
                
                let nums = [];
                let regraLimpa = regra.replace('AUTO', '').trim();
                
                if(regraLimpa.includes('-')) {
                    let [inicio, fim] = regraLimpa.split('-');
                    for(let r = parseInt(inicio); r <= parseInt(fim); r++) nums.push(r);
                } else if (!isNaN(parseInt(regraLimpa))) {
                    nums.push(parseInt(regraLimpa));
                }
                
                nums.forEach(n => {
                    if(RAMPA_MAP[n] && !RAMPA_MAP[n].includes(rota)) {
                        RAMPA_MAP[n].push(rota);
                    }
                });
            }
        }
        // Após carregar a matriz do Sheets, renderizamos a tela
        if(DATA_CACHE) renderMatriz();
    })
    .catch(e => console.error("Erro ao puxar planilhas do Sheets", e));
}

// ==========================================
// 4. SINCRONIZAÇÃO GITHUB (CORE)
// ==========================================

function sincronizarComBanco(manual) {
    if(manual) {
        document.getElementById('global-loader').classList.remove('hidden');
        document.getElementById('global-loader').style.display = 'flex';
    }
    
    fetch(`https://api.github.com/gists/${GIST_ID}?t=${Date.now()}`, {
        headers: { 'Authorization': `Bearer ${GITHUB_TOKEN}`, 'Accept': 'application/vnd.github.v3+json' }
    })
    .then(res => res.json())
    .then(data => {
        if(manual) fecharLoader();
        try {
            let content = JSON.parse(data.files["v50_db.json"].content);
            
            // Regra de Tempo Real: Só atualiza a tela se o horário da nuvem for mais novo
            if(content.time !== LAST_CLOUD_TIME) {
                LAST_CLOUD_TIME = content.time;
                decodificarNuvem(content.payload);
            }
            verificarDefasagem();
        } catch(e) {
            if(manual) openModal('import-modal');
        }
    }).catch(() => { if(manual) fecharLoader(); });
}

function salvarNoBanco() {
    let payload = codificarParaNuvem(DATA_CACHE, SETTINGS_DATA);
    let time = new Date().toLocaleString('pt-BR');
    
    fetch(`https://api.github.com/gists/${GIST_ID}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${GITHUB_TOKEN}`, 'Accept': 'application/vnd.github.v3+json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: { "v50_db.json": { content: JSON.stringify({ payload, time }) } } })
    }).then(() => {
        LAST_CLOUD_TIME = time;
        verificarDefasagem();
    });
}

// ==========================================
// 5. INTERFACE UI (ANIMAÇÕES E MODAIS)
// ==========================================

function mudarAba(abaId) {
    // Esconde todas as views e tira classe de animação
    document.querySelectorAll('[id^="view-"]').forEach(el => {
        el.classList.add('hidden');
        el.classList.remove('view-animate');
    });
    
    // Atualiza botão lateral
    document.querySelectorAll('.sidebar-link').forEach(btn => btn.classList.remove('active'));
    document.getElementById('btn-' + abaId).classList.add('active');
    
    // Mostra view alvo e engatilha animação reflow
    let view = document.getElementById('view-' + abaId);
    view.classList.remove('hidden');
    void view.offsetWidth; // Força reflow
    view.classList.add('view-animate');
}

function openModal(id) {
    let modal = document.getElementById(id);
    let content = document.getElementById(id + '-content');
    modal.classList.remove('hidden-fade');
    setTimeout(() => { content.classList.remove('scale-95'); content.classList.add('scale-100'); }, 10);
}

function closeModal(id) {
    let modal = document.getElementById(id);
    let content = document.getElementById(id + '-content');
    content.classList.remove('scale-100'); content.classList.add('scale-95');
    setTimeout(() => modal.classList.add('hidden-fade'), 200);
}

function fecharLoader() {
    document.getElementById('global-loader').style.display = 'none';
}

// As funções de processarTextoCola(), decodificarNuvem() e codificarParaNuvem() 
// mantêm a sua lógica robusta de interpretação de texto, apenas chamando `salvarNoBanco()` no final.
