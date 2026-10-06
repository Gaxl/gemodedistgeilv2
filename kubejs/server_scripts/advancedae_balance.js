// Advanced AE: Quantum Computer und Quantum Crafter erst im Lategame.
// Statt 4 Singularitaeten bzw. 4 Shattered Singularities je 4 Quantum Alloy Plates (= 4 Nether Stars).
// Multi-Threader und Data Entangler brauchen einen Core und werden dadurch automatisch mit teurer.
ServerEvents.recipes(event => {
  event.remove({ id: 'advanced_ae:quantumcore' })
  event.shaped('advanced_ae:quantum_core', [
    'PEP',
    'AUT',
    'PEP'
  ], {
    P: 'advanced_ae:quantum_alloy_plate',
    E: 'advanced_ae:shattered_singularity',
    A: 'advanced_ae:quantum_accelerator',
    U: 'advanced_ae:quantum_unit',
    T: 'advanced_ae:quantum_storage_256'
  }).id('kubejs:advanced_ae/quantum_core_lategame')

  event.remove({ id: 'advanced_ae:quantumcrafter' })
  event.shaped('advanced_ae:quantum_crafter', [
    'PAP',
    'KUK',
    'PAP'
  ], {
    P: 'advanced_ae:quantum_alloy_plate',
    A: 'advanced_ae:quantum_accelerator',
    K: 'ae2:cell_component_64k',
    U: 'advanced_ae:quantum_unit'
  }).id('kubejs:advanced_ae/quantum_crafter_lategame')
})
