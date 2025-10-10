const pageSize = 5;
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

async function fetchDataSetColumns(data_set_id) {
    const DATASETCOLUMNS_API_ID = 38;
    const initialParams = { "data_set_id": data_set_id }; 
   
    return getFromAPI(DATASETCOLUMNS_API_ID, initialParams)
}

/**
 * Populates the column table's tbody with data.
 * It now expects a single, consistent array of column objects.
 * @param {Array<Object>|null} columnsData - An array of column objects or null to show a placeholder.
 */
function displayColumnsTable(columnsData) {
    const tableBody = document.getElementById('dataSetColsBody');

    // Handles null, undefined, or empty array by showing the placeholder
    if (!columnsData || columnsData.length === 0) {
        const placeholderHtml = `
            <tr>
                <td colspan="7" class="text-center text-muted">
                    No columns to display. Select a Data Source and Table.
                </td>
            </tr>`;
        tableBody.innerHTML = placeholderHtml;
        return;
    }

    // --- DATA EXISTS ---
    // This single block of code now handles both new and existing data sets,
    // because the data has been pre-formatted by updateColumnsForTable.
    const rowsHtml = columnsData.map(col => `
        <tr data-id="${col.Id || ''}">
            <td>${col.ColumnName || ''}</td>
            <td class="editable-cell" data-field="LogicalColumnName">${col.LogicalColumnName || ''}</td>
            <td class="editable-cell" data-field="businessDescription">${col.BusinessDescription || ''}</td>
            <td class="editable-cell" data-field="exampleValue">${col.ExampleValue || ''}</td>
            <td class="checkbox-cell">
                <input class="form-check-input editable-checkbox" type="checkbox" data-field="redact" ${col.Redact ? 'checked' : ''}>
            </td>
            <td class="checkbox-cell">
                <input class="form-check-input editable-checkbox" type="checkbox" data-field="deIdentify" ${col.Tokenise ? 'checked' : ''}>
            </td>
            <td class="checkbox-cell">
                <input class="form-check-input editable-checkbox" type="checkbox" data-field="isFilter" ${col.IsFilter ? 'checked' : ''}>
            </td>
        </tr>
    `).join('');

    tableBody.innerHTML = rowsHtml;
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
        alert('Refresh clicked!');
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
        // Create the dropdown HTML with the fetched tables
        const optionsHtml = tables.map(table => `<option value="${table.Id}">${table.TableName}</option>`).join('');
        // Await the result from your function
        const fetchedData = await fetchDataSetFieldValue(dataSetID);
        console.log("Fetched DataSet Field Value 2:", fetchedData);
        let tableId = fetchedData.id;;
        let tableName = fetchedData.name;;

        let rowHtml = '';

        if (dataSetID === "new" || !tableId) {
            rowHtml = `
            <tr>
                <td>Table Name <input type="text" hidden="true"></td>
                <td width="70%">
                    <select id="tableNameSelector" class="form-control selectpicker">
                        <option value="-1">Select a Table</option>
                        ${optionsHtml}
                    </select>
                    <div class="validation-message"></div>
                </td>
            </tr>`;

        } else {
            rowHtml = `
                <tr>
                    <td>Table Name <input type="text" hidden="true"></td>
                    <td width="70%">
                        <select id="tableNameSelector" class="form-control selectpicker">
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
 * Renders a single static row with a text input field for a "Tag".
 * This is used for the SQL Database data source type.
 * @param {HTMLElement} tbody - The tbody element of the metadata table.
 * @param {object} dataSource - (Unused) Kept for consistent function signature.
 * @param {number|null} dataSetID - (Unused) Kept for consistent function signature.
 */
function renderSqlTableSelectorMetaData(tbody, dataSource, dataSetID) {
    // This is the static HTML provided in the requirement.
    const rowHtml = `
        <tr>
            <td>Tag <input type="hidden"></td>
            <td width="70%">
                <input id="Name" class="form-control valid">
            </td>
        </tr>
    `;

    // Set the table body's content to this single row.
    tbody.innerHTML = rowHtml;
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
            renderSqlTableSelectorMetaData(tbody, dataSource, dataSetID);
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
 * The single, smart function to update the columns table.
 * It handles the logic for both new and existing data sets.
 * It should be called WITHOUT arguments from event listeners.
 */
async function updateColumnsForTable() {
    const dataSetId = document.getElementById('dataSetSelection').value;

    // --- SCENARIO 1: Editing an EXISTING Data Set ---
    if (dataSetId && dataSetId !== 'new') {
        try {
            console.log(`Fetching columns for existing Data Set ID: ${dataSetId}...`);
            const columnsData = await fetchDataSetColumns(dataSetId);
            // The data from this API is already in the correct format.
            displayColumnsTable(columnsData);
        } catch (error) {
            console.error(`Error fetching columns for Data Set ID ${dataSetId}:`, error);
            displayColumnsTable(null);
        }
        return; // We're done with this path
    }

    // --- SCENARIO 2: Creating a NEW Data Set ---
    if (dataSetId === 'new') {
        const tableNameSelector = document.getElementById('tableNameSelector');

        // Check if the table selector exists and has a valid table chosen
        if (tableNameSelector && tableNameSelector.value && tableNameSelector.value !== '-1') {
            const tableId = tableNameSelector.value;
            try {
                console.log(`Fetching schema for new Data Set from Table ID: ${tableId}...`);
                const tableDataArray = await fetchLoomeDataSourceTablesByTableId(tableId);

                if (tableDataArray && tableDataArray.length > 0) {
                    const columnListString = tableDataArray[0].ColumnList;
                    const columnNames = columnListString.split(",").map(name => name.trim());

                    // *** THIS IS THE CRITICAL TRANSFORMATION STEP ***
                    // Convert the simple array of strings into the standard array of objects
                    // that displayColumnsTable expects.
                    const formattedColumns = columnNames.map(name => ({
                        Id: null, // No ID for new columns yet
                        ColumnName: name,
                        LogicalColumnName: '', // Default to empty
                        BusinessDescription: '',
                        ExampleValue: '',
                        Redact: false, // Default to unchecked
                        Tokenise: false,
                        IsFilter: false
                    }));
                    
                    displayColumnsTable(formattedColumns);
                } else {
                    displayColumnsTable(null); // No table data found
                }
            } catch (error) {
                console.error(`Error fetching schema for Table ID ${tableId}:`, error);
                displayColumnsTable(null);
            }
        } else {
            // If it's a new data set but no table is selected, show the placeholder.
            displayColumnsTable(null);
        }
        return; // We're done with this path
    }

    // --- FALLBACK ---
    // If neither condition is met, ensure the table is clear.
    displayColumnsTable(null);
}

/**
 * Gathers all data from the form fields and tables into a structured object.
 * @returns {object} An object containing mainDetails and columns arrays.
 */
function gatherFormData() {
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
    const columns = [];
    const colsTableBody = document.getElementById('dataSetColsBody');
    colsTableBody.querySelectorAll('tr').forEach(row => {
        // Skip the placeholder row if it exists
        if (row.querySelector('td[colspan]')) {
            return;
        }

        const columnData = {
            // Use dataset.id for existing, or null for new
            //Id: row.dataset.id ? parseInt(row.dataset.id, 10) : null,
            ColumnName: row.cells[0].textContent.trim(),
            LogicalColumnName: row.cells[1].textContent.trim(),
            BusinessDescription: row.cells[2].textContent.trim(),
            ExampleValue: row.cells[3].textContent.trim(),
            Redact: row.querySelector('[data-field="redact"]').checked,
            Tokenise: row.querySelector('[data-field="deIdentify"]').checked,
            IsFilter: row.querySelector('[data-field="isFilter"]').checked
        };
        columns.push(columnData);
    });

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
        optOutMessage: "{{OptOutMessage}}",
        optOutList: "{{OptOutList}}",
        optOutColumn: "{{OptOutColumn}}"
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

async function updateDataSet(id, data) {
    const UPDATE_DATASET_API_ID = 28;

    const payload = {
        ...data, // Spread all properties from the original object
        optOutMessage: "",
        optOutList: "",
        optOutColumn: ""
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

// async function addOrUpdateColumns(dataSetId, columnsData) {
//     const ADD_OR_UPDATE_COLUMNS_API_ID = 39;
// }

// // You would also need an endpoint for saving the metadata.
// async function addOrUpdateMetadata(dataSetId, metadata) {
//     console.log(`API CALL: POST /api/datasets/${dataSetId}/metadata`, metadata);
//     return { success: true };
// }

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
    
    // This is inside your renderManageDataSourcePage function
    async function updateFormForSelection(allDataSets, allDataSources) {
        const selectedId = selectionDropdown.value;

        if (selectedId === 'new') {
            clearForm();
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
            
            // --- FIX IS HERE ---
            // 3. Now that a valid, existing data set is selected,
            //    immediately call the function to update the columns table.
            //    We pass 'selectedId' because it IS the dataSetId we need.
            await updateColumnsForTable(selectedId);
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

            // 4. Add the event listener to handle changes
            // Listener for TOP-LEVEL data set selection
            selectionDropdown.addEventListener('change', async () => {
                await updateFormForSelection(allDataSets, allDataSources); // This updates the form on the left
                await updateColumnsForTable(); // This now updates the columns on the right
            });

            // Listener for DATA SOURCE dropdown
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
                    await updateColumnsForTable();
                } else {
                    // If no source is selected, clear everything.
                    displayColumnsTable(null);
                    // You might also want to clear the metadata tables here.
                }
});

            // Listener for TABLE NAME dropdown
            dataSetFieldsTable.addEventListener('change', async (event) => {
                if (event.target.id === 'tableNameSelector') {
                    await updateColumnsForTable();
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
                    cell.innerHTML = newValue; // Revert cell to text

                    // --- THIS IS WHERE YOU SAVE THE TEXT CHANGE TO THE SERVER ---
                    const row = cell.closest('tr');
                    const id = row.dataset.id;
                    const field = cell.dataset.field;
                    console.log(`Saving Text... ID: ${id}, Field: ${field}, New Value: '${newValue}'`);
                    
                    // Example API call:
                    // updateColumnField(id, { [field]: newValue });
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


            // --- Listener 2: For CHECKBOX cell editing (on change) ---
            // We use 'change' instead of 'click' as it's more semantically correct for form inputs.
            dataSetColsBody.addEventListener('change', (event) => {
                const checkbox = event.target;
                // Only act on our specific editable checkboxes
                if (!checkbox.classList.contains('editable-checkbox')) {
                    return;
                }

                const isChecked = checkbox.checked;
                
                // --- THIS IS WHERE YOU SAVE THE CHECKBOX CHANGE TO THE SERVER ---
                const row = checkbox.closest('tr');
                const id = row.dataset.id;
                const field = checkbox.dataset.field;
                console.log(`Saving Checkbox... ID: ${id}, Field: ${field}, New Value: ${isChecked}`);

                // Example API call:
                // updateColumnField(id, { [field]: isChecked });
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
                    const formData = gatherFormData();
                    console.log("Form Data to Submit:", formData);
                    // --- Client-side validation (optional but recommended) ---
                    if (!formData.name) {
                        alert('Data Set Name is required.');
                        throw new Error('Validation failed: Name is required.');
                    }

                    // 4. Determine if this is a CREATE or UPDATE operation
                    const dataSetId = document.getElementById('dataSetSelection').value;

                    if (dataSetId === 'new') {
                        // --- CREATE (POST) LOGIC ---
                        
                        // a. Create the main data set record first
                        console.log("Creating new Data Set with payload:", formData);
                        const newDataSet = await createDataSet(formData); // Assume this returns the new object with its ID
                        const newDataSetId = newDataSet.DataSetID;

                        // b. Now, save the associated columns
                        // console.log("Adding columns for new Data Set ID:", newDataSetId, formData.columns);
                        // await addOrUpdateColumns(newDataSetId, formData.columns);
                        
                        alert('Data Set created successfully!');
                        // Optional: Reload the page or update the dropdown with the new item
                        window.location.reload(); 

                    } else {
                        // --- UPDATE (PUT/PATCH) LOGIC ---
                        console.log(`Updating Data Set ID ${dataSetId} with payload:`, formData);
                        
                        // a. Update the main data set record;
                        await updateDataSet(dataSetId, formData);

                        // b. Save/update the associated columns
                        // console.log(`Updating columns for Data Set ID ${dataSetId}:`, formData.columns);
                        // await addOrUpdateColumns(dataSetId, formData.columns);

                        alert('Data Set updated successfully!');
                    }

                } catch (error) {
                    console.error('An error occurred during submission:', error);
                    alert('Failed to save the Data Set. Please check the console for details.');
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