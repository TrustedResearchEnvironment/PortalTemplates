// Define the single container ID for the table
const TABLE_CONTAINER_ID = 'requests-table-area';
const API_DATASRCTYPES_ID = 13;

// --- STATE MANAGEMENT ---
// These variables need to be accessible by multiple functions.
let currentPage = 1;
let rowsPerPage = 5; // Default, will be updated by API response
let tableConfig = {}; // Will hold your headers configuration
const searchInput = document.getElementById('searchRequests');


function AddDataSrcType() {
    // Get the modal's body element
    const modalBody = document.getElementById('addDataSrcTypeModalBody');
    console.log("IN add datasrctype")

    // Populate the modal body with the provided HTML content (your markup)
    modalBody.innerHTML = `
                <form id="addDataSrcTypeForm">
                        <!-- Name Field -->
                        <div class="mb-3">
                            <label for="Name" class="form-label">Name</label>
                            <input id="dataSrcTypeName" placeholder="Name for this Meta Data" class="form-control">
                        </div>

                        <!-- Description Field -->
                        <div class="mb-3">
                            <label for="Description" class="form-label">Description</label>
                            <textarea rows="2" id="dataSrcTypeDescription" placeholder="Description of this Meta Data" class="form-control"></textarea>
                        </div>

                        <!-- Active Checkbox -->
                        <div class="mb-3 form-check">
                            <input type="checkbox" id="dataSrcTypeActive" class="form-check-input" checked>
                            <label class="form-check-label" for="dataSrcTypeActive">Active</label>
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
function getDataSrcTypeFormData(formElement) {
    if (!formElement) {
        console.error("Form element not provided to getDataSrcTypeFormData.");
        return null;
    }

    // --- 1. Get values from the STATIC fields ---
    // We use .value for text inputs/textareas and .checked for checkboxes.
    const name = formElement.querySelector('#dataSrcTypeName').value;
    const description = formElement.querySelector('#dataSrcTypeDescription').value;
    const isActive = formElement.querySelector('#dataSrcTypeActive').checked;

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
    <div class="accordion-body bg-slate-50 p-6" data-id="${item.DataSourceTypeID}">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-12">
            <!-- LEFT COLUMN: Remains the same -->
            <div>
                 <table class="w-full text-sm">
                    <tbody>
                        <tr class="border-b"><td class="py-2 font-medium text-gray-500 w-1/3">ID</td><td class="py-2 text-gray-900">${item.DataSourceTypeID}</td></tr>
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
        
        <!-- ACTION BUTTONS -->
    </div>
    `;
};

// <!-- Action buttons remain the same -->
//         <div class="mt-6 text-right">
//             <div class="view-state">
//                 <button class="btn-edit inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">Edit</button>
//             </div>
//             <div class="edit-state hidden space-x-2">
//                 <button class="btn-cancel inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">Cancel</button>
//                 <button class="btn-save inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700">Save Changes</button>
//             </div>
//         </div>

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
async function fetchAndRenderPage(page, searchTerm = '') {
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
        const response = await window.loomeApi.runApiRequest(API_DATASRCTYPES_ID, apiParams);

        
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
        console.log("before renderTable headers: ",tableConfig.headers)
        renderTable(TABLE_CONTAINER_ID, tableConfig.headers, filteredData);
        // renderTable(TABLE_CONTAINER_ID, tableConfig.headers, filteredData, {
        //     renderAccordionContent: renderAccordionDetails 
        // });

        // Render pagination using the TOTAL item count from the API
        renderPagination('pagination-controls', totalItems, rowsPerPage, currentPage);

        // Update the total count display
        const dataSourceCount = document.getElementById('dataSourceTypesCount');
        if(dataSourceCount) {
            dataSourceCount.textContent = totalItems;
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
    console.log("headers forEach: ",headers)
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

    console.log("data forEach: ",data)
    if (data.length === 0) {
        // ... (no data message is the same) ...
        const colSpan = headers.length || 1;
        tbody.innerHTML = `<tr><td colspan="${colSpan}" class="px-6 py-4 text-center text-sm text-gray-500">No data found.</td></tr>`;

    } else {
        data.forEach((item, index) => {
            //const isAccordion = typeof config.renderAccordionContent === 'function';
            const triggerRow = document.createElement('tr');
            // if (isAccordion) {
            //     triggerRow.className = 'accordion-trigger hover:bg-gray-50 cursor-pointer';
            //     // Use a more robust unique ID
            //     const accordionId = `accordion-content-${item.DataSourceID || index}`;
            //     triggerRow.dataset.target = `#${accordionId}`;
            // }
            
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

            // if (isAccordion) {
            //     const contentRow = document.createElement('tr');
            //     const accordionId = `accordion-content-${item.DataSourceID || index}`;
            //     contentRow.id = accordionId;
            //     contentRow.className = 'accordion-content hidden';
                
            //     const contentCell = document.createElement('td');
            //     contentCell.colSpan = headers.length;
            //     // The render function is called here with the full item, including 'Fields'
            //     contentCell.innerHTML = config.renderAccordionContent(item);
                
            //     contentRow.appendChild(contentCell);
            //     tbody.appendChild(contentRow);
            // }
        });
    }
    table.appendChild(tbody);
    container.appendChild(table);

    // --- SIMPLIFIED Event Listener ---
    // if (config.renderAccordionContent) {
    //     tbody.addEventListener('click', async (event) => {
    //         const trigger = event.target.closest('.accordion-trigger');
    //         const accordionBody = event.target.closest('.accordion-body');
            
    //         // --- Logic for Opening/Closing the Accordion ---
    //         if (trigger && !accordionBody) {
    //             event.preventDefault();
    //             const targetId = trigger.dataset.target;
    //             const contentRow = document.querySelector(targetId);
    //             if (contentRow) {
    //                 contentRow.classList.toggle('hidden');
    //                 trigger.classList.toggle('expanded');
    //                 const chevron = trigger.querySelector('.chevron-icon');
    //                 if (chevron) chevron.classList.toggle('rotate-180');
    //             }
    //             return;
    //         }

    //         // --- Logic for Edit/Save/Cancel Buttons (remains the same) ---
    //         const editButton = event.target.closest('.btn-edit');
    //         const saveButton = event.target.closest('.btn-save');
    //         const cancelButton = event.target.closest('.btn-cancel');
            
    //         if (!editButton && !saveButton && !cancelButton) return;
    //         event.stopPropagation();
            
    //         const parentAccordion = event.target.closest('.accordion-body');
    //         const toggleEditState = (isEditing) => {
    //             parentAccordion.querySelectorAll('.view-state').forEach(el => el.classList.toggle('hidden', isEditing));
    //             parentAccordion.querySelectorAll('.edit-state').forEach(el => el.classList.toggle('hidden', !isEditing));
    //         };
            
    //         if (editButton) toggleEditState(true);

    //         if (saveButton) {
    //             // Stop the click from propagating and closing the accordion
    //             event.stopPropagation();
                
    //             // Get the button that was clicked and its parent accordion
    //             const saveBtn = saveButton;
    //             const accordionBody = saveBtn.closest('.accordion-body');
    //             const metaDataId = accordionBody.dataset.id; // Using .dataset.id
             
    //             // Show a "saving..." state for better UX
    //             saveBtn.textContent = 'Saving...';
    //             saveBtn.disabled = true;

    //             try {
    //                 // --- 1. Gather Data from the Form ---
    //                 // Use document.querySelector to find elements within the accordionBody
    //                 const updatedName = accordionBody.querySelector('.edit-state-name').value;
    //                 const updatedDescription = accordionBody.querySelector('.edit-state-description').value;
    //                 const updatedIsActive = accordionBody.querySelector('.edit-state-isactive').checked;


    //                 // --- 2. Send Request to the Endpoint using fetch ---
    //                 const updateParams = {
    //                     "meta_data_id": metaDataId ,
    //                     "description":  updatedDescription,
    //                     "isActive":  updatedIsActive,
    //                     "name":  updatedName,
    //                 };
    //                 const updatedDataSource = await window.loomeApi.runApiRequest(27, updateParams);

    //                 // --- 3. Handle the Server's Response ---
    //                 if (!updatedDataSource) {
    //                     // Handle cases where the API might return an empty or null response on success
    //                     throw new Error("API call succeeded but returned no data.");
    //                 }
    //                 console.log(updatedDataSource)
    //                 showToast('Data Source edited successfully!');

    //                 // --- 4. Update the UI with the New Data ---
    //                 accordionBody.querySelector('.view-state-name').textContent = updatedDataSource.Name;
    //                 accordionBody.querySelector('.view-state-description').textContent = updatedDataSource.Description;
    //                 accordionBody.querySelector('.view-state-isactive').textContent = updatedDataSource.IsActive ? 'Yes' : 'No';


    //                 // Finally, switch back to view mode by calling your existing function
    //                 toggleEditState(false);

    //             } catch (error) {
    //                 console.error('Failed to save:', error);
    //                 showToast(`Error: ${error.message || 'Failed to save data.'}`, 'error');
    //             } finally {
    //                 // Reset the button back to its original state
    //                 saveBtn.textContent = 'Save Changes';
    //                 saveBtn.disabled = false;
    //             }
    //         }

    //         if (cancelButton) toggleEditState(false);
    //     });
    // }
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

async function renderPlatformAdminDataSourceTypesPage() {
    
    try {
        
        // Place this inside renderPlatformAdminPage, replacing your old 'headers' object.
        tableConfig = {
                headers: [
                    { label: "Name", key: "Name", widthClass: "w-4/12" },
                    { label: "Description", key: "Description", className: "break-words", widthClass: "w-4/12" },
                    {
                        label: "Active",
                        key: "IsActive",
                        render: (value) => value == 1 ? 'Yes' : 'No'
                    }, {
                        label: "Date Modified",
                        key: "ModifiedDate",
                        render: (value) => formatDate(value)
                    }
                    // { key: 'Details', label: '', widthClass: 'w-12', 
                    //   render: () => `<div class="flex justify-end"><svg class="chevron-icon h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg></div>`
                    // }
                    // {
                    //     label: "Actions",
                    //     key: "actions",
                    //     render: (item) => `<button data-id="${item.DataSourceTypeID}" class="text-indigo-600 hover:text-indigo-900 font-medium">Edit</button>`
                    // }
                ]
            };
        
        
        // --- SEARCH EVENT LISTENER ---
        searchInput.addEventListener('input', () => {
            // When a new search is performed, always go back to page 1
            fetchAndRenderPage(1, searchInput.value);
        });
        
        // --- NEW PAGINATION EVENT LISTENER (EVENT DELEGATION) ---
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
            fetchAndRenderPage(newPage, searchInput.value);
        });

        paginationContainer.addEventListener('keydown', (event) => {
            // Only act if the user pressed Enter and the target is our input
            if (event.key === 'Enter' && event.target.id === 'page-input') {
                const inputElement = event.target;
                const newPage = parseInt(inputElement.value, 10);

                // Validate the input
                if (newPage >= 1 && newPage <= totalPages) {
                    fetchAndRenderPage(newPage, searchInput.value);
                } else {
                    // If invalid, show a message and reset the input to the current page
                    alert(`Please enter a page number between 1 and ${totalPages}.`);
                    inputElement.value = currentPage; 
                }
            }
        });

        const addDataSrcTypeBtn = document.querySelector('#addDataSrcTypeBtn');;
        if (addDataSrcTypeBtn) {
            addDataSrcTypeBtn.addEventListener('click', () => {
                AddDataSrcType();
            });
        }
        const saveButton = document.getElementById('modal-save-add-datasrctype-button');
        const handleSaveClick = async () => {
            // Get the modal instance at the time of clicking (not during page load)
            const modalInstance = bootstrap.Modal.getInstance(document.getElementById('addDataSrcTypeModal'));
            
            const form = document.getElementById('addDataSrcTypeForm');
            
            if (!form.checkValidity()) {
                form.classList.add('was-validated');
                console.log("Form is invalid. Aborting save.");
                return;
            }

            const payload = getDataSrcTypeFormData(form);
            console.log("Data gathered from form:", payload);
            
            saveButton.disabled = true;
            saveButton.innerHTML = `
                <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Saving...
            `;

            try {
                
                const response = await window.loomeApi.runApiRequest(26, payload);
                console.log("RESPONSE: ", response)
                
                showToast('Data Source Type created successfully!');
                
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
        console.log("Initial fetchAndRenderPage call: ", tableConfig)
        await fetchAndRenderPage(1, '');
            
        
    } catch (error) {
        console.error("Error setting up the page:", error);
    
        // Get the error message from the error object
        const errorMessage = error.message; 
        
        const container = document.getElementById(TABLE_CONTAINER_ID);
        
        // Display the specific error message in the UI
        container.innerHTML = `
            <div class="alert alert-danger" role="alert">
                <strong>An error occurred:</strong> ${errorMessage}
            </div>
        `;
    }

    
}

renderPlatformAdminDataSourceTypesPage()
