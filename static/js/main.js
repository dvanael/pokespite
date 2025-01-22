'use strict';

// Global variables
const pokeApi = 'https://pokeapi.co/api/v2/pokemon/';
const pokemonList = [];

const pokemonForm = document.getElementById('pokemon-form');
const downloadBtn = document.getElementById('id-download-btn');
const downloadLink = document.getElementById('id-download-link');
const alertText = document.querySelector('.alert-text');

async function getPokemom(pokemon) {
  try {
    const url = pokeApi + pokemon + '/';
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
}

function getPokemonName(data) {
  return data.name;
}

function getPokemonIcon(data) {
  return data.sprites.versions['generation-vii'].icons.front_default;
}

function removePokemon(event) {
  const pokemonName = event.target.parentElement.id;
  const pokemonIndex = pokemonList.findIndex(p => p.name === pokemonName);
  pokemonList.splice(pokemonIndex, 1);
  event.target.parentElement.remove();
}

pokemonForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const pokemon = document.getElementById('id-pokemon').value;

  try {
    const pokemonData = await getPokemom(pokemon);
    const pokemonName = getPokemonName(pokemonData);
    const pokemonIcon = getPokemonIcon(pokemonData);

    if (pokemonList.some(p => p.name === pokemonName)) {
      alertText.innerHTML = 'Esse Pokémon já foi adicionado. Tente novamente.';
      return;
    }

    const pokemonObject = {
      name: pokemonName,
      icon: pokemonIcon,
    };

    pokemonList.push(pokemonObject);

    const imageElement = `
      <img class="gallery" src="${pokemonIcon}" alt="${pokemonName}-icon">
      <p>${pokemonName}</p>
      <button class="remove-btn">X</button>
    `;

    const div = document.createElement('div');
    div.classList.add('image');
    div.setAttribute('id', pokemonName);
    div.innerHTML = imageElement;

    const removeButton = div.querySelector('.remove-btn');
    removeButton.addEventListener('click', removePokemon);

    const gallery = document.getElementById('id-gallery');
    gallery.appendChild(div);

    event.target.reset();
    alertText.innerHTML = '';

  } catch (error) {
    console.log(error);
    alertText.innerHTML = 'Pokémon não encontrado. Tente novamente.';
  }

});


downloadBtn.addEventListener('click', async (event) => {
  event.preventDefault();

  if (pokemonList.length > 0) {
    try {
      const response = await fetch('/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pokemonList),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        downloadLink.href = url;
        if (pokemonList.length === 1) {
          downloadLink.download = `${pokemonList[0].name}.png`;
        } else {
          downloadLink.download = 'pokemon_images.zip';
        }
        downloadLink.click();

        window.URL.revokeObjectURL(url);
      } else {
        console.error('Erro ao baixar o arquivo.');
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
    }
  } else {
    alertText.innerHTML = 'Nenhum Pokémon adicionado. Adicione um Pokémon primeiro.';
  }
});
