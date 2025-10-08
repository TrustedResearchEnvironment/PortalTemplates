const pageSize = 5;
let dataSourceTypeMap = new Map();


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

async function fetchDataSetFieldValue(data_set_id) {

    if (data_set_id === "new") {
        return {
            id: null,
            name: null
        };
    }

    const DATASETFIELDVALUE_API_ID = 36;
    const initialParams = { "data_set_id": data_set_id }; 
   
    const result = await getFromAPI(DATASETFIELDVALUE_API_ID, initialParams) 
    console.log("Fetched DataSet Field Value:", result);

    // If Field Value is a Table Name, the result is the ID of the table
    // Get the actual table name from another endpoint
    // Case 1: The value is a table ID, so we need to fetch the name
    if (result.FieldID === 3) { 
        const DATASOURCETABLEBYID_API_ID = 37;
        const tableId = result.Value; // This is the ID we need
        
        const tableInfo = await getFromApi(DATASOURCETABLEBYID_API_ID, { "TableId": tableId });
        
        // Return an object with BOTH the ID and the fetched name
        return {
            id: tableId,
            name: tableInfo.TableName
        };

    // Case 2: The value is just a simple value, not a reference to another table
    } else {
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
        
        let tableId = fetchedData.id;;
        let tableName = fetchedData.name;;

        let rowHtml = '';

        if (dataSetID === "new" || !tableId) {
            rowHtml = `
            <tr>
                <td>Table Name <input type="text" hidden="true"></td>
                <td width="70%">
                    <select class="form-control selectpicker">
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
                        <select class="form-control selectpicker">
                            <option value="${tableId}" selected>${tableName}</option>
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
    
    /**
     * Main handler that decides whether to clear or populate the form AND tables
     * based on the dropdown selection.
     * @param {Array<object>} allDataSets The complete list of data sets.
     * @param {Array<object>} allDataSources The complete list of data sources.
     */
    function updateFormForSelection(allDataSets, allDataSources) {
        const selectedId = selectionDropdown.value;

        if (selectedId === 'new') {
            clearForm(); // Assume clearForm also clears/hides the fields table
        } else {
            const selectedDataSet = allDataSets.find(ds => ds.DataSetID == selectedId);
            if (!selectedDataSet) return; // Safety check

            const dataSource = allDataSources.find(dsrc => dsrc.DataSourceID == selectedDataSet.DataSourceID);
            if (!dataSource) return; // Safety check

            // 1. Populate the main form fields (Name, Owner, etc.) AND the dataSource dropdown
            populateForm(selectedDataSet, dataSource);

            // 2. *** THE FIX IS HERE ***
            // Now that the form is populated, manually call the function to update the fields table.
            // Pass it the 'dataSource' object we just found.
            updateDataSetFieldsTable(dataSource); 
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
            
            // 4. Add the event listener to handle changes
            selectionDropdown.addEventListener('change', () => {
                // When the selection changes, call our main handler function.
                updateFormForSelection(allDataSets, allDataSources);
                
            });

            // This listener now ONLY handles the case where a user MANUALLY
            // changes the data source, perhaps to override the default for a data set.
            dataSourceDrpDwn.addEventListener('change', () => {
                // Find the currently selected data source object from the list
                const selectedDataSourceId = dataSourceDrpDwn.value;
                const selectedDataSource = allDataSources.find(src => src.DataSourceID == selectedDataSourceId);
                
                const selectedDataSetID = selectionDropdown.value;
                if (selectedDataSource) {
                    // Call the update function with the user's chosen data source
                    updateDataSetFieldsTable(selectedDataSource, selectedDataSetID);
                    updateMetaDataTable(selectedDataSource, selectedDataSetID);
                }
            });

           
    
            // 5. Call the function once on load to set the initial state (cleared form)
            updateFormForSelection(allDataSets, allDataSources);
    
        } catch (error) {
            console.error("Failed to fetch data sets:", error);
            // You could display an error message to the user here.
        }
    });


}

renderManageDataSourcePage()