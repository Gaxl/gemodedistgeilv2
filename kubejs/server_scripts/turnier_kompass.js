// Turnier-Kompass: Gewinner eines Cobblemon-Turniers waehlen einen OmniCompass fuer einen Legendaeren-Tempel.
//
// Hintergrund: Allgemeine Kompasse (OmniCompass, Explorer's Compass) finden alles ausser den Legendaeren-Tempeln
// (Sperrlisten in config/omnicompass-common.toml und config/explorerscompass-common.toml). Spezial-Kompasse
// mit festem Ziel (Datapack gig_hoen, Typen legend_<tempel>) ignorieren die Sperre. Es gibt kein Rezept dafuer,
// man bekommt sie nur ueber dieses Skript.
//
// Ablauf:
//   Admin / GiG Arena (Belohnungsbefehl): /kompassgutschein <spieler> [anzahl]   (OP-Stufe 2)
//   Gewinner:                              /kompasswahl            -> Liste zum Anklicken
//                                          /kompasswahl <tempel>   -> loest einen Gutschein ein, gibt den Kompass
//
// Diese Datei wird aus tools/kompass/turnier_kompass.template.js erzeugt (python tools/kompass/build_kompass.py).
// Aenderungen an der Liste bitte in tools/kompass/kompass_tempel.json machen.
// Alles in einer Funktion mit var, weil sich alle Server-Scripts einen Scope teilen.

(function () {
  var TEMPEL = [
  {
    "key": "snowpoint",
    "name": "Snowpoint Temple",
    "pokemon": "Regigigas, Regice, Regirock, Registeel, Regieleki, Regidrago"
  },
  {
    "key": "spear_pillar",
    "name": "Spear Pillar",
    "pokemon": "Dialga, Palkia"
  },
  {
    "key": "southern_island",
    "name": "Southern Island",
    "pokemon": "Latios, Latias"
  },
  {
    "key": "final_island",
    "name": "Final Island",
    "pokemon": "Mew"
  },
  {
    "key": "heatran",
    "name": "Heatran Cave",
    "pokemon": "Heatran"
  },
  {
    "key": "hoopa",
    "name": "Hoopa Pyramid",
    "pokemon": "Hoopa"
  },
  {
    "key": "lugia",
    "name": "Lugia Temple",
    "pokemon": "Lugia"
  },
  {
    "key": "dragonspiral",
    "name": "Dragonspiral Tower",
    "pokemon": "Zekrom, Reshiram"
  },
  {
    "key": "kyurem",
    "name": "Kyurem Cave",
    "pokemon": "Kyurem"
  },
  {
    "key": "eternatus",
    "name": "Eternatus Cocoon",
    "pokemon": "Eternatus"
  },
  {
    "key": "yveltal",
    "name": "Yveltal Cocoon",
    "pokemon": "Yveltal"
  },
  {
    "key": "crown_shrine",
    "name": "Crown Shrine",
    "pokemon": "Calyrex"
  },
  {
    "key": "knightly_heroes",
    "name": "Throneroom of Knightly Heroes",
    "pokemon": "Zacian, Zamazenta"
  },
  {
    "key": "firescourge",
    "name": "Firescourge Shrine",
    "pokemon": "Chi-Yu"
  },
  {
    "key": "icerend",
    "name": "Icerend Shrine",
    "pokemon": "Chien-Pao"
  },
  {
    "key": "groundblight",
    "name": "Groundblight Shrine",
    "pokemon": "Ting-Lu"
  },
  {
    "key": "grasswither",
    "name": "Grasswither Shrine",
    "pokemon": "Wo-Chien"
  },
  {
    "key": "lake_acuity",
    "name": "Lake Acuity",
    "pokemon": "Uxie"
  },
  {
    "key": "lake_verity",
    "name": "Lake Verity",
    "pokemon": "Mesprit"
  },
  {
    "key": "lake_valor",
    "name": "Lake Valor",
    "pokemon": "Azelf"
  },
  {
    "key": "giratina_island",
    "name": "Giratina Island",
    "pokemon": "Giratina"
  },
  {
    "key": "turnback_cave",
    "name": "Turnback Cave",
    "pokemon": ""
  },
  {
    "key": "tree_of_life",
    "name": "Tree of Life",
    "pokemon": ""
  },
  {
    "key": "amphitheater",
    "name": "Amphitheater",
    "pokemon": ""
  },
  {
    "key": "dyna_tree",
    "name": "Dyna Tree",
    "pokemon": ""
  },
  {
    "key": "liberty_island",
    "name": "Liberty Island",
    "pokemon": ""
  },
  {
    "key": "pagoda",
    "name": "Pagoda",
    "pokemon": ""
  },
  {
    "key": "groudon",
    "name": "Magma Shrine",
    "pokemon": "Groudon"
  },
  {
    "key": "kyogre",
    "name": "Marine Temple",
    "pokemon": "Kyogre"
  },
  {
    "key": "rayquaza",
    "name": "Sky Pillar",
    "pokemon": "Rayquaza"
  }
]
  var SPEICHER = 'gig_kompass_gutscheine'

  var EntityArgument = Java.loadClass('net.minecraft.commands.arguments.EntityArgument')
  var StringArgumentType = Java.loadClass('com.mojang.brigadier.arguments.StringArgumentType')
  var IntegerArgumentType = Java.loadClass('com.mojang.brigadier.arguments.IntegerArgumentType')
  var CompoundTag = Java.loadClass('net.minecraft.nbt.CompoundTag')

  function speicher(server) {
    var daten = server.persistentData
    if (!daten.contains(SPEICHER)) daten.put(SPEICHER, new CompoundTag())
    return daten.getCompound(SPEICHER)
  }
  function gutscheine(server, player) {
    return speicher(server).getInt(String(player.uuid))
  }
  function setzeGutscheine(server, player, n) {
    speicher(server).putInt(String(player.uuid), Math.max(0, n))
  }
  function finde(key) {
    for (var i = 0; i < TEMPEL.length; i++) if (TEMPEL[i].key === key) return TEMPEL[i]
    return null
  }
  function bezeichnung(t) {
    return t.name + (t.pokemon ? ' (' + t.pokemon + ')' : '')
  }

  function zeigeListe(player, server) {
    var n = gutscheine(server, player)
    player.tell(Text.gold('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'))
    if (n <= 0) {
      player.tell(Text.red('Du hast keinen Kompass-Gutschein.').bold())
      player.tell(Text.gray('Gutscheine gibt es als Preis für den Sieg bei einem Cobblemon-Turnier.'))
    } else {
      player.tell(Text.aqua('Turnier-Kompass').bold().append(Text.gray('  (Gutscheine: ' + n + ')')))
      player.tell(Text.gray('Klicke einen Tempel an. Du bekommst einen Kompass, der nur dorthin zeigt.'))
      TEMPEL.forEach(function (t) {
        player.tell(Text.of('  » ').append(
          Text.yellow(bezeichnung(t)).underlined()
            .clickRunCommand('/kompasswahl ' + t.key)
            .hover(Text.gray('Klicken: Kompass für ' + t.name + ' holen'))))
      })
    }
    player.tell(Text.gold('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'))
  }

  function loeseEin(player, server, key) {
    var t = finde(key)
    if (!t) {
      player.tell(Text.red('Unbekannter Tempel: ' + key))
      return 0
    }
    var n = gutscheine(server, player)
    if (n <= 0) {
      player.tell(Text.red('Du hast keinen Kompass-Gutschein.'))
      return 0
    }
    // erst abziehen, dann geben; schlaegt das Geben fehl, wird der Gutschein zurueckgebucht
    setzeGutscheine(server, player, n - 1)
    var ok = false
    try {
      var cmd = 'give ' + player.username + ' omnicompass:compass[omnicompass:compass_type="gig_hoen:legend_' + t.key + '"]'
      server.runCommandSilent(cmd)
      ok = true
    } catch (err) {
      console.error('[turnier_kompass] give fehlgeschlagen: ' + err)
    }
    if (!ok) {
      setzeGutscheine(server, player, n)
      player.tell(Text.red('Fehler beim Geben des Kompasses. Dein Gutschein bleibt erhalten.'))
      return 0
    }
    player.tell(Text.green('Du hast einen Kompass für ').append(Text.yellow(bezeichnung(t))).append(Text.green(' erhalten.')))
    console.info('[turnier_kompass] ' + player.username + ' loest Gutschein ein: ' + t.key)
    return 1
  }

  ServerEvents.commandRegistry(function (event) {
    var Commands = event.commands

    // /kompassgutschein <spieler> [anzahl]  (OP; wird auch von der GiG Arena als Belohnungsbefehl genutzt)
    event.register(Commands.literal('kompassgutschein')
      .requires(function (src) { return src.hasPermission(2) })
      .then(Commands.argument('spieler', EntityArgument.player())
        .executes(function (ctx) {
          try {
            var p = EntityArgument.getPlayer(ctx, 'spieler')
            setzeGutscheine(ctx.source.server, p, gutscheine(ctx.source.server, p) + 1)
            p.tell(Text.green('Du hast einen Kompass-Gutschein gewonnen! ').append(Text.yellow('/kompasswahl').clickRunCommand('/kompasswahl')))
            ctx.source.sendSystemMessage(Text.gray('Gutschein vergeben an ' + p.username))
            return 1
          } catch (err) {
            console.error('[turnier_kompass] ' + err)
            return 0
          }
        })
        .then(Commands.argument('anzahl', IntegerArgumentType.integer(1, 10))
          .executes(function (ctx) {
            try {
              var p = EntityArgument.getPlayer(ctx, 'spieler')
              var a = IntegerArgumentType.getInteger(ctx, 'anzahl')
              setzeGutscheine(ctx.source.server, p, gutscheine(ctx.source.server, p) + a)
              p.tell(Text.green('Du hast ' + a + ' Kompass-Gutscheine gewonnen! ').append(Text.yellow('/kompasswahl').clickRunCommand('/kompasswahl')))
              ctx.source.sendSystemMessage(Text.gray(a + ' Gutscheine vergeben an ' + p.username))
              return 1
            } catch (err) {
              console.error('[turnier_kompass] ' + err)
              return 0
            }
          }))))

    // /kompasswahl [tempel]
    event.register(Commands.literal('kompasswahl')
      .executes(function (ctx) {
        var player = ctx.source.player
        if (!player) return 0
        try { zeigeListe(player, ctx.source.server) } catch (err) { console.error('[turnier_kompass] ' + err) }
        return 1
      })
      .then(Commands.argument('tempel', StringArgumentType.word())
        .suggests(function (ctx, builder) {
          TEMPEL.forEach(function (t) { builder.suggest(t.key) })
          return builder.buildFuture()
        })
        .executes(function (ctx) {
          var player = ctx.source.player
          if (!player) return 0
          try {
            return loeseEin(player, ctx.source.server, StringArgumentType.getString(ctx, 'tempel'))
          } catch (err) {
            console.error('[turnier_kompass] ' + err)
            return 0
          }
        })))
  })
})()
