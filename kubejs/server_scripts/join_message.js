// Begrüßungsnachricht beim Joinen – nur für den joinenden Spieler sichtbar

// Bei einem Update nur diese Werte anpassen
// Typen: '+' hinzugefügt, '-' entfernt, '~' geändert, '!' Fix
const VERSION = 'beta1.12'
const CHANGES = [
  ['+', 'Daily Wheel: type /tagesrad once a day, spin the wheel and get a daily challenge with a small reward that fits it. Every day you choose which wheel to spin: the Cobblemon wheel (catching, battles, evolving, Pokedex, arena) or the General wheel (fishing, farming, mining, exploring, bosses)'],
  ['+', 'The wheel is animated with the new GiG Tagesrad mod that comes with the pack. Without it you get a menu version. Finish your challenge 7 days in a row for a bonus'],
  ['+', 'Event calendar: /events opens a calendar for arena tournaments and Grail Wars. Answer yes, maybe or no and vote on the date. Registration closes 7 days before the event'],
  ['+', 'Arena tournaments: once registration is closed, everyone who signed up can suggest a theme from a fixed list. The theme is drawn the same day and every suggested theme has the same chance. The 2v2 theme needs at least 4 sign-ups and an even number'],
  ['~', 'Compasses locate normal structures again (Dojo and the like). Only the legendary temples stay hidden'],
  ['+', 'Tournament winners get a voucher for a compass to a legendary temple of their choice (/kompasswahl)'],
  ['!', 'Fixed a rare crash while the server was starting (Tim Core / Capture XP, GiG Aliases 1.7.8)'],
]
// Wichtige Hinweise, werden rot unter dem Changelog angezeigt (leer lassen, wenn nichts ansteht)
const NOTES = [
  'Wichtig: Im Launcher NeoForge auf 21.1.248 stellen, sonst startet der Client nicht!',
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
