let fetchAllPokemon = async () => {
    let allPokemon = [];

    let offset = 0;
    let limit = 20; // Número de Pokémon a obtener por página

    while (true) {
        let response = await fetch(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`);
        let data = await response.json();

        if (data.results.length === 0) {
            break; // No hay más Pokémon, salir del bucle
        }

        allPokemon.push(...data.results);
        offset += limit; // Aumentar el offset para la próxima página
    }

    return allPokemon;
};

// Utilizar la función para obtener todos los Pokémon
fetchAllPokemon()
    .then(pokemonList => {
        // Una vez que se obtienen todos los Pokémon, se procesa la lista
        let pokemonListElement = document.getElementById('pokemonList');
        let spritePromises = [];

        pokemonList.forEach(pokemon => {
            // Crear un elemento <li> para cada Pokémon
            let listItem = document.createElement('li');

            // Crear un enlace para el nombre del Pokémon
            let pokemonNameLink = document.createElement('a');
            pokemonNameLink.textContent = pokemon.name;
            pokemonNameLink.href = `index.html?searchTerm=${encodeURIComponent(pokemon.name)}`;
            listItem.appendChild(pokemonNameLink);

            // Añadir la promesa de obtener el sprite del Pokémon
            let spritePromise = fetch(pokemon.url)
                .then(response => response.json())
                .then(pokemonData => {
                    let pokemonSprite = document.createElement('img');
                    pokemonSprite.src = pokemonData.sprites.front_default;
                    pokemonSprite.alt = pokemonData.name;
                    listItem.appendChild(pokemonSprite);
                })
                .catch(error => console.error('Error al obtener información del Pokémon:', error));

            spritePromises.push(spritePromise);

            // Agregar el elemento <li> al contenedor de la lista de Pokémon
            pokemonListElement.appendChild(listItem);
        });

        // Esperar que todas las promesas de sprites se completen antes de continuar
        return Promise.all(spritePromises);
    })
    .catch(error => {
        console.error('Error al obtener todos los Pokémon:', error);
    });
