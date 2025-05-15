document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const shoppingListContainer = document.getElementById('shopping-list-container');
    const jsonInput = document.getElementById('json-input');
    const loadListButton = document.getElementById('load-list-button');
    const toggleUncheckedButton = document.getElementById('toggle-unchecked-button');
    const inputArea = document.getElementById('input-area');
    const listControls = document.getElementById('list-controls');

    // Data structure to hold the shopping list
    let shoppingListData = {}; // Format: { "category": [{ name: "product", checked: false }, ...], ... }
    let showOnlyUnchecked = false; // Flag to toggle visibility of unchecked items

    // Attempt to load the shopping list from the URL hash on page load
    loadListFromURL();

    // Event listener for the "Load List" button
    loadListButton.addEventListener('click', () => {
        try {
            // Parse the JSON input and convert it to the internal format
            const rawInput = JSON.parse(jsonInput.value);
            shoppingListData = convertRawInputToInternalFormat(rawInput);

            // Clear the input field and update the UI
            jsonInput.value = '';
            inputArea.style.display = 'none'; // Hide the input area
            listControls.style.display = 'block'; // Show the list controls
            renderShoppingList(); // Render the shopping list
            updateURLHash(); // Update the URL hash with the new data
        } catch (error) {
            // Handle JSON parsing errors
            alert("Errore nel formato JSON. Assicurati che sia corretto.\nEs: {\"Frutta\": [\"Mela\", \"Banana\"]}");
            console.error("Errore parsing JSON:", error);
        }
    });

    // Event listener for the "Toggle Unchecked" button
    toggleUncheckedButton.addEventListener('click', () => {
        showOnlyUnchecked = !showOnlyUnchecked; // Toggle the flag
        shoppingListContainer.classList.toggle('hide-checked', showOnlyUnchecked); // Update the class
        toggleUncheckedButton.textContent = showOnlyUnchecked ? 'Mostra tutti' : 'Nascondi quelli già acquistati'; // Update button text
    });

    // Converts raw JSON input into the internal format used by the app
    function convertRawInputToInternalFormat(rawInput) {
        const internalFormat = {};
        for (const category in rawInput) {
            if (rawInput.hasOwnProperty(category) && Array.isArray(rawInput[category])) {
                internalFormat[category] = rawInput[category].map(productName => ({
                    name: String(productName), // Ensure the product name is a string
                    checked: false // Default to unchecked
                }));
            }
        }
        return internalFormat;
    }

    // Renders the shopping list in the DOM
    function renderShoppingList() {
        shoppingListContainer.innerHTML = ''; // Clear the previous list

        // If the shopping list is empty, show a message and the input area
        if (Object.keys(shoppingListData).length === 0) {
            shoppingListContainer.innerHTML = '<p>La lista della spesa è vuota o non ancora caricata.</p>';
            listControls.style.display = 'none';
            inputArea.style.display = 'block';
            return;
        }

        // Hide the input area and show the list controls
        inputArea.style.display = 'none';
        listControls.style.display = 'block';

        // Iterate through each category in the shopping list
        for (const categoryName in shoppingListData) {
            const categoryData = shoppingListData[categoryName];
            if (!Array.isArray(categoryData) || categoryData.length === 0) continue; // Skip empty categories

            // Create a block for the category
            const categoryBlock = document.createElement('div');
            categoryBlock.className = 'category-block';

            // Add a title for the category
            const categoryTitle = document.createElement('h3');
            categoryTitle.className = 'category-title';
            categoryTitle.textContent = categoryName;
            categoryBlock.appendChild(categoryTitle);

            // Add each product in the category
            categoryData.forEach(product => {
                const productItemDiv = document.createElement('div');
                productItemDiv.className = 'product-item';
                if (product.checked) {
                    productItemDiv.classList.add('checked'); // Add a class if the product is checked
                }

                // Create a checkbox for the product
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.checked = product.checked;
                checkbox.id = `item-${categoryName}-${product.name.replace(/\s+/g, '-')}`; // Unique ID

                // Create a label for the checkbox
                const label = document.createElement('label');
                label.textContent = product.name;
                label.setAttribute('for', checkbox.id);

                // Update the product's checked state when the checkbox changes
                checkbox.addEventListener('change', () => {
                    product.checked = checkbox.checked;
                    productItemDiv.classList.toggle('checked', product.checked);
                    updateURLHash(); // Update the URL hash whenever an item's state changes
                });

                // Append the checkbox and label to the product item
                productItemDiv.appendChild(checkbox);
                productItemDiv.appendChild(label);
                categoryBlock.appendChild(productItemDiv);
            });

            // Append the category block to the shopping list container
            shoppingListContainer.appendChild(categoryBlock);
        }

        // Apply the current filter state (hide unchecked items if necessary)
        shoppingListContainer.classList.toggle('hide-checked', showOnlyUnchecked);
    }

    // Updates the URL hash with the current shopping list data
    function updateURLHash() {
        if (Object.keys(shoppingListData).length > 0) {
            try {
                const dataToStore = JSON.stringify(shoppingListData);
                // Encode the data in Base64 for a cleaner URL
                location.hash = 'data=' + btoa(encodeURIComponent(dataToStore));
            } catch (e) {
                console.error("Errore durante l'aggiornamento dell'URL hash:", e);
                // Handle errors (e.g., data too large for Base64 or URL)
            }
        } else {
            location.hash = ''; // Clear the hash if the list is empty
        }
    }

    // Loads the shopping list from the URL hash
    function loadListFromURL() {
        if (location.hash && location.hash.startsWith('#data=')) {
            try {
                const base64Data = location.hash.substring(6); // Remove '#data='
                const decodedData = decodeURIComponent(atob(base64Data));
                const parsedData = JSON.parse(decodedData);

                // Validate and normalize the data structure
                if (parsedData && typeof parsedData === 'object' && Object.keys(parsedData).length > 0) {
                    shoppingListData = parsedData;
                    for (const category in shoppingListData) {
                        if (Array.isArray(shoppingListData[category])) {
                            shoppingListData[category] = shoppingListData[category].map(item => ({
                                name: String(item.name || item), // Handle legacy format (string-only items)
                                checked: !!item.checked // Ensure 'checked' is a boolean
                            }));
                        }
                    }
                    renderShoppingList(); // Render the list if successfully loaded
                    return;
                }
            } catch (error) {
                console.error('Errore nel caricare la lista dall\'URL:', error);
                alert('Non è stato possibile caricare la lista dall\'URL. Potrebbe essere corrotta.');
                location.hash = ''; // Clear the invalid hash
            }
        }

        // If no hash or loading fails, show the input area
        renderShoppingList(); // Show "empty list" message and input area
    }
});