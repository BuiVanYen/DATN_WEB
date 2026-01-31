export class AIView {
    constructor(container) {
        this.container = container;
    }

    async mount() {
        this.container.innerHTML = `
            <h2>Phát hiện Bệnh bằng AI (CNN)</h2>
            <div id="ai-grid" style="margin-top:1.5rem; display:grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap:1.5rem;">
                <!-- Cards injected here safely -->
            </div>

             <!-- Mock Modal -->
             <div id="ai-modal" class="hidden" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:1000;">
                <div style="background:var(--bg-surface); padding:2rem; border-radius:var(--radius-md); max-width:500px; width:90%;">
                    <h3 id="modal-title">Chi tiết Phát hiện</h3>
                    <div style="height:250px; background:#e2e8f0; margin:1rem 0; display:flex; align-items:center; justify-content:center;">Ảnh Placeholder</div>
                    <p><strong>Độ tin cậy:</strong> <span id="modal-conf"></span></p>
                    <div style="margin-top:1.5rem; text-align:right;">
                        <button id="close-modal" style="padding:0.5rem 1rem; cursor:pointer;">Đóng</button>
                    </div>
                </div>
             </div>
        `;

        const grid = this.container.querySelector('#ai-grid');

        const cardsData = [
            { label: 'healthy', conf: 0.99, time: 'Hôm nay, 10:00 Sáng' },
            { label: 'early_blight', conf: 0.85, time: 'Hôm qua, 4:30 Chiều' },
            { label: 'healthy', conf: 0.98, time: 'Hôm qua, 2:15 Chiều' },
            { label: 'late_blight', conf: 0.92, time: '28/01, 09:00 Sáng' }
        ];

        cardsData.forEach(item => {
            const cardNode = this.createCardNode(item.label, item.conf, item.time);
            grid.appendChild(cardNode);
        });

        this.container.querySelector('#close-modal').addEventListener('click', () => {
            this.container.querySelector('#ai-modal').classList.add('hidden');
        });
    }

    createCardNode(label, conf, time) {
        // Translation Map
        const DISEASE_MAP = {
            'healthy': 'Khỏe mạnh',
            'early_blight': 'Đốm vòng (Sớm)',
            'late_blight': 'Sương mai (Muộn)',
            'leaf_curl': 'Xoăn lá',
            'mosaic_virus': 'Khảm lá'
        };

        const displayName = DISEASE_MAP[label] || label;
        const isHealthy = label === 'healthy';
        const color = isHealthy ? 'var(--status-ok)' : 'var(--status-critical)';

        // Create elements safely using DOM API instead of innerHTML interpolation
        const card = document.createElement('div');
        card.className = 'ai-card';
        card.style.cssText = 'cursor:pointer; background:var(--bg-surface); border-radius:var(--radius-md); overflow:hidden; box-shadow:var(--shadow-sm); transition:transform 0.2s;';
        card.dataset.label = label;
        card.dataset.conf = conf;

        const imgDiv = document.createElement('div');
        imgDiv.style.cssText = 'height:150px; background:#e2e8f0; display:flex; align-items:center; justify-content:center; color:var(--text-secondary);';

        const icon = document.createElement('span');
        icon.className = 'material-icons-round';
        icon.style.fontSize = '3rem';
        icon.textContent = 'image';
        imgDiv.appendChild(icon);

        const bodyDiv = document.createElement('div');
        bodyDiv.style.padding = '1rem';

        const rowDiv = document.createElement('div');
        rowDiv.style.cssText = 'display:flex; justify-content:space-between; align-items:center;';

        const title = document.createElement('strong');
        title.style.textTransform = 'capitalize';
        title.textContent = displayName; // Safe text insertion

        const badge = document.createElement('span');
        badge.style.cssText = `font-size:0.8rem; color:${color}; border:1px solid ${color}; padding:2px 6px; border-radius:4px;`;
        badge.textContent = (conf * 100).toFixed(0) + '%';

        rowDiv.appendChild(title);
        rowDiv.appendChild(badge);

        const timeDiv = document.createElement('div');
        timeDiv.style.cssText = 'font-size:0.8rem; color:var(--text-secondary); margin-top:0.5rem;';
        timeDiv.textContent = time; // Safe text insertion

        bodyDiv.appendChild(rowDiv);
        bodyDiv.appendChild(timeDiv);

        card.appendChild(imgDiv);
        card.appendChild(bodyDiv);

        // Add Event Listener
        card.addEventListener('click', () => {
            this.showModal(label, conf);
        });

        return card;
    }

    showModal(label, conf) {
        const DISEASE_MAP = {
            'healthy': 'Khỏe mạnh',
            'early_blight': 'Đốm vòng (Sớm)',
            'late_blight': 'Sương mai (Muộn)',
            'leaf_curl': 'Xoăn lá',
            'mosaic_virus': 'Khảm lá'
        };
        const displayName = DISEASE_MAP[label] || label; // label might be unsafe if not checked, but textContent handles it

        const modal = this.container.querySelector('#ai-modal');
        const titleEl = modal.querySelector('#modal-title');
        const confEl = modal.querySelector('#modal-conf');

        titleEl.textContent = 'Phát hiện: ' + displayName; // Safe
        confEl.textContent = (conf * 100).toFixed(1) + '%'; // Safe

        modal.classList.remove('hidden');
    }

    destroy() { }
}
