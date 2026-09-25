// Meltan Candy (Legendary Monuments) sperren
// Die Candy ruft eine Cobblemon-Methode auf, die es in Cobblemon 1.8 nicht mehr gibt -> Server-Absturz.
// Meltan entwickelt sich stattdessen per Metal Coat (kubejs/data/legendarymonuments/species_additions/meltan.json).

const MELTAN_CANDY = 'legendarymonuments:meltan_candy'

ItemEvents.rightClicked(MELTAN_CANDY, event => {
  event.player.tell(Text.red('Meltan Candy ist deaktiviert. Benutze einen Metal Coat an Meltan, um Melmetal zu bekommen.'))
  event.cancel()
})

ItemEvents.entityInteracted(MELTAN_CANDY, event => {
  event.cancel()
})
