// Eigene Commands

// /bugreport – zeigt Infos zum Melden von Bugs, nur für den ausführenden Spieler sichtbar
const BUGREPORT_DISCORD = 'Pingus1000'
const BUGREPORT_ISSUES_URL = 'https://github.com/Gaxl/gemodedistgeilv2/issues/new'

// /discord – zeigt den Einladungslink zum Discord-Server
const DISCORD_INVITE_URL = 'https://discord.gg/Uc5j9KMy8' // TODO: echten Einladungslink eintragen


//bugreport command
ServerEvents.commandRegistry(event => {
  const { commands: Commands } = event

  event.register(Commands.literal('bugreport').executes(ctx => {
    const player = ctx.source.player
    if (!player) return 0 // z.B. von der Konsole ausgeführt

    player.tell(Text.gold('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'))
    player.tell(Text.red('Bug gefunden?').bold())
    player.tell(Text.gray('Bitte melde ihn mit einer kurzen Beschreibung, was passiert ist'))
    player.tell(Text.gray('und wie man ihn nachstellen kann. Screenshots helfen!'))
    player.tell(Text.of('  » Discord: ')
      .append(Text.aqua(BUGREPORT_DISCORD).underlined()
        .clickCopy(BUGREPORT_DISCORD)
        .hover(Text.gray('Klicken zum Kopieren'))))
    player.tell(Text.of('  » GitHub: ')
      .append(Text.aqua('Issue erstellen').underlined()
        .clickOpenUrl(BUGREPORT_ISSUES_URL)
        .hover(Text.gray(BUGREPORT_ISSUES_URL))))
    player.tell(Text.gold('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'))
    return 1
  }))
})

//discord command
ServerEvents.commandRegistry(event => {
  const { commands: Commands } = event

  event.register(Commands.literal('discord').executes(ctx => {
    const player = ctx.source.player
    if (!player) return 0 // z.B. von der Konsole ausgeführt

    player.tell(Text.gold('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'))
    player.tell(Text.aqua('Gax – Discord').bold())
    player.tell(Text.gray('Tritt dem Discord bei für Support, Updates und Community!'))
    player.tell(Text.of('  » ')
      .append(Text.aqua(DISCORD_INVITE_URL).underlined()
        .clickOpenUrl(DISCORD_INVITE_URL)
        .hover(Text.gray('Klicken zum Öffnen'))))
    player.tell(Text.gold('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'))
    return 1
  }))
})

//handy command
const HANDY_PASTEBIN_CMD = 'pastebin get 5tb2ffvG pos'

function tellHandy(player) {
  const step = (nr, text) => Text.of('  ').append(Text.yellow(nr + '. ').bold()).append(text)
  const copyLine = (cmd) => Text.of('     ').append(Text.aqua(cmd).clickCopy(cmd)
    .hover(Text.gray('Klicken zum Kopieren')))

  player.tell(Text.gold('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'))
  player.tell(Text.green('Pocket OS – Anleitung fürs Handy').bold())
  player.tell(Text.gray('Öffne dein Pocket Computer (Handy) und gib nacheinander ein:'))
  player.tell(step(1, Text.gray('Installieren:')))
  player.tell(copyLine(HANDY_PASTEBIN_CMD))
  player.tell(step(2, Text.gray('Startup-Datei öffnen:')))
  player.tell(copyLine('edit startup.lua'))
  player.tell(step(3, Text.gray('Darin diese Zeile einfügen:')))
  player.tell(copyLine('shell.run("pos")'))
  player.tell(step(4, Text.gray('Speichern: ')
    .append(Text.white('Strg').bold()).append(Text.gray(' → '))
    .append(Text.white('Save').bold()).append(Text.gray(' → '))
    .append(Text.white('Strg').bold()).append(Text.gray(' → '))
    .append(Text.white('Exit').bold())))
  player.tell(step(5, Text.gray('Handy neu starten – fertig!')))
  player.tell(Text.darkGray('Tipp: Auf eine Zeile klicken, um sie zu kopieren.'))
  player.tell(Text.gold('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'))
}

ServerEvents.commandRegistry(event => {
  const { commands: Commands } = event

  event.register(Commands.literal('handy').executes(ctx => {
    const player = ctx.source.player
    if (!player) return 0 // z.B. von der Konsole ausgeführt

    tellHandy(player)
    return 1
  }))
})
