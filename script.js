document.addEventListener('DOMContentLoaded', () => {
    initSection1();
    initSection2();
    initSection3();
    initSection4();
});

// Section 1: Plates and Distributions
function initSection1() {
    const eqLayer = document.querySelector('.earthquake-layer');
    const volLayer = document.querySelector('.volcano-layer');
    const simPlates = document.getElementById('sim-plates');

    // Generate random earthquake dots focused around plate boundaries (right and bottom right)
    for (let i = 0; i < 150; i++) {
        const dot = document.createElement('div');
        dot.className = 'eq-dot';
        // Biased towards right side (Pacific/Philippine trench)
        const x = 50 + Math.random() * 45;
        const y = 20 + Math.random() * 70;
        dot.style.left = `${x}%`;
        dot.style.top = `${y}%`;
        // Add some noise
        if(Math.random() > 0.7) {
            dot.style.left = `${Math.random() * 100}%`;
            dot.style.top = `${Math.random() * 100}%`;
        }
        eqLayer.appendChild(dot);
    }

    // Generate random volcano dots
    for (let i = 0; i < 40; i++) {
        const dot = document.createElement('div');
        dot.className = 'volcano-dot';
        const x = 40 + Math.random() * 30;
        const y = 30 + Math.random() * 60;
        dot.style.left = `${x}%`;
        dot.style.top = `${y}%`;
        volLayer.appendChild(dot);
    }

    // Toggle buttons
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetClass = e.target.getAttribute('data-target');
            e.target.classList.toggle('active');
            
            if (targetClass === 'plate-arrows') {
                document.querySelector('.arrows-layer').classList.toggle('active');
            } else if (targetClass === 'earthquake-dots') {
                document.querySelector('.earthquake-layer').classList.toggle('active');
            } else if (targetClass === 'volcano-dots') {
                document.querySelector('.volcano-layer').classList.toggle('active');
            }
        });
    });
}

// Section 2: Mechanisms
function initSection2() {
    // Tabs
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

    // Simulations
    const btnTrench = document.getElementById('btn-trench-sim');
    const trenchSim = document.querySelector('#tab-trench .mechanism-sim');
    btnTrench.addEventListener('click', () => {
        trenchSim.classList.remove('animating-trench');
        void trenchSim.offsetWidth; // trigger reflow
        trenchSim.classList.add('animating-trench');
        setTimeout(() => trenchSim.classList.remove('animating-trench'), 3000);
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

// Section 3: Magnitude vs Intensity
function initSection3() {
    const magSlider = document.getElementById('mag-slider');
    const distSlider = document.getElementById('dist-slider');
    const magDisplay = document.getElementById('mag-display');
    const distDisplay = document.getElementById('dist-display');
    
    const bulbGlow = document.getElementById('bulb-glow');
    const housePos = document.getElementById('house-pos');
    const houseShake = document.getElementById('house-shake');
    const intensityVal = document.getElementById('intensity-val');

    function updateSimulation() {
        const mag = parseFloat(magSlider.value);
        const dist = parseFloat(distSlider.value);

        magDisplay.textContent = `M${mag.toFixed(1)}`;
        distDisplay.textContent = `${dist}km`;

        // Update bulb glow size based on Magnitude
        // M3 -> small, M9 -> huge (exponential relation)
        const glowSize = Math.pow(mag - 2, 2.5) * 2;
        bulbGlow.style.width = `${glowSize}px`;
        bulbGlow.style.height = `${glowSize}px`;

        // Update house position based on distance (10km -> left:10%, 200km -> left:90%)
        const posPercent = 10 + ((dist - 10) / 190) * 80;
        housePos.style.left = `${posPercent}%`;

        // Calculate simplified Intensity (震度)
        // Shaking amplitude roughly proportional to 10^(Mag) / dist^2
        let intensityRaw = (mag * 1.5) - (Math.log10(dist) * 3);
        let intensity = Math.round(intensityRaw);
        
        if (intensity < 0) intensity = 0;
        if (intensity > 7) intensity = 7;

        // Display Japanese intensity scale
        const intensityStrs = ['0', '1', '2', '3', '4', '5弱', '5強', '6弱', '6強', '7'];
        // Map 0-7 roughly to the 10-level scale for visual effect
        let displayStr = intensity.toString();
        if(intensity === 5) displayStr = mag > 6 ? '5強' : '5弱';
        if(intensity === 6) displayStr = mag > 7.5 ? '6強' : '6弱';
        if(intensity >= 7) displayStr = '7';

        intensityVal.textContent = `震度: ${displayStr}`;

        // Apply shaking animation to house
        const shakeAmount = intensity * 2; // px
        houseShake.style.transform = `translateX(${(Math.random()-0.5)*shakeAmount}px) translateY(${(Math.random()-0.5)*shakeAmount}px)`;
        
        // Keep shaking if intensity > 0
        if(intensity > 0) {
            if(!houseShake.dataset.shaking) {
                houseShake.dataset.shaking = 'true';
                animateShake();
            }
        } else {
            houseShake.dataset.shaking = '';
            houseShake.style.transform = 'none';
        }

        function animateShake() {
            if(!houseShake.dataset.shaking) return;
            const amt = Math.max(0, (parseFloat(intensityVal.textContent.replace(/[^0-9]/g, '')) || 0)) * 2;
            houseShake.style.transform = `translateX(${(Math.random()-0.5)*amt}px) translateY(${(Math.random()-0.5)*amt}px)`;
            requestAnimationFrame(animateShake);
        }
    }

    magSlider.addEventListener('input', updateSimulation);
    distSlider.addEventListener('input', updateSimulation);
    updateSimulation(); // initial call
}

// Section 4: Waves & Seismograph
function initSection4() {
    const btnWave = document.getElementById('btn-wave-sim');
    const waveContainer = document.querySelector('.wave-comparison');

    btnWave.addEventListener('click', () => {
        waveContainer.classList.remove('animating-waves');
        void waveContainer.offsetWidth;
        waveContainer.classList.add('animating-waves');
        setTimeout(() => waveContainer.classList.remove('animating-waves'), 8000);
    });

    const canvas = document.getElementById('seismographCanvas');
    const ctx = canvas.getContext('2d');
    const psTimeDisplay = document.getElementById('ps-time-display');

    // Stations distances (km)
    const stations = {
        'a': { dist: 40, color: '#3b82f6' },   // Close
        'b': { dist: 120, color: '#10b981' },  // Med
        'c': { dist: 240, color: '#f59e0b' }   // Far
    };

    const vp = 7; // P-wave velocity km/s
    const vs = 3.5; // S-wave velocity km/s

    function drawSeismograph(stationKey) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const st = stations[stationKey];
        const dist = st.dist;
        const tP = dist / vp; // Arrival time of P wave (seconds)
        const tS = dist / vs; // Arrival time of S wave (seconds)
        const psTime = tS - tP; // Initial tremor duration

        psTimeDisplay.textContent = `約 ${psTime.toFixed(1)} 秒`;
        psTimeDisplay.style.color = st.color;

        // Draw grid
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        for(let x=0; x<=canvas.width; x+=50) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
            if(x > 0) {
                ctx.fillStyle = '#94a3b8';
                ctx.font = '12px Arial';
                ctx.fillText(`${x/10}秒`, x-10, canvas.height - 5);
            }
        }

        // Draw waveform
        ctx.beginPath();
        ctx.strokeStyle = st.color;
        ctx.lineWidth = 2;
        
        const centerY = canvas.height / 2;
        ctx.moveTo(0, centerY);

        for(let x=0; x<canvas.width; x++) {
            const t = x / 10; // 10 pixels = 1 second
            let y = centerY;

            if (t >= tP && t < tS) {
                // Initial Tremor (P-wave)
                // Small amplitude, high frequency
                y += Math.sin(t * 10) * 10 * Math.exp(-(t-tP)*0.05);
            } else if (t >= tS) {
                // Principal Motion (S-wave)
                // Large amplitude, lower frequency
                y += Math.sin(t * 5) * 40 * Math.exp(-(t-tS)*0.05);
                // Add some random noise
                y += (Math.random() - 0.5) * 10 * Math.exp(-(t-tS)*0.05);
            }

            ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Annotations
        ctx.fillStyle = '#000';
        ctx.font = 'bold 14px Arial';
        
        // P-wave arrival line
        const px = tP * 10;
        ctx.beginPath(); ctx.strokeStyle='red'; ctx.setLineDash([5,5]);
        ctx.moveTo(px, 0); ctx.lineTo(px, canvas.height); ctx.stroke();
        ctx.fillText('P波到達', px + 5, 20);

        // S-wave arrival line
        const sx = tS * 10;
        ctx.beginPath(); ctx.moveTo(sx, 0); ctx.lineTo(sx, canvas.height); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillText('S波到達', sx + 5, 40);

        // PS Time span
        ctx.beginPath(); ctx.strokeStyle='rgba(239, 68, 68, 0.5)'; ctx.lineWidth=10;
        ctx.moveTo(px, canvas.height - 30); ctx.lineTo(sx, canvas.height - 30); ctx.stroke();
        ctx.fillStyle = 'red';
        ctx.fillText('初期微動継続時間', px + (sx-px)/2 - 40, canvas.height - 40);
    }

    const btns = [
        document.getElementById('btn-station-a'),
        document.getElementById('btn-station-b'),
        document.getElementById('btn-station-c')
    ];

    btns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            btns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            const id = e.target.id;
            if(id.includes('a')) drawSeismograph('a');
            if(id.includes('b')) drawSeismograph('b');
            if(id.includes('c')) drawSeismograph('c');
        });
    });

    // Initial draw
    drawSeismograph('a');
}
