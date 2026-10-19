// Strahlungswerte des einheitlichen Strahlungssystems (Create Nuclear + GiG Aliases)
//
// Realistisch abgestuft: natürliches Uran strahlt kaum, angereichertes etwas, Plutonium, Polonium,
// abgebrannte Brennstäbe und Atommüll stark. Werte gelten pro Item (mal Stackgröße), bei Chemikalien
// und Flüssigkeiten pro 1000 mB. Sie gelten im Inventar, für Items auf dem Boden und für den Inhalt
// von Kisten, Tanks und Maschinen (dort mit Abstand und Abschirmung, siehe GiG Aliases RadiationField).
//
// Wirkung (Summe aller Quellen): unter 5 nichts, ab 5 Radiation I, ab 10 II, ab 25 III, ab 50 IV.
// Beispiele: ein Stack Uranium Ingots = 5,1 (Radiation I), 4 Plutonium Ingots = 12 (II).
//
// Wird von server_scripts/uran_strahlung.js (Werte an GiG Aliases) und client_scripts/tooltips.js
// (Anzeige) gelesen. Änderungen brauchen einen Neustart. Diese Werte ersetzen auch die eigenen Werte
// von Create Nuclear.

const STUFEN = {
  erz:          { name: 'Erz',                  farbe: 'gray' },
  roh:          { name: 'Roh',                  farbe: 'gray' },
  vorstufe:     { name: 'Vorstufe',             farbe: 'gray' },
  rein:         { name: 'Natürliches Uran',     farbe: 'yellow' },
  abgereichert: { name: 'Abgereichert',         farbe: 'gray' },
  le:           { name: 'Leicht angereichert',  farbe: 'yellow' },
  he:           { name: 'Hoch angereichert',    farbe: 'gold' },
  brennstab:    { name: 'Frischer Brennstab',   farbe: 'gold' },
  spaltstoff:   { name: 'Spaltstoff',           farbe: 'red' },
  abgebrannt:   { name: 'Abgebrannter Brennstab', farbe: 'dark_red' },
  abfall:       { name: 'Radioaktiver Abfall',  farbe: 'dark_red' }
}

const WERTE = []
const CHEMIKALIEN = []
const FLUESSIGKEITEN = []
function wert(id, value, stufe) {
  WERTE.push({ id: id, value: value, stufe: stufe })
}
function chemikalie(id, pro1000) {
  CHEMIKALIEN.push({ id: id, value: pro1000 })
}
function fluessigkeit(id, pro1000) {
  FLUESSIGKEITEN.push({ id: id, value: pro1000 })
}

// Ein Material in allen Formen: Barren/Dust/Platte b, Stange b/2, Nugget und Tiny Dust b/10, Block 9*b
function material(ids, b, stufe) {
  if (ids.ingot) wert(ids.ingot, b, stufe)
  if (ids.dust) wert(ids.dust, b, stufe)
  if (ids.plate) wert(ids.plate, b, stufe)
  if (ids.rod) wert(ids.rod, b / 2, stufe)
  if (ids.nugget) wert(ids.nugget, b / 10, stufe)
  if (ids.tiny) wert(ids.tiny, b / 10, stufe)
  if (ids.block) wert(ids.block, b * 9, stufe)
}

// --- Erz (im Gestein, kaum radioaktiv) ---
;[
  'createnuclear:uranium_ore', 'createnuclear:deepslate_uranium_ore',
  'mekanism:uranium_ore', 'mekanism:deepslate_uranium_ore',
  'immersiveengineering:ore_uranium', 'immersiveengineering:deepslate_ore_uranium',
  'modern_industrialization:uranium_ore', 'modern_industrialization:deepslate_uranium_ore',
  'evolvedmekanism:depthrock_uranium_ore', 'evolvedmekanism:end_stone_uranium_ore',
  'evolvedmekanism:holystone_uranium_ore', 'evolvedmekanism:netherrack_uranium_ore',
  'evolvedmekanism:shiverstone_uranium_ore', 'stellaris:mercury_uranium_ore',
  'antarchy:uranium_ore', 'antarchy:deepslate_uranium_ore', 'antarchy:broodstone_uranium_ore',
  'alexscaves:radrock_uranium_ore'
].forEach(id => wert(id, 0.03, 'erz'))
wert('stellaris:mars_plutonium_ore', 0.3, 'erz')

// --- Roh ---
;['createnuclear:raw_uranium', 'mekanism:raw_uranium', 'immersiveengineering:raw_uranium',
  'modern_industrialization:raw_uranium', 'stellaris:raw_uranium', 'antarchy:raw_uranium']
  .forEach(id => wert(id, 0.05, 'roh'))
;['createnuclear:raw_uranium_block', 'mekanism:block_raw_uranium', 'immersiveengineering:raw_block_uranium',
  'modern_industrialization:raw_uranium_block', 'stellaris:raw_uranium_block', 'antarchy:raw_uranium_block']
  .forEach(id => wert(id, 0.45, 'roh'))
wert('antarchy:raw_uranium_scrap', 0.005, 'roh')

// --- Vorstufen der Erzverarbeitung ---
wert('create:crushed_raw_uranium', 0.05, 'vorstufe')
wert('mekanism:dirty_dust_uranium', 0.05, 'vorstufe')
wert('mekanism:clump_uranium', 0.05, 'vorstufe')
wert('mekanism:shard_uranium', 0.06, 'vorstufe')
wert('mekanism:crystal_uranium', 0.07, 'vorstufe')

// --- Natürliches Uran (Barren, Staub, Konzentrat) ---
material({ ingot: 'mekanism:ingot_uranium', dust: 'mekanism:dust_uranium',
  nugget: 'mekanism:nugget_uranium', block: 'mekanism:block_uranium' }, 0.08, 'rein')
material({ ingot: 'immersiveengineering:ingot_uranium', dust: 'immersiveengineering:dust_uranium',
  plate: 'immersiveengineering:plate_uranium', nugget: 'immersiveengineering:nugget_uranium',
  block: 'immersiveengineering:storage_uranium' }, 0.08, 'rein')
wert('immersiveengineering:slab_storage_uranium', 0.36, 'rein')
wert('immersiveengineering:sheetmetal_uranium', 0.08, 'rein')
wert('immersiveengineering:slab_sheetmetal_uranium', 0.04, 'rein')
material({ ingot: 'modern_industrialization:uranium_ingot', dust: 'modern_industrialization:uranium_dust',
  rod: 'modern_industrialization:uranium_rod', nugget: 'modern_industrialization:uranium_nugget',
  tiny: 'modern_industrialization:uranium_tiny_dust', block: 'modern_industrialization:uranium_block' }, 0.08, 'rein')
material({ ingot: 'stellaris:uranium_ingot', block: 'stellaris:uranium_block' }, 0.08, 'rein')
material({ ingot: 'antarchy:uranium_ingot', nugget: 'antarchy:uranium_nugget', block: 'antarchy:uranium_block' }, 0.08, 'rein')
material({ ingot: 'alexscaves:uranium', nugget: 'alexscaves:uranium_shard', block: 'alexscaves:block_of_uranium' }, 0.08, 'rein')
wert('alexscaves:uranium_rod', 0.2, 'rein')
wert('createnuclear:uranium_powder', 0.08, 'rein')
wert('createnuclear:yellowcake', 0.1, 'rein')
wert('mekanism:yellow_cake_uranium', 0.1, 'rein')
// Uran-Deko (Antarchy) nach Urangehalt
wert('antarchy:cut_uranium', 0.18, 'rein')
wert('antarchy:chiseled_uranium', 0.18, 'rein')
wert('antarchy:cut_uranium_stairs', 0.18, 'rein')
wert('antarchy:cut_uranium_slab', 0.09, 'rein')
wert('antarchy:uranium_bars', 0.03, 'rein')
wert('antarchy:uranium_door', 0.16, 'rein')
wert('antarchy:uranium_trapdoor', 0.16, 'rein')
wert('antarchy:uranium_bulb', 2.2, 'rein')

// --- Abgereichert ---
material({ ingot: 'modern_industrialization:uranium_238_ingot', dust: 'modern_industrialization:uranium_238_dust',
  nugget: 'modern_industrialization:uranium_238_nugget', tiny: 'modern_industrialization:uranium_238_tiny_dust',
  block: 'modern_industrialization:uranium_238_block' }, 0.05, 'abgereichert')

// --- Leicht angereichert ---
wert('createnuclear:enriched_yellowcake', 0.2, 'le')
wert('evolvedmekanism:enriched_uranium', 0.2, 'le')
material({ ingot: 'modern_industrialization:le_uranium_ingot', dust: 'modern_industrialization:le_uranium_dust',
  rod: 'modern_industrialization:le_uranium_rod', nugget: 'modern_industrialization:le_uranium_nugget',
  tiny: 'modern_industrialization:le_uranium_tiny_dust', block: 'modern_industrialization:le_uranium_block' }, 0.2, 'le')
material({ ingot: 'modern_industrialization:le_mox_ingot', dust: 'modern_industrialization:le_mox_dust',
  rod: 'modern_industrialization:le_mox_rod', nugget: 'modern_industrialization:le_mox_nugget',
  tiny: 'modern_industrialization:le_mox_tiny_dust', block: 'modern_industrialization:le_mox_block' }, 0.5, 'le')

// --- Hoch angereichert ---
material({ ingot: 'modern_industrialization:he_uranium_ingot', dust: 'modern_industrialization:he_uranium_dust',
  rod: 'modern_industrialization:he_uranium_rod', nugget: 'modern_industrialization:he_uranium_nugget',
  tiny: 'modern_industrialization:he_uranium_tiny_dust', block: 'modern_industrialization:he_uranium_block' }, 0.4, 'he')
material({ ingot: 'modern_industrialization:he_mox_ingot', dust: 'modern_industrialization:he_mox_dust',
  rod: 'modern_industrialization:he_mox_rod', nugget: 'modern_industrialization:he_mox_nugget',
  tiny: 'modern_industrialization:he_mox_tiny_dust', block: 'modern_industrialization:he_mox_block' }, 1, 'he')
material({ ingot: 'modern_industrialization:uranium_235_ingot', dust: 'modern_industrialization:uranium_235_dust',
  nugget: 'modern_industrialization:uranium_235_nugget', tiny: 'modern_industrialization:uranium_235_tiny_dust',
  block: 'modern_industrialization:uranium_235_block' }, 0.5, 'he')

// --- Frische Brennstäbe (vor dem Einsatz relativ harmlos) ---
wert('createnuclear:uranium_rod', 3, 'brennstab')
;[['uranium', 2], ['le_uranium', 3], ['le_mox', 5], ['he_uranium', 4], ['he_mox', 6]].forEach(([name, b]) => {
  wert('modern_industrialization:' + name + '_fuel_rod', b, 'brennstab')
  wert('modern_industrialization:' + name + '_fuel_rod_double', b * 2, 'brennstab')
  wert('modern_industrialization:' + name + '_fuel_rod_quad', b * 4, 'brennstab')
})

// --- Spaltstoffe ---
material({ ingot: 'modern_industrialization:plutonium_ingot', dust: 'modern_industrialization:plutonium_dust',
  nugget: 'modern_industrialization:plutonium_nugget', tiny: 'modern_industrialization:plutonium_tiny_dust',
  block: 'modern_industrialization:plutonium_block' }, 3, 'spaltstoff')
material({ ingot: 'stellaris:plutonium_ingot', nugget: 'stellaris:plutonium_nugget', block: 'stellaris:plutonium_block' }, 3, 'spaltstoff')
wert('stellaris:plutonium_piece', 0.033, 'spaltstoff')
wert('stellaris:plutonium_grain', 0.004, 'spaltstoff')
wert('mekanism:pellet_plutonium', 4, 'spaltstoff')
wert('mekanism:pellet_polonium', 10, 'spaltstoff')
wert('mekanism:reprocessed_fissile_fragment', 1, 'spaltstoff')
wert('alexscaves:fissile_core', 5, 'spaltstoff')

// --- Abgebrannte Brennstäbe (das Gefährlichste im Reaktorbetrieb) ---
;[['uranium', 40], ['le_uranium', 50], ['le_mox', 60], ['he_uranium', 60], ['he_mox', 70]].forEach(([name, b]) => {
  wert('modern_industrialization:' + name + '_fuel_rod_depleted', b, 'abgebrannt')
})

// --- Radioaktiver Abfall ---
wert('alexscaves:unrefined_waste', 5, 'abfall')
wert('alexscaves:waste_drum', 15, 'abfall')

// --- Eimer (Wert eines vollen Eimers = 1000 mB) ---
wert('createnuclear:uranium_bucket', 1, 'rein')
wert('mekanism:uranium_oxide_bucket', 0.5, 'rein')
wert('mekanism:uranium_hexafluoride_bucket', 0.5, 'rein')
wert('evolvedmekanism:molten_uranium_bucket', 0.7, 'rein')
wert('evolvedmekanism:molten_plutonium_bucket', 27, 'spaltstoff')

// --- Mekanism-Chemikalien in Tanks, Maschinen und Items (pro 1000 mB) ---
chemikalie('mekanism:nuclear_waste', 20)
chemikalie('mekanism:spent_nuclear_waste', 10)
chemikalie('mekanism:plutonium', 4)
chemikalie('mekanism:polonium', 10)
chemikalie('mekanism:fissile_fuel', 3)
chemikalie('mekanism:uranium_oxide', 0.5)
chemikalie('mekanism:uranium_hexafluoride', 0.5)

// --- Flüssigkeiten in Tanks und Maschinen (pro 1000 mB) ---
fluessigkeit('createnuclear:uranium', 1)
fluessigkeit('evolvedmekanism:molten_uranium', 0.7)
fluessigkeit('evolvedmekanism:molten_plutonium', 27)

global.GIG_STRAHLUNG = { stufen: STUFEN, werte: WERTE, chemikalien: CHEMIKALIEN, fluessigkeiten: FLUESSIGKEITEN }
