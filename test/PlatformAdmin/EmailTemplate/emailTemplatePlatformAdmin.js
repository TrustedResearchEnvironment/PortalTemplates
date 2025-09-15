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

async function renderPlatformAdminEmailTemplatesPage() {
    
    try {
        
        const emailTemplates = [
          {
            "EmailTemplateID": 1,
            "EmailTemplateType": "RequestApproval",
            "EmailTemplateSubject": "SHeBa – Data Access Request pending approval",
            "EmailTemplateText": "<p>Hi,</p><p>You are listed as one of the approvers for a data set that is available on the Secure Health Data and Biosample Platform (SHeBa -- <a href=\"url\">https://portal.sheba.org.au</a>).</p><p>A request is pending on your approval in SHeBa.</p><p>The request includes this information:</p>",
            "ModifiedDate": "2022-07-04 02:38:30.697"
          },
          {
            "EmailTemplateID": 2,
            "EmailTemplateType": "RequestApproved",
            "EmailTemplateSubject": "SHeBa – Your Data Access Request has been approved",
            "EmailTemplateText": "<p>Hi,</p><p>Your data access request has been successfully approved!</p>",
            "ModifiedDate": "2022-07-04 02:38:30.700"
          },
          {
            "EmailTemplateID": 3,
            "EmailTemplateType": "RequestRejected",
            "EmailTemplateSubject": "SHeBa – Your Data Access Request has not been approved",
            "EmailTemplateText": "<p>Hi,</p><p>Your data access request was not approved. Please review the following information and reach out to the Approver or to the SHeBa Data Manager with any questions.</p>",
            "ModifiedDate": "2022-07-04 02:38:30.703"
          },
          {
            "EmailTemplateID": 4,
            "EmailTemplateType": "RequestEscalated",
            "EmailTemplateSubject": "SHeBa - Escalated Data Access Request pending approval",
            "EmailTemplateText": "<p>Hi,</p><p>The following data access request is escalated as it has been pending for over 48 hours.</p><p>The pending request includes this information:</p>",
            "ModifiedDate": "2022-07-29 05:53:11.687"
          }
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
                    { label: "Type", key: "EmailTemplateType", className: "whitespace-nowrap", widthClass: "w-3/12" },
                    { label: "Subject", key: "EmailTemplateSubject", className: "break-words", widthClass: "w-6/12" },
                    { label: "Modified Date", key: "ModifiedDate", render: (value) => formatDate(value) },
                    {
                        label: "Actions",
                        key: "actions",
                        render: (item) => `<button data-id="${item.EmailTemplateID}" class="text-indigo-600 hover:text-indigo-900 font-medium">Edit</button>`
                    }
                ]
            };
        
        const data = emailTemplates
        
        const rowCounts = emailTemplates.length
        
        const emailTemplatesCount = document.getElementById('emailTemplatesCount')
        emailTemplatesCount.textContent = rowCounts
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

renderPlatformAdminEmailTemplatesPage()
