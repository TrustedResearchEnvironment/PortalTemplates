
function ViewDictionary() {
    // Get the modal's body element
    const modalBody = document.getElementById('viewDictionaryModalBody');

    // Populate the modal body with the provided HTML content (your markup)
    modalBody.innerHTML = `
         <div>

        <!-- Filter Input -->
        <div class="row">
            <div class="input-group mb-3">
                <input class="form-control" type="text" placeholder="Filter Dictionary">
                <div class="input-group-append">
                    <button class="btn btn-outline-secondary" type="button">Clear</button>
                </div>
            </div>
        </div>

        <hr>

        <!-- Table Section -->
        <div style="overflow-y: auto;">
            <h6>Columns</h6>
            <div class="table-responsive">
                <table class="table table-condensed table-striped data-set-table">
                    <thead>
                        <tr>
                            <th>Column Name</th>
                            <th>Column Type</th>
                            <th>Logical Column Name</th>
                            <th>Business Description</th>
                            <th>Example Value</th>
                            <th>Redacted</th>
                            <th>De-identified</th>
                            <th>Can be Filtered</th>
                        </tr>
                    </thead>
                    <tbody>
                        <!-- Dynamic rows go here -->
                        <tr>
                            <td>Sample Column</td>
                            <td>text</td>
                            <td>Logical Name</td>
                            <td>Short description of the column</td>
                            <td>Example Value</td>
                            <td>False</td>
                            <td>True</td>
                            <td>False</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    `;

}

function CreateRequest() {
    // Get the modal's body element
    const modalBody = document.getElementById('requestDatasetModalBody');

    // Populate the modal body with the provided HTML content (your markup)
    modalBody.innerHTML = `
                <div class="col-md-12">
                    <form>
                        <!-- Request Name Field -->
                        <div class="form-group">
                            <label for="RequestName" class="control-label">Request Name</label>
                            <input id="RequestName" class="form-control" placeholder="Name for this request">
                        </div>

                        <!-- Assist Project Field -->
                        <div class="form-group" >
                                <label for="ProjectID" class="control-label">Assist Project</label>
                                <select id="ProjectID" class="form-select">
                                    <option value="-1">Select a Project</option>
                                    <option value="82">Project 1</option>
                                    <option value="84">Project 2</option>
                                    <option value="85">Project 3</option>
                                    <option value="86">Project 4</option>
                                </select>
                                <div class="validation-message"></div>
                        </div>
                        

                        <!-- Scheduled Refresh Field -->
                        <div class="form-group">
                            <label for="ScheduleRefresh" class="control-label">Scheduled Refresh</label>
                            <select id="ScheduleRefresh" class="form-select">
                                <option value="No Refresh">No Refresh</option>
                                <option value="Daily">Daily</option>
                                <option value="Weekly">Weekly</option>
                                <option value="Monthly">Monthly</option>
                            </select>
                        </div>

                        <!-- Action Buttons -->
                        <div class="form-group">
                            <button type="submit" class="btn btn-accent">Save</button>
                            <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
                        </div>
                    </form>
                </div>
    `;

}

/**
 * Renders pagination controls based on the API response.
 * @param {string} containerId - The ID of the element to render the controls into.
 * @param {object} paginationData - The pagination metadata from the API.
 */
function renderPagination(containerId, paginationData) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const { CurrentPage, PageCount, FirstRowOnPage, LastRowOnPage, RowCount } = paginationData;

    // Don't render anything if there's only one page and no results
    if (PageCount <= 1 && RowCount === 0) {
        container.innerHTML = '';
        return;
    }

    // Part 1: "Showing X to Y of Z results" text
    const resultsText = `
        <div class="text-sm text-gray-700">
            Showing <span class="font-medium">${FirstRowOnPage}</span> 
            to <span class="font-medium">${LastRowOnPage}</span> 
            of <span class="font-medium">${RowCount}</span> results
        </div>
    `;

    // Part 2: The buttons
    let buttonsHtml = '';

    // "Previous" button
    const isFirstPage = CurrentPage === 1;
    buttonsHtml += `
        <button 
            class="pagination-btn ${isFirstPage ? 'disabled' : ''}" 
            data-page="${CurrentPage - 1}" 
            ${isFirstPage ? 'disabled' : ''}>
            Previous
        </button>
    `;

    // Page number buttons (can be simplified for many pages, but this is clear)
    for (let i = 1; i <= PageCount; i++) {
        const isActive = i === CurrentPage;
        buttonsHtml += `
            <button 
                class="pagination-btn ${isActive ? 'active' : ''}" 
                data-page="${i}">
                ${i}
            </button>
        `;
    }

    // "Next" button
    const isLastPage = CurrentPage === PageCount;
    buttonsHtml += `
        <button 
            class="pagination-btn ${isLastPage ? 'disabled' : ''}" 
            data-page="${CurrentPage + 1}" 
            ${isLastPage ? 'disabled' : ''}>
            Next
        </button>
    `;

    // Combine everything and render
    container.innerHTML = `
        ${resultsText}
        <div class="flex items-center gap-1 mt-2 sm:mt-0">
            ${buttonsHtml}
        </div>
    `;
}

 /**
 * Populates a table with data from a JSON array.
 * @param {Array<Object>} jsonData - An array of objects, where each object represents a row.
 */
function populateDataTable(jsonData) {
    // Find the table body element by its ID
    const tableBody = document.getElementById('dataSetColumnsTableBody');

    // If the table body doesn't exist, stop the function
    if (!tableBody) {
        console.error("Table body with ID 'dataSetColumnsTableBody' not found.");
        return;
    }

    // Clear any existing rows (like the "loading" or "no data" message)
    tableBody.innerHTML = '';

    // Check if the JSON data is empty
    if (!jsonData || jsonData.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8" class="text-center text-gray-500 py-4">No data available.</td></tr>';
        return;
    }

    // Iterate through each item in the JSON array to create a table row
    jsonData.forEach(item => {
        // Create a new table row element
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50 transition-colors cursor-pointer';

        // Use a template literal to build the HTML for the cells (td) in the row
        // Note: We are mapping the 'Tokenise' field to the 'De-identified' column.
        row.innerHTML = `
            <td class="px-6 py-4 text-sm font-medium">${item.ColumnName || ''}</td>
            <td class="px-6 py-4 text-sm">${item.ColumnType || ''}</td>
            <td class="px-6 py-4 text-sm">${item.LogicalColumnName || ''}</td>
            <td class="px-6 py-4 text-sm">${item.BusinessDescription || ''}</td>
            <td class="px-6 py-4 text-sm">${item.ExampleValue || ''}</td>
            <td class="px-6 py-4 text-sm">${item.Redact ? 'True' : 'False'}</td>
            <td class="px-6 py-4 text-sm">${item.Tokenise ? 'True' : 'False'}</td>
            <td class="px-6 py-4 text-sm">${item.IsFilter ? 'True' : 'False'}</td>
        `;

        // Append the newly created row to the table body
        tableBody.appendChild(row);
    });
}

// --- 3. CALL THE FUNCTION ---
// Call the function with your sample data when the page loads
// Fetch the data from the API
// async function renderDataSetPage() {
//     try {
//         console.log("IM IN")
//         // Get full URL
//         const url = window.parent.location.href;
        
//         // Get parameters as an object
//         const params = {};
//         new URLSearchParams(window.parent.location.search).forEach((value, key) => {
//             params[key] = value;
//         });
        
//         console.log({url, params});
        
//         // Fetch the data from the API
//         const datasetResponse = await window.loomeApi.runApiRequest(6, {
//             "DataSetID": params["DataSetID"] /* value for DataSetID */
//         });
//         const datasetColsResponse = await window.loomeApi.runApiRequest(7, {
//             "DataSetID": params["DataSetID"] /* value for DataSetID */
//         });

//         // Check if the response is a string and parse it
//         const dataset = typeof datasetResponse === 'string' ? JSON.parse(datasetResponse) : datasetResponse;
//         console.log(dataset)
//         const datasetCols = typeof datasetColsResponse === 'string' ? JSON.parse(datasetColsResponse) : datasetColsResponse;
//         console.log(datasetCols)
        
//         // Put in Data Set information
//         const nameElement = document.getElementById('datasetName');
//         // Update its content with the data from the JSON object
//         if (nameElement) {
//             nameElement.textContent = dataset.Name;
//         }
//         const lastUpdatedElement = document.getElementById('lastUpdated');
//         // Update its content with the data from the JSON object
//         if (lastUpdatedElement) {
//             const formattingOptions = {year: 'numeric',month: 'long', day: 'numeric'};
//             const date = new Date(dataset.ModifiedDate);
//             const formattedDate = date.toLocaleDateString('en-US', formattingOptions);
//             lastUpdatedElement.textContent = "Last Updated: " + formattedDate;
//         }
//         const descElement = document.getElementById('dataSetDescription');
//         // Update its content with the data from the JSON object
//         if (descElement) {
//             descElement.textContent = dataset.Description;
//         }
//         const approverElement = document.getElementById('approverEmail');
//         // Update its content with the data from the JSON object
//         if (approverElement) {
//             approverElement.textContent = dataset.Approvers;
//         }
//         const ownerElement = document.getElementById('ownerEmail');
//         // Update its content with the data from the JSON object
//         if (ownerElement) {
//             ownerElement.textContent = dataset.Owner;
//         }

//         // Populate Data Dictionary table
//         console.log('Data being passed to function:', datasetCols);
//         populateDataTable(datasetCols.Results);
        
//         //Trigger for Create Request
//         document.querySelector('#requestDatasetBtn').addEventListener('click', () => {
//             CreateRequest();
//         });
        
//         const searchInput = document.getElementById('searchInput');

//         searchInput.addEventListener('input', () => {
//             const searchTerm = searchInput.value.toLowerCase();
        
//             const filteredData = dataset.DataSetColumns.filter(item => {
//                 // Use String() to safely handle potential null or undefined values
//                 const columnName = String(item.ColumnName || '').toLowerCase();
//                 const description = String(item.Description || '').toLowerCase();
//                 const logicalName = String(item.LogicalName || '').toLowerCase();
        
//                 return columnName.includes(searchTerm) || 
//                       description.includes(searchTerm) || 
//                       logicalName.includes(searchTerm);
//             });
            
//             populateDataTable(filteredData);
//         });
//     } catch (error) {
//         console.error("Error fetching or displaying data:", error);

//         // Show an error message in the HTML if something goes wrong
//         const container = document.getElementById('table-for-approval');
//         container.innerHTML = `<p style="color:red;">An error occurred while fetching data.</p>`;
//     }
    
    
// }

/**
 * Safely gets a parameter from the parent window's URL.
 * @param {string} paramName The name of the URL parameter to get.
 * @returns {string | null}
 */
function getUrlParam(paramName) {
    const params = new URLSearchParams(window.parent.location.search);
    return params.get(paramName);
}

/**
 * Safely parses a response that might be a JSON string or an object.
 * @param {string | object} response The API response.
 * @returns {object}
 */
function safeParseJson(response) {
    return typeof response === 'string' ? JSON.parse(response) : response;
}

/**
 * A utility to find an element and update its text content.
 * @param {string} id The ID of the element.
 * @param {string} text The text to set.
 * @param {string} [prefix=''] An optional prefix to add before the text.
 */
function updateElementText(id, text, prefix = '') {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = prefix + (text || 'N/A');
    }
}

// --- Core Logic Functions ---

/**
 * Fetches, filters, and renders one page of the data dictionary table and its pagination.
 * @param {string} dataSetID The ID of the dataset to fetch.
 * @param {number} [page=1] The page number to fetch.
 * @param {string} [searchTerm=''] The search term to filter by on the server.
 */
async function fetchAndRenderTable(dataSetID, page = 1, searchTerm = '') {
    try {
        // IMPORTANT: Your API (request #7) must support page and search parameters.
        const apiParams = {
            "DataSetID": dataSetID,
            "page": page,
            "pageSize": 10, // Or whatever page size you prefer
            "search": searchTerm
        };

        const response = await window.loomeApi.runApiRequest(7, apiParams);
        const data = safeParseJson(response);

        if (!data || !Array.isArray(data.Results)) {
            throw new Error("API response for columns did not contain a valid 'Results' array.");
        }

        populateDataTable(data.Results);
        renderPagination('pagination-container', data); // Assuming 'pagination-container' is the ID for your pagination controls

    } catch (error) {
        console.error("Failed to fetch or render table data:", error);
        document.getElementById('dataSetColumnsTableBody').innerHTML = `<tr><td colspan="8" class="text-center text-red-500 py-4">Error loading data.</td></tr>`;
    }
}

/**
 * Sets up all interactive event listeners for the page.
 * @param {string} dataSetID The ID of the current dataset.
 */
function setupEventListeners(dataSetID) {
    document.querySelector('#requestDatasetBtn').addEventListener('click', () => CreateRequest());

    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', () => {
        // For a new search, always fetch page 1.
        fetchAndRenderTable(dataSetID, 1, searchInput.value);
    });

    const paginationContainer = document.getElementById('pagination-container');
    paginationContainer.addEventListener('click', (event) => {
        const button = event.target.closest('button.pagination-btn');
        if (button && !button.disabled) {
            const page = parseInt(button.dataset.page, 10);
            // Fetch the new page, preserving the current search term.
            fetchAndRenderTable(dataSetID, page, searchInput.value);
        }
    });
}


// --- Main Orchestration Function ---

async function renderDataSetPage() {
    try {
        console.log("Initializing Data Set Page...");

        // 1. Get the DataSetID from the URL
        const dataSetID = getUrlParam("DataSetID");
        if (!dataSetID) {
            throw new Error("DataSetID parameter is missing from the URL.");
        }

        // 2. Fetch the main dataset details (this only needs to happen once)
        const datasetResponse = await window.loomeApi.runApiRequest(6, { "DataSetID": dataSetID });
        const dataset = safeParseJson(datasetResponse);

        // 3. Populate the static header details of the page
        updateElementText('datasetName', dataset.Name);
        updateElementText('dataSetDescription', dataset.Description);
        updateElementText('approverEmail', dataset.Approvers);
        updateElementText('ownerEmail', dataset.Owner);
        console.log(dataset.ModifiedDate)
        
        if (dataset.ModifiedDate) {
            const date = new Date(dataset.ModifiedDate);
            // Check if the date is valid before trying to format it
            if (!isNaN(date.getTime())) {
                const formattedDate = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                updateElementText('lastUpdated', formattedDate, "Last Updated: ");
            } else {
                 updateElementText('lastUpdated', 'Invalid Date', "Last Updated: ");
            }
        }

        // 4. Fetch the FIRST page of the table data to initially populate the table
        await fetchAndRenderTable(dataSetID, 1, '');

        // 5. Set up all event listeners for search and pagination
        setupEventListeners(dataSetID);

    } catch (error) {
        console.error("Error rendering the Data Set page:", error);
        document.body.innerHTML = `<div class="p-4 text-red-600 bg-red-100 border border-red-400 rounded">A critical error occurred while loading the page: ${error.message}</div>`;
    }
}


renderDataSetPage()

    

