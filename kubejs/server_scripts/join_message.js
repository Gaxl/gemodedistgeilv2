// Begrüßungsnachricht beim Joinen – nur für den joinenden Spieler sichtbar

// Bei einem Update nur diese beiden Werte anpassen
// Typen: '+' hinzugefügt, '-' entfernt, '~' geändert, '!' Fix
const VERSION = 'beta1.7'
const CHANGES = [
  ['+', 'Antarchy: 45+ new mobs, 8 bosses and 3 new dimensions'],
  ['+', "Bloxy's Structures: new structures with 4 boss fights"],
  ['+', 'Create Aeronautics: Gadgets & Gizmos (thrusters, ship controllers, autopilot)'],
  ['+', 'AnvilCraft: tech mod built around anvils'],
  ['+', 'AE2 Lightning Tech: lightning energy and new ME machines'],
  ['+', 'Extended Terminal: more ME terminal options'],
  ['+', 'Sleep Tight: hammocks, sleeping bags and more'],
  ['+', 'CC:HQ Speakers: CC speakers can play MP3s'],
  ['~', 'GiG Arena: brighter arenas, 13x9 screens, spectators stay on the stands'],
  ['+', 'added /gigreplies'],
]

const CHANGE_COLORS = {
  '+': Text.green,
  '-': Text.red,
  '~': Text.yellow,
  '!': Text.lightPurple,
}

function tellChangelog(player, withWelcome) {
  player.tell(Text.gold('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'))
  if (withWelcome) {
    player.tell(Text.of('Herzlich Willkommen zu: ').append(Text.green('Gemoded Ist Geil').bold()).append(', ').append(Text.aqua(player.username)).append('!'))
  }
  player.tell(Text.aqua('Version: ' + VERSION).bold())
  CHANGES.forEach(change => {
    const type = change[0]
    player.tell(Text.of('  ').append(CHANGE_COLORS[type](type + ' ').bold()).append(Text.gray(change[1])))
  })
  player.tell(Text.gold('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'))
}

PlayerEvents.loggedIn(event => {
  const player = event.player

  // kurz verzögern, damit die Nachricht nicht zwischen anderen Join-Meldungen untergeht
  event.server.scheduleInTicks(40, () => tellChangelog(player, true))
})

// /changelog – zeigt den Changelog erneut an, nur für den ausführenden Spieler sichtbar
ServerEvents.commandRegistry(event => {
  const { commands: Commands } = event

  event.register(Commands.literal('changelog').executes(ctx => {
    const player = ctx.source.player
    if (!player) return 0 // z.B. von der Konsole ausgeführt

    tellChangelog(player, false)
    return 1
  }))
})
