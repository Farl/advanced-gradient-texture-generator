// ─── State ────────────────────────────────────────────────────────────────────
const state = {
    type: 'linear',
    stops: [
        { color: '#6366f1', alpha: 1, position: 0 },
        { color: '#a78bfa', alpha: 1, position: 0.5 },
        { color: '#ec4899', alpha: 1, position: 1 },
    ],
    angle: 135,
    scale: 100,
    repeat: false,
    noise: false,
    noiseIntensity: 20,
    centerX: 0.5,
    centerY: 0.5,
    width: 800,
    height: 800,
    exportQuality: 0.9,
};

// ─── Data ─────────────────────────────────────────────────────────────────────
const PRESETS = [
    { name: 'Violet Dream', type: 'linear', angle: 135, stops: [{ color: '#6366f1', alpha: 1, position: 0 }, { color: '#a78bfa', alpha: 1, position: 0.5 }, { color: '#ec4899', alpha: 1, position: 1 }] },
    { name: 'Sunset',       type: 'linear', angle: 135, stops: [{ color: '#ff6b6b', alpha: 1, position: 0 }, { color: '#feca57', alpha: 1, position: 0.5 }, { color: '#ff9ff3', alpha: 1, position: 1 }] },
    { name: 'Ocean',        type: 'linear', angle: 180, stops: [{ color: '#0652DD', alpha: 1, position: 0 }, { color: '#1289A7', alpha: 1, position: 0.5 }, { color: '#C4E538', alpha: 1, position: 1 }] },
    { name: 'Aurora',       type: 'radial', angle: 0,   stops: [{ color: '#00b894', alpha: 1, position: 0 }, { color: '#6c5ce7', alpha: 1, position: 0.5 }, { color: '#fd79a8', alpha: 1, position: 1 }] },
    { name: 'Fire',         type: 'linear', angle: 90,  stops: [{ color: '#fdcb6e', alpha: 1, position: 0 }, { color: '#e17055', alpha: 1, position: 0.4 }, { color: '#d63031', alpha: 1, position: 1 }] },
    { name: 'Midnight',     type: 'linear', angle: 225, stops: [{ color: '#2d3436', alpha: 1, position: 0 }, { color: '#6c5ce7', alpha: 1, position: 1 }] },
    { name: 'Rose Gold',    type: 'conic',  angle: 0,   stops: [{ color: '#f8b500', alpha: 1, position: 0 }, { color: '#e83e8c', alpha: 1, position: 0.5 }, { color: '#f8b500', alpha: 1, position: 1 }] },
    { name: 'Ice',          type: 'radial', angle: 0,   stops: [{ color: '#ffffff', alpha: 1, position: 0 }, { color: '#a8edea', alpha: 1, position: 0.6 }, { color: '#fed6e3', alpha: 1, position: 1 }] },
    { name: 'Forest',       type: 'linear', angle: 160, stops: [{ color: '#134e5e', alpha: 1, position: 0 }, { color: '#71b280', alpha: 1, position: 1 }] },
    { name: 'Cosmic',       type: 'conic',  angle: 0,   stops: [{ color: '#0f0c29', alpha: 1, position: 0 }, { color: '#302b63', alpha: 1, position: 0.5 }, { color: '#24243e', alpha: 1, position: 1 }] },
    { name: 'Peach',        type: 'linear', angle: 120, stops: [{ color: '#f7971e', alpha: 1, position: 0 }, { color: '#ffd200', alpha: 1, position: 1 }] },
    { name: 'Mono',         type: 'linear', angle: 180, stops: [{ color: '#000000', alpha: 1, position: 0 }, { color: '#ffffff', alpha: 1, position: 1 }] },
];

const GRADIENT_TYPES = [
    { id: 'linear',    label: 'Linear'  },
    { id: 'radial',    label: 'Radial'  },
    { id: 'conic',     label: 'Conic'   },
    { id: 'diamond',   label: 'Diamond' },
    { id: 'reflected', label: 'Reflect' },
    { id: 'spiral',    label: 'Spiral'  },
];

// ─── Canvas refs ──────────────────────────────────────────────────────────────
const checkerboardCanvas = document.getElementById('checkerboardCanvas');
const gradientCanvas     = document.getElementById('gradientCanvas');
const noiseCanvas        = document.getElementById('noiseCanvas');
const ctxC = checkerboardCanvas.getContext('2d');
const ctxG = gradientCanvas.getContext('2d');
const ctxN = noiseCanvas.getContext('2d');
const centerDot     = document.getElementById('centerDot');
const canvasWrapper = document.getElementById('canvasWrapper');

// ─── Utilities ────────────────────────────────────────────────────────────────
function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
}

function rgbFromHex(hex) {
    return [
        parseInt(hex.slice(1, 3), 16),
        parseInt(hex.slice(3, 5), 16),
        parseInt(hex.slice(5, 7), 16),
    ];
}

function showFeedback(msg) {
    const el = document.getElementById('copyFeedback');
    el.textContent = msg;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 1800);
}

function sortedStops() {
    return [...state.stops].sort((a, b) => a.position - b.position);
}

// ─── Checkerboard ─────────────────────────────────────────────────────────────
function drawCheckerboard() {
    const { width: w, height: h } = checkerboardCanvas;
    const tile = 12;
    ctxC.fillStyle = '#fff';
    ctxC.fillRect(0, 0, w, h);
    ctxC.fillStyle = '#ddd';
    for (let x = 0; x < w; x += tile) {
        for (let y = 0; y < h; y += tile) {
            if ((Math.floor(x / tile) + Math.floor(y / tile)) % 2 === 0) {
                ctxC.fillRect(x, y, tile, tile);
            }
        }
    }
}

// ─── Gradient builders ────────────────────────────────────────────────────────
function buildCanvasGradient(ctx, w, h, cx, cy) {
    const rad   = state.angle * Math.PI / 180;
    const sc    = state.scale / 100;
    const stops = sortedStops();
    let grad;

    switch (state.type) {
        case 'linear': {
            const hw = w / 2 * sc, hh = h / 2 * sc;
            grad = ctx.createLinearGradient(
                cx - Math.cos(rad) * hw, cy - Math.sin(rad) * hh,
                cx + Math.cos(rad) * hw, cy + Math.sin(rad) * hh
            );
            break;
        }
        case 'radial': {
            const r = Math.sqrt(w * w + h * h) / 2 * sc;
            grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
            break;
        }
        case 'conic':
            grad = ctx.createConicGradient(rad, cx, cy);
            break;
        default:
            grad = ctx.createLinearGradient(0, 0, w, 0);
    }

    stops.forEach(s => {
        grad.addColorStop(Math.min(1, Math.max(0, s.position)), hexToRgba(s.color, s.alpha));
    });
    return grad;
}

function buildPixelInterpolator() {
    const parsed = sortedStops().map(s => {
        const [r, g, b] = rgbFromHex(s.color);
        return { r, g, b, a: s.alpha, pos: s.position };
    });
    return function interp(t) {
        t = Math.max(0, Math.min(1, t));
        let i = 0;
        while (i < parsed.length - 1 && parsed[i + 1].pos <= t) i++;
        if (i >= parsed.length - 1) return parsed[parsed.length - 1];
        const a = parsed[i], b = parsed[i + 1];
        const f = (t - a.pos) / (b.pos - a.pos || 1);
        return { r: a.r + (b.r - a.r) * f, g: a.g + (b.g - a.g) * f, b: a.b + (b.b - a.b) * f, a: a.a + (b.a - a.a) * f };
    };
}

function drawDiamond(w, h) {
    const cx = w * state.centerX, cy = h * state.centerY;
    const maxR = Math.sqrt(Math.max(cx, w - cx) ** 2 + Math.max(cy, h - cy) ** 2) * (state.scale / 100);
    const imgData = ctxG.createImageData(w, h);
    const data    = imgData.data;
    const interp  = buildPixelInterpolator();

    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const dx = Math.abs(x - cx), dy = Math.abs(y - cy);
            const t  = state.repeat ? ((dx + dy) / maxR % 1 + 1) % 1 : Math.min((dx + dy) / maxR, 1);
            const c  = interp(t);
            const i  = (y * w + x) * 4;
            data[i] = c.r; data[i + 1] = c.g; data[i + 2] = c.b; data[i + 3] = c.a * 255;
        }
    }
    ctxG.putImageData(imgData, 0, 0);
}

function drawSpiral(w, h) {
    const cx = w * state.centerX, cy = h * state.centerY;
    const maxR      = Math.sqrt(Math.max(cx, w - cx) ** 2 + Math.max(cy, h - cy) ** 2);
    const baseAngle = state.angle * Math.PI / 180;
    const twists    = 3;
    const imgData   = ctxG.createImageData(w, h);
    const data      = imgData.data;
    const interp    = buildPixelInterpolator();

    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const dx    = x - cx, dy = y - cy;
            const r     = Math.sqrt(dx * dx + dy * dy);
            const theta = (Math.atan2(dy, dx) - baseAngle + Math.PI * 4) % (Math.PI * 2);
            const t     = ((r / maxR + theta / (Math.PI * 2) * twists) % 1 + 1) % 1;
            const c     = interp(t);
            const i     = (y * w + x) * 4;
            data[i] = c.r; data[i + 1] = c.g; data[i + 2] = c.b; data[i + 3] = c.a * 255;
        }
    }
    ctxG.putImageData(imgData, 0, 0);
}

function drawReflected(w, h, cx, cy) {
    const rad = state.angle * Math.PI / 180;
    const sc  = state.scale / 100;
    const hw  = w / 2 * sc, hh = h / 2 * sc;
    const g1  = ctxG.createLinearGradient(cx - Math.cos(rad) * hw, cy - Math.sin(rad) * hh, cx, cy);
    const g2  = ctxG.createLinearGradient(cx, cy, cx + Math.cos(rad) * hw, cy + Math.sin(rad) * hh);
    sortedStops().forEach(s => {
        const pos  = Math.min(1, Math.max(0, s.position));
        const rgba = hexToRgba(s.color, s.alpha);
        g1.addColorStop(pos, rgba);
        g2.addColorStop(pos, rgba);
    });
    ctxG.fillStyle = g1; ctxG.fillRect(0, 0, w, h);
    ctxG.fillStyle = g2; ctxG.fillRect(0, 0, w, h);
}

// ─── Noise ────────────────────────────────────────────────────────────────────
function drawNoise(w, h) {
    noiseCanvas.style.display = 'block';
    const imgData = ctxN.createImageData(w, h);
    const data    = imgData.data;
    const alpha   = state.noiseIntensity / 100;
    for (let i = 0; i < data.length; i += 4) {
        const v    = Math.random() < 0.5 ? 0 : 255;
        data[i] = v; data[i + 1] = v; data[i + 2] = v;
        data[i + 3] = Math.random() * alpha * 255;
    }
    ctxN.putImageData(imgData, 0, 0);
}

// ─── Main render ──────────────────────────────────────────────────────────────
function drawGradient() {
    const w = state.width, h = state.height;
    checkerboardCanvas.width = w; checkerboardCanvas.height = h;
    gradientCanvas.width     = w; gradientCanvas.height     = h;
    noiseCanvas.width        = w; noiseCanvas.height        = h;

    // Scale canvas display to fit container
    const maxW  = canvasWrapper.parentElement.clientWidth - 48;
    const maxH  = window.innerHeight - 160;
    const scale = Math.min(1, maxW / w, maxH / h);
    checkerboardCanvas.style.width  = (w * scale) + 'px';
    checkerboardCanvas.style.height = (h * scale) + 'px';

    drawCheckerboard();
    ctxG.clearRect(0, 0, w, h);
    const cx = w * state.centerX, cy = h * state.centerY;

    switch (state.type) {
        case 'diamond':   drawDiamond(w, h); break;
        case 'spiral':    drawSpiral(w, h); break;
        case 'reflected': drawReflected(w, h, cx, cy); break;
        default:
            ctxG.fillStyle = buildCanvasGradient(ctxG, w, h, cx, cy);
            ctxG.fillRect(0, 0, w, h);
    }

    if (state.noise) {
        drawNoise(w, h);
    } else {
        noiseCanvas.style.display = 'none';
    }

    // Center dot for types that support a center point
    const showCenter = ['radial', 'conic', 'diamond', 'spiral'];
    centerDot.style.display = showCenter.includes(state.type) ? 'block' : 'none';
    centerDot.style.left    = (state.centerX * 100) + '%';
    centerDot.style.top     = (state.centerY * 100) + '%';

    document.getElementById('sizeLabel').textContent = `${w} \u00D7 ${h}`;
    updateCSSOutput();
}

// ─── CSS output ───────────────────────────────────────────────────────────────
function updateCSSOutput() {
    const stopsStr = sortedStops()
        .map(s => `${hexToRgba(s.color, s.alpha)} ${(s.position * 100).toFixed(0)}%`)
        .join(', ');
    const cx = (state.centerX * 100).toFixed(0);
    const cy = (state.centerY * 100).toFixed(0);

    let css;
    switch (state.type) {
        case 'linear':
            css = `background: linear-gradient(${state.angle}deg, ${stopsStr});`; break;
        case 'radial':
            css = `background: radial-gradient(circle at ${cx}% ${cy}%, ${stopsStr});`; break;
        case 'conic':
            css = `background: conic-gradient(from ${state.angle}deg at ${cx}% ${cy}%, ${stopsStr});`; break;
        default:
            css = `/* ${state.type} – use canvas export */\nbackground: linear-gradient(${state.angle}deg, ${stopsStr});`;
    }
    document.getElementById('cssOutput').textContent = css;
}

// ─── History ──────────────────────────────────────────────────────────────────
const history = [];

function saveHistory() {
    const mini = document.createElement('canvas');
    mini.width = 40; mini.height = 40;
    mini.getContext('2d').drawImage(gradientCanvas, 0, 0, 40, 40);
    history.unshift({ dataUrl: mini.toDataURL(), state: JSON.parse(JSON.stringify(state)) });
    if (history.length > 12) history.pop();
    renderHistory();
}

function renderHistory() {
    const strip = document.getElementById('historyStrip');
    strip.innerHTML = '';
    history.forEach(h => {
        const img = document.createElement('img');
        img.className = 'history-item';
        img.src = h.dataUrl;
        img.addEventListener('click', () => {
            Object.assign(state, JSON.parse(JSON.stringify(h.state)));
            syncAllInputs();
            scheduleRender();
        });
        strip.appendChild(img);
    });
}

// ─── Color stops UI ───────────────────────────────────────────────────────────
function renderColorStops() {
    const container = document.getElementById('colorStopsContainer');
    container.innerHTML = '';

    state.stops.forEach((stop, i) => {
        const row = document.createElement('div');
        row.className = 'color-stop-row';
        row.innerHTML = `
            <div class="color-swatch-wrap">
                <input type="color" value="${stop.color}" data-idx="${i}" class="stop-color">
            </div>
            <div class="stop-controls">
                <label>Position <span>${(stop.position * 100).toFixed(0)}%</span></label>
                <input type="range" class="stop-slider stop-pos" min="0" max="1" step="0.01" value="${stop.position}" data-idx="${i}">
                <label>Opacity <span>${(stop.alpha * 100).toFixed(0)}%</span></label>
                <input type="range" class="stop-slider stop-alpha" min="0" max="1" step="0.01" value="${stop.alpha}" data-idx="${i}">
            </div>
            <button class="remove-stop-btn" data-idx="${i}" ${state.stops.length <= 2 ? 'disabled' : ''}>&#10005;</button>`;
        container.appendChild(row);
    });

    container.querySelectorAll('.stop-color').forEach(el => {
        el.addEventListener('input', e => {
            state.stops[+e.target.dataset.idx].color = e.target.value;
            scheduleRender();
        });
    });
    container.querySelectorAll('.stop-pos').forEach(el => {
        el.addEventListener('input', e => {
            const i = +e.target.dataset.idx;
            state.stops[i].position = parseFloat(e.target.value);
            e.target.closest('.stop-controls').querySelector('label span').textContent =
                (state.stops[i].position * 100).toFixed(0) + '%';
            scheduleRender();
        });
    });
    container.querySelectorAll('.stop-alpha').forEach(el => {
        el.addEventListener('input', e => {
            const i = +e.target.dataset.idx;
            state.stops[i].alpha = parseFloat(e.target.value);
            const spans = e.target.closest('.stop-controls').querySelectorAll('label span');
            spans[spans.length - 1].textContent = (state.stops[i].alpha * 100).toFixed(0) + '%';
            scheduleRender();
        });
    });
    container.querySelectorAll('.remove-stop-btn').forEach(el => {
        el.addEventListener('click', e => {
            const i = +e.target.dataset.idx;
            if (state.stops.length > 2) {
                state.stops.splice(i, 1);
                renderColorStops();
                scheduleRender();
            }
        });
    });
}

document.getElementById('addStopBtn').addEventListener('click', () => {
    if (state.stops.length >= 8) return;
    const sorted  = [...state.stops].sort((a, b) => a.position - b.position);
    const lastPos = sorted[sorted.length - 1].position;
    state.stops.push({ color: '#ffffff', alpha: 1, position: Math.min(1, lastPos + 0.15) });
    renderColorStops();
    scheduleRender();
});

// ─── Gradient type UI ─────────────────────────────────────────────────────────
function renderTypeGrid() {
    const grid = document.getElementById('typeGrid');
    grid.innerHTML = '';

    GRADIENT_TYPES.forEach(t => {
        const btn = document.createElement('button');
        btn.className = 'type-btn' + (state.type === t.id ? ' active' : '');
        btn.dataset.type = t.id;

        const mini = document.createElement('canvas');
        mini.width = 60; mini.height = 32;
        btn.appendChild(mini);

        const label = document.createElement('span');
        label.textContent = t.label;
        btn.appendChild(label);

        btn.addEventListener('click', () => {
            state.type = t.id;
            document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updateAngleVisibility();
            scheduleRender();
        });
        grid.appendChild(btn);

        // Mini preview
        const mc     = mini.getContext('2d');
        const colors = ['#6366f1', '#a78bfa', '#ec4899'];
        let g;
        switch (t.id) {
            case 'radial': g = mc.createRadialGradient(30, 16, 0, 30, 16, 28); break;
            case 'conic':  g = mc.createConicGradient(0, 30, 16); break;
            default:       g = mc.createLinearGradient(0, 0, 60, 0);
        }
        colors.forEach((c, i) => g.addColorStop(i / 2, c));
        mc.fillStyle = g;
        mc.fillRect(0, 0, 60, 32);
    });
}

function updateAngleVisibility() {
    const showAngle = ['linear', 'reflected', 'conic', 'spiral'];
    document.getElementById('angleGroup').style.display = showAngle.includes(state.type) ? '' : 'none';
}

// ─── Presets UI ───────────────────────────────────────────────────────────────
function renderPresets() {
    const grid = document.getElementById('presetsGrid');
    grid.innerHTML = '';

    PRESETS.forEach(p => {
        const div = document.createElement('div');
        div.className = 'preset-swatch';
        div.title     = p.name;
        const stops   = [...p.stops].sort((a, b) => a.position - b.position);
        div.style.background = `linear-gradient(135deg, ${stops.map(s => `${s.color} ${(s.position * 100).toFixed(0)}%`).join(', ')})`;

        div.addEventListener('click', () => {
            Object.assign(state, { type: p.type, angle: p.angle, stops: JSON.parse(JSON.stringify(p.stops)) });
            document.querySelectorAll('.preset-swatch').forEach(s => s.classList.remove('active'));
            div.classList.add('active');
            syncAllInputs();
            scheduleRender();
        });
        grid.appendChild(div);
    });
}

// ─── Sync inputs ──────────────────────────────────────────────────────────────
function syncAllInputs() {
    document.getElementById('angleInput').value        = state.angle;
    document.getElementById('angleVal').textContent    = state.angle + '\u00B0';
    document.getElementById('scaleInput').value        = state.scale;
    document.getElementById('scaleVal').textContent    = state.scale + '%';
    document.getElementById('widthInput').value        = state.width;
    document.getElementById('heightInput').value       = state.height;
    document.getElementById('repeatToggle').classList.toggle('on', state.repeat);
    document.getElementById('noiseToggle').classList.toggle('on', state.noise);
    document.getElementById('noiseGroup').style.display = state.noise ? '' : 'none';
    updateAngleVisibility();
    renderColorStops();
    renderTypeGrid();
}

// ─── Input listeners ──────────────────────────────────────────────────────────
document.getElementById('angleInput').addEventListener('input', e => {
    state.angle = +e.target.value;
    document.getElementById('angleVal').textContent = state.angle + '\u00B0';
    scheduleRender();
});
document.getElementById('scaleInput').addEventListener('input', e => {
    state.scale = +e.target.value;
    document.getElementById('scaleVal').textContent = state.scale + '%';
    scheduleRender();
});
document.getElementById('widthInput').addEventListener('input', e => {
    state.width = Math.min(4096, Math.max(1, +e.target.value || 800));
    scheduleRender();
});
document.getElementById('heightInput').addEventListener('input', e => {
    state.height = Math.min(4096, Math.max(1, +e.target.value || 800));
    scheduleRender();
});
document.getElementById('repeatToggle').addEventListener('click', function () {
    state.repeat = !state.repeat;
    this.classList.toggle('on', state.repeat);
    scheduleRender();
});
document.getElementById('noiseToggle').addEventListener('click', function () {
    state.noise = !state.noise;
    this.classList.toggle('on', state.noise);
    document.getElementById('noiseGroup').style.display = state.noise ? '' : 'none';
    scheduleRender();
});
document.getElementById('noiseInput').addEventListener('input', e => {
    state.noiseIntensity = +e.target.value;
    document.getElementById('noiseVal').textContent = e.target.value + '%';
    scheduleRender();
});

// Click canvas to set center point
gradientCanvas.style.cursor = 'crosshair';
gradientCanvas.addEventListener('click', e => {
    const r     = gradientCanvas.getBoundingClientRect();
    state.centerX = (e.clientX - r.left)  / r.width;
    state.centerY = (e.clientY - r.top)   / r.height;
    scheduleRender();
});

// ─── Export ───────────────────────────────────────────────────────────────────
let exportFormat = 'png';

document.querySelectorAll('.format-btn[data-fmt]').forEach(btn => {
    btn.addEventListener('click', () => {
        exportFormat = btn.dataset.fmt;
        document.querySelectorAll('.format-btn[data-fmt]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('qualityGroup').style.display = exportFormat !== 'png' ? '' : 'none';
    });
});
document.getElementById('qualityInput').addEventListener('input', e => {
    state.exportQuality = +e.target.value / 100;
    document.getElementById('qualityVal').textContent = e.target.value + '%';
});

function getMergedCanvas() {
    const out = document.createElement('canvas');
    out.width = state.width; out.height = state.height;
    const ctx = out.getContext('2d');
    ctx.drawImage(gradientCanvas, 0, 0);
    if (state.noise) ctx.drawImage(noiseCanvas, 0, 0);
    return out;
}

document.getElementById('downloadBtn').addEventListener('click', () => {
    saveHistory();
    const out  = getMergedCanvas();
    const mime = exportFormat === 'jpg' ? 'image/jpeg' : exportFormat === 'webp' ? 'image/webp' : 'image/png';
    const a    = document.createElement('a');
    a.download  = `gradient.${exportFormat}`;
    a.href      = out.toDataURL(mime, exportFormat !== 'png' ? state.exportQuality : undefined);
    a.click();
});

document.getElementById('copyImgBtn').addEventListener('click', async () => {
    saveHistory();
    getMergedCanvas().toBlob(async blob => {
        try {
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
            showFeedback('Image copied!');
        } catch (e) {
            showFeedback('Not supported in this browser');
        }
    });
});

document.getElementById('copyCssBtn').addEventListener('click', () => {
    navigator.clipboard.writeText(document.getElementById('cssOutput').textContent);
    showFeedback('CSS copied!');
});

// ─── Random ───────────────────────────────────────────────────────────────────
document.getElementById('randomBtn').addEventListener('click', () => {
    state.type  = GRADIENT_TYPES[Math.floor(Math.random() * GRADIENT_TYPES.length)].id;
    state.angle = Math.floor(Math.random() * 360);
    const n     = 2 + Math.floor(Math.random() * 4);
    state.stops = Array.from({ length: n }, (_, i) => ({
        color:    '#' + Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0'),
        alpha:    0.7 + Math.random() * 0.3,
        position: i / (n - 1),
    }));
    state.centerX = 0.25 + Math.random() * 0.5;
    state.centerY = 0.25 + Math.random() * 0.5;
    syncAllInputs();
    scheduleRender();
});

// ─── Theme ────────────────────────────────────────────────────────────────────
let darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

function applyTheme() {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    document.getElementById('themeToggle').textContent = darkMode ? '\u2600\uFE0F' : '\uD83C\uDF19';
}

document.getElementById('themeToggle').addEventListener('click', () => {
    darkMode = !darkMode;
    applyTheme();
});

// ─── Share link ───────────────────────────────────────────────────────────────
document.getElementById('shareBtn').addEventListener('click', () => {
    const data = btoa(JSON.stringify({
        type: state.type, angle: state.angle, stops: state.stops,
        scale: state.scale, repeat: state.repeat,
        centerX: state.centerX, centerY: state.centerY,
    }));
    navigator.clipboard.writeText(location.href.split('?')[0] + '?g=' + data);
    showFeedback('Share link copied!');
});

function loadFromURL() {
    const g = new URLSearchParams(location.search).get('g');
    if (!g) return;
    try { Object.assign(state, JSON.parse(atob(g))); } catch (e) { /* ignore invalid params */ }
}

// ─── Debounced render ─────────────────────────────────────────────────────────
let renderTimer = null;
function scheduleRender() {
    clearTimeout(renderTimer);
    renderTimer = setTimeout(drawGradient, 30);
}

// ─── Init ─────────────────────────────────────────────────────────────────────
renderPresets();
loadFromURL();
syncAllInputs();
applyTheme();
drawGradient();
