// Define the single container ID for the table
const TABLE_CONTAINER_ID = 'requests-table-area';
const API_REQUEST_ID = 10;
const API_UPDATE_DATASET_ID = 28;
let STATUS_FILTER = 1; // Default to showing only active items

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
    
    // Basic styling (add this to your CSS file for better results)
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
async function fetchAndRenderPage(tableConfig, page, searchTerm = '', statusFilter) {
    try {
        // --- 1. Call the API with pagination parameters ---
        // NOTE: Your loomeApi.runApiRequest must support passing parameters.
        // This is a hypothetical structure. Adjust it to how your API expects them.
        const apiParams = {
            "activeStatus": statusFilter,
            "page": page,
            "pageSize": rowsPerPage,
            "search": searchTerm
        };
        console.log(apiParams)

        const response = await window.loomeApi.runApiRequest(API_REQUEST_ID, apiParams);

        
        const parsedResponse = safeParseJson(response);
        console.log(parsedResponse)

        

        // --- 2. Extract Data and Update State ---
        dataForPage = parsedResponse.Results;

        // const dataForPage = parsedResponse.Results.filter(item => item.IsActive === true);
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
        detailsContainer.dataset.id = item.DataSetID;
        detailsContainer.dataset.dataSetColumns = item.DataSetColumns;
        detailsContainer.dataset.dataSetFieldValues = item.DataSetFieldValues;
        detailsContainer.dataset.dataSetFolders = item.DataSetFolders;
        detailsContainer.dataset.dataSetMetaDataValues = item.DataSetMetaDataValues;
        detailsContainer.dataset.datasourceId = item.DataSourceID;





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
        
        // Add event listeners for edit/save/cancel buttons
        detailsContainer.addEventListener('click', async (event) => {
            const editButton = event.target.closest('.btn-edit');
            const saveButton = event.target.closest('.btn-save');
            const cancelButton = event.target.closest('.btn-cancel');
            
            if (!editButton && !saveButton && !cancelButton) return;
            
            event.stopPropagation();
            
            // Toggle between view and edit states
            const toggleEditState = (isEditing) => {
                detailsContainer.querySelectorAll('.view-state').forEach(el => el.classList.toggle('hidden', isEditing));
                detailsContainer.querySelectorAll('.edit-state').forEach(el => el.classList.toggle('hidden', !isEditing));
            };
            
            // Handle Edit button click
            if (editButton) {
                toggleEditState(true);
            }
            
            // Handle Cancel button click
            if (cancelButton) {
                toggleEditState(false);
            }
            
            // Handle Save button click
            if (saveButton) {
                const datasetId = detailsContainer.dataset.id;
                const dataSetColumns = detailsContainer.dataset.dataSetColumns;
                const dataSetFieldValues = detailsContainer.dataset.dataSetFieldValues;
                const dataSetFolders = detailsContainer.dataset.dataSetFolders;
                const dataSetMetaDataValues = detailsContainer.dataset.dataSetMetaDataValues;
                const datasourceId = detailsContainer.dataset.datasourceId;
                const saveBtn = saveButton;

                console.log("DataSetID:", datasetId);
                console.log("DataSetColumns:", dataSetColumns);
                console.log("DataSetFieldValues:", dataSetFieldValues);
                console.log("DataSetFolders:", dataSetFolders);
                console.log("DataSetMetaDataValues:", dataSetMetaDataValues);
                console.log("DataSourceID:", datasourceId);
                
                // Show saving state
                saveBtn.textContent = 'Saving...';
                saveBtn.disabled = true;
                
                try {
                    // Gather data from form fields
                    const updatedName = detailsContainer.querySelector('.edit-state-name').value;
                    const updatedDescription = detailsContainer.querySelector('.edit-state-description').value;
                    const updatedOwner = detailsContainer.querySelector('.edit-state-owner').value;
                    const updatedApprovers = detailsContainer.querySelector('.edit-state-approvers').value;
                    const updatedIsActive = detailsContainer.querySelector('.edit-state-isactive').checked;
                    
                    // Get opt-out column if it exists
                    let updatedOptOutColumn = '';
                    const optOutColumnElement = detailsContainer.querySelector('.edit-state-optoutcolumn');
                    if (optOutColumnElement) {
                        updatedOptOutColumn = optOutColumnElement.value;
                    }

                    // Get opt-out list if it exists
                    let updatedOptOutList = '';
                    const optOutListElement = detailsContainer.querySelector('.edit-state-optoutlist');
                    if (optOutListElement) {
                        updatedOptOutList = optOutListElement.value;
                    }
                    
                    // Get opt-out message if it exists
                    let updatedOptOutMessage = '';
                    const optOutMessageElement = detailsContainer.querySelector('.edit-state-optoutmessage');
                    if (optOutMessageElement) {
                        updatedOptOutMessage = optOutMessageElement.value;
                    }

                    // Prepare update parameters
                    const updateParams = {
                        "name": updatedName,
                        "description": updatedDescription,
                        "owner": updatedOwner,
                        "approver": updatedApprovers,
                        "isActive": updatedIsActive,
                        "optOutColumn": updatedOptOutColumn,
                        "optOutList": updatedOptOutList,
                        "optOutMessage": updatedOptOutMessage,
                        "dataSetColumns": [],
                        "dataSetFieldValues": [],
                        "dataSetFolders": [],
                        "dataSetMetaDataValues": [],
                        "datasourceId": datasourceId,
                        "id": datasetId
                    };
                    
                    console.log("Raw update params:", updateParams);
                    console.log("JSON stringified:", JSON.stringify(updateParams));

                    // Call API to update dataset
                    const updatedDataset = await window.loomeApi.runApiRequest(API_UPDATE_DATASET_ID, updateParams);
                    
                    // Handle successful update
                    if (!updatedDataset) {
                        throw new Error("API call succeeded but returned no data.");
                    }
                    
                    showToast('Dataset updated successfully!');
                    
                    // Update the UI with new data
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
                    
                    // Update the main row cells to reflect changes
                    const mainRow = accordionRow.previousElementSibling;
                    const nameCellIndex = headers.findIndex(h => h.key === 'Name') + 1; // +1 for expand button
                    const descriptionCellIndex = headers.findIndex(h => h.key === 'Description') + 1;
                    const ownerCellIndex = headers.findIndex(h => h.key === 'Owner') + 1;
                    const activeCellIndex = headers.findIndex(h => h.key === 'IsActive') + 1;
                    
                    if (nameCellIndex > 0) mainRow.cells[nameCellIndex].textContent = updatedDataset.Name;
                    if (descriptionCellIndex > 0) mainRow.cells[descriptionCellIndex].textContent = updatedDataset.Description;
                    if (ownerCellIndex > 0) mainRow.cells[ownerCellIndex].textContent = updatedDataset.Owner;
                    
                    // For IsActive, we need to update the HTML since it uses a custom render function
                    if (activeCellIndex > 0) {
                        const activeCell = mainRow.cells[activeCellIndex];
                        activeCell.innerHTML = updatedDataset.IsActive
                            ? `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>`
                            : `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Inactive</span>`;
                    }
                    
                    // Switch back to view mode
                    toggleEditState(false);
                    
                } catch (error) {
                    console.error('Failed to save:', error);
                    showToast(`Error: ${error.message || 'Failed to save data.'}`, 'error');
                } finally {
                    // Reset button state
                    saveBtn.textContent = 'Save Changes';
                    saveBtn.disabled = false;
                }
            }
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
            </div>
        </div>
    `;
    
    container.innerHTML = detailsHTML;

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
        fetchAndRenderPage(tableConfig, 1, searchInput.value, STATUS_FILTER);
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
        fetchAndRenderPage(tableConfig, newPage, searchInput.value, STATUS_FILTER);
    });

    // Add button event listeners
    const activeBtn = document.getElementById('showActiveBtn');
    const inactiveBtn = document.getElementById('showInactiveBtn');

    activeBtn.addEventListener('click', () => {
        showActive = !showActive;
        if (!showActive && !showInactive) {
            showInactive = true;
        }
        updateFilterButtons();
        fetchAndRenderPage(tableConfig, 1, searchInput.value, STATUS_FILTER);
    });

    inactiveBtn.addEventListener('click', () => {
        showInactive = !showInactive;
        if (!showActive && !showInactive) {
            showActive = true;
        }
        updateFilterButtons();
        fetchAndRenderPage(tableConfig, 1, searchInput.value, STATUS_FILTER);
    });

    // Initialize button states
    updateFilterButtons();

    // --- 3. Initial Page Load ---
    // Make the first call to fetch page 1 with no search term.
    await fetchAndRenderPage(tableConfig, 1, '', STATUS_FILTER);
}


renderPlatformAdminDataSetPage()

// Add this function after renderPlatformAdminDataSetPage
function updateFilterButtons() {
    const activeBtn = document.getElementById('showActiveBtn');
    const inactiveBtn = document.getElementById('showInactiveBtn');

    // Update button styles based on state
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

    // Update STATUS_FILTER based on button states
    if (showActive && showInactive) {
        STATUS_FILTER = 3;
    } else if (showActive) {
        STATUS_FILTER = 1;
    } else if (showInactive) {
        STATUS_FILTER = 2;
    } else {
        // If somehow neither is selected, default to active
        showActive = true;
        STATUS_FILTER = 1;
    }
}