// Construction Wand: Infinity-Wand und Zerstoerungs-Kern sind im Survival nicht herstellbar.
// Die Stein-/Eisen-/Diamantwand und der Angel-Kern bleiben.
ServerEvents.recipes(event => {
  event.remove({ output: 'constructionwand:infinity_wand' })
  event.remove({ output: 'constructionwand:core_destruction' })
})
