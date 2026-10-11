// Visit the wiki for more info - https://kubejs.com/
console.info('Hello, World! (Loaded server example script)')


const GIG_REPLIES = [
  'Gax ist Grün',
  'Gax ist Geldgeil',
  'Gax ist Göre',
  'Gax ist Glücksspielsüchtig',
  'Gax ist geschockt',
  'Gax isst Gurken',
  'Gaxs intesives Gecrafte',
  'Gepeinigt im Gulag',
  'Gax ist gemein',
  'Gemolken ist genial',
  'Gemästet ist Gesättigt'
]

PlayerEvents.chat(event => {
  if (event.message == 'GIG') {
    let reply = GIG_REPLIES[Math.floor(Math.random() * GIG_REPLIES.length)]
    event.server.scheduleInTicks(5, () => {
      event.server.tell(Text.green(reply))
    })
  }
})

// /gigreplies – zeigt alle möglichen GIG-Antworten an
ServerEvents.commandRegistry(event => {
  const { commands: Commands } = event

  event.register(Commands.literal('gigreplies')
    .executes(ctx => {
      ctx.source.sendSuccess(Text.gold('GIG Replies (' + GIG_REPLIES.length + '):'), false)
      GIG_REPLIES.forEach((reply, i) => {
        ctx.source.sendSuccess(Text.green((i + 1) + '. ' + reply), false)
      })
      return GIG_REPLIES.length
    }))
})
