// Fate/Unlimited Block Works: Gralkrieg soll nicht von Waffen und Rüstungen anderer Mods überlagert werden.
//
// 1) Fremde Waffen gegen Servants: Schaden von Waffen, Zaubern, Projektilen und Maschinen anderer Mods
//    (z.B. Cataclysm, Ars Nouveau, Create Big Cannons) gegen Servants und ihre Beschwörungen
//    wird stark reduziert und pro Treffer gedeckelt. Vanilla- und Fate-Waffen bleiben unverändert.
//    Ausnahmen pro Mod in MOD_RULES: Iron's Spells soll im Gralkrieg als Magier-Spielstil nutzbar bleiben.
// 2) Fremde Waffen zwischen Mastern: Greift ein Spieler einen Gralkrieg-Teilnehmer mit Waffen anderer Mods an,
//    wird der Schaden ebenfalls reduziert.
// 3) MekaSuit: Die MekaSuit würde Servant-Nahkampf und Medeas Magie zu 100 % absorbieren. Fate-Schaden an
//    Spielern mit MekaSuit wird deshalb als eigener Schadenstyp neu zugefügt, den die MekaSuit nicht absorbiert
//    (kubejs:fate_attack / kubejs:fate_piercing, siehe kubejs/data). Ihre normalen Rüstungspunkte zählen weiter.
//
// Außerhalb des Gralkriegs (Bosse, Mobs, normales PvP) ändert sich nichts.
//
// Fehler im NativeEvents-Handler würden den ganzen Server crashen, deshalb alles in try/catch,
// Klassen werden beim Laden aufgelöst und das Script läuft in einer eigenen Funktion (gemeinsamer Script-Scope).

(function () {
  // Bei Balance-Änderungen nur diese Werte anpassen
  var FOREIGN_DAMAGE_MULT = 0.4 // fremder Schaden gegen Servants / Teilnehmer
  var SERVANT_HIT_CAP = 0.05 // fremder Schaden max. 5 % der Servant-Max-HP pro Treffer
  // Eigene Werte für einzelne Mods (Mod-ID: mult = Schadensfaktor, cap = max. Anteil der Servant-Max-HP pro Treffer)
  var MOD_RULES = {
    irons_spellbooks: { mult: 0.75, cap: 0.08 }
  }

  var FATE_NS = 'fateubw'
  var NATIVE_NS = { minecraft: true, fateubw: true }

  var EventPriority, LivingIncomingDamageEvent, BuiltInRegistries, Registries, ResourceKey, ResourceLocation
  var DamageSource, DamageTypeTags, EquipmentSlot, Player, GrailWarHandler
  try {
    EventPriority = Java.loadClass('net.neoforged.bus.api.EventPriority')
    LivingIncomingDamageEvent = Java.loadClass('net.neoforged.neoforge.event.entity.living.LivingIncomingDamageEvent')
    BuiltInRegistries = Java.loadClass('net.minecraft.core.registries.BuiltInRegistries')
    Registries = Java.loadClass('net.minecraft.core.registries.Registries')
    ResourceKey = Java.loadClass('net.minecraft.resources.ResourceKey')
    ResourceLocation = Java.loadClass('net.minecraft.resources.ResourceLocation')
    DamageSource = Java.loadClass('net.minecraft.world.damagesource.DamageSource')
    DamageTypeTags = Java.loadClass('net.minecraft.tags.DamageTypeTags')
    EquipmentSlot = Java.loadClass('net.minecraft.world.entity.EquipmentSlot')
    Player = Java.loadClass('net.minecraft.world.entity.player.Player')
    GrailWarHandler = Java.loadClass('io.github.flemmli97.fateubw.common.world.GrailWarHandler')
  } catch (e) {
    console.error('[fateubw_balance] Klassen nicht gefunden, Gralkrieg-Balance ist AUS: ' + e)
    return
  }

  var ARMOR_SLOTS = [EquipmentSlot.HEAD, EquipmentSlot.CHEST, EquipmentSlot.LEGS, EquipmentSlot.FEET]
  var KEY_FATE_ATTACK = ResourceKey.create(Registries.DAMAGE_TYPE, ResourceLocation.parse('kubejs:fate_attack'))
  var KEY_FATE_PIERCING = ResourceKey.create(Registries.DAMAGE_TYPE, ResourceLocation.parse('kubejs:fate_piercing'))
  var loggedErrors = {}
  var loggedCount = 0

  // KubeJS blendet manche Vanilla-Methoden aus (z.B. DamageSource.getEntity), deshalb mit Ausweichnamen
  function call(obj, names) {
    for (var i = 0; i < names.length; i++) {
      var v = obj[names[i]]
      if (typeof v === 'function') return v.call(obj)
      if (v !== undefined && v !== null) return v
    }
    return null
  }

  function sourceAttacker(source) {
    return call(source, ['getEntity', 'getActual', 'actual', 'entity'])
  }

  function sourceDirect(source) {
    return call(source, ['getDirectEntity', 'getImmediate', 'immediate', 'directEntity'])
  }

  // KubeJS liefert bei entity.getType() die ID als Text ("fateubw:emiya_archer"), nicht den EntityType
  function entityNs(entity) {
    if (!entity) return null
    var type = entity.getType()
    var id = String(type)
    if (id.indexOf(':') < 0) id = String(BuiltInRegistries.ENTITY_TYPE.getKey(type))
    return id.split(':')[0]
  }

  function itemNs(stack) {
    return String(BuiltInRegistries.ITEM.getKey(stack.getItem()).getNamespace())
  }

  function damageTypeNs(source) {
    return String(source.typeHolder().getRegisteredName()).split(':')[0]
  }

  function isForeign(ns) {
    return ns != null && !NATIVE_NS[ns]
  }

  function isPlayer(entity) {
    return entity != null && entity instanceof Player
  }

  // Von welcher fremden Mod stammt der Schaden (Schadenstyp, Projektil/Beschwörung, Angreifer, Nahkampfwaffe)?
  // null = Vanilla oder Fate
  function foreignNs(source, attacker, direct) {
    var ns = damageTypeNs(source)
    if (isForeign(ns)) return ns
    ns = entityNs(direct)
    if (isForeign(ns)) return ns
    ns = entityNs(attacker)
    if (isForeign(ns)) return ns
    // Nahkampf: Waffe in der Hand prüfen
    if (isPlayer(attacker) && direct != null && direct.equals(attacker)) {
      var weapon = attacker.getMainHandItem()
      if (!weapon.isEmpty()) {
        ns = itemNs(weapon)
        if (isForeign(ns)) return ns
      }
    }
    return null
  }

  function ruleFor(ns) {
    return MOD_RULES[ns] || { mult: FOREIGN_DAMAGE_MULT, cap: SERVANT_HIT_CAP }
  }

  function isFateSource(source, attacker, direct) {
    return damageTypeNs(source) === FATE_NS || entityNs(attacker) === FATE_NS || entityNs(direct) === FATE_NS
  }

  function wearsMekaSuit(player) {
    return ARMOR_SLOTS.some(function (slot) {
      var stack = player.getItemBySlot(slot)
      if (stack.isEmpty()) return false
      var id = BuiltInRegistries.ITEM.getKey(stack.getItem())
      return String(id.getNamespace()) === 'mekanism' && String(id.getPath()).startsWith('mekasuit')
    })
  }

  function handle(event) {
    var victim = event.getEntity()
    if (victim.level.isClientSide()) return

    var source = event.getSource()
    var attacker = sourceAttacker(source)
    var direct = sourceDirect(source)
    var typeId = String(source.typeHolder().getRegisteredName())

    // Eigene Ersatz-Schadenstypen nicht erneut behandeln
    if (typeId === 'kubejs:fate_attack' || typeId === 'kubejs:fate_piercing') return

    // Servants untereinander (auch Lancelot mit fremden Waffen) bleiben unverändert
    if (entityNs(attacker) === FATE_NS) {
      // 3) MekaSuit soll Fate-Schaden nicht komplett schlucken
      if (isPlayer(victim) && wearsMekaSuit(victim)) {
        var amount = event.getAmount()
        var key = source.is(DamageTypeTags.BYPASSES_ARMOR) ? KEY_FATE_PIERCING : KEY_FATE_ATTACK
        var holder = victim.level.registryAccess().registryOrThrow(Registries.DAMAGE_TYPE).getHolderOrThrow(key)
        event.setCanceled(true)
        victim.hurt(new DamageSource(holder, direct, attacker), amount)
      }
      return
    }

    // 1) Fremder Schaden gegen Servants und ihre Beschwörungen
    if (entityNs(victim) === FATE_NS) {
      var ns = foreignNs(source, attacker, direct)
      if (ns == null) return
      var rule = ruleFor(ns)
      event.setAmount(Math.min(event.getAmount() * rule.mult, victim.getMaxHealth() * rule.cap))
      return
    }

    // 2) Fremde Waffen gegen Gralkrieg-Teilnehmer (Master)
    if (isPlayer(victim) && isPlayer(attacker) && !attacker.equals(victim)) {
      if (!GrailWarHandler.get(victim.getServer()).isParticipant(victim)) return
      if (isFateSource(source, attacker, direct)) return
      var pvpNs = foreignNs(source, attacker, direct)
      if (pvpNs == null) return
      event.setAmount(event.getAmount() * ruleFor(pvpNs).mult)
    }
  }

  NativeEvents.onEvent(EventPriority.HIGHEST, LivingIncomingDamageEvent, function (event) {
    try {
      handle(event)
    } catch (e) {
      // Jeden Fehler nur einmal loggen (max. 5), sonst flutet jeder Treffer das Log
      var msg = String(e)
      if (!loggedErrors[msg] && loggedCount < 5) {
        loggedErrors[msg] = true
        loggedCount++
        console.error('[fateubw_balance] Fehler im Schadens-Handler (Schaden bleibt unverändert): ' + e)
      }
    }
  })
})()
