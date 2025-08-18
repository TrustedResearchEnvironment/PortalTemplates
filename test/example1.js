
try{
    window.loomeApi.runApiRequest(3)
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
    } catch (error) {
        console.error('Bearer token not found in localStorage.');
        const errorDiv = document.createElement('div');
        errorDiv.textContent = 'Error: Bearer token not found.';
        document.body.appendChild(errorDiv);
}

 