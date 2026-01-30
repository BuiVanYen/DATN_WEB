export class AIView {
    constructor(container) {
        this.container = container;
    }

    async mount() {
        this.container.innerHTML = `
            <h2>Phát hiện Bệnh bằng AI (CNN)</h2>
            <div style="margin-top:1.5rem; display:grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap:1.5rem;">
                ${this.renderCard('healthy', 0.99, 'Hôm nay, 10:00 Sáng')}
                ${this.renderCard('early_blight', 0.85, 'Hôm qua, 4:30 Chiều')}
                ${this.renderCard('healthy', 0.98, 'Hôm qua, 2:15 Chiều')}
                ${this.renderCard('late_blight', 0.92, '28/01, 09:00 Sáng')}
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

        // Interactive Gallery
        this.container.querySelectorAll('.ai-card').forEach(card => {
            card.addEventListener('click', () => {
                const label = card.dataset.label;
                const conf = card.dataset.conf;
                this.showModal(label, conf);
            });
        });

        this.container.querySelector('#close-modal').addEventListener('click', () => {
            this.container.querySelector('#ai-modal').classList.add('hidden');
        });
    }

    renderCard(label, conf, time) {
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

        return `
            <div class="ai-card" data-label="${label}" data-conf="${conf}" style="cursor:pointer; background:var(--bg-surface); border-radius:var(--radius-md); overflow:hidden; box-shadow:var(--shadow-sm); transition:transform 0.2s;">
                <div style="height:150px; background:#e2e8f0; display:flex; align-items:center; justify-content:center; color:var(--text-secondary);">
                    <span class="material-icons-round" style="font-size:3rem;">image</span>
                </div>
                <div style="padding:1rem;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <strong style="text-transform:capitalize;">${displayName}</strong>
                        <span style="font-size:0.8rem; color:${color}; border:1px solid ${color}; padding:2px 6px; border-radius:4px;">${(conf * 100).toFixed(0)}%</span>
                    </div>
                    <div style="font-size:0.8rem; color:var(--text-secondary); margin-top:0.5rem;">${time}</div>
                </div>
            </div>
        `;
    }

    showModal(label, conf) {
        const DISEASE_MAP = {
            'healthy': 'Khỏe mạnh',
            'early_blight': 'Đốm vòng (Sớm)',
            'late_blight': 'Sương mai (Muộn)',
            'leaf_curl': 'Xoăn lá',
            'mosaic_virus': 'Khảm lá'
        };
        const displayName = DISEASE_MAP[label] || label;
        const modal = this.container.querySelector('#ai-modal');
        modal.querySelector('#modal-title').textContent = 'Phát hiện: ' + displayName;
        modal.querySelector('#modal-conf').textContent = (conf * 100).toFixed(1) + '%';
        modal.classList.remove('hidden');
    }

    destroy() { }
}
