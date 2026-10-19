// Regen waescht Schadstoffe (Pollution of the Realms) aus der Luft: alle 5 s bei Regen ein Teil der
// Verschmutzung in den Chunks um jeden Spieler. Waelder werden ueber config/adpother/Biomes geregelt.
// Eigene Funktion mit var, wegen gemeinsamem Scope; alles in try/catch (NativeEvents-Absturz vermeiden).

(function () {
  var REGEN_ANTEIL = 0.06      // Anteil, der pro Intervall ausgewaschen wird
  var INTERVALL = 100          // Ticks
  var RADIUS = 3               // Chunks um jeden Spieler
  var NAMEN = ['carbon', 'sulfur', 'dust', 'radioactive_dust']
  var zaehler = 0
  var fehlerGemeldet = false
  try {
    var AdPother = Java.loadClass('com.endertech.minecraft.mods.adpother.AdPother')
    var WorldData = Java.loadClass('com.endertech.minecraft.mods.adpother.pollution.WorldData')

    ServerEvents.tick(function (e) {
      try {
        zaehler++
        if (zaehler < INTERVALL) return
        zaehler = 0
        var pollutants = []
        NAMEN.forEach(function (n) {
          var o = AdPother.getInstance().pollutants.findByName(n)
          if (o.isPresent()) pollutants.push(o.get())
        })
        e.server.allLevels.forEach(function (lvl) {
          if (!lvl.isRaining()) return
          lvl.players.forEach(function (p) {
            var pos = p.blockPosition()
            if (!lvl.canSeeSky(pos)) return   // nur wer draussen im Regen steht, nicht in Hoehlen/Hallen
            for (var dx = -RADIUS; dx <= RADIUS; dx++) {
              for (var dz = -RADIUS; dz <= RADIUS; dz++) {
                var cp = WorldData.getChunkPollution(lvl, pos.offset(dx * 16, 0, dz * 16))
                pollutants.forEach(function (pol) {
                  var info = cp.getInfoFor(pol)
                  if (!info.isPresent()) return
                  var i = info.get()
                  var q = i.getQuantity()
                  if (q <= 0) return
                  i.setQuantity(Math.max(0, q - Math.max(1, Math.round(q * REGEN_ANTEIL))))
                  i.markDirty()
                })
              }
            }
          })
        })
      } catch (err) {
        if (!fehlerGemeldet) { fehlerGemeldet = true; console.error('[schadstoffe_regen] ' + err) }
      }
    })
  } catch (err) {
    console.error('[schadstoffe_regen] Init-Fehler: ' + err)
  }
})()
