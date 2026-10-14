// Begrüßungsnachricht beim Joinen – nur für den joinenden Spieler sichtbar

// Bei einem Update nur diese beiden Werte anpassen
// Typen: '+' hinzugefügt, '-' entfernt, '~' geändert, '!' Fix
const VERSION = 'beta1.9'
const CHANGES = [
  ['+', 'AnvilCraft 6.0 with Ponder scenes'],
  ['+', 'Stellaris: rocket models craftable again (Tiny -> Small -> Normal -> Big)'],
  ['+', 'Stellaris: recipes for cheese block, cosmo bread, cosmo coffee, coffee cup, globes, gravity normalizer module and coal lantern'],
  ['+', 'Stellaris: cracked bricks (furnace) and planet cobblestone (stonecutter)'],
  ['+', 'Added Imgur Display'],
  ['~', 'Difficulty is now Hard'],
  ['~', 'Better server performance: fewer wild Pokemon at once, view distance 8, Incendium optimized'],
  ['~', 'Server restarts are announced with a countdown and shut down cleanly'],
  ['~', 'Server makes a backup on every start'],
  ['!', 'Create spout can fill Stellaris oxygen tanks again'],
  ['!', 'Fixed signs and the Amendments config'],
  ['!', 'German names fixed: Mars Globe, Moon Steel Ore, Mercury Deepslate'],
  ['-', 'Removed leftover configs of old mods (smaller download)'],
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
