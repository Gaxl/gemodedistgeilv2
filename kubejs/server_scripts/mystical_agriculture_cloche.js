// Mystical Agriculture in der Garden Cloche von Immersive Engineering.
// IE kennt nur Cloche-Rezepte, MA bringt keine mit -> für jeden MA-Seed eins erzeugen.
// Seeds kommen aus dem Tag mysticalagriculture:seeds, deaktivierte/neue Crops passen sich also automatisch an.

const MA_CLOCHE_TIME = 1280 // Ticks; Weizen in der Cloche braucht 640
const MA_CLOCHE_SOIL = 'minecraft:dirt'

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

    event.custom({
      type: 'immersiveengineering:cloche',
      input: { item: seedId },
      soil: { item: MA_CLOCHE_SOIL },
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
