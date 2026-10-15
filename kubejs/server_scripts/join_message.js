// Begrüßungsnachricht beim Joinen – nur für den joinenden Spieler sichtbar

// Bei einem Update nur diese Werte anpassen
// Typen: '+' hinzugefügt, '-' entfernt, '~' geändert, '!' Fix
const VERSION = 'beta1.9.2'
const CHANGES = [
  ['+', 'AllTheMons x Mega Showdown: models for Celebi, Cresselia, Jirachi, Manaphy & more, plus many new Pokemon'],
  ['!', 'Legendaries from Legendary Monuments no longer invisible'],
  ['~', 'Legendaries & Mythicals only from Legendary Monuments temples (no wild spawns)'],
  ['~', 'Paradox Pokemon and Ultra Beasts spawn rarely in the wild'],
  ['!', 'Fixed server freeze: Supplementaries road signs disabled'],
]
// Wichtige Hinweise, werden rot unter dem Changelog angezeigt (leer lassen, wenn nichts ansteht)
const NOTES = [
  'Wichtig: Resourcepack "ATM x MSD" aktivieren (Optionen > Ressourcenpakete), sonst sind neue Pokemon unsichtbar!',
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
  NOTES.forEach(note => player.tell(Text.red(note).bold()))
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
