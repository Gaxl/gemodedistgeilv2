// Strahlungswerte an das einheitliche Strahlungssystem übergeben (GiG Aliases)
//
// Die Werte stehen in startup_scripts/uran_strahlung_werte.js. Sie ersetzen bei den gelisteten Items
// die eigenen Werte von Create Nuclear und gelten auch für Kisten, Tanks und Items auf dem Boden.
// Eigene Funktion mit var, weil sich alle Server-Scripts einen Scope teilen.

(function () {
  try {
    var daten = global.GIG_STRAHLUNG
    if (!daten) {
      console.warn('[uran_strahlung] Keine Werte gefunden (startup_scripts/uran_strahlung_werte.js fehlt?)')
      return
    }
    var RadiationValues = Java.loadClass('de.gig.aliases.radiation.RadiationValues')
    RadiationValues.clear()

    var fehlend = []
    daten.werte.forEach(function (e) {
      if (!RadiationValues.putItem(e.id, e.value)) fehlend.push(e.id)
    })
    daten.chemikalien.forEach(function (e) {
      RadiationValues.putChemical(e.id, e.value)
    })
    daten.fluessigkeiten.forEach(function (e) {
      if (!RadiationValues.putFluid(e.id, e.value)) fehlend.push(e.id)
    })
    console.info('[uran_strahlung] ' + (daten.werte.length - fehlend.length) + ' Items, ' +
      daten.chemikalien.length + ' Chemikalien, ' + daten.fluessigkeiten.length + ' Fluessigkeiten eingetragen' +
      (fehlend.length ? ', nicht gefunden: ' + fehlend.join(', ') : ''))
  } catch (err) {
    console.error('[uran_strahlung] Fehler beim Eintragen: ' + err)
  }
})()

// Bleikiste: Die Reinforced Storage Crate (Immersive Engineering) schirmt ihren Inhalt vollständig ab
// (Tag kubejs/data/gigaliases/tags/block/radiation_shielded_storage.json). Dafür ist sie mit Blei
// ausgekleidet: Lead Sheetmetal statt Treated Wood in den Ecken. Der Inhalt der Crate wird wie im
// Original-Rezept übernommen.
ServerEvents.recipes(event => {
  event.remove({ id: 'immersiveengineering:crafting/reinforced_crate' })
  event.custom({
    type: 'immersiveengineering:turn_and_copy',
    category: 'misc',
    copyNBT: [4],
    key: {
      c: { item: 'immersiveengineering:crate' },
      p: { tag: 'c:plates/steel' },
      r: { tag: 'c:rods/steel' },
      l: { item: 'immersiveengineering:sheetmetal_lead' }
    },
    pattern: ['lpl', 'rcr', 'lpl'],
    quarter_turn: true,
    result: { count: 1, id: 'immersiveengineering:reinforced_crate' }
  }).id('kubejs:reinforced_crate_lead')
})
