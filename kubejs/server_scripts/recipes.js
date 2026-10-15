ServerEvents.recipes(event => {
event.remove({ output: 'mekanism:meka_tool' })
event.remove({ output: 'mekanism:mekasuit_helmet' })
event.remove({ output: 'mekanism:mekasuit_bodyarmor' })
event.remove({ output: 'mekanism:mekasuit_pants' })
event.remove({ output: 'mekanism:mekasuit_boots' })

// Unsichtbarer Item Frame
event.shaped(
  Item.of('minecraft:item_frame[entity_data={id:"minecraft:item_frame",Invisible:1b},custom_name=\'{"text":"Unsichtbarer Item Frame","color":"light_purple","italic":false}\']', 8),
  [
    'FFF',
    'FPF',
    'FFF'
  ],
  {
    F: 'minecraft:item_frame',
    P: 'minecraft:potion[potion_contents={potion:"minecraft:invisibility"}]'
  }
).id('minecraft:invisible_item_frame')

// Stellaris: Speed Upgrade (Mod liefert kein Rezept)
event.shaped(
  'stellaris:speed_upgrade',
  [
    'SDS',
    'DFD',
    'SBS'
  ],
  {
    S: '#c:ingots/steel',
    D: 'stellaris:desh_ingot',
    F: 'stellaris:engine_fan',
    B: 'stellaris:battery'
  }
).id('gig:stellaris_speed_upgrade')

})