// Workarounds für Fehler anderer Mods (kaputte Rezepte, leere Tags usw.)

ServerEvents.recipes(event => {
  // recipe_integration referenziert den Tag regions_unexplored:mauve_logs, den es in RU 0.6.2 nicht gibt.
  // Mekanism meldet deshalb beim Joinen "Broken tags in Mekanism recipes detected".
  event.remove({ id: 'recipe_integration:mekanism/sawmill/regions_unexplored/log/mauve' })
})
