(() => {
  "use strict";

  const PREFIX = "AntimatterDimensionsSavefileFormat";
  const MOBILE_PREFIXES = ["AntimatterDimensionsAndroidSaveFormat", "AntimatterDimensionsAppleSaveFormat"];
  const SUFFIX = "EndOfSavefile";
  const LIMITS = {
    encodedCharacters: 4_000_000,
    compressedBytes: 3_000_000,
    inflatedBytes: 16_000_000,
  };

  class SaveError extends Error {
    constructor(code) {
      super(code);
      this.name = "SaveError";
      this.code = code;
    }
  }

  function fail(code) {
    throw new SaveError(code);
  }

  function decodeBase64(value) {
    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(value) || value.length % 4 === 1) fail("invalid");
    const padded = `${value}${"=".repeat((4 - value.length % 4) % 4)}`;
    let binary;
    try {
      binary = atob(padded);
    } catch {
      fail("invalid");
    }
    if (binary.length > LIMITS.compressedBytes) fail("tooLarge");
    return Uint8Array.from(binary, character => character.charCodeAt(0));
  }

  function decodePrintable(value) {
    return decodeBase64(value.replace(/0b/g, "+").replace(/0c/g, "/").replace(/0a/g, "0"));
  }

  async function inflate(bytes) {
    if (typeof DecompressionStream !== "function") fail("browserUnsupported");
    let stream;
    try {
      stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate"));
    } catch {
      fail("invalid");
    }

    const reader = stream.getReader();
    const chunks = [];
    let size = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > LIMITS.inflatedBytes) {
          await reader.cancel();
          fail("tooLarge");
        }
        chunks.push(value);
      }
    } catch (error) {
      if (error instanceof SaveError) throw error;
      fail("invalid");
    }

    const output = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      output.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return new TextDecoder("utf-8", { fatal: true }).decode(output);
  }

  async function decodeText(input) {
    const text = String(input ?? "").trim();
    if (!text || text.length > LIMITS.encodedCharacters) fail(text ? "tooLarge" : "empty");
    if (text.startsWith("{")) return text;
    if (MOBILE_PREFIXES.some(prefix => text.startsWith(prefix))) fail("mobileUnsupported");

    if (text.startsWith(PREFIX)) {
      const version = text.slice(PREFIX.length, PREFIX.length + 3);
      if (version !== "AAA" && version !== "AAB") fail("unsupportedVersion");
      let payload = text.slice(PREFIX.length + 3);
      if (version === "AAB") {
        if (!payload.endsWith(SUFFIX)) fail("invalid");
        payload = payload.slice(0, -SUFFIX.length);
      }
      return inflate(decodePrintable(payload));
    }

    try {
      const bytes = decodeBase64(text);
      if (bytes.byteLength > LIMITS.inflatedBytes) fail("tooLarge");
      return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    } catch (error) {
      if (error instanceof SaveError) throw error;
      fail("invalid");
    }
  }

  function finiteNumber(value, fallback = 0) {
    const parsed = typeof value === "string" ? Number(value) : value;
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function safeInt(value, maximum = Number.MAX_SAFE_INTEGER) {
    const parsed = typeof value === "string" ? Number(value) : value;
    if (parsed === Number.POSITIVE_INFINITY) return maximum;
    if (!Number.isFinite(parsed)) return 0;
    return Math.min(maximum, Math.max(0, Math.floor(parsed)));
  }

  function decimalExponent(value) {
    if (typeof value === "string") {
      const match = value.match(/e([+-]?\d+)$/i);
      if (match) return safeInt(match[1]);
    }
    const number = finiteNumber(value, Number.NaN);
    if (number > 0) return Math.floor(Math.log10(number));
    if (value && typeof value === "object") {
      if (Number.isFinite(value.exponent)) return safeInt(value.exponent);
      if (Number.isFinite(value.e)) return safeInt(value.e);
      if (value.layer === 1 && Number.isFinite(value.mag)) return safeInt(value.mag);
    }
    return null;
  }

  function decimalLog10(value) {
    if (typeof value === "string") {
      const match = value.match(/^([+-]?(?:\d+(?:\.\d*)?|\.\d+))[eE]([+-]?\d+)$/);
      if (match && Number(match[1]) > 0) return Math.log10(Number(match[1])) + Number(match[2]);
    }
    const number = finiteNumber(value, Number.NaN);
    if (number > 0) return Math.log10(number);
    if (value && typeof value === "object") {
      const exponent = finiteNumber(value.exponent ?? value.e, Number.NaN);
      const mantissa = finiteNumber(value.mantissa ?? value.m, 1);
      if (Number.isFinite(exponent) && mantissa > 0) return exponent + Math.log10(mantissa);
      if (value.layer === 1 && Number.isFinite(value.mag)) return value.mag;
    }
    return null;
  }

  // Resources need their magnitude, not safe-integer arithmetic. Keep a log10
  // alongside currencies which can exceed the native floating-point range.
  function decimalNumber(value, maximum = Number.MAX_VALUE) {
    const direct = finiteNumber(value, Number.NaN);
    if (Number.isFinite(direct)) return Math.min(maximum, Math.max(0, direct));
    if (typeof value === "string") {
      const match = value.match(/^([+-]?(?:\d+(?:\.\d*)?|\.\d+))[eE]([+-]?\d+)$/);
      if (match) {
        const exponent = Number(match[2]);
        if (exponent > Math.log10(maximum)) return maximum;
        const parsed = Number(match[1]) * 10 ** exponent;
        return Number.isFinite(parsed) ? Math.min(maximum, Math.max(0, parsed)) : maximum;
      }
    }
    if (value && typeof value === "object") {
      const exponent = finiteNumber(value.exponent ?? value.e, Number.NaN);
      const mantissa = finiteNumber(value.mantissa ?? value.m, 1);
      if (Number.isFinite(exponent)) {
        if (exponent > Math.log10(maximum)) return maximum;
        return Math.min(maximum, Math.max(0, mantissa * 10 ** exponent));
      }
    }
    return 0;
  }

  function totalTimeTheorems(timestudy) {
    if (timestudy.maxTheorem != null) return safeInt(timestudy.maxTheorem);

    /* Legacy Web saves store only unspent TT in `theorem`. The official
       migration reconstructs all purchased TT from the next AM/IP/EP costs
       (migrations.convertTimeTheoremPurchases), which is also what old
       Save-Bank labels mean by their TT value. */
    const amExponent = decimalExponent(timestudy.amcost);
    const ipExponent = decimalExponent(timestudy.ipcost);
    const epLog10 = decimalLog10(timestudy.epcost);
    if ([amExponent, ipExponent, epLog10].every(Number.isFinite)) {
      const amBought = amExponent / 20000 - 1;
      const ipBought = ipExponent / 100;
      const epBought = Math.round(epLog10 / Math.log10(2));
      const purchased = amBought + ipBought + epBought;
      if (Number.isFinite(purchased) && purchased >= 0) return safeInt(Math.round(purchased));
    }

    return safeInt(timestudy.theorem);
  }

  function hasBit(bits, id) {
    const value = safeInt(bits);
    return Math.floor(value / 2 ** id) % 2 === 1;
  }

  function popcount(value) {
    let number = safeInt(value, 2 ** 32 - 1) >>> 0;
    let count = 0;
    while (number) {
      count += number & 1;
      number >>>= 1;
    }
    return count;
  }

  function glyphSummary(glyph) {
    if (!glyph || typeof glyph !== "object") return null;
    const type = typeof glyph.type === "string" ? glyph.type : "unknown";
    const effects = safeInt(glyph.effects, 2 ** 30);
    const effectIds = [...(EARLY_GLYPH_EFFECTS[type] ?? []), ...(SPAETE_GLYPH_EFFEKTE[type] ?? [])]
      .filter(([bit]) => effects & 2 ** bit)
      .map(([, id]) => id);
    return {
      type,
      id: glyph.id ?? null,
      level: safeInt(glyph.level ?? glyph.rawLevel, 1_000_000_000),
      strength: Math.min(10, Math.max(0, finiteNumber(glyph.strength, 0))),
      rarity: Math.max(0, (finiteNumber(glyph.strength, 1) - 1) * 40),
      effects,
      effectIds,
      effectCount: popcount(effects),
      hasTimeEp: type === "time" && hasBit(effects, 3),
      hasDilationDt: type === "dilation" && hasBit(effects, 4),
      hasRepSpeed: type === "replication" && hasBit(effects, 8),
      hasRepDt: type === "replication" && hasBit(effects, 10),
      hasRepGlyphLevel: type === "replication" && hasBit(effects, 11),
      hasPowerPow: type === "power" && hasBit(effects, 16),
    };
  }

  const EARLY_GLYPH_TYPES = ["power", "infinity", "replication", "time", "dilation"];
  const EARLY_GLYPH_EFFECTS = {
    power: [[16, "powerpow"], [17, "powermult"], [18, "powerdimboost"], [19, "powerbuy10"]],
    infinity: [[12, "infinitypow"], [13, "infinityrate"], [14, "infinityIP"], [15, "infinityinfmult"]],
    replication: [[8, "replicationspeed"], [9, "replicationpow"], [10, "replicationdtgain"], [11, "replicationglyphlevel"]],
    time: [[0, "timepow"], [1, "timespeed"], [2, "timeetermult"], [3, "timeEP"]],
    dilation: [[4, "dilationDT"], [5, "dilationgalaxyThreshold"], [6, "dilationTTgen"], [7, "dilationpow"]],
    effarig: [[20, "effarigrm"], [21, "effarigglyph"], [22, "effarigblackhole"], [23, "effarigachievement"],
      [24, "effarigforgotten"], [25, "effarigdimensions"], [26, "effarigantimatter"]],
    reality: [[4, "realityglyphlevel"], [5, "realitygalaxies"], [6, "realityrow1pow"], [7, "realityDTglyph"]],
    cursed: [[0, "cursedgalaxies"], [1, "curseddimensions"], [2, "cursedtickspeed"], [3, "cursedEP"]],
  };

  /* Nachträglich vergebene Effekte. Sie gehören nicht in die Tabelle oben, weil
     earlyGlyphProjection daraus die Zufallsauswahl des Spiels nachbaut und dabei
     genau die generierbaren Effekte braucht. Für die Anzeige zählen sie mit:
     timeshardpow (Bit 27) hängt Ra an Time-Glyphs an (glyph-effects.js). */
  const SPAETE_GLYPH_EFFEKTE = {
    time: [[27, "timeshardpow"]],
  };

  function permutationIndex(length, lexicographicIndex) {
    let permutations = 1;
    for (let index = 1; index <= length; index++) permutations *= index;
    let current = lexicographicIndex % permutations;
    let remainderOrder = permutations / length;
    const remaining = Array.from({ length }, (_, index) => index);
    const result = [];
    while (remaining.length) {
      const position = Math.floor(current / remainderOrder);
      result.push(remaining.splice(position, 1)[0]);
      current %= remainderOrder;
      remainderOrder /= remaining.length;
    }
    return result;
  }

  function earlyGlyphProjection(save, realities, perks, upgrades, achievementIds) {
    const reality = save.reality ?? {};
    const active = Array.isArray(reality.glyphs?.active) ? reality.glyphs.active : [];
    const supportedTypes = new Set([...EARLY_GLYPH_TYPES, "companion"]);
    const unsupported = realities < 1 || realities > 20 || !perks.includes(0)
      || upgrades.some(id => id >= 16) || achievementIds.includes(146)
      || active.some(glyph => !supportedTypes.has(glyph?.type))
      || decimalNumber(save.celestials?.teresa?.pouredAmount) > 0
      || decimalNumber(reality.glyphs?.sac?.effarig) > 0 || Boolean(save.IAP?.enabled);
    if (unsupported) return { level: null, choices: [] };

    const ep = decimalLog10(save.records?.thisReality?.maxEP);
    const replicanti = decimalLog10(save.records?.thisReality?.maxReplicanti);
    const dilatedTime = decimalLog10(save.records?.thisReality?.maxDT);
    if (![ep, replicanti, dilatedTime].every(value => Number.isFinite(value) && value > 0)) {
      return { level: null, choices: [] };
    }

    const replicationEffects = active
      .filter(glyph => glyph?.type === "replication" && hasBit(glyph.effects, 11))
      .map(glyph => Math.sqrt(Math.pow(finiteNumber(glyph.level, 1), 0.25)
        * Math.pow(finiteNumber(glyph.strength, 1), 0.4)) / 50);
    let replicationLevelEffect = replicationEffects.reduce((sum, effect) => sum + effect, 0);
    if (replicationEffects.length > 2) replicationLevelEffect *= 6 / (replicationEffects.length + 4);
    if (replicationLevelEffect > 0.1) replicationLevelEffect = 0.1 + 0.2 * (replicationLevelEffect - 0.1);

    const bought = id => hasBit(reality.upgradeBits, id);
    const completeRows = [
      [1, 2, 3, 4, 5].every(id => safeInt(reality.rebuyables?.[id]) > 0),
      [6, 7, 8, 9, 10].every(bought),
      [11, 12, 13, 14, 15].every(bought),
    ].filter(Boolean).length;
    const rawLevel =
      Math.sqrt(ep) * 0.016
      * Math.pow(replicanti, 0.4 + replicationLevelEffect) * 0.025
      * Math.pow(dilatedTime, 1.3) * 0.025
      + completeRows;
    if (!Number.isFinite(rawLevel)) return { level: null, choices: [] };
    const level = Math.max(1, Math.floor(rawLevel));

    const initialSeed = finiteNumber(reality.initialSeed, Number.NaN);
    const savedSeed = finiteNumber(reality.seed, Number.NaN);
    if (!Number.isSafeInteger(initialSeed) || initialSeed < 0 || !Number.isFinite(savedSeed) || savedSeed === 0) {
      return { level, choices: [] };
    }
    const rng = {
      seed: savedSeed,
      secondGaussian: finiteNumber(reality.secondGaussian, 1e6),
      uniform() {
        let state = this.seed;
        state ^= state << 13;
        state ^= state >>> 17;
        state ^= state << 5;
        this.seed = state;
        return state * 2.3283064365386963e-10 + 0.5;
      },
      normal() {
        if (this.secondGaussian !== 1e6) {
          const result = this.secondGaussian;
          this.secondGaussian = 1e6;
          return result;
        }
        let first, second, radius;
        do {
          first = this.uniform() * 2 - 1;
          second = this.uniform() * 2 - 1;
          radius = first * first + second * second;
        } while (radius >= 1 || radius === 0);
        radius = Math.sqrt(-2 * Math.log(radius) / radius);
        this.secondGaussian = second * radius;
        return first * radius;
      },
    };
    const strength = () => {
      const x = Math.sqrt(Math.abs(rng.normal()) + 1);
      const result = -0.111749606737 + x * (0.900603878244 + x * (0.229108274477 - 0.0179625459832 * x));
      rng.uniform();
      return Math.min(Math.ceil(result * 400) / 400, 3.5);
    };

    const groupNumber = Math.floor((realities - 1) / 5);
    const groupIndex = (realities - 1) % 5;
    const typePermutation = permutationIndex(5,
      (31 + initialSeed % 7) * groupNumber + initialSeed % 1123);
    const typePermutationIndex = Array(5).fill(0);
    for (let prior = 0; prior < groupIndex; prior++) {
      for (let type = 0; type < 5; type++) if (type !== typePermutation[prior]) typePermutationIndex[type]++;
    }
    const types = [0, 1, 2, 3, 4];
    types.splice(typePermutation[groupIndex], 1);
    const starts = [16, 12, 8, 0, 4];
    const uniformEffects = types.map(type => starts[type] + permutationIndex(4,
      5 * type + (7 + initialSeed % 5) * groupNumber + initialSeed % 11)[typePermutationIndex[type]]);

    const choices = types.map((typeIndex, choiceIndex) => {
      const type = EARLY_GLYPH_TYPES[typeIndex];
      const glyphStrength = strength();
      const randomEffectCount = rng.uniform();
      rng.uniform();
      const effectCount = Math.min(4,
        Math.floor(Math.pow(randomEffectCount, 1 - Math.sqrt(level * glyphStrength) / 100) * 1.5 + 1));
      const effectValues = Object.fromEntries(EARLY_GLYPH_EFFECTS[type].map(([bit]) => [bit, rng.uniform()]));
      for (let index = 0; index < 3; index++) rng.uniform();
      for (const forced of [0, 12, 16]) if (forced in effectValues) effectValues[forced] = 2;
      const generated = Object.keys(effectValues)
        .sort((left, right) => effectValues[right] - effectValues[left])
        .slice(0, effectCount).map(Number);
      let mask = generated.reduce((value, bit) => value | 2 ** bit, 0);
      const uniformMask = (initialSeed + realities + choiceIndex) % 2 === 0
        ? 2 ** uniformEffects[choiceIndex]
        : mask | 2 ** uniformEffects[choiceIndex];
      if (popcount(uniformMask) > 2) {
        const replaceable = generated.filter(bit => ![0, 12, 16].includes(bit));
        const removed = replaceable[Math.abs(initialSeed + realities) % replaceable.length];
        mask = uniformMask & ~(2 ** removed);
      } else {
        mask = uniformMask;
      }
      const forced = { power: 16, infinity: 12, time: 0 }[type];
      if (forced !== undefined) mask |= 2 ** forced;
      return { type, level, strength: glyphStrength, effectsMask: mask };
    });

    const uncommonIndex = Math.floor(rng.uniform() * choices.length);
    let uncommonStrength;
    do uncommonStrength = strength(); while (uncommonStrength < 1.5);
    if (!choices.some(glyph => glyph.strength >= 1.5)) choices[uncommonIndex].strength = uncommonStrength;

    return {
      level,
      choices: choices.map(glyph => ({
        type: glyph.type,
        level: glyph.level,
        rarity: Math.round((glyph.strength - 1) * 400) / 10,
        effects: EARLY_GLYPH_EFFECTS[glyph.type]
          .filter(([bit]) => glyph.effectsMask & 2 ** bit)
          .map(([, id]) => id),
      })),
    };
  }

  function uniqueIds(values, minimum = 0, maximum = 999) {
    if (!Array.isArray(values)) return [];
    return [...new Set(values
      .filter(value => Number.isInteger(Number(value)) && Number(value) >= minimum && Number(value) <= maximum)
      .map(Number))].sort((a, b) => a - b);
  }

  function bitIds(bits, minimum, maximum) {
    return Array.from({ length: maximum - minimum + 1 }, (_, index) => index + minimum)
      .filter(id => hasBit(bits, id));
  }

  function achievementIdsFromBits(bits) {
    if (!Array.isArray(bits)) return [];
    return bits.flatMap((rowBits, rowIndex) => Array.from({ length: 8 }, (_, bitIndex) => bitIndex)
      .filter(bitIndex => hasBit(rowBits, bitIndex))
      .map(bitIndex => (rowIndex + 1) * 10 + bitIndex + 1));
  }

  const AUTOMATOR_UPGRADE_POINTS = new Map([[10, 15], [11, 5], [13, 10], [14, 5], [20, 10], [25, 100]]);
  const AUTOMATOR_PERK_POINTS = new Map([
    [14, 5], [16, 10], [17, 5], [44, 5], [45, 5], [46, 10], [53, 5], [60, 5], [62, 10],
    [72, 10], [73, 15], [83, 10], [100, 5], [101, 5], [102, 5], [103, 5], [104, 5],
    [106, 10], [107, 5], [201, 5], [205, 10],
  ]);

  function automatorPoints(realities, upgrades, perks, firstBlackHoleUnlocked) {
    const realityPoints = 2 * Math.min(realities, 50);
    const upgradePoints = upgrades.reduce((sum, id) => sum + (AUTOMATOR_UPGRADE_POINTS.get(id) ?? 0), 0);
    const perkPoints = perks.reduce((sum, id) => sum + (AUTOMATOR_PERK_POINTS.get(id) ?? 0), 0);
    return realityPoints + upgradePoints + perkPoints + (firstBlackHoleUnlocked ? 10 : 0);
  }

  /* ---------------- Altsaves (Spielversion < 13) ----------------
     Save-Bank-Saves und alte Web-Saves stehen im Format vor dem Reality-Update.
     Dort heißt Antimatter noch "money", Infinities "infinitied", Challenges sind
     Strings statt Bits. Ohne diese Umschreibung liest jede Auswertung Nullen und
     meldet Spielern mit 12 Infinities die Phase "vor der ersten Infinity".
     Nachgebaut aus src/core/storage/migrations.js, Patch 13. */

  /* migrations.fixChallengeIds: alte Speicherstände nummerieren Normal Challenges
     nach legacyId (normal-challenges.js). */
  const LEGACY_CHALLENGE_ID = new Map([
    [1, 1], [2, 2], [3, 3], [8, 4], [6, 5], [10, 6], [9, 7], [11, 8], [5, 9], [4, 10], [12, 11], [7, 12],
  ]);

  /* migrations.convertAchievementsToBits: drei Positionstausche seit dem Altformat. */
  const ACHIEVEMENT_SWAPS = new Map([
    ["4,3", "6,4"], ["6,4", "7,7"], ["7,7", "4,3"],
    ["10,1", "11,7"], ["11,7", "10,1"], ["11,3", "12,4"], ["12,4", "11,3"],
  ]);

  function istAltsave(save) {
    return "money" in save || "infinitied" in save || "resets" in save
      || finiteNumber(save.version, 99) < 13;
  }

  function legacyAchievementBits(save) {
    const alt = Array.isArray(save.achievements) ? save.achievements : [];
    const bits = Array.from({ length: 15 }, () => 0);
    for (const eintrag of alt) {
      const roh = typeof eintrag === "number" ? eintrag : Number(String(eintrag).slice(1));
      if (typeof eintrag === "string" && !eintrag.startsWith("r")) continue;
      if (!Number.isFinite(roh) || roh < 11) continue;
      let reihe = Math.floor(roh / 10);
      let spalte = roh % 10;
      const tausch = ACHIEVEMENT_SWAPS.get(`${reihe},${spalte}`);
      if (tausch) [reihe, spalte] = tausch.split(",").map(Number);
      if (reihe < 1 || reihe > 15 || spalte < 1 || spalte > 8) continue;
      bits[reihe - 1] |= 1 << (spalte - 1);
    }
    const infinityUpgrades = Array.isArray(save.infinityUpgrades) ? save.infinityUpgrades.length : 0;
    if (infinityUpgrades >= 16 || decimalNumber(save.eternities) > 0 || safeInt(save.realities) > 0) {
      bits[3] |= 1;
    } else {
      bits[3] &= ~1;
    }
    return bits;
  }

  function legacyChallengeBits(save) {
    let normal = 0;
    let infinity = 0;
    for (const name of Array.isArray(save.challenges) ? save.challenges : []) {
      if (typeof name !== "string") continue;
      if (name.startsWith("challenge")) {
        const legacy = Number(name.slice(9));
        const id = LEGACY_CHALLENGE_ID.get(legacy);
        if (id) normal |= 1 << id;
      } else if (name.startsWith("postc")) {
        const id = Number(name.slice(5));
        if (Number.isInteger(id) && id >= 1 && id <= 8) infinity |= 1 << id;
      }
    }
    let normalAktuell = 0;
    let infinityAktuell = 0;
    const laufend = typeof save.currentChallenge === "string" ? save.currentChallenge : "";
    if (laufend.startsWith("challenge")) {
      normalAktuell = LEGACY_CHALLENGE_ID.get(Number(laufend.slice(9))) ?? 0;
    } else if (laufend.startsWith("postc")) {
      infinityAktuell = safeInt(laufend.slice(5), 8);
    }
    return { normal, infinity, normalAktuell, infinityAktuell };
  }

  function legacyDimensionen(save) {
    const namen = ["first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eight"];
    const antimatter = namen.map(name => ({
      amount: save[`${name}Amount`] ?? 0,
      bought: safeInt(save[`${name}Bought`]),
    }));
    const infinity = Array.from({ length: 8 }, (_, index) => {
      const alt = save[`infinityDimension${index + 1}`] ?? {};
      return {
        amount: alt.amount ?? 0,
        bought: safeInt(alt.bought),
        isUnlocked: Boolean(save.infDimensionsUnlocked?.[index]),
      };
    });
    const time = Array.from({ length: 8 }, (_, index) => {
      const alt = save[`timeDimension${index + 1}`] ?? {};
      return { amount: alt.amount ?? 0, bought: safeInt(alt.bought) };
    });
    return { antimatter, infinity, time };
  }

  /* migrations.adjustMultCosts: die beiden Rebuyables stecken im Altsave nur noch
     in ihrem nächsten Preis. */
  function legacyRebuyable(kosten, basis, faktor) {
    const wert = finiteNumber(kosten, Number.NaN);
    if (!(wert > 0)) return 0;
    return Math.max(0, Math.round(Math.log(wert / basis) / Math.log(faktor)));
  }

  function migriereAltsave(roh) {
    const save = { ...roh };
    const challenges = legacyChallengeBits(roh);
    const dimensionen = legacyDimensionen(roh);

    save.antimatter = roh.money ?? 0;
    save.infinities = roh.infinitied ?? 0;
    save.infinitiesBanked = roh.infinitiedBank ?? 0;
    save.dimensionBoosts = safeInt(roh.resets);
    save.achievementBits = legacyAchievementBits(roh);
    save.dimensions = dimensionen;
    save.challenge = {
      normal: { completedBits: challenges.normal, current: challenges.normalAktuell },
      infinity: { completedBits: challenges.infinity, current: challenges.infinityAktuell },
      eternity: {
        current: typeof roh.currentEternityChall === "string" && roh.currentEternityChall.startsWith("eterc")
          ? safeInt(roh.currentEternityChall.slice(5), 12)
          : 0,
        unlocked: safeInt(roh.eternityChallUnlocked, 12),
        requirementBits: roh.etercreq ? 2 ** safeInt(roh.etercreq, 12) : 0,
      },
    };
    save.infinityRebuyables = [
      legacyRebuyable(roh.tickSpeedMultDecreaseCost, 3e6, 5),
      legacyRebuyable(roh.dimensionMultDecreaseCost, 1e8, 5e3),
      0,
    ];
    /* migrations.refactorDoubleIPRebuyable + infMultNameConversion */
    const infMult = decimalLog10(roh.infMult);
    save.IPMultPurchases = Number.isFinite(infMult) ? Math.round(infMult / Math.log10(2)) : 0;
    /* migrations.convertEPMult */
    const epmult = decimalLog10(roh.epmult);
    save.epmultUpgrades = Number.isFinite(epmult) && epmult > 0
      ? Math.round(epmult / Math.log10(5))
      : 0;
    /* migrations.makeRecords + addBestPrestigeCurrency */
    save.records = {
      thisInfinity: { maxAM: roh.totalmoney ?? roh.money ?? 0 },
      thisEternity: { maxAM: roh.totalmoney ?? roh.money ?? 0, maxIP: roh.infinityPoints ?? 0 },
      thisReality: {
        maxEP: roh.eternityPoints ?? 0,
        maxIP: roh.infinityPoints ?? 0,
        maxDT: roh.dilation?.dilatedTime ?? 0,
        maxReplicanti: roh.replicanti?.amount ?? 0,
      },
    };
    save.replicanti = {
      ...(roh.replicanti ?? {}),
      unl: Boolean(roh.replicanti?.unl),
      galaxies: safeInt(roh.replicanti?.galaxies),
      boughtGalaxyCap: safeInt(roh.replicanti?.gal),
    };
    save.version = 13;
    save.legacyMigriert = true;
    return save;
  }

  function extractProfile(rohSave) {
    if (!rohSave || typeof rohSave !== "object" || Array.isArray(rohSave)) fail("wrongShape");
    const looksLikePlayer = "antimatter" in rohSave || "timestudy" in rohSave || "reality" in rohSave
      || "money" in rohSave;
    if (!looksLikePlayer) fail("wrongShape");
    const save = istAltsave(rohSave) ? migriereAltsave(rohSave) : rohSave;

    const eternityChalls = save.eternityChalls && typeof save.eternityChalls === "object"
      ? save.eternityChalls
      : {};
    /* maxCompletions ist 5; nur EC1 geht im Nameless-Lauf bis 1000
       (eternity-challenge.js). */
    const clears = Array.from({ length: 12 }, (_, index) => safeInt(eternityChalls[`eterc${index + 1}`],
      save.celestials?.enslaved?.run && index === 0 ? 1000 : 5));
    const reality = save.reality && typeof save.reality === "object" ? save.reality : {};
    const timestudy = save.timestudy && typeof save.timestudy === "object" ? save.timestudy : {};
    const dilation = save.dilation && typeof save.dilation === "object" ? save.dilation : {};
    const perks = uniqueIds(reality.perks);
    const activeGlyphs = Array.isArray(reality.glyphs?.active)
      ? reality.glyphs.active.map(glyphSummary).filter(Boolean)
      : [];
    const inventoryGlyphs = Array.isArray(reality.glyphs?.inventory)
      ? reality.glyphs.inventory.map(glyphSummary).filter(Boolean)
      : [];
    const availableGlyphs = [...activeGlyphs, ...inventoryGlyphs];
    const dilationStudies = uniqueIds(dilation.studies, 1, 6);
    const dilationUpgrades = Array.isArray(dilation.upgrades)
      ? uniqueIds(dilation.upgrades, 4, 10)
      : [];
    const dilationRebuyables = Object.fromEntries([1, 2, 3]
      .map(id => [id, safeInt(dilation.rebuyables?.[id], 1_000_000)]));
    const achievementBits = Array.isArray(save.achievementBits) ? save.achievementBits : [];
    const achievementIds = achievementIdsFromBits(achievementBits);
    const realities = safeInt(save.realities, 1_000_000_000);
    const totalTT = totalTimeTheorems(timestudy);
    const normalChallenges = bitIds(save.challenge?.normal?.completedBits, 1, 12);
    const infinityChallenges = bitIds(save.challenge?.infinity?.completedBits, 1, 8);
    const realityUpgrades = bitIds(reality.upgradeBits, 1, 25);
    const realityUpgradeUnlocks = bitIds(reality.upgReqs, 1, 25);
    const imaginaryUpgrades = bitIds(reality.imaginaryUpgradeBits, 1, 25);
    const imaginaryUpgradeUnlocks = bitIds(reality.imaginaryUpgReqs, 1, 25);
    const blackHoles = Array.isArray(save.blackHole) ? save.blackHole.slice(0, 2).map((hole, index) => ({
      id: index + 1,
      unlocked: Boolean(hole?.unlocked),
      intervalUpgrades: safeInt(hole?.intervalUpgrades, 1_000_000),
      powerUpgrades: safeInt(hole?.powerUpgrades, 1_000_000),
      durationUpgrades: safeInt(hole?.durationUpgrades, 1_000_000),
      activations: safeInt(hole?.activations, Number.MAX_SAFE_INTEGER),
    })) : [];
    while (blackHoles.length < 2) blackHoles.push({
      id: blackHoles.length + 1,
      unlocked: false,
      intervalUpgrades: 0,
      powerUpgrades: 0,
      durationUpgrades: 0,
      activations: 0,
    });
    const firstBlackHoleUnlocked = blackHoles[0].unlocked;
    const points = automatorPoints(realities, realityUpgrades, perks, firstBlackHoleUnlocked);
    const maxEPExponent = Math.max(
      decimalExponent(save.eternityPoints) ?? 0,
      decimalExponent(save.records?.thisReality?.maxEP) ?? 0,
    );
    const maxEPLog10 = Math.max(
      decimalLog10(save.eternityPoints) ?? 0,
      decimalLog10(save.records?.thisReality?.maxEP) ?? 0,
    );
    const maxAMExponent = Math.max(
      decimalExponent(save.antimatter) ?? 0,
      decimalExponent(save.records?.thisInfinity?.maxAM) ?? 0,
      decimalExponent(save.records?.thisEternity?.maxAM) ?? 0,
    );
    const maxIPExponent = Math.max(
      decimalExponent(save.infinityPoints) ?? 0,
      decimalExponent(save.records?.thisEternity?.maxIP) ?? 0,
    );
    const infinityDimensionsUnlocked = Array.isArray(save.dimensions?.infinity)
      ? save.dimensions.infinity.filter(dimension => Boolean(dimension?.isUnlocked) || safeInt(dimension?.bought) > 0).length
      : 0;
    /* Vor der ersten Reality daempft das Spiel den EP-Exponenten, bevor daraus RM
       werden (machines.js, uncappedRM): erst harte Grenze bei e8000, dann werden
       drei Viertel des Anteils ueber e6000 abgezogen. Ohne diese Stufe meldet ein
       Save mit e7556 EP das Achtfache des tatsaechlichen Ertrags. */
    let rmEPLog10 = maxEPLog10;
    if (realities === 0) {
      if (rmEPLog10 > 8000) rmEPLog10 = 8000;
      if (rmEPLog10 > 6000) rmEPLog10 -= (rmEPLog10 - 6000) * 0.75;
    }
    let rawRmEstimate = rmEPLog10 < 4000 ? 0 : 1000 ** (rmEPLog10 / 4000 - 1);
    if (rawRmEstimate >= 1 && rawRmEstimate < 10) rawRmEstimate = 27 / 4000 * rmEPLog10 - 26;
    const gainedRMEstimate = Math.min(Number.MAX_SAFE_INTEGER, Math.max(0, Math.floor(rawRmEstimate)));
    const realityStudyBought = dilationStudies.includes(6);
    const celestials = save.celestials && typeof save.celestials === "object" ? save.celestials : {};
    const teresa = celestials.teresa && typeof celestials.teresa === "object" ? celestials.teresa : {};
    const effarig = celestials.effarig && typeof celestials.effarig === "object" ? celestials.effarig : {};
    const enslaved = celestials.enslaved && typeof celestials.enslaved === "object" ? celestials.enslaved : {};
    const v = celestials.v && typeof celestials.v === "object" ? celestials.v : {};
    const ra = celestials.ra && typeof celestials.ra === "object" ? celestials.ra : {};
    const laitela = celestials.laitela && typeof celestials.laitela === "object" ? celestials.laitela : {};
    const pelle = celestials.pelle && typeof celestials.pelle === "object" ? celestials.pelle : {};
    const vRunUnlocks = Array.from({ length: 9 }, (_, index) => safeInt(v.runUnlocks?.[index], 6));
    const spaceTheorems = vRunUnlocks.reduce((sum, value, index) => sum + value * (index < 6 ? 1 : 2), 0);
    const currentCelestial = [
      ["pelle", pelle.doomed], ["laitela", laitela.run], ["ra", ra.run], ["v", v.run],
      ["enslaved", enslaved.run], ["effarig", effarig.run], ["teresa", teresa.run],
    ].find(([, running]) => running)?.[0] ?? null;
    const glyphProjection = earlyGlyphProjection(save, realities, perks, realityUpgrades, achievementIds);

    return {
      platform: "pc",
      legacySave: Boolean(save.legacyMigriert),
      version: safeInt(save.version, 10_000),
      reality: realities + 1,
      realities,
      totalTT,
      unspentTT: decimalNumber(timestudy.theorem),
      clears,
      studies: uniqueIds(timestudy.studies, 1, 999),
      achievementIds,
      achievementCount: achievementIds.length,
      preRealityAchievementCount: achievementIds.filter(id => Math.floor(id / 10) <= 13).length,
      hasRealityAchievementRows: achievementIds.filter(id => Math.floor(id / 10) <= 13).length >= 104,
      perks,
      perkPoints: safeInt(reality.perkPoints, Number.MAX_SAFE_INTEGER),
      activeGlyphs,
      inventoryGlyphs,
      glyphSacrificeLog10: Object.fromEntries([...EARLY_GLYPH_TYPES, "effarig", "reality"]
        .map(type => [type, decimalLog10(reality.glyphs?.sac?.[type]) ?? 0])),
      pendingGlyphLevel: glyphProjection.level,
      bestGlyphLevel: safeInt(save.records?.bestReality?.glyphLevel),
      bestGlyphRarity: Math.max(0, (finiteNumber(save.records?.bestReality?.glyphStrength, 1) - 1) * 40),
      upcomingGlyphs: glyphProjection.choices,
      glyphRespecEnabled: Boolean(reality.respec),
      hasTimeEpGlyph: activeGlyphs.some(glyph => glyph.hasTimeEp),
      powerGlyphs: activeGlyphs.filter(glyph => glyph.type === "power").length,
      powerGlyphsAvailable: availableGlyphs.filter(glyph => glyph.type === "power").length,
      realityUpgrades,
      realityUpgradeUnlocks,
      realityRequirementLocks: bitIds(reality.reqLock?.reality, 1, 25),
      realityRebuyables: Object.fromEntries(Array.from({ length: 5 }, (_, index) => index + 1)
        .map(id => [id, safeInt(reality.rebuyables?.[id], 1_000_000)])),
      imaginaryUpgrades,
      imaginaryUpgradeUnlocks,
      imaginaryRequirementLocks: bitIds(reality.reqLock?.imaginary, 1, 25),
      imaginaryRebuyables: Object.fromEntries(Array.from({ length: 10 }, (_, index) => index + 1)
        .map(id => [id, safeInt(reality.imaginaryRebuyables?.[id], 1_000_000)])),
      hasExistentiallyProlong: realityUpgrades.includes(10),
      automatorPoints: points,
      automatorUnlocked: Boolean(reality.automator?.forceUnlock) || points >= 100 || Object.keys(reality.automator?.scripts ?? {}).length > 0,
      automatorScriptCount: Object.keys(reality.automator?.scripts ?? {}).length,
      automatorMode: safeInt(reality.automator?.state?.mode, 10),
      autoAchievementsEnabled: Boolean(reality.autoAchieve),
      gainedAutoAchievements: Boolean(reality.gainedAutoAchievements),
      requirementChecks: {
        noEternities: Boolean(save.requirementChecks?.reality?.noEternities),
        noInfinities: Boolean(save.requirementChecks?.reality?.noInfinities),
        noContinuum: Boolean(save.requirementChecks?.reality?.noContinuum),
        noRG: Boolean(save.requirementChecks?.eternity?.noRG),
        noAD8: Boolean(save.requirementChecks?.infinity?.noAD8),
        maxGlyphs: safeInt(save.requirementChecks?.reality?.maxGlyphs, 10_000),
        slowestBlackHole: finiteNumber(save.requirementChecks?.reality?.slowestBH, 1),
      },
      resources: {
        antimatterExponent: decimalExponent(save.antimatter),
        infinityPointsExponent: decimalExponent(save.infinityPoints),
        eternityPointsExponent: decimalExponent(save.eternityPoints),
        maxEternityPointsExponent: maxEPExponent,
        maxAntimatterExponent: maxAMExponent,
        maxInfinityPointsExponent: maxIPExponent,
        infinityPoints: decimalNumber(save.infinityPoints),
        eternityPoints: decimalNumber(save.eternityPoints),
        infinities: decimalNumber(save.infinities),
        bankedInfinities: decimalNumber(save.infinitiesBanked),
        eternities: decimalNumber(save.eternities),
        tachyonParticles: decimalNumber(dilation.tachyonParticles),
        dilatedTime: decimalNumber(dilation.dilatedTime),
        dilatedTimeLog10: decimalLog10(dilation.dilatedTime),
        realityMachines: decimalNumber(reality.realityMachines),
        realityMachinesLog10: decimalLog10(reality.realityMachines),
        maxRealityMachines: decimalNumber(reality.maxRM),
        imaginaryMachines: decimalNumber(reality.imaginaryMachines),
        imaginaryMachineCap: Math.min(Number.MAX_VALUE, decimalNumber(reality.iMCap)
          * (imaginaryUpgrades.includes(13) && !pelle.doomed
            ? 1 + Object.values(reality.imaginaryRebuyables ?? {}).reduce((s, n) => s + safeInt(n), 0) / 20
              + imaginaryUpgrades.length / 2 : 1)),
        maxDilatedTimeExponent: decimalExponent(save.records?.thisReality?.maxDT),
        maxReplicantiExponent: decimalExponent(save.records?.thisReality?.maxReplicanti),
      },
      gainedRMEstimate,
      // Base estimate excludes pending EP and external RM multipliers. The game
      // button remains authoritative; this is not a simulation of production.
      gainedRMIsEstimate: true,
      realityGameTimeMs: finiteNumber(save.records?.thisReality?.time),
      gameTimeSinceBlackHoleMs: Math.max(0, finiteNumber(save.records?.totalTimePlayed) - finiteNumber(save.records?.timePlayedAtBHUnlock)),
      blackHolePaused: Boolean(save.blackHolePause),
      currentRun: {
        // Prolong grants 100 Eternities without playing either reset. The
        // requirement flags describe actions in this Reality, unlike currency.
        infinity: typeof save.requirementChecks?.reality?.noInfinities === "boolean"
          ? !save.requirementChecks.reality.noInfinities
          : decimalNumber(save.infinities) > 0 || decimalNumber(save.eternities) > 0,
        eternity: typeof save.requirementChecks?.reality?.noEternities === "boolean"
          ? !save.requirementChecks.reality.noEternities : decimalNumber(save.eternities) > 0,
      },
      epExponent: decimalExponent(save.eternityPoints),
      maxEPExponent,
      infinityUnlocked: decimalNumber(save.infinities) > 0 || decimalNumber(save.eternities) > 0 || realities > 0,
      eternityUnlocked: decimalNumber(save.eternities) > 0 || realities > 0,
      normalChallenges,
      infinityChallenges,
      infinityChallengesUnlocked: safeInt(save.challenge?.infinity?.unlocked, 8),
      currentChallenge: {
        normal: safeInt(save.challenge?.normal?.current, 12),
        infinity: safeInt(save.challenge?.infinity?.current, 8),
        eternity: safeInt(save.challenge?.eternity?.current, 12),
        eternityUnlocked: safeInt(save.challenge?.eternity?.unlocked, 12),
        requirementBits: safeInt(save.challenge?.eternity?.requirementBits, 8191),
      },
      breakInfinity: Boolean(save.break),
      breakInfinityReady: finiteNumber(save.auto?.bigCrunch?.interval, Number.MAX_SAFE_INTEGER) <= 100,
      bigCrunchInterval: finiteNumber(save.auto?.bigCrunch?.interval, Number.MAX_SAFE_INTEGER),
      ipMultPurchases: safeInt(save.IPMultPurchases, 1_000_000),
      infinityUpgradeCount: Array.isArray(save.infinityUpgrades) ? save.infinityUpgrades.length : 0,
      infinityUpgrades: Array.isArray(save.infinityUpgrades) ? save.infinityUpgrades.filter(id => typeof id === "string") : [],
      infinityRebuyables: Array.from({ length: 3 }, (_, index) => safeInt(save.infinityRebuyables?.[index], 1_000_000)),
      infinityDimensionsUnlocked,
      dimensionBoosts: safeInt(save.dimensionBoosts, Number.MAX_SAFE_INTEGER),
      galaxies: safeInt(save.galaxies, Number.MAX_SAFE_INTEGER),
      replicantiUnlocked: Boolean(save.replicanti?.unl),
      replicantiGalaxies: safeInt(save.replicanti?.galaxies, Number.MAX_SAFE_INTEGER),
      replicantiGalaxyCap: safeInt(save.replicanti?.boughtGalaxyCap, Number.MAX_SAFE_INTEGER),
      totalTickGained: safeInt(save.totalTickGained, Number.MAX_SAFE_INTEGER),
      infinityPowerExponent: decimalExponent(save.infinityPower),
      eighthDimensionAmount: decimalNumber(save.dimensions?.antimatter?.[7]?.amount),
      eighthDimensionBought: safeInt(save.dimensions?.antimatter?.[7]?.bought, Number.MAX_SAFE_INTEGER),
      timeDimensionsUnlocked: Array.isArray(save.dimensions?.time)
        ? save.dimensions.time.filter(dimension => safeInt(dimension?.bought) > 0 || decimalNumber(dimension?.amount) > 0).length
        : 0,
      eternityUpgradeCount: Array.isArray(save.eternityUpgrades) ? save.eternityUpgrades.length : 0,
      epMultUpgrades: safeInt(save.epmultUpgrades, Number.MAX_SAFE_INTEGER),
      dilationStudies,
      dilationUnlocked: dilationStudies.includes(1),
      dilationActive: Boolean(dilation.active),
      currentEternityRealSeconds: Math.max(0, finiteNumber(save.records?.thisEternity?.realTime) / 1000),
      // Die letzten zehn Eternities werden bei jeder Reality geleert. Das ist
      // ein belegtes Minimum erfolgreicher Dilation-Läufe, kein Gesamtzähler.
      recentDilationCompletions: (Array.isArray(save.records?.recentEternities) ? save.records.recentEternities : [])
        .filter(run => Array.isArray(run) && decimalNumber(run[5]) > 0).length,
      realityStudyBought,
      realityAvailable: realityStudyBought && maxEPExponent >= 4000,
      dilationUpgrades,
      dilationRebuyables,
      hasDilationStudySplit: dilationUpgrades.includes(8),
      blackHoles,
      firstBlackHoleUnlocked,
      secondBlackHoleUnlocked: blackHoles[1].unlocked,
      celestials: {
        current: currentCelestial,
        teresa: {
          pouredAmount: decimalNumber(teresa.pouredAmount),
          pouredExponent: decimalExponent(teresa.pouredAmount),
          unlocks: bitIds(teresa.unlockBits, 0, 5),
          running: Boolean(teresa.run),
          bestRunAMExponent: decimalExponent(teresa.bestRunAM),
          bestRunAM: decimalNumber(teresa.bestRunAM),
        },
        effarig: {
          relicShards: decimalNumber(effarig.relicShards),
          unlocks: bitIds(effarig.unlockBits, 0, 6),
          running: Boolean(effarig.run),
        },
        enslaved: {
          unlocks: uniqueIds(enslaved.unlocks, 0, 10),
          running: Boolean(enslaved.run),
          completed: Boolean(enslaved.completed),
          tesseracts: safeInt(enslaved.tesseracts, 10_000),
          storedRealTime: finiteNumber(enslaved.storedReal, 0),
          storedTimeExponent: decimalExponent(enslaved.stored),
          progress: bitIds(enslaved.progressBits, 0, 12),
        },
        v: {
          unlocks: bitIds(v.unlockBits, 0, 10),
          running: Boolean(v.run),
          runUnlocks: vRunUnlocks,
          spaceTheorems,
        },
        ra: {
          unlocks: bitIds(ra.unlockBits, 0, 30),
          running: Boolean(ra.run),
          pets: Object.fromEntries(["teresa", "effarig", "enslaved", "v"]
            .map(name => [name, safeInt(ra.pets?.[name]?.level, 25)])),
          petUpgrades: Object.fromEntries(["teresa", "effarig", "enslaved", "v"]
            .map(name => [name, { chunks: safeInt(ra.pets?.[name]?.chunkUpgrades), memories: safeInt(ra.pets?.[name]?.memoryUpgrades) }])),
        },
        laitela: {
          running: Boolean(laitela.run),
          difficultyTier: safeInt(laitela.difficultyTier, 8),
          singularities: decimalNumber(laitela.singularities),
          maxDarkMatter: decimalNumber(laitela.maxDarkMatter),
        },
        pelle: {
          doomed: Boolean(pelle.doomed),
          progress: bitIds(pelle.progressBits, 0, 30),
          galaxyGeneratorUnlocked: Boolean(pelle.galaxyGenerator?.unlocked),
          galaxyGeneratorPhase: safeInt(pelle.galaxyGenerator?.phase, 5),
          rifts: Object.fromEntries(["vacuum", "decay", "chaos", "recursion", "paradox"]
            .map(name => [name, decimalNumber(pelle.rifts?.[name]?.fill)])),
          riftFillLog10: Object.fromEntries(["vacuum", "decay", "recursion", "paradox"]
            .map(name => [name, decimalLog10(pelle.rifts?.[name]?.fill) ?? 0])),
        },
      },
      fullGameCompletions: safeInt(save.records?.fullGameCompletions, 1_000_000),
      continuumDisabled: Boolean(save.auto?.disableContinuum),
      alchemyAtCapCount: Array.isArray(ra.alchemy)
        ? ra.alchemy.filter(resource => finiteNumber(resource?.amount, 0) >= 25_000).length
        : 0,
      isGameEnd: Boolean(save.isGameEnd),
    };
  }

  async function analyze(text) {
    let save;
    try {
      save = JSON.parse(await decodeText(text));
    } catch (error) {
      if (error instanceof SaveError) throw error;
      fail("invalid");
    }
    return extractProfile(save);
  }

  window.AD_SAVE_ANALYZER = { analyze, extractProfile, limits: { ...LIMITS } };
})();
