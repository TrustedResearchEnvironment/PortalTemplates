// Define the single container ID for the table
const TABLE_CONTAINER_ID = 'requests-table-area';
const API_REQUEST_ID = 10;
const API_UPDATE_DATASET_ID = 28;
const API_ADD_DATASET = 29
// Added new constants for the database connection logic
const DBCONNECTION_API_ID = 31; // API ID to fetch database connection details
const DATABASE_CONNECTION_TYPE_ID = 1; // The ID for the "Database Connection" DataSourceType
const API_GET_DATASOURCES = 5;
const API_GET_DATASOURCEFIELDVALUES = 18;
const API_GET_FIELDS = 19;
let STATUS_FILTER = 1; // Default to showing only active items
// For DataSource Folder logic
const DATASOURCEFOLDER_API_ID = 32; // API ID to fetch data source folder details
const DATASOURCEFOLDER_TYPE_ID = 3; // The ID for the "DataSource Folders" DataSourceType


// --- STATE MANAGEMENT ---
// These variables need to be accessible by multiple functions.
let currentPage = 1;
let rowsPerPage = 5; // Default, will be updated by API response
let tableConfig = {}; // Will hold your headers configuration
const searchInput = document.getElementById('searchRequests');

let showActive = true;
let showInactive = false;

/**
 * Displays a temporary "toast" notification on the screen.
 * @param {string} message - The message to display.
 * @param {string} [type='success'] - The type of toast ('success', 'error', 'info').
 * @param {number} [duration=3000] - How long the toast should be visible in milliseconds.
 */
function showToast(message, type = 'success', duration = 3000) {
    // Create the toast element
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.textContent = message;
    
    // Basic styling
    const style = document.createElement('style');
    document.head.appendChild(style);
    style.sheet.insertRule(`
        .toast-notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: #fff;
            font-family: sans-serif;
            z-index: 9999;
            opacity: 0;
            transition: opacity 0.3s ease, transform 0.3s ease;
            transform: translateY(-20px);
        }
    `);
    style.sheet.insertRule('.toast-success { background-color: #28a745; }'); // Green
    style.sheet.insertRule('.toast-error { background-color: #dc3545; }');   // Red
    
    // Append to body and trigger animation
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    }, 10); // A tiny delay to allow the CSS transition to work
    
    // Set a timer to remove the toast
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-20px)';
        // Remove the element from the DOM after the fade-out animation
        toast.addEventListener('transitionend', () => toast.remove());
    }, duration);
}

// Validation helper function at the top with other utility functions
function validateDataset(name, owner, approver, datasourceId) {
    const errors = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Required field validation 
    if (!name || name.trim() === '') {
        errors.push('Dataset Name is required');
    }
    if (!owner || owner.trim() === '') {
        errors.push('Owner Email is required'); 
    }
    if (!approver || approver.trim() === '') {
        errors.push('Approver Email is required');
    }
    if (!datasourceId || datasourceId === '') {
        errors.push('Data Source is required');
    }

    // Email validation
    if (owner && !emailRegex.test(owner.trim())) {
        errors.push('Owner must be a valid email address');
    }
    if (approver && !emailRegex.test(approver.trim())) {
        errors.push('Approver must be a valid email address');
    }

    return errors;
}
/**
 * Renders pagination controls.
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
async function fetchAndRenderPage(tableConfig, page, searchTerm = '', statusFilter) {
    try {
        // --- 1. Call the API with pagination parameters ---
        const apiParams = {
            "activeStatus": statusFilter,
            "page": page,
            "pageSize": rowsPerPage,
            "search": searchTerm
        };
        console.log(apiParams)

        const response = await window.loomeApi.runApiRequest(API_REQUEST_ID, apiParams);
        const parsedResponse = safeParseJson(response);
        
        // --- 2. Extract Data and Update State ---
        const dataForPage = parsedResponse.Results;
        const totalItems = parsedResponse.RowCount; 
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
        renderTable(TABLE_CONTAINER_ID, tableConfig.headers, filteredData);
        renderPagination('pagination-controls', totalItems, rowsPerPage, currentPage);

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
 */
function renderTable(containerId, headers, data) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with ID '${containerId}' not found`);
        return;
    }
    
    container.innerHTML = '';
    
    if (!data || !Array.isArray(data) || data.length === 0) {
        container.innerHTML = '<div class="text-center py-4">No data available</div>';
        return;
    }
    
    const table = document.createElement('table');
    table.className = 'w-full divide-y divide-gray-200 table-fixed';
    
    const thead = document.createElement('thead');
    thead.className = 'bg-gray-50';
    
    const headerRow = document.createElement('tr');
    
    const expandHeader = document.createElement('th');
    expandHeader.className = 'w-10 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider';
    headerRow.appendChild(expandHeader);
    
    headers.forEach(header => {
        const th = document.createElement('th');
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
    
    const tbody = document.createElement('tbody');
    tbody.className = 'bg-white divide-y divide-gray-200';
    
    data.forEach(item => {
        const row = document.createElement('tr');
        row.className = 'cursor-pointer hover:bg-gray-50';
        
        const expandCell = document.createElement('td');
        expandCell.className = 'px-3 py-4 whitespace-nowrap w-10';
        
        const chevronButton = document.createElement('button');
        chevronButton.className = 'transition-transform duration-200 ease-in-out';
        chevronButton.innerHTML = '<svg class="w-5 h-5 chevron-icon" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>';
        
        expandCell.appendChild(chevronButton);
        row.appendChild(expandCell);
        
        headers.forEach(header => {
            const cell = document.createElement('td');
            let tdClasses = 'px-3 py-4';
            
            if (header.className) {
                tdClasses += ` ${header.className}`;
            } else {
                tdClasses += ' break-words';
            }
            
            tdClasses += ' truncate';
            cell.className = tdClasses;
            
            const value = item[header.key];
            
            if (header.render && value !== undefined) {
                cell.innerHTML = header.render(value);
            } else {
                cell.textContent = value !== undefined ? value : '';
            }
            
            if (typeof value === 'string') {
                cell.title = value;
            }
            
            row.appendChild(cell);
        });
        
        const accordionRow = document.createElement('tr');
        accordionRow.classList.add('hidden', 'accordion-row');
        
        const accordionCell = document.createElement('td');
        accordionCell.colSpan = headers.length + 1;
        accordionCell.className = 'p-0';
        
        const detailsContainer = document.createElement('div');
        detailsContainer.className = 'p-4 bg-gray-50';
        detailsContainer.dataset.id = item.DataSetID;
        detailsContainer.dataset.dataSetColumns = item.DataSetColumns;
        detailsContainer.dataset.dataSetFieldValues = item.DataSetFieldValues;
        detailsContainer.dataset.dataSetFolders = item.DataSetFolders;
        detailsContainer.dataset.dataSetMetaDataValues = item.DataSetMetaDataValues;
        detailsContainer.dataset.datasourceId = item.DataSourceID;

        detailsContainer.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-3">
                    <div>
                        <h3 class="text-sm font-medium text-gray-500">Dataset ID</h3>
                        <p class="mt-1 text-sm text-gray-900">${item.DataSetID || 'N/A'}</p>
                    </div>
                    <div>
                        <h3 class="text-sm font-medium text-gray-500">Name</h3>
                        <div class="mt-1">
                            <span class="view-state view-state-name text-sm text-gray-900">${item.Name || 'N/A'}</span>
                            <input type="text" value="${item.Name || ''}" class="edit-state edit-state-name hidden w-full rounded-md border-gray-300 shadow-sm sm:text-sm">
                        </div>
                    </div>
                    <div>
                        <h3 class="text-sm font-medium text-gray-500">Description</h3>
                        <div class="mt-1">
                            <span class="view-state view-state-description text-sm text-gray-900 break-words">${item.Description || 'No description available'}</span>
                            <textarea class="edit-state edit-state-description hidden w-full rounded-md border-gray-300 shadow-sm sm:text-sm" rows="3">${item.Description || ''}</textarea>
                        </div>
                    </div>
                    <div>
                        <h3 class="text-sm font-medium text-gray-500">Data Source ID</h3>
                        <p class="mt-1 text-sm text-gray-900">${item.DataSourceID !== undefined ? item.DataSourceID : 'N/A'}</p>
                    </div>
                </div>
                <div class="space-y-3">
                    <div>
                        <h3 class="text-sm font-medium text-gray-500">Owner</h3>
                        <div class="mt-1">
                            <span class="view-state view-state-owner text-sm text-gray-900 break-words">${item.Owner || 'N/A'}</span>
                            <input type="text" value="${item.Owner || ''}" class="edit-state edit-state-owner hidden w-full rounded-md border-gray-300 shadow-sm sm:text-sm">
                        </div>
                    </div>
                    <div>
                        <h3 class="text-sm font-medium text-gray-500">Approvers</h3>
                        <div class="mt-1">
                            <span class="view-state view-state-approvers text-sm text-gray-900 break-words">${item.Approvers || 'None'}</span>
                            <input type="text" value="${item.Approvers || ''}" class="edit-state edit-state-approvers hidden w-full rounded-md border-gray-300 shadow-sm sm:text-sm">
                        </div>
                    </div>
                    <div>
                        <h3 class="text-sm font-medium text-gray-500">Active</h3>
                        <div class="mt-1">
                            <span class="view-state view-state-isactive text-sm text-gray-900">${item.IsActive !== undefined ? (item.IsActive ? 'Yes' : 'No') : 'N/A'}</span>
                            <div class="edit-state hidden flex items-center">
                                <input type="checkbox" ${item.IsActive ? 'checked' : ''} class="edit-state-isactive h-4 w-4 rounded border-gray-300 text-indigo-600">
                                <label class="ml-2 block text-sm text-gray-900">Is Active</label>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h3 class="text-sm font-medium text-gray-500">Last Modified</h3>
                        <p class="mt-1 text-sm text-gray-900">${formatDate(item.ModifiedDate)}</p>
                    </div>
                </div>
                
                ${item.OptOutList ? `
                <div class="col-span-1 md:col-span-2">
                    <h3 class="text-sm font-medium text-gray-500">Opt-Out List</h3>
                    <div class="mt-1">
                        <span class="view-state view-state-optoutlist text-sm text-gray-900 whitespace-pre-line break-words">${item.OptOutList}</span>
                        <textarea class="edit-state edit-state-optoutlist hidden w-full rounded-md border-gray-300 shadow-sm sm:text-sm" rows="3">${item.OptOutList || ''}</textarea>
                    </div>
                </div>` : ''}
                
                <div class="col-span-1 md:col-span-2 flex justify-end space-x-2 mt-4">
                    <div class="view-state">
                        <button class="btn-edit px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            Edit Dataset
                        </button>
                    </div>
                    <div class="edit-state hidden space-x-2">
                        <button class="btn-cancel px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            Cancel
                        </button>
                        <button class="btn-save px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        accordionCell.appendChild(detailsContainer);
        accordionRow.appendChild(accordionCell);
        
        detailsContainer.addEventListener('click', async (event) => {
            const editButton = event.target.closest('.btn-edit');
            const saveButton = event.target.closest('.btn-save');
            const cancelButton = event.target.closest('.btn-cancel');
            
            if (!editButton && !saveButton && !cancelButton) return;
            
            event.stopPropagation();
            
            const toggleEditState = (isEditing) => {
                detailsContainer.querySelectorAll('.view-state').forEach(el => el.classList.toggle('hidden', isEditing));
                detailsContainer.querySelectorAll('.edit-state').forEach(el => el.classList.toggle('hidden', !isEditing));
            };
            
            if (editButton) {
                toggleEditState(true);
            }
            
            if (cancelButton) {
                toggleEditState(false);
            }
            
            if (saveButton) {
                const datasetId = detailsContainer.dataset.id;
                const datasourceId = detailsContainer.dataset.datasourceId;
                const saveBtn = saveButton;
                
                saveBtn.textContent = 'Saving...';
                saveBtn.disabled = true;
                
                try {
                    const updatedName = detailsContainer.querySelector('.edit-state-name').value;
                    const updatedDescription = detailsContainer.querySelector('.edit-state-description').value;
                    const updatedOwner = detailsContainer.querySelector('.edit-state-owner').value;
                    const updatedApprovers = detailsContainer.querySelector('.edit-state-approvers').value;
                    const updatedIsActive = detailsContainer.querySelector('.edit-state-isactive').checked;
                    
                    let updatedOptOutList = '';
                    const optOutListElement = detailsContainer.querySelector('.edit-state-optoutlist');
                    if (optOutListElement) {
                        updatedOptOutList = optOutListElement.value;
                    }
                    
                    const updateParams = {
                        "name": updatedName,
                        "description": updatedDescription,
                        "owner": updatedOwner,
                        "approver": updatedApprovers,
                        "isActive": updatedIsActive,
                        "optOutList": updatedOptOutList,
                        "dataSetColumns": [],
                        "dataSetFieldValues": [],
                        "dataSetFolders": [],
                        "dataSetMetaDataValues": [],
                        "datasourceId": datasourceId,
                        "id": datasetId
                    };
                    
                    const updatedDataset = await window.loomeApi.runApiRequest(API_UPDATE_DATASET_ID, updateParams);
                    
                    if (!updatedDataset) {
                        throw new Error("API call succeeded but returned no data.");
                    }
                    
                    showToast('Dataset updated successfully!');
                    
                    detailsContainer.querySelector('.view-state-name').textContent = updatedDataset.Name || 'N/A';
                    detailsContainer.querySelector('.view-state-description').textContent = updatedDataset.Description || 'No description available';
                    detailsContainer.querySelector('.view-state-owner').textContent = updatedDataset.Owner || 'N/A';
                    detailsContainer.querySelector('.view-state-approvers').textContent = updatedDataset.Approvers || 'None';
                    detailsContainer.querySelector('.view-state-isactive').textContent = updatedDataset.IsActive ? 'Yes' : 'No';
                    
                    if (updatedDataset.OptOutList) {
                        const optOutElement = detailsContainer.querySelector('.view-state-optoutlist');
                        if (optOutElement) {
                            optOutElement.textContent = updatedDataset.OptOutList;
                        }
                    }
                    
                    const mainRow = accordionRow.previousElementSibling;
                    const nameCellIndex = headers.findIndex(h => h.key === 'Name') + 1;
                    const descriptionCellIndex = headers.findIndex(h => h.key === 'Description') + 1;
                    const ownerCellIndex = headers.findIndex(h => h.key === 'Owner') + 1;
                    const activeCellIndex = headers.findIndex(h => h.key === 'IsActive') + 1;
                    
                    if (nameCellIndex > 0) mainRow.cells[nameCellIndex].textContent = updatedDataset.Name;
                    if (descriptionCellIndex > 0) mainRow.cells[descriptionCellIndex].textContent = updatedDataset.Description;
                    if (ownerCellIndex > 0) mainRow.cells[ownerCellIndex].textContent = updatedDataset.Owner;
                    
                    if (activeCellIndex > 0) {
                        const activeCell = mainRow.cells[activeCellIndex];
                        activeCell.innerHTML = updatedDataset.IsActive
                            ? `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>`
                            : `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Inactive</span>`;
                    }
                    
                    toggleEditState(false);
                    
                } catch (error) {
                    console.error('Failed to save:', error);
                    showToast(`Error: ${error.message || 'Failed to save data.'}`, 'error');
                } finally {
                    saveBtn.textContent = 'Save Changes';
                    saveBtn.disabled = false;
                }
            }
        });
        
        row.addEventListener('click', () => {
            chevronButton.querySelector('.chevron-icon').classList.toggle('rotate-180');
            accordionRow.classList.toggle('hidden');
        });
        
        tbody.appendChild(row);
        tbody.appendChild(accordionRow);
    });
    
    table.appendChild(tbody);
    container.appendChild(table);
}

function formatDate(inputDate) {
    if (!inputDate) return 'N/A';
    const date = new Date(inputDate);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
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

    searchInput.addEventListener('input', () => {
        fetchAndRenderPage(tableConfig, 1, searchInput.value, STATUS_FILTER);
    });

    const paginationContainer = document.getElementById('pagination-controls');
    paginationContainer.addEventListener('click', (event) => {
        const button = event.target.closest('button[data-page]');
        if (!button || button.disabled) return;
        const newPage = parseInt(button.dataset.page, 10);
        fetchAndRenderPage(tableConfig, newPage, searchInput.value, STATUS_FILTER);
    });

    const activeBtn = document.getElementById('showActiveBtn');
    const inactiveBtn = document.getElementById('showInactiveBtn');

    activeBtn.addEventListener('click', () => {
        showActive = !showActive;
        if (!showActive && !showInactive) showInactive = true;
        updateFilterButtons();
        fetchAndRenderPage(tableConfig, 1, searchInput.value, STATUS_FILTER);
    });

    inactiveBtn.addEventListener('click', () => {
        showInactive = !showInactive;
        if (!showActive && !showInactive) showActive = true;
        updateFilterButtons();
        fetchAndRenderPage(tableConfig, 1, searchInput.value, STATUS_FILTER);
    });

    const saveNewDatasetBtn = document.getElementById('saveNewDatasetBtn');
    if (saveNewDatasetBtn) {
        saveNewDatasetBtn.addEventListener('click', async (event) => {
            event.preventDefault();
            const saveBtn = saveNewDatasetBtn;

            try {
                const name = document.getElementById('newDatasetName').value;
                const owner = document.getElementById('newDatasetOwner').value;
                const approver = document.getElementById('newDatasetApprover').value;
                const datasourceId = document.getElementById('newDatasetDataSourceId').value;

                const errors = validateDataset(name, owner, approver, datasourceId);
                if (errors.length > 0) {
                    showToast(errors.join('. '), 'error', 5000);
                    return;
                }

                saveBtn.textContent = 'Saving...';
                saveBtn.disabled = true;

                // Dynamically get the value from either the table dropdown or the generic text field
                const tableSelect = document.getElementById('dataSourceTableSelect');
                const genericField = document.getElementById('dataSourceField');
                let datasourceFieldValue = '';
                if (tableSelect) {
                    datasourceFieldValue = tableSelect.value;
                } else if (genericField) {
                    datasourceFieldValue = genericField.value;
                }
                
                const newDatasetPayload = {
                    name: name.trim(),
                    description: document.getElementById('newDatasetDescription').value.trim(),
                    owner: owner.trim(),
                    approver: approver.trim(),
                    isActive: document.getElementById('newDatasetIsActive').checked,
                    dataSetColumns: [],
                    dataSetFieldValues: [],
                    dataSetFolders: [],
                    dataSetMetaDataValues: [],
                    datasourceId: datasourceId,
                    datasourceField: datasourceFieldValue, // Use the dynamically retrieved value
                };

                const response = await window.loomeApi.runApiRequest(API_ADD_DATASET, newDatasetPayload);
                if (!response) throw new Error("Failed to add dataset - no response from server");

                showToast('Dataset added successfully!');

                const modalElement = document.getElementById('addDatasetModal');
                if (modalElement) bootstrap.Modal.getOrCreateInstance(modalElement).hide();

                document.getElementById('addDatasetForm').reset();
                await fetchAndRenderPage(tableConfig, 1, '', STATUS_FILTER);

            } catch (error) {
                console.error('Failed to add dataset:', error);
                showToast(`Error: ${error.message || 'Failed to save dataset'}`, 'error', 5000);
            } finally {
                saveBtn.textContent = 'Save Dataset';
                saveBtn.disabled = false;
            }
        });
    }
    
    updateFilterButtons();
    await fetchAndRenderPage(tableConfig, 1, '', STATUS_FILTER);
}

renderPlatformAdminDataSetPage()

function updateFilterButtons() {
    const activeBtn = document.getElementById('showActiveBtn');
    const inactiveBtn = document.getElementById('showInactiveBtn');

    if (showActive) {
        activeBtn.classList.remove('bg-[#D9F1F0]', 'text-gray-700', 'border-gray-300');
        activeBtn.classList.add('bg-[#4EC4BC]', 'text-white');
    } else {
        activeBtn.classList.remove('bg-[#4EC4BC]', 'text-white');
        activeBtn.classList.add('bg-[#D9F1F0]', 'text-gray-700', 'border-gray-300');
    }

    if (showInactive) {
        inactiveBtn.classList.remove('bg-[#D9F1F0]', 'text-gray-700', 'border-gray-300');
        inactiveBtn.classList.add('bg-[#4EC4BC]', 'text-white');
    } else {
        inactiveBtn.classList.remove('bg-[#4EC4BC]', 'text-white');
        inactiveBtn.classList.add('bg-[#D9F1F0]', 'text-gray-700', 'border-gray-300');
    }

    if (showActive && showInactive) STATUS_FILTER = 3;
    else if (showActive) STATUS_FILTER = 1;
    else if (showInactive) STATUS_FILTER = 2;
    else {
        showActive = true;
        STATUS_FILTER = 1;
    }
}

async function updateDataSourceFields(selectedSourceId, dataSourceTypeId) {
    const container = document.getElementById('dataSourceFieldContainer');
    container.innerHTML = ''; // Clear existing fields
    container.style.display = 'none'; // Hide by default

    try {
        const typeId = parseInt(dataSourceTypeId, 10);

        // Logic for Database Connection types
        if (typeId === DATABASE_CONNECTION_TYPE_ID) {
            const allFieldValues = safeParseJson(await window.loomeApi.runApiRequest(API_GET_DATASOURCEFIELDVALUES, { dataSourceId: selectedSourceId }));
            const fieldValueEntry = allFieldValues.find(fv => fv.DataSourceID.toString() === selectedSourceId.toString());

            if (!fieldValueEntry || !fieldValueEntry.Value) {
                return showToast('Could not find a Connection ID for this Data Source.', 'error');
            }
            const connectionId = parseInt(fieldValueEntry.Value, 10);
            if (isNaN(connectionId)) {
                return showToast('The Connection ID is not a valid number.', 'error');
            }

            const allDbConnections = safeParseJson(await window.loomeApi.runApiRequest(DBCONNECTION_API_ID, {}));
            const targetConnection = allDbConnections.find(conn => conn.ConnectionId === connectionId);

            if (targetConnection && targetConnection.Tables && targetConnection.Tables.length > 0) {
                const optionsHTML = targetConnection.Tables.map(table => 
                    `<option value="${table.TableName}">${table.TableName}</option>`
                ).join('');

                container.innerHTML = `
                    <label for="dataSourceTableSelect" class="form-label">Table Name</label>
                    <select class="form-select" id="dataSourceTableSelect" name="dataSourceTableSelect">
                        <option value="" disabled selected>Select a Table</option>
                        ${optionsHTML}
                    </select>
                `;
                container.style.display = 'block';
            } else {
                showToast('No tables found for this database connection.', 'info');
            }
        } else if (typeId === DATASOURCEFOLDER_TYPE_ID) {
            // Logic for DataSource Folder types
            // Fetch all folder sources, as the API returns an array.
            const allFolderSources = safeParseJson(await window.loomeApi.runApiRequest(DATASOURCEFOLDER_API_ID, {}));

            // Find the specific source that matches the user's selection.
            const targetSource = allFolderSources.find(source => source.DataSourceId.toString() === selectedSourceId.toString());

            // Check if the source was found and if it has any folders.
            if (targetSource && targetSource.Folders && targetSource.Folders.length > 0) {
                // Map the array of folder objects to an array of HTML <option> strings.
                const optionsHTML = targetSource.Folders.map(folder => 
                    `<option value="${folder.FolderName}">${folder.FolderName}</option>`
                ).join(''); // Join the array of strings into a single HTML string.

                // Populate the container with a dropdown <select> element.
                container.innerHTML = `
                    <label for="dataSourceFolderSelect" class="form-label">Folder Name</label>
                    <select class="form-select" id="dataSourceFolderSelect" name="dataSourceFolderSelect">
                        <option value="" disabled selected>Select a Folder</option>
                        ${optionsHTML}
                    </select>
                `;
                // Make the container visible.
                container.style.display = 'block';
            } else {
                // If no folders are found for the selected source, inform the user and hide the container.
                showToast('No folders found for this data source.', 'info');
                container.innerHTML = '';
                container.style.display = 'none';
            }
        } else {
            // Fallback logic for all other data source types
            const allFieldValues = safeParseJson(await window.loomeApi.runApiRequest(API_GET_DATASOURCEFIELDVALUES, { dataSourceId: selectedSourceId }));
            const fieldValues = allFieldValues.filter(fv => fv.DataSourceID.toString() === selectedSourceId.toString());
            const fields = safeParseJson(await window.loomeApi.runApiRequest(API_GET_FIELDS, {}));

            if (fieldValues.length > 0 && fields) {
                const fieldValue = fieldValues[0];
                const field = fields.find(f => f.FieldID === fieldValue.FieldID);

                if (field) {
                    container.innerHTML = `
                        <label for="dataSourceField" class="form-label">${field.Name}</label>
                        <input type="text" class="form-control" id="dataSourceField" name="dataSourceField"
                               value="${fieldValue.Value || ''}" placeholder="Enter ${field.Name}">
                    `;
                    container.style.display = 'block';
                }
            }
        }
    } catch (error) {
        console.error('Failed to update data source fields:', error);
        showToast('Failed to load details for this data source.', 'error');
    }
}


async function populateDataSourcesDropdown() {
    try {
        const response = await window.loomeApi.runApiRequest(API_GET_DATASOURCES, { page: 1, pageSize: 1000, search: "" });
        const dataSources = safeParseJson(response).Results;
        const dropdown = document.getElementById('newDatasetDataSourceId');
        
        dropdown.innerHTML = '<option value="" disabled selected>Select a Data Source</option>';
        dataSources.sort((a, b) => a.Name.localeCompare(b.Name));

        dataSources.forEach(source => {
            const option = document.createElement('option');
            option.value = source.DataSourceID;
            option.textContent = source.Name;
            option.dataset.typeId = source.DataSourceTypeID; // Store type ID for later use
            if (source.Description) option.title = source.Description;
            dropdown.appendChild(option);
        });

        // Add a single, smart change event listener
        dropdown.addEventListener('change', async (e) => {
            const selectedOption = e.target.options[e.target.selectedIndex];
            if (selectedOption.value) {
                // Pass both the ID and the Type ID to the handler function
                await updateDataSourceFields(selectedOption.value, selectedOption.dataset.typeId);
            } else {
                const container = document.getElementById('dataSourceFieldContainer');
                container.style.display = 'none';
                container.innerHTML = '';
            }
        });

    } catch (error) {
        console.error('Failed to load data sources:', error);
        showToast('Failed to load data sources', 'error');
    }
}


const addDatasetModal = document.getElementById('addDatasetModal');
const saveNewDatasetBtn = document.getElementById('saveNewDatasetBtn');

addDatasetModal.addEventListener('show.bs.modal', async () => {
    await populateDataSourcesDropdown();
    if(saveNewDatasetBtn) {
        saveNewDatasetBtn.textContent = 'Save Dataset';
        saveNewDatasetBtn.disabled = false;
    }
});