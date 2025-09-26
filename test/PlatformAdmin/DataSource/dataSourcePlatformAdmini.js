// Define the single container ID for the table
const TABLE_CONTAINER_ID = 'requests-table-area';
const API_DATASOURCE_ID = 5
// --- STATE MANAGEMENT ---
// These variables need to be accessible by multiple functions.
let currentPage = 1;
let rowsPerPage = 5; // Default, will be updated by API response
let totalPages = 1;
let tableConfig = {}; // Will hold your headers configuration
const searchInput = document.getElementById('searchRequests');

let dataSourceTypeMap = new Map();

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
 * Gathers all data from the "Add Data Source" modal form.
 * It handles both static fields and dynamically generated fields.
 *
 * @param {HTMLElement} formElement - The <form> element to read data from.
 * @returns {object | null} An object containing the structured form data, or null if the form is not found.
 */
function getDataSourceFormData(formElement) {
    if (!formElement) {
        console.error("Form element not provided to getDataSourceFormData.");
        return null;
    }

    // --- 1. Get values from the STATIC fields ---
    // We use .value for text inputs/textareas and .checked for checkboxes.
    const name = formElement.querySelector('#dataSourceName').value;
    const description = formElement.querySelector('#dataSourceDescription').value;
    const isActive = formElement.querySelector('#dataSourceActive').checked;
    
    // For the <select>, we get the value of the selected <option>.
    const dataSourceTypeID = formElement.querySelector('#dataSourceType').value;

    // --- 2. Get values from the DYNAMICALLY generated fields ---
    // Initialize an empty object to hold the key-value pairs.
    const fields = {};

    // Find the input with the class 'dynamic-field'.
    const dynamicFieldInput = formElement.querySelector('.dynamic-field');
    const fieldName = dynamicFieldInput.name;
    const fieldValue = dynamicFieldInput.value;


    // --- 3. Combine everything into a final payload object ---
    // This structure is designed to match your Pydantic "Create" model.
    const formData = {
        "name": name,
        "description": description,
        "isActive": isActive,
        "dataSourceTypeID": dataSourceTypeID,//parseInt(dataSourceTypeID, 10), // Convert the string value to an integer
        "fieldName": fieldName,
        "fieldValue": fieldValue
    };

    return formData;
}

function AddDataSource(typeNamesList, allFields) {
    // Get the modal's body element
    const modalBody = document.getElementById('addDatasourceModalBody');
    console.log("IN add data source")

    // This can now support multiple fields per type if needed.
    const typeIdToFieldIdMap = {
        1: [1], // 3], // Database type -> "Database Connection" and "Table Name"
        2: [4],// 5], // REDCap API type -> "API URL" and "API Key"
        3: [2]     // Folder type -> "UNC Path"
    };

    // Generate the HTML string for the <option> elements.
    // We use map() to transform each name in the list into an <option> tag.
    // The `index` is used to create a simple value (1, 2, 3, etc.).
    const optionsHtml = typeNamesList.map((typeName, index) => {
        // In a real app, you'd likely use an ID from your data source type object
        // for the value, but index + 1 works for this example.
        return `<option value="${index + 1}">${typeName}</option>`;
    }).join(''); // .join('') concatenates all the strings in the array into one big string.


    // Populate the modal body with the provided HTML content (your markup)
    modalBody.innerHTML = `
                <form id="addDataSourceForm">
                  <div class="mb-3">
                    <label for="dataSourceName" class="form-label">Name</label>
                    <input type="text" class="form-control" id="dataSourceName" placeholder="Name for this Data Source" required>
                  </div>
                  
                  <div class="mb-3">
                    <label for="dataSourceDescription" class="form-label">Description</label>
                    <textarea class="form-control" id="dataSourceDescription" rows="2" placeholder="Description of this Data Source"></textarea>
                  </div>

                  <div class="mb-3">
                      <label for="dataSourceType" class="form-label">Data Source Type</label>
                      <select class="form-select" id="dataSourceType" required>
                          <option value="" selected disabled>Select a Type...</option>
                          ${optionsHtml}
                      </select>
                  </div>

                  <div class="form-check mb-3">
                    <input class="form-check-input" type="checkbox" value="" id="dataSourceActive" checked>
                    <label class="form-check-label" for="dataSourceActive">Active</label>
                  </div>

                  <hr>
                  
                  <h6 class="mb-3">Data Source Fields</h6>
                  <div id="dataSourceFieldsContainer">
                    <p class="text-muted">Please select a Data Source Type to see the required fields.</p>
                  </div>
                </form>
              </div>
              
            
            
    `;

    // --- 4. FIND the elements we need to work with ---
    const typeSelect = modalBody.querySelector('#dataSourceType');
    const fieldsContainer = modalBody.querySelector('#dataSourceFieldsContainer');

    // --- 5. CREATE the event handler function ---
    const handleTypeChange = (event) => {
        const selectedTypeId = event.target.value;

        // Get the list of required FieldIDs for this type from our map
        const requiredFieldIds = typeIdToFieldIdMap[selectedTypeId] || [];

        if (requiredFieldIds.length > 0) {
            // Find the full field objects that match the required IDs
            const fieldsToRender = allFields.filter(field => requiredFieldIds.includes(field.FieldID));
            
            // Generate the HTML for the table rows
            const fieldRowsHtml = fieldsToRender.map(field => `
                <tr>
                    <td>${field.Name}</td>
                    <td>
                        <input type="text" 
                               class="form-control form-control-sm dynamic-field" 
                               data-field-id="${field.FieldID}"
                               name="${field.Name}" 
                               placeholder="Enter value for ${field.Name}">
                    </td>
                </tr>
            `).join('');

            // Inject the full table structure into the container
            fieldsContainer.innerHTML = `
                <table class="table table-sm table-bordered">
                    <thead class="table-light">
                        <tr>
                            <th style="width: 40%;">Name</th>
                            <th>Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${fieldRowsHtml}
                    </tbody>
                </table>
            `;
        } else {
            // If no fields are required, show the placeholder text
            fieldsContainer.innerHTML = '<p class="text-muted">Please select a Data Source Type to see the required fields.</p>';
        }
    };

    // --- 6. ATTACH the event listener to the dropdown ---
    typeSelect.addEventListener('change', handleTypeChange);

    // --- 7. Listener for Adding a Data Source
    // First, get a reference to the modal and the save button
    // const saveButton = document.getElementById('modal-save-add-datasrc-button');

    // // Make sure both elements were found before adding a listener
    // if (saveButton) {

    //     // Define the function that will run when "Save" is clicked
    //     const handleSaveClick = async () => {
    //         // Find the form in the modal.
    //         const form = document.getElementById('addDataSourceForm'); // Give your form an ID

    //         // --- VALIDATION (from previous example) ---
    //         if (!form.checkValidity()) {
    //             form.classList.add('was-validated');
    //             console.log("Form is invalid. Aborting save.");
    //             return;
    //         }

    //         // --- GATHER DATA using our new function ---
    //         const payload = getDataSourceFormData(form);

    //         console.log("Data gathered from form:", payload);

    //         saveButton.disabled = true;
    //         saveButton.innerHTML = `
    //             <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
    //             Saving...
    //         `;

    //         // --- Now, you can SEND this payload to your backend API ---
    //         try {
            
    //             const response = await window.loomeApi.runApiRequest(22, payload);
            
    //             showToast('Data Source created successfully!');

    //         } catch (error) {
    //             console.error("API call failed:", error);
    //             showToast(`Error: ${error.message || 'Failed to save data.'}`, 'error');
    //         } finally {
    //             // --- UX IMPROVEMENT: Always reset the button state ---
    //             // This runs whether the API call succeeded or failed.
    //             saveButton.disabled = false;
    //             saveButton.innerHTML = 'Save';

                          
    //         }
    //     };

    //     // --- 6. Add the event listener ---
    //     // This tells the browser: "When a 'click' happens on 'saveButton', run the 'handleSaveClick' function."
    //     saveButton.addEventListener('click', handleSaveClick);

    // } else {
    //     console.error("Could not find the modal or the save button to attach the event listener.");
    // }
    
    // Wait for the HTML document to be fully loaded and parsed
    document.addEventListener('DOMContentLoaded', () => {
        // All of your original code goes inside here
        const saveButton = document.getElementById('modal-save-add-datasrc-button');
        const modalElement = document.getElementById('addDataSourceModal'); // Make sure your modal has this ID
    
        if (saveButton && modalElement) {
            // This 'if' block will now execute successfully
            console.log("Successfully found modal and save button. Attaching listener.");
    
            const modalInstance = new bootstrap.Modal(modalElement);
    
            const handleSaveClick = async () => {
                const form = document.getElementById('addDataSourceForm');
    
                if (!form.checkValidity()) {
                    form.classList.add('was-validated');
                    return;
                }
    
                const payload = getDataSourceFormData(form);
                saveButton.disabled = true;
                saveButton.innerHTML = `
                    <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    Saving...
                `;
    
                try {
                    const response = await window.loomeApi.runApiRequest(22, payload);
                    showToast('Data Source created successfully!');
                    modalInstance.hide(); // Close the modal on success
                    form.reset();
                    form.classList.remove('was-validated');
                } catch (error) {
                    console.error("API call failed:", error);
                    showToast(`Error: ${error.message || 'Failed to save data.'}`, 'error');
                } finally {
                    saveButton.disabled = false;
                    saveButton.innerHTML = 'Save';
                }
            };
    
            saveButton.addEventListener('click', handleSaveClick);
        } else {
            // This will help you debug if one of the elements is still not found
            console.error("Could not find the modal or the save button. Check IDs.");
            console.log("saveButton:", saveButton); // Will print the element or null
            console.log("modalElement:", modalElement); // Will print the element or null
        }
    });
}

/**
 * Fetches ALL DataSourceTypes from the paginated API.
 * This is a self-contained function that returns the results.
 * @param {number} [pageSize=100] - The number of items per page.
 * @returns {Promise<Array>} A promise that resolves to an array of all data source types.
 */
async function getAllDataSourceTypes(pageSize = 100) {
    const DATASOURCETYPE_API_ID = 13;
    let allResults = []; // Use a local variable to store results

    try {
        // --- 1. Initial request ---
        const initialParams = { "page": 1, "pageSize": pageSize, "search": '' };
        const initialResponse = await window.loomeApi.runApiRequest(DATASOURCETYPE_API_ID, initialParams);
        const parsedInitial = safeParseJson(initialResponse);

        if (!parsedInitial || parsedInitial.RowCount === 0) {
            console.log("No data source types found.");
            return []; // Return an empty array if there's no data
        }

        allResults = parsedInitial.Results;
        const totalPages = parsedInitial.PageCount;

        // If only one page, we're done
        if (totalPages <= 1) {
            return allResults;
        }

        // --- 2. Loop for remaining pages ---
        for (let page = 2; page <= totalPages; page++) {
            console.log(`Fetching page ${page} of ${totalPages}...`);
            const params = { "page": page, "pageSize": pageSize, "search": '' };
            // FIXED BUG: Use the correct API ID in the loop
            const response = await window.loomeApi.runApiRequest(DATASOURCETYPE_API_ID, params);
            const parsed = safeParseJson(response);
            if (parsed && parsed.Results) {
                allResults = allResults.concat(parsed.Results);
            }
        }
        
        console.log(`Successfully fetched a total of ${allResults.length} data source types.`);
        return allResults;

    } catch (error) {
        console.error("An error occurred while fetching data source types:", error);
        return []; // Return empty array on failure
    }
}

/**
 * Fetches all data source types and creates a lookup map.
 * @returns {Promise<Map<number, string>>} A promise that resolves to a Map where the
 *          key is the DataSourceTypeIID and the value is the Name.
 */
async function createDataSourceTypeMap(allTypesArray) {

    if (!allTypesArray || allTypesArray.length === 0) {
        return new Map(); // Return an empty map if no data
    }

    // 2. Use reduce() to transform the array into a Map
    const typeMap = allTypesArray.reduce((map, item) => {
        // For each item in the array, add an entry to our map
        // The key is item.DataSourceTypeIID, the value is item.Name
        if (item.DataSourceTypeID && item.Name) {
            map.set(item.DataSourceTypeID, item.Name);
        }
        return map; // Return the map for the next iteration
    }, new Map()); // The 'new Map()' is the initial value for our accumulator

    return typeMap;
}

/**
 * A generic helper function to make API requests using window.loomeApi.
 * It handles the try/catch block, API call, and JSON parsing.
 *
 * @param {number} apiId - The ID of the API endpoint to call.
 * @param {object} [params={}] - The parameters object to send with the request.
 * @param {string} [context='data'] - A descriptive string for logging errors, e.g., "data source types".
 * @returns {Promise<object|Array|null>} A promise that resolves to the parsed JSON response, or null on failure.
 */
async function fetchApiData(apiId, params = {}, context = 'data') {
    try {
        const response = await window.loomeApi.runApiRequest(apiId, params);
        const parsedResponse = safeParseJson(response);
        
        // It's good practice to check if the parsing itself failed
        if (parsedResponse === null) {
            console.error(`Failed to parse JSON response when fetching ${context}.`);
            return null;
        }
        
        return parsedResponse;
    } catch (error) {
        console.error(`An error occurred while fetching ${context}:`, error);
        return null; // Return null to clearly indicate that the request failed
    }
}



/**
 * Fetches a specific field value by its own ID.
 * @param {number} fieldID - The ID of the field.
 * @returns {Promise<object|null>} A promise resolving to a single field value object, or null on failure.
 */
async function getAllFields(fieldID) {
    const DATASOURCEFIELDVALUE_API_ID = 19;

    // Call the generic helper
    return fetchApiData(DATASOURCEFIELDVALUE_API_ID, {});
}

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
        const response = await window.loomeApi.runApiRequest(API_DATASOURCE_ID, apiParams);

        
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
        const dataSourceCount = document.getElementById('dataSourceCount');
        if(dataSourceCount) {
            dataSourceCount.textContent = totalItems;
        }

    } catch (error) {
        console.error("Failed to fetch or render page:", error);
        const container = document.getElementById(TABLE_CONTAINER_ID);
        container.innerHTML = `<div class="p-4 text-red-600">Error loading data: ${error.message}</div>`;
    }
}



const renderAccordionDetails = (item) => {
    const dataSourceType = dataSourceTypeMap.get(item.DataSourceTypeID);
    const dateModified = formatDate(item.ModifiedDate);
    const dateRefreshed = formatDate(item.RefreshedDate);

    // --- NEW: Logic to build the fields table HTML ---
    let fieldsTableHtml = '';
    // Check if item.Fields exists and is not an empty object
    if (item.Fields && Object.keys(item.Fields).length > 0) {
        // Use Object.entries to iterate over key-value pairs
        const fieldRows = Object.entries(item.Fields).map(([key, value]) => `
            <tr>
                <td class="p-2 border-t">${key}</td>
                <td class="p-2 border-t">
                    <span class="view-state view-state-field" data-field-name="${key}">${value || ''}</span>
                    <input type="text" value="${value || ''}" class="edit-state edit-state-field hidden w-full rounded-md border-gray-300 shadow-sm sm:text-sm" data-field-name="${key}">
                </td>
            </tr>
        `).join(''); // Join the array of HTML strings into one string

        fieldsTableHtml = `
            <table class="w-full text-sm bg-white rounded shadow-sm">
                <thead class="bg-gray-100">
                    <tr>
                        <th class="p-2 text-left font-medium text-gray-500 w-1/3">Name</th>
                        <th class="p-2 text-left font-medium text-gray-500">Value</th>
                    </tr>
                </thead>
                <tbody>
                    ${fieldRows}
                </tbody>
            </table>
        `;
    } else {
        fieldsTableHtml = `<div class="text-center text-sm text-gray-500 p-4">No data source fields found.</div>`;
    }
    // --- END of new logic ---

    return `
    <div class="accordion-body bg-slate-50 p-6" data-id="${item.DataSourceID}">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-12">
            <!-- LEFT COLUMN: Remains the same -->
            <div>
                 <table class="w-full text-sm">
                    <tbody>
                        <tr class="border-b"><td class="py-2 font-medium text-gray-500 w-1/3">ID</td><td class="py-2 text-gray-900">${item.DataSourceID}</td></tr>
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
                        <tr class="border-b"><td class="py-2 font-medium text-gray-500 w-1/3">Type</td><td class="py-2 text-gray-900">${dataSourceType || 'N/A'}</td></tr>
                        <tr class="border-b"><td class="py-2 font-medium text-gray-500">Date Modified</td><td class="py-2 text-gray-900">${dateModified}</td></tr>
                        <tr class="border-b"><td class="py-2 font-medium text-gray-500">Date Refreshed</td><td class="py-2 text-gray-900">${dateRefreshed}</td></tr>
                    </tbody>
                </table>
                <h4 class="text-sm font-semibold text-gray-600 mt-6 mb-2">Data Source Fields</h4>
                
                <!-- The placeholder is GONE, replaced by the generated HTML -->
                <div class="data-source-fields-container">
                    ${fieldsTableHtml}
                </div>
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


// This is the simplified renderTable function.
// All the async logic in the event listener has been removed.

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
                const dataSourceId = accordionBody.dataset.id; // Using .dataset.id

                // Show a "saving..." state for better UX
                saveBtn.textContent = 'Saving...';
                saveBtn.disabled = true;

                try {
                    // --- 1. Gather Data from the Form ---
                    // Use document.querySelector to find elements within the accordionBody
                    const updatedName = accordionBody.querySelector('.edit-state-name').value;
                    const updatedDescription = accordionBody.querySelector('.edit-state-description').value;
                    const updatedIsActive = accordionBody.querySelector('.edit-state-isactive').checked;

                    // Gather all dynamic field values into a dictionary
                    //const updatedFields = {};
                    const dynamicFieldInput = accordionBody.querySelector('.edit-state-field');
                    const fieldName = dynamicFieldInput.dataset.fieldName;
                    const fieldValue = dynamicFieldInput.value;
                    // accordionBody.querySelectorAll('.edit-state-field').forEach(input => {
                    //     const fieldName = input.dataset.fieldName; // using .dataset
                    //     const fieldValue = input.value;
                    //     updatedFields[fieldName] = fieldValue;
                    // });

                    // --- 2. Send Request to the Endpoint using fetch ---
                    const updateParams = {
                        "data_source_id": dataSourceId ,
                        "description":  updatedDescription,
                        "isActive":  updatedIsActive,
                        "name":  updatedName,
                        "fieldName": fieldName,
                        "fieldValue": fieldValue
                    };
                    const updatedDataSource = await window.loomeApi.runApiRequest(21, updateParams);

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

                    // Update the dynamic fields
                    for (const [fieldName, fieldValue] of Object.entries(updatedDataSource.Fields)) {
                        const fieldSpan = accordionBody.querySelector(`.view-state-field[data-field-name="${fieldName}"]`);
                        if (fieldSpan) {
                            fieldSpan.textContent = fieldValue;
                        }
                    }

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
    renderTable(tableContainerId, config.headers, paginatedData, {
        renderAccordionContent: renderAccordionDetails 
    });
    
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


async function renderPlatformAdminDataSourcePage() {
    // --- 1. Define the table configuration ---
    // (Moved outside the try block so it's accessible to fetchAndRenderPage)
    // 1. Await the results from your fetching function
    const allTypesArray = await getAllDataSourceTypes();
    dataSourceTypeMap = await createDataSourceTypeMap(allTypesArray);

    const typeNamesList = allTypesArray.map(item => item.Name);

    const fields = await getAllFields();
    console.log('Fields:');
    console.log(fields);

    const tableConfig = {
                headers: [
                    { label: "Type", key: "DataSourceTypeID", className: "break-words", widthClass: "w-1/12", 
                        render: (value) => dataSourceTypeMap.get(value)
                        
                    },
                    { label: "Name", key: "Name", className: "break-words", widthClass: "w-3/12" },
                    { label: "Description", key: "Description", className: "break-words", widthClass: "w-6/12" },
                    { label: "Refreshed Date", key: "RefreshedDate", render: (value) => formatDate(value) },
                    {
                        label: "Active",
                        key: "IsActive",
                        render: (value) => value ? 'Yes' : 'No'
                    },
                    { key: 'Details', label: '', widthClass: 'w-12', 
                      render: () => `<div class="flex justify-end"><svg class="chevron-icon h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg></div>`
                    }
                    
                    
                ]
            };
        

    // --- 2. Set up Event Listeners ---
    const searchInput = document.getElementById('searchRequests');
    const paginationContainer = document.getElementById('pagination-controls');

    // The search input now calls fetchAndRenderPage
    searchInput.addEventListener('input', () => {
        fetchAndRenderPage(tableConfig, 1, searchInput.value);
    });

    // Your existing click listener for pagination buttons
    paginationContainer.addEventListener('click', (event) => {
        const button = event.target.closest('button[data-page]');
        if (!button || button.disabled) return;
        
        const newPage = parseInt(button.dataset.page, 10);
        fetchAndRenderPage(tableConfig, newPage, searchInput.value);
    });

    // --- ADD THIS NEW LISTENER for the page input box ---
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

    // paginationContainer.addEventListener('click', (event) => {
    //     const button = event.target.closest('button[data-page]');
    //     if (!button || button.disabled) {
    //         return;
    //     }
    //     const newPage = parseInt(button.dataset.page, 10);
    //     console.log('newPage')
    //     console.log(newPage)
    //     // Fetch the new page, preserving the current search term
    //     fetchAndRenderPage(tableConfig, newPage, searchInput.value);
    // });

    const addDataSrcButton = document.querySelector('#addDatasourceBtn');;
    if (addDataSrcButton) {
        addDataSrcButton.addEventListener('click', () => {
            AddDataSource(typeNamesList, fields);
        });
    }

    // --- 3. Initial Page Load ---
    // Make the first call to fetch page 1 with no search term.
    await fetchAndRenderPage(tableConfig, 1, '');
}


renderPlatformAdminDataSourcePage()
