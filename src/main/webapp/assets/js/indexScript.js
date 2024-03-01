function searchPokemon() {
    let searchTerm = document.getElementById('searchTerm').value.trim();
    loadPokemonIndexPage(searchTerm);
}

window.onload = function () {
    let params = new URLSearchParams(window.location.search);
    let searchTerm = params.get('searchTerm');
    if (searchTerm) {
        document.getElementById('searchTerm').value = searchTerm;
        loadPokemonIndexPage(searchTerm);
    }
};

async function loadPokemonIndexPage(searchTerm) {
    try {
        let newUrl = window.location.origin + window.location.pathname + '?searchTerm=' + encodeURIComponent(searchTerm);
        history.pushState(null, null, newUrl);

        // Buscar el Pokémon por nombre
        let pokemonData = await searchPokemonByName(searchTerm);
        showStatsPokemon(pokemonData);

        // Buscar la cadena de evolución del Pokémon
        let evolutionData = await searchEvolutionTree(searchTerm);
        showEvolutionPokemon(evolutionData);

        // Buscar las características del Pokémon
        let characteristicsData = await searchCharacteristicsPokemon(searchTerm);
        showCharacteristicsPokemon(characteristicsData);
    } catch (error) {
        console.error('Error al buscar Pokémon:', error);
    }
}

function searchPokemonByName(searchTerm) {
    // Realizar la solicitud a la API
    let apiUrl = "https://pokeapi.co/api/v2/pokemon/" + searchTerm.toLowerCase();

    return fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('No se encontró el Pokémon.');
            }
            return response.json();
        })
        .catch(error => {
            console.error('Error al buscar Pokémon:', error);
            throw error;
        });
}

function showStatsPokemon(data) {
    let searchResultsDiv = document.getElementById('searchResults');
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

    try {
        searchResultsDiv.appendChild(resultContainer);
    } catch (error) {
        console.error('Error al buscar Pokémon:', error);
        searchResultsDiv.textContent = 'Ocurrió un error al buscar el Pokémon. Por favor, intenta de nuevo más tarde.';
    }
}

function searchEvolutionTree(searchTerm) {
    return searchPokemonByName(searchTerm)
        .then(data => {
            return fetch("https://pokeapi.co/api/v2/pokemon-species/" + data.id)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('No se encontró la especie del Pokémon.');
                    }
                    return response.json();
                })
                .then(speciesData => {
                    // Obtener la URL de la cadena de evolución
                    let evolutionChainUrl = speciesData.evolution_chain.url;
                    // Hacer otra solicitud para obtener la cadena de evolución
                    return fetch(evolutionChainUrl)
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('No se encontró la cadena de evolución del Pokémon.');
                            }
                            return response.json();
                        });
                });
        })
        .catch(error => {
            console.error('Error al buscar la cadena de evolución del Pokémon:', error);
            throw error;
        });
}

function showEvolutionPokemon(evolutionData) {
    let evolutionTreeDiv = document.getElementById('evolutionTree');
    // Limpiar los resultados anteriores
    evolutionTreeDiv.innerHTML = '';

    // Crear un contenedor para mostrar las evoluciones
    let evolutionContainer = document.createElement('div');
    evolutionContainer.classList.add('evolution-container');

    try {
        // Agregar título de evoluciones
        let evolutionTitle = document.createElement('h2');
        evolutionTitle.textContent = 'Evoluciones';
        evolutionContainer.appendChild(evolutionTitle);

        // Acceder a la cadena de evolución
        let evolutionChain = evolutionData.chain;

        // Crear una tabla para mostrar las evoluciones
        let table = document.createElement('table');
        table.classList.add('evolution-table');

        let rowName = table.insertRow();
        let rowImages = table.insertRow();

        let countEvolutions = 0;

        // Función recursiva para procesar las evoluciones
        function processEvolutions(chain) {
            countEvolutions ++;
            // Crear una nueva fila en la tabla
            let cellName = rowName.insertCell();
            let evolutionLink = document.createElement('a');
            evolutionLink.textContent = chain.species.name;
            evolutionLink.href = 'index.html?searchTerm=' + chain.species.name;

            cellName.th = true;
            cellName.appendChild(evolutionLink);

            // Crear una nueva fila en la tabla
            let cellImages = rowImages.insertCell();

            // Obtener la imagen de la evolución
            searchPokemonByName(chain.species.name)
                .then(evolutionData => {
                    let pokemonImageFront = evolutionData.sprites.front_default;
                    let pokemonImageBack = evolutionData.sprites.back_default;

                    // Agregar la imagen de la evolución a la segunda fila
                    let pokemonImageElementFront = document.createElement('img');
                    pokemonImageElementFront.src = pokemonImageFront;
                    cellImages.appendChild(pokemonImageElementFront);

                    let pokemonImageElementBack = document.createElement('img');
                    pokemonImageElementBack.src = pokemonImageBack;
                    cellImages.appendChild(pokemonImageElementBack);
                })
                .catch(error => {
                    console.error('Error al buscar imagen de evolución:', error);
                });

            // Verificar si hay más evoluciones
            if (chain.evolves_to && chain.evolves_to.length > 0) {
                // Iterar a través de las evoluciones
                chain.evolves_to.forEach(evolution => {
                    // Llamar recursivamente a la función para procesar las evoluciones
                    processEvolutions(evolution);
                });
            }
        }

        // Llamar a la función para procesar las evoluciones
        processEvolutions(evolutionChain);

        //Establezco el ancho de la tabla
        let tableWidth = countEvolutions * 9;
        table.style.width = tableWidth.toString() + "%";

        // Agregar la tabla al contenedor de evoluciones
        evolutionContainer.appendChild(table);

        // Agregar el contenedor de evoluciones al árbol de evolución
        evolutionTreeDiv.appendChild(evolutionContainer);
    } catch (error) {
        console.error('Error al mostrar la evolución del Pokémon:', error);
        evolutionTreeDiv.textContent = 'Ocurrió un error al mostrar la evolución del Pokémon. Por favor, intenta de nuevo más tarde.';
    }
}

function searchCharacteristicsPokemon(searchTerm) {
    return searchPokemonByName(searchTerm)
        .then(data =>{
            return fetch('https://pokeapi.co/api/v2/characteristic/' + data.id)
                .then(response =>{
                    if (!response.ok) {
                        let characteristicsDiv = document.getElementById('characteristics');
                        characteristicsDiv.textContent = 'This pokemon does not have characteristics page.'
                    }
                    return response.json();
                })
        });
}

function showCharacteristicsPokemon(characteristicsData) {
    let characteristicsDiv = document.getElementById('characteristics');
        // Limpiar los resultados anteriores
        characteristicsDiv.innerHTML = '';

        // Mostrar los resultados
        let pokemonDescriptions = characteristicsData.descriptions;
        pokemonDescriptions.forEach(function (element){
            let pokemonDescription = element.description;
            if (element.language.name === 'en'){
                let resultContainer = document.createElement('div');
                resultContainer.classList.add('pokemon-characteristics');

                let pokemonCharacteristicsElement = document.createElement('h5');
                pokemonCharacteristicsElement.textContent = "Description: " + pokemonDescription;

                resultContainer.appendChild(pokemonCharacteristicsElement);

                try {
                    characteristicsDiv.appendChild(resultContainer);
                } catch (error) {
                    console.error('Error al buscar Pokémon:', error);
                    characteristicsDiv.textContent = 'Ocurrió un error al buscar el Pokémon. Por favor, intenta de nuevo más tarde.';
                }
            }
        });
}



