// Fate/Unlimited Block Works: Gralkrieg soll nicht von Waffen und Rüstungen anderer Mods überlagert werden.
//
// 1) Fremde Waffen gegen Servants: Schaden von Waffen, Zaubern, Projektilen und Maschinen anderer Mods
//    (z.B. Cataclysm, Iron's Spells, Ars Nouveau, Create Big Cannons) gegen Servants und ihre Beschwörungen
//    wird stark reduziert und pro Treffer gedeckelt. Vanilla- und Fate-Waffen bleiben unverändert.
// 2) Fremde Waffen zwischen Mastern: Greift ein Spieler einen Gralkrieg-Teilnehmer mit Waffen anderer Mods an,
//    wird der Schaden ebenfalls reduziert.
// 3) MekaSuit: Die MekaSuit würde Servant-Nahkampf und Medeas Magie zu 100 % absorbieren. Fate-Schaden an
//    Spielern mit MekaSuit wird deshalb als eigener Schadenstyp neu zugefügt, den die MekaSuit nicht absorbiert
//    (kubejs:fate_attack / kubejs:fate_piercing, siehe kubejs/data). Ihre normalen Rüstungspunkte zählen weiter.
//
// Außerhalb des Gralkriegs (Bosse, Mobs, normales PvP) ändert sich nichts.

// Bei Balance-Änderungen nur diese Werte anpassen
const FATE_FOREIGN_DAMAGE_MULT = 0.4 // fremder Schaden gegen Servants / Teilnehmer
const FATE_SERVANT_HIT_CAP = 0.05 // fremder Schaden max. 5 % der Servant-Max-HP pro Treffer

const FATE_NS = 'fateubw'
const FATE_NATIVE_NS = { minecraft: true, fateubw: true }

const FateEventPriority = Java.loadClass('net.neoforged.bus.api.EventPriority')
const FateLivingIncomingDamageEvent = Java.loadClass('net.neoforged.neoforge.event.entity.living.LivingIncomingDamageEvent')
const FateBuiltInRegistries = Java.loadClass('net.minecraft.core.registries.BuiltInRegistries')
const FateRegistries = Java.loadClass('net.minecraft.core.registries.Registries')
const FateResourceKey = Java.loadClass('net.minecraft.resources.ResourceKey')
const FateResourceLocation = Java.loadClass('net.minecraft.resources.ResourceLocation')
const FateDamageSource = Java.loadClass('net.minecraft.world.damagesource.DamageSource')
const FateDamageTypeTags = Java.loadClass('net.minecraft.tags.DamageTypeTags')
const FateEquipmentSlot = Java.loadClass('net.minecraft.world.entity.EquipmentSlot')
const FateGrailWarHandler = Java.loadClass('io.github.flemmli97.fateubw.common.world.GrailWarHandler')

const FATE_ARMOR_SLOTS = [FateEquipmentSlot.HEAD, FateEquipmentSlot.CHEST, FateEquipmentSlot.LEGS, FateEquipmentSlot.FEET]

function fateEntityNs(entity) {
  return entity ? String(FateBuiltInRegistries.ENTITY_TYPE.getKey(entity.getType()).getNamespace()) : null
}

function fateItemNs(stack) {
  return String(FateBuiltInRegistries.ITEM.getKey(stack.getItem()).getNamespace())
}

function fateDamageTypeNs(source) {
  return String(source.typeHolder().getRegisteredName()).split(':')[0]
}

function fateIsForeign(ns) {
  return ns != null && !FATE_NATIVE_NS[ns]
}

// Stammt der Schaden von Waffen, Zaubern oder Entities anderer Mods?
function fateIsForeignDamage(source, attacker, direct) {
  if (fateIsForeign(fateDamageTypeNs(source))) return true
  if (direct && fateIsForeign(fateEntityNs(direct))) return true
  if (attacker && fateIsForeign(fateEntityNs(attacker))) return true
  // Nahkampf: Waffe in der Hand prüfen
  if (attacker && attacker.isPlayer() && direct != null && direct.equals(attacker)) {
    const weapon = attacker.getMainHandItem()
    if (!weapon.isEmpty() && fateIsForeign(fateItemNs(weapon))) return true
  }
  return false
}

function fateIsFateSource(source, attacker, direct) {
  return fateDamageTypeNs(source) === FATE_NS || fateEntityNs(attacker) === FATE_NS || fateEntityNs(direct) === FATE_NS
}

function fateWearsMekaSuit(player) {
  return FATE_ARMOR_SLOTS.some(slot => {
    const stack = player.getItemBySlot(slot)
    if (stack.isEmpty()) return false
    const id = FateBuiltInRegistries.ITEM.getKey(stack.getItem())
    return String(id.getNamespace()) === 'mekanism' && String(id.getPath()).startsWith('mekasuit')
  })
}

function fateDamageTypeHolder(server, id) {
  const key = FateResourceKey.create(FateRegistries.DAMAGE_TYPE, FateResourceLocation.parse(id))
  return server.registryAccess().registryOrThrow(FateRegistries.DAMAGE_TYPE).getHolderOrThrow(key)
}

NativeEvents.onEvent(FateEventPriority.HIGHEST, FateLivingIncomingDamageEvent, event => {
  const victim = event.getEntity()
  if (victim.level().isClientSide()) return

  const source = event.getSource()
  const attacker = source.getEntity()
  const direct = source.getDirectEntity()
  const typeId = String(source.typeHolder().getRegisteredName())

  // Eigene Ersatz-Schadenstypen nicht erneut behandeln
  if (typeId === 'kubejs:fate_attack' || typeId === 'kubejs:fate_piercing') return

  // Servants untereinander (auch Lancelot mit fremden Waffen) bleiben unverändert
  if (fateEntityNs(attacker) === FATE_NS) {
    // 3) MekaSuit soll Fate-Schaden nicht komplett schlucken
    if (victim.isPlayer() && fateWearsMekaSuit(victim)) {
      const amount = event.getAmount()
      const replacement = source.is(FateDamageTypeTags.BYPASSES_ARMOR) ? 'kubejs:fate_piercing' : 'kubejs:fate_attack'
      event.setCanceled(true)
      victim.hurt(new FateDamageSource(fateDamageTypeHolder(victim.server, replacement), direct, attacker), amount)
    }
    return
  }

  // 1) Fremder Schaden gegen Servants und ihre Beschwörungen
  if (fateEntityNs(victim) === FATE_NS) {
    if (!fateIsForeignDamage(source, attacker, direct)) return
    const cap = victim.getMaxHealth() * FATE_SERVANT_HIT_CAP
    event.setAmount(Math.min(event.getAmount() * FATE_FOREIGN_DAMAGE_MULT, cap))
    return
  }

  // 2) Fremde Waffen gegen Gralkrieg-Teilnehmer (Master)
  if (victim.isPlayer() && attacker && attacker.isPlayer() && !attacker.equals(victim)) {
    if (!FateGrailWarHandler.get(victim.server).isParticipant(victim)) return
    if (fateIsFateSource(source, attacker, direct)) return
    if (!fateIsForeignDamage(source, attacker, direct)) return
    event.setAmount(event.getAmount() * FATE_FOREIGN_DAMAGE_MULT)
  }
})
