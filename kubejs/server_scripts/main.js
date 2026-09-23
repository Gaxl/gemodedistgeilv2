// Visit the wiki for more info - https://kubejs.com/
console.info('Hello, World! (Loaded server example script)')


PlayerEvents.chat(event => {
  if (event.message == 'GIG') {
    event.server.scheduleInTicks(5, () => {
      event.server.tell(Text.green('Gax ist Grün'))
    })
  }
})