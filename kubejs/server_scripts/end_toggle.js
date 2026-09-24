// End sperren / freigeben
//
// Solange das End gesperrt ist, kann niemand mehr per Portal in das End reisen.
// Wer bereits im End ist, kann normal zurückreisen.
//
// Ein-/Ausschalten im Spiel (nur OPs):
//   /end enable   – End freigeben
//   /end disable  – End sperren
//   /end status   – aktuellen Zustand anzeigen
// Der Zustand wird im Weltstand gespeichert und überlebt Neustarts und /reload.
//
// Ohne Befehl: nur END_DEFAULT_ENABLED ändern (gilt, solange der Zustand noch nie per Command gesetzt wurde).
const END_DEFAULT_ENABLED = false

const END_DIMENSION = 'minecraft:the_end'
const END_STATE_KEY = 'gig_end_enabled'

function isEndEnabled(server) {
  const data = server.persistentData
  return data.contains(END_STATE_KEY) ? data.getBoolean(END_STATE_KEY) : END_DEFAULT_ENABLED
}

// Reise ins End abbrechen, solange es gesperrt ist
NativeEvents.onEvent(Java.loadClass('net.neoforged.neoforge.event.entity.EntityTravelToDimensionEvent'), event => {
  if (String(event.dimension.location()) !== END_DIMENSION) return

  const entity = event.entity
  if (isEndEnabled(entity.server)) return

  event.setCanceled(true)
  if (entity.isPlayer()) {
    entity.tell(Text.red('Das End ist derzeit gesperrt.'))
  }
})

ServerEvents.commandRegistry(event => {
  const { commands: Commands } = event

  function setEnd(ctx, enabled) {
    const server = ctx.source.server
    server.persistentData.putBoolean(END_STATE_KEY, enabled)
    ctx.source.sendSuccess(enabled
      ? Text.green('Das End ist jetzt freigegeben.')
      : Text.red('Das End ist jetzt gesperrt.'), true)
    return 1
  }

  event.register(Commands.literal('end')
    .requires(src => src.hasPermission(2))
    .then(Commands.literal('enable').executes(ctx => setEnd(ctx, true)))
    .then(Commands.literal('disable').executes(ctx => setEnd(ctx, false)))
    .then(Commands.literal('status').executes(ctx => {
      const enabled = isEndEnabled(ctx.source.server)
      ctx.source.sendSuccess(enabled
        ? Text.green('Das End ist freigegeben.')
        : Text.red('Das End ist gesperrt.'), false)
      return 1
    })))
})
