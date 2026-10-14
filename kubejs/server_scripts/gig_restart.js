// /gigrestart – Countdown im Chat, danach sauberer stop (Welt wird gespeichert)
// Gedacht für das Panel ("Automatische Konsolenbefehle" vor RESTART, AUTO_RESTART, STOP, Verzögerung 120 s).
//   gigrestart              -> 60 Sekunden Countdown
//   gigrestart <sekunden>   -> eigener Countdown (5 bis 100)
//   gigrestart abbrechen    -> laufenden Countdown abbrechen
// Der Countdown läuft nach echter Uhrzeit, nicht nach Ticks: bei Lag dauert er nicht länger
// (das Panel beendet den Prozess nach 120 s hart).

const IntegerArgumentType = Java.loadClass('com.mojang.brigadier.arguments.IntegerArgumentType')

const GIG_RESTART_ANNOUNCE = [60, 30, 10] // Chat-Ansagen bei diesen Restsekunden
const GIG_RESTART_TITLES = 5 // ab hier großer Titel jede Sekunde

let gigRestart = null // { deadline, announced: {sekunde: true}, run: Zahl }

function gigRestartLeft() {
  return Math.ceil((gigRestart.deadline - Date.now()) / 1000)
}

function gigRestartStep(server, run) {
  if (!gigRestart || gigRestart.run !== run) return // abgebrochen oder neu gestartet
  const left = gigRestartLeft()

  if (left <= 0) {
    gigRestart = null
    server.tell(Text.red('Server wird jetzt neu gestartet. Bis gleich!').bold())
    console.info('[gigrestart] Countdown abgelaufen, fuehre stop aus')
    server.runCommandSilent('stop')
    return
  }

  if (left <= GIG_RESTART_TITLES) {
    if (!gigRestart.announced[left]) {
      gigRestart.announced[left] = true
      server.runCommandSilent('title @a times 0 25 5')
      server.runCommandSilent(`title @a title {"text":"${left}","color":"red","bold":true}`)
      server.runCommandSilent('title @a subtitle {"text":"Server-Neustart","color":"gold"}')
    }
  } else {
    GIG_RESTART_ANNOUNCE.forEach(mark => {
      if (left <= mark && !gigRestart.announced[mark]) {
        gigRestart.announced[mark] = true
        server.tell(Text.gold('[Server] ').append(Text.yellow(`Neustart in ${left} Sekunden!`)))
        console.info(`[gigrestart] noch ${left} s`)
      }
    })
  }

  server.scheduleInTicks(10, () => gigRestartStep(server, run))
}

function gigRestartStart(source, seconds) {
  const server = source.server
  if (gigRestart) {
    source.sendSystemMessage(Text.yellow(`Countdown läuft schon (noch ${gigRestartLeft()} s).`))
    return 0
  }
  gigRestart = { deadline: Date.now() + seconds * 1000, announced: {}, run: Date.now() }
  console.info(`[gigrestart] Countdown gestartet: ${seconds} s`)
  server.tell(Text.gold('[Server] ').append(Text.yellow(`Neustart in ${seconds} Sekunden! Bitte an einen sicheren Ort gehen.`)))
  GIG_RESTART_ANNOUNCE.forEach(mark => { if (mark >= seconds) gigRestart.announced[mark] = true })
  const run = gigRestart.run
  server.scheduleInTicks(10, () => gigRestartStep(server, run))
  return 1
}

ServerEvents.commandRegistry(event => {
  const { commands: Commands } = event

  event.register(Commands.literal('gigrestart')
    .requires(src => src.hasPermission(4))
    .executes(ctx => gigRestartStart(ctx.source, 60))
    .then(Commands.argument('sekunden', IntegerArgumentType.integer(5, 100))
      .executes(ctx => gigRestartStart(ctx.source, IntegerArgumentType.getInteger(ctx, 'sekunden'))))
    .then(Commands.literal('abbrechen').executes(ctx => {
      if (!gigRestart) {
        ctx.source.sendSystemMessage(Text.gray('Kein Countdown aktiv.'))
        return 0
      }
      gigRestart = null
      console.info('[gigrestart] Countdown abgebrochen')
      ctx.source.server.tell(Text.gold('[Server] ').append(Text.green('Neustart abgebrochen.')))
      return 1
    })))
})
