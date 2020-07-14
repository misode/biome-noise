const sliders = ['altitude', 'temperature', 'humidity', 'weirdness', 'offset']
const biomes = ['ocean','plains','desert','mountains','forest','taiga','swamp','river','nether_wastes','the_end','frozen_ocean','frozen_river','snowy_tundra','snowy_mountains','mushroom_fields','mushroom_field_shore','beach','desert_hills','wooded_hills','taiga_hills','mountain_edge','jungle','jungle_hills','jungle_edge','deep_ocean','stone_shore','snowy_beach','birch_forest','birch_forest_hills','dark_forest','snowy_taiga','snowy_taiga_hills','giant_tree_taiga','giant_tree_taiga_hills','wooded_mountains','savanna','savanna_plateau','badlands','wooded_badlands_plateau','badlands_plateau','small_end_islands','end_midlands','end_highlands','end_barrens','warm_ocean','lukewarm_ocean','cold_ocean','deep_warm_ocean','deep_lukewarm_ocean','deep_cold_ocean','deep_frozen_ocean','the_void','sunflower_plains','desert_lakes','gravelly_mountains','flower_forest','taiga_mountains','swamp_hills','ice_spikes','modified_jungle','modified_jungle_edge','tall_birch_forest','tall_birch_hills','dark_forest_hills','snowy_taiga_mountains','giant_spruce_taiga','giant_spruce_taiga_hills','modified_gravelly_mountains','shattered_savanna','shattered_savanna_plateau','eroded_badlands','modified_wooded_badlands_plateau','modified_badlands_plateau','bamboo_jungle','bamboo_jungle_hills','soul_sand_valley','crimson_forest','warped_forest','basalt_deltas']
const biomeColors = [[0,0,112],[141,179,96],[250,148,24],[96,96,96],[5,102,33],[11,2,89],[7,249,178],[0,0,255],[255,0,0],[128,128,255],[112,112,214],[160,160,255],[255,255,255],[160,160,160],[255,0,255],[160,0,255],[250,222,85],[210,95,18],[34,85,28],[22,57,51],[114,120,154],[83,123,9],[44,66,5],[98,139,23],[0,0,48],[162,162,132],[250,240,192],[48,116,68],[31,5,50],[64,81,26],[49,85,74],[36,63,54],[89,102,81],[69,7,62],[80,112,80],[189,18,95],[167,157,100],[217,69,21],[17,151,101],[202,140,101],[128,128,255],[128,128,255],[128,128,255],[128,128,255],[0,0,172],[0,0,144],[32,32,112],[0,0,80],[0,0,64],[32,32,56],[64,64,144],[0,0,0],[181,219,136],[255,188,64],[136,136,136],[45,142,73],[51,142,19],[47,255,18],[180,20,220],[123,13,49],[138,179,63],[88,156,108],[71,15,90],[104,121,66],[89,125,114],[129,142,121],[109,119,102],[120,52,120],[229,218,135],[207,197,140],[255,109,61],[216,191,141],[242,180,141],[118,142,20],[59,71,10],[82,41,33],[221,8,8],[73,144,123],[64,54,54]]

const canvas = document.getElementById('biomePreview')
const ctx = canvas.getContext('2d')
const size = 300
const noiseSize = 50

const model = []

const seedEl = document.getElementById('newSeed')
noise.seed(Math.random())
seedEl.addEventListener('click', () => {
  noise.seed(Math.random())
  update()
})

const biomeRaw = document.getElementById('biomeRaw')

biomeRaw.addEventListener('focus', (evt) => {
  biomeRaw.select()
  document.execCommand('copy');
})

const addBiome = document.getElementById('addBiome')
const biomeList = document.getElementById('biomeList')

addBiome.addEventListener('click', () => {
  const randomBiome = Math.floor(Math.random() * biomes.length)
  const biome = {
    biome: biomes[randomBiome],
    color: biomeColors[randomBiome],
    parameters: { altitude: 0, temperature: 0, humidity: 0, weirdness: 0, offset: 0 }
  }
  model.push(biome)

  const biomeDiv = document.createElement('div')
  biomeDiv.className = 'biomeEntry'
  biomeDiv.style.borderColor = `rgb(${biome.color[0]}, ${biome.color[1]}, ${biome.color[2]})`

  const headerDiv = document.createElement('div')
  const biomeName = document.createElement('select')
  const removeBiome = document.createElement('button')
  removeBiome.textContent = 'X'
  removeBiome.addEventListener('click', () => {
    const index = [].indexOf.call(biomeList.children, biomeDiv);
    biomeList.removeChild(biomeDiv)
    model.splice(index, 1)
    update()
  })

  biomes.forEach(b => biomeName.insertAdjacentHTML('beforeend', `<option>${b}</option>`))
  biomeName.value = model[model.length - 1].biome
  biomeName.addEventListener('change', () => {
    const index = [].indexOf.call(biomeList.children, biomeDiv);
    model[index].biome = biomeName.value
    const col = biomeColors[biomes.indexOf(biomeName.value)]
    model[index].color = col
    biomeDiv.style.borderColor = `rgb(${col[0]}, ${col[1]}, ${col[2]})`
    update()
  })

  headerDiv.appendChild(biomeName)
  headerDiv.appendChild(removeBiome)
  biomeDiv.appendChild(headerDiv)

  sliders.forEach(s => {
    const el = document.createElement('div')
    const sliderEl = document.createElement('input')
    const inputEl = document.createElement('input')
    const sliderAttrs = { type: 'range', min: '-1', max: '1', value: '0', step: '0.01' }
    const inputAttrs = { type: 'number', min: '-1', max: '1', value: '0', step: '0.01' }
    Object.keys(sliderAttrs).forEach(a => sliderEl.setAttribute(a, sliderAttrs[a]))
    Object.keys(inputAttrs).forEach(a => inputEl.setAttribute(a, inputAttrs[a]))
    sliderEl.addEventListener('change', () => {
      const index = [].indexOf.call(biomeList.children, biomeDiv);
      model[index].parameters[s] = parseFloat(sliderEl.value)
      inputEl.value = sliderEl.value
      update()
    })
    inputEl.addEventListener('change', () => {
      const index = [].indexOf.call(biomeList.children, biomeDiv);
      model[index].parameters[s] = parseFloat(inputEl.value)
      inputEl.value = inputEl.value || 0
      sliderEl.value = inputEl.value
      update()
    })
    el.appendChild(sliderEl)
    el.appendChild(inputEl)
    biomeDiv.appendChild(el)
  })
  biomeList.appendChild(biomeDiv)
  update()
})
addBiome.click()

function update() {
  if (model.length > 0) {
    let img = ctx.createImageData(size, size)
    let data = img.data
    for (let x = 0; x < size; x += 1) {
      for (let y = 0; y < size; y += 1) {
        const i = (y * (img.width * 4)) + (x * 4)
        const b = closestBiome(x/noiseSize, y/noiseSize)
        data[i] = b.color[0]
        data[i + 1] = b.color[1]
        data[i + 2] = b.color[2]
        data[i + 3] = 255
      }
    }
    ctx.putImageData(img, 0, 0)  
  }
  
  const modelOutput = model.map(b => ({
    biome: `minecraft:${b.biome}`,
    parameters: b.parameters
  }))
  document.getElementById('biomeRaw').textContent = JSON.stringify(modelOutput, null, 2)
}

function closestBiome(x, y) {
  const a = noise.perlin2(x, y)
  const b = noise.perlin2(x+noiseSize, y)
  const c = noise.perlin2(x-noiseSize, y)
  const d = noise.perlin2(x, y+noiseSize)
  return model
    .map(i => [i, dist(a, i.parameters.altitude, b, i.parameters.temperature, 
      c, i.parameters.humidity, d, i.parameters.weirdness, 0, i.parameters.offset)])
    .sort((a, b) => a[1] - b[1])[0][0]
}

function dist(a1, a2, b1, b2, c1, c2, d1, d2, e1, e2) {
  return (a1-a2)*(a1-a2) + (b1-b2)*(b1-b2) + (c1-c2)*(c1-c2) + (d1-d2)*(d1-d2) + (e1-e2)*(e1-e2)
}
