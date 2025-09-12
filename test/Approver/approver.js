function ViewRequest(request) {
    // Get the modal's body element
    const modalBody = document.getElementById('viewRequestModalBody');
    console.log("IN VIEW REQ")
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

/**
 * Renders a data table with Tailwind CSS styling.
 * This is a refactored version of the original function to match the new design.
 * @param {string} containerId - The ID of the element to render the table into.
 * @param {Array} data - The array of data objects to display.
 * @param {object} config - Configuration object, e.g., { showActions: true }.
 */
function renderTable(containerId, data, config, selectedStatus) {
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
    const headers = ['Project', 'Name', 'Data Set', 'Requested On']; //'Status',
    
    if (selectedStatus == 'Pending Approval') {
        headers.push('Approvers');
    } else if (selectedStatus == 'Approved') {
        headers.push('Approved by');
        headers.push('Approved on');
    } else if (selectedStatus == 'Rejected') {
        headers.push('Rejected by');
        headers.push('Rejected on');
    } else if (selectedStatus == 'Finalised') {
        headers.push('Approved on');
        headers.push('Approved by')
        headers.push('Finalised on');
    }
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
            
            let statusSpecificCol = ''; // 'let' is preferred over 'var'
            switch (item.status) {
                case 'Pending Approval':
                    statusSpecificCol = `<td class="${tdClasses}">${item.approvers}</td>`;
                    break;
                case 'Rejected':
                    statusSpecificCol = `
                        <td class="${tdClasses}">${item.rejectedBy}</td>
                        <td class="${tdClasses}">${item.dateRejected}</td>
                    `;
                    break;
                case 'Approved':
                    statusSpecificCol = `
                        <td class="${tdClasses}">${item.currentlyApproved}</td>
                        <td class="${tdClasses}">${item.dateApproved}</td>
                    `;
                    break;
                case 'Finalised':
                    statusSpecificCol = `
                        <td class="${tdClasses}">${item.currentlyApproved}</td>
                        <td class="${tdClasses}">${item.dateApproved}</td>
                        <td class="${tdClasses}">${item.dateFinalised}</td>
                    `;
                    break;
                // Optional: A default case if the status is something unexpected
                default:
                    statusSpecificCol = '<td>-</td>'; // Or just leave it empty
                    break;
            }
            
            
            // --- STYLE CHANGE: Updated the entire innerHTML template with Tailwind classes ---
            // <td class="px-6 py-4 whitespace-nowrap">
            //     <span class="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses}">
            //         ${item.status}
            //     </span>
            // </td>
            const actionButtons = `
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
            `
            row.innerHTML = `
                <td class="${tdClasses}">${item.project}</td>
                <td class="${tdClasses}">${item.name}</td>
                
                <td class="${tdClasses}">${item.dataSet}</td>
                <td class="${tdClasses}">${item.dateRequested}</td>
                
                 ${statusSpecificCol}
                
                ${config.showActions ? `
                    <td class="${tdClasses}">
                        ${actionButtons}
                    </td>`
                : ''}
            `;
            //"px-6 py-4 whitespace-nowrap text-sm font-medium flex justify-center items-center"
            tbody.appendChild(row);

            // This event listener logic does not need to change, as it finds elements by class.
            if (config.showActions) {
                const viewReqButton = row.querySelector('.fa-eye')?.parentElement;
                if (viewReqButton) {
                    viewReqButton.addEventListener('click', () => {
                        ViewRequest(item);
                    });
                }
                const viewDataSetButton = row.querySelector('.fa-clone')?.parentElement;
                if (viewDataSetButton) {
                    viewDataSetButton.addEventListener('click', () => {
                        ViewDataSet(item);
                    });
                }
                const approveButton = row.querySelector('.fa-eye')?.parentElement;
                if (approveButton) {
                    approveButton.addEventListener('click', () => {
                        ApproveRequest(item);
                    });
                }
                const rejectButton = row.querySelector('.fa-clone')?.parentElement;
                if (rejectButton) {
                    rejectButton.addEventListener('click', () => {
                        RejectRequest(item);
                    });
                }
            }
        });
    }

    table.appendChild(tbody);
    container.appendChild(table);
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

async function renderRequestsPage() {
    
    // Define the single container ID for the table
    const TABLE_CONTAINER_ID = 'requests-table-area';
        
    
    try {
        // --- 1. Fetch and prepare ALL data (same as your existing code) ---
        const requestData = [
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
        
        // window.loomeApi.runApiRequest(8, {
        //     "upn":  /* value for upn */
        // });
        
        // console.log('before api request')
        // const response = await window.loomeApi.runApiRequest(8,{
        //     "upn": "ria.yangzon@bizdata.com.au"
        // });
        // console.log(response)
        
        // // // Check if the response is a string and parse it
        // const requestData = typeof response === 'string' ? JSON.parse(response) : response;
        // console.log(requestData)
        
        const statusMap = { 1: 'Pending Approval', 2: 'Approved', 3: 'Finalised', 4: 'Rejected' };
        const allRequests = requestData.map(item => ({
            ...item,
            project: item.ProjectID,
            name: item.Name,
            status: statusMap[item.StatusID] || 'Unknown',
            dataSet: `Data Set ${item.DataSetID}`,
            approvers: item.Approvers,
            dateRequested: formatDate(item.CreateDate),
            dateApproved: formatDate(item.ApprovedDate),
            dateRejected: formatDate(item.RejectedDate),
            dateFinalised: formatDate(item.FinalisedDate),
            rejectedBy: item.RejectedBy,
            currentlyApproved: item.CurrentlyApproved
        }));
        
        console.log(allRequests)
        
        // --- 2. Centralized Configuration ---
        // This maps a status to its specific configuration (like showActions).
        const configMap = {
            'Pending Approval': { showActions: true },
            'Approved': { showActions: false },
            'Rejected': { showActions: false },
            'Finalised': { showActions: false },
        };
        

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
        const searchInput = document.getElementById('searchRequests');
        chipsContainer.addEventListener('click', (event) => {
            const clickedChip = event.target.closest('.chip');
            if (!clickedChip) return; // Exit if the click was not on a chip

            // Update the active state UI
            chips.forEach(chip => chip.classList.remove('active'));
            clickedChip.classList.add('active');

            // Get the status to filter by from the chip's data attribute
            const selectedStatus = clickedChip.dataset.status;
            
            // Set Search Term value
            const searchTerm = searchInput.value.toLowerCase();
            console.log(searchTerm)
            // Filter the master data array
            const dataForTable = allRequests.filter(req => req.status === selectedStatus);

            // Get the correct config for the selected status
            const configForTable = configMap[selectedStatus];
            
            const filteredData = searchTerm ? 
                dataForTable.filter(item => {
                    // Use String() to safely handle potential null or undefined values
                    const project = String(item.project || '').toLowerCase();
                    const name = String(item.name || '').toLowerCase();
                    const dataset = String(item.dataSet || '').toLowerCase();
                    
                    return project.includes(searchTerm) ||
                           name.includes(searchTerm) ||
                           dataset.includes(searchTerm);
                }) : 
                dataForTable; // If no search term, just use the status-filtered data


            // Re-render the single table with the filtered data
            renderTable(TABLE_CONTAINER_ID, filteredData, configForTable, selectedStatus);
        });

        // --- 4. Initial Render ---
        // Programmatically click the first chip to render the initial view.
        // This is a clean way to avoid duplicating rendering logic.
        document.querySelector('.chip[data-status="Pending Approval"]').click();
        
        searchInput.addEventListener('input', () => {
            // Get the currently active chip
            const activeChip = document.querySelector('.chip.active');
            if (!activeChip) return; // Safety check
            
            // Get the status from the active chip
            const selectedStatus = activeChip.dataset.status;
            
            // Get the search term
            const searchTerm = searchInput.value.toLowerCase();
            
            // Filter the master data array
            const dataForTable = allRequests.filter(req => req.status === selectedStatus);
            
            // Get the correct config for the selected status
            const configForTable = configMap[selectedStatus];
            
            const filteredData = searchTerm ?
                dataForTable.filter(item => {
                    // Use String() to safely handle potential null or undefined values
                    const project = String(item.project || '').toLowerCase();
                    const name = String(item.name || '').toLowerCase();
                    const dataset = String(item.dataSet || '').toLowerCase();
                    return project.includes(searchTerm) ||
                           name.includes(searchTerm) ||
                           dataset.includes(searchTerm);
                }) :
                dataForTable; // If no search term, just use the status-filtered data
            
            // Re-render the single table with the filtered data
            renderTable(TABLE_CONTAINER_ID, filteredData, configForTable, selectedStatus);
        });
        
        // --- 5. Search Function ---
        // const searchInput = document.getElementById('searchRequests');
        // searchInput.addEventListener('input', () => {
        //     const searchTerm = searchInput.value.toLowerCase();
            
        //     const clickedChip = event.target.closest('.chip');
        //     if (!clickedChip) return; // Exit if the click was not on a chip

        //     // Update the active state UI
        //     chips.forEach(chip => chip.classList.remove('active'));
        //     clickedChip.classList.add('active');

        //     // Get the status to filter by from the chip's data attribute
        //     const selectedStatus = clickedChip.dataset.status;
        //     const config = configMap[clickedChip.dataset.status];
            
        //     const dataForTable = allRequests.filter(req => req.status === selectedStatus);
         
        //     const filteredData = dataForTable.filter(item => {
        //         // Use String() to safely handle potential null or undefined values
        //         const project = String(item.project || '').toLowerCase();
        //         const name = String(item.name || '').toLowerCase();
        //         const dataset = String(item.dataSet || '').toLowerCase();
        
        //         return project.includes(searchTerm) || 
        //               name.includes(searchTerm) || 
        //               dataset.includes(searchTerm);
        //     });
            
        //     renderTable(TABLE_CONTAINER_ID, filteredData, config);
        // });

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



renderRequestsPage()
