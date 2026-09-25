// Begrüßungsnachricht beim Joinen – nur für den joinenden Spieler sichtbar

// Bei einem Update nur diese beiden Werte anpassen
// Typen: '+' hinzugefügt, '-' entfernt, '~' geändert, '!' Fix
const VERSION = 'beta1.4'
const CHANGES = [
  ['+', 'Cobblemon: Mega Showdown, Cobbreeding, Cobbleworkers, PokeNav'],
  ['+', 'Cobblemon: Fight or Flight, Legendary Monuments, Cobbleloots'],
  ['+', 'Cobblemon: SimpleTMs, Move Inspector, SafePastures'],
  ['+', 'Cobblemon: PlayerXP, Capture XP, Environment Interactions'],
  ['+', 'ElevatorMod'],
  ['~', 'Meltan evolves into Melmetal with a Metal Coat (candy disabled)'],
  ['~', 'Reshiram/Zekrom pedestals need a Fire/Electric Gem Block'],
  ['+', 'Resource pack Cobblemon Pasture Enhanced (enable in Options)'],
  ['~', 'Botania switched to the official build'],
  ['!', 'Botania: Petal Apothecary water displays correctly again'],
  ['~', 'Streams Reflowing 2.13.1 -> 2.13.8'],
  ['!', 'Pumps and tanks now get normal water from streams'],
  ['!', 'Fixed the Immersive Engineering Garden Cloches'],
  ['+', 'Added Mystical Agriculture Recipes for the Garden Cloches'],

  
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
