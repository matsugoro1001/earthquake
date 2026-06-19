document.addEventListener('DOMContentLoaded', () => {
    initSection1();
    initSection2();
    initSection3();
    initSection4();
});

// Section 1: Maps
function initSection1() {
    const eqLayer = document.getElementById('layer-earthquakes');
    const volLayer = document.getElementById('layer-volcanoes');
    
    // Accurate positioning based on trenches and volcanic front
    // Japan Trench / Kuril Trench (East of Tohoku/Hokkaido) -> x: 300 to 450, y: 50 to 250
    // Nankai Trough (South of Honshu/Shikoku) -> x: 150 to 300, y: 300 to 450
    const eqRegions = [
        { x: 310, y: 100, rx: 20, ry: 100 }, // Tohoku offshore
        { x: 350, y: 50, rx: 30, ry: 30 },   // Hokkaido offshore
        { x: 220, y: 320, rx: 60, ry: 20 },  // Nankai
        { x: 150, y: 380, rx: 40, ry: 30 }   // Nankai west
    ];

    eqRegions.forEach(reg => {
        for(let i=0; i<30; i++) {
            createDot(eqLayer, 'eq-dot', reg.x + (Math.random()-0.5)*reg.rx*2, reg.y + (Math.random()-0.5)*reg.ry*2);
        }
    });

    // Volcanic Front (Inland, parallel to trenches)
    const volRegions = [
        { x: 280, y: 120, rx: 10, ry: 80 }, // Tohoku inland
        { x: 320, y: 60, rx: 20, ry: 20 },  // Hokkaido inland
        { x: 220, y: 250, rx: 40, ry: 20 }, // Chubu/Kanto
        { x: 100, y: 400, rx: 20, ry: 30 }  // Kyushu
    ];

    volRegions.forEach(reg => {
        for(let i=0; i<15; i++) {
            createDot(volLayer, 'volcano-dot', reg.x + (Math.random()-0.5)*reg.rx*2, reg.y + (Math.random()-0.5)*reg.ry*2);
        }
    });

    function createDot(parent, className, x, y) {
        const dot = document.createElement('div');
        dot.className = className;
        // Convert SVG coordinates (0-500) to percentages
        dot.style.left = `${(x/500)*100}%`;
        dot.style.top = `${(y/500)*100}%`;
        parent.appendChild(dot);
    }

    // Toggles
    document.getElementById('toggle-plates').addEventListener('change', (e) => {
        const layer = document.getElementById('svg-plates');
        e.target.checked ? layer.classList.add('active') : layer.classList.remove('active');
    });
    document.getElementById('toggle-earthquakes').addEventListener('change', (e) => {
        const layer = document.getElementById('layer-earthquakes');
        e.target.checked ? layer.classList.add('active') : layer.classList.remove('active');
    });
    document.getElementById('toggle-volcanoes').addEventListener('change', (e) => {
        const layer = document.getElementById('layer-volcanoes');
        e.target.checked ? layer.classList.add('active') : layer.classList.remove('active');
    });
}

// Section 2: Mechanisms
function initSection2() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
        });
    });

    const btnTrench = document.getElementById('btn-trench-sim');
    const trenchSim = document.querySelector('#tab-trench .mechanism-sim');
    btnTrench.addEventListener('click', () => {
        trenchSim.classList.remove('animating-trench');
        void trenchSim.offsetWidth;
        trenchSim.classList.add('animating-trench');
        setTimeout(() => trenchSim.classList.remove('animating-trench'), 4000);
    });

    const btnInland = document.getElementById('btn-inland-sim');
    const inlandSim = document.querySelector('#tab-inland .mechanism-sim');
    btnInland.addEventListener('click', () => {
        inlandSim.classList.remove('animating-inland');
        void inlandSim.offsetWidth;
        inlandSim.classList.add('animating-inland');
        setTimeout(() => inlandSim.classList.remove('animating-inland'), 3000);
    });
}

// Section 3: Magnitude
function initSection3() {
    const magSlider = document.getElementById('mag-slider');
    const magDisplay = document.getElementById('mag-display');
    const bulbGlow = document.getElementById('bulb-glow');

    // Houses: [0] = close(30km), [1] = med(100km), [2] = far(200km)
    const houses = [
        { dist: 30, el: document.getElementById('house-a'), label: document.getElementById('int-label-a') },
        { dist: 100, el: document.getElementById('house-b'), label: document.getElementById('int-label-b') },
        { dist: 200, el: document.getElementById('house-c'), label: document.getElementById('int-label-c') }
    ];

    function updateSim() {
        const mag = parseFloat(magSlider.value);
        magDisplay.textContent = `M ${mag.toFixed(1)}`;
        
        // Glow size
        const glowSize = Math.pow(mag - 3, 2.5) * 5;
        bulbGlow.style.width = `${glowSize}px`;
        bulbGlow.style.height = `${glowSize}px`;

        houses.forEach(h => {
            // Simplified Intensity Calculation: I = 1.5*M - 3*log10(D) + offset
            let rawInt = (1.5 * mag) - (3 * Math.log10(h.dist)) + 0.5;
            let intensity = Math.round(rawInt);
            if (intensity < 0) intensity = 0;
            if (intensity > 7) intensity = 7;

            // Map to Japanese scale
            let displayStr = intensity.toString();
            if (intensity === 5) displayStr = mag > 6.5 ? '5強' : '5弱';
            if (intensity === 6) displayStr = mag > 7.5 ? '6強' : '6弱';
            if (intensity >= 7) displayStr = '7';

            h.label.textContent = `震度: ${intensity > 0 ? displayStr : '0 (無感)'}`;

            // Adjust shaking visual
            if (intensity > 0) {
                const shakeAmt = intensity * 1.5;
                if(!h.el.dataset.shaking) {
                    h.el.dataset.shaking = 'true';
                    animateHouse(h.el, () => parseFloat(h.label.textContent.replace(/[^0-9]/g, '')) || 0);
                }
            } else {
                h.el.dataset.shaking = '';
                h.el.style.transform = 'none';
            }
        });
    }

    function animateHouse(el, getInt) {
        if(!el.dataset.shaking) return;
        const int = getInt();
        const amt = int * 2;
        el.style.transform = `translateX(${(Math.random()-0.5)*amt}px) translateY(${(Math.random()-0.5)*amt}px)`;
        requestAnimationFrame(() => animateHouse(el, getInt));
    }

    magSlider.addEventListener('input', updateSim);
    updateSim();
}

// Section 4: Travel Time Curve (Canvas)
function initSection4() {
    const canvas = document.getElementById('travelTimeCanvas');
    const ctx = canvas.getContext('2d');
    const btnDraw = document.getElementById('btn-draw-waves');

    const vp = 6; // P wave velocity km/s
    const vs = 3.5; // S wave velocity km/s

    // Stations
    const stations = [
        { name: '観測点A', dist: 60, y: 75 },
        { name: '観測点B', dist: 120, y: 150 },
        { name: '観測点C', dist: 240, y: 300 }
    ];

    let animationProgress = 0;
    let isAnimating = false;

    function drawGraph(progress) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw Grid
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        // X-axis (time) 1px = 1s, total 900s? Wait, 10px = 1s makes 90s total.
        const pxPerSec = 10;
        for(let x=0; x<=canvas.width; x+=pxPerSec*5) { // every 5 seconds
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
            if(x > 0) {
                ctx.fillStyle = '#94a3b8'; ctx.font = '10px Arial'; ctx.fillText(`${x/pxPerSec}s`, x-10, canvas.height - 5);
            }
        }
        
        // Origin (Earthquake occurrence)
        ctx.fillStyle = 'red';
        ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI*2); ctx.fill();
        ctx.fillText('地震発生 (0秒, 0km)', 10, 15);

        // Draw lines
        // P-wave line (Red)
        ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(0, 0); 
        const pEndX = (stations[2].dist / vp) * pxPerSec * progress;
        const pEndY = stations[2].y * progress;
        ctx.lineTo(pEndX, pEndY); ctx.stroke();
        
        // S-wave line (Blue)
        ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(0, 0); 
        const sEndX = (stations[2].dist / vs) * pxPerSec * progress;
        const sEndY = stations[2].y * progress;
        ctx.lineTo(sEndX, sEndY); ctx.stroke();

        // Draw waveforms for each station
        stations.forEach(st => {
            // Draw axis line for station
            ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(0, st.y); ctx.lineTo(canvas.width, st.y); ctx.stroke();
            
            ctx.fillStyle = '#333'; ctx.font = 'bold 12px Arial';
            ctx.fillText(`${st.name} (${st.dist}km)`, 10, st.y - 10);

            const tP = st.dist / vp;
            const tS = st.dist / vs;

            ctx.beginPath();
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1.5;
            ctx.moveTo(0, st.y);

            // Draw wave up to progress time
            const maxTime = (900 / pxPerSec) * progress; // seconds
            
            for(let x=0; x < maxTime * pxPerSec && x < canvas.width; x++) {
                const t = x / pxPerSec;
                let yOffset = 0;

                if (t >= tP && t < tS) {
                    yOffset = Math.sin(t * 15) * 5 * Math.exp(-(t-tP)*0.02); // Initial tremor
                } else if (t >= tS) {
                    yOffset = Math.sin(t * 5) * 20 * Math.exp(-(t-tS)*0.05); // Principal motion
                    yOffset += (Math.random()-0.5) * 5;
                }
                ctx.lineTo(x, st.y + yOffset);
            }
            ctx.stroke();

            // Draw points at intersections
            if (maxTime >= tP) {
                ctx.fillStyle = '#ef4444';
                ctx.beginPath(); ctx.arc(tP * pxPerSec, st.y, 5, 0, Math.PI*2); ctx.fill();
            }
            if (maxTime >= tS) {
                ctx.fillStyle = '#3b82f6';
                ctx.beginPath(); ctx.arc(tS * pxPerSec, st.y, 5, 0, Math.PI*2); ctx.fill();
            }
        });
    }

    drawGraph(1.0); // Draw fully initially

    btnDraw.addEventListener('click', () => {
        if(isAnimating) return;
        isAnimating = true;
        animationProgress = 0;
        
        function animate() {
            animationProgress += 0.005; // speed
            if(animationProgress > 1) animationProgress = 1;
            drawGraph(animationProgress);
            
            if(animationProgress < 1) {
                requestAnimationFrame(animate);
            } else {
                isAnimating = false;
            }
        }
        animate();
    });
}
