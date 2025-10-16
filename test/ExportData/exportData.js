// =================================================================
//                      STATE & CONFIGURATION
// =================================================================

const TABLE_CONTAINER_ID = 'export-jobs-table-area';
const API_REQUEST_ID = 41;

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
 * Formats a date string into a more readable format (e.g., "October 16, 2025").
 * @param {string} inputDate The ISO date string to format.
 * @returns {string} The formatted date or 'N/A' if invalid.
 */
function formatDate(inputDate) {
    if (!inputDate) {
        return 'N/A';
    }
    const date = new Date(inputDate);
    if (isNaN(date.getTime())) {
        return 'N/A';
    }
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}


// =================================================================
//                      RENDERING FUNCTIONS
// =================================================================

/**
 * Renders the data table for export jobs.
 * @param {string} containerId The ID of the HTML element to render the table in.
 * @param {Array<object>} data The array of job data from the API.
 */
function renderTable(containerId, data) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with ID "${containerId}" not found.`);
        return;
    }

    container.innerHTML = ''; // Clear previous content

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
        const tdClasses = 'px-6 py-4 whitespace-nowrap text-sm text-gray-800';

        // Populate table cells with data from the API response
        row.innerHTML = `
            <td class="${tdClasses}">${item.jobName || 'N/A'}</td>
            <td class="${tdClasses}">${item.createdBy || 'N/A'}</td>
            <td class="${tdClasses}">${formatDate(item.dateCreated)}</td>
            <td class="${tdClasses}">${item.status || 'N/A'}</td>
        `;
        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    container.appendChild(table);
}

// =================================================================
//                      INITIALIZATION
// =================================================================

/**
 * Main function to initialize the page: fetch data and render the table.
 */
async function renderExportJobsPage() {
    const container = document.getElementById(TABLE_CONTAINER_ID);
    if (!container) return;

    container.innerHTML = '<p class="text-center text-gray-500">Loading export jobs...</p>';

    try {
        // Fetch data from the API
        const response = await window.loomeApi.runApiRequest(API_REQUEST_ID);
        const parsedResponse = safeParseJson(response);
        const jobs = parsedResponse.Results;

        // Render the table with the fetched data
        renderTable(TABLE_CONTAINER_ID, jobs);

    } catch (error) {
        console.error("Error fetching or rendering export jobs:", error);
        container.innerHTML = `<p class="text-center text-red-500">Failed to load data. Please try again later.</p>`;
    }
}

// Start the application once the document is fully loaded
document.addEventListener('DOMContentLoaded', renderExportJobsPage);