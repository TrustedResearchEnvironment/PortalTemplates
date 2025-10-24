
/**
 * Renders a generic data table based on a configuration object.
 * @param {string} containerId - The ID of the element to render the table into.
 * @param {Array} headers - The array of header configuration objects.
 * @param {Array} data - The array of data objects to display.
 */
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
function updateTableForStatus(status, configs, allData, tableContainerId, searchTerm = '') {
    // Checkpoint 3: Does this function get called with the right data?
    console.log(`--- Updating table for status: "${status}" with search: "${searchTerm}" ---`);
    
    const activeChip = document.querySelector(`.chip[data-status="${status}"]`);
    const chips = activeChip.parentElement.querySelectorAll('.chip');
    
    chips.forEach(chip => {
        chip.classList.toggle('active', chip.dataset.status === status);
    });

    const config = configs[status];
    const originalData = allData[status];

    if (!config || !originalData) {
        console.error(`Config/data not found for: "${status}"`);
        return;
    }

    const lowerCaseSearchTerm = searchTerm.trim().toLowerCase();
    const filteredData = lowerCaseSearchTerm
        ? originalData.filter(item => 
            Object.values(item).some(value =>
                String(value).toLowerCase().includes(lowerCaseSearchTerm)
            )
        )
        : originalData;

    // Checkpoint 4: Did the filter work?
    console.log(`Original data length: ${originalData.length}, Filtered data length: ${filteredData.length}`);

    renderTable(tableContainerId, config.headers, filteredData);
}

async function renderPlatformAdminPage() {
    
    // Define the single container ID for the table
    const TABLE_CONTAINER_ID = 'requests-table-area';
        
    
    try {
        // --- 1. Fetch and prepare ALL data (same as your existing code) ---
        const dataSet = [
          {
            "DataSetID": 1,
            "Name": "BIS Data set example",
            "Description": "Barwon Infant Study, including URNs to demonstrate the platform (confirm owner & approvers once tests finished)",
            "DataSourceID": 1,
            "IsActive": 1,
            "ModifiedDate": "2025-03-14 00:35:29.333",
            "Approvers": "ria.yangzon@bizdata.com.au",
            "OptOutMessage": null,
            "OptOutList": null,
            "Owner": "lourdes.llorente@deakin.edu.au",
            "OptOutColumn": -1
          },
          {
            "DataSetID": 2,
            "Name": "Admissions & ED presentations",
            "Description": "BH-UHG Admissions and Emergency Department presentations at Barwon Health University Hospital Geelong (confirm owner & approvers once tests finished)",
            "DataSourceID": 4,
            "IsActive": 1,
            "ModifiedDate": "2025-05-08 04:20:55.757",
            "Approvers": "ria.yangzon@bizdata.com.au",
            "OptOutMessage": null,
            "OptOutList": "08/05/2025 12:20:42 - Ria.Yangzon@bizdata.com.au - 1294225 08/05/2025 12:20:50 - Ria.Yangzon@bizdata.com.au - 1294280",
            "Owner": "lourdes.llorente@barwonhealth.org.au",
            "OptOutColumn": 11
          },
          {
            "DataSetID": 4,
            "Name": "Folder sourced data set",
            "Description": "A demonstration of using a file server folder as a data set source",
            "DataSourceID": 5,
            "IsActive": 1,
            "ModifiedDate": "2025-04-30 14:35:43.340",
            "Approvers": "ria.yangzon@bizdata.com.au",
            "OptOutMessage": null,
            "OptOutList": null,
            "Owner": "luke.chen@bizdata.com.au",
            "OptOutColumn": -1
          },
          {
            "DataSetID": 7,
            "Name": "Deidentification test",
            "Description": "A small data set created to validate de-identification of data on periodic basis.",
            "DataSourceID": 8,
            "IsActive": 1,
            "ModifiedDate": "2025-02-10 02:09:26.307",
            "Approvers": "lourdes.llorente@deakin.edu.au",
            "OptOutMessage": null,
            "OptOutList": null,
            "Owner": "lourdes.llorente@deakin.edu.au",
            "OptOutColumn": -1
          },
          {
            "DataSetID": 10,
            "Name": "OD1-MangosteenBD",
            "Description": "16 week RCT placebo vs 1000mg/day mangosteen pericarp treatment of bipolar depression (data custodian note: in BH REDCap)",
            "DataSourceID": 7,
            "IsActive": 1,
            "ModifiedDate": "2022-10-03 01:17:54.793",
            "Approvers": "o.dean@deakin.edu.au",
            "OptOutMessage": null,
            "OptOutList": null,
            "Owner": "o.dean@deakin.edu.au",
            "OptOutColumn": -1
          },
          {
            "DataSetID": 11,
            "Name": "Project-based dataset",
            "Description": "Example project created using data from the archived project TSDIVF",
            "DataSourceID": 9,
            "IsActive": 1,
            "ModifiedDate": "2025-03-04 07:10:14.233",
            "Approvers": "lourdes.llorente@deakin.edu.au",
            "OptOutMessage": null,
            "OptOutList": null,
            "Owner": "lourdes.llorente@deakin.edu.au",
            "OptOutColumn": -1
          },
          {
            "DataSetID": 12,
            "Name": "Longitudinal Study",
            "Description": "A Demo data set using mockup data",
            "DataSourceID": 11,
            "IsActive": 1,
            "ModifiedDate": "2025-07-15 16:45:06.020",
            "Approvers": "ria.yangzon@bizdata.com.au",
            "OptOutMessage": null,
            "OptOutList": null,
            "Owner": "lourdes.llorente@deakin.edu.au",
            "OptOutColumn": -1
          },
          {
            "DataSetID": 13,
            "Name": "Test data set",
            "Description": "Test with outdated API token to ensure correct validation",
            "DataSourceID": 11,
            "IsActive": 0,
            "ModifiedDate": "2024-12-11 06:30:07.963",
            "Approvers": "lourdes.llorente@barwonhealth.org.au",
            "OptOutMessage": null,
            "OptOutList": null,
            "Owner": "lourdes.llorente@deakin.edu.au",
            "OptOutColumn": -1
          },
          {
            "DataSetID": 14,
            "Name": "Secondary dataset demo",
            "Description": "Demonstration of 2 simultaneous REDCap DCs for a secondary dataset",
            "DataSourceID": 11,
            "IsActive": 1,
            "ModifiedDate": "2025-05-23 01:56:37.323",
            "Approvers": "ria.yangzon@bizdata.com.au",
            "OptOutMessage": null,
            "OptOutList": "04/07/2023 09:45:59 - lourdes.llorente@deakin.edu.au - 1",
            "Owner": "lourdes.llorente@deakin.edu.au",
            "OptOutColumn": 1742
          },
          {
            "DataSetID": 36,
            "Name": "Mock Folder Data Source",
            "Description": "Testing Deidentification of file names",
            "DataSourceID": 27,
            "IsActive": 1,
            "ModifiedDate": "2025-08-28 13:15:47.970",
            "Approvers": "ria.yangzon@bizdata.com.au",
            "OptOutMessage": null,
            "OptOutList": null,
            "Owner": "ria.yangzon@bizdata.com.au",
            "OptOutColumn": -1
          },
          {
            "DataSetID": 17,
            "Name": "Test data set for development and testing",
            "Description": "Use for development and testing",
            "DataSourceID": 11,
            "IsActive": 1,
            "ModifiedDate": "2024-12-05 03:20:00.107",
            "Approvers": "ria.yangzon@bizdata.com.au",
            "OptOutMessage": null,
            "OptOutList": null,
            "Owner": "ria.yangzon@bizdata.com.au",
            "OptOutColumn": -1
          },
          {
            "DataSetID": 20,
            "Name": "Test data set for onboarding training",
            "Description": "Test REDCap DataSet On-boarding & Ingestion LLL 241001",
            "DataSourceID": 11,
            "IsActive": 1,
            "ModifiedDate": "2024-12-05 03:19:29.927",
            "Approvers": "lourdes.llorente@deakin.edu.au",
            "OptOutMessage": null,
            "OptOutList": null,
            "Owner": "lourdes.llorente@deakin.edu.au",
            "OptOutColumn": -1
          },
          {
            "DataSetID": 21,
            "Name": "MockUpData1000",
            "Description": "mock up data, 1000 records PID 3462",
            "DataSourceID": 11,
            "IsActive": 1,
            "ModifiedDate": "2025-09-10 06:29:57.530",
            "Approvers": "lourdes.llorente@deakin.edu.au",
            "OptOutMessage": null,
            "OptOutList": null,
            "Owner": "lourdes.llorente@deakin.edu.au",
            "OptOutColumn": -1
          },
          {
            "DataSetID": 33,
            "Name": "TestREDCapExportRights",
            "Description": "To test effect of data Export rights for the user providing the REDCap token",
            "DataSourceID": 11,
            "IsActive": 1,
            "ModifiedDate": "2025-05-21 01:24:10.253",
            "Approvers": "ria.yangzon@bizdata.com.au",
            "OptOutMessage": null,
            "OptOutList": null,
            "Owner": "lorudes.llorente@barwonhealth.org.au",
            "OptOutColumn": -1
          },
          {
            "DataSetID": 23,
            "Name": "MockUp100",
            "Description": "Randomly generated data, 100 rows, initially to re-test REDCap database type on-boarding; PID 6312",
            "DataSourceID": 11,
            "IsActive": 1,
            "ModifiedDate": "2025-07-28 13:12:11.363",
            "Approvers": "lourdes.llorente@deakin.edu.au",
            "OptOutMessage": null,
            "OptOutList": null,
            "Owner": "lourdes.llorente@deakin.edu.au",
            "OptOutColumn": -1
          },
          {
            "DataSetID": 34,
            "Name": "Mock SQL Data Set for Testing",
            "Description": "",
            "DataSourceID": 25,
            "IsActive": 1,
            "ModifiedDate": "2025-08-06 17:42:41.653",
            "Approvers": "ria.yangzon@bizdata.com.au",
            "OptOutMessage": null,
            "OptOutList": null,
            "Owner": "ria.yangzon@bizdata.com.au",
            "OptOutColumn": -1
          }
        ]
        const dataSource = [
          {
            "DataSourceID": 1,
            "Name": "BIS Data (pilot test)",
            "Description": "Set of Data from the Barwon Infant Study, including UN numbers, to test the platform in the Pilot phase.",
            "DataSourceTypeID": 2,
            "IsActive": 1,
            "ModifiedDate": "2022-05-11 00:14:27.760",
            "isRefreshed": 1,
            "RefreshedDate": "2022-05-11 00:08:37.653"
          },
          {
            "DataSourceID": 9,
            "Name": "Archived projects",
            "Description": "test on-board archived projects as folder source type",
            "DataSourceTypeID": 3,
            "IsActive": 1,
            "ModifiedDate": "2022-08-24 11:25:19.137",
            "isRefreshed": 1,
            "RefreshedDate": "2024-12-04 00:17:45.373"
          },
          {
            "DataSourceID": 4,
            "Name": "Barwon Health DB Source View 1",
            "Description": "Data base created for SHeBa that includes the views of the BH Data Warehouse approved for this purpose.",
            "DataSourceTypeID": 1,
            "IsActive": 1,
            "ModifiedDate": "2022-05-24 08:01:22.020",
            "isRefreshed": 1,
            "RefreshedDate": "2025-08-11 02:33:25.923"
          },
          {
            "DataSourceID": 11,
            "Name": "Barwon Health REDCap",
            "Description": "Connection to Barwon Health REDCap, and therefore Data source for all the projects within Barwon Health REDCap",
            "DataSourceTypeID": 2,
            "IsActive": 1,
            "ModifiedDate": "2022-10-24 05:55:39.457",
            "isRefreshed": 1,
            "RefreshedDate": "2022-10-10 04:17:19.927"
          },
          {
            "DataSourceID": 27,
            "Name": "Mock Folder Data Source",
            "Description": null,
            "DataSourceTypeID": 3,
            "IsActive": 1,
            "ModifiedDate": "2025-08-28 13:10:42.700",
            "isRefreshed": 1,
            "RefreshedDate": "2025-08-28 13:11:25.590"
          },
          {
            "DataSourceID": 5,
            "Name": "Test folder source",
            "Description": "Test folder source",
            "DataSourceTypeID": 3,
            "IsActive": 1,
            "ModifiedDate": "2022-05-30 02:09:10.673",
            "isRefreshed": 1,
            "RefreshedDate": "2024-12-04 00:17:45.373"
          },
          {
            "DataSourceID": 7,
            "Name": "Mangosteen pericarp for bipolar depression",
            "Description": "16 week RCT placebo vs 1000mg/day mangosteen pericarp treatment of bipolar depression (data custodian note: in BH REDCap)",
            "DataSourceTypeID": 2,
            "IsActive": 1,
            "ModifiedDate": "2022-07-26 06:12:36.700",
            "isRefreshed": 1,
            "RefreshedDate": "2022-07-26 06:12:36.700"
          },
          {
            "DataSourceID": 8,
            "Name": "testDeidentifiedREDCap",
            "Description": "verify that export with token from user with de-identified only rights is de-identified",
            "DataSourceTypeID": 2,
            "IsActive": 1,
            "ModifiedDate": "2022-07-26 10:31:37.290",
            "isRefreshed": 1,
            "RefreshedDate": "2022-07-26 10:31:37.290"
          },
          {
            "DataSourceID": 25,
            "Name": "Source Mock SQL Data for Testing",
            "Description": null,
            "DataSourceTypeID": 1,
            "IsActive": 1,
            "ModifiedDate": "2025-08-06 17:40:50.003",
            "isRefreshed": 1,
            "RefreshedDate": "2025-08-06 17:41:32.507"
          }
        ]
        const metaData = [
          {
            "MetaDataID": 1,
            "Name": "Tag",
            "Description": null,
            "IsActive": 1,
            "ModifiedDate": "2022-04-06 00:18:13.677"
          },
          {
            "MetaDataID": 2,
            "Name": "ANZCTR URL",
            "Description": "Link to the Australia New Zealand Clinical Trial Registry (ANZCTR) entry for the clinical trial for which the data were collected",
            "IsActive": 1,
            "ModifiedDate": "2022-04-05 03:54:27.677"
          },
          {
            "MetaDataID": 3,
            "Name": "Clinical trial name",
            "Description": "Name of the clinical trial associated with this IPD (Individual Participant Data)",
            "IsActive": 1,
            "ModifiedDate": "2022-04-05 03:57:20.507"
          },
          {
            "MetaDataID": 4,
            "Name": "Clinical Trial ID",
            "Description": "For clinical trials, trial ID number followed by the corresponding registry, e.g. ACTRN12621001425886 www.anzctr.org.au; NCT05307549 www.clinicaltrials.gov",
            "IsActive": 1,
            "ModifiedDate": "2022-04-05 04:12:01.657"
          },
          {
            "MetaDataID": 5,
            "Name": "Citations for related publications",
            "Description": "Citation for publications related to the DataSet (e.g. methods, analysis results) in Harvard style (confirm)",
            "IsActive": 1,
            "ModifiedDate": "2022-04-06 00:59:24.120"
          }
        ]
        const dataSourceTypes = [
          {
            "DataSourceTypeID": 1,
            "Name": "Database",
            "Description": "Database Data Source",
            "IsActive": 1,
            "ModifiedDate": "2022-02-22 04:09:03.993"
          },
          {
            "DataSourceTypeID": 2,
            "Name": "REDCap API",
            "Description": "REDCap API Source",
            "IsActive": 1,
            "ModifiedDate": "2022-09-13 02:13:29.563"
          },
          {
            "DataSourceTypeID": 3,
            "Name": "Folder",
            "Description": "Folder & File Source",
            "IsActive": 1,
            "ModifiedDate": "2022-05-26 23:40:38.670"
          }
        ]
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
        ]
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
        
        // Place this inside renderPlatformAdminPage, replacing your old 'headers' object.
        const tableConfigs = {
            "Data Sets": {
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
            },
            "Data Sources": {
                headers: [
                    { label: "Name", key: "Name", className: "break-words", widthClass: "w-3/12" },
                    { label: "Description", key: "Description", className: "break-words", widthClass: "w-4/12" },
                    { label: "Type ID", key: "DataSourceTypeID", widthClass: "w-1/12 text-center" },
                    { label: "Refreshed Date", key: "RefreshedDate", render: (value) => formatDate(value) },
                    {
                        label: "Active",
                        key: "IsActive",
                        render: (value) => value === 1 ? 'Yes' : 'No'
                    },
                    {
                        label: "Actions",
                        key: "actions",
                        render: (item) => `<button data-id="${item.DataSourceID}" class="text-indigo-600 hover:text-indigo-900 font-medium">Edit</button>`
                    }
                ]
            },
            "Meta-Data": {
                headers: [
                    { label: "Name", key: "Name", widthClass: "w-4/12" },
                    { label: "Description", key: "Description", className: "break-words", widthClass: "w-6/12" },
                    {
                        label: "Active",
                        key: "IsActive",
                        render: (value) => value === 1 ? 'Yes' : 'No'
                    },
                    {
                        label: "Actions",
                        key: "actions",
                        render: (item) => `<button data-id="${item.MetaDataID}" class="text-indigo-600 hover:text-indigo-900 font-medium">Edit</button>`
                    }
                ]
            },
            "Data Source Types": {
                headers: [
                    { label: "Name", key: "Name", widthClass: "w-4/12" },
                    { label: "Description", key: "Description", className: "break-words", widthClass: "w-6/12" },
                    {
                        label: "Active",
                        key: "IsActive",
                        render: (value) => value === 1 ? 'Yes' : 'No'
                    },
                    {
                        label: "Actions",
                        key: "actions",
                        render: (item) => `<button data-id="${item.DataSourceTypeID}" class="text-indigo-600 hover:text-indigo-900 font-medium">Edit</button>`
                    }
                ]
            },
            "Email Templates": {
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
            },
            "Requests": {
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
            }
        };
        // const headers = {
        //     "Data Sets": ["Type", "Name", "Description", "Data Source", "Active", "Actions"],
        //     "Data Sources": ["Type", "Name", "Description", "Refreshed", "Refreshed Date", "Active", "Actions"],
        //     "Meta-Data": ["Name", "Description", "Active", "Actions"],
        //     "Data Source Types": ["Name", "Description", "Active", "Actions"],
        //     "Email Templates": ["Type", "Actions"],
        //     "Requests": ["Project", "Request ID", "Name", "Status", "Data Set", "Requester", "Requested", "Approvers"]
        // };
        
        const data = {
            "Data Sets": dataSet,
            "Data Sources": dataSource,
            "Meta-Data": metaData,
            "Data Source Types": dataSourceTypes,
            "Email Templates": emailTemplates,
            "Requests":allRequests
        }
        const rowCounts = {
            "Data Sets": dataSet.length,
            "Data Sources": dataSource.length,
            "Meta-Data": metaData.length,
            "Data Source Types": dataSourceTypes.length,
            "Email Templates": emailTemplates.length,
            "Requests": allRequests.length
        }
        
        // const allRequests = requestData.map(item => ({
        //     ...item,
        //     project: item.ProjectID,
        //     name: item.Name,
        //     status: statusMap[item.StatusID] || 'Unknown',
        //     dataSet: `Data Set ${item.DataSetID}`,
        //     approvers: item.Approvers,
        //     dateRequested: formatDate(item.CreateDate),
        //     dateApproved: formatDate(item.ApprovedDate),
        //     dateRejected: formatDate(item.RejectedDate),
        //     dateFinalised: formatDate(item.FinalisedDate),
        //     rejectedBy: item.RejectedBy,
        //     currentlyApproved: item.CurrentlyApproved
        // }));
        
        // console.log(allRequests)
        
        // --- 2. Centralized Configuration ---
        // This maps a status to its specific configuration (like showActions).
        // const configMap = {
        //     'Pending Requests': { showActions: true },
        //     'Approved': { showActions: false },
        //     'Rejected': { showActions: false },
        //     'Finalised': { showActions: false },
        // };
        

        // --- 2. Get DOM elements and update chip counts ---
        const chipsContainer = document.getElementById('status-chips-container');
        const chips = chipsContainer.querySelectorAll('.chip');

        chips.forEach(chip => {
            const status = chip.dataset.status;
            if (rowCounts[status] !== undefined) {
                chip.querySelector('.chip-count').textContent = rowCounts[status];
            }
        });
        
        const searchInput = document.getElementById('searchRequests');
        
        // --- SEARCH EVENT LISTENER ---
        searchInput.addEventListener('input', () => {
            // Checkpoint 1: Does this fire when you type?
            console.log('Typing event detected!');
            
            const activeChip = document.querySelector('.chip.active');
            if (!activeChip) {
                console.error("Search failed: Could not find an active chip.");
                return;
            }

            const activeStatus = activeChip.dataset.status;
            const searchTerm = searchInput.value;

            // Checkpoint 2: Are we getting the right status and term?
            console.log(`Active status: "${activeStatus}", Search term: "${searchTerm}"`);

            updateTableForStatus(activeStatus, tableConfigs, data, TABLE_CONTAINER_ID, searchTerm);
        });
        
        // --- 3. Add click listeners that CALL the helper function ---
        chips.forEach(chip => {
            chip.addEventListener('click', (event) => {
                const selectedStatus = event.currentTarget.dataset.status;
                // Call the function with all the necessary data
                const searchTerm = searchInput.value;
        
                updateTableForStatus(selectedStatus, tableConfigs, data, TABLE_CONTAINER_ID, searchTerm);
            });
        });

        // --- 4. Initial Load ---
        const initialChip = document.querySelector('.chip[data-status="Data Sets"]');
        if (initialChip) {
            initialChip.click(); // This is the cleanest way to trigger the initial load
        } else {
            // Fallback if the chip isn't found
            updateTableForStatus("Data Sets", tableConfigs, data, TABLE_CONTAINER_ID, '');
            
        }

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

renderPlatformAdminPage()
