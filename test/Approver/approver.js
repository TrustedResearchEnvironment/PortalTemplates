// Function to fetch data and render it in HTML
async function renderApproverPage() {
    try {
        // Fetch the data from the API
        const response = await window.loomeApi.runApiRequest(4);

        // Check if the response is a string and parse it
        const data = typeof response === 'string' ? JSON.parse(response) : response;

        // Ensure data.results is an array
        const results = Array.isArray(data.results) ? data.results : [];

        createTables(results, 'table-for-approval');
        createTables(results, 'table-approved');
        createTables(results, 'table-rejected');
        createTables(results, 'table-user-requests');

    } catch (error) {
        console.error("Error fetching or displaying data:", error);

        // Show an error message in the HTML if something goes wrong
        const container = document.getElementById('table-for-approval');
        container.innerHTML = `<p style="color:red;">An error occurred while fetching data.</p>`;
    }
    
    
}

function createTables(results, componentName) {
    // Filter the data (e.g., statusID === 1)
        const filteredData = results.filter(item => item.statusID === 1);

        // Create a Bootstrap table
        const table = document.createElement('table');
        table.className = 'table no-column-border mb-5'; // Add Bootstrap classes for styling
        table.style.minWidth = '200px';
    
        const colgroup = document.createElement('colgroup');
        for (let i = 0; i < 8; i++) {
            const col = document.createElement('col');
            col.style.minWidth = '25px';
            colgroup.appendChild(col);
        }
        table.appendChild(colgroup);
    
        // Add table headers
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        const headers = ['Project', 'Name', 'Status', 'Data Set', 'Requester', 'Requested', 'Approvers', 'Approved By'];
        if (componentName == 'table-for-approval') {
            headers.push('Actions');
        } 
        
        headers.forEach(header => {
            const th = document.createElement('th');
            th.innerHTML = `<p>${header}</p>`;
            th.scope = 'col';
            headerRow.appendChild(th);
        });
    
        thead.appendChild(headerRow);
        table.appendChild(thead);
    
        // Add table body
        const tbody = document.createElement('tbody');
        tbody.className = 'table-group-divider'
        filteredData.forEach(item => {
            const row = document.createElement('tr');
    
            const rowData = [
                item.projectID,
                item.name,
                item.statusID,
                item.dataSetID,
                item.requester,
                item.createDate,
                item.approvers,
                item.approvedBy
            ];
    
            rowData.forEach(cellData => {
                const td = document.createElement('td');
                td.textContent = cellData || ''; // Avoid `null` or `undefined` values
                row.appendChild(td);
            });
            
            if (componentName == 'table-for-approval') {
                const td = document.createElement('td');
                
                // Build a string of HTML for the buttons
                const htmlContent = `
                    <div class="btn-group pull-right">
                        <button class="btn btn-accent" title="View Request" data-bs-toggle="modal" data-bs-target="#viewRequestModal">
                            <i class="fa fa-eye" aria-hidden="true"></i>
                        </button>
                        <button class="btn btn-accent" title="View Data Set" data-bs-toggle="modal" data-bs-target="#viewDatasetModal">
                            <i class="fa fa-clone" aria-hidden="true"></i>
                        </button>
                        <button class="btn btn-accent" title="Approve Request" data-bs-toggle="modal" data-bs-target="#approveRequestModal">
                            <i class="fa fa-thumbs-up" aria-hidden="true"></i>
                        </button>
                        <button class="btn btn-accent" title="Reject Request" data-bs-toggle="modal" data-bs-target="#rejectRequestModal">
                            <i class="fa fa-thumbs-down" aria-hidden="true"></i>
                        </button>
                    </div>
                `;
                
                // Set the HTML content inside the cell
                td.innerHTML = htmlContent;
                
                // Append the cell (td) to the row
                row.appendChild(td);
                
                // Add event listeners after rendering the buttons
                td.querySelector('.fa-eye').parentElement.addEventListener('click', () => {
                    ViewRequest(item); // Call your JavaScript Function
                });
                
                td.querySelector('.fa-clone').parentElement.addEventListener('click', () => {
                    ViewDataSet(item); // Call ViewDataSet
                });
                
                td.querySelector('.fa-thumbs-up').parentElement.addEventListener('click', () => {
                    ApproveRequest(item); // Call ApproveRequest
                });
                
                td.querySelector('.fa-thumbs-down').parentElement.addEventListener('click', () => {
                    RejectRequest(item.requestID); // Call RejectRequest
                });
            }
    
            tbody.appendChild(row);
        });
    
        table.appendChild(tbody);
    
        // Append the table to an element in the DOM
        const container = document.getElementById(componentName);
        container.innerHTML = '';
        container.appendChild(table)
}

function ViewRequest(request) {
    // Get the modal's body element
    const modalBody = document.getElementById('viewRequestModalBody');

    // Populate the modal body with the provided HTML content (your markup)
    modalBody.innerHTML = `
        <form>
            <div class="form-group">
            <label for="Name" class="control-label">Request Name</label>
            <input id="Name" class="form-control" disabled="true" value="${request.name}">
        </div>
            <div class="form-group">
                <label for="ProjectID" class="control-label">Assist Project</label>
                <select id="ProjectID" disabled="true" class="form-control selectpicker valid">
                    <option value="-1">Assist Project 1</option>
                </select>
            </div>
            <div class="form-group">
                <label for="ScheduleRefresh" class="control-label">Scheduled Refresh</label>
                <select id="ScheduleRefresh" disabled="true" class="form-control selectpicker valid">
                    <option value="No Refresh">No Refresh</option>
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                </select>
            </div>
            <div class="row">
                <label for="ScheduleRefresh" class="control-label">Filter's for this Data Set</label>
                <div class="table-responsive">
                    <table class="table table-condensed table-striped">
                        <thead>
                            <tr>
                                <th>Column</th>
                                <th>Filter Type</th>
                                <th>Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            <!-- Example of empty table body; data can be populated later -->
                            <tr>
                                <td colspan="3">No filters available.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </form>
    `;

}

function ViewDataSet(request) {
    // Get the modal elements
    const modalBody = document.getElementById('viewDatasetModalBody');
    //const modalTitle = document.getElementById('viewDatasetModalLabel');

    // Set the title dynamically based on datasetID (example usage; modify as needed)
    //modalTitle.textContent = `Details for Dataset ID: ${datasetID}`;

    // Populate the modal body with the provided complex HTML content
    modalBody.innerHTML = `
        <form>
            <div class="form-group">
                <label for="Description" class="control-label">Description</label>
                <textarea rows="2" id="Name" disabled="true" class="form-control valid"></textarea>
            </div>
            <div class="form-group">
                <label for="Approvers" class="control-label">Owner</label>
                <input id="Approvers" disabled="true" class="form-control valid">
            </div>
            <div class="form-group">
                <label for="Approvers" class="control-label">Approvers</label>
                <input id="Approvers" disabled="true" class="form-control valid" value="${request.approvers}">
            </div>
            
            <div class="form-group">
                <label for="DataSetType" class="form-check-label">Data Source</label>
                <select disabled="true" class="form-control selectpicker valid">
                    <option value="1">BIS Data (pilot test)</option>
                    <option value="4">Barwon Health DB Source View 1</option>
                    <option value="25">Source Mock SQL Data for Testing</option>
                </select>
            </div>
            <div class="form-group">
                <div class="form-check">
                    <input id="Active" disabled="true" type="checkbox" class="form-check-input valid">
                    <label for="Active" class="form-check-label">Active</label>
                </div>
            </div>
            <br>
            <h6>Data Set Fields</h6>
            <div class="table-responsive">
                <table class="table table-condensed table-striped">
                    <tbody>
                        <tr>
                            <td>Table Name <input type="text" hidden="true"></td>
                            <td width="70%">
                                <select disabled="true" class="form-control selectpicker valid">
                                    <option value="7">dbo.vw_emergency_attendances</option>
                                    <option value="8">dbo.vw_inpatient_admissions_university_hospital_geelong</option>
                                    <option value="9">dbo.vw_link_emergency_attendances_inpatient_admissions</option>
                                </select>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <br>
            <h6>Meta Data</h6>
            <div class="table-responsive">
                <table class="table table-condensed table-striped">
                    <tbody>
                        <tr>
                            <td>Tag <input type="text" hidden="true"></td>
                            <td width="70%">
                                <input id="Name" disabled="true" class="form-control valid">
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <br>
            <h6>Columns</h6>
            <div class="container-fluid">
                <div class="d-flex align-items-center justify-content-between">
                    <!-- Section for Attendance Number -->
                    <div class="flex-grow-1">
                        <h6 style="color: orange;">[attendance_number] (varchar)</h6>
                        <input type="text" hidden="true">
                    </div>
                
                    <!-- Section for Checkboxes -->
                    <div class="d-flex">
                        <div class="form-check me-3">
                            <input id="Redact" disabled="true" type="checkbox" class="form-check-input">
                            <label for="Redact" class="form-check-label">Redact</label>
                        </div>
                        <div class="form-check me-3">
                            <input id="Tokenise" disabled="true" type="checkbox" class="form-check-input">
                            <label for="Tokenise" class="form-check-label">Tokenise</label>
                        </div>
                        <div class="form-check">
                            <input id="IsFilter" disabled="true" type="checkbox" class="form-check-input">
                            <label for="IsFilter" class="form-check-label">IsFilter</label>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="form-group col-md-6">
                        <label for="LogicalColumnName">Logical Name</label>
                        <input id="LogicalColumnName" disabled="true" class="form-control valid">
                    </div>
                    <div class="form-group col-md-6">
                        <label for="ExampleValue">Example Value</label>
                        <input id="ExampleValue" disabled="true" class="form-control valid">
                    </div>
                </div>
                <div class="row">
                    <div class="form-group col-md-12">
                        <label for="BusinessDescription">Business Description</label>
                        <input id="BusinessDescription" disabled="true" class="form-control valid">
                    </div>
                </div>
                <br>
            </div>
        </form>
    `;

}

function ApproveRequest(request) {
            // Get the modal elements
            const modalBody = document.getElementById('approveRequestModalBody');
            const modalTitle = document.getElementById('approveRequestModalLabel');

            // Update the modal title dynamically based on requestID
            modalTitle.textContent = `Approve Request: ${request.name}`;

            // Populate the modal body with the dynamic content
            modalBody.innerHTML = `
                <div class="col-md-12">
                    <form>
                        <div class="form-group">
                            <label for="ApprovalMessage" class="control-label">Approval Note</label>
                            <textarea id="ApprovalMessage" rows="5" placeholder="Note to the Researcher if approved" class="form-control valid"></textarea>
                        </div>
                        <div class="form-group">
                            <button type="submit" class="btn btn-accent">Approve</button>
                            <button type="button" class="btn btn-default" data-bs-dismiss="modal">Cancel</button>
                        </div>
                    </form>
                </div>
            `;
}

function RejectRequest(request) {
            // Get the modal elements
            const modalBody = document.getElementById('rejectRequestModalBody');
            const modalTitle = document.getElementById('rejectRequestModalLabel');

            // Update the modal title dynamically based on requestID
            modalTitle.textContent = `Reject Request: ${request.name}`;

            // Populate the modal body with the dynamic content
            modalBody.innerHTML = `
                <div class="col-md-12">
                    <form>
                        <div class="form-group">
                            <label for="RequestMessage" class="control-label">Rejection Note</label>
                            <textarea id="RequestMessage" rows="5" placeholder="Note to the Researcher if rejected" class="form-control valid"></textarea>
                        </div>
                        <div class="form-group">
                            <button type="submit" class="btn btn-accent">Reject</button>
                            <button type="button" class="btn btn-default" data-bs-dismiss="modal">Cancel</button>
                        </div>
                    </form>
                </div>
            `;
}

// Call the function
renderApproverPage();
