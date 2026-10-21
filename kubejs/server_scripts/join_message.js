// Begrüßungsnachricht beim Joinen – nur für den joinenden Spieler sichtbar

// Bei einem Update nur diese Werte anpassen
// Typen: '+' hinzugefügt, '-' entfernt, '~' geändert, '!' Fix
const VERSION = 'beta1.11'
const CHANGES = [
  ['+', 'Radiation overhaul: radiation now comes from sources (uranium, waste, tanks, machines) instead of spreading from player to player. Falls off with distance, lead/concrete shield it'],
  ['+', 'All hazmat suits (Create Nuclear, Alex\'s Caves, Mekanism) protect equally against every kind of radiation, pieces can be mixed. Iodine too'],
  ['+', 'Uranium of all mods radiates by purity (see item tooltip). Lead-lined Reinforced Crate (Immersive Engineering) shields its contents'],
  ['+', 'Pollution of the Realms + Advanced Chimneys: smoke, smog, filters, respirators. Forests and rain clean the air. Radioactive dust from uranium processing and meltdowns'],
  ['+', 'Everyone gets 30 minutes of radiation protection once on the next join'],
  ['+', 'Cobblemon: Monuments of Hoen: summon Groudon, Kyogre and Rayquaza at three new temples (Magma Shrine in the Nether, Marine Temple in deep oceans, Sky Pillar in deserts). The buildings adapt their blocks to the biome'],
  ['~', 'The Hoenn temples and the Regigigas temple (Snowpoint Temple) now generate equally often and are much easier to find'],
  ['!', 'Radiation: pipes and tubes no longer count as radiation sources, and the Mekanism Fission Reactor is counted once, with its casing holding back 95% of the content. Both gave far too much radiation before'],
  ['!', 'Fate/UBW: Shift + right click on a servant no longer kicks you from the server, and the Kill button in the servant window works again'],
  ['~', 'Cobblemon 1.8.2 with new Pokemon (Snover, Burmy, Eternatus, Minior, Greavard, Houndstone and more), placeable items and the evolution tree in the Pokedex. All Cobblemon add-ons updated, Legendary Monuments 8.2 (Kubfu) and AllTheMons x Mega Showdown v5.0'],
  ['~', 'Legendary structures can no longer be located: the compasses for the Hoenn temples and the Regigigas temple are gone, and the Arc Phone tracking app finds nothing'],
  ['~', 'GiG Aliases 1.7.7, ForgeEndertech 12.1.4'],
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
