// Einmaliger Strahlenschutz zur Eingewöhnung an das neue Strahlungssystem
//
// Jeder Spieler bekommt beim ersten Join nach dem Update einmalig 30 Minuten Iodine (schützt dank
// GiG Aliases gegen jede Strahlungsart). Effekte bleiben beim Ausloggen erhalten; stirbt der Spieler,
// bekommt er die Restzeit nach dem Respawn zurück.
// Gespeichert im Weltstand (server.persistentData), pro Spieler-UUID, damit es Tod und Neustarts übersteht.
// Eigene Funktion mit var, weil sich alle Server-Scripts einen Scope teilen.

(function () {
  var SPEICHER = 'gig_strahlenschutz'
  var DAUER_TICKS = 30 * 60 * 20
  var IOD = 'createnuclear:iodine'

  function speicher(server) {
    var daten = server.persistentData
    if (!daten.contains(SPEICHER)) {
      daten.put(SPEICHER, new (Java.loadClass('net.minecraft.nbt.CompoundTag'))())
    }
    return daten.getCompound(SPEICHER)
  }

  function schutzGeben(player, ticks) {
    player.potionEffects.add(IOD, ticks, 0, false, true)
  }

  function restTicks(player) {
    var rest = 0
    player.getActiveEffects().forEach(function (effekt) {
      if (String(effekt.getEffect().getRegisteredName()) === IOD) {
        rest = effekt.getDuration()
      }
    })
    return rest
  }

  PlayerEvents.loggedIn(function (event) {
    try {
      var player = event.player
      var eintrag = speicher(event.server)
      var uuid = String(player.uuid)
      if (eintrag.contains(uuid)) {
        return
      }
      eintrag.putInt(uuid, 0)
      schutzGeben(player, DAUER_TICKS)
      player.tell(Text.translate('gig.radiation.join.title').green().bold().append(Text.translate('gig.radiation.join').gray()))
    } catch (err) {
      console.error('[strahlenschutz] Fehler beim Join: ' + err)
    }
  })

  // Restzeit merken, bevor der Tod alle Effekte löscht
  EntityEvents.death('minecraft:player', function (event) {
    try {
      var player = event.entity
      var eintrag = speicher(event.server)
      var uuid = String(player.uuid)
      if (!eintrag.contains(uuid)) {
        return
      }
      var rest = Math.min(restTicks(player), DAUER_TICKS)
      eintrag.putInt(uuid, rest > 20 ? rest : 0)
    } catch (err) {
      console.error('[strahlenschutz] Fehler beim Tod: ' + err)
    }
  })

  PlayerEvents.respawned(function (event) {
    try {
      var player = event.player
      var eintrag = speicher(event.server)
      var uuid = String(player.uuid)
      var rest = eintrag.getInt(uuid)
      if (rest > 0) {
        eintrag.putInt(uuid, 0)
        schutzGeben(player, rest)
      }
    } catch (err) {
      console.error('[strahlenschutz] Fehler beim Respawn: ' + err)
    }
  })
})()
