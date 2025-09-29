// Define the single container ID for the table
const TABLE_CONTAINER_ID = 'requests-table-area';
const API_REQUEST_ID = 10;

// --- STATE MANAGEMENT ---
// These variables need to be accessible by multiple functions.
let currentPage = 1;
let rowsPerPage = 5; // Default, will be updated by API response
let tableConfig = {}; // Will hold your headers configuration
const searchInput = document.getElementById('searchRequests');

/**
 * Renders pagination controls.
 * (This function NO LONGER adds event listeners).
 */
function renderPagination(containerId, totalItems, itemsPerPage, currentPage) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const totalPages = Math.ceil(totalItems / itemsPerPage);
    container.innerHTML = ''; // Clear old controls

    if (totalPages <= 1) {
        return; // No need for pagination.
    }

    // --- Previous Button ---
    const prevDisabled = currentPage === 1;
    let paginationHTML = `
        <button data-page="${currentPage - 1}" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 ${prevDisabled ? 'opacity-50 cursor-not-allowed' : ''}" ${prevDisabled ? 'disabled' : ''}>
            Previous
        </button>
    `;

    // --- Page Number Buttons ---
    paginationHTML += '<div class="flex items-center gap-2">';
    for (let i = 1; i <= totalPages; i++) {
        const isActive = i === currentPage;
        paginationHTML += `
            <button data-page="${i}" class="px-4 py-2 text-sm font-medium ${isActive ? 'text-white bg-blue-600' : 'text-gray-700 bg-white'} border border-gray-300 rounded-lg hover:bg-gray-100">
                ${i}
            </button>
        `;
    }
    paginationHTML += '</div>';

    // --- Next Button ---
    const nextDisabled = currentPage === totalPages;
    paginationHTML += `
        <button data-page="${currentPage + 1}" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 ${nextDisabled ? 'opacity-50 cursor-not-allowed' : ''}" ${nextDisabled ? 'disabled' : ''}>
            Next
        </button>
    `;

    container.innerHTML = paginationHTML;
}

/**
 * Fetches data from the API for a specific page and search term, then updates the UI.
 * This is the central function for all data updates.
 * @param {number} page The page number to fetch.
 * @param {string} searchTerm The search term to filter by.
 */
async function fetchAndRenderPage(tableConfig, page, searchTerm = '') {
    try {
        // --- 1. Call the API with pagination parameters ---
        // NOTE: Your loomeApi.runApiRequest must support passing parameters.
        // This is a hypothetical structure. Adjust it to how your API expects them.
        const apiParams = {
            "page": page,
            "pageSize": rowsPerPage,
            "search": searchTerm
        };
        console.log(apiParams)
        // You might need to pass params differently, e.g., runApiRequest(10, apiParams)
        const response = await window.loomeApi.runApiRequest(API_REQUEST_ID, apiParams);

        
        const parsedResponse = safeParseJson(response);
        console.log(parsedResponse)

        // --- 2. Extract Data and Update State ---
        const dataForPage = parsedResponse.Results;
        const totalItems = parsedResponse.RowCount; // The TOTAL count from the server!
        currentPage = parsedResponse.CurrentPage;
        rowsPerPage = parsedResponse.PageSize;
        
        // --- 3. Filter using searchTerm ---
        const lowerCaseSearchTerm = searchTerm.trim().toLowerCase();
        const filteredData = lowerCaseSearchTerm
            ? dataForPage.filter(item => 
                Object.values(item).some(value =>
                    String(value).toLowerCase().includes(lowerCaseSearchTerm)
                )
            )
        : dataForPage;

        // --- 4. Render the UI Components ---
        // Render the table with only the data for the current page
        renderTable(TABLE_CONTAINER_ID, tableConfig.headers, filteredData);

        // Render pagination using the TOTAL item count from the API
        renderPagination('pagination-controls', totalItems, rowsPerPage, currentPage);

        // Update the total count display
        const dataSetCount = document.getElementById('dataSetCount');
        if(dataSetCount) {
            dataSetCount.textContent = totalItems;
        }

    } catch (error) {
        console.error("Failed to fetch or render page:", error);
        const container = document.getElementById(TABLE_CONTAINER_ID);
        container.innerHTML = `<div class="p-4 text-red-600">Error loading data: ${error.message}</div>`;
    }
}

/**
 * Renders a generic data table based on a configuration object.
 * @param {string} containerId - The ID of the element to render the table into.
 * @param {Array} headers - The array of header configuration objects.
 * @param {Array} data - The array of data objects to display.
//  */
function renderTable(containerId, headers, data) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with ID "${containerId}" not found.`);
        return;
    }
    container.innerHTML = ''; // Clear previous content

    const table = document.createElement('table');
    //table.className = 'min-w-full divide-y divide-gray-200';
    table.className = 'w-full divide-y divide-gray-200 table-fixed';
    
    // --- 1. Build The Head ---
    const thead = document.createElement('thead');
    thead.className = 'bg-gray-50';
    const headerRow = document.createElement('tr');
    headers.forEach(headerConfig => {
        const th = document.createElement('th');
        th.scope = 'col';
        
        // Start with base classes
        let thClasses = 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider';
        
        // If a widthClass is defined in the config, add it.
        if (headerConfig.widthClass) {
            thClasses += ` ${headerConfig.widthClass}`;
        }
        th.className = thClasses;
        th.textContent = headerConfig.label;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // --- 2. Build The Body ---
    const tbody = document.createElement('tbody');
    tbody.className = 'bg-white divide-y divide-gray-200';

    if (data.length === 0) {
        const colSpan = headers.length || 1;
        tbody.innerHTML = `<tr><td colspan="${colSpan}" class="px-6 py-4 text-center text-sm text-gray-500">No data found.</td></tr>`;
    } else {
        data.forEach(item => {
            const row = document.createElement('tr');
            headers.forEach(headerConfig => {
                const td = document.createElement('td');
                
                // Start with the base classes for every cell.
                let tdClasses = 'px-6 py-4 text-sm text-gray-800';

                // Now, add the specific class from your config.
                if (headerConfig.className) {
                    tdClasses += ` ${headerConfig.className}`;
                } else {
                    // If no class is specified, default to break-words to prevent overflow.
                    // This is a safe fallback.
                    tdClasses += ' break-words';
                }
                td.className = tdClasses;
                
                let cellContent;

                // If a custom render function exists, use it.
                if (headerConfig.render) {
                    // For 'actions', we pass the whole item. Otherwise, pass the specific value.
                    const value = headerConfig.key === 'actions' ? item : item[headerConfig.key];
                    cellContent = headerConfig.render(value);
                } else {
                    // Otherwise, just get the data using the key.
                    const value = item[headerConfig.key];
                    cellContent = value ?? 'N/A'; // Use 'N/A' for null or undefined values
                }

                // If content is HTML, set innerHTML. Otherwise, textContent is safer.
                if (typeof cellContent === 'string' && cellContent.startsWith('<')) {
                    td.innerHTML = cellContent;
                } else {
                    td.textContent = cellContent;
                }
                
                row.appendChild(td);
            });
            tbody.appendChild(row);
        });
    }

    table.appendChild(tbody);
    container.appendChild(table);
}

function formatDate(inputDate) {
    // Log what the function receives
    console.log(`formatDate received:`, inputDate, `(type: ${typeof inputDate})`);

    if (!inputDate) {
        // This will be triggered if inputDate is null, undefined, or an empty string ""
        return 'N/A'; 
    }

    const date = new Date(inputDate);
    
    if (isNaN(date.getTime())) {
        // This will be triggered if the date string is invalid, e.g., "hello world"
        console.warn(`Could not parse invalid date:`, inputDate);
        return 'N/A';
    }
    
    const formattingOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    
    // The only way this returns undefined is if the function exits before this line.
    return date.toLocaleDateString('en-US', formattingOptions);
}

/**
 * Updates the UI and renders the correct table, optionally filtering the data.
 */
function updateTable(config, data, tableContainerId, currentPage, rowsPerPage, searchTerm = '') {

    const lowerCaseSearchTerm = searchTerm.trim().toLowerCase();
    const filteredData = lowerCaseSearchTerm
        ? data.filter(item => 
            Object.values(item).some(value =>
                String(value).toLowerCase().includes(lowerCaseSearchTerm)
            )
        )
        : data;

    // --- 3. PAGINATION LOGIC (NEW!) ---
    // Calculate the slice of data for the current page
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    // --- 4. RENDER TABLE AND PAGINATION ---
    // Render the table with ONLY the data for the current page
    renderTable(tableContainerId, config.headers, paginatedData);
    
    renderPagination('pagination-controls', filteredData.length, rowsPerPage, currentPage);
}

/**
 * Safely parses a response that might be a JSON string or an object.
 * @param {string | object} response The API response.
 * @returns {object}
 */
function safeParseJson(response) {
    return typeof response === 'string' ? JSON.parse(response) : response;
}


async function renderPlatformAdminDataSetPage() {
    // --- 1. Define the table configuration ---
    // (Moved outside the try block so it's accessible to fetchAndRenderPage)
    const tableConfig = {
                headers: [
                    { label: "Name", key: "Name", className: "break-words", widthClass: "w-3/12" },
                    { label: "Description", key: "Description", className: "break-words", widthClass: "w-3/12" },
                    { label: "Data Source ID", key: "DataSourceID", widthClass: "w-1/12 text-center" },
                    { label: "Owner", key: "Owner", className: "break-words", widthClass: "w-2/12" },
                    {
                        label: "Active",
                        key: "IsActive",
                        widthClass: "w-1/12",
                        render: (value) =>
                            value === 1
                                ? `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>`
                                : `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Inactive</span>`
                    },
                    {
                        label: "Actions",
                        key: "actions",
                        render: (item) => `<button data-id="${item.DataSetID}" class="text-indigo-600 hover:text-indigo-900 font-medium">Edit</button>`
                    }
                ]
        };
        

    // --- 2. Set up Event Listeners ---
    // The search input now calls fetchAndRenderPage
    searchInput.addEventListener('input', () => {
        // When a new search is performed, always go back to page 1
        fetchAndRenderPage(tableConfig, 1, searchInput.value);
    });

    // The pagination container now calls fetchAndRenderPage
    const paginationContainer = document.getElementById('pagination-controls');
    paginationContainer.addEventListener('click', (event) => {
        const button = event.target.closest('button[data-page]');
        if (!button || button.disabled) {
            return;
        }
        const newPage = parseInt(button.dataset.page, 10);
        console.log('newPage')
        console.log(newPage)
        // Fetch the new page, preserving the current search term
        fetchAndRenderPage(tableConfig, newPage, searchInput.value);
    });

    // --- 3. Initial Page Load ---
    // Make the first call to fetch page 1 with no search term.
    await fetchAndRenderPage(tableConfig, 1, '');
}


renderPlatformAdminDataSetPage()
