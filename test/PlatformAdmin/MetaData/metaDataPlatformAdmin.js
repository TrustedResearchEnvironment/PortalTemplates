// Define the single container ID for the table
const TABLE_CONTAINER_ID = 'requests-table-area';
const API_REQUEST_ID = 12;

// --- STATE MANAGEMENT ---
// These variables need to be accessible by multiple functions.
let currentPage = 1;
let rowsPerPage = 5; // Default, will be updated by API response
let tableConfig = {}; // Will hold your headers configuration
const searchInput = document.getElementById('searchRequests');


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

function AddMetadata() {
    // Get the modal's body element
    const modalBody = document.getElementById('addMetaDataModalBody');
    console.log("IN add Metadata")

    // Populate the modal body with the provided HTML content (your markup)
    modalBody.innerHTML = `
                <form id="addMetaDataForm">
                        <!-- Name Field -->
                        <div class="mb-3">
                            <label for="Name" class="form-label">Name</label>
                            <input id="metaDataName" placeholder="Name for this Meta Data" class="form-control">
                        </div>

                        <!-- Description Field -->
                        <div class="mb-3">
                            <label for="Description" class="form-label">Description</label>
                            <textarea rows="2" id="metaDataDescription" placeholder="Description of this Meta Data" class="form-control"></textarea>
                        </div>

                        <!-- Active Checkbox -->
                        <div class="mb-3 form-check">
                            <input type="checkbox" id="metaDataActive" class="form-check-input" checked>
                            <label class="form-check-label" for="metaDataActive">Active</label>
                        </div>

                    </form>
            
    `;
    
}

/**
 * Gathers all data from the "Add Data Source" modal form.
 * It handles both static fields and dynamically generated fields.
 *
 * @param {HTMLElement} formElement - The <form> element to read data from.
 * @returns {object | null} An object containing the structured form data, or null if the form is not found.
 */
function getMetaDataFormData(formElement) {
    if (!formElement) {
        console.error("Form element not provided to getMetaDataFormData.");
        return null;
    }

    // --- 1. Get values from the STATIC fields ---
    // We use .value for text inputs/textareas and .checked for checkboxes.
    const name = formElement.querySelector('#metaDataName').value;
    const description = formElement.querySelector('#metaDataDescription').value;
    const isActive = formElement.querySelector('#metaDataActive').checked;

    // --- 3. Combine everything into a final payload object ---
    // This structure is designed to match your Pydantic "Create" model.
    const formData = {
        "name": name,
        "description": description,
        "isActive": isActive
    };

    return formData;
}

const renderAccordionDetails = (item) => {
    const dateModified = formatDate(item.ModifiedDate);


    return `
    <div class="accordion-body bg-slate-50 p-6" data-id="${item.MetaDataID}">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-12">
            <!-- LEFT COLUMN: Remains the same -->
            <div>
                 <table class="w-full text-sm">
                    <tbody>
                        <tr class="border-b"><td class="py-2 font-medium text-gray-500 w-1/3">ID</td><td class="py-2 text-gray-900">${item.MetaDataID}</td></tr>
                        <tr class="border-b"><td class="py-2 font-medium text-gray-500">Name</td><td class="py-2 text-gray-900">
                            <span class="view-state view-state-name">${item.Name}</span>
                            <input type="text" value="${item.Name}" class="edit-state edit-state-name hidden w-full rounded-md border-gray-300 shadow-sm sm:text-sm">
                        </td></tr>
                        <tr class="border-b"><td class="py-2 font-medium text-gray-500">Description</td><td class="py-2 text-gray-900">
                            <span class="view-state view-state-description">${item.Description || ''}</span>
                            <textarea class="edit-state edit-state-description hidden w-full rounded-md border-gray-300 shadow-sm sm:text-sm" rows="3">${item.Description || ''}</textarea>
                        </td></tr>
                        <tr class="border-b"><td class="py-2 font-medium text-gray-500">Active</td><td class="py-2 text-gray-900">
                            <span class="view-state view-state-isactive">${item.IsActive ? 'Yes' : 'No'}</span>
                            <div class="edit-state hidden flex items-center">
                                <input type="checkbox" ${item.IsActive ? 'checked' : ''} class="edit-state-isactive h-4 w-4 rounded border-gray-300 text-indigo-600">
                                <label class="ml-2 block text-sm text-gray-900">Is Active</label>
                            </div>
                        </td></tr>
                    </tbody>
                </table>
            </div>

            <!-- RIGHT COLUMN -->
            <div>
                <table class="w-full text-sm mb-4">
                     <tbody>
                        <tr class="border-b"><td class="py-2 font-medium text-gray-500">Date Modified</td><td class="py-2 text-gray-900">${dateModified}</td></tr>
                    </tbody>
                </table>
                
            </div>
        </div>
        
        <!-- Action buttons remain the same -->
        <div class="mt-6 text-right">
            <div class="view-state">
                <button class="btn-edit inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">Edit</button>
            </div>
            <div class="edit-state hidden space-x-2">
                <button class="btn-cancel inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">Cancel</button>
                <button class="btn-save inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700">Save Changes</button>
            </div>
        </div>
    </div>
    `;
};

/**
* Renders a compact and functional set of pagination controls.
* Includes First, Previous, Next, Last buttons and a page input field.
*/
function renderPagination(containerId, totalItems, itemsPerPage, currentPage) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Pagination container with ID "${containerId}" not found.`);
        return;
    }

    const totalPages = Math.ceil(totalItems / itemsPerPage);
    container.innerHTML = ''; // Clear old controls

    if (totalPages <= 1) {
        return; // No need for pagination.
    }

    // --- Determine button states ---
    const isFirstPage = currentPage === 1;
    const isLastPage = currentPage === totalPages;
    const commonButtonClasses = "px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100";
    const disabledClasses = "opacity-50 cursor-not-allowed";

    // --- Build the HTML string ---
    let paginationHTML = `
        <div class="flex items-center gap-2">
            <!-- First Page Button -->
            <button data-page="1" 
                    class="${commonButtonClasses} ${isFirstPage ? disabledClasses : ''}" 
                    ${isFirstPage ? 'disabled' : ''}>
                First
            </button>
            <!-- Previous Page Button -->
            <button data-page="${currentPage - 1}" 
                    class="${commonButtonClasses} ${isFirstPage ? disabledClasses : ''}" 
                    ${isFirstPage ? 'disabled' : ''}>
                Previous
            </button>
        </div>

        <!-- Page number input and display -->
        <div class="flex items-center gap-2 text-sm text-gray-700">
            <span>Page</span>
            <input type="number" 
                   id="page-input" 
                   class="w-16 text-center border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" 
                   value="${currentPage}" 
                   min="1" 
                   max="${totalPages}" 
                   aria-label="Current page">
            <span>of ${totalPages}</span>
        </div>

        <div class="flex items-center gap-2">
            <!-- Next Page Button -->
            <button data-page="${currentPage + 1}" 
                    class="${commonButtonClasses} ${isLastPage ? disabledClasses : ''}" 
                    ${isLastPage ? 'disabled' : ''}>
                Next
            </button>
            <!-- Last Page Button -->
            <button data-page="${totalPages}" 
                    class="${commonButtonClasses} ${isLastPage ? disabledClasses : ''}" 
                    ${isLastPage ? 'disabled' : ''}>
                Last
            </button>
        </div>
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
        totalPages = Math.ceil(totalItems / rowsPerPage);
        
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
        renderTable(TABLE_CONTAINER_ID, tableConfig.headers, filteredData, {
            renderAccordionContent: renderAccordionDetails 
        });

        // Render pagination using the TOTAL item count from the API
        renderPagination('pagination-controls', totalItems, rowsPerPage, currentPage);

        // Update the total count display
        const metaDataCount = document.getElementById('metaDataCount');
        if(metaDataCount) {
            metaDataCount.textContent = totalItems;
        }

    } catch (error) {
        console.error("Failed to fetch or render page:", error);
        const container = document.getElementById(TABLE_CONTAINER_ID);
        container.innerHTML = `<div class="p-4 text-red-600">Error loading data: ${error.message}</div>`;
    }
}


function renderTable(containerId, headers, data, config = {}) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with ID "${containerId}" not found.`);
        return;
    }
    container.innerHTML = '';
    const table = document.createElement('table');
    table.className = 'w-full divide-y divide-gray-200';
    
    // ... (thead creation is the same) ...
    const thead = document.createElement('thead');
    thead.className = 'bg-gray-50';
    const headerRow = document.createElement('tr');
    headers.forEach(headerConfig => {
        const th = document.createElement('th');
        th.scope = 'col';
        let thClasses = 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ';
        if (headerConfig.widthClass) {
            thClasses += headerConfig.widthClass;
        }
        th.className = thClasses;
        th.textContent = headerConfig.label;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);


    const tbody = document.createElement('tbody');
    tbody.className = 'bg-white divide-y divide-gray-200';

    if (data.length === 0) {
        // ... (no data message is the same) ...
        const colSpan = headers.length || 1;
        tbody.innerHTML = `<tr><td colspan="${colSpan}" class="px-6 py-4 text-center text-sm text-gray-500">No data found.</td></tr>`;

    } else {
        data.forEach((item, index) => {
            const isAccordion = typeof config.renderAccordionContent === 'function';
            const triggerRow = document.createElement('tr');
            if (isAccordion) {
                triggerRow.className = 'accordion-trigger hover:bg-gray-50 cursor-pointer';
                // Use a more robust unique ID
                const accordionId = `accordion-content-${item.DataSourceID || index}`;
                triggerRow.dataset.target = `#${accordionId}`;
            }
            
            // ... (main row creation is the same) ...
            headers.forEach(headerConfig => {
                const td = document.createElement('td');
                let tdClasses = 'px-6 py-4 text-sm text-gray-800 ';
                if (headerConfig.className) {
                    tdClasses += headerConfig.className;
                } else {
                    tdClasses += 'whitespace-nowrap';
                }
                td.className = tdClasses;
                let cellContent;
                if (headerConfig.render) {
                    const value = headerConfig.key === 'actions' ? item : item[headerConfig.key];
                    cellContent = headerConfig.render(value);
                } else {
                    const value = item[headerConfig.key];
                    cellContent = value ?? 'N/A';
                }
                if (typeof cellContent === 'string' && cellContent.startsWith('<')) {
                    td.innerHTML = cellContent;
                } else {
                    td.textContent = cellContent;
                }
                triggerRow.appendChild(td);
            });
            tbody.appendChild(triggerRow);

            if (isAccordion) {
                const contentRow = document.createElement('tr');
                const accordionId = `accordion-content-${item.DataSourceID || index}`;
                contentRow.id = accordionId;
                contentRow.className = 'accordion-content hidden';
                
                const contentCell = document.createElement('td');
                contentCell.colSpan = headers.length;
                // The render function is called here with the full item, including 'Fields'
                contentCell.innerHTML = config.renderAccordionContent(item);
                
                contentRow.appendChild(contentCell);
                tbody.appendChild(contentRow);
            }
        });
    }
    table.appendChild(tbody);
    container.appendChild(table);

    // --- SIMPLIFIED Event Listener ---
    if (config.renderAccordionContent) {
        tbody.addEventListener('click', async (event) => {
            const trigger = event.target.closest('.accordion-trigger');
            const accordionBody = event.target.closest('.accordion-body');
            
            // --- Logic for Opening/Closing the Accordion ---
            if (trigger && !accordionBody) {
                event.preventDefault();
                const targetId = trigger.dataset.target;
                const contentRow = document.querySelector(targetId);
                if (contentRow) {
                    contentRow.classList.toggle('hidden');
                    trigger.classList.toggle('expanded');
                    const chevron = trigger.querySelector('.chevron-icon');
                    if (chevron) chevron.classList.toggle('rotate-180');
                }
                return;
            }

            // --- Logic for Edit/Save/Cancel Buttons (remains the same) ---
            const editButton = event.target.closest('.btn-edit');
            const saveButton = event.target.closest('.btn-save');
            const cancelButton = event.target.closest('.btn-cancel');
            
            if (!editButton && !saveButton && !cancelButton) return;
            event.stopPropagation();
            
            const parentAccordion = event.target.closest('.accordion-body');
            const toggleEditState = (isEditing) => {
                parentAccordion.querySelectorAll('.view-state').forEach(el => el.classList.toggle('hidden', isEditing));
                parentAccordion.querySelectorAll('.edit-state').forEach(el => el.classList.toggle('hidden', !isEditing));
            };
            
            if (editButton) toggleEditState(true);

            if (saveButton) {
                // Stop the click from propagating and closing the accordion
                event.stopPropagation();
                
                // Get the button that was clicked and its parent accordion
                const saveBtn = saveButton;
                const accordionBody = saveBtn.closest('.accordion-body');
                const metaDataId = accordionBody.dataset.id; // Using .dataset.id
             
                // Show a "saving..." state for better UX
                saveBtn.textContent = 'Saving...';
                saveBtn.disabled = true;

                try {
                    // --- 1. Gather Data from the Form ---
                    // Use document.querySelector to find elements within the accordionBody
                    const updatedName = accordionBody.querySelector('.edit-state-name').value;
                    const updatedDescription = accordionBody.querySelector('.edit-state-description').value;
                    const updatedIsActive = accordionBody.querySelector('.edit-state-isactive').checked;


                    // --- 2. Send Request to the Endpoint using fetch ---
                    const updateParams = {
                        "meta_data_id": metaDataId ,
                        "description":  updatedDescription,
                        "isActive":  updatedIsActive,
                        "name":  updatedName,
                    };
                    const updatedDataSource = await window.loomeApi.runApiRequest(27, updateParams);

                    // --- 3. Handle the Server's Response ---
                    if (!updatedDataSource) {
                        // Handle cases where the API might return an empty or null response on success
                        throw new Error("API call succeeded but returned no data.");
                    }
                    console.log(updatedDataSource)
                    showToast('Data Source edited successfully!');

                    // --- 4. Update the UI with the New Data ---
                    accordionBody.querySelector('.view-state-name').textContent = updatedDataSource.Name;
                    accordionBody.querySelector('.view-state-description').textContent = updatedDataSource.Description;
                    accordionBody.querySelector('.view-state-isactive').textContent = updatedDataSource.IsActive ? 'Yes' : 'No';


                    // Finally, switch back to view mode by calling your existing function
                    toggleEditState(false);

                } catch (error) {
                    console.error('Failed to save:', error);
                    showToast(`Error: ${error.message || 'Failed to save data.'}`, 'error');
                } finally {
                    // Reset the button back to its original state
                    saveBtn.textContent = 'Save Changes';
                    saveBtn.disabled = false;
                }
            }

            if (cancelButton) toggleEditState(false);
        });
    }
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


async function renderPlatformAdminMetaDataPage() {
    // --- 1. Define the table configuration ---
    // (Moved outside the try block so it's accessible to fetchAndRenderPage)
    const tableConfig = {
                headers: [
                    { label: "Name", key: "Name", widthClass: "w-4/12" },
                    { label: "Description", key: "Description", className: "break-words", widthClass: "w-6/12" },
                    {
                        label: "Active",
                        key: "IsActive",
                        render: (value) => value == 1 ? 'Yes' : 'No'
                    },
                    { key: 'Details', label: '', widthClass: 'w-12', 
                      render: () => `<div class="flex justify-end"><svg class="chevron-icon h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg></div>`
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

    paginationContainer.addEventListener('keydown', (event) => {
        // Only act if the user pressed Enter and the target is our input
        if (event.key === 'Enter' && event.target.id === 'page-input') {
            const inputElement = event.target;
            const newPage = parseInt(inputElement.value, 10);

            // Validate the input
            if (newPage >= 1 && newPage <= totalPages) {
                fetchAndRenderPage(tableConfig, newPage, searchInput.value);
            } else {
                // If invalid, show a message and reset the input to the current page
                alert(`Please enter a page number between 1 and ${totalPages}.`);
                inputElement.value = currentPage; 
            }
        }
    });

    

    const addMetaDataBtn = document.querySelector('#addMetaDataBtn');;
    if (addMetaDataBtn) {
        addMetaDataBtn.addEventListener('click', () => {
            AddMetadata();
        });
    }
    const saveButton = document.getElementById('modal-save-add-metadata-button');
    const handleSaveClick = async () => {
        // Get the modal instance at the time of clicking (not during page load)
        const modalInstance = bootstrap.Modal.getInstance(document.getElementById('addMetaDataModal'));
        
        const form = document.getElementById('addMetaDataForm');
        
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            console.log("Form is invalid. Aborting save.");
            return;
        }

        const payload = getMetaDataFormData(form);
        console.log("Data gathered from form:", payload);
        
        saveButton.disabled = true;
        saveButton.innerHTML = `
            <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            Saving...
        `;

        try {
            
            const response = await window.loomeApi.runApiRequest(26, payload);
            console.log("RESPONSE: ", response)
            
            showToast('Meta Data created successfully!');
            
            // This should now work!
            modalInstance.hide();
            
            // Optional: Refresh the table to show the new item
            await fetchAndRenderPage(tableConfig, 1, '');
            
        } catch (error) {
            console.error("API call failed:", error);
            showToast(`Error: ${error.message || 'Failed to save data.'}`, 'error');
        } finally {
            saveButton.disabled = false;
            saveButton.innerHTML = 'Save';
        }
    };

    // --- 6. Add the event listener ---
    // This tells the browser: "When a 'click' happens on 'saveButton', run the 'handleSaveClick' function."
    saveButton.addEventListener('click', handleSaveClick);
    

    // --- 3. Initial Page Load ---
    // Make the first call to fetch page 1 with no search term.
    await fetchAndRenderPage(tableConfig, 1, '');
}


renderPlatformAdminMetaDataPage()

