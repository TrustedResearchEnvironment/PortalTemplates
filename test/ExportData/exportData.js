// =================================================================
//                      STATE & CONFIGURATION
// =================================================================

const TABLE_CONTAINER_ID = 'export-jobs-table-area';
const API_REQUEST_ID = 41;

// ADDED: Modal Element IDs
const MODAL_ID = 'export-modal';
const OPEN_MODAL_BTN_ID = 'request-export-btn';
const CLOSE_MODAL_BTN_ID = 'modal-close-btn';
const EXPORT_FORM_ID = 'export-form';

// State for pagination
let currentPage = 1;
const rowsPerPage = 5;

// This will store all the jobs after the initial fetch
let allJobs = [];

// =================================================================
//                      UTILITY FUNCTIONS
// =================================================================

/**
 * Safely parses a response that might be a JSON string or an object.
 * @param {string | object} response The API response.
 * @returns {object}
 */
function safeParseJson(response) {
    return typeof response === 'string' ? JSON.parse(response) : response;
}

/**
 * Formats a date string into a more readable format.
 * @param {string} inputDate The ISO date string to format.
 * @returns {string} The formatted date or 'N/A' if invalid.
 */
function formatDate(inputDate) {
    if (!inputDate) return 'N/A';
    const date = new Date(inputDate);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// =================================================================
//                      MODAL FUNCTIONS (ADDED)
// =================================================================

/**
 * Opens the modal dialog.
 */
function openModal() {
    const modal = document.getElementById(MODAL_ID);
    if (modal) {
        modal.classList.remove('hidden');
    }
}

/**
 * Closes the modal dialog.
 */
function closeModal() {
    const modal = document.getElementById(MODAL_ID);
    if (modal) {
        modal.classList.add('hidden');
    }
}


// =================================================================
//                      RENDERING FUNCTIONS
// =================================================================

/**
 * Renders the data table for export jobs.
 * @param {string} containerId The ID of the HTML element to render the table in.
 * @param {Array<object>} data The array of job data for the current page.
 */
function renderTable(containerId, data) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';
    
    if (!data || data.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500">No export jobs found.</p>';
        return;
    }

    const table = document.createElement('table');
    table.className = 'min-w-full divide-y divide-gray-200';
    const thead = document.createElement('thead');
    thead.className = 'bg-gray-50';
    const headerRow = document.createElement('tr');
    const headers = ['Job Name', 'Created By', 'Date Created', 'Status'];
    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.scope = 'col';
        th.className = 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider';
        th.textContent = headerText;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    tbody.className = 'bg-white divide-y divide-gray-200';
    
    data.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800">${item.jobName || 'N/A'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800">${item.createdBy || 'N/A'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800">${formatDate(item.dateCreated)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800">${item.status || 'N/A'}</td>
        `;
        tbody.appendChild(row);
    });
    table.appendChild(tbody);
    container.appendChild(table);
}

/**
 * Renders pagination controls.
 * @param {string} containerId - The ID of the container element.
 * @param {number} totalItems - The total number of items to paginate.
 * @param {number} itemsPerPage - The number of items per page.
 * @param {number} currentPage - The currently active page.
 */
function renderPagination(containerId, totalItems, itemsPerPage, currentPage) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const totalPages = Math.ceil(totalItems / itemsPerPage);
    container.innerHTML = '';

    if (totalPages <= 1) return;

    const prevDisabled = currentPage === 1;
    let paginationHTML = `
        <button data-page="${currentPage - 1}" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 ${prevDisabled ? 'opacity-50 cursor-not-allowed' : ''}" ${prevDisabled ? 'disabled' : ''}>
            Previous
        </button>`;

    paginationHTML += '<div class="flex items-center gap-2">';
    for (let i = 1; i <= totalPages; i++) {
        const isActive = i === currentPage;
        paginationHTML += `
            <button data-page="${i}" class="px-4 py-2 text-sm font-medium ${isActive ? 'text-white bg-blue-600' : 'text-gray-700 bg-white'} border border-gray-300 rounded-lg hover:bg-gray-100">${i}</button>`;
    }
    paginationHTML += '</div>';

    const nextDisabled = currentPage === totalPages;
    paginationHTML += `
        <button data-page="${currentPage + 1}" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 ${nextDisabled ? 'opacity-50 cursor-not-allowed' : ''}" ${nextDisabled ? 'disabled' : ''}>
            Next
        </button>`;

    container.innerHTML = paginationHTML;
}

/**
 * Renders the UI based on the current state (no API calls).
 */
function renderUI() {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const jobsForCurrentPage = allJobs.slice(startIndex, endIndex);

    renderTable(TABLE_CONTAINER_ID, jobsForCurrentPage);
    renderPagination('pagination-controls', allJobs.length, rowsPerPage, currentPage);
}

// =================================================================
//                      INITIALIZATION
// =================================================================

/**
 * Fetches all data and initializes the page.
 */
async function initializePage() {
    const container = document.getElementById(TABLE_CONTAINER_ID);
    if (!container) return;

    container.innerHTML = '<p class="text-center text-gray-500">Loading export jobs...</p>';

    try {
        const initialResponse = await window.loomeApi.runApiRequest(API_REQUEST_ID, { page: 1, pageSize: 1 });
        const initialData = safeParseJson(initialResponse);
        const totalJobs = initialData.RowCount;

        if (totalJobs > 0) {
            const allDataResponse = await window.loomeApi.runApiRequest(API_REQUEST_ID, { page: 1, pageSize: totalJobs });
            const allData = safeParseJson(allDataResponse);
            allJobs = allData.Results;
        }
        
        renderUI();

    } catch (error) {
        console.error("Error initializing page:", error);
        container.innerHTML = `<p class="text-center text-red-500">Failed to load data.</p>`;
    }
}

/**
 * Sets up the event listeners for the page.
 */
function setupEventListeners() {
    document.getElementById('pagination-controls').addEventListener('click', (event) => {
        const button = event.target.closest('button[data-page]');
        if (!button || button.disabled) return;
        
        currentPage = parseInt(button.dataset.page, 10);
        renderUI();
    });

    // ADDED: Modal event listeners
    const openBtn = document.getElementById(OPEN_MODAL_BTN_ID);
    const closeBtn = document.getElementById(CLOSE_MODAL_BTN_ID);
    const modal = document.getElementById(MODAL_ID);
    const form = document.getElementById(EXPORT_FORM_ID);

    if (openBtn) {
        openBtn.addEventListener('click', openModal);
    }
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    if (modal) {
        // Close modal if user clicks on the overlay background
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                closeModal();
            }
        });
    }
    if (form) {
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            console.log('Form submitted!');
            // Here you would handle the form data, e.g., make an API call
            alert('Request submitted (for now).');
            closeModal();
        });
    }

    // ADDED: Close modal with Escape key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !modal.classList.contains('hidden')) {
            closeModal();
        }
    });
}

// Start the application once the document is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    initializePage();
});