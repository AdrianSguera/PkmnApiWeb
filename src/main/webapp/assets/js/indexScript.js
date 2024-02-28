function searchObjects() {
    let searchTerm = document.getElementById('searchTerm').value.trim();
    searchPokemonByName(searchTerm);
    let newUrl = window.location.origin + window.location.pathname + '?searchTerm=' + encodeURIComponent(searchTerm);
    history.pushState(null, null, newUrl);
}

window.onload = function () {
    let params = new URLSearchParams(window.location.search);
    let searchTerm = params.get('searchTerm');
    if (searchTerm) {
        document.getElementById('searchTerm').value = searchTerm;
        searchPokemonByName(searchTerm);
    }
};

function searchPokemonByName(searchTerm) {
    let searchResultsDiv = document.getElementById('searchResults');

    // Realizar la solicitud a la API
    let apiUrl = "https://pokeapi.co/api/v2/pokemon/" + searchTerm.toLowerCase();

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('No se encontró el Pokémon.');
            }
            return response.json();
        })
        .then(data => {
            // Limpiar los resultados anteriores
            searchResultsDiv.innerHTML = '';

            // Mostrar los resultados
            let pokemonId = data.id;
            let pokemonBaseExp = data.base_experience;
            let pokemonType = data.types.map(typeObj => typeObj.type.name).join(', ');
            let pokemonName = data.name;
            let pokemonImageFront = data.sprites.front_default;
            let pokemonImageBack = data.sprites.back_default;

            let resultContainer = document.createElement('div');
            resultContainer.classList.add('pokemon-result');

            let pokemonIdElement = document.createElement('h5');
            pokemonIdElement.textContent = "Id: " + pokemonId;

            let pokemonBaseExpElement = document.createElement('h5');
            pokemonBaseExpElement.textContent = "Base exp: " + pokemonBaseExp;

            let pokemonTypeElement = document.createElement('h5');
            pokemonTypeElement.textContent = "Type: " + pokemonType;

            let pokemonNameElement = document.createElement('h5');
            pokemonNameElement.textContent = "Name: " + pokemonName;

            let pokemonImageElementFront = document.createElement('img');
            pokemonImageElementFront.src = pokemonImageFront;
            pokemonImageElementFront.alt = pokemonName;

            let pokemonImageElementBack = document.createElement('img');
            pokemonImageElementBack.src = pokemonImageBack;
            pokemonImageElementBack.alt = pokemonName;

            resultContainer.appendChild(pokemonIdElement);
            resultContainer.appendChild(pokemonBaseExpElement);
            resultContainer.appendChild(pokemonTypeElement);
            resultContainer.appendChild(pokemonNameElement);
            resultContainer.appendChild(pokemonImageElementFront);
            resultContainer.appendChild(pokemonImageElementBack);

            searchResultsDiv.appendChild(resultContainer);
        })
        .catch(error => {
            console.error('Error al buscar Pokémon:', error);
            searchResultsDiv.textContent = 'Ocurrió un error al buscar el Pokémon. Por favor, intenta de nuevo más tarde.';
        });
}
