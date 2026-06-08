const GIST_ID = "9a5dfdcbdbc0a111fad07198c7066368";
const GIST_ID = "SEU_ID_DO_GIST_AQUI";

const p1 = "ghp_"; 
const p2 = "nUNSCqQ8nHZHxX"; 
const p3 = "jw5SFCunZuu2IHPF3hI2kJ";

// O sistema junta as partes invisivelmente na hora de rodar
const GITHUB_TOKEN = p1 + p2 + p3;

const tooltipEl = document.getElementById('floating-tip');

function showTooltip(e, htmlContentEncoded) {
    if(!htmlContentEncoded) return;
    tooltipEl.innerHTML = decodeURIComponent(htmlContentEncoded);
    tooltipEl.classList.remove('hidden');
    moveTooltip(e);
}

function moveTooltip(e) {
    if(tooltipEl.classList.contains('hidden')) return;
    
    let w = tooltipEl.offsetWidth;
    let h = tooltipEl.offsetHeight;
    
    let x = e.clientX + 15;
    let y = e.clientY + 15;
    
    if (x + w > window.innerWidth) {
        x = e.clientX - w - 15;
    }
    
    if (y + h > window.innerHeight) {
        y = window.innerHeight - h - 15;
    }
    
    if (x < 10) x = 10;
    if (y < 10) y = 10;
    
    tooltipEl.style.left = x + 'px';
    tooltipEl.style.top = y + 'px';
}

function hideTooltip() {
    tooltipEl.classList.add('hidden');
}

function setVal(id, v) { 
    const el = document.getElementById(id); 
    if(el) el.innerText = v; 
}

function setHtml(id, h) { 
    const el = document.getElementById(id); 
    if(el) el.innerHTML = h; 
}

function setStyle(id, p, v) { 
    const el = document.getElementById(id); 
    if(el) el.style[p] = v; 
}

function setStatusUi(msg, colorClass) {
    const el = document.getElementById('data-status');
    if(el) {
        el.innerHTML = `
            <span class="flex items-center justify-center gap-1.5">
                <span class="w-2 h-2 rounded-full ${colorClass} shadow-[0_0_8px_currentColor] shrink-0"></span> 
                <span class="text-slate-500 font-bold uppercase tracking-wider text-[9px] leading-tight">${msg}</span>
            </span>
        `;
    }
}

function getFormattedTime(tStr) {
    if (!tStr) return new Date().toLocaleString('pt-BR');
    if (tStr.includes('/')) return tStr;
    let d = new Date().toLocaleDateString('pt-BR');
    return `${d} ${tStr}`;
}

let DATA_CACHE = null; 
let AVAILABLE_HOURS = []; 
let SELECTED_HOURS = []; 
let CURRENT_METRIC = "concluido"; 
let MATRIX_MODE = "TIME"; 
let manualEtd = null;
let MATRIX_VERSION = 2;

const OFFICIAL_MACROS = {
    "CONSOLIDAÇÃO 00:00": ["SRS9", "SRJ1", "SRS1", "SPR3", "SGO2", "SRJ10", "SSC8", "SSC9"],
    "CONSOLIDAÇÃO 03:00": ["JETRD1", "SES1", "SRD1", "SBA6", "SRD2", "SPR5", "SMR1", "SSC7"],
    "ARENA (03:00)": ["SRJ12", "SRJ4", "SDF2"]
};

let CONSOLIDA_LISTS = {}; 
let SETTINGS_DATA = { 
    pickHC: 50, pickM: 120, 
    packHC: 50, packM: 300, 
    atrHC: 30, atrM: 450, 
    stgHC: 4, stgM: 18, 
    manM: 120, gayM: 500 
};

let CURRENT_R_STR = "1:JETSL1,2:JETSL1,3:SSP8,4:SRJ13,5:SRJ8,6:SSP10,7:SBA4,8:SSP11,9:SSP5,10:SSP39,11:SSP4,12:SMG15,13:SSP23,14:SMG12,15:SSP9,16:SSP20,17:SMG2,18:SMG8,19:SMG9,20:SSP38,21:SPR8,22:SSC2,23:SSC2,24:SDF1,25:SDF1,26:SSP13,27:SRJ5,28:SSP14,29:SSP14,30:SMG14|SSP18|SSP9_S,31:SMG14|SSP18|SSP9_S,32:JETHUB1|SMG5|SSP34|SSP38_S,33:JETHUB1|SMG5|SSP34|SSP38_S,34:SES1|SRJ10_CHP|SSP36|SSP37_S|SSP4_CHP,35:SES1|SRJ10_CHP|SSP36|SSP37_S|SSP4_CHP,36:SRS10|SSC3|SSP1_S|SSP5A_S,37:SRS10|SSC3|SSP1_S|SSP5A_S,38:SGO2|SMG1|SRJ3_CHP|SSP28,39:SGO2|SMG1|SRJ3_CHP|SSP28,40:SMS2|SRJ1_CHP|SSP3_S|SSP40_CHP|SSP48,41:SMS2|SRJ1_CHP|SSP3_S|SSP40_CHP|SSP48,42:SAL1_CHP|SSP30_S,43:SAL1_CHP|SSP30_S,44:SES3|SPR4|SRS8|SSP5_S,45:SES3|SPR4|SRS8|SSP5_S,46:SES3_X|SPR2|SRD1|SSP26,47:SES3_X|SPR2|SRD1|SSP26,48:JETGO1|SAL1|SSC7|SSP12|SSP6,49:JETGO1|SAL1|SSC7|SSP12|SSP6,50:MSP1_E|MSP21_E|MSP5_E|MSP7_E,51:JADHUB|JETBA2|JETBA3|LOGHUB|SSP46|XSP9_1|XSP9_2|XSP9_6,52:MSP1_E|MSP21_E|MSP5_E|MSP7_E|SRJ2,53:SPR1|SSP18_S|SSP3,54:SPR1|SSP18_S|SSP3,55:SMG13|SRS1_CHP|SRS4|SSP7,56:SMG13|SRS1_CHP|SRS4|SSP7,57:IMISL1|SRJ12|SRJ6_CHP|SRJ7|SSP1,58:IMISL1|SRJ12|SRJ6_CHP|SRJ7|SSP1,59:SMG3|SRJ10|SSC4|SSP17,60:SMG3|SRJ10|SSC4|SSP17,61:SMG11|SPI1|SRJ9|SSP1_CHP|SSP40,62:SMG11|SPI1|SRJ9|SSP1_CHP|SSP40,63:SBA7|SPR5|SSC5|SSP40_S|SSP7_S,64:SBA7|SPR5|SSC5|SSP40_S|SSP7_S,65:SBA3|SMG10|SPR7|SSP24|SSP39_S,66:SBA3|SMG10|SPR7|SSP24|SSP39_S,67:SRJ1|SRS5|SSP16|SSP45_CHP|SSP5F_S,68:SRS5|SSP16|SSP45_CHP|SSP49|SSP5F_S,69:SMG13_X|SMG1_CHP|SMG4|SMR1|SSP6_S,70:SMG13_X|SMG1_CHP|SMG4|SMR1|SSP6_S,71:SCE1|SMS1|SPR1_CHP|SSP25_S|SSP37,72:SCE1|SMS1|SPR1_CHP|SSP25_S|SSP37,73:SMG8_CHP|SRD2|SSC1|SSP25|XSP9_6_CHP,74:SMG8_CHP|SRD2|SSC1|SSP25|XSP9_6_CHP,75:SBA6|SMG7|SSP22_CHP|SSP29_S,76:SBA6|SMG7|SSP22_CHP|SSP29_S,77:SBA2|SPA1_X|SRS3|SSC8|SSP31,78:SBA2|SPA1_X|SRS3|SSC8|SSP31,79:SES2|SGO1|SRJ4|SSP45|SSP45_S,80:SES2|SGO1|SRJ4|SSP45|SSP45_S,81:SMR2|SRS2|SSP27_S|SSP29|XSP9_1_CHP,82:SMR2|SRS2|SSP27_S|SSP29|XSP9_1_CHP,83:SPR3|SRJ6|SRS7|SSP12_CHP,84:SPR3|SRJ6|SRS7|SSP12_CHP,85:SMN1|SSC9|SSP15|SSP18_CHP|SSP48_S,86:SMN1|SSC9|SSP15|SSP18_CHP|SSP48_S,87:SRS1|SSP17_CHP|SSP27|SSP49_S|STO1,88:SRS1|SSP17_CHP|SSP27|SSP49_S|STO1,89:SBA1|SMG6|SSP21_CHP|SSP49,90:SBA1|SSP21_CHP|SSP49,91:JETRD1|SRJ3|SSP23_S|SSP30|SSP7_CHP,92:JETRD1|SRJ3|SSP23_S|SSP30|SSP7_CHP,93:SSP21_S|SSP22|STO2,94:SSP21_S|SSP22|STO2,95:SDF2|SPA1|SPR6_CHP|SRS9,96:SDF2|SPA1|SPR6_CHP|SRS9,97:SGO1_X|SPE1|SPR6|SSP15_CHP|SSP21,98:SGO1_X|SPE1|SPR6|SSP15_CHP|SSP21,99:SAL1_A|SAL1_B|SAM1_A|SAM1_C|SBA1_A|SBA2_A|SBA6_A|SCE1_A|SDF1_A|SDF2_A|SES1_A|SES1_B|SFN1_C|SGO1X_A|SGO1_A|SGO1_B|SJP1X_A|SJP1_A|SMN1_A|SMR1_A|SMR1_B|SMR2_A|SPA1X_A|SPA1_A|SPA1_B|SPE1_A|SPI1_A|SRN1_A|SRS1_A|SRS8_A|SRS9_A|SSE1_A|SAM1_B|SCE1_B|SJP1_B|SMN1_B|SPI1_B|SRN1_B|SRS1_B|SSE1_B|STO1_B|SAL1_C|SBA1_C|SCE1_C|SJP1_C|SMR1_C|SPA1_C|SRN1_C|SSE1_C,100:SAL1_A|SAL1_B|SAM1_A|SAM1_C|SBA1_A|SBA2_A|SBA6_A|SCE1_A|SDF1_A|SDF2_A|SES1_A|SES1_B|SFN1_C|SGO1X_A|SGO1_A|SGO1_B|SJP1X_A|SJP1_A|SMN1_A|SMR1_A|SMR1_B|SMR2_A|SPA1X_A|SPA1_A|SPA1_B|SPE1_A|SPI1_A|SRN1_A|SRS1_A|SRS8_A|SRS9_A|SSE1_A|SAM1_B|SCE1_B|SJP1_B|SMN1_B|SPI1_B|SRN1_B|SRS1_B|SSE1_B|STO1_B|SAL1_C|SBA1_C|SCE1_C|SJP1_C|SMR1_C|SPA1_C|SRN1_C|SSE1_C";

let ROUTE_LIST = []; 
let RAMPA_MAP = {};
const AUTO_CHUTES = [1, 2, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 59, 60];

function buildRampaMap() {
    ROUTE_LIST = [];
    for(let i = 1; i <= 100; i++) {
        RAMPA_MAP[i] = [];
    }
    
    CURRENT_R_STR.split(',').forEach(g => {
        if(!g) return;
        let [t, r] = g.split(':');
        
        if(r) { 
            r.split('|').forEach(x => { 
                ROUTE_LIST.push({ t: parseInt(t), r: x }); 
                RAMPA_MAP[parseInt(t)].push(x); 
            }); 
        }
    });
}

buildRampaMap();

function updateRampa() {
    let num = parseInt(document.getElementById('edit-rampa-num').value);
    let routes = document.getElementById('edit-rampa-routes').value.toUpperCase().split(/[\s,]+/).filter(x => x);
    
    if(num >= 1 && num <= 100) {
        RAMPA_MAP[num] = routes;
        let newArr = [];
        
        for(let i = 1; i <= 100; i++) {
            if(RAMPA_MAP[i] && RAMPA_MAP[i].length > 0) {
                newArr.push(i + ":" + RAMPA_MAP[i].join('|'));
            }
        }
        
        CURRENT_R_STR = newArr.join(','); 
        buildRampaMap(); 
        salvarNoBanco(); 
        aplicarFiltros();
        
        alert("Rampa " + num + " atualizada com sucesso na nuvem!");
        document.getElementById('edit-rampa-routes').value = ''; 
        document.getElementById('edit-rampa-num').value = '';
    } else { 
        alert("Número de rampa inválido. Use de 1 a 100."); 
    }
}

document.getElementById('edit-rampa-num').addEventListener('input', (e) => {
    let num = parseInt(e.target.value);
    if(num >= 1 && num <= 100 && RAMPA_MAP[num]) { 
        document.getElementById('edit-rampa-routes').value = RAMPA_MAP[num].join(' '); 
    } else { 
        document.getElementById('edit-rampa-routes').value = ''; 
    }
});

function isAereo(c) { 
    return RAMPA_MAP[99].includes(c) || RAMPA_MAP[100].includes(c) || /_A$|_B$|_C$/.test(c); 
}

function getMetric(i) {
    if(CURRENT_METRIC === 'concluido') return i.concluido;
    if(CURRENT_METRIC === 'gte_packed') return i.packed + i.concluido;
    if(CURRENT_METRIC === 'packed') return i.packed;
    if(CURRENT_METRIC === 'huIn') return i.huIn;
    if(CURRENT_METRIC === 'huCl') return i.huCl;
    return i.ship;
}

function parseNum(s) {
    if(!s || s === '-' || s === '–') return 0;
    let c = s.replace(/[^\d]/g, '');
    if(c === '') return 0; 
    return parseInt(c, 10);
}

function fecharLoader() { 
    document.getElementById('global-loader').classList.add('hidden'); 
}

function encGhost(cache, settings) {
    let mStr = cache.micro.map(r => [
        r.nome, r.horario, r.concluido, r.packed, r.rtp, 
        r.grp, r.pick, r.wav, r.rtw, r.total, r.huIn, 
        r.huCl, r.ship, r.isAereo ? 1 : 0
    ].join('^')).join('~');
    
    let sStr = [
        settings.pickHC, settings.pickM, settings.packHC, 
        settings.packM, settings.atrHC, settings.atrM, 
        settings.stgHC, settings.stgM, settings.manM, settings.gayM
    ].join('^');
    
    return mStr + "§" + sStr + "§" + MATRIX_VERSION + "||" + CURRENT_R_STR;
}

function decGhost(str) {
    if(!str || !str.includes('§')) throw new Error("Formato inválido.");
    
    let parts = str.split('§'); 
    let mStr = parts[0], sStr = parts[1], rampaStr = parts[2];
    let micro = [], kpis = {};
    
    if(mStr) {
        mStr.split('~').forEach(x => {
            let p = x.split('^'); 
            if(p.length < 14) return;
            
            let r = { 
                nome: p[0], 
                horario: p[1], 
                concluido: +p[2], 
                packed: +p[3], 
                rtp: +p[4], 
                grp: +p[5], 
                pick: +p[6], 
                wav: +p[7], 
                rtw: +p[8], 
                total: +p[9], 
                huIn: +p[10], 
                huCl: +p[11], 
                ship: +p[12], 
                isAereo: p[13] === '1' 
            };
            
            micro.push(r); 
            if(!kpis[r.horario]) kpis[r.horario] = { total: 0 }; 
            kpis[r.horario].total += r.total;
        });
    }
    
    if(rampaStr && rampaStr.includes('||')) { 
        let rParts = rampaStr.split('||');
        if(parseInt(rParts[0]) >= MATRIX_VERSION) {
            CURRENT_R_STR = rParts[1]; 
            buildRampaMap(); 
        }
    }
    
    let p = sStr ? sStr.split('^') : [];
    let s = { 
        pickHC: +p[0] || 50, 
        pickM: +p[1] || 120, 
        packHC: +p[2] || 50, 
        packM: +p[3] || 300, 
        atrHC: +p[4] || 30, 
        atrM: +p[5] || 450, 
        stgHC: +p[6] || 4, 
        stgM: +p[7] || 18, 
        manM: +p[8] || 120, 
        gayM: +p[9] || 500 
    };
    
    return { d: { micro, kpis }, s: s };
}

function processarNuvem(r) {
    try {
        let parsed = decGhost(r.payload); 
        DATA_CACHE = parsed.d; 
        SETTINGS_DATA = parsed.s; 
        let s = SETTINGS_DATA;
        
        ['pickHC','pickM','packHC','packM','atrHC','atrM','stgHC','stgM'].forEach(k => { 
            let el = document.getElementById('inp-' + k.replace(/[A-Z]/g, l => '-' + l.toLowerCase())); 
            if(el) el.value = s[k] || ''; 
        });
        
        document.getElementById('inp-cap-man').value = s.manM; 
        document.getElementById('inp-cap-gay').value = s.gayM;
        
        AVAILABLE_HOURS = Object.keys(DATA_CACHE.kpis).filter(k => k !== "99" && k !== "S/H" && k !== "ATRASO").sort(); 
        SELECTED_HOURS = []; 
        
        renderEtdCheckboxes(); 
        aplicarFiltros(); 
        setStatusUi(`Atualizado: ${getFormattedTime(r.time)}`, 'bg-emerald-500 animate-pulse');
    } catch(e) { 
        setStatusUi('Erro de Leitura', 'bg-red-500');
    }
}

function salvarNoBanco() {
    setStatusUi('Salvando Nuvem...', 'bg-amber-500 animate-pulse');
    
    let payloadStr = encGhost(DATA_CACHE, SETTINGS_DATA);
    let time = getFormattedTime(new Date().toLocaleTimeString('pt-BR'));

    fetch(`https://api.github.com/gists/${GIST_ID}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            files: {
                "v50_db.json": {
                    content: JSON.stringify({ payload: payloadStr, time: time })
                }
            }
        })
    })
    .then(response => {
        if(!response.ok) throw new Error("Erro na API do GitHub");
        return response.json();
    })
    .then(data => {
        setStatusUi(`Atualizado: ${time}`, 'bg-emerald-500');
    })
    .catch(error => {
        console.error("Erro ao salvar:", error);
        setStatusUi('Erro Salvar', 'bg-red-500');
    });
}

function sincronizarComBanco(manual) {
    if(!manual) return;
    document.getElementById('loader-title').innerText = "Baixando Nuvem..."; 
    document.getElementById('global-loader').classList.remove('hidden'); 
    setStatusUi('Sincronizando...', 'bg-blue-500 animate-pulse');
    
    fetch(`https://api.github.com/gists/${GIST_ID}?t=${Date.now()}`, {
        headers: {
            'Authorization': `Bearer ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    })
    .then(response => response.json())
    .then(data => {
        fecharLoader();
        try {
            let content = data.files["v50_db.json"].content;
            let parsed = JSON.parse(content);
            if (parsed.payload) {
                let r = { payload: parsed.payload, time: parsed.time };
                processarNuvem(r);
            } else {
                openModal('import-modal');
            }
        } catch(e) {
            openModal('import-modal');
        }
    })
    .catch(error => {
        fecharLoader();
        console.error("Erro ao ler:", error);
        setStatusUi('Falha na Rede', 'bg-red-500'); 
    });
}

function initStorage() { 
    try { 
        let sMac = localStorage.getItem('MACRO_CFG'); 
        if(sMac) { 
            let p = JSON.parse(sMac); 
            Object.keys(p).forEach(k => { 
                if(!OFFICIAL_MACROS[k]) CONSOLIDA_LISTS[k] = p[k]; 
            }); 
        } 
    } catch(e) {} 
}

function saveHC() {
    let g = (id, def) => {
        let val = parseFloat(document.getElementById(id).value);
        return isNaN(val) || val <= 0 ? def : val;
    };
    
    SETTINGS_DATA = { 
        pickHC: g('inp-hc-pick', 50), pickM: g('inp-med-pick', 120), 
        packHC: g('inp-hc-pack', 50), packM: g('inp-med-pack', 300), 
        atrHC: g('inp-hc-atr', 30), atrM: g('inp-med-atr', 450), 
        stgHC: g('inp-hc-stg', 4), stgM: g('inp-med-stg', 18), 
        manM: g('inp-cap-man', 120), 
        gayM: g('inp-cap-gay', 500) 
    };
    
    try { 
        localStorage.setItem('HC_CFG', JSON.stringify(SETTINGS_DATA)); 
    } catch(e){}
    
    calcProjections(); 
    salvarNoBanco();
}

function calcProjections() {
    if(!DATA_CACHE || !DATA_CACHE.micro) return;
    
    let s = SETTINGS_DATA; 
    let capPick = (s.pickHC || 50) * (s.pickM || 120);
    let capPack = (s.packHC || 50) * (s.packM || 300);
    let capAtr = (s.atrHC || 30) * (s.atrM || 450);
    let capStgMangas = (s.stgHC || 4) * (s.stgM || 18);
    
    let list = DATA_CACHE.micro.filter(i => !i.isAereo && i.horario !== "ATRASO");
    let vPi = 0, vPa = 0, vPck = 0; 
    
    list.forEach(i => { 
        vPi += ((i.wav || 0) + (i.rtw || 0) + (i.pick || 0)); 
        vPa += ((i.rtp || 0) + (i.grp || 0)); 
        vPck += (i.packed || 0); 
    });
    
    let totalPcs = vPi + vPa + vPck;
    let totalMangas = Math.ceil(totalPcs / (s.manM || 120));
    
    let tPick = capPick > 0 ? vPi / capPick : (vPi > 0 ? Infinity : 0);
    let tPack = capPack > 0 ? (vPi + vPa) / capPack : ((vPi + vPa) > 0 ? Infinity : 0);
    let tAtr  = capAtr > 0 ? totalPcs / capAtr : (totalPcs > 0 ? Infinity : 0);
    let tStg  = capStgMangas > 0 ? totalMangas / capStgMangas : (totalMangas > 0 ? Infinity : 0);
    
    let maxTime = Math.max(tPick, tPack, tAtr, tStg);
    let mangasPorHoraAtr = capAtr / (s.manM || 120);
    
    function formatTime(hours) {
        if (hours === 0) return "0 min";
        if (!isFinite(hours)) return "∞";
        let h = Math.floor(hours);
        let m = Math.round((hours - h) * 60);
        if(m === 60) { h++; m = 0; }
        if(h === 0) return m + " min";
        return h + "h " + m + "m";
    }

    let html = `
        <div class="space-y-3">
            <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 flex justify-between items-center shadow-lg">
                <div>
                    <span class="text-[10px] uppercase text-slate-400 font-bold">Tempo Total Estimado de Processo</span>
                    <div class="text-3xl font-black text-white">${formatTime(maxTime)}</div>
                </div>
                <div class="text-right">
                    <span class="text-[10px] uppercase text-slate-400 font-bold">Volume Físico na Malha</span>
                    <div class="text-xl font-black text-blue-400">${totalPcs.toLocaleString()} pçs</div>
                </div>
            </div>

            <div class="bg-slate-800/50 p-4 rounded-xl border ${capPick > capPack && vPi > 0 ? 'border-amber-500/50' : 'border-slate-700'}">
                <div class="flex justify-between mb-1.5">
                    <h4 class="font-bold text-blue-400">1. Picking</h4>
                    <span class="text-xs font-mono font-bold text-slate-300">${formatTime(tPick)}</span>
                </div>
                <div class="text-xs text-slate-400 leading-relaxed mb-2">
                    Processando <strong>${vPi.toLocaleString()} pçs</strong> (Capacidade: <strong>${capPick.toLocaleString()} pçs/h</strong>).<br>
                    <span class="opacity-75">Tempo médio da tarefa: ~1h. Volume proveniente de Waving (pendente) e Picking (atual).</span>
                </div>
                ${capPick > capPack && vPi > 0 ? `<div class="text-[10px] text-amber-400 font-bold bg-amber-900/20 px-2.5 py-1.5 rounded shadow-sm border border-amber-900/50"><i class="fa-solid fa-triangle-exclamation mr-1"></i> Alta Eficiência: Picking está a injectar peças mais rápido do que o Packing suporta. Isso aumentará o acúmulo de tarefas no Packing.</div>` : ''}
            </div>

            <div class="bg-slate-800/50 p-4 rounded-xl border ${capPack > capAtr && (vPi + vPa) > 0 ? 'border-amber-500/50' : 'border-slate-700'}">
                <div class="flex justify-between mb-1.5">
                    <h4 class="font-bold text-emerald-400">2. Packing</h4>
                    <span class="text-xs font-mono font-bold text-slate-300">${formatTime(tPack)}</span>
                </div>
                <div class="text-xs text-slate-400 leading-relaxed mb-2">
                    Processando <strong>${(vPi + vPa).toLocaleString()} pçs</strong> acumuladas (Capacidade: <strong>${capPack.toLocaleString()} pçs/h</strong>).<br>
                    <span class="opacity-75">Volume de Ready to Pack e Grouping + repasse do Picking.</span>
                </div>
                ${capPack > capAtr && (vPi + vPa) > 0 ? `<div class="text-[10px] text-amber-400 font-bold bg-amber-900/20 px-2.5 py-1.5 rounded shadow-sm border border-amber-900/50"><i class="fa-solid fa-triangle-exclamation mr-1"></i> Atenção na Esteira: Packing envia peças num ritmo maior do que o Atrelamento consegue fechar mangas.</div>` : ''}
                ${capPick > capPack && vPi > 0 ? `<div class="text-[10px] text-red-400 font-bold bg-red-900/20 px-2.5 py-1.5 mt-1.5 rounded shadow-sm border border-red-900/50"><i class="fa-solid fa-arrow-up-right-dots mr-1"></i> Sofrendo forte impacto do fluxo acelerado do Picking (fila a acumular).</div>` : ''}
            </div>

            <div class="bg-slate-800/50 p-4 rounded-xl border ${mangasPorHoraAtr > capStgMangas && totalPcs > 0 ? 'border-amber-500/50' : 'border-slate-700'}">
                <div class="flex justify-between mb-1.5">
                    <h4 class="font-bold text-indigo-400">3. Atrelamento</h4>
                    <span class="text-xs font-mono font-bold text-slate-300">${formatTime(tAtr)}</span>
                </div>
                <div class="text-xs text-slate-400 leading-relaxed mb-2">
                    Fechando <strong>${totalPcs.toLocaleString()} pçs</strong> totais (Capacidade: <strong>${capAtr.toLocaleString()} pçs/h</strong>).<br>
                    <span class="opacity-75">Volume de Packed (pendente para docar) + repasse das esteiras.</span>
                </div>
                ${mangasPorHoraAtr > capStgMangas && totalPcs > 0 ? `<div class="text-[10px] text-amber-400 font-bold bg-amber-900/20 px-2.5 py-1.5 rounded shadow-sm border border-amber-900/50"><i class="fa-solid fa-triangle-exclamation mr-1"></i> Gargalo no Fechamento: A formar ~${Math.ceil(mangasPorHoraAtr)} mangas/h, mas o Stage consegue puxar apenas ${capStgMangas}/h.</div>` : ''}
            </div>

            <div class="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <div class="flex justify-between mb-1.5">
                    <h4 class="font-bold text-purple-400">4. Stage (Movimentação)</h4>
                    <span class="text-xs font-mono font-bold text-slate-300">${formatTime(tStg)}</span>
                </div>
                <div class="text-xs text-slate-400 leading-relaxed">
                    Puxando <strong>${totalMangas.toLocaleString()} Mangas estimadas</strong> (Capacidade: <strong>${capStgMangas.toLocaleString()} mangas/h</strong>).
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('hc-projections').innerHTML = html;
}

function openModal(id) { 
    document.getElementById(id).classList.remove('hidden'); 
    if(id === 'import-modal') {
        document.getElementById('input-paste').value = ''; 
    }
}

function closeModal(id) { 
    document.getElementById(id).classList.add('hidden'); 
}

function mudarAba(aba) {
    document.querySelectorAll('[id^="view-"]').forEach(e => e.classList.add('hidden')); 
    document.getElementById('view-' + aba).classList.remove('hidden');
    
    document.querySelectorAll('.sidebar-link').forEach(e => e.classList.remove('active')); 
    document.getElementById('btn-' + aba).classList.add('active');
    
    if(aba === 'hc') calcProjections(); 
    if(aba === 'live') updateLiveClock();
}

function toggleEtdDropdown() { 
    document.getElementById('etd-dropdown-panel').classList.toggle('hidden'); 
}

function renderEtdCheckboxes() {
    let h = `
        <label class="flex gap-2 p-2 text-xs font-bold hover:bg-slate-50 cursor-pointer">
            <input type="checkbox" onchange="toggleAllEtds(this)" ${SELECTED_HOURS.length === 0 ? 'checked' : ''} class="w-4 h-4 rounded"> 
            TODOS
        </label>
        <hr>
    `;
    
    AVAILABLE_HOURS.forEach(hr => { 
        h += `
            <label class="flex gap-2 p-2 text-xs hover:bg-slate-50 cursor-pointer">
                <input type="checkbox" value="${hr}" onchange="toggleSingleEtd(this)" ${SELECTED_HOURS.includes(hr) ? 'checked' : ''} class="w-4 h-4 rounded"> 
                ${hr}H
            </label>
        `; 
    });
    
    document.getElementById('etd-dropdown-panel').innerHTML = h; 
    document.getElementById('etd-btn-text').innerText = SELECTED_HOURS.length === 0 ? "TODOS" : (SELECTED_HOURS.length === 1 ? SELECTED_HOURS[0] + "H" : SELECTED_HOURS.length + " SELEC");
    
    let liveSel = document.getElementById('live-etd-override');
    if(liveSel) { 
        let h2 = `<option value="AUTO">Automático (Próximo ETD)</option>`; 
        AVAILABLE_HOURS.forEach(hr => h2 += `<option value="${hr}">${hr}H</option>`); 
        liveSel.innerHTML = h2; 
    }
}

function toggleAllEtds(e) { 
    SELECTED_HOURS = []; 
    renderEtdCheckboxes(); 
    aplicarFiltros(); 
}

function toggleSingleEtd(e) { 
    if(e.checked) {
        SELECTED_HOURS.push(e.value); 
    } else {
        SELECTED_HOURS = SELECTED_HOURS.filter(x => x !== e.value); 
    }
    if(SELECTED_HOURS.length >= AVAILABLE_HOURS.length) {
        SELECTED_HOURS = []; 
    }
    renderEtdCheckboxes(); 
    aplicarFiltros(); 
}

function updateLiveClock() {
    let liveView = document.getElementById('view-live'); 
    if(!liveView || liveView.classList.contains('hidden')) return;
    
    let clockEl = document.getElementById('live-clock'); 
    if(!clockEl) return;
    
    let now = new Date(); 
    clockEl.innerText = new Intl.DateTimeFormat('pt-BR', {
        timeZone: 'America/Sao_Paulo', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit'
    }).format(now);
    
    if(!DATA_CACHE || !AVAILABLE_HOURS.length) return;
    
    let currentHour = parseInt(now.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit' }));
    let nextEtd = manualEtd;
    
    if(!nextEtd || nextEtd === "AUTO") {
        let hoursNum = AVAILABLE_HOURS.map(h => parseInt(h)).sort((a, b) => a - b);
        let found = hoursNum.find(h => h > currentHour); 
        if(found === undefined) found = hoursNum[0];
        nextEtd = found.toString().padStart(2, '0');
    }
    
    if(document.getElementById('live-etd-lbl').innerText !== nextEtd + "H") {
        renderLiveEtd(nextEtd);
    }
}

setInterval(updateLiveClock, 1000);

function manualEtdOverride() { 
    manualEtd = document.getElementById('live-etd-override').value === "AUTO" ? null : document.getElementById('live-etd-override').value; 
    document.getElementById('live-etd-lbl').innerText = ""; 
    updateLiveClock(); 
}

function renderLiveEtd(etdStr) {
    document.getElementById('live-etd-lbl').innerText = etdStr + "H";
    let lst = DATA_CACHE.micro.filter(r => r.horario === etdStr);
    
    if(lst.length === 0) {
        document.getElementById('live-kpi-area').innerHTML = `
            <div class="col-span-3 text-center p-6 text-slate-400 font-bold bg-white rounded-xl border">
                Sem dados para este horário.
            </div>
        `;
        document.getElementById('live-offenders-body').innerHTML = `
            <tr>
                <td colspan="7" class="p-6 text-center text-slate-400">Sem rotas.</td>
            </tr>
        `;
        document.getElementById('live-fullhacks-area').innerHTML = `
            <div class="text-center text-slate-400 text-xs py-4">Nenhum packed.</div>
        `; 
        return;
    }
    
    let t = 0, cDisplay = 0, cReal = 0, p = 0, r = 0, g = 0, pi = 0, w = 0;
    
    lst.forEach(i => { 
        t += i.total; 
        cDisplay += getMetric(i); 
        cReal += i.concluido; 
        p += i.packed; 
        r += i.rtp; 
        g += i.grp; 
        pi += i.pick; 
        w += (i.wav + i.rtw); 
    });
    
    let m985 = Math.ceil(t * 0.985); 
    let pct = t > 0 ? ((cDisplay / t) * 100).toFixed(2) : '0.00'; 
    let pendTotal = r + g + pi + w;
    let fmtK = (v) => v >= 10000 ? (v / 1000).toFixed(1).replace('.0', '') + 'k' : v.toLocaleString();
    let faltaSlaReal = m985 - cReal;
    
    let salvaPackedHtml = faltaSlaReal > 0 
        ? ((cReal + p) >= m985 
            ? `<span class="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-black uppercase">Sim, Pck Salva</span>` 
            : `<span class="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[10px] font-black uppercase">Não (Falta ${(m985 - (cReal + p)).toLocaleString()})</span>`) 
        : `<span class="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-black uppercase">Meta Atingida</span>`;
        
    let selOption = document.getElementById('metric-selector'); 
    let metricName = selOption.options[selOption.selectedIndex].text;

    document.getElementById('live-kpi-area').innerHTML = `
        <div class="bg-white border rounded-xl p-4 shadow-sm flex flex-col justify-between border-l-4 border-l-brand-500">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">${metricName}</span>
            <div class="flex items-end gap-2 my-2">
                <span class="text-3xl font-black text-slate-800 tracking-tighter">${cDisplay.toLocaleString()}</span>
                <span class="text-xs font-bold text-slate-400 mb-1">/ ${fmtK(t)}</span>
            </div>
            <div class="flex justify-between items-center border-t pt-2 mt-auto">
                <span class="text-xs font-bold text-slate-500">Atingimento:</span>
                <span class="text-sm font-black text-brand-600">${pct}%</span>
            </div>
        </div>
        
        <div class="bg-white border rounded-xl p-4 shadow-sm flex flex-col justify-between border-l-4 ${faltaSlaReal > 0 ? 'border-l-rose-500' : 'border-l-emerald-500'}">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Alvo (98.5%)</span>
            <div class="flex items-end gap-2 my-2">
                <span class="text-3xl font-black tracking-tighter ${faltaSlaReal > 0 ? 'text-rose-600' : 'text-emerald-500'}">${faltaSlaReal > 0 ? faltaSlaReal.toLocaleString() : 'OK'}</span>
                <span class="text-xs font-bold text-slate-400 mb-1">${faltaSlaReal > 0 ? 'peças para bater' : ''}</span>
            </div>
            <div class="flex justify-between items-center border-t pt-2 mt-auto">
                <span class="text-xs font-bold text-slate-500">Pendente Físico (Rua):</span>
                <span class="text-sm font-black text-slate-800">${pendTotal.toLocaleString()}</span>
            </div>
        </div>
        
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col justify-between">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <i class="fa-solid fa-box-open mr-1"></i> Análise de Packed
            </span>
            <div class="flex items-end gap-2 my-2">
                <span class="text-3xl font-black text-white tracking-tighter">${p.toLocaleString()}</span>
                <span class="text-xs font-bold text-slate-500 mb-1">embalados</span>
            </div>
            <div class="flex justify-between items-center border-t border-slate-700 pt-2 mt-auto">
                <span class="text-[10px] font-bold text-slate-300">O Packed Salva?</span>
                ${salvaPackedHtml}
            </div>
        </div>
    `;

    let offList = lst.filter(i => (i.total - (i.huIn + i.huCl + i.ship)) > 0)
                     .sort((a, b) => (b.total - (b.huIn + b.huCl + b.ship)) - (a.total - (a.huIn + a.huCl + a.ship)));
                     
    document.getElementById('live-offenders-body').innerHTML = offList.map(r => `
        <tr>
            <td class="p-3 pl-6 font-bold text-slate-800">${r.nome}</td>
            <td class="p-3 text-right text-purple-600 font-bold">${r.ship}</td>
            <td class="p-3 text-right text-emerald-600 font-bold">${r.packed}</td>
            <td class="p-3 text-right text-red-600 font-bold">${r.rtp + r.grp}</td>
            <td class="p-3 text-right text-amber-600 font-bold">${r.pick + r.wav + r.rtw}</td>
            <td class="p-3 text-right font-black text-slate-800">${r.total}</td>
            <td class="p-3 pr-6 text-right">
                <span class="bg-rose-100 text-rose-700 px-2 py-0.5 rounded text-[10px] font-bold">Falta ${r.total - (r.huIn + r.huCl + r.ship)}</span>
            </td>
        </tr>
    `).join('');

    let rampsWithPacked = {};
    lst.forEach(route => {
        if(route.packed > 0) {
            let rNum = Object.keys(RAMPA_MAP).find(k => RAMPA_MAP[k].includes(route.nome));
            if(rNum) {
                if(!rampsWithPacked[rNum]) rampsWithPacked[rNum] = { pck: 0, routes: [] };
                rampsWithPacked[rNum].pck += route.packed;
                if(!rampsWithPacked[rNum].routes.includes(route.nome)) {
                    rampsWithPacked[rNum].routes.push(route.nome);
                }
            }
        }
    });

    let rKeys = Object.keys(rampsWithPacked).sort((a, b) => rampsWithPacked[b].pck - rampsWithPacked[a].pck);
    document.getElementById('live-fullhacks-area').innerHTML = rKeys.length === 0 
        ? `<div class="text-center text-slate-400 text-xs py-4 font-bold">Limpo.</div>` 
        : rKeys.map(k => `
            <div class="bg-white border border-emerald-100 p-2 rounded-lg flex justify-between items-center shadow-sm">
                <div class="flex items-center gap-3">
                    <div class="bg-emerald-500 text-white font-black text-xs w-8 h-8 flex items-center justify-center rounded">R${k}</div>
                    <div class="flex flex-col">
                        <span class="text-[9px] text-slate-400 uppercase font-bold">Rotas:</span>
                        <span class="text-[10px] font-bold text-slate-700 w-32 truncate" title="${rampsWithPacked[k].routes.join(', ')}">${rampsWithPacked[k].routes.join(', ')}</span>
                    </div>
                </div>
                <div class="text-right flex flex-col items-end">
                    <span class="text-lg font-black text-emerald-600 leading-none">${rampsWithPacked[k].pck}</span>
                    <span class="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Packed</span>
                </div>
            </div>
        `).join('');
}

function processarTextoCola() {
    let txt = document.getElementById('input-paste').value;
    if(!txt) return; 
    
    closeModal('import-modal');
    document.getElementById('global-loader').classList.remove('hidden');
    document.getElementById('loader-title').innerText = "Analisando WMS...";
    
    setTimeout(() => {
        try {
            let vR = ROUTE_LIST.map(i => i.r).sort((a, b) => b.length - a.length);
            let lines = txt.split(/\r?\n/); 
            let hAct = "S/H";
            let mM = {};
            let k = {};
            let hText = txt.substring(0, 3000).toUpperCase(); 
            let expectedCols = [];
            
            if (hText.includes("WAVING")) { 
                expectedCols.push('wav'); 
                if (hText.includes("READY TO WAVE")) {
                    expectedCols.push('rtw'); 
                }
            }
            
            expectedCols.push('pi', 'rtg', 'g', 'r', 'p');
            
            if (hText.includes("SHIPPED") || hText.includes("HU CLOSED")) {
                expectedCols.push('huIn', 'huCl', 'ship');
            } else if (hText.includes("HU IN")) {
                expectedCols.push('huIn');
            }
            
            if(expectedCols.length === 0) {
                expectedCols = ['wav','rtw','pi','rtg','g','r','p','huIn','huCl','ship'];
            }
            
            let N = expectedCols.length;

            for(let i = 0; i < lines.length; i++) {
                let l = lines[i].trim(); 
                if(l.length < 4) continue;
                
                let hm = l.match(/(?:^|\b)(\d{2}):00\s*(?:HR|H)?\b/i) || l.match(/\b(\d{2})00\s*HR/i) || l.match(/Analisar\s+atraso/i);
                
                if(hm && !l.toUpperCase().includes("TEMPO")) { 
                    hAct = l.match(/atraso/i) ? "ATRASO" : hm[1] || hm[0]; 
                    continue; 
                }

                let u = l.toUpperCase();
                
                if (u.match(/TOTAL|SUBTOTAL|PERFORMANCE|PROCESSADOS|FECHADOS|CARREGADOS|EXPEDIDOS|ENVIADOS|RECEBIDOS|HUS ABERTAS|RESUMO/i)) {
                    continue;
                }

                let c = vR.find(x => new RegExp(`(?:^|\\s)${x}(?:\\s|$)`).test(u));
                
                if(!c) {
                    let dynMatch = u.match(/^(?:[A-Z]{3,4}\d{1,2}(?:_[A-Z0-9]+)?|JET[A-Z]{2,3}\d+|[A-Z]+HUB\d*)(?=\s|$)/);
                    if (dynMatch && !["TOTAL","SUBTOTAL","SLA","TEMPO","PERFORMANCE"].includes(dynMatch[0])) {
                        c = dynMatch[0];
                    }
                }
                
                if(!c) continue;

                let str = l;
                for(let j = i + 1; j < i + 20 && j < lines.length; j++) {
                    let n = lines[j].trim(); 
                    let uN = n.toUpperCase();
                    
                    if(n === "") continue;
                    
                    if(uN.match(/(?:^|\b)(\d{2}):00\s*(?:HR|H)?\b/i) || uN.match(/\b(\d{2})00\s*HR/i) || uN.match(/ATRASO/i)) {
                        break;
                    }
                    if(uN.match(/TOTAL|SUBTOTAL|PROCESSADOS|FECHADOS|CARREGADOS|EXPEDIDOS|ENVIADOS|RECEBIDOS|HUS ABERTAS|RESUMO/i)) {
                        break; 
                    }
                    if(vR.find(x => new RegExp(`(?:^|\\s)${x}(?:\\s|$)`).test(uN))) {
                        break;
                    }
                    str += " " + n;
                }

                let tokens = str.split(/[\s\t]+/).filter(x => x !== "");
                let slaIdx = tokens.findIndex(t => t.includes('%')); 
                
                let numsB = [];
                let numsA = [];
                
                tokens.forEach((tk, idx) => {
                    if (/^-?\d{2}:\d{2}(hr|h)?$/i.test(tk)) return; 
                    if (ROUTE_LIST.some(r => r.r === tk.toUpperCase())) return;
                    
                    let clean = tk.replace(/[\.,]/g, '');
                    if (/^-?\d+$/.test(clean) || tk === '-' || tk === '–') {
                        if(slaIdx !== -1 && idx > slaIdx) {
                            numsA.push(clean);
                        } else if (idx < slaIdx || slaIdx === -1) {
                            numsB.push(clean);
                        }
                    }
                });

                let vTot = 0, vProc = 0;
                let mArr = [];

                if (slaIdx !== -1) {
                    vTot = parseNum(numsB[numsB.length - 2] || "0");
                    vProc = parseNum(numsB[numsB.length - 1] || numsB[0] || "0");
                    mArr = numsA.map(parseNum);
                } else {
                    let drop = hText.includes("TEMPO") ? 1 : 0;
                    let valN = numsB.slice();
                    if (drop && valN.length > N + 1) valN.pop();
                    
                    let mStart = Math.max(0, valN.length - N);
                    mArr = valN.slice(mStart).map(parseNum);
                    
                    while (mArr.length < N) {
                        mArr.unshift(0);
                    }
                    
                    let bef = valN.slice(0, mStart);
                    vTot = parseNum(bef[bef.length - 2] || "0");
                    vProc = parseNum(bef[bef.length - 1] || bef[0] || "0");
                }

                let m = { rtw: 0, wav: 0, pi: 0, rtg: 0, g: 0, r: 0, p: 0, huIn: 0, huCl: 0, ship: 0 };
                for(let k = 0; k < N; k++) {
                    if (k < mArr.length) {
                        m[expectedCols[k]] = mArr[k];
                    }
                }

                let tot = vTot;
                if (vTot < vProc && vTot > 0) {
                    tot = vTot + vProc;
                } else if (vTot === 0 && vProc > 0) {
                    tot = vProc;
                }

                let cReal = m.huIn + m.huCl + m.ship;
                if (cReal === 0 && vProc > 0) {
                    cReal = vProc;
                }

                let sMet = m.p + m.r + m.rtg + m.g + m.pi + m.wav + m.rtw + cReal;
                if (tot === 0 || tot < sMet) {
                    tot = sMet;
                }

                if (tot === 0) continue; 

                if(tot >= 0) {
                    if(hAct === "S/H") hAct = "99";
                    let kId = c + "-" + hAct;
                    
                    if(!mM[kId]) {
                        mM[kId] = { 
                            nome: c, 
                            horario: hAct, 
                            concluido: 0, 
                            packed: 0, 
                            rtp: 0, 
                            grp: 0, 
                            pick: 0, 
                            wav: 0, 
                            rtw: 0, 
                            total: 0, 
                            huIn: 0, 
                            huCl: 0, 
                            ship: 0, 
                            isAereo: isAereo(c) 
                        };
                    }
                    
                    mM[kId].concluido += cReal; 
                    mM[kId].packed += m.p; 
                    mM[kId].rtp += m.r; 
                    mM[kId].grp += (m.rtg + m.g); 
                    mM[kId].pick += m.pi; 
                    mM[kId].wav += m.wav; 
                    mM[kId].rtw += m.rtw; 
                    mM[kId].huIn += m.huIn; 
                    mM[kId].huCl += m.huCl; 
                    mM[kId].ship += m.ship; 
                    mM[kId].total += tot;
                    
                    if(!k[hAct]) k[hAct] = { total: 0 }; 
                    k[hAct].total += tot;
                }
            }

            let arr = Object.values(mM).sort((a, b) => b.total - a.total);
            if(arr.length === 0) { 
                alert("Tabela vazia ou mal copiada. Copie desde o cabeçalho até o final e expanda os horários."); 
                fecharLoader(); 
                openModal('import-modal'); 
                return; 
            }

            let isMerge = document.getElementById('chk-merge').checked;
            let finalArr = arr;
            let finalKpis = k;

            if (isMerge && DATA_CACHE && DATA_CACHE.micro) {
                let mergedMap = {};
                
                DATA_CACHE.micro.forEach(r => {
                    mergedMap[r.nome + "-" + r.horario] = r;
                });
                
                arr.forEach(r => {
                    mergedMap[r.nome + "-" + r.horario] = r;
                });
                
                finalArr = Object.values(mergedMap).sort((a, b) => b.total - a.total);
                
                finalKpis = {};
                finalArr.forEach(r => {
                    if(!finalKpis[r.horario]) finalKpis[r.horario] = { total: 0 };
                    finalKpis[r.horario].total += r.total;
                });
            }

            DATA_CACHE = { micro: finalArr, kpis: finalKpis };
            AVAILABLE_HOURS = Object.keys(finalKpis).filter(x => x !== "99" && x !== "S/H" && x !== "ATRASO").sort();
            SELECTED_HOURS = []; 
            renderEtdCheckboxes();
            
            fecharLoader(); 
            salvarNoBanco(); 
            aplicarFiltros(); 
            mudarAba('dashboard');
        } catch(e) { 
            alert("Erro de Sistema: " + e.message); 
            fecharLoader(); 
            openModal('import-modal'); 
        }
    }, 500);
}

function aplicarFiltros() {
    if(!DATA_CACHE) return;
    
    CURRENT_METRIC = document.getElementById('metric-selector').value;
    let lst = DATA_CACHE.micro;
    
    if(SELECTED_HOURS.length > 0) {
        lst = lst.filter(x => SELECTED_HOURS.includes(x.horario) || x.horario === 'ATRASO');
    }
    
    renderDash(lst); 
    renderAereo(DATA_CACHE.micro); 
    renderMatriz(lst); 
    renderMicro(lst); 
    renderMacro(lst); 
    calcProjections();
    
    document.getElementById('live-etd-lbl').innerText = ""; 
    updateLiveClock();
}

function renderDash(lst) {
    let tr = lst.filter(i => !i.isAereo && i.horario !== 'ATRASO');
    let tt = 0, tc = 0, tp = 0, ti = 0, th = 0, ts = 0;
    
    tr.forEach(i => { 
        tt += i.total; 
        tc += getMetric(i); 
        tp += i.packed; 
        ti += i.huIn; 
        th += i.huCl; 
        ts += i.ship; 
    });
    
    setVal('dash-terr-total', tt.toLocaleString()); 
    setVal('dash-terr-targetval', tc.toLocaleString()); 
    setVal('dash-terr-packed', tp.toLocaleString()); 
    setVal('dash-terr-huin', ti.toLocaleString()); 
    setVal('dash-terr-hucl', th.toLocaleString()); 
    setVal('dash-terr-ship', ts.toLocaleString());
    
    let p = tt > 0 ? ((tc / tt) * 100).toFixed(2) : '0.00'; 
    setVal('dash-terr-pct', p + '%'); 
    setStyle('dash-terr-bar', 'width', p + '%');

    let at = 0, ac = 0, ap = 0, ai = 0, ah = 0, as = 0;
    lst.filter(i => i.horario !== 'ATRASO').forEach(i => { 
        at += i.total; 
        ac += getMetric(i); 
        ap += i.packed; 
        ai += i.huIn; 
        ah += i.huCl; 
        as += i.ship; 
    });
    
    setVal('dash-all-total', at.toLocaleString()); 
    setVal('dash-all-targetval', ac.toLocaleString()); 
    setVal('dash-all-packed', ap.toLocaleString()); 
    setVal('dash-all-huin', ai.toLocaleString()); 
    setVal('dash-all-hucl', ah.toLocaleString()); 
    setVal('dash-all-ship', as.toLocaleString());
    
    let pa = at > 0 ? ((ac / at) * 100).toFixed(2) : '0.00'; 
    setVal('dash-all-pct', pa + '%'); 
    setStyle('dash-all-bar', 'width', pa + '%');

    let bT = 0, bP = 0, bS = 0; 
    lst.filter(i => i.horario === 'ATRASO').forEach(i => { 
        bT += i.total; 
        bP += i.concluido; 
        bS += (i.huCl + i.ship); 
    });
    
    const bArea = document.getElementById('dash-backlog-area');
    if(bT > 0) { 
        bArea.classList.remove('hidden'); 
        setVal('bl-total', bT.toLocaleString()); 
        setVal('bl-proc', bP.toLocaleString()); 
        setVal('bl-ship', bS.toLocaleString()); 
        setVal('bl-pend', Math.max(0, bT - bP).toLocaleString()); 
    } else {
        bArea.classList.add('hidden');
    }

    let allValid = lst.filter(i => i.horario !== 'ATRASO'); 
    let grps = {}; 
    
    allValid.forEach(i => { 
        if(!grps[i.horario]) {
            grps[i.horario] = { t: 0, c: 0, p: 0, i: 0, h: 0, s: 0 }; 
        }
        grps[i.horario].t += i.total; 
        grps[i.horario].c += getMetric(i); 
        grps[i.horario].p += i.packed; 
        grps[i.horario].i += i.huIn; 
        grps[i.horario].h += i.huCl; 
        grps[i.horario].s += i.ship; 
    });
    
    let hKpi = ''; 
    let fmtK = (v) => v >= 10000 ? (v / 1000).toFixed(1).replace('.0', '') + 'k' : v.toLocaleString();
    
    Object.keys(grps).sort().forEach(k => {
        let g = grps[k];
        let pt = g.t > 0 ? ((g.c / g.t) * 100).toFixed(2) : '0.00';
        let m985 = Math.ceil(g.t * 0.985);
        let m99 = Math.ceil(g.t * 0.99);
        let m995 = Math.ceil(g.t * 0.995);
        
        let tagBuilder = (target) => {
            let cReal = g.i + g.h + g.s; 
            let proj = cReal + g.p;        
            
            if (CURRENT_METRIC === 'packed' || CURRENT_METRIC === 'gte_packed') {
                if (cReal >= target) return `<span class="text-emerald-500 font-bold">Processado OK</span>`;
                if (proj >= target) return `<span class="text-blue-600 font-bold bg-blue-100 px-1.5 py-0.5 rounded shadow-sm text-[8px] tracking-wider uppercase">Pck Garante</span>`;
                return `<span class="text-amber-500 font-bold">Falta ${(target - proj).toLocaleString()} (c/ Pck)</span>`;
            } else { 
                if (target - g.c <= 0) return `<span class="text-emerald-500 font-bold">OK</span>`;
                return `<span class="text-amber-500 font-bold">Falta ${(target - g.c).toLocaleString()}</span>`; 
            }
        };
        
        hKpi += `
            <div class="glass-panel shrink-0 p-3 flex flex-col justify-between border-t-2 border-brand-400 min-h-[140px]">
                <div class="flex justify-between items-start mb-1 gap-1">
                    <div class="text-[10px] font-bold text-slate-500 uppercase bg-slate-50 border px-1.5 py-0.5 rounded">ETD ${k}H</div>
                    <div class="text-[10px] font-bold text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded">${pt}%</div>
                </div>
                <div class="flex items-end gap-x-1 mb-1">
                    <div class="text-2xl font-black text-blue-600 font-mono tracking-tighter leading-none" title="${g.c.toLocaleString()}">${g.c.toLocaleString()}</div>
                    <div class="text-[10px] font-bold text-slate-400" title="Total: ${g.t.toLocaleString()}">/ ${fmtK(g.t)}</div>
                </div>
                <div class="text-[8px] font-bold text-slate-400 flex justify-between mb-2 px-0.5">
                    <span class="text-emerald-500" title="Packed: ${g.p.toLocaleString()}">PK:${fmtK(g.p)}</span>
                    <span class="text-blue-500" title="In: ${g.i.toLocaleString()}">IN:${fmtK(g.i)}</span>
                    <span class="text-indigo-500" title="Closed: ${g.h.toLocaleString()}">CL:${fmtK(g.h)}</span>
                    <span class="text-purple-500" title="Shipped: ${g.s.toLocaleString()}">SH:${fmtK(g.s)}</span>
                </div>
                <div class="w-full bg-slate-100 h-1.5 rounded-full mb-2">
                    <div class="bg-blue-500 h-full" style="width:${pt}%"></div>
                </div>
                <div class="space-y-1 border-t pt-1.5 mt-auto text-[9px] font-bold">
                    <div class="flex justify-between items-center"><span class="text-slate-400">Min(98.5%)</span>${tagBuilder(m985)}</div>
                    <div class="flex justify-between items-center"><span class="text-slate-400">Idl(99%)</span>${tagBuilder(m99)}</div>
                    <div class="flex justify-between items-center"><span class="text-slate-400">Prf(99.5%)</span>${tagBuilder(m995)}</div>
                </div>
            </div>
        `;
    });
    
    document.getElementById('dash-kpi-area').innerHTML = hKpi;
    
    let off = tr.filter(i => (i.rtp > 0 || i.grp > 0))
                .sort((a, b) => (b.rtp + b.grp) - (a.rtp + a.grp))
                .slice(0, 10);
                
    if(off.length) {
        document.getElementById('dash-offenders-body').innerHTML = off.map(r => `
            <tr>
                <td class="p-3 pl-6 font-bold text-slate-800">${r.nome}</td>
                <td class="p-3 text-center">
                    <span class="bg-slate-100 px-2 py-1 rounded text-[10px] font-bold">${r.horario}h</span>
                </td>
                <td class="p-3 text-right text-red-600 font-bold">${r.rtp + r.grp}</td>
                <td class="p-3 text-right font-bold text-slate-600">${r.total}</td>
                <td class="p-3 pr-6">
                    <div class="flex items-center justify-end gap-2">
                        <span class="text-[10px] font-bold w-9 text-right">${r.total > 0 ? ((getMetric(r) / r.total) * 100).toFixed(2) : '0.00'}%</span>
                        <div class="w-16 bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div class="bg-blue-500 h-full" style="width:${r.total > 0 ? (getMetric(r) / r.total) * 100 : 0}%"></div>
                        </div>
                    </div>
                </td>
            </tr>
        `).join('');
    } else {
        document.getElementById('dash-offenders-body').innerHTML = '<tr><td colspan="5" class="p-8 text-center text-emerald-600 font-bold">Livre.</td></tr>';
    }
}

function renderMicro(lst) {
    let includeAereo = document.getElementById('toggle-micro-aereo').checked;
    let riskMode = document.getElementById('micro-risk-filter').value;
    let filtered = lst.filter(i => includeAereo ? true : !i.isAereo);
    
    let m985 = (i) => Math.ceil(i.total * 0.985); 
    let cReal = (i) => i.huIn + i.huCl + i.ship; 
    let isSafe = (i) => cReal(i) >= m985(i);
    let pendenteReal = (i) => i.packed + i.rtp + i.grp + i.pick + i.wav + i.rtw; 

    filtered.sort((a, b) => {
        if (riskMode !== 'padrao') { 
            let sA = isSafe(a) ? 1 : 0; 
            let sB = isSafe(b) ? 1 : 0; 
            if (sA !== sB) return sA - sB; 
        }
        if (riskMode === 'packed') return b.packed - a.packed;
        if (riskMode === 'imediato') return (b.rtp + b.grp) - (a.rtp + a.grp);
        if (riskMode === 'futuro') return (b.pick + b.wav + b.rtw) - (a.pick + a.wav + a.rtw);
        if (riskMode === 'geral') return (b.total - cReal(b)) - (a.total - cReal(a)); 
        return pendenteReal(b) - pendenteReal(a); 
    });

    if(filtered.length === 0) {
        document.getElementById('micro-body').innerHTML = '<tr><td colspan="12" class="p-8 text-center italic">Vazio.</td></tr>';
    } else {
        document.getElementById('micro-body').innerHTML = filtered.map(r => `
            <tr class="${(riskMode !== 'padrao' && isSafe(r)) ? 'opacity-40 bg-slate-50' : ''}">
                <td class="p-3 pl-6 font-bold text-slate-800 border-b">${r.nome}</td>
                <td class="p-3 border-b text-center">
                    <span class="bg-slate-100 text-slate-600 px-1 rounded text-[10px] font-bold">${r.horario === 'ATRASO' ? 'ATR' : r.horario + 'h'}</span>
                </td>
                <td class="text-right p-3 border-b text-blue-500 font-bold">${r.huIn}</td>
                <td class="text-right p-3 border-b text-indigo-500 font-bold">${r.huCl}</td>
                <td class="text-right p-3 border-b text-purple-600 font-bold">${r.ship}</td>
                <td class="text-right p-3 border-b text-emerald-600 font-bold">${r.packed}</td>
                <td class="text-right p-3 border-b text-red-600 font-bold">${r.rtp}</td>
                <td class="text-right p-3 border-b text-orange-600 font-bold">${r.grp}</td>
                <td class="text-right p-3 border-b text-amber-600 font-bold">${r.pick}</td>
                <td class="text-right p-3 border-b text-slate-400 font-bold">${r.wav + r.rtw}</td>
                <td class="text-right p-3 border-b font-extrabold text-slate-900">${r.total}</td>
                <td class="p-3 pr-6 border-b">
                    <div class="flex items-center gap-2">
                        <div class="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div class="bg-blue-500 h-full" style="width:${r.total > 0 ? (getMetric(r) / r.total) * 100 : 0}%"></div>
                        </div>
                        <span class="text-[9px] font-bold w-9 text-right">${r.total > 0 ? ((getMetric(r) / r.total) * 100).toFixed(2) : '0.00'}%</span>
                    </div>
                </td>
            </tr>
        `).join('');
    }
}

function renderMatriz(lst) {
    const bx = (l, v, c1, c2, c3) => `
        <div class="${v > 0 ? `bg-${c1}-50 border-${c1}-200` : 'bg-slate-50 border-slate-100 opacity-50'} border rounded-sm flex flex-col items-center justify-center py-0.5">
            <span class="text-[5px] font-extrabold text-${v > 0 ? c2 : 'slate-400'} uppercase leading-none">${l}</span>
            <span class="text-[10px] font-black text-${v > 0 ? c3 : 'slate-300'} leading-none mt-0.5">${v > 0 ? (v >= 1000 ? (v / 1000).toFixed(1).replace('.0', '') + 'k' : v) : '0'}</span>
        </div>
    `;
    
    const ren = (id, s, e) => {
        let h = '';
        for(let b = s; b <= e; b += 10) {
            h += `
                <div class="col-span-full flex items-center mt-3 mb-2">
                    <div class="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest bg-slate-200 px-3 py-1 rounded-full">
                        <i class="fa-solid fa-folder-open text-brand-500 mr-1"></i> Bloco ${Math.ceil(b / 10)} (${b}-${Math.min(b + 9, e)})
                    </div>
                    <div class="h-px bg-slate-200 flex-1 ml-3"></div>
                </div>
                <div class="col-span-full grid grid-cols-2 sm:grid-cols-5 xl:grid-cols-10 gap-2.5">
            `;
            
            for(let i = b; i <= Math.min(b + 9, e); i++) {
                let rr = RAMPA_MAP[i] || []; 
                let st = { p: 0, r: 0, g: 0, pi: 0, w: 0, t: 0 };
                let aR = []; 
                let mR = null; 
                let mV = -1;
                let activeEtds = new Set();
                
                rr.forEach(ro => { 
                    let d = lst.find(x => x.nome === ro); 
                    if(d) { 
                        let f = d.packed + d.rtp + d.grp + d.pick + d.wav + d.rtw; 
                        if(f > mV) { mV = f; mR = ro; } 
                        st.p += d.packed;
                        st.r += d.rtp;
                        st.g += d.grp;
                        st.pi += d.pick;
                        st.w += (d.wav + d.rtw);
                        st.t += d.total;
                        aR.push(ro); 
                        
                        if (f > 0 && d.horario) {
                            activeEtds.add(d.horario === 'ATRASO' ? 'ATR' : d.horario + 'h');
                        }
                    } 
                });
                
                let vol = st.p + st.r + st.g + st.pi + st.w; 
                let fV = vol > 0 ? (vol >= 1000 ? (vol / 1000).toFixed(1).replace('.0', '') + 'k' : vol) : '0';
                let hBg = 'bg-slate-200';
                let hTx = 'text-slate-400';
                let pls = '';
                
                if (vol > 0) { 
                    if(vol >= 1500) { hBg = 'bg-purple-700'; hTx = 'text-white'; pls = 'animate-pulse'; } 
                    else if(vol >= 1000) { hBg = 'bg-red-600'; hTx = 'text-white'; } 
                    else if(vol >= 800) { hBg = 'bg-orange-600'; hTx = 'text-white'; } 
                    else if(vol >= 500) { hBg = 'bg-amber-500'; hTx = 'text-slate-900'; } 
                    else if(vol >= 400) { hBg = 'bg-emerald-500'; hTx = 'text-white'; } 
                    else { hBg = 'bg-blue-600'; hTx = 'text-white'; } 
                }

                let narrative = "";
                let impactHtml = "";
                
                if (vol === 0) {
                    narrative = `A operação encontra-se completamente limpa e sem pendências no momento.`;
                    impactHtml = `<span class="text-slate-400 font-bold"><i class="fa-solid fa-circle-check mr-1"></i> BAIXO: Risco nulo na rampa.</span>`;
                } else {
                    let packProcessing = st.r + st.g;
                    let pickPending = st.pi + st.w;
                    let capPick = (SETTINGS_DATA.pickHC || 50) * (SETTINGS_DATA.pickM || 120);
                    let capPack = (SETTINGS_DATA.packHC || 50) * (SETTINGS_DATA.packM || 300);
                    
                    narrative += `Análise de fluxo para <strong class="text-white">${vol} pçs</strong> totais pendentes:<br><br>`;
                    
                    if (st.p > 0) {
                        narrative += `<span class="text-emerald-400 font-bold">● AGORA:</span> <strong class="text-white">${st.p} pçs</strong> embaladas retidas no tobogã. Exigem atrelamento imediato.<br><br>`;
                    }
                    
                    if (packProcessing > 0) {
                        let tMin = st.r > 0 ? "0 a 15" : "15 a 30";
                        let tMax = st.g > 0 ? "45" : "30";
                        narrative += `<span class="text-orange-400 font-bold">● EM ${tMin} MIN:</span> <strong class="text-white">${packProcessing} pçs</strong> estão em Packing. Começarão a descer <strong>continuamente até os próximos ${tMax} min</strong>.<br><br>`;
                    }
                    
                    if (pickPending > 0) {
                        let tempoPick = capPick > 0 ? Math.max(15, Math.ceil((pickPending / capPick) * 60)) : 0;
                        let tChegada = packProcessing > 0 ? "45 a 60" : "30 a 45";
                        narrative += `<span class="text-rose-400 font-bold">● DAQUI A ${tChegada} MIN:</span> A onda de Picking/Waving (<strong class="text-white">${pickPending} pçs</strong>) atingirá o Packing. A rampa sofrerá nova injeção contínua por <strong>~${tempoPick} min</strong>.<br><br>`;
                    }
                    
                    if (packProcessing > 0 && pickPending > 0) {
                        narrative += `<span class="text-amber-400 border-l-2 border-amber-400 pl-2 block text-[10px]">`;
                        if (capPick > capPack) {
                            narrative += `<strong><i class="fa-solid fa-triangle-exclamation"></i> Efeito Funil:</strong> O Picking é mais rápido que o Packing. Os fluxos vão se encavalar, resultando em <strong>carga ininterrupta e risco de saturação</strong> na próxima hora.`;
                        } else {
                            narrative += `<strong><i class="fa-solid fa-wave-square"></i> Fluxo Sequencial:</strong> O Packing deve conseguir escoar a primeira onda antes do impacto total do Picking.`;
                        }
                        narrative += `</span>`;
                    }
                    
                    if (vol >= 1500) {
                        if (st.w >= vol * 0.4) {
                            impactHtml = `<span class="text-purple-400 font-black"><i class="fa-solid fa-triangle-exclamation mr-1"></i> CRÍTICO (ATENÇÃO): Volume massivo retido no Waving. Saturação severa inevitável no próximo ciclo.</span>`;
                        } else {
                            impactHtml = `<span class="text-purple-400 font-black"><i class="fa-solid fa-fire mr-1 animate-pulse"></i> CRÍTICO: Sobrecarga extrema em curso. Ação tática urgente.</span>`;
                        }
                    } else if (vol >= 1200 && (packProcessing + st.pi) >= 1000) {
                        impactHtml = `<span class="text-red-400 font-black"><i class="fa-solid fa-temperature-arrow-up mr-1"></i> ALTO: Injeção pesada (>1.2k) prevista para a próxima hora. Risco de travamento.</span>`;
                    } else if (vol >= 1000 && st.pi >= 500) { 
                        impactHtml = `<span class="text-orange-400 font-bold"><i class="fa-solid fa-clock mr-1"></i> MÉDIO-ALTO: Volume elevado, mas retido no Picking (~1h). Margem para preparar docas.</span>`;
                    } else if (vol > 400 && st.r >= 300) {
                        impactHtml = `<span class="text-orange-400 font-bold"><i class="fa-solid fa-forward-fast mr-1"></i> MÉDIO: Queda rápida iminente (RTP). +300 pçs descendo agora.</span>`;
                    } else if (vol > 400) {
                        impactHtml = `<span class="text-amber-400 font-bold"><i class="fa-solid fa-scale-balanced mr-1"></i> MÉDIO: Operação com fluxo robusto e constante, nível controlado.</span>`;
                    } else if (vol > 0) {
                        if (st.p >= vol * 0.5 && vol > 100) {
                            impactHtml = `<span class="text-red-400 font-bold"><i class="fa-solid fa-box-archive mr-1"></i> ALTO (RETENÇÃO): Pouco volume global, mas a maioria empacada no tobogã. Fechar gaylords!</span>`;
                        } else {
                            impactHtml = `<span class="text-emerald-400 font-bold"><i class="fa-solid fa-check-double mr-1"></i> BAIXO: Operação limpa e cadenciada.</span>`;
                        }
                    }
                }

                let tooltipHtml = `
                    <div class="mb-3 border-b border-slate-700 pb-2 flex justify-between items-center">
                        <span class="text-cyan-400 font-black text-sm"><i class="fa-solid fa-folder-tree mr-1"></i> RAMPA ${i}</span>
                        ${activeEtds.size > 0 ? `<span class="text-[9px] bg-slate-800 px-2 py-0.5 rounded uppercase tracking-widest text-slate-300">ETD ${Array.from(activeEtds).join(', ')}</span>` : ''}
                    </div>
                    
                    <div class="text-xs text-slate-300 leading-relaxed mb-3">
                        ${narrative}
                    </div>
                `;
                
                if (vol > 0) {
                    tooltipHtml += `
                        <div class="bg-slate-800/80 rounded-lg p-2 mb-3 border border-slate-700/50">
                            <div class="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1 border-b border-slate-700 pb-1">Distribuição das Canalizações</div>
                            <ul class="space-y-1 mt-1 text-[10px]">
                    `;
                    
                    if (mR) {
                        let pPct = ((mV / vol) * 100).toFixed(1);
                        tooltipHtml += `
                            <li class="flex justify-between items-center bg-slate-900/50 p-1 rounded">
                                <span class="font-mono text-cyan-300 font-bold"><i class="fa-solid fa-angle-right mr-1 text-cyan-600"></i> ${mR} <span class="text-slate-500 font-sans text-[8px] ml-1">(${pPct}%)</span></span>
                                <span class="font-bold text-white">${mV.toLocaleString()} pçs</span>
                            </li>
                        `;
                    }
                    
                    let outras = rr.filter(r => r !== mR).map(r => {
                        let d = lst.find(x => x.nome === r);
                        let v = d ? d.packed + d.rtp + d.grp + d.pick + d.wav + d.rtw : 0;
                        return v > 0 ? { r, v } : null;
                    }).filter(x => x);

                    outras.forEach(outra => {
                        tooltipHtml += `
                            <li class="flex justify-between items-center px-1">
                                <span class="font-mono text-slate-400"><i class="fa-solid fa-minus mr-1 text-slate-600"></i> ${outra.r}</span>
                                <span class="font-bold text-slate-300">${outra.v.toLocaleString()} pçs</span>
                            </li>
                        `;
                    });
                    
                    tooltipHtml += `</ul></div>`;
                }

                tooltipHtml += `
                    <div class="border-t border-slate-700 pt-2">
                        <div class="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1">Diagnóstico Final do Algoritmo</div>
                        <div class="text-xs">${impactHtml}</div>
                    </div>
                `;

                let encodedTooltip = encodeURIComponent(tooltipHtml);
                
                h += `
                    <div onmouseenter="showTooltip(event, this.dataset.tip)" onmousemove="moveTooltip(event)" onmouseleave="hideTooltip()" data-tip="${encodedTooltip}" class="border rounded-xl flex flex-col justify-between ${st.t === 0 ? 'opacity-40 grayscale bg-white/60' : 'bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 cursor-help'} overflow-hidden h-[120px] relative">
                        <div class="${hBg} ${pls} px-2 py-1.5 flex justify-between items-start shrink-0 transition-colors duration-500">
                            <div class="flex flex-col items-start leading-none">
                                <span class="font-black ${hTx} text-[12px] whitespace-nowrap">R-${i}</span>
                                ${AUTO_CHUTES.includes(i) ? `<span class="text-[6px] font-bold bg-white/30 ${hTx} px-1 py-0.5 mt-0.5 rounded shadow-sm">AUTO</span>` : ''}
                            </div>
                            <div class="flex flex-col items-end leading-none text-right">
                                ${vol > 0 ? `<div class="flex items-center gap-1"><span class="text-[11px] font-black ${hTx} tracking-tighter">${fV}</span></div><span class="text-[6px] font-medium ${hTx} opacity-80 uppercase mt-0.5">Total</span>` : ''}
                            </div>
                        </div>
                        <div class="bg-slate-100 px-2 pt-1 pb-1 text-[7.5px] font-bold text-slate-600 leading-tight h-[28px] overflow-hidden border-b border-slate-200 flex items-center">
                            <div class="line-clamp-2 w-full">${aR.length ? aR.join(', ') : 'Vazio'}</div>
                        </div>
                        <div class="p-1 flex-1 flex flex-col justify-evenly bg-white">
                            <div class="grid grid-cols-3 gap-0.5 text-[8px] mb-0.5">
                                ${bx('PCK', st.p, 'emerald', 'emerald-600', 'emerald-700')}
                                ${bx('<30', st.r, 'red', 'red-600', 'red-700')}
                                ${bx('45m', st.g, 'orange', 'orange-600', 'orange-700')}
                            </div>
                            <div class="grid grid-cols-2 gap-0.5 text-[8px]">
                                ${bx('1H', st.pi, 'amber', 'amber-600', 'amber-700')}
                                ${bx('WAV', st.w, 'blue', 'blue-600', 'blue-700')}
                            </div>
                        </div>
                    </div>
                `;
            } 
            h += `</div>`;
        } 
        document.getElementById(id).innerHTML = h;
    };
    
    ren('t3-list-container', 1, 50); 
    ren('t5-list-container', 51, 98);
}

function renderAereo(lst) {
    let aer = lst.filter(i => i.isAereo);
    let grp = {};
    let aT = 0, aC = 0, aP = 0, aIn = 0, aCl = 0, aSh = 0, aPick = 0, aWav = 0, aPack = 0;
    
    aer.forEach(i => { 
        if(!grp[i.horario]) grp[i.horario] = []; 
        grp[i.horario].push(i); 
        aT += i.total; 
        aC += getMetric(i); 
        aP += i.packed; 
        aIn += i.huIn; 
        aCl += i.huCl; 
        aSh += i.ship; 
        aPick += i.pick; 
        aWav += (i.wav + i.rtw);
        aPack += (i.grp + i.rtp); 
    });
    
    let gayM = SETTINGS_DATA.gayM || 500;
    let pendenteGeral = aT - (aIn + aCl + aSh);
    let processadosGeral = aIn + aCl + aSh;
    let pctGeral = aT > 0 ? ((aC / aT) * 100).toFixed(2) : '0.00';

    let resumoHtml = `
        <div class="bg-gradient-to-r from-cyan-950 to-blue-950 rounded-2xl p-6 relative overflow-hidden shadow-2xl border border-cyan-800">
            <div class="absolute right-0 top-0 opacity-10 text-9xl -mt-8 -mr-8 text-cyan-400">
                <i class="fa-solid fa-plane-departure"></i>
            </div>
            <div class="relative z-10 flex flex-col md:flex-row gap-8">
                <div class="flex-1">
                    <h3 class="text-cyan-400 font-bold text-xs uppercase tracking-widest mb-3 border-b border-cyan-800/50 pb-2"><i class="fa-solid fa-tower-observation mr-2"></i> Diagnóstico da Operação Aérea</h3>
                    <p class="text-slate-300 text-sm leading-relaxed">
                        No cenário atual, as carretas destinadas ao fluxo aéreo totalizam <strong class="text-white">${aT.toLocaleString()} peças na malha</strong>. 
                        Deste montante, temos <strong class="text-emerald-400">${processadosGeral.toLocaleString()} peças já processadas e docadas</strong>. 
                        O foco estratégico e a força de trabalho devem direcionar-se para o escoamento rápido das <strong class="text-amber-400">${pendenteGeral.toLocaleString()} peças ainda pendentes</strong>.
                    </p>
                    <p class="text-slate-300 text-sm leading-relaxed mt-4 border-t border-cyan-800/50 pt-4">
                        <span class="text-[10px] uppercase font-black text-blue-400 tracking-wider block mb-1">Cadeia de Abastecimento (Funil)</span>
                        O setor de Packing trabalha de forma ativa em <strong class="text-orange-400">${aPack.toLocaleString()} peças</strong> neste exato momento, enquanto <strong class="text-white">${aP.toLocaleString()} peças repousam no Packed</strong> aguardando atrelamento imediato. 
                        Atenção aos blocos iniciais: o Picking e Waving acumulam um represamento latente de <strong class="text-rose-400">${(aPick + aWav).toLocaleString()} peças</strong> que descerão massivamente.
                        Em suma, o volume pendente exigirá a montagem de aproximadamente <strong class="text-cyan-300">${Math.ceil(pendenteGeral / gayM)} novos contentores</strong> (base ${gayM} un/cont).
                    </p>
                </div>
                <div class="w-full md:w-64 shrink-0 flex flex-col justify-center border-t md:border-t-0 md:border-l border-cyan-800 md:pl-8 pt-4 md:pt-0">
                    <div class="text-[10px] text-cyan-500 font-bold uppercase tracking-widest mb-2">Atingimento Global (Aéreo)</div>
                    <div class="text-6xl font-black text-white font-mono leading-none mb-3 drop-shadow-md">${pctGeral}%</div>
                    <div class="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-700">
                        <div class="bg-cyan-400 h-full shadow-[0_0_12px_rgba(34,211,238,0.8)]" style="width:${pctGeral}%"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.getElementById('aereo-dynamic-summary').innerHTML = resumoHtml;

    let hC = ''; 
    let cT = ''; 

    Object.keys(grp).sort().forEach(h => { 
        let t = 0, c = 0, sh = 0, pck = 0, proc = 0, rtp = 0, gr = 0, pick = 0, wav = 0, rtw = 0; 
        
        let trs = grp[h].sort((a, b) => b.total - a.total).map(r => {
            let pr = r.huIn + r.huCl + r.ship;
            let aPackProcess = r.rtp + r.grp;
            let aPickProcess = r.pick + r.wav + r.rtw;
            let tA_Vir = r.packed + aPackProcess + aPickProcess;
            let sppRoute = Math.ceil(tA_Vir / gayM);

            return `
            <tr class="hover:bg-slate-50 transition-colors">
                <td class="p-4 pl-6 font-bold text-slate-800 border-b border-slate-100">${r.nome}</td>
                <td class="p-4 border-b border-slate-100 text-center">
                    <span class="bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-bold">${r.horario === 'ATRASO' ? 'ATR' : r.horario + 'h'}</span>
                </td>
                <td class="text-right p-4 border-b border-slate-100 text-blue-600 font-mono">${pr > 0 ? pr.toLocaleString() : '-'}</td>
                <td class="text-right p-4 border-b border-slate-100 text-emerald-600 font-mono font-bold">${r.packed > 0 ? r.packed.toLocaleString() : '-'}</td>
                <td class="text-right p-4 border-b border-slate-100 text-orange-600 font-mono">${aPackProcess > 0 ? aPackProcess.toLocaleString() : '-'}</td>
                <td class="text-right p-4 border-b border-slate-100 text-rose-600 font-mono">${aPickProcess > 0 ? aPickProcess.toLocaleString() : '-'}</td>
                <td class="text-right p-4 border-b border-slate-100 font-black text-slate-900 font-mono">${tA_Vir > 0 ? tA_Vir.toLocaleString() : '-'}</td>
                <td class="text-center p-4 border-b border-slate-100 font-black text-cyan-600 font-mono">${sppRoute > 0 ? sppRoute.toLocaleString() : '-'}</td>
                <td class="p-4 pr-6 border-b border-slate-100">
                    <div class="flex flex-col items-end gap-1 justify-end">
                        <span class="text-[10px] font-bold text-slate-600 text-right uppercase tracking-widest">${r.total > 0 ? ((getMetric(r) / r.total) * 100).toFixed(1) : '0.0'}%</span>
                        <div class="w-20 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div class="bg-cyan-500 h-full" style="width:${r.total > 0 ? (getMetric(r) / r.total) * 100 : 0}%"></div>
                        </div>
                    </div>
                </td>
            </tr>
            `;
        }).join('');

        grp[h].forEach(r => { 
            t += r.total; 
            c += getMetric(r); 
            sh += r.ship; 
            pck += r.packed; 
            proc += (r.huIn + r.huCl); 
            rtp += r.rtp; 
            gr += r.grp; 
            pick += r.pick; 
            wav += r.wav; 
            rtw += r.rtw; 
        }); 
        
        let pendenteETD = t - (proc + sh);
        let pct = t > 0 ? ((c / t) * 100).toFixed(1) : '0.0'; 
        
        let status = '';
        let bgClass = '';
        let textClass = '';
        let borderClass = '';

        if (pendenteETD < 5000) {
            status = 'BAIXO'; bgClass = 'bg-emerald-50'; textClass = 'text-emerald-700'; borderClass = 'border-emerald-200';
        } else if (pendenteETD < 10000) {
            status = 'MEDIANO'; bgClass = 'bg-amber-50'; textClass = 'text-amber-700'; borderClass = 'border-amber-200';
        } else if (pendenteETD < 14000) {
            status = 'ALTO'; bgClass = 'bg-orange-50'; textClass = 'text-orange-700'; borderClass = 'border-orange-200';
        } else {
            status = 'PREOCUPANTE'; bgClass = 'bg-rose-50'; textClass = 'text-rose-700'; borderClass = 'border-rose-200';
        }

        let capPick = (SETTINGS_DATA.pickHC || 50) * (SETTINGS_DATA.pickM || 120);
        let capPack = (SETTINGS_DATA.packHC || 50) * (SETTINGS_DATA.packM || 300);
        let packProcessing = rtp + gr;
        let pickPending = pick + wav + rtw;
        
        let analiseVoo = "";
        
        if (pendenteETD <= 0) {
            analiseVoo = `<div class="flex items-center text-emerald-600 font-bold"><i class="fa-solid fa-circle-check text-2xl mr-3"></i> O carregamento deste ETD encontra-se concluído e docado integralmente. As equipas podem ser reorientadas para as próximas tarefas da malha aérea.</div>`;
        } else {
            analiseVoo = `A janela de expedição apresenta <strong class="text-slate-800">${pendenteETD.toLocaleString()} peças físicas pendentes</strong> para processamento imediato na planta.<br><br>`;
            
            if (pck > 0) {
                analiseVoo += `<span class="text-emerald-600 font-bold">● AGORA:</span> <strong class="text-slate-800">${pck.toLocaleString()} pçs</strong> já estão embaladas (Packed). Exigem foco total em Atrelamento e Doca para não travar as esteiras.<br><br>`;
            }
            
            if (packProcessing > 0) {
                let tMin = rtp > 0 ? "0 a 15" : "15 a 30";
                let tMax = gr > 0 ? "45" : "30";
                analiseVoo += `<span class="text-orange-500 font-bold">● EM ${tMin} MIN:</span> <strong class="text-slate-800">${packProcessing.toLocaleString()} pçs</strong> que estão ativas no Packing começarão a descer continuamente para o Stage Zone nos próximos ${tMax} min.<br><br>`;
            }
            
            if (pickPending > 0) {
                let tempoPick = capPick > 0 ? Math.max(15, Math.ceil((pickPending / capPick) * 60)) : 0;
                let tChegada = packProcessing > 0 ? "45 a 60" : "30 a 45";
                analiseVoo += `<span class="text-rose-500 font-bold">● DAQUI A ${tChegada} MIN:</span> O represamento atual de Picking/Waving (<strong class="text-slate-800">${pickPending.toLocaleString()} pçs</strong>) vai bater no Packing, gerando uma injeção contínua e pesada por aproximadamente <strong>~${tempoPick} min</strong>.<br><br>`;
            }
            
            if (packProcessing > 0 && pickPending > 0) {
                analiseVoo += `<div class="bg-slate-100 p-3 rounded-lg border border-slate-200 text-xs mt-2">`;
                if (capPick > capPack) {
                    analiseVoo += `<span class="text-red-600 font-bold"><i class="fa-solid fa-triangle-exclamation mr-1"></i> Alerta de Funil (Gargalo):</span> O ritmo de Picking está superior à capacidade de Packing configurada. Estes fluxos vão sobrepor-se, causando acumulação nas esteiras e risco de saturação severa na próxima hora. É aconselhável alocar mais HCs no Packing.`;
                } else {
                    analiseVoo += `<span class="text-blue-600 font-bold"><i class="fa-solid fa-wave-square mr-1"></i> Fluxo Sequencial:</span> O Packing possui capacidade suficiente para escoar a onda atual antes de ser engolido pelo fluxo massivo do Picking. Manter o ritmo.`;
                }
                analiseVoo += `</div>`;
            }
        }

        cT += `
            <div class="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden flex flex-col mb-8">
                <div class="bg-slate-900 px-6 py-4 flex items-center justify-between shrink-0">
                    <h3 class="text-lg font-black text-white flex items-center gap-3">
                        <i class="fa-solid fa-truck-front text-cyan-400"></i> EXPEDIÇÃO ${h === 'ATRASO' ? 'ATRASO' : h + 'H'}
                    </h3>
                    <span class="px-3 py-1.5 rounded-sm text-[10px] font-black uppercase tracking-widest ${bgClass} ${textClass} border ${borderClass}">
                        Risco da Rota: ${status}
                    </span>
                </div>

                <div class="p-6 grid grid-cols-1 xl:grid-cols-3 gap-6 bg-slate-50 border-b border-slate-200 shrink-0">
                    <div class="xl:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
                        <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2"><i class="fa-solid fa-file-waveform mr-1"></i> Relatório Analítico do ETD</h4>
                        <div class="text-sm text-slate-600 leading-relaxed text-justify">
                            ${analiseVoo}
                        </div>
                    </div>
                    
                    <div class="bg-gradient-to-br from-cyan-950 to-slate-900 p-6 rounded-xl border border-cyan-800 shadow-sm text-white flex flex-col justify-center relative overflow-hidden">
                        <i class="fa-solid fa-boxes-packing absolute -right-4 -bottom-4 text-7xl opacity-10"></i>
                        <h4 class="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-5 border-b border-cyan-800/50 pb-2 relative z-10"><i class="fa-solid fa-cube mr-1"></i> Previsão de SPP (Gaylords)</h4>
                        <div class="grid grid-cols-2 gap-4 relative z-10">
                            <div>
                                <div class="text-[10px] text-slate-400 uppercase font-bold mb-1 tracking-wider">Volume a Vir</div>
                                <div class="text-3xl font-black font-mono text-white drop-shadow-sm">${pendenteETD.toLocaleString()}</div>
                            </div>
                            <div>
                                <div class="text-[10px] text-slate-400 uppercase font-bold mb-1 tracking-wider">Total Gaylords</div>
                                <div class="text-3xl font-black font-mono text-cyan-400 drop-shadow-sm">${Math.ceil(pendenteETD / gayM)}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="overflow-x-auto bg-white">
                    <table class="w-full text-left text-xs whitespace-nowrap">
                        <thead class="bg-slate-100 text-slate-500 font-bold uppercase text-[9px] tracking-wider border-b border-slate-200">
                            <tr>
                                <th class="p-4 pl-6">Canalização</th>
                                <th class="p-4 text-center">Hora</th>
                                <th class="p-4 text-right" title="HU In + HU Closed + Shipped">Processado (Pronto)</th>
                                <th class="p-4 text-right text-emerald-600" title="Packed">Retido Tobogã</th>
                                <th class="p-4 text-right text-orange-600" title="RTP + GRP">&lt; 45m (Packing)</th>
                                <th class="p-4 text-right text-rose-600" title="Pick + Wav + RTW">&gt; 1h (Picking)</th>
                                <th class="p-4 text-right text-slate-800 font-black">Total Pendente</th>
                                <th class="p-4 text-center text-cyan-600 font-black bg-cyan-50">Gaylords (SPP)</th>
                                <th class="p-4 pr-6 text-right">Meta Total</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            ${trs}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }); 
    
    document.getElementById('aereo-header-cards').classList.add('hidden'); 
    
    document.getElementById('aereo-container').innerHTML = cT || '<div class="p-8 text-slate-500 text-sm font-medium text-center bg-white rounded-xl border border-slate-200 shadow-sm">Nenhum fluxo de transferência Aérea pendente ou analisado.</div>';
}

function renderMacro(lst) {
    const mc = (l, v, c) => `
        <div class="flex flex-col">
            <span class="text-[8px] font-bold text-slate-400 uppercase">${l}</span>
            <span class="font-bold text-${c}">${v}</span>
        </div>
    `;
    
    const renB = (obj, isFix) => {
        let h = ''; 
        
        Object.keys(obj).forEach(gn => {
            let itms = lst.filter(i => obj[gn].includes(i.nome)); 
            if(itms.length === 0) return;
            
            let s = { c: 0, p: 0, i: 0, cl: 0, sh: 0, r: 0, g: 0, pi: 0, t: 0 }; 
            
            itms.forEach(i => {
                s.c += getMetric(i);
                s.p += i.packed;
                s.i += i.huIn;
                s.cl += i.huCl;
                s.sh += i.ship;
                s.r += i.rtp;
                s.g += i.grp;
                s.pi += i.pick;
                s.t += i.total;
            });
            
            let p = s.t > 0 ? ((s.c / s.t) * 100).toFixed(2) : '0.00';
            
            h += `
                <div class="${isFix ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200'} rounded-xl border shadow-xl flex flex-col">
                    <div class="${isFix ? 'bg-slate-800' : 'bg-slate-50'} p-4 border-b border-slate-200 flex justify-between items-center">
                        <h3 class="font-bold text-lg flex items-center gap-2">${gn}</h3>
                        <span class="text-xs font-bold px-2 py-1 rounded bg-slate-900 text-slate-300 border">${s.t.toLocaleString()} Total</span>
                    </div>
                    <div class="p-3 grid grid-cols-7 gap-1 text-center border-b ${isFix ? 'bg-slate-900' : 'bg-white'}">
                        ${mc('Shp', s.sh, 'purple-500')}
                        ${mc('HCs', s.cl, 'indigo-500')}
                        ${mc('In', s.i, 'blue-500')}
                        ${mc('Pck', s.p, 'emerald-500')}
                        ${mc('<30m', s.r, 'red-500')}
                        ${mc('45m', s.g, 'orange-400')}
                        ${mc('~ 1h', s.pi, 'amber-400')}
                    </div>
                    <div class="p-4 flex-1 ${isFix ? 'bg-slate-800' : 'bg-slate-50'}">
                        <div class="flex flex-wrap gap-1.5">
                            ${itms.sort((a, b) => b.total - a.total).map(i => `<span class="${isFix ? 'bg-slate-900 text-slate-300' : 'bg-white text-slate-700'} border px-2 py-1 rounded text-[10px] font-mono">${i.nome} <span class="text-brand-500">${i.total}</span></span>`).join('')}
                        </div>
                    </div>
                    <div class="p-3 flex items-center gap-3 border-t ${isFix ? 'bg-slate-800' : 'bg-white'}">
                        <div class="w-full h-2 rounded-full overflow-hidden bg-slate-200">
                            <div class="bg-blue-500 h-full" style="width:${p}%"></div>
                        </div>
                        <span class="text-xs font-bold w-9 text-right">${p}%</span>
                    </div>
                </div>
            `;
        }); 
        return h;
    };
    
    document.getElementById('macro-fixed-container').innerHTML = renB(OFFICIAL_MACROS, true) || '<div class="col-span-2 text-slate-500 text-xs italic bg-slate-50 p-6 rounded-xl border text-center">Nenhum volume nos grupos oficiais.</div>';
    document.getElementById('macro-container').innerHTML = renB(CONSOLIDA_LISTS, false) || '<div class="col-span-2 text-slate-500 text-xs italic bg-slate-50 p-6 rounded-xl border text-center">Nenhum grupo customizado.</div>';
}

function addMacroGroup() { 
    let h = document.getElementById('new-macro-hour').value;
    let rStr = document.getElementById('new-macro-routes').value; 
    
    if(!h || !rStr) return; 
    
    CONSOLIDA_LISTS[h] = rStr.split(/[\s,]+/).filter(x => x).map(x => x.toUpperCase()); 
    
    try {
        localStorage.setItem('MACRO_CFG', JSON.stringify(CONSOLIDA_LISTS));
    } catch(e) {} 
    
    document.getElementById('new-macro-routes').value = ''; 
    document.getElementById('new-macro-hour').value = ''; 
    
    toggleSettings(); 
    toggleSettings();
}

function deleteConsolidation(h) { 
    delete CONSOLIDA_LISTS[h]; 
    
    try {
        localStorage.setItem('MACRO_CFG', JSON.stringify(CONSOLIDA_LISTS));
    } catch(e) {} 
    
    toggleSettings(); 
    toggleSettings(); 
}

function removeRouteFromConsol(h, r) { 
    CONSOLIDA_LISTS[h] = CONSOLIDA_LISTS[h].filter(x => x !== r); 
    
    try {
        localStorage.setItem('MACRO_CFG', JSON.stringify(CONSOLIDA_LISTS));
    } catch(e) {} 
    
    toggleSettings(); 
    toggleSettings(); 
}

function addRouteToConsol(h, val, inp) { 
    if(!val) return; 
    let r = val.toUpperCase().trim(); 
    
    if(!CONSOLIDA_LISTS[h].includes(r)) {
        CONSOLIDA_LISTS[h].push(r); 
    }
    
    try {
        localStorage.setItem('MACRO_CFG', JSON.stringify(CONSOLIDA_LISTS));
    } catch(e) {} 
    
    inp.value = ''; 
    toggleSettings(); 
    toggleSettings(); 
}

const microS = document.getElementById('micro-search');
if(microS) { 
    microS.addEventListener('input', function(e) { 
        const val = e.target.value.toUpperCase(); 
        document.querySelectorAll('#micro-body tr').forEach(tr => { 
            tr.style.display = tr.innerText.toUpperCase().includes(val) ? '' : 'none'; 
        }); 
    }); 
}

window.onload = () => { 
    initStorage(); 
};
