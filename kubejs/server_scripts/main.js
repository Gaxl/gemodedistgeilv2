// Visit the wiki for more info - https://kubejs.com/
console.info('Hello, World! (Loaded server example script)')


const GIG_REPLIES = [
  'Gax ist Grün',
  'Gax ist Geldgeil',
  'Gax ist Göre',
  'Gax ist Glücksspielsüchtig',
  'Gax ist geschockt'
]

PlayerEvents.chat(event => {
  if (event.message == 'GIG') {
    let reply = GIG_REPLIES[Math.floor(Math.random() * GIG_REPLIES.length)]
    event.server.scheduleInTicks(5, () => {
      event.server.tell(Text.green(reply))
    })
  }
})