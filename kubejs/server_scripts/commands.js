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
