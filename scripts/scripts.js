/**
 * FlintESP JVM Flasher - JavaScript
 * Board selection and ESP Web Tools integration
 */

// Board specifications data
// Naming convention: F=Flash, H=Internal Flash, N=NAND Flash, R=PSRAM
// Numbers indicate size in MB (e.g., FH4 = 4MB Internal Flash)
const boards = [
    {
        id: 'esp32-generic',
        name: 'Generic ESP32 Boards',
        image: null,
        cpu: 'Xtensa LX6',
        cores: 2,
        clockSpeed: '240 MHz',
        flash: '4 MB',
        ram: '520 KB',
        architecture: 'Xtensa',
        manifest: 'firmware/esp32/manifest.json'
    },
    {
        id: 'esp32-c3fh4',
        name: 'ESP32-C3FH4',
        image: null,
        cpu: 'RISC-V',
        cores: 1,
        clockSpeed: '160 MHz',
        flash: '4 MB',
        ram: '400 KB',
        architecture: 'RISC-V',
        manifest: 'firmware/esp32c3fh4/manifest.json'
    },
    {
        id: 'esp32-c6fh4',
        name: 'ESP32-C6FH4',
        image: null,
        cpu: 'RISC-V',
        cores: 1,
        clockSpeed: '160 MHz',
        flash: '4 MB',
        ram: '512 KB',
        architecture: 'RISC-V',
        manifest: 'firmware/esp32c6fh4/manifest.json'
    },
    {
        id: 'esp32-c6fh8',
        name: 'ESP32-C6FH8',
        image: null,
        cpu: 'RISC-V',
        cores: 1,
        clockSpeed: '160 MHz',
        flash: '8 MB',
        ram: '512 KB',
        architecture: 'RISC-V',
        manifest: 'firmware/esp32c6fh8/manifest.json'
    },
    {
        id: 'esp32-s2fn4r2',
        name: 'ESP32-S2FN4R2',
        image: null,
        cpu: 'Xtensa LX7',
        cores: 1,
        clockSpeed: '240 MHz',
        flash: '4 MB',
        ram: '320 KB + 2 MB PSRAM',
        architecture: 'Xtensa',
        manifest: 'firmware/esp32s2fn4r2/manifest.json'
    },
    {
        id: 'esp32-s3fh4r2',
        name: 'ESP32-S3FH4R2',
        image: null,
        cpu: 'Xtensa LX7',
        cores: 2,
        clockSpeed: '240 MHz',
        flash: '4 MB',
        ram: '512 KB + 2 MB PSRAM',
        architecture: 'Xtensa',
        manifest: 'firmware/esp32s3fh4r2/manifest.json'
    },
    {
        id: 'esp32-s3n4rx',
        name: 'ESP32-S3N4RX',
        image: null,
        cpu: 'Xtensa LX7',
        cores: 2,
        clockSpeed: '240 MHz',
        flash: '4 MB',
        ram: '512 KB + 8 MB PSRAM',
        architecture: 'Xtensa',
        manifest: 'firmware/esp32s3n4rx/manifest.json'
    },
    {
        id: 'esp32-s3n8rx',
        name: 'ESP32-S3N8RX',
        image: null,
        cpu: 'Xtensa LX7',
        cores: 2,
        clockSpeed: '240 MHz',
        flash: '8 MB',
        ram: '512 KB + 8 MB PSRAM',
        architecture: 'Xtensa',
        manifest: 'firmware/esp32s3n8rx/manifest.json'
    },
    {
        id: 'esp32-s3n16rx',
        name: 'ESP32-S3N16RX',
        image: null,
        cpu: 'Xtensa LX7',
        cores: 2,
        clockSpeed: '240 MHz',
        flash: '16 MB',
        ram: '512 KB + 8 MB PSRAM',
        architecture: 'Xtensa',
        manifest: 'firmware/esp32s3n16rx/manifest.json'
    }
];

// State
let selectedBoard = null;

// DOM Elements
const boardsGrid = document.getElementById('boardsGrid');
const selectedBoardInfo = document.getElementById('selectedBoardInfo');
const flashButton = document.getElementById('flashButton');

/**
 * Create board card HTML
 */
function createBoardCard(board) {
    const card = document.createElement('div');
    card.className = 'board-card glass-card';
    card.dataset.boardId = board.id;

    card.innerHTML = `
        <div class="selection-indicator">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </div>
        <div class="board-image">
            ${board.image
            ? `<img src="${board.image}" alt="${board.name}">`
            : `<span class="placeholder-icon">📟</span>`
        }
        </div>
        <h4 class="board-name">${board.name}</h4>
        <div class="board-specs">
            <div class="spec-item">
                <span class="spec-label">Flash</span>
                <span class="spec-value">${board.flash}</span>
            </div>
            <div class="spec-item">
                <span class="spec-label">RAM</span>
                <span class="spec-value">${board.ram}</span>
            </div>
            <div class="spec-item">
                <span class="spec-label">Cores</span>
                <span class="spec-value">${board.cores} Core${board.cores > 1 ? 's' : ''}</span>
            </div>
            <div class="spec-item">
                <span class="spec-label">Clock</span>
                <span class="spec-value">${board.clockSpeed}</span>
            </div>
            <div class="spec-item spec-item-full">
                <span class="spec-label">CPU</span>
                <span class="spec-value">${board.architecture}</span>
            </div>
        </div>
    `;

    card.addEventListener('click', () => selectBoard(board));

    return card;
}

/**
 * Select a board
 */
function selectBoard(board) {
    // Update state
    selectedBoard = board;

    // Update UI - remove selection from all cards
    document.querySelectorAll('.board-card').forEach(card => {
        card.classList.remove('selected');
    });

    // Add selection to clicked card
    const selectedCard = document.querySelector(`[data-board-id="${board.id}"]`);
    if (selectedCard) {
        selectedCard.classList.add('selected');
    }

    // Update selected board info
    updateSelectedBoardInfo();

    // Enable flash button
    enableFlashButton();

    // Scroll to flash section
    document.getElementById('flashSection').scrollIntoView({
        behavior: 'smooth',
        block: 'center'
    });
}

/**
 * Update the selected board info display
 */
function updateSelectedBoardInfo() {
    if (!selectedBoard) {
        selectedBoardInfo.innerHTML = '<p class="no-selection">Please select a board above to continue</p>';
        return;
    }

    selectedBoardInfo.innerHTML = `
        <div class="selected-board-info">
            <span class="selected-board-name">${selectedBoard.name}</span>
            <span class="selected-board-chip">${selectedBoard.cpu} • ${selectedBoard.cores} Core${selectedBoard.cores > 1 ? 's' : ''} • ${selectedBoard.clockSpeed}</span>
        </div>
    `;
}

/**
 * Enable the flash button with the correct manifest
 */
function enableFlashButton() {
    if (!selectedBoard) return;

    // Set manifest URL
    flashButton.setAttribute('manifest', selectedBoard.manifest);
    flashButton.removeAttribute('disabled');

    // Enable the button inside
    const btn = flashButton.querySelector('button');
    if (btn) {
        btn.disabled = false;
    }
}

/**
 * Initialize the page
 */
function init() {
    // Render board cards
    boards.forEach(board => {
        const card = createBoardCard(board);
        boardsGrid.appendChild(card);
    });

    // Check Web Serial support
    if (!('serial' in navigator)) {
        const flashSection = document.querySelector('.flash-section');
        if (flashSection) {
            const warning = document.createElement('div');
            warning.className = 'browser-warning';
            warning.style.cssText = `
                text-align: center;
                padding: 1rem;
                margin-bottom: 1rem;
                background: rgba(239, 68, 68, 0.1);
                border: 1px solid rgba(239, 68, 68, 0.3);
                border-radius: 0.5rem;
                color: #ef4444;
            `;
            warning.innerHTML = '⚠️ Your browser does not support Web Serial API. Please use Chrome or Edge to flash firmware.';
            flashSection.querySelector('.container').insertBefore(warning, flashSection.querySelector('.flash-card'));
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
