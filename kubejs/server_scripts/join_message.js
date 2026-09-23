// Begrüßungsnachricht beim Joinen – nur für den joinenden Spieler sichtbar

PlayerEvents.loggedIn(event => {
  const player = event.player

  // kurz verzögern, damit die Nachricht nicht zwischen anderen Join-Meldungen untergeht
  event.server.scheduleInTicks(40, () => {
    player.tell(Text.gold('━━━━━━━━━━━━━━━━━━━━━━━━━━━━'))
    player.tell(Text.of('Herzlich Willkommen zu: ').append(Text.green('Gemoded Ist Geil').bold()).append(', ').append(Text.aqua(player.username)).append('!'))
    player.tell(Text.gray('Version: beta1.0.'))
    player.tell(Text.gold('━━━━━━━━━━━━━━━━━━━━━━━━━━━━'))
  })
})
