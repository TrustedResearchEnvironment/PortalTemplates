// =================================================================
//                      STATE & CONFIGURATION
// =================================================================
const TABLE_CONTAINER_ID = 'requests-table-area';
const API_REQUEST_ID = 4;

// We will store all fetched data here
let allRequests = []; 
let currentPage = 1;
const rowsPerPage = 5; // You can control page size here
const searchInput = document.getElementById('searchRequests');

// Mapping from Status ID to Status Name
const statusIdToNameMap = { 1: 'Pending Approval', 2: 'Approved', 3: 'Finalised', 4: 'Rejected' };

// Configuration for each status tab
const configMap = {
    'Pending Approval': { showActions: true },
    'Approved': { showActions: true },
    'Rejected': { showActions: true },
    'Finalised': { showActions: true },
};

// =================================================================
//                      UTILITY & MODAL FUNCTIONS
// =================================================================
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

async function ViewDataSet(request) {
    return new Promise(async (resolve, reject) => {
        try {
            // You can still update the modal if needed
            const modalBody = document.getElementById('viewDatasetModalBody');
            
            // Fetch dataset details - replace this with your actual data fetching logic
            // This could be an API call, database query, etc.
            const datasetDetails = await fetchDatasetDetails(request.DataSetID);
            
            // If you still want to update the modal
            if (modalBody) {
                // Format the dataset details for the modal
                let modalContent = `
                    <div class="form-group">
                        <label for="DataSetType" class="form-check-label">Data Source</label>
                        <select disabled="true" class="form-control selectpicker valid">
                            <option value="1" ${datasetDetails.DataSourceID === 1 ? 'selected' : ''}>BIS Data (pilot test)</option>
                            <option value="4" ${datasetDetails.DataSourceID === 4 ? 'selected' : ''}>Barwon Health DB Source View 1</option>
                            <option value="25" ${datasetDetails.DataSourceID === 25 ? 'selected' : ''}>Source Mock SQL Data for Testing</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <div class="form-check">
                            <input id="Active" disabled="true" type="checkbox" class="form-check-input valid" ${datasetDetails.Active ? 'checked' : ''}>
                            <label for="Active" class="form-check-label">Active</label>
                        </div>
                    </div>
                    <br>
                    <h6>Data Set Fields</h6>
                    <div class="table-responsive">
                        <table class="table table-condensed table-striped">
                            <thead>
                                <tr>
                                    <th>Field Name</th>
                                    <th>Type</th>
                                    <th>Description</th>
                                </tr>
                            </thead>
                            <tbody>
                `;
                
                // Add dataset fields to the modal
                if (datasetDetails.Fields && datasetDetails.Fields.length > 0) {
                    datasetDetails.Fields.forEach(field => {
                        modalContent += `
                            <tr>
                                <td>${field.Name}</td>
                                <td>${field.Type}</td>
                                <td>${field.Description || ''}</td>
                            </tr>
                        `;
                    });
                } else {
                    modalContent += `<tr><td colspan="3" class="text-center">No fields available</td></tr>`;
                }
                
                modalContent += `
                            </tbody>
                        </table>
                    </div>
                `;
                
                modalBody.innerHTML = modalContent;
            }
            
            // Format the dataset details for the accordion
            const formattedDetails = {
                DataSetID: datasetDetails.DataSetID,
                Name: datasetDetails.Name,
                Description: datasetDetails.Description || 'No description available',
                DataSource: getDataSourceName(datasetDetails.DataSourceID),
                Active: datasetDetails.Active ? 'Yes' : 'No',
                CreatedDate: formatDate(datasetDetails.CreatedDate),
                LastModified: formatDate(datasetDetails.LastModified),
                FieldCount: datasetDetails.Fields ? datasetDetails.Fields.length : 0,
                Fields: formatFieldsForAccordion(datasetDetails.Fields)
            };
            
            // Resolve the promise with the formatted details
            resolve(formattedDetails);
            
        } catch (error) {
            console.error('Error fetching dataset details:', error);
            reject(error);
        }
    });
}

// Helper function to get data source name from ID
function getDataSourceName(dataSourceID) {
    const dataSources = {
        1: 'BIS Data (pilot test)',
        4: 'Barwon Health DB Source View 1',
        25: 'Source Mock SQL Data for Testing'
    };
    return dataSources[dataSourceID] || `Unknown Source (${dataSourceID})`;
}

// Helper function to format fields for the accordion
function formatFieldsForAccordion(fields) {
    if (!fields || fields.length === 0) {
        return 'No fields available';
    }
    
    let fieldsHtml = '<div class="mt-2"><table class="w-full text-sm"><thead><tr><th class="text-left">Field</th><th class="text-left">Type</th></tr></thead><tbody>';
    
    fields.forEach(field => {
        fieldsHtml += `<tr><td>${field.Name}</td><td>${field.Type}</td></tr>`;
    });
    
    fieldsHtml += '</tbody></table></div>';
    return fieldsHtml;
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

// =================================================================
// Miguel
function DeleteRequest(request) {
    // Get the modal elements
    const modalBody = document.getElementById('deleteRequestModalBody');
    const modalTitle = document.getElementById('deleteRequestModalLabel');
    
    // Update the modal title dynamically based on request
    const truncRequestName = request.Name.length > 20 ? request.Name.slice(0, 20) + "..." : request.Name;

    modalTitle.textContent = `Deleting Request...`;
    
    // Populate the modal body with the confirmation message
    modalBody.innerHTML = `
        <div class="col-md-12">
            <div class="alert alert-warning">
                <i class="fa fa-exclamation-triangle"></i> 
                You are about to delete the request:<br>
                <strong>${request.Name}</strong>
            </div>
            <div class="form-group mt-3 d-flex justify-content-center">
                <button id="confirmDeleteBtn" type="button" class="btn btn-danger">Delete</button>
            </div>
        </div>
    `;
    
    // Add event listener for the confirm delete button
    setTimeout(() => {
        document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
            // Call the API to delete the request
            deleteRequestFromAPI(request.ID, deleteReason);
        });
    }, 100);
}

async function deleteRequestFromAPI(requestId, reason) {
    try {
        // Show loading state
        const loadingToast = showToast('Deleting request...', 'info');
        
        // Assuming you have an API endpoint for deletion
        const deleteParams = {
            "requestId": requestId,
            "reason": reason
        };
        
        // Replace API_DELETE_REQUEST_ID with the actual API request ID for deletion
        const API_DELETE_REQUEST_ID = 5; // You need to set the correct ID
        const response = await window.loomeApi.runApiRequest(API_DELETE_REQUEST_ID, deleteParams);
        
        // Hide the modal
        const deleteModal = bootstrap.Modal.getInstance(document.getElementById('deleteRequestModal'));
        deleteModal.hide();
        
        // Show success message
        hideToast(loadingToast);
        showToast('Request deleted successfully', 'success');
        
        // Refresh the UI
        renderUI();
    } catch (error) {
        console.error("Error deleting request:", error);
        showToast('Failed to delete request. Please try again.', 'error');
    }
}

// Toast notification functions
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container') || createToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-message">${message}</div>
    `;
    toastContainer.appendChild(toast);
    
    // Auto-hide after 3 seconds for success messages
    if (type === 'success') {
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
    
    return toast;
}

function hideToast(toast) {
    if (toast && toast.parentNode) {
        toast.remove();
    }
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-top-right';
    document.body.appendChild(container);
    return container;
}


/**
 * Fetches request details from the API
 * @param {string|number} requestID - The ID of the request
 * @returns {Promise<object>} - The request details
 */
async function fetchRequestDetails(requestID) {
    try {
        // Get current user's UPN
        const upn = getCurrentUserUpn(); // You'll need to implement this function
        
        // Call the API
        const response = await window.loomeApi.runApiRequest(8, {
            "RequestID": requestID,
            "upn": upn
        });
        
        // Parse the response
        return safeParseJson(response);
    } catch (error) {
        console.error(`Error fetching request details for ID ${requestID}:`, error);
        throw error;
    }
}

/**
 * Fetches dataset details from the API
 * @param {string|number} datasetID - The ID of the dataset
 * @returns {Promise<object>} - The dataset details
 */
async function fetchDatasetDetails(datasetID) {
    try {
        // Get current user's UPN
        const upn = getCurrentUserUpn(); // You'll need to implement this function
        
        // Call the API
        const response = await window.loomeApi.runApiRequest(6, {
            "DataSetID": datasetID,
            "upn": upn
        });
        
        // Parse the response
        return safeParseJson(response);
    } catch (error) {
        console.error(`Error fetching dataset details for ID ${datasetID}:`, error);
        throw error;
    }
}

/**
 * Gets the current user's UPN
 * @returns {string} - The user's UPN
 */
function getCurrentUserUpn() {
    // Implement your logic to get the current user's UPN
    // This might come from a global variable, session storage, or another source
    return "user@example.com"; // Replace with actual implementation
}


// Global variable to store project data
let projectsCache = null;

/**
 * Fetches all projects and caches them
 * @returns {Promise<Object>} A mapping from project ID to project name
 */
async function getProjectsMapping() {
    // Return cache if already loaded
    if (projectsCache) {
        return projectsCache;
    }
    
    try {
        // Get current user's UPN or use the hardcoded one
        const upn = getCurrentUserUpn() || 'migueltestupn';
        
        // Fetch projects data
        const response = await window.loomeApi.runApiRequest(9, { upn });
        const data = safeParseJson(response);
        
        // Create a mapping from project ID to project name
        const mapping = {};
        if (data && data.Results && Array.isArray(data.Results)) {
            data.Results.forEach(project => {
                mapping[project.AssistProjectID] = {
                    name: project.Name,
                    description: project.Description
                };
            });
        }
        
        // Cache the mapping
        projectsCache = mapping;
        return mapping;
        
    } catch (error) {
        console.error("Error fetching projects:", error);
        return {}; // Return empty object in case of error
    }
}


/**
 * Displays request details in the container
 * @param {HTMLElement} container - The container element
 * @param {object} details - The request details
 */
async function displayRequestDetails(container, details) {
    // Check if we have valid details
    if (!details || Object.keys(details).length === 0) {
        container.innerHTML = '<p class="text-center text-red-500">No request details available</p>';
        return;
    }
    
    // Show loading state
    container.innerHTML = '<p class="text-center">Loading project details...</p>';
    
    try {
        // Get project mapping
        const projectsMapping = await getProjectsMapping();
        const projectInfo = projectsMapping[details.ProjectID] || { name: 'Unknown Project', description: '' };
        
        // Format the details for display
        let html = '';
        
        // Add basic request information
        html += `
            <p><strong>Target Project Name:</strong> ${projectInfo.name}</p>
        `;
        
        // Add project description if available
        if (projectInfo.description) {
            html += `<p><strong>Project Description:</strong> ${projectInfo.description}</p>`;
        }
        
        // // Add status-specific fields
        // if (details.Approvers) html += `<p><strong>Approvers:</strong> ${details.Approvers}</p>`;
        // if (details.ApprovedBy) html += `<p><strong>Approved By:</strong> ${details.ApprovedBy}</p>`;
        // if (details.ApprovedDate) html += `<p><strong>Approved Date:</strong> ${formatDate(details.ApprovedDate)}</p>`;
        // if (details.RejectedBy) html += `<p><strong>Rejected By:</strong> ${details.RejectedBy}</p>`;
        // if (details.RejectedDate) html += `<p><strong>Rejected Date:</strong> ${formatDate(details.RejectedDate)}</p>`;
        // if (details.FinalisedDate) html += `<p><strong>Finalised Date:</strong> ${formatDate(details.FinalisedDate)}</p>`;
        
        // // Add any additional fields from the API response
        // const standardFields = ['RequestID', 'ProjectID', 'Name', 'Description', 'CreateDate', 'Status', 
        //                       'Approvers', 'ApprovedBy', 'ApprovedDate', 'RejectedBy', 
        //                       'RejectedDate', 'FinalisedDate'];
        
        // for (const [key, value] of Object.entries(details)) {
        //     if (!standardFields.includes(key) && value !== null && value !== undefined) {
        //         html += `<p><strong>${key}:</strong> ${value}</p>`;
        //     }
        // }
        
        // Update the container
        container.innerHTML = html;
        
    } catch (error) {
        console.error("Error displaying request details:", error);
        container.innerHTML = `
            <p class="text-center text-red-500">Error loading project details</p>
            <div class="mt-3">
                <p><strong>Request ID:</strong> ${details.RequestID || 'N/A'}</p>
                <p><strong>Name:</strong> ${details.Name || 'N/A'}</p>
                <p><strong>Project ID:</strong> ${details.ProjectID || 'N/A'}</p>
                <p><strong>Status:</strong> ${details.Status || 'Unknown'}</p>
                <!-- Add other critical fields here -->
            </div>
        `;
    }
}

/**
 * Displays dataset details in the container
 * @param {HTMLElement} container - The container element
 * @param {object} details - The dataset details
 */
function displayDatasetDetails(container, details) {
    // Check if we have valid details
    if (!details || Object.keys(details).length === 0) {
        container.innerHTML = '<p class="text-center text-red-500">No dataset details available</p>';
        return;
    }
    
    // Format the details for display
    let html = '';
    
    // Add basic dataset information
    html += `
        <p><strong>Requested Dataset:</strong> ${details.Name || 'N/A'}</p>
        <p><strong>Description:</strong> ${details.Description || 'N/A'}</p>
        <p><strong>Data Source ID:</strong> ${details.DataSourceID || 'N/A'}</p>
    `;
    
    // Add fields table if available
    if (details.Fields && details.Fields.length > 0) {
        html += `
            <div class="mt-3">
                <strong>Fields:</strong>
                <div class="mt-2">
                    <table class="w-full text-sm">
                        <thead>
                            <tr>
                                <th class="text-left">Field</th>
                                <th class="text-left">Type</th>
                                <th class="text-left">Description</th>
                            </tr>
                        </thead>
                        <tbody>
        `;
        
        details.Fields.forEach(field => {
            html += `
                <tr>
                    <td>${field.Name || 'N/A'}</td>
                    <td>${field.Type || 'N/A'}</td>
                    <td>${field.Description || ''}</td>
                </tr>
            `;
        });
        
        html += `
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }
    
    // Update the container
    container.innerHTML = html;
}
// =================================================================

/**
 * Safely parses a response that might be a JSON string or an object.
 * @param {string | object} response The API response.
 * @returns {object}
 */
function safeParseJson(response) {
    return typeof response === 'string' ? JSON.parse(response) : response;
}

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


// =================================================================
//                      API & RENDERING FUNCTIONS
// =================================================================


/**
 * Renders a data table with dynamic headers and actions.
 */
function renderTable(containerId, data, config, selectedStatus) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    const table = document.createElement('table');
    table.className = 'w-full divide-y divide-gray-200';
    const thead = document.createElement('thead');
    thead.className = 'bg-gray-50';
    const headerRow = document.createElement('tr');
    
    // Define headers based on the selected status
    const headers = ['Request ID', 'Request Name', 'Requested On'];
    if (selectedStatus === 'Pending Approval') headers.push('Approvers');
    else if (selectedStatus === 'Approved') { headers.push('Approved by'); headers.push('Approved on'); }
    else if (selectedStatus === 'Rejected') { headers.push('Rejected by'); headers.push('Rejected on'); }
    else if (selectedStatus === 'Finalised') { headers.push('Approved on'); headers.push('Approved by'); headers.push('Finalised on'); }
    
    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.className = 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider';
        th.textContent = headerText;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    const tbody = document.createElement('tbody');
    tbody.className = 'bg-white divide-y divide-gray-200';
    
    if (data.length === 0) {
        const colSpan = headers.length;
        tbody.innerHTML = `<tr><td colspan="${colSpan}" class="px-6 py-4 text-center text-sm text-gray-500">No requests found.</td></tr>`;
    } else {
        data.forEach(item => {
            const row = document.createElement('tr');
            row.className = 'cursor-pointer hover:bg-gray-100';
            const tdClasses = 'px-6 py-4 whitespace-nowrap text-sm text-gray-800';
            
            let statusSpecificCols = '';
            switch (item.status) {
                case 'Pending Approval': statusSpecificCols = `<td class="${tdClasses}">${item.Approvers || 'N/A'}</td>`; break;
                case 'Rejected': statusSpecificCols = `<td class="${tdClasses}">${item.RejectedBy || 'N/A'}</td><td class="${tdClasses}">${formatDate(item.RejectedDate)}</td>`; break;
                case 'Approved': statusSpecificCols = `<td class="${tdClasses}">${item.CurrentlyApproved || 'N/A'}</td><td class="${tdClasses}">${formatDate(item.ApprovedDate)}</td>`; break;
                case 'Finalised': statusSpecificCols = `<td class="${tdClasses}">${item.CurrentlyApproved || 'N/A'}</td><td class="${tdClasses}">${formatDate(item.ApprovedDate)}</td><td class="${tdClasses}">${formatDate(item.FinalisedDate)}</td>`; break;
            }
            
            row.innerHTML = `
                <td class="${tdClasses}">${item.RequestID}</td>
                <td class="${tdClasses}">${item.Name}</td>
                <td class="${tdClasses}">${formatDate(item.CreateDate)}</td>
                ${statusSpecificCols}
            `;

            // Add click event to toggle accordion
            row.addEventListener('click', async () => {
                // Toggle the accordion visibility
                accordionRow.classList.toggle('hidden');
                
                // Only fetch data if the accordion is becoming visible
                if (!accordionRow.classList.contains('hidden')) {
                    const requestDetailsContainer = accordionRow.querySelector(`#request-details-${item.ProjectID} .request-content`);
                    const datasetDetailsContainer = accordionRow.querySelector(`#dataset-details-${item.DataSetID} .dataset-content`);
                    
                    // Show loading indicators
                    requestDetailsContainer.innerHTML = '<p class="text-center">Loading request details...</p>';
                    datasetDetailsContainer.innerHTML = '<p class="text-center">Loading dataset details...</p>';
                    
                    try {
                        // Fetch request details
                        const requestDetails = await fetchRequestDetails(item.RequestID);
                        await displayRequestDetails(requestDetailsContainer, requestDetails);
                        
                        // Fetch dataset details
                        const datasetDetails = await fetchDatasetDetails(item.DataSetID);
                        displayDatasetDetails(datasetDetailsContainer, datasetDetails);
                    } catch (error) {
                        console.error("Error loading details:", error);
                        requestDetailsContainer.innerHTML = '<p class="text-center text-red-500">Error loading request details</p>';
                        datasetDetailsContainer.innerHTML = '<p class="text-center text-red-500">Error loading dataset details</p>';
                    }
                }
            });
            
            // Create accordion row
            const accordionRow = document.createElement('tr');
            accordionRow.classList.add('hidden', 'accordion-row');
            accordionRow.innerHTML = `
                <td colspan="${headers.length}" class="p-0">
                    <div class="bg-gray-50 p-4 m-2 rounded">
                        <div class="grid grid-cols-1 gap-4">
                            <div class="flex justify-between mb-4">
                                <h3 class="font-bold">Details</h3>
                                <div class="space-x-2">
                                    <button class="btn btn-danger action-delete" data-bs-toggle="modal" data-bs-target="#deleteRequestModal">
                                        Delete Request
                                    </button>
                                </div>
                            </div>
                            
                            <div class="grid grid-cols-2 gap-4">
                                <div id="request-details-${item.ProjectID}" class="border p-4 rounded">
                                    <h4 class="font-semibold mb-2">Request Information</h4>
                                    <div class="request-content">
                                        <p class="text-center text-gray-500">Loading request details...</p>
                                    </div>
                                </div>
                                
                                <div id="dataset-details-${item.DataSetID}" class="border p-4 rounded">
                                    <h4 class="font-semibold mb-2">Dataset Information</h4>
                                    <div class="dataset-content">
                                        <p class="text-center text-gray-500">Loading dataset details...</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </td>
            `;
            // Add event listeners for the accordion
            const loadDatasetBtn = accordionRow.querySelector('.load-dataset-details');
            const deleteBtn = accordionRow.querySelector('.action-delete');

            loadDatasetBtn?.addEventListener('click', async (e) => {
                e.stopPropagation();
                const datasetContentDiv = accordionRow.querySelector(`#dataset-details-${item.DataSetID} .dataset-content`);
                const loadBtn = e.target;
                
                // Update UI to show loading
                datasetContentDiv.innerHTML = '<p class="text-center">Loading dataset details...</p>';
                loadBtn.disabled = true;
                loadBtn.textContent = 'Loading...';
                
                try {
                    // Call the modified ViewDataSet function which returns a Promise
                    const datasetDetails = await ViewDataSet(item);
                    
                    // Create HTML to display dataset details
                    let detailsHTML = '';
                    
                    if (datasetDetails) {
                        for (const [key, value] of Object.entries(datasetDetails)) {
                            // Skip rendering the Fields property directly since it's HTML
                            if (key === 'Fields') continue;
                            
                            detailsHTML += `<p><strong>${key}:</strong> ${value}</p>`;
                        }
                        
                        // Add the fields table if it exists
                        if (datasetDetails.Fields) {
                            detailsHTML += `
                                <div class="mt-3">
                                    <strong>Fields:</strong>
                                    ${datasetDetails.Fields}
                                </div>
                            `;
                        }
                    } else {
                        detailsHTML = '<p class="text-center text-red-500">No dataset details available</p>';
                    }
                    
                    // Update the content
                    datasetContentDiv.innerHTML = detailsHTML;
                    
                    // Update button
                    loadBtn.textContent = 'Refresh Dataset Details';
                    loadBtn.disabled = false;
                    
                } catch (error) {
                    datasetContentDiv.innerHTML = `<p class="text-center text-red-500">Error loading dataset: ${error.message}</p>`;
                    loadBtn.textContent = 'Retry Loading Details';
                    loadBtn.disabled = false;
                }
            });

            deleteBtn?.addEventListener('click', (e) => {
                e.stopPropagation();
                DeleteRequest(item);
            });
            tbody.appendChild(row);
            tbody.appendChild(accordionRow);
        });
    }
    
    table.appendChild(tbody);
    container.appendChild(table);
}


// =================================================================
//                     PRIMARY RENDER FUNCTION
// =================================================================


async function getCounts(status) {
    const apiParams = {
        "page": currentPage,
        "pageSize": rowsPerPage,
        "search": '',
        "statusId": parseInt(Object.keys(statusIdToNameMap).find(key => statusIdToNameMap[key] === status))
    }
    
    console.log(apiParams)
    const response = await window.loomeApi.runApiRequest(API_REQUEST_ID, apiParams);
    const parsedResponse = safeParseJson(response);

    return parsedResponse.RowCount;
}

/**
 * Main function to orchestrate all rendering based on the current state.
 * It filters, paginates, and renders the table and controls.
 */
async function renderUI() {
    const activeChip = document.querySelector('.chip.active');
    if (!activeChip) return; // Don't render if no chip is active
    
    const selectedStatus = activeChip.dataset.status;
    const searchTerm = searchInput.value.toLowerCase();

    // --- 1. FETCH ALL DATA ONCE ---
    // We call the API without pagination params, assuming it returns all records.
    // If your API requires pagination, you'd need to fetch all pages in a loop here.
    const apiParams = {
        "page": currentPage,
        "pageSize": rowsPerPage,
        "search": searchTerm,
        "statusId": parseInt(Object.keys(statusIdToNameMap).find(key => statusIdToNameMap[key] === selectedStatus))
    }
    
    console.log(apiParams)
    const response = await window.loomeApi.runApiRequest(API_REQUEST_ID, apiParams);
    const parsedResponse = safeParseJson(response)
    const rawData = parsedResponse.Results;
    const totalItems = parsedResponse.RowCount;
    console.log(rawData)

    // --- 2. PREPARE THE MASTER DATA ARRAY ---
    // Transform the raw data just once into the format our UI needs.
    allRequests = rawData.map(item => ({
        ...item,
        status: statusIdToNameMap[item.StatusID] || 'Unknown'
    }));
    console.log(allRequests)

    // --- Render the components ---
    const configForTable = configMap[selectedStatus];
    renderTable(TABLE_CONTAINER_ID, allRequests, configForTable, selectedStatus);
    renderPagination('pagination-controls', totalItems, rowsPerPage, currentPage);
}

// =================================================================
//                      INITIALIZATION
// =================================================================

/**
 * Main function to initialize the page, fetch all data, and set up listeners.
 */
async function renderMyRequestsPage() {
    try {

        // --- 3. UPDATE ALL CHIP COUNTS ONCE ---
        // This is the logic you wanted. It calculates counts from the unfiltered master array.
        const chipsContainer = document.getElementById('status-chips-container');
        for (const chip of chipsContainer.querySelectorAll('.chip')) {
            const status = chip.dataset.status;
            console.log(status)
            // Await the asynchronous getCounts function for each chip
            const count = await getCounts(status);
            chip.querySelector('.chip-count').textContent = count;
        }

        // --- 4. SETUP EVENT LISTENERS ---
        
        // Listener for status chip clicks
        chipsContainer.addEventListener('click', (event) => {
            const clickedChip = event.target.closest('.chip');
            if (!clickedChip) return;

            chipsContainer.querySelectorAll('.chip').forEach(chip => chip.classList.remove('active'));
            clickedChip.classList.add('active');
            
            currentPage = 1; // Reset to page 1 when changing tabs
            renderUI(); // Re-render everything
        });

        // Listener for the search input
        searchInput.addEventListener('input', () => {
            currentPage = 1; // Reset to page 1 when searching
            renderUI(); // Re-render everything
        });

        // Listener for pagination buttons
        document.getElementById('pagination-controls').addEventListener('click', (event) => {
            const button = event.target.closest('button[data-page]');
            if (!button || button.disabled) return;
            
            currentPage = parseInt(button.dataset.page, 10);
            renderUI(); // Re-render everything
        });

        // --- 5. INITIAL PAGE RENDER ---
        // Programmatically click the first chip to trigger the initial render.
        document.querySelector('.chip[data-status="Pending Approval"]').click();

    } catch (error) {
        console.error("Error setting up the page:", error);
        // ... your error handling ...
    }
}

// Start the application
renderMyRequestsPage();
