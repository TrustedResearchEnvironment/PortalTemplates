
    const bearerToken1 = localStorage.getItem('oidc.user:https://test-id.loomesoftware.com/:5918db6c-9715-44c4-b627-d0f1e2a3fa1c');
    // bearer is json take the element called access_token
    const bearerToken = JSON.parse(bearerToken1)?.access_token;

    if (bearerToken) {
        fetch('https://test-app-api.loomesoftware.com/api/v1/apirequests/run/3', {
            headers: {
                'Authorization': `Bearer ${bearerToken}`
            }
        })
        .then(response => response.json())
        .then(data => {
            //render this as a table
  
            const table = document.createElement('table');
            table.className = 'table table-striped'; // Add bootstrap classes
            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            headerRow.innerHTML = `
                <th scope="col">Name</th>
                <th scope="col">Price</th>
                <th scope="col">Is Offer</th>
            `;
            thead.appendChild(headerRow);
            table.appendChild(thead);

            const tbody = document.createElement('tbody');
            data.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.name}</td>
                    <td>${item.price}</td>
                    <td>${item.is_offer}</td>
                `;
                tbody.appendChild(row);
            });
            table.appendChild(tbody);

            document.body.appendChild(table);
        })
        .catch(error => {
            console.error('Error fetching item:', error);
        });
    } else {
        console.error('Bearer token not found in localStorage.');
        const errorDiv = document.createElement('div');
        errorDiv.textContent = 'Error: Bearer token not found.';
        document.body.appendChild(errorDiv);
    }
