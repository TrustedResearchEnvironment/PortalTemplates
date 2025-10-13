const pageSize = 10;
let currentPage = 1;
let dataSourceTypeMap = new Map();
let allColumnsData = [];

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

/**
 * Fetches a specific page of columns for a given data set ID.
 * @param {string|number} data_set_id - The ID of the data set.
 * @param {number} [page=1] - The page number to fetch.
 * @returns {Promise<Object>} A promise that resolves with the paginated response object.
 */
async function fetchDataSetColumns(data_set_id, page = 1) {
    const DATASETCOLUMNS_API_ID = 38;
    // Add page and pageSize to the parameters sent to the API
    const params = { 
        "data_set_id": data_set_id,
        "page": page,
        "pageSize": pageSize
    }; 
   
    // IMPORTANT: getFromAPI should return the single paginated object, not an array
    return getFromAPI(DATASETCOLUMNS_API_ID, params);
}

/**
 * Populates the column table's tbody with data from a paginated response.
 * @param {Object|null} paginatedResponse - The full response object from the API.
 */
function displayColumnsTable(data) {
    const tableBody = document.getElementById('dataSetColsBody');
    
    // Extract the actual data array from the response object
    //const columnsData = paginatedResponse ? paginatedResponse.Results : null;

    if (!data || data.length === 0) {
        // ... (placeholder logic remains the same) ...
        const placeholderHtml = `<tr><td colspan="7" class="text-center text-muted">No columns to display.</td></tr>`;
        tableBody.innerHTML = placeholderHtml;
        return;
    }

    // --- DATA EXISTS ---
    // The mapping logic remains exactly the same
    const rowsHtml = data.map(col => `
        <tr data-id="${col.DataSetColumnID || ''}" data-column-name="${col.ColumnName}">
            <td>${col.ColumnName || ''}</td>
            <td class="editable-cell" data-field="LogicalColumnName">${col.LogicalColumnName || ''}</td>
            <td class="editable-cell" data-field="BusinessDescription">${col.BusinessDescription || ''}</td>
            <td class="editable-cell" data-field="ExampleValue">${col.ExampleValue || ''}</td>
            <td class="checkbox-cell">
                <input class="form-check-input editable-checkbox" type="checkbox" data-field="Redact" ${col.Redact ? 'checked' : ''}>
            </td>
            <td class="checkbox-cell">
                <input class="form-check-input editable-checkbox" type="checkbox" data-field="DeIdentify" ${col.Tokenise ? 'checked' : ''}>
            </td>
            <td class="checkbox-cell">
                <input class="form-check-input editable-checkbox" type="checkbox" data-field="IsFilter" ${col.IsFilter ? 'checked' : ''}>
            </td>
        </tr>
    `).join('');
    tableBody.innerHTML = rowsHtml;
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

    let paginationHTML = `
            <!-- First Page Button -->
            <button data-page="1" 
                    class="${commonButtonClasses} ${isFirstPage ? disabledClasses : ''}" 
                    ${isFirstPage ? 'disabled' : ''}>
                First
            </button>
            <!-- Previous Page Button -->
            <button data-page="${currentPage - 1}" 
                    class="${commonButtonClasses} ${isFirstPage ? disabledClasses : ''}" 
                    style="margin-right: 10px;"
                    ${isFirstPage ? 'disabled' : ''}>
                Previous
            </button>

        <!-- Page number input and display -->
            <span>Page</span>
            <input type="number" 
                   id="page-input" 
                   class="w-16 text-center border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" 
                   value="${currentPage}" 
                   min="1" 
                   max="${totalPages}" 
                   aria-label="Current page">
            <span>of ${totalPages}</span>

            <!-- Next Page Button -->
            <button data-page="${currentPage + 1}" 
                    class="${commonButtonClasses} ${isLastPage ? disabledClasses : ''}"
                    style="margin-left: 10px;" 
                    ${isLastPage ? 'disabled' : ''}>
                Next
            </button>
            <!-- Last Page Button -->
            <button data-page="${totalPages}" 
                    class="${commonButtonClasses} ${isLastPage ? disabledClasses : ''}" 
                    ${isLastPage ? 'disabled' : ''}>
                Last
            </button>
    `;

    container.innerHTML = paginationHTML;
}

/**
 * A central function to handle page changes. It validates the new page number
 * and re-renders the table.
 * @param {number} newPage - The page number to navigate to.
 */
function handlePageChange(newPage) {
    const totalPages = Math.ceil(allColumnsData.length / pageSize);

    // Validate the page number to ensure it's within bounds
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        renderTablePage(); // Your existing function to render the table and pagination
    } else {
        // Optional: Revert the input field if the user enters an invalid number
        const pageInput = document.getElementById('page-input');
        if (pageInput) {
            pageInput.value = currentPage; 
        }
        console.warn(`Invalid page number entered: ${newPage}`);
    }
}


// Data Set Field Table Rendering Functions

/**
 * Renders the row for selecting a Folder.
 * @param {HTMLElement} tbody The table body to append the row to.
 * @param {object} dataSource The data source object.
 */
async function renderFolderSelectorDataSetFields(tbody, dataSource) {
    tbody.innerHTML = `<tr><td>Folder Name</td><td>Loading folders...</td></tr>`;

    try {
        // --- TODO: Replace this with your actual API call ---
        const folders = await fetchFolders(dataSource.DataSourceID);
        console.log("Fetched folders:", folders);
        const optionsHtml = folders.map(folder => `<option value="${folder.Id}">${folder.Name}</option>`).join('');
        
        const rowHtml = `
            <tr>
                <td>Folder Name <input type="text" hidden="true"></td>
                <td width="70%">
                    <select class="form-control selectpicker">
                        <option value="-1">Select a Folder</option>
                        ${optionsHtml}
                    </select>
                    <div class="validation-message"></div>
                </td>
            </tr>`;
        
        tbody.innerHTML = rowHtml;

    } catch (error) {
        console.error("Failed to fetch folders:", error);
        tbody.innerHTML = `<tr><td>Folder Name</td><td class="text-danger">Error loading folders.</td></tr>`;
    }
}

// --- MOCK API FUNCTION (replace with your real one) ---
async function fetchFolders(data_source_id) {
    const DATASOURCEFOLDERS_API_ID = 35;
    const initialParams = { "data_source_id": data_source_id }; 
   
    return getFromAPI(DATASOURCEFOLDERS_API_ID, initialParams)
}

/**
 * Renders the row for the REDCap API Key.
 * @param {HTMLElement} tbody The table body to append the row to.
 */
function renderRedcapApiKeyRowDataSetFields(tbody) {
    const rowHtml = `
        <tr>
            <td>REDCap API Key <input type="text" hidden="true"></td>
            <td width="70%">
                <div class="container">
                    <div class="row">
                        <div class="col">
                            <input id="redcapapi" type="password" class="form-control valid">
                            <div class="validation-message"></div>
                        </div>
                        <div class="col col-lg-3">
                            <button id="redcapRefreshBtn" class="btn btn-accent float-right" title="RedCap">Refresh</button>
                        </div>
                    </div>
                </div>
            </td>
        </tr>`;
    
    tbody.innerHTML = rowHtml;

    // Optional: Add an event listener to the new button
    tbody.querySelector('#redcapRefreshBtn').addEventListener('click', () => {
        const apiKey = tbody.querySelector('#redcapapi').value;
        console.log(`Refresh button clicked! API Key: ${apiKey}`);
        showToast('Refresh clicked!');
    });
}

async function fetchLoomeDataSourceTablesByTableId(tableId) {
    const DATASOURCETABLEBYID_API_ID = 37;
    const initialParams = { "table_id": tableId }; 
   
    return getFromAPI(DATASOURCETABLEBYID_API_ID, initialParams)
}


async function fetchDataSetFieldValue(data_set_id) {

    if (data_set_id === "new") {
        return {
            id: null,
            name: null
        };
    }

    const DATASETFIELDVALUE_API_ID = 36;
    const initialParams = { "data_set_id": data_set_id }; 
   
    const resultsArray = await getFromAPI(DATASETFIELDVALUE_API_ID, initialParams);
    console.log("Fetched DataSet Field Value (as array):", resultsArray);
    if (!resultsArray || resultsArray.length === 0) {
        console.warn("API returned no data for data_set_id:", data_set_id);
        return { id: null, name: null }; // Return a default value
    }

    // --- KEY CHANGE: Get the first object from the array ---
    const result = resultsArray[0];
    console.log("Fetched DataSet Field Value 1:", result);
    console.log("Result FieldID:", result.FieldID);
    // If Field Value is a Table Name, the result is the ID of the table
    // Get the actual table name from another endpoint
    // Case 1: The value is a table ID, so we need to fetch the name
    if (result.FieldID == 3) { 
        console.log("FieldID indicates a table reference. Fetching table name...");
        const tableIdAsString = result.Value; // The value is a string, e.g., "9"

        // --- CONVERT TO INTEGER HERE ---
        const tableId = parseInt(tableIdAsString, 10);
        
        const tableInfo = await fetchLoomeDataSourceTablesByTableId(tableId);
        console.log("Fetched Table Info:", tableId, tableInfo[0]);
        // Return an object with BOTH the ID and the fetched name
        return {
            id: tableId,
            name: tableInfo[0].TableName
        };

    // Case 2: The value is just a simple value, not a reference to another table
    } else {
        console.log("FieldID indicates a direct value. Using value as-is.");
        // Return an object with the same shape for consistency.
        // The ID can be null as it doesn't apply, and the 'name' is the value itself.
        return {
            id: null,
            name: result.Value
        };
    }
}

/**
 * Renders the row for selecting a SQL table.
 * @param {HTMLElement} tbody The table body to append the row to.
 * @param {object} dataSource The data source object (needed for connection details).
 */
async function renderSqlTableSelectorDataSetFields(tbody, dataSource, dataSetID) {
    // First, show a "Loading..." state
    tbody.innerHTML = `<tr><td>Table Name</td><td>Loading tables...</td></tr>`;

    try {
        // --- TODO: Replace this with your actual API call ---
        // This function should fetch the list of tables for the given data source connection.
        const tables = await fetchSqlTables(dataSource.DataSourceID); 
        console.log("Fetched tables:", tables);
    
        // Await the result from your function
        const fetchedData = await fetchDataSetFieldValue(dataSetID);
        console.log("Fetched DataSet Field Value 2:", fetchedData);
        let tableId = fetchedData.id;;
        let tableName = fetchedData.name;;

        let rowHtml = '';

        if (dataSetID === "new" || !tableId) {
            // Create the dropdown HTML with the fetched tables
            const optionsHtml = tables.map(table => `<option value="${table.Id}">${table.TableName}</option>`).join('');      

            rowHtml = `
            <tr>
                <td>Table Name <input type="text" hidden="true"></td>
                <td width="70%">
                    <select id="tableNameSelector" class="form-control selectpicker bg-white">
                        <option value="-1">Select a Table</option>
                        ${optionsHtml}
                    </select>
                    <div class="validation-message"></div>
                </td>
            </tr>`;

        } else {

            const filteredTables = tables.filter(table => table.Id != tableId);

            // Now, create the options HTML from the *filtered* array.
            const optionsHtml = filteredTables
                .map(table => `<option value="${table.Id}" title="${table.TableName}">${table.TableName}</option>`)
                .join('');

            rowHtml = `
                <tr>
                    <td>Table Name <input type="text" hidden="true"></td>
                    <td width="70%">
                        <select id="tableNameSelector" class="form-control selectpicker bg-white">
                            <option value="${tableId}" title="${tableName}" selected>${tableName}</option>
                            ${optionsHtml}
                        </select>
                        <div class="validation-message"></div>
                    </td>
                </tr>`;
        }

        
        
        tbody.innerHTML = rowHtml;

    } catch (error) {
        console.error("Failed to fetch SQL tables:", error);
        tbody.innerHTML = `<tr><td>Table Name</td><td class="text-danger">Error loading tables.</td></tr>`;
    }
}


async function fetchSqlTables(data_source_id) {
    const DATASOURCETABLES_API_ID = 34;
    const initialParams = { "data_source_id": data_source_id }; 
   
    return getFromAPI(DATASOURCETABLES_API_ID, initialParams)
}

/**
 * Dynamically updates the "Data Set Fields" table based on the selected data source type.
 * @param {object} dataSource The full data source object, which includes DataSourceTypeID.
 */
async function updateDataSetFieldsTable(dataSource, dataSetID) {
   
    console.log("Updating fields for DataSource:", dataSource);

    const fieldsTable = document.getElementById('dataSetFieldsTable');
    const fieldsPlaceholder = document.getElementById('fieldsPlaceholder');
    const tbody = fieldsTable.querySelector('tbody');

    // Always start by clearing the current content
    tbody.innerHTML = '';

    // If there's no data source selected, show the placeholder and exit.
    if (!dataSource || !dataSource.DataSourceTypeID) {
        fieldsPlaceholder.style.display = 'block';
        fieldsTable.style.display = 'none';
        return;
    }

    // A valid data source is selected, so ensure the table is visible.
    fieldsPlaceholder.style.display = 'none';
    fieldsTable.style.display = 'table';

    console.log("DataSourceTypeID:", dataSource.DataSourceTypeID);
    
    // Use a switch to decide which content to render
    switch (dataSource.DataSourceTypeID) {
        case 1: // SQL Database Type
            await renderSqlTableSelectorDataSetFields(tbody, dataSource, dataSetID);
            break;

        case 2: // REDCap API Type
            renderRedcapApiKeyRowDataSetFields(tbody, dataSource);
            break;

        case 3: // Folder Type
            await renderFolderSelectorDataSetFields(tbody, dataSource);
            break;

        default:
            // If the type is unknown, revert to the placeholder state.
            console.warn(`Unknown DataSourceTypeID: ${dataSource.DataSourceTypeID}`);
            fieldsPlaceholder.style.display = 'block';
            fieldsTable.style.display = 'none';
            break;
    }
  
}
// End Data Set Field Table Rendering Functions

// MetaData Table Rendering Functions

/**
 * Fetches the metadata value for a given DataSetID and renders it in an input field.
 * This is used for the SQL Database data source type.
 * @param {HTMLElement} tbody - The tbody element of the metadata table.
 * @param {number|null} dataSetID - The ID of the data set to fetch metadata for.
 */
async function renderSqlTableSelectorMetaData(tbody, dataSetID) {
    // Step 1: Provide immediate feedback to the user with a loading state.
    tbody.innerHTML = `
        <tr>
            <td>Tag <input type="hidden"></td>
            <td width="70%">
                <input class="form-control" value="Loading..." disabled>
            </td>
        </tr>
    `;

    // A guard clause to handle cases where there's no ID to fetch.
    if (!dataSetID || dataSetID === "new") {
        tbody.innerHTML = `
            <tr>
                <td>Tag <input type="hidden" value="5"></td>
                <td width="70%">
                    <input id="metaDataTag" class="form-control valid" value="">
                </td>
            </tr>`;
        return;
    }

    try {
        const API_GET_DATASETMETADATAVALUE = 40;
        
        // Step 2: AWAIT the data. The code will pause here until the API responds.
        const result = await getFromAPI(API_GET_DATASETMETADATAVALUE, { "data_set_id": dataSetID });

        // Step 3: Now 'result' is the actual data array. Use it to build the final HTML.
        // Use a variable for clarity.
        const tagValue = (result && result.length > 0) ? result[0].Value : '';

        // Let's assume the MetadataID for "Tag" is 5. It's important to have this in the hidden input.
        const rowHtml = `
            <tr>
                <td>Tag <input type="hidden" value="5"></td>
                <td width="70%">
                    <input id="metaDataTag" class="form-control valid" value="${tagValue}">
                </td>
            </tr>
        `;
        tbody.innerHTML = rowHtml;

    } catch (error) {
        console.error("Failed to fetch metadata value:", error);
        // Step 4: Show an error message to the user if the API call fails.
        tbody.innerHTML = `
            <tr>
                <td>Tag <input type="hidden" value="5"></td>
                <td width="70%">
                    <input class="form-control is-invalid" value="Error loading data" disabled>
                </td>
            </tr>
        `;
    }
}

/**
 * Renders two static rows with input fields for REDCap API metadata.
 * @param {HTMLElement} tbody - The tbody element of the metadata table.
 * @param {object} dataSource - The data source object (not used in this function but passed for consistency).
 */
function renderRedcapApiKeyRowMetaData(tbody, dataSource) {
    // These rows are static, so we can just define the HTML directly.
    // Using unique and descriptive IDs for each input is important.
    const rowHtml = `
        <tr>
            <td>Citations for related publications <input type="hidden" value="1"></td>
            <td width="70%">
                <input id="redcapCitations" class="form-control">
            </td>
        </tr>
        <tr>
            <td>ANZCTR URL <input type="hidden" value="2"></td>
            <td width="70%">
                <input id="redcapAnzctrUrl" class="form-control">
            </td>
        </tr>
    `;
    tbody.innerHTML = rowHtml;
}


/**
 * Hides the metadata table and shows the placeholder text.
 * This is used for data source types that do not have any metadata fields.
 * @param {HTMLElement} tbody - The tbody element of the metadata table.
 */
function renderFolderSelectorMetaData(tbody) {
    // As requested, this case has no metadata, so we hide the table
    // and re-show the placeholder.
    const metaDataTable = document.getElementById('metaDataTable');
    const metaDataPlaceholder = document.getElementById('metaDataPlaceholder');
    
    metaDataTable.style.display = 'none';
    metaDataPlaceholder.style.display = 'block';
    metaDataPlaceholder.textContent = 'No metadata fields for this data source type.';
}

function updateMetaDataTable(dataSource, dataSetID)  {
    const metaDataTable = document.getElementById('metaDataTable');
    const metaDataPlaceholder = document.getElementById('metaDataPlaceholder');
    const tbody = metaDataTable.querySelector('tbody');

    // Clear any old data
    tbody.innerHTML = ''; 

    // If there's no data source selected, show the placeholder and exit.
    if (!dataSource || !dataSource.DataSourceTypeID) {
        metaDataPlaceholder.style.display = 'block';
        metaDataTable.style.display = 'none';
        return;
    }

    // A valid data source is selected, so ensure the table is visible.
    metaDataPlaceholder.style.display = 'none';
    metaDataTable.style.display = 'table';

    console.log("DataSourceTypeID:", dataSource.DataSourceTypeID);
    
    // Use a switch to decide which content to render
    switch (dataSource.DataSourceTypeID) {
        case 1: // SQL Database Type
            console.log("In Render SQL Metadata: ", dataSetID)
            renderSqlTableSelectorMetaData(tbody, dataSetID);
            break;

        case 2: // REDCap API Type
            renderRedcapApiKeyRowMetaData(tbody, dataSource);
            break;

        case 3: // Folder Type
            renderFolderSelectorMetaData(tbody, dataSource);
            break;

        default:
            // If the type is unknown, revert to the placeholder state.
            console.warn(`Unknown DataSourceTypeID: ${dataSource.DataSourceTypeID}`);
            metaDataPlaceholder.style.display = 'block';
            metaDataTable.style.display = 'none';
            break;
    }
}

// End MetaData Table Rendering Functions

/**
 * Safely parses a response that might be a JSON string or an object.
 * @param {string | object} response The API response.
 * @returns {object}
 */
function safeParseJson(response) {
    return typeof response === 'string' ? JSON.parse(response) : response;
}

async function getFromAPI(API_ID, initialParams) {
    let allResults = [];
    
    try {
        const initialResponse = await window.loomeApi.runApiRequest(API_ID, initialParams);
        const parsedInitial = safeParseJson(initialResponse);

        // Early exit if the response is null, undefined, etc.
        if (!parsedInitial) {
            console.log("API returned no data.");
            return [];
        }
        
        let allResults = []; // Initialize as an empty array for a clean state

        // --- DETECTION LOGIC ---
        // Check if the response has the signature of a paginated object.
        // Checking for PageCount is more reliable than just checking for Results.
        if (parsedInitial.PageCount !== undefined && Array.isArray(parsedInitial.Results)) {
            
            // --- PAGINATED PATH ---
            console.log("Detected a paginated response.");
            
            allResults = parsedInitial.Results;
            const totalPages = parsedInitial.PageCount;

            if (totalPages > 1) {
                for (let page = 2; page <= totalPages; page++) {
                    console.log(`Fetching page ${page} of ${totalPages}...`);
                    
                    // Construct params for the next page, preserving other initial params
                    const params = { ...initialParams, "page": page }; 
                    console.log(params)
                    const response = await window.loomeApi.runApiRequest(API_ID, params);
                    const parsed = safeParseJson(response);

                    if (parsed && parsed.Results) {
                        allResults = allResults.concat(parsed.Results);
                    }

                } // end for loop
            }

        } else {
            // --- NON-PAGINATED PATH ---
            console.log("Detected a non-paginated response.");

            // The entire response is the result.
            // We ensure it's always an array for a consistent return type.
            if (Array.isArray(parsedInitial)) {
                // If the response is already an array, use it directly.
                allResults = parsedInitial;
            } else {
                // If the response is a single object, wrap it in an array.
                allResults = [parsedInitial];
            }
        }

        console.log(`Finished fetching for API ID ${API_ID}. Total items: ${allResults.length}`);
        return allResults;

    } catch (error) {
        console.error("An error occurred while fetching data source types:", error);
        return [];
    }  
}

async function getAllDataSets() {
    const DATASETS_API_ID = 10;
    const initialParams = { "page": 1, "pageSize": 100, "search": '', activeStatus: 3 }; //Get both active and inactive Data Set
   
    return getFromAPI(DATASETS_API_ID, initialParams)
    
}

async function getAllDataSources() {
    const DATASOURCES_API_ID = 5;
    const initialParams = { "page": 1, "pageSize": 100, "search": '' }; 
   
    return getFromAPI(DATASOURCES_API_ID, initialParams)
    
}

/**
 * Populates the dropdown with the list of existing data sources.
 */
function populateExistingDataSets(optgroup, allResults) {
    allResults.forEach(ds => {
        const option = document.createElement('option');
        option.value = ds.DataSetID;
        option.textContent = ds.Name;
        optgroup.appendChild(option);
    });
}

function populateDataSourceOptions(selectElement, data, valueField, textField) {
    if (!selectElement || !Array.isArray(data)) return;
    while (selectElement.options.length > 1) {
        selectElement.remove(1);
    }
    data.forEach(item => {
        const option = document.createElement('option');
        option.value = item[valueField];
        option.textContent = item[textField];
        selectElement.appendChild(option);
    });
}

/**
 * Fetches the schema for a given table ID and formats it into a standard array of column objects.
 * @param {string|number} tableId The ID of the table to fetch.
 * @returns {Promise<Array<Object>>} A promise that resolves to the array of formatted column objects, or an empty array on failure.
 */
async function formatColumnsFromSchema(tableId) {
    try {
        const tableDataArray = await fetchLoomeDataSourceTablesByTableId(tableId);

        // Safety check: ensure we got a valid response
        if (!tableDataArray || tableDataArray.length === 0) {
            console.warn(`No schema data found for Table ID: ${tableId}`);
            return [];
        }

        const tableSchema = tableDataArray[0];

        // IMPROVEMENT (Robustness): Use `|| ''` to prevent .split() from crashing on null/undefined.
        const columnNames = (tableSchema.ColumnList || '').split(",").map(name => name.trim());
        const columnTypes = (tableSchema.ColumnTypes || '').split(",").map(type => type.trim());

        // Safety check for mismatched lengths
        if (columnNames.length !== columnTypes.length) {
            console.error("Mismatch between the number of column names and column types.");
            return [];
        }

        // Map the names and types into the final object structure
        const formattedColumns = columnNames.map((name, index) => ({
            "ColumnName": name,
            "ColumnType": columnTypes[index],
            "LogicalColumnName": '', // Use empty string instead of null for consistency
            "BusinessDescription": '',
            "ExampleValue": '',
            "Tokenise": false,
            "TokenIdentifierType": 0,
            "Redact": false,
            "DisplayOrder": index + 1,
            "IsFilter": false,
        }));

        return formattedColumns;

    } catch (error) {
        console.error(`Error fetching or formatting schema for Table ID ${tableId}:`, error);
        return []; // Always return an array to prevent downstream errors
    }
}

/**
 * The single, smart function to update the columns table for a specific page.
 * It handles the logic for both new and existing data sets.
 * @param {number} [page=1] - The page number to fetch and display.
 */
// async function updateColumnsForTable(page = 1) {
//     const dataSetId = document.getElementById('dataSetSelection').value;
//     let paginatedResponse = null;

//     // --- SCENARIO 1: Editing an EXISTING Data Set ---
//     if (dataSetId && dataSetId !== 'new') {
//         try {
//             console.log(`Fetching page ${page} for existing Data Set ID: ${dataSetId}...`);
//             paginatedResponse = await fetchDataSetColumns(dataSetId, page);
//             result = paginatedResponse.Results
//         } catch (error) {
//             console.error(`Error fetching columns:`, error);
//         }
//     }
//     // --- SCENARIO 2: Creating a NEW Data Set ---
//     else if (dataSetId === 'new') {
//         const tableNameSelector = document.getElementById('tableNameSelector');
//         if (tableNameSelector && tableNameSelector.value && tableNameSelector.value !== '-1') {
//             const tableId = tableNameSelector.value;
//             try {
//                 if (tableNameSelector && tableNameSelector.value && tableNameSelector.value !== '-1') {
//                     const tableId = tableNameSelector.value;

//                     // IMPROVEMENT (Clarity/Reusability): Call the dedicated helper function
//                     const formattedColumns = await formatColumnsFromSchema(tableId);

//                     // For Pagination
//                     const pageSize = 10;
//                     const startIndex = (page - 1) * pageSize;
//                     const endIndex = startIndex + pageSize;
//                     const pageOfColumns = formattedColumns.slice(startIndex, endIndex);

//                     // Create the faux paginated response object for the display functions
//                     paginatedResponse = {
//                         Results: pageOfColumns,
//                         CurrentPage: page,
//                         // Calculate total pages based on the full, un-sliced array
//                         PageCount: Math.ceil(formattedColumns.length / pageSize),
//                         PageSize: pageSize,
//                         RowCount: formattedColumns.length
//                     };
//                 }
//             } catch (error) {
//                 console.error(`Error fetching schema:`, error);
//             }
//         }
//     }

//     // --- RENDER THE RESULTS ---
//     // These functions now work for both scenarios because the data structure is consistent.
//     displayColumnsTable(paginatedResponse);
//     renderPagination('pagination-controls', paginatedResponse);
// }

/**
 * The single function responsible for FETCHING data and populating the master `allColumnsData` array.
 * This is a "reset" action.
 */
async function loadColumnsData() {
    const dataSetId = document.getElementById('dataSetSelection').value;
    let newColumnsData = []; // Default to an empty array

    // --- SCENARIO 1: Editing an EXISTING Data Set ---
    if (dataSetId && dataSetId !== 'new') {
        try {
            console.log(`FETCHING columns for existing Data Set ID: ${dataSetId}...`);
            newColumnsData = await fetchDataSetColumns(dataSetId);

            console.log("newColumnsData:", newColumnsData)
        } catch (error) {
            console.error(`Error fetching columns for Data Set ID ${dataSetId}:`, error);
        }
    }
    // --- SCENARIO 2: Creating a NEW Data Set ---
    else if (dataSetId === 'new') {
        const tableNameSelector = document.getElementById('tableNameSelector');
        if (tableNameSelector && tableNameSelector.value && tableNameSelector.value !== '-1') {
            const tableId = tableNameSelector.value;
            console.log(`FETCHING schema for new Data Set from Table ID: ${tableId}...`);
            // This now calls your dedicated helper function
            newColumnsData = await formatColumnsFromSchema(tableId);
        }
    }

    // --- CRITICAL: Update the master state ---
    allColumnsData = newColumnsData || [];
    currentPage = 1; // Always reset to the first page when data is reloaded

    // Finally, render the first page of the NEW data
    renderTablePage();
}

/**
 * Renders the UI based on the current state of `allColumnsData` and `currentPage`.
 * This function DOES NOT fetch data.
 */
function renderTablePage() {
    // Calculate the slice of data for the current page
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    console.log(startIndex, endIndex)
    const pageData = allColumnsData.slice(startIndex, endIndex);
    console.log("pageData: ", pageData, allColumnsData)
    // Render the table with only the data for the current page
    displayColumnsTable(pageData);
    
    console.log(allColumnsData.length, pageSize, currentPage)
    // Render the pagination controls based on the FULL dataset length
    renderPagination('pagination-controls', allColumnsData.length, pageSize, currentPage);
}

/**
 * Gathers all data from the form fields and tables into a structured object.
 * @returns {object} An object containing mainDetails and columns arrays.
 */
function gatherFormData(allColumnsData) {
    // --- Part A: Gather Main Form Details ---
    const mainDetails = {
        name: document.getElementById('dataSetName').value,
        description: document.getElementById('dataSetDescription').value,
        datasourceId: parseInt(document.getElementById('dataSource').value, 10),
        owner: document.getElementById('dataSetOwner').value,
        approvers: document.getElementById('dataSetApprover').value,
        isActive: document.getElementById('dataSetActive').checked
    };

    // --- Part B: Gather Dynamic Metadata (from dataSetFieldsTable and metaDataTable) ---
    // This is a generic way to scrape key-value metadata.
    const metaData= [];
    const dataSetFieldValues = [];
    const fieldsTableBody = document.getElementById('dataSetFieldsTable').querySelector('tbody');
    const metaTableBody = document.getElementById('metaDataTable').querySelector('tbody');

    // Helper to scrape a metadata and data set fields table
    const scrapeMetaTable = (tbody) => {
        tbody.querySelectorAll('tr').forEach(row => {
            const keyInput = row.querySelector('td:first-child input[type="hidden"]');
            const valueInput = row.querySelector('td:last-child input, td:last-child select');
            if (keyInput && valueInput) {
                metaData.push({ //MetaDataID being 1 is only for those with "Tag" as the Metadata
                    MetaDataID: 1, //parseInt(keyInput.value, 10),
                    Value: valueInput.value
                });
            }
        });
    };

    const scrapeFieldsTable = (tbody) => {
        // --- PATH 1: Check for the specific SQL Table Name selector first ---
        const tableNameSelector = tbody.querySelector('#tableNameSelector');
        if (tableNameSelector && tableNameSelector.value && tableNameSelector.value !== "-1") {
            // The FieldID for "Table Name" is 3. THIS ONLY APPLIES FOR SQL DATA SOURCES.
            dataSetFieldValues.push({
                FieldID: 3, // Hardcode the ID since we know what we found
                Value: tableNameSelector.value
            });
            return; // We're done with this table, so we can exit.
        }

        // // --- PATH 2: Check for other known fields, like the REDCap API Key ---
        // const redcapInput = tbody.querySelector('#redcapapi');
        // if (redcapInput && redcapInput.value) {
        //     // The FieldID for "REDCap API Key" is 1 (or whatever it is in your DB).
        //     dataSetFieldValues.push({
        //         FieldID: 1, // Hardcode the ID
        //         Value: redcapInput.value
        //     });
        //     return;
        // }
        
        // // --- PATH 3 (FALLBACK): A generic scraper for any other rows ---
        // // This can handle other simple key/value pairs if needed.
        // tbody.querySelectorAll('tr').forEach(row => {
        //     // Skip rows we've already handled
        //     if (row.querySelector('#tableNameSelector') || row.querySelector('#redcapapi')) {
        //         return;
        //     }

        //     const keyInput = row.querySelector('td:first-child input[type="hidden"]');
        //     const valueInput = row.querySelector('td:last-child input, td:last-child select');

        //     if (keyInput && valueInput && valueInput.value) {
        //         dataSetFieldValues.push({
        //             FieldID: parseInt(keyInput.value, 10),
        //             Value: valueInput.value
        //         });
        //     }
        // });
    };
    
    // Scrape both tables if they exist
    if (fieldsTableBody) scrapeFieldsTable(fieldsTableBody);
    if (metaTableBody) scrapeMetaTable(metaTableBody);

    // --- Part C: Gather Editable Columns Table Data ---
    // const columns = [];
    // const colsTableBody = document.getElementById('dataSetColsBody');
    // colsTableBody.querySelectorAll('tr').forEach(row => {
    //     // Skip the placeholder row if it exists
    //     if (row.querySelector('td[colspan]')) {
    //         return;
    //     }

    //     const columnData = {
    //         // Use dataset.id for existing, or null for new
    //         //Id: row.dataset.id ? parseInt(row.dataset.id, 10) : null,
    //         ColumnName: row.cells[0].textContent.trim(),
    //         LogicalColumnName: row.cells[1].textContent.trim(),
    //         BusinessDescription: row.cells[2].textContent.trim(),
    //         ExampleValue: row.cells[3].textContent.trim(),
    //         Redact: row.querySelector('[data-field="Redact"]').checked,
    //         Tokenise: row.querySelector('[data-field="DeIdentify"]').checked,
    //         IsFilter: row.querySelector('[data-field="IsFilter"]').checked
    //     };
    //     columns.push(columnData);
    // });

    const columns = allColumnsData;

    return {
        ...mainDetails,
        dataSetMetaDataValues: metaData, // You'll need an endpoint for this too
        dataSetFieldValues: dataSetFieldValues, // And this
        dataSetColumns: columns,
        dataSetFolders: [] // Placeholder for future folder support
    };
}

// --- API FUNCTIONS ---
// This calls a API that does the create for DataSet, DataSetColumns, DataSetMetaDataValues, and DataSetFieldValues
async function createDataSet(data) {
    const payload = {
        ...data, // Spread all properties from the original object
        optOutMessage: "string",
        optOutList: "string",
        optOutColumn: "-1"
    };

    console.log("Sending this payload to the API:", payload);

    const CREATE_DATASET_API_ID = 29;
    try {
        // Send the new 'payload' object to the API instead of the original 'data'
        const response = await window.loomeApi.runApiRequest(CREATE_DATASET_API_ID, payload);
        if (!response) throw new Error("Failed to add dataset - no response from server");
        showToast('Dataset added successfully!');
        return response;
    } catch (error) {
        console.error("Error creating dataset:", error);
        throw error;
    }
}

async function updateDataSet(data_set_id, data) {
    const UPDATE_DATASET_API_ID = 28;

    const payload = {
        ...data, // Spread all properties from the original object
        id: parseInt(data_set_id, 10),
        optOutMessage: "{{OptOutMessage}}",
        optOutList: "{{OptOutList}}",
        optOutColumn: "{{OptOutColumn}}"
    };

    console.log("Sending this payload to the API:", payload);

    try {
        // Send the new 'payload' object to the API instead of the original 'data'
        const response = await window.loomeApi.runApiRequest(UPDATE_DATASET_API_ID, payload);
        if (!response) throw new Error("Failed to update dataset - no response from server");
        showToast('Dataset updated successfully!');
        return response;
    } catch (error) {
        console.error("Error updating dataset:", error);
        throw error;
    }
}

async function renderManageDataSourcePage() {
    
    const selectionDropdown = document.getElementById('dataSetSelection');
    const detailsContainer = document.getElementById('dataSetDetailsContainer');
    const optgroup = selectionDropdown.querySelector('optgroup');
    let dataSource = {};
    
    // Form input elements
    const nameInput = document.getElementById('dataSetName');
    const descriptionInput = document.getElementById('dataSetDescription');
    const dataSourceDrpDwn = document.getElementById('dataSource');
    const activeCheckbox = document.getElementById('dataSetActive');
    const owner = document.getElementById('dataSetOwner');
    const approver = document.getElementById('dataSetApprover');
    const dataSetFieldsTable = document.getElementById('dataSetFieldsTable');
    
    /**
     * Clears the form fields to their default state for creating a new entry.
     */
    function clearForm() {
        nameInput.value = '';
        descriptionInput.value = '';
        dataSourceDrpDwn.value = ''; // Resets dropdown to the "Select a Type..." option
        activeCheckbox.checked = true; // A sensible default
        owner.value = '';
        approver.value = '';
        console.log("Form cleared for new data source.");
    }
    
    /**
     * Fills the form fields with data from a given data source object.
     * @param {object} dataSet The data set object with details.
     */
    function populateForm(dataSet, dataSource) {
        if (!dataSet) return;
        nameInput.value = dataSet.Name;
        descriptionInput.value = dataSet.Description;
        dataSourceDrpDwn.value = dataSource.DataSourceID;
        activeCheckbox.checked = dataSet.IsActive;
        owner.value = dataSet.Owner;
        approver.value = dataSet.Approvers;

        console.log("Form populated with:", dataSet, dataSource);
    }
    

    async function updateFormForSelection(allDataSets, allDataSources) {
        const selectedId = selectionDropdown.value;

        if (selectedId === 'new') {
            clearForm();
            updateDataSetFieldsTable(null, null); 
            updateMetaDataTable(null, null);
            // When creating a new set, there are no columns to show. Clear the table.
            displayColumnsTable(null); 
        } else {
            const selectedDataSet = allDataSets.find(ds => ds.DataSetID == selectedId);
            if (!selectedDataSet) return;
            const dataSource = allDataSources.find(dsrc => dsrc.DataSourceID == selectedDataSet.DataSourceID);
            if (!dataSource) return;

            // 1. Populate the main form fields
            populateForm(selectedDataSet, dataSource);

            // 2. Update the dynamic metadata tables on the left
            updateDataSetFieldsTable(dataSource, selectedId); 
            updateMetaDataTable(dataSource, selectedId);
            
        }
    }
   
    
    // Add the 'async' keyword to the function that wraps this logic.
    // For example, if it's inside a DOMContentLoaded listener:
    document.addEventListener('DOMContentLoaded', async () => { 
    
        try {
            // 1. Use 'await' to wait for the data to arrive.
            // The code will pause here until getAllDataSources() resolves.
            let allDataSets = await getAllDataSets();
            let allDataSources = await getAllDataSources();
            
            // 2. Now, allResults is the actual array of data.
            console.log('Data has arrived:', allDataSets);
            
            // 3. The rest of your code can now run in the correct order.
            populateExistingDataSets(optgroup, allDataSets);
            populateDataSourceOptions(dataSourceDrpDwn, allDataSources, 'DataSourceID', 'Name');
            
            // Create the Empty Columns Table
            updateFormForSelection(allDataSets, allDataSources);


            // // Listener for DATA SOURCE dropdown
            dataSourceDrpDwn.addEventListener('change', async () => {
                const selectedDataSourceId = dataSourceDrpDwn.value;
                const selectedDataSource = allDataSources.find(src => src.DataSourceID == selectedDataSourceId);
                const selectedDataSetID = selectionDropdown.value;

                if (selectedDataSource) {
                    // --- THIS IS THE MISSING PART ---
                    // First, update the metadata sections in the left column.
                    await updateDataSetFieldsTable(selectedDataSource, selectedDataSetID);
                    await updateMetaDataTable(selectedDataSource, selectedDataSetID);
                    
                    // THEN, refresh the columns based on the new context.
                    //await updateColumnsForTable(1);

                    await loadColumnsData();
                } else {
                    // If no source is selected, clear everything.
                    displayColumnsTable(null);
                    // You might also want to clear the metadata tables here.
                }
            });

            // Listener for TOP-LEVEL data set selection
            selectionDropdown.addEventListener('change', async () => {
                await updateFormForSelection(allDataSets, allDataSources);
                // Always load the FIRST page when the data set changes
                //await updateColumnsForTable(1);

                await loadColumnsData();
            });

            // Listener for TABLE NAME dropdown
            dataSetFieldsTable.addEventListener('change', async (event) => {
                if (event.target.id === 'tableNameSelector') {
                    // Always load the FIRST page when the table changes
                    //await updateColumnsForTable(1);
                    await loadColumnsData();
                }
            });

            // --- "RENDER" EVENT LISTENER ---
            // This listener ONLY updates the view, it does not fetch data.

            const paginationControls = document.getElementById('pagination-controls');
            // paginationControls.addEventListener('click', (event) => {
            //     event.preventDefault();
            //     const target = event.target;
            //     console.log('page: ', target.dataset.page);
            //     if (target.tagName === 'A' && target.dataset.page) {
            //         const page = parseInt(target.dataset.page, 10);
            //         const totalPages = Math.ceil(allColumnsData.length / pageSize);

            //         if (page > 0 && page <= totalPages) {
            //             currentPage = page;
            //             renderTablePage(); // Just re-render with the new page number
            //         }
            //     }
            // });

            // This single listener handles all pagination interactions using event delegation.
            paginationControls.addEventListener('click', (event) => {
                // Check if a pagination button was clicked
                const target = event.target.closest('button[data-page]');
                if (target) {
                    event.preventDefault();
                    const page = parseInt(target.dataset.page, 10);
                    handlePageChange(page);
                }
            });

            paginationControls.addEventListener('keydown', (event) => {
                // Check if the Enter key was pressed in the input field
                const target = event.target;
                if (target.id === 'page-input' && event.key === 'Enter') {
                    event.preventDefault();
                    const page = parseInt(target.value, 10);
                    handlePageChange(page);
                }
            });


            // =================================================================
            //  EDITABLE TABLE LOGIC
            // =================================================================

            // Get a reference to the body of the columns table.
            const dataSetColsBody = document.getElementById('dataSetColsBody');

            // --- Listener 1: For TEXT cell editing (on double-click) ---
            dataSetColsBody.addEventListener('dblclick', (event) => {
                const cell = event.target;
                // Only allow editing on cells with the 'editable-cell' class
                if (!cell.classList.contains('editable-cell')) {
                    return;
                }
                // Prevent creating an input if one already exists
                if (cell.querySelector('input')) {
                    return;
                }

                const originalText = cell.textContent.trim();
                
                // Create an input element
                const input = document.createElement('input');
                input.type = 'text';
                input.className = 'form-control form-control-sm'; // Use small form control for a better fit
                input.value = originalText;
                
                // Replace cell content with the input
                cell.innerHTML = '';
                cell.appendChild(input);
                input.focus();

                // Handler for when the input loses focus (blur) or Enter is pressed
                const saveChanges = () => {
                    const newValue = input.value.trim();
                    cell.innerHTML = newValue;

                    const row = cell.closest('tr');
                    const columnName = row.dataset.columnName;
                    const field = cell.dataset.field;

                    // --- THIS IS THE KEY CHANGE ---
                    // Find the corresponding object in our master array
                    const columnToUpdate = allColumnsData.find(col => col.ColumnName === columnName);

                    if (columnToUpdate) {
                        // Update the property on the object in the array
                        columnToUpdate[field] = newValue;
                        console.log("Updated in-memory data:", allColumnsData);
                    }
                };

                input.addEventListener('blur', saveChanges);
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        input.blur(); // Trigger the blur event to save
                    } else if (e.key === 'Escape') {
                        cell.innerHTML = originalText; // Cancel the edit
                    }
                });
            });


            // --- Listener 2: For CHECKBOX and TEXT cell editing (on change) ---
            // Add this unified listener to your DOMContentLoaded block
            dataSetColsBody.addEventListener('change', (event) => {
                const target = event.target; // The element that triggered the event (either a checkbox or a text input)

                // --- PATH 1: Handle Checkbox Changes ---
                if (target.classList.contains('editable-checkbox')) {
                    const isChecked = target.checked;
                    const row = target.closest('tr');
                    const columnName = row.dataset.columnName;
                    const field = target.dataset.field;
                    
                    console.log(`Saving Checkbox... Field: ${field}, New Value: ${isChecked}`);
                    const columnToUpdate = allColumnsData.find(col => col.ColumnName === columnName);

                    if (columnToUpdate) {
                        // Update the property on the object in the in-memory array
                        columnToUpdate[field] = isChecked;
                        console.log("Updated in-memory data:", allColumnsData);
                    }
                } 
                // --- PATH 2: Handle Text Input Changes (from a dblclick-generated input) ---
                else if (target.tagName === 'INPUT' && target.type === 'text') {
                    const newValue = target.value.trim();
                    const cell = target.parentElement; // The <td> containing the input
                    const row = cell.closest('tr');
                    const columnName = row.dataset.columnName;
                    const field = cell.dataset.field;

                    // Revert the cell to plain text now that the edit is done
                    cell.innerHTML = newValue;

                    console.log(`Saving Text... Field: ${field}, New Value: '${newValue}'`);
                    const columnToUpdate = allColumnsData.find(col => col.ColumnName === columnName);

                    if (columnToUpdate) {
                        // Update the property on the object in the in-memory array
                        columnToUpdate[field] = newValue;
                        console.log("Updated in-memory data:", allColumnsData);
                    }
                }
            });

 

            // =================================================================
            //  SUBMIT DATASET DETAILS LOGIC
            // =================================================================

            const manageDataSetForm = document.getElementById('manageDataSetForm');
            const submitButton = manageDataSetForm.querySelector('button[type="submit"]');

            /**
             * The main submit handler for the entire form.
             */
            manageDataSetForm.addEventListener('submit', async (event) => {
                // 1. Prevent the browser from reloading the page
                event.preventDefault();

                // 2. Provide immediate user feedback and prevent double-clicks
                const originalButtonText = submitButton.textContent;
                submitButton.disabled = true;
                submitButton.textContent = 'Saving...';

                try {
                    // 3. Gather all data from the form into a structured object
                    const formData = gatherFormData(allColumnsData);
                    console.log("Form Data to Submit:", formData);
                    // --- Client-side validation (optional but recommended) ---
                    if (!formData.name) {
                        showToast('Data Set Name is required.', 'info');
                        throw new Error('Validation failed: Name is required.');
                    }

                    // 4. Determine if this is a CREATE or UPDATE operation
                    const dataSetId = document.getElementById('dataSetSelection').value;

                    if (dataSetId === 'new') {
                        // --- CREATE (POST) LOGIC ---
                        
                        // Create the main data set record first
                        console.log("Creating new Data Set with payload:", formData);
                        const newDataSet = await createDataSet(formData); // Assume this returns the new object with its ID
                        const newDataSetId = newDataSet.DataSetID;
                        
                        showToast('Data Set created successfully!');

                    } else {
                        // --- UPDATE (PUT/PATCH) LOGIC ---
                        console.log(`Updating Data Set ID ${dataSetId} with payload:`, formData);
                        
                        // Update the main data set record;
                        await updateDataSet(dataSetId, formData);

                        showToast('Data Set updated successfully!');
                    }

                } catch (error) {
                    console.error('An error occurred during submission:', error);
                    showToast('Failed to save the Data Set. Please check the console for details.', 'error');
                } finally {
                    // 5. ALWAYS re-enable the button and restore its text
                    submitButton.disabled = false;
                    submitButton.textContent = originalButtonText;
                }
            });

    
        } catch (error) {
            console.error("Failed to fetch data sets:", error);
            // You could display an error message to the user here.
        }
    });


}

renderManageDataSourcePage()