


// function renderTable(sortState, containerId, data, config) {
//     const container = document.getElementById(containerId);
//     container.innerHTML = '';
//     const table = document.createElement('table');
//     table.className = 'table table-striped table-bordered table-hover';
    
//     // ... (thead creation code is unchanged) ...
//     const thead = document.createElement('thead');
//     thead.className = 'table-dark';
//     const headerRow = document.createElement('tr');
//     const headers = ['Project', 'Name', 'Status', 'Data Set'];
//     if (config.showActions) {
//         headers.push('Actions');
//     }
//     headers.forEach(headerText => {
//         const th = document.createElement('th');
//         const columnKey = headerText.toLowerCase().replace(/ /g, '');
//         th.setAttribute('data-column', columnKey);
//         th.innerHTML = `${headerText} <i class="fas fa-sort"></i>`;
//         headerRow.appendChild(th);
//     });
//     thead.appendChild(headerRow);
//     table.appendChild(thead);


//     const tbody = document.createElement('tbody');
//     if (data.length === 0) {
//         const colSpan = config.showActions ? 5 : 4;
//         tbody.innerHTML = `<tr><td colspan="${colSpan}" class="text-center">No requests found.</td></tr>`;
//     } else {
//         data.forEach(item => {
//             const row = document.createElement('tr');
//             const statusClass = {
//                 'Pending Approval': 'bg-warning text-dark',
//                 'Approved': 'bg-success',
//                 'Rejected': 'bg-danger',
//                 'Finalised': 'bg-info text-dark'
//             }[item.status] || 'bg-secondary';

//             // The innerHTML part is correct and doesn't need to change
//             row.innerHTML = `
//                 <td>${item.project}</td>
//                 <td>${item.name}</td>
//                 <td><span class="badge ${statusClass}">${item.status}</span></td>
//                 <td>${item.dataSet}</td>
//                 ${config.showActions ?
//                     `<td>
//                         <div class="btn-group">
//                             <button type="button" class="btn btn-accent btn-sm" title="Edit"
//                                     data-bs-toggle="modal"
//                                     data-bs-target="#editRequestModal">
//                                 <i class="fa fa-edit"></i>
//                             </button>
//                             <button type="button" class="btn btn-accent btn-sm" title="Delete"
//                                     data-bs-toggle="modal"
//                                     data-bs-target="#deleteRequestModal">
//                                 <i class="fa fa-trash"></i>
//                             </button>
//                         </div>
//                     </td>`
//                     : ''
//                 }
//             `;
//             tbody.appendChild(row);

//             // <<< CHANGE HERE: Only add listeners if the buttons exist
//             if (config.showActions) {
//                 const editButton = row.querySelector('.fa-edit')?.parentElement;
//                 const deleteButton = row.querySelector('.fa-trash')?.parentElement;

//                 if (editButton) {
//                     editButton.addEventListener('click', () => {
//                         EditRequest(item); // Call your JavaScript Function
//                     });
//                 }
//                 if (deleteButton) {
//                     deleteButton.addEventListener('click', () => {
//                         DeleteRequest(item); // Call your JavaScript Function
//                     });
//                 }
//             }
//         });
//     }
//     table.appendChild(tbody);
//     container.appendChild(table);
    
//     // The sorting functions are called after the loop, which is correct
//     addSorting(sortState, containerId, data, config);
//     updateSortIcons(sortState, containerId);
// }

/**
 * Renders a data table with Tailwind CSS styling.
 * This is a refactored version of the original function to match the new design.
 * @param {string} containerId - The ID of the element to render the table into.
 * @param {Array} data - The array of data objects to display.
 * @param {object} config - Configuration object, e.g., { showActions: true }.
 */
function renderTable(containerId, data, config) {
    const container = document.getElementById(containerId);
    container.innerHTML = ''; // Clear previous content

    // --- STYLE CHANGE: Main table classes updated to Tailwind ---
    const table = document.createElement('table');
    table.className = 'w-full divide-y divide-gray-200';

    // --- STYLE CHANGE: Thead class updated ---
    const thead = document.createElement('thead');
    thead.className = 'bg-gray-50';
    const headerRow = document.createElement('tr');

    // Headers logic remains the same
    const headers = ['Project', 'Name', 'Status', 'Data Set'];
    if (config.showActions) {
        headers.push('Actions');
    }

    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.scope = 'col';
        // --- STYLE CHANGE: TH classes updated to Tailwind ---
        th.className = 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer';

        const columnKey = headerText.toLowerCase().replace(/ /g, '');
        th.setAttribute('data-column', columnKey);

        // --- STYLE CHANGE: Added a span for better sort icon styling ---
        th.innerHTML = `${headerText} <span class="ml-1 text-gray-400"></span>`;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // --- STYLE CHANGE: Tbody classes updated ---
    const tbody = document.createElement('tbody');
    tbody.className = 'bg-white divide-y divide-gray-200';

    if (data.length === 0) {
        const colSpan = headers.length; // More reliable way to calculate colspan
        // --- STYLE CHANGE: Added Tailwind classes to the "empty" cell ---
        tbody.innerHTML = `<tr><td colspan="${colSpan}" class="px-6 py-4 text-center text-sm text-gray-500">No requests found.</td></tr>`;
    } else {
        data.forEach(item => {
            const row = document.createElement('tr');

            // --- STYLE CHANGE: Map statuses to Tailwind badge classes ---
            const statusClasses = {
                'Pending Approval': 'bg-yellow-100 text-yellow-800',
                'Approved': 'bg-green-100 text-green-800',
                'Rejected': 'bg-red-100 text-red-800',
                'Finalised': 'bg-blue-100 text-blue-800'
            }[item.status] || 'bg-gray-100 text-gray-800';
            
            // --- STYLE CHANGE: Base classes for all table cells ---
            const tdClasses = 'px-6 py-4 whitespace-nowrap text-sm text-gray-800';
            const actionButtonClasses = 'p-1 text-gray-400 rounded-md hover:bg-gray-100 hover:text-gray-600 focus:outline-none';

            // --- STYLE CHANGE: Updated the entire innerHTML template with Tailwind classes ---
            row.innerHTML = `
                <td class="${tdClasses}">${item.project}</td>
                <td class="${tdClasses}">${item.name}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses}">
                        ${item.status}
                    </span>
                </td>
                <td class="${tdClasses}">${item.dataSet}</td>
                ${config.showActions ? `
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div class="inline-flex items-center space-x-2">
                            <button type="button" class="${actionButtonClasses}" title="Edit" 
                                    data-bs-toggle="modal" data-bs-target="#editRequestModal">
                                <i class="fa fa-edit"></i>
                            </button>
                            <button type="button" class="${actionButtonClasses}" title="Delete" 
                                    data-bs-toggle="modal" data-bs-target="#deleteRequestModal">
                                <i class="fa fa-trash"></i>
                            </button>
                        </div>
                    </td>`
                : ''}
            `;
            tbody.appendChild(row);

            // This event listener logic does not need to change, as it finds elements by class.
            if (config.showActions) {
                const editButton = row.querySelector('.fa-edit')?.parentElement;
                if (editButton) {
                    editButton.addEventListener('click', () => {
                        EditRequest(item);
                    });
                }
                const deleteButton = row.querySelector('.fa-trash')?.parentElement;
                if (deleteButton) {
                    deleteButton.addEventListener('click', () => {
                        DeleteRequest(item);
                    });
                }
            }
        });
    }

    table.appendChild(tbody);
    container.appendChild(table);
}


function addSorting(sortState, containerId, data, config) {
    const stateKey = containerId;
    const headers = document.querySelectorAll(`#${containerId} thead th`);
    headers.forEach(header => {
        const column = header.getAttribute('data-column');
        if (column === 'actions') return;
        header.addEventListener('click', () => {
            if (sortState[stateKey].column === column) {
                sortState[stateKey].direction = sortState[stateKey].direction === 'asc' ? 'desc' : 'asc';
            } else {
                sortState[stateKey].column = column;
                sortState[stateKey].direction = 'asc';
            }
            sortAndRender(sortState, containerId, data, config);
        });
    });
}

function sortAndRender(sortState, containerId, data, config) {
    const stateKey = containerId;
    const { column, direction } = sortState[stateKey];
    const sortedData = [...data].sort((a, b) => {
        if (!column) return 0;
        const valA = a[column];
        const valB = b[column];
        const comparison = String(valA).localeCompare(String(valB));
        return direction === 'asc' ? comparison : -comparison;
    });
    renderTable(containerId, sortedData, config);
    updateSortIcons(containerId);
}

function updateSortIcons(sortState, containerId) {
    const stateKey = containerId;
    const { column, direction } = sortState[stateKey];
    const headers = document.querySelectorAll(`#${containerId} thead th`);
    headers.forEach(header => {
        const icon = header.querySelector('i');
        const headerColumn = header.getAttribute('data-column');
    });
}

// Placeholder for handling approve/reject clicks
function handleAction(action, requestId) {
    alert(`Action: ${action} on Request ID: ${requestId}`);
    // You can add modal pop-ups or API calls here
}


function EditRequest(request) {
    // Get the modal's body element
    const modalBody = document.getElementById('editRequestModalBody');

    // Populate the modal body with the provided HTML content (your markup)
    modalBody.innerHTML = `
    <!-- Body Section -->
  
        <div class="container-fluid">
            <form>
                <!-- Request Name Field -->
                <div class="form-group">
                    <label for="Name" class="control-label">Request Name</label>
                    <input id="Name" class="form-control" placeholder=${request.name}>
                </div>

                <!-- Project Field -->
                <div class="form-group">
                    <label for="ProjectID" class="control-label">Assist Project</label>
                    <select id="ProjectID" class="form-select">
                        <option value="-1">${request.project}</option>
                        <option value="82">Project 1 Placeholder</option>
                        <option value="84">Project 2 Placeholder</option>
                        <option value="85">Project 3 Placeholder</option>
                        <option value="86">Project 4 Placeholder</option>
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

                <!-- Filters Table Section -->
                <div class="row">
                    <label for="Filters" class="control-label">Filters for this Data Set</label>
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
                                <!-- Example Row Template -->
                                <tr>
                                    <td>[Column Name Placeholder]</td>
                                    <td>
                                        <select id="FilterType" class="form-control selectpicker">
                                            <option value="None">[None]</option>
                                            <option value="=">[Equal To]</option>
                                            <option value="&lt;&gt;">[Not Equal To]</option>
                                            <option value="Between">[Between]</option>
                                            <option value="&lt;">[Less Than]</option>
                                            <option value="&lt;=">[Less Than or Equal]</option>
                                            <option value="&gt;">[Greater Than]</option>
                                            <option value="&gt;=">[Greater Than or Equal]</option>
                                        </select>
                                    </td>
                                    <td>
                                        <div class="row">
                                            <input id="Value1" class="form-control" placeholder="[Value Placeholder]">
                                        </div>
                                    </td>
                                </tr>
                                <!-- Add Additional Rows Dynamically -->
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="form-group">
                    <button type="submit" class="btn btn-primary">Save</button>
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                </div>
            </form>
        </div>
    `;

}

function DeleteRequest(request) {
    // Get the modal's body element
    const modalBody = document.getElementById('deleteRequestModalBody');
    // Assuming request.CreateDate is a valid date string like "2025-09-04 01:54:39.140"
    const createdDate = new Date(request.CreateDate);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = !isNaN(createdDate.getTime()) 
        ? createdDate.toLocaleDateString('en-US', options) 
        : 'N/A'; // Handle invalid dates gracefully

    // Populate the modal body with the provided HTML content (your markup)
    modalBody.innerHTML = `
       <!-- 2. Modal Body -->
                <!-- Warning Message -->
                <div class="alert alert-danger" role="alert">
                    <strong>Warning:</strong> Are you sure you want to delete this request? This action cannot be undone.
                </div>

                <p>You are about to permanently delete the following item:</p>

                <!-- Details of the item to be deleted -->
                <div class="table-responsive">
                    <table class="table table-bordered table-sm">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Status</th>
                                <th>Data Set</th>
                                <th>Created</th>
                            </tr>
                        </thead>
                        <tbody id="deleteRequestDetailsBody">
                            <!-- Dynamic content will be injected here. Example row below. -->
                            <tr>
                                <td>${request.name}</td>
                                <td>${request.status}</td>
                                <td>${request.dataSet}</td>
                                <td>${formattedDate}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

            <!-- 3. Modal Footer -->
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-danger">Confirm Delete</button>
            </div>
    `;
}

// async function renderRequestsPage() {
//     try {
//         // // Get full URL
//         // const url = window.parent.location.href;
        
//         // // Get parameters as an object
//         // const params = {};
//         // new URLSearchParams(window.parent.location.search).forEach((value, key) => {
//         //     params[key] = value;
//         // });
        
//         // console.log({url, params});
        
//         // // Fetch the data from the API
//         // const response = await window.loomeApi.runApiRequest(6, {
//         //     "DataSetID": params["DataSetID"] /* value for DataSetID */
//         // });

//         // // Check if the response is a string and parse it
//         // const dataset = typeof response === 'string' ? JSON.parse(response) : response;
//         // console.log(dataset)
//          // --- 1. NEW MASTER DATA SOURCE (from your provided table) ---
//         const rawRequestData = [
//             {"RequestID":435,"ProjectID":82,"Name":"TestNEWDeIdentificationAlgo","StatusID":3,"DataSetID":2,"Approvers":"ria.yangzon@bizdata.com.au","CurrentlyApproved":"ria.yangzon@bizdata.com.au;","CreateDate":"2025-08-28 02:01:54.667","CreateUser":"ria.yangzon@bizdata.com.au","ModifiedDate":"2025-08-28 02:02:04.710","ApprovedDate":"2025-08-28 02:02:04.710","FinalisedDate":"2025-08-28 02:05:03.973","ScheduledRefresh":"No Refresh","RequestMessage":null,"RejectedBy":null,"RejectedDate":"2025-08-28 02:01:54.667"},
//             {"RequestID":436,"ProjectID":82,"Name":"REDCAP_TestOriginalDeIdentification","StatusID":3,"DataSetID":1,"Approvers":"ria.yangzon@bizdata.com.au","CurrentlyApproved":"ria.yangzon@bizdata.com.au;","CreateDate":"2025-08-28 08:47:41.390","CreateUser":"ria.yangzon@bizdata.com.au","ModifiedDate":"2025-08-28 08:55:25.357","ApprovedDate":"2025-08-28 08:55:25.357","FinalisedDate":"2025-08-28 09:00:58.180","ScheduledRefresh":"No Refresh","RequestMessage":null,"RejectedBy":null,"RejectedDate":"2025-08-28 08:47:41.390"},
//             {"RequestID":437,"ProjectID":82,"Name":"REDCAP_TestNewDeIdentification","StatusID":3,"DataSetID":1,"Approvers":"ria.yangzon@bizdata.com.au","CurrentlyApproved":"ria.yangzon@bizdata.com.au;","CreateDate":"2025-08-28 09:24:18.977","CreateUser":"ria.yangzon@bizdata.com.au","ModifiedDate":"2025-08-28 09:24:32.453","ApprovedDate":"2025-08-28 09:24:32.453","FinalisedDate":"2025-08-28 09:34:01.340","ScheduledRefresh":"No Refresh","RequestMessage":null,"RejectedBy":null,"RejectedDate":"2025-08-28 09:24:18.977"},
//             {"RequestID":433,"ProjectID":82,"Name":"TestOriginalDeIdentificationAlgo","StatusID":3,"DataSetID":2,"Approvers":"ria.yangzon@bizdata.com.au","CurrentlyApproved":"ria.yangzon@bizdata.com.au;","CreateDate":"2025-08-28 00:44:10.913","CreateUser":"ria.yangzon@bizdata.com.au","ModifiedDate":"2025-08-28 01:02:12.887","ApprovedDate":"2025-08-28 01:02:12.887","FinalisedDate":"2025-08-28 01:15:00.760","ScheduledRefresh":"No Refresh","RequestMessage":null,"RejectedBy":null,"RejectedDate":"2025-08-28 00:44:10.913"},
//             {"RequestID":444,"ProjectID":86,"Name":"TestNewHashingOnSQL","StatusID":3,"DataSetID":2,"Approvers":"ria.yangzon@bizdata.com.au","CurrentlyApproved":"ria.yangzon@bizdata.com.au;","CreateDate":"2025-09-01 04:25:35.957","CreateUser":"ria.yangzon@bizdata.com.au","ModifiedDate":"2025-09-01 04:29:56.843","ApprovedDate":"2025-09-01 04:29:56.843","FinalisedDate":"2025-09-01 04:42:16.860","ScheduledRefresh":"No Refresh","RequestMessage":null,"RejectedBy":null,"RejectedDate":"2025-09-01 04:25:35.957"},
//             {"RequestID":445,"ProjectID":86,"Name":"TestNewHashingOnREDCap","StatusID":3,"DataSetID":1,"Approvers":"ria.yangzon@bizdata.com.au","CurrentlyApproved":"ria.yangzon@bizdata.com.au;","CreateDate":"2025-09-01 04:26:20.337","CreateUser":"ria.yangzon@bizdata.com.au","ModifiedDate":"2025-09-01 04:30:01.230","ApprovedDate":"2025-09-01 04:30:01.230","FinalisedDate":"2025-09-01 04:42:16.860","ScheduledRefresh":"No Refresh","RequestMessage":null,"RejectedBy":null,"RejectedDate":"2025-09-01 04:26:20.337"},
//             {"RequestID":448,"ProjectID":86,"Name":"TestOLDHashingOnREDCap","StatusID":3,"DataSetID":1,"Approvers":"ria.yangzon@bizdata.com.au","CurrentlyApproved":"ria.yangzon@bizdata.com.au;","CreateDate":"2025-09-01 05:04:14.883","CreateUser":"ria.yangzon@bizdata.com.au","ModifiedDate":"2025-09-01 05:04:27.590","ApprovedDate":"2025-09-01 05:04:27.590","FinalisedDate":"2025-09-01 05:09:19.817","ScheduledRefresh":"No Refresh","RequestMessage":null,"RejectedBy":null,"RejectedDate":"2025-09-01 05:04:14.883"},
//             {"RequestID":454,"ProjectID":86,"Name":"TestOriginalHashingOnFolder","StatusID":3,"DataSetID":36,"Approvers":"ria.yangzon@bizdata.com.au","CurrentlyApproved":"ria.yangzon@bizdata.com.au;","CreateDate":"2025-09-02 02:47:59.493","CreateUser":"ria.yangzon@bizdata.com.au","ModifiedDate":"2025-09-02 02:48:11.730","ApprovedDate":"2025-09-02 02:48:11.730","FinalisedDate":"2025-09-02 02:50:15.767","ScheduledRefresh":"No Refresh","RequestMessage":null,"RejectedBy":null,"RejectedDate":"2025-09-02 02:47:59.493"},
//             {"RequestID":447,"ProjectID":86,"Name":"TestOLDHashingOnSQL","StatusID":3,"DataSetID":2,"Approvers":"ria.yangzon@bizdata.com.au","CurrentlyApproved":"ria.yangzon@bizdata.com.au;","CreateDate":"2025-09-01 05:03:52.937","CreateUser":"ria.yangzon@bizdata.com.au","ModifiedDate":"2025-09-01 05:04:31.200","ApprovedDate":"2025-09-01 05:04:31.200","FinalisedDate":"2025-09-01 05:09:19.817","ScheduledRefresh":"No Refresh","RequestMessage":null,"RejectedBy":null,"RejectedDate":"2025-09-01 05:03:52.937"},
//             {"RequestID":455,"ProjectID":82,"Name":"TestRiaRequest","StatusID":1,"DataSetID":2,"Approvers":"ria.yangzon@bizdata.com.au","CurrentlyApproved":null,"CreateDate":"2025-09-04 01:54:39.140","CreateUser":"ria.yangzon@bizdata.com.au","ModifiedDate":"2025-09-04 01:54:39.140","ApprovedDate":"2025-09-04 01:54:39.140","FinalisedDate":"2025-09-04 01:54:39.140","ScheduledRefresh":"No Refresh","RequestMessage":null,"RejectedBy":null,"RejectedDate":"2025-09-04 01:54:39.140"},
//             {"RequestID":452,"ProjectID":86,"Name":"TestNEWHashingOnFolder","StatusID":3,"DataSetID":36,"Approvers":"ria.yangzon@bizdata.com.au","CurrentlyApproved":"ria.yangzon@bizdata.com.au;","CreateDate":"2025-09-02 02:40:42.983","CreateUser":"ria.yangzon@bizdata.com.au","ModifiedDate":"2025-09-02 02:42:35.113","ApprovedDate":"2025-09-02 02:42:35.113","FinalisedDate":"2025-09-02 02:44:02.573","ScheduledRefresh":"No Refresh","RequestMessage":null,"RejectedBy":null,"RejectedDate":"2025-09-02 02:40:42.983"},
//             {"RequestID":450,"ProjectID":82,"Name":"FOLDER_TestOriginalDeIdentification","StatusID":3,"DataSetID":36,"Approvers":"ria.yangzon@bizdata.com.au","CurrentlyApproved":"ria.yangzon@bizdata.com.au;","CreateDate":"2025-09-02 02:08:04.800","CreateUser":"ria.yangzon@bizdata.com.au","ModifiedDate":"2025-09-02 02:08:15.070","ApprovedDate":"2025-09-02 02:08:15.070","FinalisedDate":"2025-09-02 02:13:31.327","ScheduledRefresh":"No Refresh","RequestMessage":null,"RejectedBy":null,"RejectedDate":"2025-09-02 02:08:04.800"},
//             {"RequestID":451,"ProjectID":82,"Name":"FOLDER_TestNEWDeIdentification","StatusID":3,"DataSetID":36,"Approvers":"ria.yangzon@bizdata.com.au","CurrentlyApproved":"ria.yangzon@bizdata.com.au;","CreateDate":"2025-09-02 02:29:14.497","CreateUser":"ria.yangzon@bizdata.com.au","ModifiedDate":"2025-09-02 02:29:27.717","ApprovedDate":"2025-09-02 02:29:27.717","FinalisedDate":"2025-09-02 02:31:39.597","ScheduledRefresh":"No Refresh","RequestMessage":null,"RejectedBy":null,"RejectedDate":"2025-09-02 02:29:14.497"},
//             // ADDED for demonstration to populate all tabs
//             {"RequestID":456,"ProjectID":85,"Name":"Marketing Analysis","StatusID":2,"DataSetID":10,"Approvers":"approver@test.com","CurrentlyApproved":"approver@test.com;","CreateDate":"2025-09-05 10:00:00.000","CreateUser":"user@test.com","ModifiedDate":"2025-09-05 10:05:00.000","ApprovedDate":"2025-09-05 10:05:00.000","FinalisedDate":null,"ScheduledRefresh":"Weekly","RequestMessage":null,"RejectedBy":null,"RejectedDate":null},
//             {"RequestID":457,"ProjectID":85,"Name":"Budget Review","StatusID":4,"DataSetID":11,"Approvers":"approver@test.com","CurrentlyApproved":null,"CreateDate":"2025-09-06 11:00:00.000","CreateUser":"user@test.com","ModifiedDate":"2025-09-06 11:05:00.000","ApprovedDate":null,"FinalisedDate":null,"ScheduledRefresh":"No Refresh","RequestMessage":"Insufficient data","RejectedBy":"admin@test.com","RejectedDate":"2025-09-06 11:05:00.000"}
//         ];
        
//         // --- 2. DATA TRANSFORMATION AND MAPPING ---
//         const statusMap = {
//             1: 'Pending Approval',
//             2: 'Approved',
//             3: 'Finalised',
//             4: 'Rejected'
//         };
        
//         // Transform the raw data into the structure our table function expects
//         const allRequests = rawRequestData.map(item => ({
//             // Keep all original data for potential use in modals
//             ...item, 
//             // Map the keys to the ones used by the rendering function
//             project: `Project ${item.ProjectID}`,
//             name: item.Name,
//             status: statusMap[item.StatusID] || 'Unknown', // Fallback for unknown statuses
//             dataSet: `Data Set ${item.DataSetID}`
//         }));
//         console.log(allRequests)
//         // --- 3. THE REST OF THE SCRIPT (no changes needed below this line) ---
//         const sortState = {
//             pending: { column: null, direction: 'asc' },
//             approved: { column: null, direction: 'asc' },
//             rejected: { column: null, direction: 'asc' },
//             finalised: { column: null, direction: 'asc' },
//         };
        
//         const tabConfig = {
//             'pending': { status: 'Pending Approval', showActions: true },
//             'approved': { status: 'Approved', showActions: false },
//             'rejected': { status: 'Rejected', showActions: false },
//             'finalised': { status: 'Finalised', showActions: false },
//         };
        
//         for (const id in tabConfig) {
//             const config = tabConfig[id];
//             const dataForTab = allRequests.filter(req => req.status === config.status);
//             renderTable(sortState, id, dataForTab, config);
//         }
        
//         const searchInput = document.getElementById('searchInput');
//         searchInput.addEventListener('input', () => {
//             const searchTerm = searchInput.value.toLowerCase();
//             const activeTabId = document.querySelector('.tab-pane.active').id;
//             const config = tabConfig[activeTabId];
//             const originalDataForTab = allRequests.filter(req => req.status === config.status);
         
//             const filteredData = originalDataForTab.filter(item => {
//                 // Use String() to safely handle potential null or undefined values
//                 const project = String(item.project || '').toLowerCase();
//                 const name = String(item.name || '').toLowerCase();
//                 const dataset = String(item.dataSet || '').toLowerCase();
        
//                 return project.includes(searchTerm) || 
//                       name.includes(searchTerm) || 
//                       dataset.includes(searchTerm);
//             });
//             renderTable(sortState, activeTabId, filteredData, config);
//         });
        
     
        
//     } catch (error) {
//         console.error("Error fetching or displaying data:", error);

//         // Show an error message in the HTML if something goes wrong
//         const container = document.getElementById('table-for-approval');
//         container.innerHTML = `<p style="color:red;">An error occurred while fetching data.</p>`;
//     }
    
    
// }


async function renderRequestsPage() {
    try {
        // --- 1. Fetch and prepare ALL data (same as your existing code) ---
        const rawRequestData = [
            {"RequestID":435,"ProjectID":82,"Name":"TestNEWDeIdentificationAlgo","StatusID":3,"DataSetID":2,"Approvers":"ria.yangzon@bizdata.com.au","CurrentlyApproved":"ria.yangzon@bizdata.com.au;","CreateDate":"2025-08-28 02:01:54.667","CreateUser":"ria.yangzon@bizdata.com.au","ModifiedDate":"2025-08-28 02:02:04.710","ApprovedDate":"2025-08-28 02:02:04.710","FinalisedDate":"2025-08-28 02:05:03.973","ScheduledRefresh":"No Refresh","RequestMessage":null,"RejectedBy":null,"RejectedDate":"2025-08-28 02:01:54.667"},
            {"RequestID":436,"ProjectID":82,"Name":"REDCAP_TestOriginalDeIdentification","StatusID":3,"DataSetID":1,"Approvers":"ria.yangzon@bizdata.com.au","CurrentlyApproved":"ria.yangzon@bizdata.com.au;","CreateDate":"2025-08-28 08:47:41.390","CreateUser":"ria.yangzon@bizdata.com.au","ModifiedDate":"2025-08-28 08:55:25.357","ApprovedDate":"2025-08-28 08:55:25.357","FinalisedDate":"2025-08-28 09:00:58.180","ScheduledRefresh":"No Refresh","RequestMessage":null,"RejectedBy":null,"RejectedDate":"2025-08-28 08:47:41.390"},
            {"RequestID":437,"ProjectID":82,"Name":"REDCAP_TestNewDeIdentification","StatusID":3,"DataSetID":1,"Approvers":"ria.yangzon@bizdata.com.au","CurrentlyApproved":"ria.yangzon@bizdata.com.au;","CreateDate":"2025-08-28 09:24:18.977","CreateUser":"ria.yangzon@bizdata.com.au","ModifiedDate":"2025-08-28 09:24:32.453","ApprovedDate":"2025-08-28 09:24:32.453","FinalisedDate":"2025-08-28 09:34:01.340","ScheduledRefresh":"No Refresh","RequestMessage":null,"RejectedBy":null,"RejectedDate":"2025-08-28 09:24:18.977"},
            {"RequestID":433,"ProjectID":82,"Name":"TestOriginalDeIdentificationAlgo","StatusID":3,"DataSetID":2,"Approvers":"ria.yangzon@bizdata.com.au","CurrentlyApproved":"ria.yangzon@bizdata.com.au;","CreateDate":"2025-08-28 00:44:10.913","CreateUser":"ria.yangzon@bizdata.com.au","ModifiedDate":"2025-08-28 01:02:12.887","ApprovedDate":"2025-08-28 01:02:12.887","FinalisedDate":"2025-08-28 01:15:00.760","ScheduledRefresh":"No Refresh","RequestMessage":null,"RejectedBy":null,"RejectedDate":"2025-08-28 00:44:10.913"},
            {"RequestID":444,"ProjectID":86,"Name":"TestNewHashingOnSQL","StatusID":3,"DataSetID":2,"Approvers":"ria.yangzon@bizdata.com.au","CurrentlyApproved":"ria.yangzon@bizdata.com.au;","CreateDate":"2025-09-01 04:25:35.957","CreateUser":"ria.yangzon@bizdata.com.au","ModifiedDate":"2025-09-01 04:29:56.843","ApprovedDate":"2025-09-01 04:29:56.843","FinalisedDate":"2025-09-01 04:42:16.860","ScheduledRefresh":"No Refresh","RequestMessage":null,"RejectedBy":null,"RejectedDate":"2025-09-01 04:25:35.957"},
            {"RequestID":445,"ProjectID":86,"Name":"TestNewHashingOnREDCap","StatusID":3,"DataSetID":1,"Approvers":"ria.yangzon@bizdata.com.au","CurrentlyApproved":"ria.yangzon@bizdata.com.au;","CreateDate":"2025-09-01 04:26:20.337","CreateUser":"ria.yangzon@bizdata.com.au","ModifiedDate":"2025-09-01 04:30:01.230","ApprovedDate":"2025-09-01 04:30:01.230","FinalisedDate":"2025-09-01 04:42:16.860","ScheduledRefresh":"No Refresh","RequestMessage":null,"RejectedBy":null,"RejectedDate":"2025-09-01 04:26:20.337"},
            {"RequestID":448,"ProjectID":86,"Name":"TestOLDHashingOnREDCap","StatusID":3,"DataSetID":1,"Approvers":"ria.yangzon@bizdata.com.au","CurrentlyApproved":"ria.yangzon@bizdata.com.au;","CreateDate":"2025-09-01 05:04:14.883","CreateUser":"ria.yangzon@bizdata.com.au","ModifiedDate":"2025-09-01 05:04:27.590","ApprovedDate":"2025-09-01 05:04:27.590","FinalisedDate":"2025-09-01 05:09:19.817","ScheduledRefresh":"No Refresh","RequestMessage":null,"RejectedBy":null,"RejectedDate":"2025-09-01 05:04:14.883"},
            {"RequestID":454,"ProjectID":86,"Name":"TestOriginalHashingOnFolder","StatusID":3,"DataSetID":36,"Approvers":"ria.yangzon@bizdata.com.au","CurrentlyApproved":"ria.yangzon@bizdata.com.au;","CreateDate":"2025-09-02 02:47:59.493","CreateUser":"ria.yangzon@bizdata.com.au","ModifiedDate":"2025-09-02 02:48:11.730","ApprovedDate":"2025-09-02 02:48:11.730","FinalisedDate":"2025-09-02 02:50:15.767","ScheduledRefresh":"No Refresh","RequestMessage":null,"RejectedBy":null,"RejectedDate":"2025-09-02 02:47:59.493"},
            {"RequestID":447,"ProjectID":86,"Name":"TestOLDHashingOnSQL","StatusID":3,"DataSetID":2,"Approvers":"ria.yangzon@bizdata.com.au","CurrentlyApproved":"ria.yangzon@bizdata.com.au;","CreateDate":"2025-09-01 05:03:52.937","CreateUser":"ria.yangzon@bizdata.com.au","ModifiedDate":"2025-09-01 05:04:31.200","ApprovedDate":"2025-09-01 05:04:31.200","FinalisedDate":"2025-09-01 05:09:19.817","ScheduledRefresh":"No Refresh","RequestMessage":null,"RejectedBy":null,"RejectedDate":"2025-09-01 05:03:52.937"},
            {"RequestID":455,"ProjectID":82,"Name":"TestRiaRequest","StatusID":1,"DataSetID":2,"Approvers":"ria.yangzon@bizdata.com.au","CurrentlyApproved":null,"CreateDate":"2025-09-04 01:54:39.140","CreateUser":"ria.yangzon@bizdata.com.au","ModifiedDate":"2025-09-04 01:54:39.140","ApprovedDate":"2025-09-04 01:54:39.140","FinalisedDate":"2025-09-04 01:54:39.140","ScheduledRefresh":"No Refresh","RequestMessage":null,"RejectedBy":null,"RejectedDate":"2025-09-04 01:54:39.140"},
            {"RequestID":452,"ProjectID":86,"Name":"TestNEWHashingOnFolder","StatusID":3,"DataSetID":36,"Approvers":"ria.yangzon@bizdata.com.au","CurrentlyApproved":"ria.yangzon@bizdata.com.au;","CreateDate":"2025-09-02 02:40:42.983","CreateUser":"ria.yangzon@bizdata.com.au","ModifiedDate":"2025-09-02 02:42:35.113","ApprovedDate":"2025-09-02 02:42:35.113","FinalisedDate":"2025-09-02 02:44:02.573","ScheduledRefresh":"No Refresh","RequestMessage":null,"RejectedBy":null,"RejectedDate":"2025-09-02 02:40:42.983"},
            {"RequestID":450,"ProjectID":82,"Name":"FOLDER_TestOriginalDeIdentification","StatusID":3,"DataSetID":36,"Approvers":"ria.yangzon@bizdata.com.au","CurrentlyApproved":"ria.yangzon@bizdata.com.au;","CreateDate":"2025-09-02 02:08:04.800","CreateUser":"ria.yangzon@bizdata.com.au","ModifiedDate":"2025-09-02 02:08:15.070","ApprovedDate":"2025-09-02 02:08:15.070","FinalisedDate":"2025-09-02 02:13:31.327","ScheduledRefresh":"No Refresh","RequestMessage":null,"RejectedBy":null,"RejectedDate":"2025-09-02 02:08:04.800"},
            {"RequestID":451,"ProjectID":82,"Name":"FOLDER_TestNEWDeIdentification","StatusID":3,"DataSetID":36,"Approvers":"ria.yangzon@bizdata.com.au","CurrentlyApproved":"ria.yangzon@bizdata.com.au;","CreateDate":"2025-09-02 02:29:14.497","CreateUser":"ria.yangzon@bizdata.com.au","ModifiedDate":"2025-09-02 02:29:27.717","ApprovedDate":"2025-09-02 02:29:27.717","FinalisedDate":"2025-09-02 02:31:39.597","ScheduledRefresh":"No Refresh","RequestMessage":null,"RejectedBy":null,"RejectedDate":"2025-09-02 02:29:14.497"},
            // ADDED for demonstration to populate all tabs
            {"RequestID":456,"ProjectID":85,"Name":"Marketing Analysis","StatusID":2,"DataSetID":10,"Approvers":"approver@test.com","CurrentlyApproved":"approver@test.com;","CreateDate":"2025-09-05 10:00:00.000","CreateUser":"user@test.com","ModifiedDate":"2025-09-05 10:05:00.000","ApprovedDate":"2025-09-05 10:05:00.000","FinalisedDate":null,"ScheduledRefresh":"Weekly","RequestMessage":null,"RejectedBy":null,"RejectedDate":null},
            {"RequestID":457,"ProjectID":85,"Name":"Budget Review","StatusID":4,"DataSetID":11,"Approvers":"approver@test.com","CurrentlyApproved":null,"CreateDate":"2025-09-06 11:00:00.000","CreateUser":"user@test.com","ModifiedDate":"2025-09-06 11:05:00.000","ApprovedDate":null,"FinalisedDate":null,"ScheduledRefresh":"No Refresh","RequestMessage":"Insufficient data","RejectedBy":"admin@test.com","RejectedDate":"2025-09-06 11:05:00.000"}
        ];
        const statusMap = { 1: 'Pending Approval', 2: 'Approved', 3: 'Finalised', 4: 'Rejected' };
        
        const allRequests = rawRequestData.map(item => ({
            ...item,
            project: `Project ${item.ProjectID}`,
            name: item.Name,
            status: statusMap[item.StatusID] || 'Unknown',
            dataSet: `Data Set ${item.DataSetID}`
        }));

        // --- 2. Centralized Configuration ---
        // This maps a status to its specific configuration (like showActions).
        const configMap = {
            'Pending Approval': { showActions: true },
            'Approved': { showActions: false },
            'Rejected': { showActions: false },
            'Finalised': { showActions: false },
        };
        
        // Define the single container ID for the table
        const TABLE_CONTAINER_ID = 'requests-table-area';
        
        // --- 3. Update Counts and Set Up Listeners ---
        const chipsContainer = document.getElementById('status-chips-container');
        const chips = chipsContainer.querySelectorAll('.chip');

        // Calculate and display the count for each status
        chips.forEach(chip => {
            const status = chip.dataset.status;
            const count = allRequests.filter(req => req.status === status).length;
            chip.querySelector('.chip-count').textContent = count;
        });

        // Add a click event listener to the container (event delegation)
        chipsContainer.addEventListener('click', (event) => {
            const clickedChip = event.target.closest('.chip');
            if (!clickedChip) return; // Exit if the click was not on a chip

            // Update the active state UI
            chips.forEach(chip => chip.classList.remove('active'));
            clickedChip.classList.add('active');

            // Get the status to filter by from the chip's data attribute
            const selectedStatus = clickedChip.dataset.status;
            
            // Filter the master data array
            const dataForTable = allRequests.filter(req => req.status === selectedStatus);

            // Get the correct config for the selected status
            const configForTable = configMap[selectedStatus];


            // Re-render the single table with the filtered data
            renderTable("requests-table-area", dataForTable, configForTable);
        });

        // --- 4. Initial Render ---
        // Programmatically click the first chip to render the initial view.
        // This is a clean way to avoid duplicating rendering logic.
        document.querySelector('.chip[data-status="Pending Approval"]').click();
        
        // --- 5. Search Function ---
        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('input', () => {
            const searchTerm = searchInput.value.toLowerCase();
            const activeTabId = document.querySelector('.tab-pane.active').id;
            const config = tabConfig[activeTabId];
            const originalDataForTab = allRequests.filter(req => req.status === config.status);
         
            const filteredData = originalDataForTab.filter(item => {
                // Use String() to safely handle potential null or undefined values
                const project = String(item.project || '').toLowerCase();
                const name = String(item.name || '').toLowerCase();
                const dataset = String(item.dataSet || '').toLowerCase();
        
                return project.includes(searchTerm) || 
                      name.includes(searchTerm) || 
                      dataset.includes(searchTerm);
            });
            renderTable(activeTabId, filteredData, config);
        });

    } catch (error) {
        console.error("Error setting up the page:", error);
        document.getElementById("requests-table-area").innerHTML = `<p class="text-danger">An error occurred.</p>`;
    }
}

renderRequestsPage()
