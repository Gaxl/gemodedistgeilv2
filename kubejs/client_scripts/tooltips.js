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
    [Text.translate('gig.tooltip.disabled').red()]
  )
})

// Strahlung von Uran & Co. aus anderen Mods (Werte: startup_scripts/uran_strahlung_werte.js)
ItemEvents.modifyTooltips(event => {
  const strahlungsDaten = global.GIG_STRAHLUNG
  if (!strahlungsDaten) return
  // Dezimalzeichen nach Spielsprache (Sprachwechsel lädt die Ressourcen und damit dieses Script neu)
  let komma = true
  try {
    const sprache = String(Java.loadClass('net.minecraft.client.Minecraft').getInstance().getLanguageManager().getSelected())
    komma = sprache.startsWith('de')
  } catch (err) { /* Standard: Komma */ }
  strahlungsDaten.werte.forEach(e => {
    const strahlungStufe = strahlungsDaten.stufen[e.stufe]
    let zahl = String(Math.round(e.value * 1000) / 1000)
    if (komma) zahl = zahl.replace('.', ',')
    event.add(e.id, [Text.translate('gig.radiation.tooltip', zahl, Text.translate('gig.radiation.level.' + e.stufe)).color(strahlungStufe.farbe)])
  })
})

// Bleikiste (siehe server_scripts/uran_strahlung.js)
ItemEvents.modifyTooltips(event => {
  event.add('immersiveengineering:reinforced_crate', [Text.translate('gig.radiation.crate').green()])
})
