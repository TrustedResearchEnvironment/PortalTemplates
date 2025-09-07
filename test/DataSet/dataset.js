
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
async function renderDataSetPage() {
    try {
        console.log("IM IN")
        // Get full URL
        const url = window.parent.location.href;
        
        // Get parameters as an object
        const params = {};
        new URLSearchParams(window.parent.location.search).forEach((value, key) => {
            params[key] = value;
        });
        
        console.log({url, params});
        
        // Fetch the data from the API
        const response = await window.loomeApi.runApiRequest(6, {
            "DataSetID": params["DataSetID"] /* value for DataSetID */
        });

        // Check if the response is a string and parse it
        const dataset = typeof response === 'string' ? JSON.parse(response) : response;
        console.log(dataset)
        
        // Put in Data Set information
        const nameElement = document.getElementById('datasetName');
        // Update its content with the data from the JSON object
        if (nameElement) {
            nameElement.textContent = dataset.Name;
        }
        const lastUpdatedElement = document.getElementById('lastUpdated');
        // Update its content with the data from the JSON object
        if (lastUpdatedElement) {
            const formattingOptions = {year: 'numeric',month: 'long', day: 'numeric'};
            const date = new Date(dataset.ModifiedDate);
            const formattedDate = date.toLocaleDateString('en-US', formattingOptions);
            lastUpdatedElement.textContent = "Last Updated: " + formattedDate;
        }
        const descElement = document.getElementById('dataSetDescription');
        // Update its content with the data from the JSON object
        if (descElement) {
            descElement.textContent = dataset.Description;
        }
        const approverElement = document.getElementById('approverEmail');
        // Update its content with the data from the JSON object
        if (approverElement) {
            approverElement.textContent = dataset.Approvers;
        }
        const ownerElement = document.getElementById('ownerEmail');
        // Update its content with the data from the JSON object
        if (ownerElement) {
            ownerElement.textContent = dataset.Owner;
        }

        // Populate Data Dictionary table
        console.log('Data being passed to function:', dataset);
        populateDataTable(dataset.DataSetColumns);
        
        //Trigger for Create Request
        document.querySelector('#requestDatasetBtn').addEventListener('click', () => {
            CreateRequest();
        });
        
        const searchInput = document.getElementById('searchInput');

        searchInput.addEventListener('input', () => {
            const searchTerm = searchInput.value.toLowerCase();
        
            const filteredData = dataset.DataSetColumns.filter(item => {
                // Use String() to safely handle potential null or undefined values
                const columnName = String(item.ColumnName || '').toLowerCase();
                const description = String(item.Description || '').toLowerCase();
                const logicalName = String(item.LogicalName || '').toLowerCase();
        
                return columnName.includes(searchTerm) || 
                       description.includes(searchTerm) || 
                       logicalName.includes(searchTerm);
            });
            
            populateDataTable(filteredData);
        });
    } catch (error) {
        console.error("Error fetching or displaying data:", error);

        // Show an error message in the HTML if something goes wrong
        const container = document.getElementById('table-for-approval');
        container.innerHTML = `<p style="color:red;">An error occurred while fetching data.</p>`;
    }
    
    
}

renderDataSetPage()

    

