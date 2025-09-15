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

async function renderPlatformAdminDataSetPage() {
    
    try {
        // --- 1. Fetch and prepare ALL data (same as your existing code) ---
        // const dataSet = [
        //   {
        //     "DataSetID": 1,
        //     "Name": "BIS Data set example",
        //     "Description": "Barwon Infant Study, including URNs to demonstrate the platform (confirm owner & approvers once tests finished)",
        //     "DataSourceID": 1,
        //     "IsActive": 1,
        //     "ModifiedDate": "2025-03-14 00:35:29.333",
        //     "Approvers": "ria.yangzon@bizdata.com.au",
        //     "OptOutMessage": null,
        //     "OptOutList": null,
        //     "Owner": "lourdes.llorente@deakin.edu.au",
        //     "OptOutColumn": -1
        //   },
        //   {
        //     "DataSetID": 2,
        //     "Name": "Admissions & ED presentations",
        //     "Description": "BH-UHG Admissions and Emergency Department presentations at Barwon Health University Hospital Geelong (confirm owner & approvers once tests finished)",
        //     "DataSourceID": 4,
        //     "IsActive": 1,
        //     "ModifiedDate": "2025-05-08 04:20:55.757",
        //     "Approvers": "ria.yangzon@bizdata.com.au",
        //     "OptOutMessage": null,
        //     "OptOutList": "08/05/2025 12:20:42 - Ria.Yangzon@bizdata.com.au - 1294225 08/05/2025 12:20:50 - Ria.Yangzon@bizdata.com.au - 1294280",
        //     "Owner": "lourdes.llorente@barwonhealth.org.au",
        //     "OptOutColumn": 11
        //   },
        //   {
        //     "DataSetID": 4,
        //     "Name": "Folder sourced data set",
        //     "Description": "A demonstration of using a file server folder as a data set source",
        //     "DataSourceID": 5,
        //     "IsActive": 1,
        //     "ModifiedDate": "2025-04-30 14:35:43.340",
        //     "Approvers": "ria.yangzon@bizdata.com.au",
        //     "OptOutMessage": null,
        //     "OptOutList": null,
        //     "Owner": "luke.chen@bizdata.com.au",
        //     "OptOutColumn": -1
        //   },
        //   {
        //     "DataSetID": 7,
        //     "Name": "Deidentification test",
        //     "Description": "A small data set created to validate de-identification of data on periodic basis.",
        //     "DataSourceID": 8,
        //     "IsActive": 1,
        //     "ModifiedDate": "2025-02-10 02:09:26.307",
        //     "Approvers": "lourdes.llorente@deakin.edu.au",
        //     "OptOutMessage": null,
        //     "OptOutList": null,
        //     "Owner": "lourdes.llorente@deakin.edu.au",
        //     "OptOutColumn": -1
        //   },
        //   {
        //     "DataSetID": 10,
        //     "Name": "OD1-MangosteenBD",
        //     "Description": "16 week RCT placebo vs 1000mg/day mangosteen pericarp treatment of bipolar depression (data custodian note: in BH REDCap)",
        //     "DataSourceID": 7,
        //     "IsActive": 1,
        //     "ModifiedDate": "2022-10-03 01:17:54.793",
        //     "Approvers": "o.dean@deakin.edu.au",
        //     "OptOutMessage": null,
        //     "OptOutList": null,
        //     "Owner": "o.dean@deakin.edu.au",
        //     "OptOutColumn": -1
        //   },
        //   {
        //     "DataSetID": 11,
        //     "Name": "Project-based dataset",
        //     "Description": "Example project created using data from the archived project TSDIVF",
        //     "DataSourceID": 9,
        //     "IsActive": 1,
        //     "ModifiedDate": "2025-03-04 07:10:14.233",
        //     "Approvers": "lourdes.llorente@deakin.edu.au",
        //     "OptOutMessage": null,
        //     "OptOutList": null,
        //     "Owner": "lourdes.llorente@deakin.edu.au",
        //     "OptOutColumn": -1
        //   },
        //   {
        //     "DataSetID": 12,
        //     "Name": "Longitudinal Study",
        //     "Description": "A Demo data set using mockup data",
        //     "DataSourceID": 11,
        //     "IsActive": 1,
        //     "ModifiedDate": "2025-07-15 16:45:06.020",
        //     "Approvers": "ria.yangzon@bizdata.com.au",
        //     "OptOutMessage": null,
        //     "OptOutList": null,
        //     "Owner": "lourdes.llorente@deakin.edu.au",
        //     "OptOutColumn": -1
        //   },
        //   {
        //     "DataSetID": 13,
        //     "Name": "Test data set",
        //     "Description": "Test with outdated API token to ensure correct validation",
        //     "DataSourceID": 11,
        //     "IsActive": 0,
        //     "ModifiedDate": "2024-12-11 06:30:07.963",
        //     "Approvers": "lourdes.llorente@barwonhealth.org.au",
        //     "OptOutMessage": null,
        //     "OptOutList": null,
        //     "Owner": "lourdes.llorente@deakin.edu.au",
        //     "OptOutColumn": -1
        //   },
        //   {
        //     "DataSetID": 14,
        //     "Name": "Secondary dataset demo",
        //     "Description": "Demonstration of 2 simultaneous REDCap DCs for a secondary dataset",
        //     "DataSourceID": 11,
        //     "IsActive": 1,
        //     "ModifiedDate": "2025-05-23 01:56:37.323",
        //     "Approvers": "ria.yangzon@bizdata.com.au",
        //     "OptOutMessage": null,
        //     "OptOutList": "04/07/2023 09:45:59 - lourdes.llorente@deakin.edu.au - 1",
        //     "Owner": "lourdes.llorente@deakin.edu.au",
        //     "OptOutColumn": 1742
        //   },
        //   {
        //     "DataSetID": 36,
        //     "Name": "Mock Folder Data Source",
        //     "Description": "Testing Deidentification of file names",
        //     "DataSourceID": 27,
        //     "IsActive": 1,
        //     "ModifiedDate": "2025-08-28 13:15:47.970",
        //     "Approvers": "ria.yangzon@bizdata.com.au",
        //     "OptOutMessage": null,
        //     "OptOutList": null,
        //     "Owner": "ria.yangzon@bizdata.com.au",
        //     "OptOutColumn": -1
        //   },
        //   {
        //     "DataSetID": 17,
        //     "Name": "Test data set for development and testing",
        //     "Description": "Use for development and testing",
        //     "DataSourceID": 11,
        //     "IsActive": 1,
        //     "ModifiedDate": "2024-12-05 03:20:00.107",
        //     "Approvers": "ria.yangzon@bizdata.com.au",
        //     "OptOutMessage": null,
        //     "OptOutList": null,
        //     "Owner": "ria.yangzon@bizdata.com.au",
        //     "OptOutColumn": -1
        //   },
        //   {
        //     "DataSetID": 20,
        //     "Name": "Test data set for onboarding training",
        //     "Description": "Test REDCap DataSet On-boarding & Ingestion LLL 241001",
        //     "DataSourceID": 11,
        //     "IsActive": 1,
        //     "ModifiedDate": "2024-12-05 03:19:29.927",
        //     "Approvers": "lourdes.llorente@deakin.edu.au",
        //     "OptOutMessage": null,
        //     "OptOutList": null,
        //     "Owner": "lourdes.llorente@deakin.edu.au",
        //     "OptOutColumn": -1
        //   },
        //   {
        //     "DataSetID": 21,
        //     "Name": "MockUpData1000",
        //     "Description": "mock up data, 1000 records PID 3462",
        //     "DataSourceID": 11,
        //     "IsActive": 1,
        //     "ModifiedDate": "2025-09-10 06:29:57.530",
        //     "Approvers": "lourdes.llorente@deakin.edu.au",
        //     "OptOutMessage": null,
        //     "OptOutList": null,
        //     "Owner": "lourdes.llorente@deakin.edu.au",
        //     "OptOutColumn": -1
        //   },
        //   {
        //     "DataSetID": 33,
        //     "Name": "TestREDCapExportRights",
        //     "Description": "To test effect of data Export rights for the user providing the REDCap token",
        //     "DataSourceID": 11,
        //     "IsActive": 1,
        //     "ModifiedDate": "2025-05-21 01:24:10.253",
        //     "Approvers": "ria.yangzon@bizdata.com.au",
        //     "OptOutMessage": null,
        //     "OptOutList": null,
        //     "Owner": "lorudes.llorente@barwonhealth.org.au",
        //     "OptOutColumn": -1
        //   },
        //   {
        //     "DataSetID": 23,
        //     "Name": "MockUp100",
        //     "Description": "Randomly generated data, 100 rows, initially to re-test REDCap database type on-boarding; PID 6312",
        //     "DataSourceID": 11,
        //     "IsActive": 1,
        //     "ModifiedDate": "2025-07-28 13:12:11.363",
        //     "Approvers": "lourdes.llorente@deakin.edu.au",
        //     "OptOutMessage": null,
        //     "OptOutList": null,
        //     "Owner": "lourdes.llorente@deakin.edu.au",
        //     "OptOutColumn": -1
        //   },
        //   {
        //     "DataSetID": 34,
        //     "Name": "Mock SQL Data Set for Testing",
        //     "Description": "",
        //     "DataSourceID": 25,
        //     "IsActive": 1,
        //     "ModifiedDate": "2025-08-06 17:42:41.653",
        //     "Approvers": "ria.yangzon@bizdata.com.au",
        //     "OptOutMessage": null,
        //     "OptOutList": null,
        //     "Owner": "ria.yangzon@bizdata.com.au",
        //     "OptOutColumn": -1
        //   }
        // ]
        
        const response = await window.loomeApi.runApiRequest(10);
        const parsedResponse = safeParseJson(response);
        const dataSet = parsedResponse.Results;
        let currentPage = parsedResponse.CurrentPage;
        const rowsPerPage = parsedResponse.PageSize; 
        console.log(dataSet)
        
        
        
        // Place this inside renderPlatformAdminPage, replacing your old 'headers' object.
        const tableConfig = {
                headers: [
                    { label: "Name", key: "Name", className: "break-words", widthClass: "w-3/12" },
                    { label: "Description", key: "Description", className: "break-words", widthClass: "w-3/12" },
                    { label: "Data Source ID", key: "DataSourceID", widthClass: "w-1/12 text-center" },
                    { label: "Owner", key: "Owner", className: "break-words", widthClass: "w-2/12" },
                    {
                        label: "Active",
                        key: "IsActive",
                        widthClass: "w-1/12",
                        render: (value) =>
                            value === 1
                                ? `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>`
                                : `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Inactive</span>`
                    },
                    {
                        label: "Actions",
                        key: "actions",
                        render: (item) => `<button data-id="${item.DataSetID}" class="text-indigo-600 hover:text-indigo-900 font-medium">Edit</button>`
                    }
                ]
        };
        
        const data = dataSet
        
        const rowCounts = dataSet.length
        
        const dataSetCount = document.getElementById('dataSetCount')
        dataSetCount.textContent = rowCounts
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

renderPlatformAdminDataSetPage()
