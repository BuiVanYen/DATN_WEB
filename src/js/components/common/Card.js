export class Card {
    constructor({ title, valueId, unit, icon, colorVar, subtitle }) {
        this.title = title;
        this.valueId = valueId; // match key in store.sensors (e.g. 't_air')
        this.unit = unit;
        this.icon = icon;
        this.colorVar = colorVar || '--primary'; // e.g. '--status-warning'
        this.subtitle = subtitle || '';
        this.element = this.createEl();
    }

    createEl() {
        const div = document.createElement('div');
        div.className = 'kpi-card';
        div.style.borderLeft = `4px solid var(${this.colorVar})`;
        div.innerHTML = `
            <div class="card-header">
                <span class="card-title">${this.title}</span>
                <span class="material-icons-round" style="color:var(${this.colorVar})">${this.icon}</span>
            </div>
            <div class="card-body">
                <span class="value" id="kpi-${this.valueId}">--</span>
                <span class="unit">${this.unit}</span>
            </div>
            ${this.subtitle ? `<div class="card-footer">${this.subtitle}</div>` : ''}
        `;
        return div;
    }

    update(data) {
        const val = data[this.valueId];
        const el = this.element.querySelector(`#kpi-${this.valueId}`);
        if (val !== undefined && el) {
            el.textContent = val;
            // Add basic animation class
            el.classList.remove('fade-in');
            void el.offsetWidth; // trigger reflow
            el.classList.add('fade-in');
        }
    }
}
