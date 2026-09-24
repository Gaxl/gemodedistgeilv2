// Tooltips für deaktivierte Items (Rezepte werden in server_scripts/recipes.js entfernt)
ItemEvents.modifyTooltips(event => {
  event.add(
    [
      'mekanism:meka_tool',
      'mekanism:mekasuit_helmet',
      'mekanism:mekasuit_bodyarmor',
      'mekanism:mekasuit_pants',
      'mekanism:mekasuit_boots'
    ],
    [Text.red('Deaktiviert: Dieses Item ist auf dem Server nicht herstellbar.')]
  )
})
