let isLoading = false;
let currIndex = 21; 
const pokemonCardCont = document.getElementById('pokemon-card-container');

// Function to fetch more data
async function fetchMoreData() {
  isLoading = true;
    try {
        for (let id = currIndex; id < currIndex + 15; id++) {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon/' + id);
        const pokemon = await response.json();
        let htmlTypes = ``;
        
        pokemon.types.forEach(element => {
            htmlTypes += `<span class="${element.type.name} text-xs font-medium me-2 px-2.5 py-0.5 rounded">${element.type.name}</span>
            `;
        });
        pokemonCardCont.innerHTML += `
            <div class="card-cont flex justify-center items-center flex-col block max-w-xs max-h-40 p-6 mt-8 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 hover:border-zinc-400 hover:border-2" onclick="getPokemonData(this)">
                <div class="pokemon-img-cont container flex justify-center w-24 h-24">
                        <img src="${pokemon.sprites.versions['generation-v']['black-white'].front_default}" class="pokemon-icon-idle">
                </div>
                        <div class="flex justify-center	items-center flex-col -pt-2">
                        <p class="text-xs text-gray-500 dark:text-gray-400">N° ${pokemon.id}</p>
                        <h5 class="mb-1 text-xl font-bold tracking-tight text-gray-900 dark:text-white pokemon-title">${pokemon.name}</h5>  
                        <div>
                            ` + htmlTypes +
                            `
                    </div>  
                </div>
            </div>
        `;
        }
        currIndex += 15;
    } catch (error) {
        console.error('Error fetching more data:', error);
    } finally {
        isLoading = false;
    }
}

function changePDex(pokedexE) {
      const pokedex = document.getElementById('pokedex-entry');
      pokedex.classList.remove('hidden');

      const pokedexEnt = document.querySelector('#pokedex-entry p');
      const text = pokedexE.flavor_text_entries[1].flavor_text;

      //formatting pokedex
      const replacedText = text.replace(/\/g, ' '); 
      let newText = replacedText.toLowerCase(); 

      newText = newText.replace(/(^\w|\.\s*\w)/g, function(sentence) {
          return sentence.toUpperCase();
      });

      pokedexEnt.textContent = newText;
}


function changeImage(pokemon, id) {
    const img = document.getElementById('pokemon-anim-select');
    const newImg = new Image();

    newImg.onload = function() {
      img.src = this.src;
      img.style.height = this.height * 4 + 'px';
    };

     //only 649 less ids have gifs
     if (id < 650) {
        newImg.src = pokemon.sprites.versions['generation-v']['black-white']['animated'].front_default;
     } else {
        newImg.src = pokemon.sprites.versions['generation-v']['black-white'].front_default;
     }
}

function changePokeDesc(pokemon, id) {
      const pokePrompt = document.querySelector('.prompt');
      pokePrompt.classList.add('hidden');

      const pokemonDesc = document.querySelector('.pokemon-selected-desc');
      pokemonDesc.classList.remove('hidden');

      const pokemonId = document.getElementById('n-id');
      const pokeName = document.getElementById('selected-pokemon-title');
      const pokeTypes = document.getElementById('selected-pokemon-types');
      pokemonId.textContent = 'N° ' + id;
      pokeName.textContent = pokemon.name;

      let htmlTypes = ``;

      pokemon.types.forEach(element => {
      htmlTypes += `<span class="${element.type.name} text-xs font-medium me-2 px-2.5 py-0.5 rounded">${element.type.name}</span>`;
      });

      pokeTypes.innerHTML = htmlTypes;
}

function changeHandW(pokemon) {
      const pokeHW = document.getElementById('poke-hw');
      pokeHW.classList.remove('hidden');
      const heightTxt = document.querySelector('#poke-hw #height div p');
      heightTxt.textContent = pokemon.height/10 + 'm';
      const weightTxt = document.querySelector('#poke-hw #weight div p');
      weightTxt.textContent = pokemon.weight + 'kg';
    
      //updating abilities
      const pokeAbilities = document.getElementById('poke-abilities');
      pokeAbilities.classList.remove('hidden');
      
      let pokeHtml = ` <h5 class="mb-1 text-xl font-bold tracking-tight text-gray-900 dark:text-white pokemon-title col-span-2">abilities</h5>
      `;

      if(pokemon.abilities.length == 1) {
        const formattedAbilityName = pokemon.abilities[0].ability.name.replace(/-/g, ' ').replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
        pokeHtml = `<div class="w-full col-span-2">
          <div class="container w-full bg-gray-100 rounded h-7 flex justify-center items-center">
              <p class="text-gray-800 text-sm font-medium">${formattedAbilityName}</p>
          </div> 
      </div>`;
      } else if (pokemon.abilities.length >= 2) {
        
        for (let i = 0; i < 2; i++) {
          const element = pokemon.abilities[i];
          const formattedAbilityName = element.ability.name.replace(/-/g, ' ').replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
          pokeHtml += `<div class="w-full col-span-1">
            <div class="container w-full bg-gray-100 rounded h-7 flex justify-center items-center">
                <p class="text-gray-800 text-sm font-medium">${formattedAbilityName}</p>
            </div> 
          </div>`;;
      }

      } else {
        pokeHtml = `<div class="w-full col-span-2">
          <div class="container w-full bg-gray-100 rounded h-7 flex justify-center items-center">
              <p class="text-gray-800 text-sm font-medium">None</p>
          </div> 
      </div>`;
      }

      pokeAbilities.innerHTML=pokeHtml;
}

async function getWeakNStrongAgainst(pokemon) {

    const weakAgainst = document.getElementById('weak-against');
    const weakDiv = document.getElementById('weak-ab');
    weakDiv.classList.remove('hidden');

    const strongAgainst = document.getElementById('strong-against');
    const strongDiv = document.getElementById('strong-ab');
    strongDiv.classList.remove('hidden');
    
    let strongTypes = new Set();
    let weakTypes = new Set();

    const promises = pokemon.types.map(async element => {
      const typeId = element.type.url.split('/').filter(part => part !== '').pop();
      const typeRes = await fetch(`https://pokeapi.co/api/v2/type/${typeId}`);
      const pokeTyp = await typeRes.json();
      
      pokeTyp.damage_relations['double_damage_to'].forEach(element => {
        strongTypes.add(element.name);
      });

      pokeTyp.damage_relations['double_damage_from'].forEach(element => {
        weakTypes.add(element.name);
    });
  });

    await Promise.all(promises);

    const strongHtml = [...strongTypes].map(type => `<span class="${type} text-xs font-medium me-2 px-2.5 py-0.5 rounded">${type}</span>`).join('');
    const weakHtml = [...weakTypes].map(type => `<span class="${type} text-xs font-medium me-2 px-2.5 py-0.5 rounded">${type}</span>`).join('');

    strongAgainst.innerHTML = strongHtml;
    weakAgainst.innerHTML = weakHtml;
    
}

async function getPokeEvolution(pokedexE) {
    const ev = await fetch(pokedexE.evolution_chain.url);
    const pokeEvo = await ev.json();

    const pokeEv = document.getElementById('poke-evo');
    pokeEv.classList.remove('hidden');

    const evolu = document.getElementById('evolution');

    let chain = pokeEvo.chain;

    let evoHTML = ``;

    while (chain.evolves_to[0] !== null || chain.evolves_to[0] !== undefined) {

      const parts = chain.species.url.split('/');
      const pID = parts[parts.length - 2];

      const image_id = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/' + pID + '.png';

      if(chain.evolves_to[0] != null || chain.evolves_to[0] != undefined) {
        let level = chain.evolves_to[0].evolution_details[0].min_level;

        if(level === null) {
          level = '?';
        } else {
          level = 'Lv. ' + level;
        }

        evoHTML+= `<div class="pok-evo-data container bg-gray-100 rounded me-3 hover:bg-gray-200" onclick="getPokemonDataC(this)">
        <img class="pok-evo-img w-20" src="${image_id}">
      </div>
      <div class="container bg-gray-100 rounded me-3">
    <h5 class="mb-1 text-xs tracking-tight text-gray-900 dark:text-white">${level}</h5>
       </div>
      `
        chain = chain.evolves_to[0];
      } else {
        evoHTML+= `<div class="pok-evo-data container bg-gray-100 rounded hover:bg-gray-200" onclick="getPokemonDataC(this)">
     <img class="pok-evo-img w-20" src="${image_id}">
        </div>`
        break;
      }
    }

          evolu.innerHTML = evoHTML;
}

async function fetchPokemon(id) {
      try {
          const response = await fetch('https://pokeapi.co/api/v2/pokemon/' + id);
          const pokemon = await response.json();

          const resp = await fetch('https://pokeapi.co/api/v2/pokemon-species/' + id);
          const pokedexE = await resp.json();
        
          //updating image
          changeImage(pokemon, id);

          //updating the pokemon description
          changePokeDesc(pokemon, id);

          //updating pokedex entry
          changePDex(pokedexE);

          //updating height and weight
          changeHandW(pokemon);

          //updating weak and strong against
          await getWeakNStrongAgainst(pokemon);

          //updating evolution
          await getPokeEvolution(pokedexE);

      } catch (error) {
          console.error('Error fetching pokemon data:', error);
      } 
  }

// Event listener for scroll
window.addEventListener('scroll', async () => {
  if (!isLoading && window.scrollY + 100 >= document.documentElement.scrollHeight - document.documentElement.clientHeight) {
    await fetchMoreData();
  }
});

//Function to get specific pokemon data
async function getPokemonData(element) {

    const pElement = element.querySelector('p');
    const parts = pElement.textContent.trim().split(' ');
    const id = parseInt(parts[1]);

    await fetchPokemon(id);
    
}

//Function to get specific pokemon data in cont
async function getPokemonDataC(element) {

  const img = element.querySelector('img');

  const imageUrl = img.src;

  const parts = imageUrl.split('/');
  const filename = parts[parts.length - 1];
  const id = filename.split('.')[0];

  await fetchPokemon(id);
  
}