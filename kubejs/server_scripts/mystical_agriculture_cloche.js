// Mystical Agriculture in der Garden Cloche von Immersive Engineering.
// IE kennt nur Cloche-Rezepte, MA bringt keine mit -> für jeden MA-Seed eins erzeugen.
// Soil = Farmland des Crop-Tiers (Inferium bis Supremium).
// Seeds kommen aus dem Tag mysticalagriculture:seeds, deaktivierte/neue Crops passen sich also automatisch an.

const MA_CLOCHE_TIME = 1280 // Ticks; Weizen in der Cloche braucht 640
// Tier-Zuordnung der MA-Crops (aus ModCrops von MA 8.0.27, Elemental zählt zu Tier 1).
// Der Seed wächst nur auf dem Farmland seines Tiers -> die Cloche braucht dasselbe Farmland als Soil.
const MA_CROPS_BY_FARMLAND = {
  inferium: [
    'air', 'earth', 'water', 'fire', 'inferium', 'stone', 'dirt', 'wood', 'ice', 'deepslate'
  ],
  prudentium: [
    'nature', 'dye', 'nether', 'coal', 'coral', 'honey', 'amethyst', 'pig', 'chicken', 'cow', 'sheep',
    'squid', 'fish', 'slime', 'turtle', 'armadillo', 'rubber', 'silicon', 'sulfur', 'aluminum', 'saltpeter',
    'apatite', 'grains_of_infinity', 'mystical_flower', 'marble', 'limestone', 'basalt', 'menril'
  ],
  tertium: [
    'iron', 'copper', 'nether_quartz', 'glowstone', 'redstone', 'obsidian', 'prismarine', 'sculk', 'zombie',
    'skeleton', 'creeper', 'spider', 'phantom', 'rabbit', 'tin', 'bronze', 'zinc', 'brass', 'silver', 'lead',
    'graphite', 'blizz', 'blitz', 'basalz', 'amethyst_bronze', 'slimesteel', 'pig_iron', 'copper_alloy',
    'redstone_alloy', 'conductive_alloy', 'manasteel', 'steeleaf', 'ironwood', 'aquamarine', 'sky_stone',
    'certus_quartz', 'quartz_enriched_iron'
  ],
  imperium: [
    'gold', 'lapis_lazuli', 'end', 'experience', 'breeze', 'blaze', 'ghast', 'enderman', 'steel', 'nickel',
    'constantan', 'electrum', 'invar', 'uranium', 'ruby', 'sapphire', 'peridot', 'soulium', 'signalum',
    'lumium', 'flux_infused_ingot', 'hop_graphite', 'cobalt', 'rose_gold', 'soularium', 'dark_steel',
    'pulsating_alloy', 'energetic_alloy', 'elementium', 'osmium', 'fluorite', 'refined_glowstone',
    'refined_obsidian', 'knightmetal', 'fiery_ingot', 'starmetal', 'compressed_iron', 'fluix',
    'energized_steel', 'blazing_crystal'
  ],
  supremium: [
    'diamond', 'emerald', 'netherite', 'wither_skeleton', 'platinum', 'iridium', 'enderium',
    'flux_infused_gem', 'manyullyn', 'queens_slime', 'hepatizon', 'vibrant_alloy', 'end_steel', 'terrasteel',
    'rock_crystal', 'draconium', 'yellorium', 'cyanite', 'niotic_crystal', 'spirited_crystal', 'uraninite'
  ]
}
const MA_CROP_FARMLAND = {}
Object.keys(MA_CROPS_BY_FARMLAND).forEach(tier => {
  MA_CROPS_BY_FARMLAND[tier].forEach(crop => { MA_CROP_FARMLAND[crop] = `mysticalagriculture:${tier}_farmland` })
})
const MA_CLOCHE_SOIL_FALLBACK = 'mysticalagriculture:supremium_farmland' // unbekannte (z. B. neue) Crops: höchstes Tier

// IE verlangt in Cloche-Rezepten ohne "fluid"-Feld exakt minecraft:water. Streams Reflowing ersetzt Wasser durch
// streamsreflowing:stream (nur im Tag c:water/minecraft:water) -> die Cloche fand dann nie ein Rezept und wuchs nicht.
const CLOCHE_WATER = { tag: 'c:water' }

ServerEvents.recipes(event => {
  // Alle bestehenden IE-Cloche-Rezepte (Hanf, Weizen, ...): jede Wasser-Variante zulassen
  event.forEachRecipe({ type: 'immersiveengineering:cloche' }, recipe => {
    recipe.merge({ fluid: CLOCHE_WATER })
  })

  Ingredient.of('#mysticalagriculture:seeds').itemIds.forEach(seedId => {
    let name = String(seedId).replace('mysticalagriculture:', '').replace(/_seeds$/, '')
    let essence = `mysticalagriculture:${name}_essence`
    if (!Item.exists(essence)) return

    let soil = MA_CROP_FARMLAND[name]
    if (!soil) {
      console.warn(`MA-Cloche: kein Tier für Crop '${name}' bekannt, nutze ${MA_CLOCHE_SOIL_FALLBACK}`)
      soil = MA_CLOCHE_SOIL_FALLBACK
    }

    event.custom({
      type: 'immersiveengineering:cloche',
      input: { item: seedId },
      soil: { item: soil },
      fluid: CLOCHE_WATER,
      render: { type: 'immersiveengineering:crop', block: `mysticalagriculture:${name}_crop` },
      results: [
        { count: 2, id: essence },
        { chance: 0.1, output: { id: seedId } }
      ],
      time: MA_CLOCHE_TIME
    }).id(`kubejs:cloche/mysticalagriculture/${name}`)
  })
})
