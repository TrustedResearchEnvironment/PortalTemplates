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
        console.error(`Container with ID '${containerId}' not found`);
        return;
    }
    
    container.innerHTML = '';
    
    // Check if data exists and is an array
    if (!data || !Array.isArray(data) || data.length === 0) {
        container.innerHTML = '<div class="text-center py-4">No data available</div>';
        return;
    }
    
    const table = document.createElement('table');
    table.className = 'w-full divide-y divide-gray-200 table-fixed';
    
    // Create table header
    const thead = document.createElement('thead');
    thead.className = 'bg-gray-50';
    
    const headerRow = document.createElement('tr');
    
    // Add an empty header cell for the expand/collapse button
    const expandHeader = document.createElement('th');
    expandHeader.className = 'w-10 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider';
    headerRow.appendChild(expandHeader);
    
    headers.forEach(header => {
        const th = document.createElement('th');
        // Add width classes if provided, otherwise use default width handling
        let thClasses = 'px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider';
        if (header.widthClass) {
            thClasses += ` ${header.widthClass}`;
        }
        th.className = thClasses;
        th.textContent = header.label;
        headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Create table body
    const tbody = document.createElement('tbody');
    tbody.className = 'bg-white divide-y divide-gray-200';
    
    data.forEach(item => {
        // Create main row
        const row = document.createElement('tr');
        row.className = 'cursor-pointer hover:bg-gray-50';
        
        // Add expand/collapse button cell
        const expandCell = document.createElement('td');
        expandCell.className = 'px-3 py-4 whitespace-nowrap w-10';
        
        const chevronButton = document.createElement('button');
        chevronButton.className = 'transition-transform duration-200 ease-in-out';
        chevronButton.innerHTML = '<svg class="w-5 h-5 chevron-icon" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>';
        
        expandCell.appendChild(chevronButton);
        row.appendChild(expandCell);
        
        // Add data cells
        headers.forEach(header => {
            const cell = document.createElement('td');
            
            // Start with base classes for cell
            let tdClasses = 'px-3 py-4';
            
            // Now, add the specific class from your config.
            if (header.className) {
                tdClasses += ` ${header.className}`;
            } else {
                // If no class is specified, default to break-words to prevent overflow
                tdClasses += ' break-words';
            }
            
            // Add text truncation classes
            tdClasses += ' truncate';
            
            cell.className = tdClasses;
            
            // Check if the property exists in the item
            const value = item[header.key];
            
            // Use custom render function if provided, otherwise use the raw value
            if (header.render && value !== undefined) {
                cell.innerHTML = header.render(value);
            } else {
                cell.textContent = value !== undefined ? value : '';
            }
            
            // Add title attribute for hover tooltip with full text
            if (typeof value === 'string') {
                cell.title = value;
            }
            
            row.appendChild(cell);
        });
        
        // Create accordion row (initially hidden)
        const accordionRow = document.createElement('tr');
        accordionRow.classList.add('hidden', 'accordion-row');
        
        const accordionCell = document.createElement('td');
        accordionCell.colSpan = headers.length + 1; // +1 for the expand button column
        accordionCell.className = 'p-0';
        
        // Create details container
        const detailsContainer = document.createElement('div');
        detailsContainer.className = 'p-4 bg-gray-50';
        
        // Create a nicely formatted display of the dataset details
        detailsContainer.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-3">
                    <div>
                        <h3 class="text-sm font-medium text-gray-500">Dataset ID</h3>
                        <p class="mt-1 text-sm text-gray-900">${item.DataSetID || 'N/A'}</p>
                    </div>
                    <div>
                        <h3 class="text-sm font-medium text-gray-500">Name</h3>
                        <p class="mt-1 text-sm text-gray-900">${item.Name || 'N/A'}</p>
                    </div>
                    <div>
                        <h3 class="text-sm font-medium text-gray-500">Description</h3>
                        <p class="mt-1 text-sm text-gray-900 break-words">${item.Description || 'No description available'}</p>
                    </div>
                    <div>
                        <h3 class="text-sm font-medium text-gray-500">Data Source ID</h3>
                        <p class="mt-1 text-sm text-gray-900">${item.DataSourceID !== undefined ? item.DataSourceID : 'N/A'}</p>
                    </div>
                </div>
                <div class="space-y-3">
                    <div>
                        <h3 class="text-sm font-medium text-gray-500">Owner</h3>
                        <p class="mt-1 text-sm text-gray-900 break-words">${item.Owner || 'N/A'}</p>
                    </div>
                    <div>
                        <h3 class="text-sm font-medium text-gray-500">Approvers</h3>
                        <p class="mt-1 text-sm text-gray-900 break-words">${item.Approvers || 'None'}</p>
                    </div>
                    <div>
                        <h3 class="text-sm font-medium text-gray-500">Active</h3>
                        <p class="mt-1 text-sm text-gray-900">${item.IsActive !== undefined ? (item.IsActive ? 'Yes' : 'No') : 'N/A'}</p>
                    </div>
                    <div>
                        <h3 class="text-sm font-medium text-gray-500">Last Modified</h3>
                        <p class="mt-1 text-sm text-gray-900">${formatDate(item.ModifiedDate)}</p>
                    </div>
                </div>
                
                ${item.OptOutList ? `
                <div class="col-span-1 md:col-span-2">
                    <h3 class="text-sm font-medium text-gray-500">Opt-Out List</h3>
                    <p class="mt-1 text-sm text-gray-900 whitespace-pre-line break-words">${item.OptOutList}</p>
                </div>` : ''}
                
                <div class="col-span-1 md:col-span-2 flex justify-end space-x-2 mt-4">
                    <button class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 edit-dataset-btn" data-dataset-id="${item.DataSetID}">
                        Edit Dataset
                    </button>
                    <button class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 action-delete" data-dataset-id="${item.DataSetID}" data-dataset-name="${item.Name}">
                        Delete
                    </button>
                </div>
            </div>
        `;
        
        accordionCell.appendChild(detailsContainer);
        accordionRow.appendChild(accordionCell);
        
        // Add event listeners for the buttons
        detailsContainer.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent row toggle when clicking inside details
        });
        
        // Add event listener to toggle accordion
        row.addEventListener('click', () => {
            // Toggle chevron rotation
            chevronButton.querySelector('.chevron-icon').classList.toggle('rotate-180');
            
            // Toggle accordion visibility
            accordionRow.classList.toggle('hidden');
        });
        
        // Add rows to table body
        tbody.appendChild(row);
        tbody.appendChild(accordionRow);
    });
    
    table.appendChild(tbody);
    container.appendChild(table);
    
    // Add event listeners for action buttons after the table is added to the DOM
    const deleteButtons = container.querySelectorAll('.action-delete');
    deleteButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const datasetId = button.dataset.datasetId;
            const datasetName = button.dataset.datasetName;
            if (confirm(`Are you sure you want to delete dataset "${datasetName}"?`)) {
                deleteDataset(datasetId);
            }
        });
    });
    
    const editButtons = container.querySelectorAll('.edit-dataset-btn');
    editButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const datasetId = button.dataset.datasetId;
            // Navigate to edit page or open edit modal
            window.location.href = `/admin/dataset/edit/${datasetId}`;
            // Or if using a modal:
            // openEditModal(datasetId);
        });
    });
}


// Function to render dataset details
function renderDatasetDetails(container, details, item) {
    // Create a nicely formatted display of the dataset details
    const detailsHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            <div class="space-y-3">
                <div>
                    <h3 class="text-sm font-medium text-gray-500">Dataset ID</h3>
                    <p class="mt-1 text-sm text-gray-900">${item.DataSetID}</p>
                </div>
                <div>
                    <h3 class="text-sm font-medium text-gray-500">Name</h3>
                    <p class="mt-1 text-sm text-gray-900">${item.Name}</p>
                </div>
                <div>
                    <h3 class="text-sm font-medium text-gray-500">Description</h3>
                    <p class="mt-1 text-sm text-gray-900">${item.Description || 'No description available'}</p>
                </div>
                <div>
                    <h3 class="text-sm font-medium text-gray-500">Data Source ID</h3>
                    <p class="mt-1 text-sm text-gray-900">${item.DataSourceID}</p>
                </div>
            </div>
            <div class="space-y-3">
                <div>
                    <h3 class="text-sm font-medium text-gray-500">Owner</h3>
                    <p class="mt-1 text-sm text-gray-900">${item.Owner}</p>
                </div>
                <div>
                    <h3 class="text-sm font-medium text-gray-500">Approvers</h3>
                    <p class="mt-1 text-sm text-gray-900">${item.Approvers || 'None'}</p>
                </div>
                <div>
                    <h3 class="text-sm font-medium text-gray-500">Active</h3>
                    <p class="mt-1 text-sm text-gray-900">${item.IsActive ? 'Yes' : 'No'}</p>
                </div>
                <div>
                    <h3 class="text-sm font-medium text-gray-500">Last Modified</h3>
                    <p class="mt-1 text-sm text-gray-900">${formatDate(item.ModifiedDate)}</p>
                </div>
            </div>
            
            ${item.OptOutList ? `
            <div class="col-span-1 md:col-span-2">
                <h3 class="text-sm font-medium text-gray-500">Opt-Out List</h3>
                <p class="mt-1 text-sm text-gray-900 whitespace-pre-line">${item.OptOutList}</p>
            </div>` : ''}
            
            <div class="col-span-1 md:col-span-2 flex justify-end space-x-2">
                <button class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Edit Dataset
                </button>
                <button class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 action-delete">
                    Delete
                </button>
            </div>
        </div>
    `;
    
    container.innerHTML = detailsHTML;
    
    // Add event listener for delete button
    const deleteBtn = container.querySelector('.action-delete');
    deleteBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm(`Are you sure you want to delete dataset "${item.Name}"?`)) {
            deleteDataset(item.DataSetID);
        }
    });
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

// Function to delete a dataset
async function deleteDataset(datasetId) {
    try {
        await window.loomeApi.runApiRequest('DeleteDataset', { datasetId });
        alert('Dataset deleted successfully');
        // Refresh the table
        fetchAndRenderPage(tableConfig, currentPage, searchTerm);
    } catch (error) {
        console.error('Error deleting dataset:', error);
        alert(`Error deleting dataset: ${error.message}`);
    }
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
                    { label: "Description", key: "Description", className: "break-words", widthClass: "w-6/12" },
                    { label: "Owner", key: "Owner", className: "break-words", widthClass: "w-3/12" },
                    {
                        label: "Active",
                        key: "IsActive",
                        widthClass: "w-1/12",
                        render: (value) =>
                            value === true
                                ? `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>`
                                : `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Inactive</span>`
                    },
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