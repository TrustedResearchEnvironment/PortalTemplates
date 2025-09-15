// Define the single container ID for the table
const TABLE_CONTAINER_ID = 'requests-table-area';

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
 * Renders a generic data table based on a configuration object.
 * @param {string} containerId - The ID of the element to render the table into.
 * @param {Array} headers - The array of header configuration objects.
 * @param {Array} data - The array of data objects to display.
//  */
function renderTable(containerId, headers, data) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with ID "${containerId}" not found.`);
        return;
    }
    container.innerHTML = ''; // Clear previous content

    const table = document.createElement('table');
    //table.className = 'min-w-full divide-y divide-gray-200';
    table.className = 'w-full divide-y divide-gray-200 table-fixed';
    
    // --- 1. Build The Head ---
    const thead = document.createElement('thead');
    thead.className = 'bg-gray-50';
    const headerRow = document.createElement('tr');
    headers.forEach(headerConfig => {
        const th = document.createElement('th');
        th.scope = 'col';
        
        // Start with base classes
        let thClasses = 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider';
        
        // If a widthClass is defined in the config, add it.
        if (headerConfig.widthClass) {
            thClasses += ` ${headerConfig.widthClass}`;
        }
        th.className = thClasses;
        th.textContent = headerConfig.label;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // --- 2. Build The Body ---
    const tbody = document.createElement('tbody');
    tbody.className = 'bg-white divide-y divide-gray-200';

    if (data.length === 0) {
        const colSpan = headers.length || 1;
        tbody.innerHTML = `<tr><td colspan="${colSpan}" class="px-6 py-4 text-center text-sm text-gray-500">No data found.</td></tr>`;
    } else {
        data.forEach(item => {
            const row = document.createElement('tr');
            headers.forEach(headerConfig => {
                const td = document.createElement('td');
                
                // Start with the base classes for every cell.
                let tdClasses = 'px-6 py-4 text-sm text-gray-800';

                // Now, add the specific class from your config.
                if (headerConfig.className) {
                    tdClasses += ` ${headerConfig.className}`;
                } else {
                    // If no class is specified, default to break-words to prevent overflow.
                    // This is a safe fallback.
                    tdClasses += ' break-words';
                }
                td.className = tdClasses;
                
                let cellContent;

                // If a custom render function exists, use it.
                if (headerConfig.render) {
                    // For 'actions', we pass the whole item. Otherwise, pass the specific value.
                    const value = headerConfig.key === 'actions' ? item : item[headerConfig.key];
                    cellContent = headerConfig.render(value);
                } else {
                    // Otherwise, just get the data using the key.
                    const value = item[headerConfig.key];
                    cellContent = value ?? 'N/A'; // Use 'N/A' for null or undefined values
                }

                // If content is HTML, set innerHTML. Otherwise, textContent is safer.
                if (typeof cellContent === 'string' && cellContent.startsWith('<')) {
                    td.innerHTML = cellContent;
                } else {
                    td.textContent = cellContent;
                }
                
                row.appendChild(td);
            });
            tbody.appendChild(row);
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

async function renderPlatformAdminRequestsPage() {
    
    try {
        
        const allRequests = [
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
        
        // const response = await window.loomeApi.runApiRequest(10);
        // const parsedResponse = safeParseJson(response);
        // const dataSet = parsedResponse.Results;
        let currentPage = 1; //parsedResponse.CurrentPage;
        const rowsPerPage = 5;//parsedResponse.PageSize; 
        // console.log(dataSet)
        
        
        
        // Place this inside renderPlatformAdminPage, replacing your old 'headers' object.
        const tableConfig =  {
                headers: [
                    { label: "Project ID", key: "ProjectID", widthClass: "w-1/12" },
                    { label: "Request ID", key: "RequestID", widthClass: "w-1/12" },
                    { label: "Name", key: "Name", className: "break-words", widthClass: "w-3/12" },
                    {
                        label: "Status",
                        key: "StatusID",
                        render: (value) => {
                            const statusMap = { 1: 'Pending', 2: 'Approved', 3: 'Finalised', 4: 'Rejected' };
                            const statusText = statusMap[value] || 'Unknown';
                            const statusClasses = {
                                'Pending': 'bg-yellow-100 text-yellow-800',
                                'Approved': 'bg-green-100 text-green-800',
                                'Rejected': 'bg-red-100 text-red-800',
                                'Finalised': 'bg-blue-100 text-blue-800'
                            }[statusText] || 'bg-gray-100 text-gray-800';
                            return `<span class="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses}">${statusText}</span>`;
                        }
                    },
                    { label: "Data Set ID", key: "DataSetID", widthClass: "w-1/12" },
                    { label: "Requester", key: "CreateUser", className: "break-words" },
                    { label: "Requested", key: "CreateDate", render: (value) => formatDate(value) },
                    { label: "Approvers", key: "Approvers", className: "break-words" }
                ]
            };
        
        const data = allRequests
        
        const rowCounts = allRequests.length
        
        const requestsCount = document.getElementById('requestsCount')
        requestsCount.textContent = rowCounts
        const searchInput = document.getElementById('searchRequests');
        
        // --- SEARCH EVENT LISTENER ---
        searchInput.addEventListener('input', () => {
            console.log('Typing event detected!');
            currentPage = 1;
            const searchTerm = searchInput.value;

            updateTable(tableConfig, data, TABLE_CONTAINER_ID, currentPage, rowsPerPage, searchTerm);
        });
        
        // --- NEW PAGINATION EVENT LISTENER (EVENT DELEGATION) ---
        const paginationContainer = document.getElementById('pagination-controls');
        paginationContainer.addEventListener('click', (event) => {
            // Find the button that was clicked, even if the user clicked an inner element
            const button = event.target.closest('button[data-page]');

            // If the click was not on a button, do nothing
            if (!button || button.disabled) {
                return;
            }

            const page = parseInt(button.dataset.page, 10);
            currentPage = page; // Update the global state

            // Get the current search term to maintain the filter
            const searchTerm = searchInput.value; // <-- FIX: Use .value for inputs

            // Re-render the table with the new page and existing search term
            updateTable(tableConfig, data, TABLE_CONTAINER_ID, currentPage, rowsPerPage, searchTerm);
        });

        updateTable(tableConfig, data, TABLE_CONTAINER_ID, currentPage, rowsPerPage, '');
            
        
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

renderPlatformAdminRequestsPage()
