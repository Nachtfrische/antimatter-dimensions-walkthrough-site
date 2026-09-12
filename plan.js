/* Planer: Ziele mit Blocker-Logik, gebuendelt zu höchstens fünf Schritten,
   abgeschnitten an der nächsten Zäsur. */
(() => {
  "use strict";

  const MAX_SICHTBAR = 5;
  const DATEN = window.EC_GUIDE_DATA;

  /* Die 15 Phasen in Spielreihenfolge. Grundlage für jeden Rangvergleich. */
  const REIHENFOLGE = [
    "preInfinity", "infinity", "earlyEternity", "eternityChallenges", "dilation",
    "reality", "teresa", "effarig", "enslaved", "v", "ra", "imaginaryMachines",
    "laitela", "pelle", "complete",
  ];

  /* Zäsuren. Nach einer davon ändert sich das Spiel so stark, dass jede Anweisung
     darüber hinaus gleichzeitig Spoiler und Falschaussage wäre. Höchstens eine je Phase.
     lohntSich darf sagen, warum es sich lohnt — aber nicht, wie es danach weitergeht. */
  const MEILENSTEINE = [
    { id: "breakInfinity", phase: "infinity", titel: "Break Infinity",
      wenn: p => !p.breakInfinity,
      lohntSich: "Die Grenze bei 1,79e308 Antimatter fällt weg." },
    { id: "ersteEternity", phase: "infinity", titel: "die erste Eternity",
      wenn: p => Boolean(p.breakInfinity),
      lohntSich: "Eine neue Währung und Time Dimensions werden verfügbar." },
    { id: "ersteEc", phase: "earlyEternity", titel: "die Eternity Challenges",
      lohntSich: "Sie schalten die stärksten Time Studies frei." },
    { id: "ecRoute", phase: "eternityChallenges", titel: "Time Dilation",
      lohntSich: "Eine eigene Spielweise mit eigener Währung öffnet sich." },
    { id: "dilation", phase: "dilation", titel: "die erste Reality",
      lohntSich: "Reality Machines und Glyphs kommen ins Spiel." },
    { id: "ersteReality", phase: "reality", titel: "die nächste Reality",
      lohntSich: "Jede Reality bringt Reality Machines und eine neue Glyphe." },
    { id: "teresa", phase: "teresa", titel: "Effarig",
      lohntSich: "Der Behälter zeigt die nächste Celestial-Freischaltung direkt an." },
    { id: "effarig", phase: "effarig", titel: "The Nameless Ones",
      lohntSich: "Effarigs zweiter Abschnitt öffnet die nächste Celestial." },
    { id: "enslaved", phase: "enslaved", titel: "V",
      lohntSich: "Der abgeschlossene Puzzle-Lauf öffnet neue Celestial-Ziele." },
    { id: "v", phase: "v", titel: "Ra",
      lohntSich: "Space Theorems schalten die nächste Celestial frei." },
    { id: "ra", phase: "ra", titel: "Imaginary Machines",
      lohntSich: "Ein größerer RM-Rekord öffnet eine weitere Maschinenwährung." },
    { id: "imaginaryMachines", phase: "imaginaryMachines", titel: "Lai'tela",
      lohntSich: "IU11 bis IU15 öffnen die nächste Celestial." },
    { id: "laitela", phase: "laitela", titel: "Pelle",
      lohntSich: "Die letzte Imaginary-Anforderung öffnet den Endgame-Lauf." },
    { id: "pelle", phase: "pelle", titel: "das Spielende",
      lohntSich: "Der Galaxy Generator macht den letzten Abschnitt messbar." },
  ];

  const hat = (liste, id) => Array.isArray(liste) && liste.includes(id);
  const anzahl = liste => (Array.isArray(liste) ? liste.length : 0);
  const zahl = wert => wert == null ? "—" : wert >= 1e12 ? Number(wert).toExponential(2).replace("e+", "e")
    : Number(wert).toLocaleString("de-DE", { maximumFractionDigits: 0 });
  const hatFreischaltung = (p, von, bis) => {
    const ids = [...(p.realityUpgradeUnlocks ?? []), ...(p.realityUpgrades ?? [])];
    return ids.some(id => id >= von && id <= bis);
  };
  const raSpaetFertig = p => {
    const pets = p.celestials?.ra?.pets ?? {};
    return ["teresa", "effarig", "enslaved", "v"].every(name => (pets[name] ?? 0) >= 25)
      && (p.celestials?.v?.spaceTheorems ?? 0) >= 66
      && (p.alchemyAtCapCount ?? 0) >= 21;
  };
  const normaleVTheoreme = p => (p.celestials?.v?.runUnlocks ?? [])
    .slice(0, 6).reduce((summe, wert) => summe + (Number(wert) || 0), 0);
  const effarigWerkzeugeFertig = p => [0, 1, 2, 3]
    .every(id => hat(p.celestials?.effarig?.unlocks, id));
  const istRealityDreiRoute = p => (p.reality ?? ((p.realities ?? 0) + 1)) >= 3
    || (p.powerGlyphs ?? 0) >= 2 || hatFreischaltung(p, 6, 15);

  function ru13NochMoeglich(p) {
    return (p.realities ?? 0) > 0 && !hat(p.realityUpgradeUnlocks, 13)
      && !hat(p.realityUpgrades, 13) && (p.timeDimensionsUnlocked ?? 0) <= 4;
  }

  function ru9NochMoeglich(p) {
    const ohneBegleiter = liste => (Array.isArray(liste) ? liste : [])
      .filter(glyph => glyph?.type !== "companion");
    const aktiv = ohneBegleiter(p.activeGlyphs);
    const inventar = ohneBegleiter(p.inventoryGlyphs);
    if (aktiv.length > 1) return false;
    if (aktiv.length === 1) return (aktiv[0]?.level ?? 0) >= 3;
    return inventar.some(glyph => (glyph?.level ?? 0) >= 3);
  }

  /* Diese IDs werden dynamisch mit Save-Werten gefüllt. Als schrittId-Einträge
     bleiben sie für den Inhalts-Kopplungstest statisch auffindbar. */
  const KONKRETE_SCHRITTE = {
    eternityCheckpoint: { schrittId: "eternityNaechstenCheckpointFarmen" },
    eternityCount: { schrittId: "eternityAnzahlFarmen" },
    ecTt: { schrittId: "ecTtFarmen" },
    ecUnlock: { schrittId: "ecAnforderungErfuellen" },
    ecRun: { schrittId: "ecLaufSpielen" },
    ecReload: { schrittId: "ecSaveNeuEinlesen" },
    dilationTt: { schrittId: "dilationTtVorbereiten" },
    dilationUnlock: { schrittId: "dilationJetztFreischalten" },
    realityRm: { schrittId: "realityRmAuf15Pushen" },
    realityReset: { schrittId: "realityResetVorbereiten" },
    realityAutoAchievements: { schrittId: "realityAutoAchievementsAusschalten" },
    realitySet: { schrittId: "realityGlyphSetBauen" },
    realityBundle: { schrittId: "realityRuBundleFreischalten" },
    realityChallenge: { schrittId: "realityLaufendeChallengeBeenden" },
    realityRuKaufen: { schrittId: "realityUpgradesJetztKaufen" },
    realityRuSparziel: { schrittId: "realityUpgradeSparziel" },
    realityPerkPfad: { schrittId: "realityPerkPfadKaufen" },
    realityFarmTt: { schrittId: "eternityNaechstenCheckpointFarmen" },
    realityDilationZyklus: { schrittId: "dilationZyklusFahren" },
    dilationTd: { schrittId: "dilationTimeDimensionOeffnen" },
    dilationEpPush: { schrittId: "dilationAufViertausendEp" },
    dilationRealityStudy: { schrittId: "dilationRealityStudyKaufen" },
  };

  const leererSchritt = (id, gruppe, zusatz = {}) => ({
    id, gruppe, zielIds: [], zielNamen: [], verbrannt: [], verbranntNamen: [], ...zusatz,
  });

  const aktion = (id, gruppe, kurz, soGehts, fertigWenn, warum) => leererSchritt(id, gruppe, {
    inhalt: { kurz, soGehts, fertigWenn, ...(warum ? { warum } : {}), falle: "", zielHandgriffe: {} },
  });
  const glyphEffekte = glyph => glyph.effectIds ?? (Array.isArray(glyph.effects) ? glyph.effects : []);
  const vorEternity = p => p.currentRun?.eternity === false
    || (p.currentRun == null && p.requirementChecks?.noEternities === true
      && !p.dilationUnlocked && !(p.totalTT > 0));

  function ersteRealityKaeufe(p) {
    const bank = p.resources?.realityMachines ?? 0;
    let rest = bank;
    const reihe = [[1,"Temporal Amplifier",1,"×3 DT"], [2,"Replicative Amplifier",1,"×3 Replicanti"],
      [4,"Superluminal Amplifier",2,"×3 Tachyon Particles"], [3,"Eternal Amplifier",2,"×3 Eternities"],
      [5,"Boundless Amplifier",3,"×5 Infinities"]];
    if (bank === 3 && !(p.realityRebuyables?.[1] > 0)) [reihe[1], reihe[2]] = [reihe[2], reihe[1]];
    const kaeufer = [];
    const kaufIds = [];
    for (const [id, name, kosten, effekt] of reihe) {
      if ((p.realityRebuyables?.[id] ?? 0) > 0 || rest < kosten) continue;
      rest -= kosten;
      kaufIds.push(id);
      kaeufer.push(`${name} (Reihe 1, Spalte ${id}) für ${kosten} RM: ${effekt}.`);
    }
    if (!kaeufer.length) return null;
    return { ...aktion("ersteRealityUpgradeReihe", "ruReiheEins", "Kauf diese noch fehlenden Start-Upgrades.",
      kaeufer, "Die genannten Upgrades sind jeweils einmal gekauft.", "Temporal liefert mehr DT für Dilation-Käufe, Replicative verkürzt den RG-Aufbau und Superluminal erhöht TP für die DT-Produktion. Diese drei verkürzen die langen Phasen der nächsten Reality. Eternal und Boundless erhöhen gezählte Eternities bzw. Infinities für ihre Anforderungen. Die Auswahl gibt nur deine vorhandenen RM aus; bei 3 RM passt DT + TP gemeinsam ins Budget."), kosten: bank - rest, kaufIds };
  }

  function ersteInfinitySchritte(p) {
    const s = [];
    const add = (titel, wie, fertig) => s.push(aktion("ersteInfinityPushen", "ersteInfinity", titel, wie, fertig));
    if ((p.dimensionBoosts ?? 0) < 4) add("Öffne mit den ersten vier Dimension Boosts alle acht Dimensionen.",
      ["Kauf eine neue Dimension, sobald sie erscheint. Nutze Buy until 10 für den Zehner-Multiplikator und kaufe Tickspeed dazu.",
        `Du hast ${p.dimensionBoosts ?? 0} Dimension Boosts. Nimm den nächsten, sobald seine Dimensions-Anforderung erfüllt ist; wiederhole bis AD8 verfügbar ist.`], "Alle acht Antimatter Dimensions sind verfügbar.");
    if ((p.galaxies ?? 0) < 1) add("Nimm die erste Antimatter-Galaxie, sobald sie verfügbar ist.",
      ["Kauf Dimensionen, Tickspeed und nötige Dimboosts. Sobald eine Galaxie verfügbar ist, hat sie Vorrang vor einem weiteren Dimboost.",
        "Nach dem fünften Dimboost Sacrifice nutzen, wenn nach einem neuen AD8-Zehnerpaket mehr als ×2 angezeigt wird."], "Du hast deine erste Antimatter-Galaxie.");
    if ((p.galaxies ?? 0) < 2) add("Baue erneut auf und kaufe die zweite Antimatter-Galaxie.",
      ["Wieder Dimensionen und Tickspeed kaufen. Eine noch ungekaufte Dimension zuerst; danach AD1, AD2, Tickspeed und die höheren Dimensionen.",
        "Sacrifice bei mehr als ×2 nach einem AD8-Paket benutzen. Die zweite Galaxie verstärkt jedes weitere Tickspeed-Upgrade."], "Zwei Antimatter-Galaxien sind gekauft.");
    add("Push auf 1,79e308 Antimatter und drücke Big Crunch.",
      ["Kauf weiter Dimensionen und Tickspeed; nutze verfügbare Dimboosts und Sacrifice. Zusätzliche Galaxien lohnen vor dem ersten Crunch normalerweise nicht mehr.", "Bei 1,79e308 Antimatter Big Crunch drücken."], "Der erste Infinity Point ist da.");
    return { phase: "preInfinity", schritte: s, hinweise: [], meilenstein: null };
  }

  // Discord-Pins: Post 5e11 IP / How to Replicanti. AM unlocks and goals:
  // official secret-formula/challenges/infinity-challenges.js.
  const IC_ROUTE = [
    { id: 1, ip: 12, unlock: 2000, goal: "e650" },
    { id: 2, ip: 45, unlock: 11000, goal: "e10500" },
    { id: 3, ip: 56, unlock: 12000, goal: "e5000" },
    { id: 4, ip: 68, unlock: 14000, goal: "e13000" },
    { id: 5, ip: 83, unlock: 18000, goal: "e16500" },
    { id: 6, ip: 102, unlock: 22500, goal: "2e22222" },
    { id: 7, ip: 114, unlock: 23000, goal: "e10000" },
    { id: 8, ip: 129, unlock: 28000, goal: "e27000" },
  ];

  function icSchritt(p, ic) {
    const laeuft = p.currentChallenge?.infinity === ic.id;
    const effekte = (p.activeGlyphs ?? []).flatMap(glyphEffekte);
    const hilfe = hat(p.perks, 30) ? "ANR verhindert die Produktions-Resets durch Dimboosts und Galaxien"
      : effekte.includes("powermult") ? "dein ausgerüsteter Power-Glyph gibt einen direkten AD-Multiplikator"
      : effekte.includes("powerpow") ? "dein ausgerüsteter Power-Glyph verstärkt die AD-Potenz" : "";
    const handgriffe = [laeuft
      ? `IC${ic.id} läuft bereits. Bleib in diesem Lauf; ein anderer Challenge-Start würde ihn abbrechen.`
      : `Starte IC${ic.id} unter Challenges → Infinity Challenges.`];
    if (hilfe) handgriffe.push(`Zuerst mit deinen normalen Autobuyern und M/Max versuchen: ${hilfe}. Ob das für den ganzen Lauf reicht, zeigt der Fortschritt.`);
    if (ic.id === 4) {
      handgriffe.push(`${hilfe ? "Nur wenn der Fortschritt stockt: " : ""}Sacrifice und AD1–7 ausschalten. AD8, Tickspeed, Dimboost und Galaxien eingeschaltet lassen; Dimboost/Galaxien auf 0 Sekunden, keine Galaxien-Grenze. M halten, bis es stockt. Lose a Dimension Boost drücken, M zwei- bis dreimal kurz drücken, dann wiederholt AD7 → AD6 → … → AD1 kaufen, bis die nächste Galaxie möglich ist.`);
    } else if (ic.id === 5) {
      handgriffe.push(`${hilfe ? "Nur wenn der normale Lauf stockt: " : ""}AD1–7-Autobuyer auf Buy Singles stellen. AD8 auf Buys until 10 lassen. Tickspeed, Dimboost und Galaxien bleiben eingeschaltet.`);
    } else if (ic.id === 7) {
      handgriffe.push("Galaxien sind hier gesperrt. Kauf Dimboosts, Dimensionen und Tickspeed; der verstärkte Dimboost-Multiplikator trägt diesen Lauf.");
    } else {
      handgriffe.push("Kauf Dimensionen und Tickspeed mit M/Max und lass Dimboosts und erlaubte Galaxien weiterlaufen.");
    }
    handgriffe.push(`Bei ${ic.goal} Antimatter Big Crunch drücken. Danach nur die für IC${ic.id} geänderten Autobuyer zurückstellen; AD1–7 wieder auf Buy until 10, falls du Buy Singles verwendet hast.`);
    const schritt = aktion("infinityChallengesAbarbeiten", "icRun",
      `${laeuft ? "Beende" : "Schließe"} IC${ic.id} bei ${ic.goal} Antimatter${laeuft ? "" : " ab"}.`,
      handgriffe, `IC${ic.id} ist abgeschlossen und du bist wieder außerhalb der Challenge.`,
      `IC${ic.id} fehlt im aktuellen Lauf. ` + {
        1: "Die kombinierten Normal-Challenge-Regeln verlangen einen vollständigen Wiederaufbau. Die Belohnung gibt ×1,3 auf Infinity Dimensions je abgeschlossener IC; damit werden auch die folgenden ICs stärker.",
        2: "Sacrifice wird automatisch alle 400 ms ausgelöst. Der Abschluss verbessert Sacrifice dauerhaft und öffnet dessen Autobuyer; AD8-Nachkäufe halten während des Runs die Produktion am Laufen.",
        3: "Tickspeed-Käufe geben hier einen AD-Multiplikator statt normaler Geschwindigkeit. Mehr Galaxien verstärken diesen Ersatzbonus. Die Belohnung behält einen entsprechenden Bonus auch außerhalb der IC.",
        4: "Nur die zuletzt gekaufte Dimension produziert ungebremst. Die Folge AD7 → AD1 reicht die Produktion von oben nach unten weiter; starke Glyph-Boni können diese Handarbeit überflüssig machen. Der Abschluss potenziert alle AD-Multiplikatoren mit 1,05.",
        5: "Dimensionskäufe verteuern andere Dimensionen mit. Einzelkäufe verhindern unnötige Kaufblöcke, während AD8 weiter Zehnerpakete bekommt. Die Belohnung stärkt Galaxien um 10 % und senkt Galaxien-/Dimboost-Anforderungen.",
        6: "Matter wächst exponentiell und teilt deine AD-Multiplikatoren. Weiterer Produktionsausbau muss diesen Verlust überholen. Der Abschluss verstärkt Infinity Dimensions anhand von Tickspeed.",
        7: "Galaxien sind gesperrt, dafür ist der Dimboost-Multiplikator stark erhöht. Deshalb tragen hier Boosts und Tickspeed den Run. Danach steigt der Basis-Dimboost-Multiplikator auf mindestens ×4.",
        8: "Die Produktion fällt laufend ab und wird durch Dimensions-/Tickspeed-Käufe aufgefrischt. Deshalb regelmäßig weiterkaufen. Die Belohnung verstärkt AD2–7 anhand der Multiplikatoren von AD1 und AD8.",
      }[ic.id]);
    const zeit = { 2: "bis etwa 5 Minuten", 3: "bis etwa 1 Stunde", 4: "etwa 10–20 Minuten mit der beschriebenen manuellen Kaufstrategie" }[ic.id];
    if (zeit) schritt.inhalt.communityZeit = `Pins: ${zeit} beim ersten Durchlauf und den empfohlenen IP-Werten. Mit späteren Upgrades/Glyphs oft deutlich kürzer; keine Restzeit-Prognose.`;
    return schritt;
  }

  function konkreteInfinity(p, ipZiel = 308, ohneRg = false) {
    const schritte = [];
    const lauf = p.currentChallenge ?? {};
    const c8 = "Fünf Dimboosts kaufen, bei etwa e44 Antimatter opfern, bei e54–e59 erneut. Danach jeweils bei ×2 Sacrifice opfern; der Multiplikator wächst hier besonders schnell.";
    const normalTipps = {
      2: "Jeder Kauf setzt die Produktion zurück; sie erholt sich innerhalb von drei Minuten. Nach einem Kaufblock warten, wenn Max allein nicht weiterkommt.",
      3: "Der AD1-Multiplikator wächst mit der Laufzeit. Bei stockendem Fortschritt wachsen lassen; Dimboosts und Galaxien starten seinen Aufbau neu.",
      4: "Höhere Dimensionen löschen die Menge der niedrigeren. Erst oben kaufen, danach die unteren Dimensionen wieder auffüllen.",
      5: "Tickspeed wirkt hier anders und stärker. Tickspeed mitkaufen und weiter Galaxien nehmen.",
      6: "Ab AD3 kosten Dimensionen die jeweils zwei Stufen darunter. Kauf die gesamte Kette nach; M/Max nimmt diese Käufe mit.",
      7: "Buy-10 startet ohne Multiplikator. Jeder Dimboost erhöht ihn; deshalb verfügbare Dimboosts kaufen.",
      8: c8,
      9: "Käufe verteuern auch andere Dimensionen und Tickspeed mit derselben Kostenstufe. Mit dem AD1-Upgrade für ungenutzte IP und viel IP im Vorrat zuerst M/Max versuchen. Falls du festhängst, mehr IP außerhalb der Challenge farmen und erneut versuchen.",
      10: "Du hast nur sechs Dimensionen. Galaxien brauchen AD6; diese Kette mit M/Max ausbauen.",
      11: "Ab AD2 wächst Matter. Erreicht sie dein Antimatter, wirst du zurückgesetzt. Mit M/Max die Produktion vor Matter halten; bei wiederholten Rücksetzungen außerhalb stärker werden.",
      12: "Dimensionen produzieren jeweils zwei Stufen darunter. AD1 und AD2 produzieren beide Antimatter: beide Produktionsketten mitkaufen.",
    };
    if (lauf.normal) {
      schritte.push(aktion("normalChallengesAbarbeiten", "normalRun",
        `Beende zuerst die laufende Challenge ${lauf.normal}.`,
        [`Bleib in Challenge ${lauf.normal} und spiele bis zum dort angezeigten Big-Crunch-Ziel.`,
          normalTipps[lauf.normal] ?? "Kauf Dimensionen und Tickspeed mit M/Max; nimm verfügbare Galaxien und Dimboosts.",
          "Starte vorher keine andere Challenge. Stell danach die nur für diesen Lauf geänderten Autobuyer zurück."],
        `Challenge ${lauf.normal} ist abgeschlossen.`));
    }
    if (!p.breakInfinity) {
      if (!(p.currentRun?.infinity ?? p.infinityUnlocked)) {
        schritte.push(leererSchritt("ersteInfinityPushen", "ersteInfinity"));
      }
      if (Array.isArray(p.infinityUpgrades) && !hat(p.infinityUpgrades, "galaxyBoost") && !lauf.normal) {
        schritte.push(aktion("normalChallengesAbarbeiten", "c8Farm", "Farme die ersten IP in Challenge 8 bis zum Galaxien-Upgrade.",
          ["Kauf zuerst den Multiplikator nach gespielter Zeit für 1 IP. Wiederhole dann C8 für die nächsten IP.", c8,
            "Zwischen den Läufen die fehlenden 1-IP-Upgrades kaufen: Buy-10-Multiplikator, die Dimensions-Multiplikatoren und die um neun gesenkten Reset-Anforderungen. Danach das Upgrade für doppelt so starke Galaxien für 2 IP kaufen."],
          "Das Upgrade für doppelt so starke Galaxien ist gekauft."));
      }
      if ((p.infinityUpgradeCount ?? 0) < 16) schritte.push(leererSchritt("infinityUpgradesKaufen", "infinityUpgrades"));
      const leichtOffen = [3,4,5,6,7,8,10,11,12].filter(id => !hat(p.normalChallenges, id) && id !== lauf.normal);
      if (leichtOffen.length) schritte.push(aktion("normalChallengesAbarbeiten", "normalChallenges",
        `Hol die fehlenden Autobuyer aus ${leichtOffen.map(id => "C" + id).join(", ")}.`,
        ["Nach der dritten Spalte der Infinity Upgrades die folgenden Challenges einzeln bis Big Crunch spielen. C12 bringt den Crunch-Autobuyer; C2 und C9 dürfen bis nach Break Infinity warten.",
          ...leichtOffen.map(id => `C${id}: ${normalTipps[id]}`)],
        "Diese Challenges sind abgeschlossen; ihre Autobuyer stehen zur Verfügung."));
      schritte.push(leererSchritt("crunchAutobuyerMaximieren", "crunchAutobuyer"));
      if (p.breakInfinityReady) schritte.at(-1).inhalt = {
        kurz: "Aktiviere Break Infinity; der Crunch-Autobuyer ist bereits schnell genug.",
        soGehts: ["Öffne Infinity → Break Infinity und drücke Break Infinity."],
        fertigWenn: "Break Infinity ist aktiviert." };
      return { phase: "infinity", schritte, hinweise: [], meilenstein: MEILENSTEINE[0] };
    }
    const ip = p.resources?.infinityPointsExponent ?? 0;
    const maxAm = p.resources?.maxAntimatterExponent ?? p.resources?.antimatterExponent ?? 0;
    const autoIc = (p.resources?.eternities ?? 0) >= 7;
    const offen = autoIc ? [] : IC_ROUTE.filter(ic => !hat(p.infinityChallenges, ic.id));
    const aktuell = IC_ROUTE.find(ic => ic.id === lauf.infinity);
    if (aktuell) schritte.push(icSchritt(p, aktuell));
    if (autoIc && !aktuell && !lauf.normal && ip < ipZiel) {
      schritte.push(aktion("breakInfinityAusbauen", "ipAufbau",
        (p.resources?.antimatterExponent ?? 0) <= 1 ? "Starte bei 10 AM mit der ersten Antimatter Dimension." : "Baue deine IP bis zur ersten manuellen Eternity auf.",
        [(p.resources?.antimatterExponent ?? 0) <= 1
          ? "Dimensions → Antimatter Dimensions: Kauf zuerst eine einzelne AD1 für 10 AM. Sobald Antimatter wächst, M/Max All für Dimensionen und Tickspeed benutzen."
          : "Dimensions → Antimatter Dimensions: Kauf Dimensionen und Tickspeed mit M/Max All weiter.",
          "Automation → Autobuyers: AD1–8, Tickspeed, Sacrifice, Dimboost und Galaxien einschalten. Dimboost-Begrenzung ausschalten; Galaxien unbeschränkt und Buy max auf 0 Sekunden stellen, sofern kein offenes Upgrade-Ziel die Galaxien begrenzt.",
          "Kauf verfügbare Dimboosts und Antimatter-Galaxien. Drück bei 1,79e308 AM Big Crunch und baue danach weiter auf. Crunch erneut, sobald der IP-Gewinn den nächsten ID- oder IP-Multiplikator-Kauf ermöglicht; für einen AM-Push den Crunch-Autobuyer aus lassen.",
          "Infinity Dimensions und ihre Autobuyer einschalten bzw. mitkaufen. Deine Eternity-Milestones öffnen IDs und erledigen Infinity Challenges automatisch an ihren AM-Schwellen. Dafür keine ICs von Hand starten.",
          ohneRg ? "Replicanti-Upgrades für Chance und Intervall sind erlaubt. Auto Galaxy bleibt bis zur ersten manuellen Eternity aus; keine Replicanti-Galaxie kaufen."
            : "Replicanti-Upgrades mitkaufen und verfügbare Replicanti-Galaxien nutzen."],
        `Der Eternity-Knopf ist bei ${ipZiel === 308 ? "1,79e308" : "e" + ipZiel} IP verfügbar. Noch vor dem Klick den nächsten Schritt beachten.`,
        "Eternity-Milestones geben dir Automation, aber keine EP zum Ausgeben. Die Produktion muss nach dem Reality-Reset zuerst wieder anlaufen."));
    }
    if (!autoIc && !aktuell && !lauf.normal && ip < 12 && !hat(p.infinityChallenges, 1)) {
      const fehlt = ["totalMult", "currentMult", "infinitiedMult", "achievementMult", "challengeMult"].filter(id => !hat(p.infinityUpgrades, id));
      if (fehlt.length) schritte.push(aktion("breakInfinityAusbauen", "breakKaeufe", "Baue die ersten Break-Upgrades mit kurzen IP-Läufen aus.",
        ["Dimboost-Autobuyer für kurze IP-Farmen ausschalten. Im Crunch-Knopf den IP-Wert beim höchsten IP/min ablesen und als Crunch-Ziel setzen; nach Käufen neu anpassen.",
          "Noch fehlende Käufe, in dieser Reihenfolge: " + [["totalMult","AD-Multiplikator aus gesamtem Antimatter, 1e4 IP"], ["currentMult","aus aktuellem Antimatter, 5e4 IP"], ["infinitiedMult","aus Infinities, 1e5 IP"], ["achievementMult","aus Achievements, 1e6 IP"], ["challengeMult","aus Challenge-Zeiten, 1e7 IP"]].filter(([id]) => fehlt.includes(id)).map(([, text]) => text).join("; ") + ".",
          "Bezahlbare IP-Multiplikatoren und die Senkung der Tickspeed-Kostenskalierung mitnehmen. Danach für ID1 sparen."], "Die genannten Break-Upgrades sind gekauft."));
      if ((p.infinityDimensionsUnlocked ?? 0) < 1) {
        schritte.push(aktion("breakInfinityAusbauen", "idFreischalten", "Spare 1e8 IP und push auf e1100 Antimatter für ID1.",
        ["Für diesen längeren Push Dimboosts und Sacrifice wieder einschalten; den Crunch-Autobuyer ausschalten, damit er nicht am kurzen Farm-Ziel abbricht.", "Bei e1100 Antimatter ID1 freischalten und das erste Zehnerpaket für 1e8 IP kaufen. Danach kurze IP-Läufe mit dem neuen Infinity-Power-Bonus farmen."], "ID1 ist gekauft und erzeugt Infinity Power."));
        schritte.at(-1).inhalt.communityZeit = "Pins: ungefähr 30 Minuten für den Push auf e1100 Antimatter im ersten Durchlauf, mit den davor empfohlenen Break-Upgrades. Spätere Reality-Boni können ihn stark verkürzen.";
      }
      if ((p.infinityDimensionsUnlocked ?? 0) < 2) {
        schritte.push(aktion("breakInfinityAusbauen", "idFreischalten", "Push mit ID1 weiter auf e1900 Antimatter für ID2.",
        ["Infinity Dimensions nachkaufen. Für den langen Push Dimboosts, Galaxien und Sacrifice nutzen; den Crunch-Autobuyer auslassen.", "Die Galaxie um e1800 hilft über den letzten Abschnitt. Bei e1900 ID2 freischalten und kaufen; anschließend den Crunch-Autobuyer wieder auf den neuen IP/min-Höchstwert stellen."], "ID2 ist freigeschaltet und gekauft."));
        schritte.at(-1).inhalt.communityZeit = "Pins: ungefähr 2–4 Stunden für den ersten ID2-Push. Die Galaxie um e1800 Antimatter bringt den großen Schub. Mit Reality-Boni oft deutlich schneller.";
      }
      if (!hat(p.infinityUpgrades, "autobuyMaxDimboosts")) schritte.push(aktion("breakInfinityAusbauen", "bulkBoost", "Spare 5e9 IP für den Buy-max-Modus der Dimboosts.",
        ["Kurze IP-Läufe farmen und den IP/min-Höchstwert nach Upgrades neu bestimmen.", "Das Break-Upgrade für Buy max Dimension Boosts für 5e9 IP kaufen. Dimboost-Autobuyer auf Buy max umstellen und wieder einschalten."], "Buy max für Dimboosts ist aktiv."));
      if (!hat(p.infinityUpgrades, "postGalaxy")) schritte.push(aktion("breakInfinityAusbauen", "galaxyBoost", "Kauf für 5e11 IP die um 50 % stärkeren Galaxien.",
        ["Mit Buy-max-Dimboosts IP farmen und das Break-Upgrade für 50 % stärkere Galaxien kaufen. Danach ist IC1 der nächste Challenge-Lauf."], "Das Galaxien-Upgrade für 5e11 IP ist gekauft."));
    }
    const normalOffen = Array.from({ length: 11 }, (_, i) => i + 2).filter(id => !hat(p.normalChallenges, id) && id !== lauf.normal);
    if (!aktuell && normalOffen.length && (hat(p.infinityUpgrades, "challengeMult") || ip >= 7)) schritte.splice(lauf.normal ? 1 : 0, 0,
      aktion("normalChallengesAbarbeiten", "normalRest", `Schließe die noch offenen ${normalOffen.map(id => "C" + id).join(", ")} ab.`,
        ["Mit den Break-Multiplikatoren und IP im Vorrat sind diese Läufe jetzt leichter. Einzeln starten, M/Max benutzen und bis Big Crunch spielen.",
          ...normalOffen.map(id => `C${id}: ${normalTipps[id]}`), "Danach schnelle Wiederholungen für den Challenge-Zeit-Multiplikator: Redo Challenges an, Crunch-Autobuyer an, Galaxien auf 1 und Dimboosts auf 1–2 begrenzen. Max halten; anschließend die Farm-Einstellungen wiederherstellen."],
        "Alle Normal Challenges sind abgeschlossen und ihre Zeiten verkürzt."));
    for (const ic of offen.filter(ic => ic.id !== lauf.infinity)) {
      const verfuegbar = hat(p.achievementIds, 133) || (p.infinityChallengesUnlocked ?? 0) >= ic.id || maxAm >= ic.unlock;
      const starkeBoni = hat(p.perks, 30) || (p.activeGlyphs ?? []).some(g => glyphEffekte(g).includes("powermult"));
      if (!verfuegbar || (ip < ic.ip && !starkeBoni)) {
        schritte.push(aktion("breakInfinityAusbauen", "ipFarm",
          `Push für IC${ic.id} auf etwa e${ic.ip} IP${verfuegbar ? "" : ` und e${ic.unlock} Antimatter`}.`,
          ["Kauf verfügbare Infinity Dimensions und die bezahlbaren Break-Infinity-Upgrades." + (ic.id === 1 ? " Vor IC1 zuerst das Upgrade für 50 % stärkere Galaxien für 5e11 IP kaufen." : " Für die Antimatter-Freischaltung den Crunch-Autobuyer ausschalten und einen längeren Lauf mit Dimboosts, Galaxien und Sacrifice spielen."),
            `Die IP-Marke ist der Richtwert für einen ersten Durchlauf. ${p.realities > 0 ? "Mit deinen Reality-Boni darfst du IC" + ic.id + " früher versuchen, sobald sie freigeschaltet ist." : "Wechsle zwischen kurzen IP-Läufen und einem längeren Push für die nächste Freischaltung."}`],
          `IC${ic.id} ist freigeschaltet und du kannst den Lauf versuchen.`,
          `IC${ic.id} braucht e${ic.unlock} Antimatter für die Freischaltung. Die Marke e${ic.ip} IP ist dagegen ein Erfahrungswert für genug Produktionsstärke im ersten Versuch, keine zusätzliche Eintrittsbedingung. Infinity Dimensions erzeugen stärkende Infinity Power; Break-Upgrades verstärken die AD-Kette für diesen AM-Push. Mit starken Reality-Boni kann der Versuch früher gelingen.`));
      }
      schritte.push(icSchritt(p, ic));
      if (schritte.length >= MAX_SICHTBAR) break;
    }
    if (!p.replicantiUnlocked) schritte.push(aktion("replicantiFreischalten", "replicanti",
      "Schalte bei e140 IP Replicanti frei.",
      ["Kauf ID5 und anschließend die Replicanti-Freischaltung.",
        ohneRg ? "Kauf Chance und Intervall. Auto Galaxy bleibt aus; für das laufende Upgrade-Ziel darfst du keine Replicanti-Galaxie kaufen."
          : "Kauf Chance und Intervall. Ab etwa e200 IP lohnen Läufe mit einer Replicanti-Galaxie."],
      "Replicanti ist freigeschaltet und wächst."));
    schritte.push(aktion("ersteEternityErreichen", "eternityAbschluss",
      `${ip >= ipZiel ? "Löse jetzt" : "Erreiche " + (ipZiel === 308 ? "1,79e308" : "e" + ipZiel) + " IP und löse"} die Eternity von Hand aus.`,
      ["Kauf die verfügbaren Infinity Dimensions und IP-Upgrades. Entscheidend ist der verfügbare Eternity-Knopf nach Erreichen der IP-Marke.",
        ohneRg ? "Replicanti Auto Galaxy und Eternity-Autobuyer bleiben aus. Push ohne Replicanti-Galaxien bis zur IP-Marke."
          : "Lass Replicanti bis zur nächsten Galaxie wachsen. Nach r95 bleiben Replicanti beim Crunch erhalten.",
        `Bei ${ipZiel === 308 ? "1,79e308" : "e" + ipZiel} IP den Eternity-Knopf von Hand drücken.`],
      "Die manuelle Eternity ist abgeschlossen."));
    return { phase: "infinity", schritte, hinweise: [], meilenstein: MEILENSTEINE[1] };
  }

  function realityVorEternity(p) {
    const schritte = [];
    const startKauf = ersteRealityKaeufe(p);
    if (startKauf) {
      schritte.push(startKauf);
      p = { ...p, resources: { ...p.resources, realityMachines: (p.resources?.realityMachines ?? 0) - startKauf.kosten },
        realityRebuyables: { ...p.realityRebuyables, ...Object.fromEntries(startKauf.kaufIds.map(id => [id, 1])) } };
    }
    const einzelGlyph = ru9GlyphSchritt(p);
    if (einzelGlyph) {
      schritte.push(einzelGlyph);
      p = { ...p, realityRequirementLocks: [...(p.realityRequirementLocks ?? []), 9] };
    }
    const kauf = ruKaufSchritt(p);
    if (kauf?.gruppe === "ruJetztKaufen" && !p.currentChallenge?.infinity && !p.currentChallenge?.normal) {
      schritte.push(kauf);
      // Prolong immediately grants Eternities. Replan after that purchase.
      if (kauf.kaufIds.includes(10)) return { phase: "reality", schritte, hinweise: [], meilenstein: MEILENSTEINE[5] };
      p = { ...p, realityUpgrades: [...(p.realityUpgrades ?? []), ...kauf.kaufIds] };
    }
    const set = !einzelGlyph && glyphAuffuellenSchritt(p);
    if (set) schritte.push(set);
    const perk = perkSchritt(p);
    if (perk) schritte.push(perk);
    const ziele = istRealityDreiRoute(p)
      ? ZIELE.filter(z => ["realityRequirements", "realityEpSchwellen", "realityGlyphSchwelle"].includes(z.gruppe)
        && !z.istErledigt(p) && z.istNochMoeglich(p)) : [];
    const ids = ziele.map(z => Number(z.id.slice(2)));
    if (ids.length) {
      const schutz = ids.filter(id => !hat(p.realityRequirementLocks, id));
      const handgriffe = [];
      if (schutz.length) handgriffe.push("Jetzt Reality → Upgrades: Shift gedrückt halten und die offenen Schlösser bei "
        + schutz.map(id => ruName(id, true)).join("; ") + " einmal anklicken. Danach Shift loslassen. Das setzt nur die kostenlose Sperre; es kauft kein Upgrade.");
      const geschuetzt = ids.filter(id => hat(p.realityRequirementLocks, id));
      if (geschuetzt.length) handgriffe.push("Bereits gesperrt: " + geschuetzt.map(id => ruName(id, true)).join("; ")
        + ". Diese Schlösser nicht erneut anklicken, sonst schaltest du sie aus.");
      if (ids.includes(8)) handgriffe.push("Auto Achievements ausgeschaltet lassen; selbst erspielte Achievements sind erlaubt.");
      if (ids.includes(6)) handgriffe.push(`${ruName(6, true)}: Beim ersten manuellen Eternity-Klick ohne Replicanti-Galaxie sichern. Replicanti Auto Galaxy ausschalten. Danach sind RGs erlaubt; den Kauf für 15 RM zurückstellen, solange die folgenden Hauptziele RM brauchen.`);
      if (ids.includes(7)) handgriffe.push("Vor dem ersten Big Crunch höchstens eine Antimatter-Galaxie kaufen.");
      if (ids.includes(15)) handgriffe.push(`${ruName(15, true)}: Später bis e10 EP ohne Multiply Eternity Points by 5 spielen und eternitieren. Den ×5-EP-Autobuyer bis dahin aus lassen. Sobald ohne Shift Cost: steht, sind ×5-EP-Käufe erlaubt. Den Upgrade-Kauf für 50 RM erst später finanzieren.`);
      if (ids.includes(12)) handgriffe.push(`${ruName(12, true)}: Danach bis e70 EP ohne EC1-Abschluss spielen und eternitieren; anschließend für 50 RM kaufen. Bis dahin keine EC1 starten. Der EP-Multiplikator hilft beim weiteren Lauf.`);
      if (ids.includes(9)) handgriffe.push(`${ruName(9, true)}: Mit dem einen Level-3+-Glyph bis e4000 EP spielen und eternitieren; anschließend für 15 RM kaufen und die zusätzlichen Glyphs aus dem Inventar ausrüsten.`);
      if (ids.includes(13)) handgriffe.push(`${ruName(13, true)}: Bis zur Eternity bei e4000 EP keine TD5–8 kaufen. Danach bleibt die Bedingung gespeichert; der Kauf kostet 50 RM.`);
      const reserve = (ids.includes(12) ? 50 : 0) + (ids.includes(9) ? 15 : 0);
      const rm = p.resources?.realityMachines ?? 0;
      if (reserve) handgriffe.push(`RM jetzt: ${zahl(rm)} auf Lager. ${reserve <= rm ? `${zahl(reserve)} RM reservieren` : `Auf ${zahl(reserve)} RM für die Hauptziele sparen`} für ${[ids.includes(12) ? "The Knowing Existence (50 RM)" : "", ids.includes(9) ? "Linguistically Expand (15 RM)" : ""].filter(Boolean).join(" und ")}. ${reserve <= rm ? `Danach bleiben ${zahl(rm - reserve)} RM.` : "Die Bedingungen kannst du trotzdem jetzt sichern."} Deshalb diese RM vorerst nicht für weitere Amplifier-Stufen oder das Black Hole ausgeben.`);
      const erledigt = [7,8,10,13].filter(id => hat(p.realityUpgrades, id));
      if (erledigt.length) handgriffe.push("Schon gekauft: " + erledigt.map(id => ruName(id)).join(", ")
        + ". Deren Bedingungen musst du nicht wiederholen. Alte Sperren dieser Upgrades blockieren nichts mehr.");
      handgriffe.push("Eternity-Autobuyer bis zum ersten manuellen Abschluss aus lassen. Die folgenden Schritte starten zuerst deine AM-/IP-Produktion; die EP-Ziele oben kommen danach.");
      schritte.push(aktion("realityRequirementsSammeln", "realitySchutz",
        "Lege die Ziele und RM-Ausgaben für diese Reality fest.", handgriffe,
        "Die genannten Sperren sind gesetzt und die RM reserviert. Die späteren EP-Ziele müssen jetzt noch nicht erreicht sein."));
      schritte.at(-1).inhalt.warumDetails = ids.map(ruGrund);
    }
    const kern = konkreteInfinity(p, ids.includes(10) ? 400 : 308, ids.includes(6));
    if (ids.includes(7)) {
      const erste = kern.schritte.find(s => s.gruppe === "ersteInfinity");
      if (erste) erste.inhalt = { soGehts: ["Kauf Dimensionen und Tickspeed mit M/Max, Dimboosts und höchstens eine Antimatter-Galaxie.",
        "Das Requirement Lock für Innumerably Construct schützt die Galaxien-Grenze. Mit deinen Reality-Boni bis 1,79e308 Antimatter pushen und Big Crunch drücken."],
        fertigWenn: "Der erste Big Crunch ist mit höchstens einer Antimatter-Galaxie abgeschlossen." };
    }
    const abschluss = kern.schritte.find(s => s.gruppe === "eternityAbschluss");
    if (abschluss && ids.includes(6)) abschluss.inhalt.soGehts.push(
      `Nach diesem Klick zeigt ${ruName(6, true)} ohne Shift Cost:. Dann Auto Galaxy wieder einschalten. Den Kauf für 15 RM gemäß dem RM-Plan zurückstellen.`,
      "Jetzt hast du EP. Kauf zuerst TD1, dann weitere bezahlbare TD1–4 und AM-/IP-/EP-Theorems. Importiere den neuen Save für den passenden EP-Tree; der ×5-EP-Kauf bleibt gesperrt, falls The Paradoxical Forever noch offen ist.");
    if (abschluss && ids.includes(8) && (p.resources?.infinityPointsExponent ?? 0) < (ids.includes(10) ? 400 : 308)) {
      abschluss.fehlendeAchievements = [71, 23, 28, 85, 95, 93].filter(id => !hat(p.achievementIds, id));
      abschluss.spaetereAchievements = [35, 43, 87].filter(id => !hat(p.achievementIds, id));
    }
    schritte.push(...kern.schritte);
    return { ...kern, phase: "reality", schritte, meilenstein: MEILENSTEINE[5] };
  }

  const baumKosten = tree => String(tree).split("|")[0].split(",")
    .reduce((sum, id) => sum + (DATEN.studyCosts[id] ?? 0), 0);
  const studyBudget = p => Math.max(0, Math.floor(p.dilationUnlocked && p.studies && p.unspentTT != null
    ? p.unspentTT + p.studies.reduce((sum, id) => sum + (DATEN.studyCosts[id] ?? 0), 0)
      + (DATEN.nodeCosts[p.currentChallenge?.eternityUnlocked] ?? 0)
    : p.totalTT ?? 0));

  function activeHandgriff(p) {
    return (hat(p.perks, 70) ? "ACT hält die Active-Multiplikatoren maximal. "
      : "Automatic Eternity auf „Eternity at X EP“ mit 0 stellen; Dynamic amount und Time-Study-Respec ausschalten. Einschalten und zehn kurze Eternities abwarten (im Schnitt höchstens fünf reale Sekunden, TS121 zeigt ×50 EP). ")
      + "Danach Eternity-Autobuyer für den Push ausschalten. "
      + (hat(p.achievementIds, 138) ? "Dank r138 automatische Replicanti-Galaxien eingeschaltet lassen."
        : "Replicanti-Galaxien mit R kaufen (R halten → H → R loslassen → Escape).");
  }

  function epFarmAufbau(p, zielTT) {
    const budget = studyBudget(p);
    const tree = DATEN.planFarmTree(null, budget, p.clears, p.perks, p.achievementIds);
    const jetztStudies = new Set(tree?.split("|")[0].split(",").map(Number) ?? []);
    const pfadNamen = { 71: "Antimatter Dimensions", 72: "Infinity Dimensions", 73: "Time Dimensions",
      121: "Active", 122: "Passive", 123: "Idle" };
    const pfadWechsel = [[71, 72, 73], [121, 122, 123]].flatMap(ids => {
      const alt = ids.find(id => hat(p.studies, id));
      const neu = ids.find(id => jetztStudies.has(id));
      return alt && neu && alt !== neu ? [`${pfadNamen[alt]} → ${pfadNamen[neu]}`] : [];
    });
    const baeume = tree ? [{ bezeichnung: `Jetzt: EP-Farm-Tree · ${baumKosten(tree)} TT`, importString: tree }] : [];
    const upgrades = DATEN.epFarmStages(p.clears, p.perks, p.achievementIds).filter(stage => stage.tt > budget && stage.tt <= zielTT);
    // Gleich teure Varianten sind dieselbe Etappe, zuletzt steht die bevorzugte.
    const etappen = [...new Map(upgrades.map(stage => [stage.tt, stage])).values()];
    const studies = new Set([tree, ...etappen.map(stage => stage.tree)].filter(Boolean)
      .flatMap(tree => tree.split("|")[0].split(",").map(Number)));
    for (const stage of etappen) baeume.push({ bezeichnung: `Ab ${zahl(stage.tt)} TT: auf diesen EP-Farm-Tree wechseln`,
      importString: stage.tree, abTT: stage.tt });
    const kurzFarmen = (p.resources?.eternities ?? 0) >= 100 && budget < 66;
    const peak = p.peakEPGain > 0 && p.peakEPGain < Number.MAX_VALUE
      ? Number(p.peakEPGain).toExponential(2).replace("e+", "e") : null;
    const autoFarm = kurzFarmen ? `EP-Farmen lassen: Automatic Eternity → „Eternity at X EP“, ${peak
      ? `${peak} EP als Startwert (gespeicherter EP/min-Peak)`
      : "EP-Betrag hinter „Peak … at … EP“ am Eternity-Knopf eintragen"}. „Dynamic amount“ und Time-Study-Respec ausschalten, Eternity-Autobuyer einschalten. Bei ${zahl(zielTT)} TT stoppen und den Save neu einlesen. Nach Käufen oder Tree-Wechsel den Peak neu ablesen; für längere Pushes den Autobuyer ausschalten.` : null;
    return { baeume, soGehts: [
      ...(pfadWechsel.length ? [`Dein gespeicherter Studienpfad muss für diese EP-Farm gewechselt werden: ${pfadWechsel.join("; ")}. Den Wechsel mit dem folgenden Respec durchführen.`] : []),
      tree ? "Außerhalb einer Challenge Time Studies respecen, eternitieren und den mit Jetzt bezeichneten EP-Farm-Tree laden."
        : "Kauf die ersten AM- und IP-Theorems und beginne mit TS11. Die folgenden Bäume erst an ihrer TT-Marke laden.",
      ...(etappen.length ? [`Unterwegs bei ${etappen.map(stage => zahl(stage.tt)).join(", ")} TT auf den jeweils angegebenen Baum wechseln: Respec aktivieren, eternitieren, importieren.`] : []),
      ...(DATEN.usePassiveFarm(p.perks, p.achievementIds) && studies.has(122) ? ["Mit PASS den angegebenen Passive-Tree als Komfort-Fallback verwenden, solange r138 fehlt; dafür keine kurzen Eternities für TS121 vorbereiten. Replicanti-Galaxien automatisch kaufen lassen, sobald der RG-Autobuyer verfügbar ist; sonst mit R kaufen."] : []),
      ...(studies.has(121) ? [`Ab dem Baum mit TS121: ${activeHandgriff(p)}`] : []),
      ...(studies.has(181) ? ["Ohne TS181 nach vollen Replicanti-Galaxien crunchen. Sobald TS181 im Baum steht: Crunch-Autobuyer ausschalten, Dimboost/Galaxy unbeschränkt auf 0 s, Eternity-Autobuyer für den Push aus."]
        : studies.has(61) ? ["Nach vollen Replicanti-Galaxien crunchen; Eternity-Autobuyer für den abschließenden EP-Push ausschalten."] : []),
      ...(autoFarm ? [autoFarm] : []),
      `Time Dimensions und ×5 EP weiterkaufen; AM-, IP- und EP-Theorems bis ${zahl(zielTT)} Gesamt-TT sammeln.`,
    ] };
  }

  function konkreteFrueheEternity(p) {
    const aktuell = Math.max(0, Math.floor(p.totalTT ?? 0));
    const checkpoints = DATEN?.earlyEternityCheckpoints ?? [];
    const naechste = checkpoints.filter(eintrag => eintrag.tt > aktuell);
    const schritte = [];
    if (aktuell < 22 && !(p.timeDimensionsUnlocked > 0) && (p.resources?.eternities ?? 0) > 0) {
      schritte.push(leererSchritt("ersteTimeTheorems", "ersteTt"));
    }
    let stand = aktuell;
    const eternities = Math.max(0, Math.floor(p.resources?.eternities ?? 0));
    let milestonesGeplant = false;
    for (const naechster of naechste) {
      if (stand >= 17 && eternities < 100 && !milestonesGeplant) {
        schritte.push(leererSchritt("eternityMilestonesErreichen", "milestones"));
        milestonesGeplant = true;
      }
      schritte.push(leererSchritt(KONKRETE_SCHRITTE.eternityCheckpoint.schrittId, "eternityCheckpoint", {
        werte: {
          standTT: stand.toLocaleString("de-DE"),
          zielTT: naechster.tt.toLocaleString("de-DE"),
          fehlendeTT: (naechster.tt - stand).toLocaleString("de-DE"),
        },
        baeume: epFarmAufbau({ ...p, totalTT: stand }, naechster.tt).baeume,
        inhalt: { soGehts: epFarmAufbau({ ...p, totalTT: stand }, naechster.tt).soGehts,
          warum: "Der erste Baum passt zu deinem jetzigen Bestand. Weitere Bäume sind mit der TT-Marke beschriftet, ab der du sie kaufen kannst." },
        baeumeSichtbar: true,
        ...(stand < 17 ? { hinweis: stand < 9 ? "Kaufe auch die AM- und IP-Theorems. Bei 9 TT auf 3 EP bei ungefähr e426 IP pushen."
          : stand < 11 ? "Bei 9 TT für 3 EP eternitieren (etwa e426 IP); davon zwei TT kaufen und auf den 11-TT-Tree respecen."
            : "Mit dem 11-TT-Tree für 4 EP bei etwa e500 IP eternitieren, dann TS51 kaufen. Für 8 EP bei e614 IP eternitieren und TS61 erreichen." } : {}),
      }));
      stand = naechster.tt;
      if (schritte.length >= MAX_SICHTBAR) break;
    }
    if (stand >= 100 && eternities < 20000 && !hat(p.perks, 72)) {
      schritte.push(leererSchritt(KONKRETE_SCHRITTE.eternityCount.schrittId, "eternityCount", {
        werte: {
          standEternities: eternities.toLocaleString("de-DE"),
          fehlendeEternities: (20000 - eternities).toLocaleString("de-DE"),
        },
      }));
    }
    return {
      phase: "earlyEternity",
      schritte: schritte.slice(0, MAX_SICHTBAR),
      meilenstein: {
        ...MEILENSTEINE.find(m => m.id === "ersteEc"),
        restSchritte: schritte.length,
      },
      hinweise: [],
    };
  }

  function konkreteEcRoute(p) {
    let stand = { ...p, clears: [...(p.clears ?? Array(12).fill(0))] };
    const schritte = [];
    if (ec1FuerUpgradeOffen(p) && p.currentChallenge?.eternity === 1) {
      schritte.push(aktion("ecAnforderungErfuellen", "ecRequirementSchutz", "Verlasse EC1 ohne Abschluss, um The Knowing Existence zu erhalten.",
        ["EC1 ist gestartet, aber noch nicht abgeschlossen. Verlasse die Challenge über Exit; ein erfolgreicher Abschluss würde die Bedingung für diese Reality verlieren.",
          "Requirement Lock für The Knowing Existence (Reihe 3, Spalte 2) aktivieren. Die folgende Route nutzt zunächst andere ECs, bis die Eternity für e70 EP geschafft ist."], "Du bist außerhalb von EC1 und ihr Abschluss ist durch das Lock gesperrt."));
      stand.currentChallenge = {};
    }
    let ergebnis;
    while (schritte.length < MAX_SICHTBAR) {
      const laufend = DATEN.route.find(lauf => lauf.ec === stand.currentChallenge?.eternity
        && lauf.tier === (stand.clears[lauf.ec - 1] ?? 0) + 1);
      const teil = ecEinzellauf(stand, laufend);
      ergebnis ??= teil;
      const laufSchritt = teil.schritte.find(s => s.gruppe === "ecRun");
      if (!laufSchritt) {
        schritte.push(...teil.schritte);
        break;
      }
      const unlock = teil.schritte.find(s => s.gruppe === "ecUnlock");
      if (unlock?.baeume.length === 1 && laufSchritt.baeume.length === 1
          && unlock.baeume[0].importString.split("|")[0] === laufSchritt.baeume[0].importString.split("|")[0]) {
        unlock.baeume[0].bezeichnung = unlock.baeume[0].bezeichnung.replace("Baum für die Freischaltbedingung", "Gemeinsamer Freischalt- und Run-Tree");
        unlock.inhalt = { ...unlock.inhalt, soGehts: (unlock.inhalt?.soGehts ?? [
          `Respecen, eternitieren, gemeinsamen Tree laden und ${unlock.werte.unlock} erreichen.`,
          `EC${unlock.werte.ec}-Knoten kaufen; die beim Tree genannten TT dafür frei lassen. Den Aufbau für den Lauf behalten.`,
        ]).map(t => t.replace(/(?:zum|auf den) Run-Tree wechseln/g, "den gemeinsamen Tree behalten")) };
        laufSchritt.baumBeibehalten = true;
        laufSchritt.baeume = [];
      }
      schritte.push({ ...laufSchritt, etappen: teil.schritte,
        baeume: teil.schritte.flatMap(s => s.baeume ?? []) });
      if (hat(p.perks, 73)) break;
      const lauf = DATEN.route.find(r => r.run === laufSchritt.werte.run);
      // This is an ordered route, not a simulated production forecast. Only
      // apply the completion and TT target the preceding steps explicitly ask for.
      stand = { ...stand, clears: [...stand.clears], totalTT: Math.max(stand.totalTT ?? 0, lauf.readyTT),
        currentChallenge: { requirementBits: (stand.currentChallenge?.requirementBits ?? 0) & ~(1 << lauf.ec) },
        studies: [], resources: { ...stand.resources }, vorschau: true };
      stand.clears[lauf.ec - 1] = lauf.tier;
    }
    if (ec1FuerUpgradeOffen(p)) {
      const erster = schritte.find(s => s.gruppe !== "ecRequirementSchutz");
      if (erster) erster.hinweis = [erster.hinweis,
        "EC1 bleibt für The Knowing Existence (Reihe 3, Spalte 2) gesperrt. Diese Challenges der Reihe nach spielen. Sobald du nach einer Eternity e70 EP besitzt: ohne Shift auf Cost: prüfen und den Plan aktualisieren; dann ist EC1 erlaubt.",
      ].filter(Boolean).join(" ");
    }
    return { ...ergebnis, schritte: schritte.slice(0, MAX_SICHTBAR) };
  }

  const ec1FuerUpgradeOffen = p => istRealityDreiRoute(p) && (p.realities ?? 0) > 0
    && !hat(p.realityUpgradeUnlocks, 12) && !hat(p.realityUpgrades, 12)
    && (p.clears?.[0] ?? 0) === 0 && (p.maxEPExponent ?? 0) < 70;

  /* Die EC8-Zeilen fuehren zwei benannte Baeume in einem Feld ("A · … : <tree>").
     app.js rendert nur reine Import-Strings, deshalb blieb der angekuendigte
     Kasten dort bisher leer. Hier wird das Feld in einzelne Baeume zerlegt und
     die Beschriftung aus der Zeile uebernommen. */
  function freischaltBaeume(lauf, p) {
    if (lauf.ec === 10) {
      // EC10 braucht EP zum Freischalten, obwohl IM Lauf nur AD wirken.
      // Der TD-Farm reserviert hier bereits die 550 TT fuer den Knoten.
      const tree = DATEN.planFarmTree(null, Math.max(studyBudget(p), lauf.readyTT) - lauf.nodeTT, p.clears, p.perks, p.achievementIds);
      return tree ? [{ bezeichnung: `EP-Tree für die Freischaltbedingung von ${lauf.run} · ${baumKosten(tree)} TT; ${lauf.nodeTT} TT frei lassen`, importString: tree }] : [];
    }
    const baeume = [];
    for (const zeile of String(lauf.farmTree ?? "").split("\n")) {
      for (const original of zeile.match(/\d{2,3}(?:,\d{2,3})*\|\d{1,2}/g) ?? []) {
        const farmTree = lauf.ec !== 6 && DATEN.usePassiveFarm(p.perks, p.achievementIds)
          ? original.replace(/\b(121|131|141)\b/g, id => Number(id) + 1) : original;
        const importString = DATEN.planRunTree({ ...lauf, importString: farmTree },
          Math.max(studyBudget(p), lauf.readyTT), p.clears, p.perks,
          { achievementIds: p.achievementIds, unlock: true, defer133: lauf.ec === 8 && !original.split("|")[0].split(",").includes("133") }).importString;
        const beschriftung = zeile.slice(0, zeile.indexOf(original)).replace(/[\s:·–-]+$/u, "").trim();
        baeume.push({
          bezeichnung: (beschriftung || `Baum für die Freischaltbedingung von ${lauf.run}`) + ` · ${baumKosten(importString)} TT; ${lauf.nodeTT} TT frei lassen`,
          importString,
        });
      }
    }
    return baeume;
  }

  function runBaeumeFuer(lauf, tree = lauf.importString) {
    return lauf.ec === 8 ? [
      { bezeichnung: `Start-Tree für ${lauf.run} · Replicanti zuerst`, importString: tree.split("|")[0].split(",").filter(id => Number(id) < 133).join(",") + "|8" },
      { bezeichnung: `Erst bei vollen Replicanti/RGs: restlicher Run-Tree für ${lauf.run}`, importString: tree },
    ] : [{ bezeichnung: `Run-Tree für ${lauf.run}`, importString: tree }];
  }

  function ecEinzellauf(p, prioritaet = null) {
    const clears = p.clears ?? [];
    const clearsGesamt = clears.reduce((summe, wert) => summe + Math.min(5, Number(wert) || 0), 0);
    const restLaeufe = Math.max(0, 60 - clearsGesamt);
    const meilenstein = {
      ...MEILENSTEINE.find(m => m.id === "ecRoute"),
      restSchritte: restLaeufe,
      restEinheit: "EC-Abschluss",
      restEinheitMehrzahl: "EC-Abschlüsse",
    };

    const ec1Sperren = ec1FuerUpgradeOffen(p);
    const laufIndex = prioritaet ? DATEN.route.indexOf(prioritaet)
      : DATEN?.route?.findIndex(lauf => (clears[lauf.ec - 1] ?? 0) < lauf.tier && !(ec1Sperren && lauf.ec === 1)) ?? -1;
    const lauf = laufIndex >= 0 ? DATEN.route[laufIndex] : null;
    const row23 = ids => ids.some(id => id >= 231 && id <= 234);
    const dilrVorhanden = (p.unspentTT ?? 0) >= 5000 && row23(p.studies ?? []);
    const dilrTree = hat(p.perks, 53)
      ? DATEN.planFarmTree(null, studyBudget(p) - 5000, clears, p.perks, p.achievementIds) : null;
    const dilrBereit = hat(p.perks, 53) && (dilrVorhanden
      || (dilrTree && row23(dilrTree.split("|")[0].split(",").map(Number))));
    const dilationMoeglich = dilrBereit || ((p.totalTT ?? 0) >= 12900
      && (clears[10] ?? 0) >= 5 && (clears[11] ?? 0) >= 5);
    if (!lauf || dilationMoeglich) {
      const aktuell = Math.max(0, Math.floor(p.totalTT ?? 0));
      const bereit = aktuell >= 12900 || dilrBereit;
      const id = bereit
        ? KONKRETE_SCHRITTE.dilationUnlock.schrittId
        : KONKRETE_SCHRITTE.dilationTt.schrittId;
      return {
        phase: "eternityChallenges",
        schritte: [leererSchritt(id, "dilationUnlock", {
          werte: { fehlendeTT: Math.max(0, 12900 - aktuell).toLocaleString("de-DE") },
          baeume: dilrBereit ? dilrVorhanden ? [] : [{ bezeichnung: `Dilation vorbereiten · ${baumKosten(dilrTree)} TT; 5.000 TT frei lassen`, importString: dilrTree }]
            : epFarmAufbau(p, bereit ? aktuell : 12900).baeume,
          baeumeSichtbar: true,
          ...(!bereit ? { inhalt: { soGehts: epFarmAufbau(p, 12900).soGehts } } : {}),
          ...(dilrBereit ? { inhalt: {
            warum: "DILR entfernt die EC11-/EC12-Bedingung und die Vorgabe von 12.900 Gesamt-TT. Dein aktueller Bestand reicht bereits für einen vollständigen Dilation-Aufbau.",
            soGehts: [...(!dilrVorhanden ? ["Time Studies respecen, außerhalb einer Challenge eternitieren und den Baum unten laden. Er enthält eine Study aus 231–234 und lässt mindestens 5.000 TT frei."] : []),
              "Kauf die Dilation-Study für 5.000 freie TT.",
              "Lad jetzt den Save neu ein, um den passenden Dilation-Baum für deine verbleibenden TT zu erhalten. Erst mit diesem Baum Time Dilation starten. Die noch offenen ECs musst du für diesen Unlock nicht abarbeiten."],
          } } : {}),
        })],
        meilenstein: { ...meilenstein, restSchritte: bereit ? 0 : 1,
          restEinheit: "Schritt", restEinheitMehrzahl: "Schritte" },
        hinweise: [],
      };
    }

    const aktuell = Math.max(0, Math.floor(p.totalTT ?? 0));
    /* Der TS62-Zusatz in den Routentipps gilt nur, solange EC5 offen ist.
       planRunTree entfernt TS62 genau dann; steht EC5x1, ist der Satz falsch. */
    const tipText = (clears[4] ?? 0) > 0 || hat(p.perks, 57)
      ? String(lauf.tip).replace(/\s*Falls EC5x1 noch fehlt,[^.]*\./, "").trim()
      : lauf.tip;
    const werte = {
      run: lauf.run,
      ec: lauf.ec,
      tier: lauf.tier,
      unlock: lauf.unlock,
      goal: lauf.goal,
      readyTT: lauf.readyTT.toLocaleString("de-DE"),
      standTT: aktuell.toLocaleString("de-DE"),
      fehlendeTT: Math.max(0, lauf.readyTT - aktuell).toLocaleString("de-DE"),
      buyStep: lauf.ec === 10 ? "Nach dem Knotenkauf respecen und eternitieren; dann den AD-Run-Tree laden." : lauf.buyStep,
      tip: tipText,
      routeIndex: laufIndex + 1,
    };
    const runTreePlan = typeof DATEN.planRunTree === "function"
      ? DATEN.planRunTree(lauf, Math.max(studyBudget(p), lauf.readyTT), clears, p.perks, { achievementIds: p.achievementIds })
      : lauf.importString;
    const runTree = runTreePlan?.importString ?? runTreePlan ?? lauf.importString;
    const farm = epFarmAufbau(p, lauf.readyTT);
    const imLauf = (p.currentChallenge?.eternity ?? 0) === lauf.ec;
    const freigeschaltet = (p.currentChallenge?.eternityUnlocked ?? 0) === lauf.ec;
    const schritte = [];
    if (aktuell < lauf.readyTT && !imLauf) {
      schritte.push(leererSchritt(KONKRETE_SCHRITTE.ecTt.schrittId, "ecTt", {
        werte,
        baeume: farm.baeume,
        baeumeSichtbar: true,
        inhalt: {
          warum: "Der TT-Richtwert gilt für den folgenden Challenge-Tree. Der EP-Farm-Tree hier ist bereits mit deinem jetzigen TT-Bestand bezahlbar und enthält keinen EC-Knoten.",
          soGehts: [...farm.soGehts,
            "Erst danach auf den Run-Tree im folgenden Challenge-Schritt wechseln."],
        },
      }));
    }
    const gespeichert = Boolean((p.currentChallenge?.requirementBits ?? 0) & (1 << lauf.ec));
    if (!imLauf && !freigeschaltet && !gespeichert && !hat(p.perks, 72) && lauf.ec <= 10) {
      const n = lauf.tier - 1;
      const r = p.resources ?? {};
      const erfuellt = ((!p.vorschau && aktuell >= lauf.readyTT) || lauf.ec === 1) && [false, r.eternities >= 20000 * (n + 1), p.totalTickGained >= 1300 + 150 * n,
        p.eighthDimensionAmount >= 17300 + 1250 * n, r.infinities + (r.bankedInfinities ?? 0) >= 1e8 + 2.5e7 * n,
        p.galaxies >= 160 + 14 * n, p.replicantiGalaxies >= 40 + 5 * n,
        r.antimatterExponent >= 500000 + 300000 * n, r.infinityPointsExponent >= 4000 + 1000 * n,
        p.infinityPowerExponent >= 17500 + 2000 * n, r.eternityPointsExponent >= 100 + 20 * n][lauf.ec];
      schritte.push(leererSchritt(KONKRETE_SCHRITTE.ecUnlock.schrittId, "ecUnlock", {
        werte,
        baeume: freischaltBaeume(lauf, p),
        baeumeSichtbar: aktuell >= lauf.readyTT,
        ...(!erfuellt && lauf.ec === 1 ? { inhalt: {
          soGehts: [
            `Eternities farmen bis ${lauf.unlock}.${p.vorschau ? " Prüfe den aktuellen Zähler im Spiel." : ` Dein Save: ${zahl(r.eternities)}; es fehlen ${zahl(Math.max(0, 20000 * lauf.tier - (r.eternities ?? 0)))}.`} Außerhalb einer Challenge respecen, eternitieren und den Freischalt-Tree laden. Danach Respec AUS lassen; 30 TT für EC1 reservieren.`,
            "Eternity-Autobuyer EIN: Modus Eternity at X EP, Wert 0, Dynamic amount AUS. Globale Autobuyer, AD1–8 auf Buy max, Tickspeed, Infinity Dimensions und Time Dimensions EIN; bezahlbare TDs und Eternity-Upgrades kaufen.",
            "Crunch-Autobuyer EIN: X times highest IP auf 1e112, Dynamic amount AUS. Dimboost-Autobuyer AUS; Galaxy-Autobuyer EIN, unbeschränkt, Buy max bei 0 Sekunden. So kann die Farm ohne gehaltene Tasten laufen.",
            "Prüfe nach einigen Resets, ob der Eternity-Zähler steigt. Wenn die Farm stockt: Crunch-Faktor 1e41 ausprobieren und Dimboost auf 0,3 Sekunden einschalten; sobald wiederholt schnelle Eternities gelingen, weiterlaufen lassen. Die Dauer hängt von deiner tatsächlich gemessenen Rate ab.",
            `Bei mindestens ${lauf.unlock}: Eternity-Autobuyer AUS, EC1-Knoten für 30 TT kaufen. Dimboost und Galaxy wieder EIN/unbeschränkt auf 0 Sekunden; ${runTree.split("|")[0].split(",").includes("181") ? "mit TS181 im Run Crunch-Autobuyer AUS" : "Crunch für den EC1-Push auf X times highest IP = 1e70 stellen"}. Dann zum Run-Tree wechseln und EC1 starten; Eternity-Autobuyer im Lauf wieder EIN auf 0 EP.`,
          ],
          fertigWenn: `Mindestens ${lauf.unlock} erreicht und der EC1-Knoten gekauft.`,
        } } : {}),
        ...(!erfuellt && lauf.ec === 8 ? { inhalt: { soGehts: [
          "Respec aktivieren, eternitieren und zuerst den Freischalt-Baum A ohne TS133 laden. TT für den EC-Knoten frei halten.",
          lauf.tier === 1 ? "Replicanti und RGs aufbauen. Bei ungefähr e3590 IP TS133 und TS143 manuell dazukaufen; dabei nicht respecen."
            : "Replicanti und RGs aufbauen; danach den Freischalt-Baum B importieren, ohne Respec. TS133 wird erst beim Wechsel auf B gekauft.",
          `${lauf.unlock} erreichen und den EC8-Knoten kaufen. Erst danach auf den Start-Tree für den eigentlichen EC8-Lauf respecen.`,
        ] } } : {}),
        ...(!erfuellt && lauf.ec === 4 ? { inhalt: {
          communityZeit: "EC-Arbeitsmappe, FAQ C45: im Mittel etwa 40 Minuten für die Infinity-Freischaltbedingung mit Idle, TS32 und dem 250×-Achievement-Bonus bei Crunches über 5 Sekunden. Das ist die Farmzeit vor EC4, nicht die Challenge-Dauer; vorhandene Banked Infinities und spätere Boni verkürzen sie.",
          soGehts: [
          "Außerhalb der EC Time Studies respecen, eternitieren und den Freischalt-Baum laden. Die genannten TT für den EC4-Knoten frei lassen.",
          "Mit TS32 und dem Achievement 2 MILLION INFINITIES etwa 5,1 Sekunden lange Infinities farmen. Eternity-Autobuyer dafür ausschalten; bereits banked Infinities zählen mit. Falls das Achievement noch fehlt: erst schnelle Crunches bis über 2 Mio. Infinities spielen.",
          `${lauf.unlock} erreichen und den EC4-Knoten kaufen. Danach Crunch-Autobuyer ausschalten und zum Run-Tree wechseln.`,
        ] } } : {}),
        ...(erfuellt ? { inhalt: { kurz: `Kauf den Knoten für ${lauf.run}; die Ressourcenbedingung ist bereits erfüllt.`,
          soGehts: [`${lauf.unlock} ist im Save bereits erreicht. Kaufe jetzt den EC${lauf.ec}-Knoten, bevor du deinen Aufbau veränderst.`,
            "Falls dir der passende Pfad oder freie TT fehlen, nutze erst den Freischalt-Baum und erreiche die Bedingung dort erneut. Nach dem Knotenkauf auf den Run-Tree wechseln."],
          fertigWenn: `Der EC${lauf.ec}-Knoten ist gekauft.` } } : {}),
      }));
    }
    schritte.push(leererSchritt(KONKRETE_SCHRITTE.ecRun.schrittId, "ecRun", {
      werte,
      baeume: imLauf ? [] : runBaeumeFuer(lauf, runTree),
      baeumeSichtbar: true,
      ...(!imLauf && lauf.ec <= 10 ? { inhalt: {
        soGehts: [
          gespeichert || freigeschaltet || !hat(p.perks, 72)
            ? "Nach dem EC-Knotenkauf ist die Ressourcenbedingung für diese Stufe gespeichert. Respec aktivieren und außerhalb der Challenge eternitieren; dann den Run-Tree hier laden. Innerhalb der EC stattdessen Respec aktivieren und Exit Challenge drücken."
            : "ECR entfernt die Ressourcenbedingung. Time Studies respecen, eternitieren und den Run-Tree hier laden.",
          lauf.ec === 8 ? "Für EC8 zuerst nur den Start-Tree laden. EC8 starten, alle 50 ID-Käufe in ID1, 9 % Replicanti-Chance und die im Tipp genannten RG-Upgrades kaufen, Rest ins Intervall. Erst bei vollen Replicanti/RGs den restlichen Run-Tree importieren, ohne Respec."
            : `Challenges → Eternity Challenges: Starte EC${lauf.ec} und erreiche ${lauf.goal}.`,
          tipText,
        ],
      } } : {}),
      ...(!imLauf && lauf.ec >= 11 ? { inhalt: {
        soGehts: [
          `Nach dem TT-Farm: Time Studies respecen und außerhalb der Challenge eternitieren. Dann den Run-Tree hier laden. Für EC${lauf.ec} gilt ${lauf.ec === 11 ? "nur AD; TS72 und TS73 bleiben ungekauft" : "nur TD; TS71 und TS72 bleiben ungekauft"}.`,
          `Dieser Import endet auf |${lauf.ec} und ist für den Challenge-Wechsel bestimmt. Falls EC${lauf.ec} anschließend noch nicht läuft, im Challenges-Tab starten.`,
          `Im Lauf ${lauf.goal} erreichen und mit Eternity abschließen. ${tipText}`,
        ],
        warum: "EC11 und EC12 haben eine Pfadbedingung statt eines Ressourcen-Farmziels. Der Respec und der passende Run-Tree erfüllen diese Bedingung; zum EP-Farmen dient der separate |0-Tree.",
      } } : {}),
      ...(imLauf ? { inhalt: {
        kurz: `Beende den laufenden ${lauf.run} bei ${lauf.goal}.`,
        soGehts: [`${lauf.run} läuft bereits. Starte keine andere Challenge und respec nicht; damit würdest du den Lauf zurücksetzen.`,
          `Erreiche ${lauf.goal} und schließe die Challenge mit Eternity ab.`, tipText],
      } } : {}),
      ...(hat(p.perks, 73) ? { hinweis: "ECB ist gekauft: Der Lauf kann mehrere Stufen abschließen. Spiel bis zum nächsten erreichbaren Ziel; danach den Save neu einlesen, damit übersprungene Stufen nicht nochmals geplant werden." } : {}),
    }));
    return {
      phase: "eternityChallenges",
      schritte: schritte.slice(0, MAX_SICHTBAR),
      meilenstein,
      hinweise: [],
    };
  }

  /* ---------------- Perks ----------------
     Ids, Kurztexte und Verbindungen aus src/core/secret-formula/reality/perks.js.
     Der Baum ist ungerichtet und startet bei Perk 0; jeder Kauf muss an einem
     bereits gekauften Perk hängen. Deshalb reicht keine Prioritätsliste, sondern
     es braucht den tatsächlich kürzesten Weg vom Bestand zum Ziel. */
  const PERK_INFO = new Map([
    [0, ["START", "Reality-Study ohne Achievement-Bedingung, vier Glyph-Angebote"]],
    [10, ["SAM", "Jeder Reset startet mit 5e130 Antimatter"]],
    [12, ["SIP1", "Jede Eternity und Reality startet mit 5e15 IP"]],
    [13, ["SIP2", "Jede Eternity und Reality startet mit 5e130 IP"]],
    [14, ["SEP1", "Jede Reality startet mit 10 EP"]],
    [15, ["SEP2", "Jede Reality startet mit 5.000 EP"]],
    [16, ["SEP3", "Jede Reality startet mit 5e9 EP"]],
    [17, ["STP", "Nach dem Dilation-Unlock sofort 10 Tachyon-Partikel"]],
    [30, ["ANR", "Dimboosts und Galaxien setzen AD, Tickspeed und Sacrifice nicht mehr zurück"]],
    [31, ["PASS", "TS122 gibt 50x EP, TS142 e50x IP, TS132 macht Replicanti 3x schneller"]],
    [40, ["EU1", "Erste Reihe Eternity Upgrades schaltet sich gratis frei"]],
    [41, ["EU2", "Zweite Reihe Eternity Upgrades gratis, sobald dein EP-Bestand je ein Zehnmilliardstel des normalen Preises erreicht"]],
    [42, ["DU1", "Zweite Reihe Dilation Upgrades gratis nach dem Unlock"]],
    [43, ["DU2", "Dritte Reihe Dilation Upgrades gratis nach dem Unlock"]],
    [44, ["ATT", "Die passive TT-Erzeugung kauft sich selbst"]],
    [45, ["ATD", "Time Dimensions 5 bis 8 schalten sich selbst frei"]],
    [46, ["REAL", "Reality-Study wird ab e4000 EP und freigeschalteter TD8 automatisch gekauft; kein automatischer Reset"]],
    [51, ["IDR", "Infinity Dimensions haben keine Antimaterie-Bedingung mehr"]],
    [52, ["TGR", "Das zweite Dilation-Rebuyable setzt Dilated Time nicht mehr zurück"]],
    [53, ["DILR", "Dilation braucht weder EC11 und EC12 noch 12.900 Gesamt-TT"]],
    [54, ["EC1R", "TS181 ohne EC1-Abschluss kaufbar"]],
    [55, ["EC2R", "TS181 ohne EC2-Abschluss kaufbar"]],
    [56, ["EC3R", "TS181 ohne EC3-Abschluss kaufbar"]],
    [57, ["EC5R", "TS62 ohne EC5-Abschluss kaufbar"]],
    [60, ["PEC1", "Alle 60 realen Minuten ein automatischer EC-Stufenabschluss, der Reihe nach"]],
    [61, ["PEC2", "Verkürzt den automatischen EC-Stufenabschluss auf alle 40 realen Minuten"]],
    [62, ["PEC3", "Verkürzt den automatischen EC-Stufenabschluss auf alle 20 realen Minuten"]],
    [70, ["ACT", "Active-Pfad-Multiplikatoren sind immer maximal"]],
    [71, ["IDL", "Idle-Pfad startet, als wären 15 Minuten vergangen"]],
    [72, ["ECR", "Eternity Challenges brauchen außer TT keine Freischaltbedingung mehr"]],
    [73, ["ECB", "Ein Lauf schließt mehrere EC-Stufen gleichzeitig ab"]],
    [80, ["TP1", "Das dritte Dilation-Rebuyable gibt rückwirkend 1,5x Tachyon-Partikel"]],
    [81, ["TP2", "Rückwirkende Tachyon-Partikel, Stufe 2"]],
    [82, ["TP3", "Rückwirkende Tachyon-Partikel, Stufe 3"]],
    [83, ["TP4", "Rückwirkende Tachyon-Partikel, Stufe 4"]],
    [100, ["DAU", "Autobuyer für die wiederkaufbaren Dilation Upgrades"]],
    [101, ["IDAS", "Schnellerer Infinity-Dimension-Autobuyer"]],
    [102, ["REPAS", "Schnellerer Replicanti-Autobuyer"]],
    [103, ["DAS", "Schnellerer Dilation-Autobuyer"]],
    [104, ["TTS", "TT-Autobuyer, kauft einzeln"]],
    [105, ["TTF", "TT-Kauf verbraucht kein AM, IP oder EP mehr"]],
    [106, ["TTM", "TT-Autobuyer kauft Max statt einzeln"]],
    [107, ["DAB", "Dilation-Autobuyer kauft in Bulk"]],
    [201, ["ACH1", "Achievement-Timer auf 20 Minuten pro Achievement"]],
    [202, ["ACH2", "Achievement-Timer auf 12 Minuten pro Achievement"]],
    [203, ["ACH3", "Achievement-Timer auf 6 Minuten pro Achievement"]],
    [204, ["ACH4", "Achievement-Timer auf 2 Minuten pro Achievement"]],
    [205, ["ACHNR", "Die ersten 13 Achievement-Reihen sofort, und Reality setzt sie nicht mehr zurück"]],
  ]);

  /* perkConnections aus perks.js, als ungerichtete Kantenliste. */
  const PERK_GRUPPEN = [
    [0, 201, 10, 40, 57], [10, 30, 12], [30, 14], [12, 13, 14, 101], [13, 51, 102],
    [14, 15, 17], [15, 16], [17, 14, 80], [40, 41], [41, 40, 100], [42, 43], [43, 44],
    [44, 103, 45], [45, 46], [52, 100, 80], [54, 55, 56, 72], [55, 70, 54], [56, 71, 54],
    [57, 70, 71, 31], [31, 54], [60, 61], [61, 62], [70, 55, 104], [71, 56, 60],
    [72, 73], [80, 52, 17, 81], [81, 82], [82, 83],
    [100, 41, 42, 53, 52, 107], [104, 105], [105, 106],
    [201, 202], [202, 203], [203, 204], [204, 205],
  ];

  const PERK_NACHBARN = (() => {
    const karte = new Map();
    const verbinde = (a, b) => {
      if (!karte.has(a)) karte.set(a, new Set());
      karte.get(a).add(b);
    };
    for (const gruppe of PERK_GRUPPEN) {
      for (const ziel of gruppe.slice(1)) {
        verbinde(gruppe[0], ziel);
        verbinde(ziel, gruppe[0]);
      }
    }
    return karte;
  })();

  /* Reihenfolge nach tatsächlichem Nutzen in der Reality-Phase, nicht nach Id.
     Der erste noch nicht gekaufte Eintrag bestimmt das Ziel. */
  const PERK_ROUTE = [57, 31, 54, 72, 73, 70, 201, 202, 203, 204, 205];

  function perkPfad(gekauft, zielId) {
    const besitz = new Set(gekauft ?? []);
    if (!besitz.has(0)) return [0];
    if (besitz.has(zielId)) return [];
    const vorgaenger = new Map();
    const schlange = [...besitz];
    const gesehen = new Set(besitz);
    while (schlange.length) {
      const aktuell = schlange.shift();
      for (const nachbar of PERK_NACHBARN.get(aktuell) ?? []) {
        if (gesehen.has(nachbar)) continue;
        gesehen.add(nachbar);
        vorgaenger.set(nachbar, aktuell);
        if (nachbar === zielId) {
          const pfad = [];
          let knoten = zielId;
          while (!besitz.has(knoten)) {
            pfad.unshift(knoten);
            knoten = vorgaenger.get(knoten);
          }
          return pfad;
        }
        schlange.push(nachbar);
      }
    }
    return null;
  }

  const perkName = id => {
    const eintrag = PERK_INFO.get(id);
    return eintrag ? eintrag[0] : `Perk ${id}`;
  };

  /* Nächstes Perk-Ziel plus der Weg dorthin, gemessen am tatsächlichen Bestand. */
  function perkVorschlag(p) {
    const gekauft = Array.isArray(p.perks) ? p.perks : [];
    for (const ziel of PERK_ROUTE) {
      const pfad = perkPfad(gekauft, ziel);
      if (pfad === null || pfad.length === 0) continue;
      const punkte = Math.max(0, Math.floor(p.perkPoints ?? 0));
      const jetzt = Math.min(punkte, pfad.length);
      return {
        zielId: ziel,
        zielName: perkName(ziel),
        warum: PERK_INFO.get(ziel)?.[1] ?? "",
        pfad,
        pfadText: pfad.map(perkName).join(" → "),
        kosten: pfad.length,
        punkte,
        jetztText: pfad.slice(0, jetzt).map(perkName).join(", "),
        naechster: perkName(pfad[0]),
        naechsterText: PERK_INFO.get(pfad[0])?.[1] ?? "",
      };
    }
    return null;
  }

  const GLYPH_TYP = {
    power: "Power", infinity: "Infinity", replication: "Replication", time: "Time", dilation: "Dilation",
  };
  const GLYPH_EFFEKT = {
    powerpow: "AD-Potenz", powermult: "AD-Multiplikator", powerdimboost: "Dimboost-Multiplikator",
    powerbuy10: "Kauf-10-Multiplikator", infinitypow: "ID-Potenz", infinityrate: "Infinity-Power-Umwandlung",
    infinityIP: "IP-Multiplikator", infinityinfmult: "Infinity-Multiplikator",
    replicationspeed: "Replicanti-Speed", replicationpow: "Replicanti-Potenz",
    replicationdtgain: "DT-Multiplikator", replicationglyphlevel: "Glyph-Level-Faktor",
    timepow: "TD-Potenz", timespeed: "Spielgeschwindigkeit", timeetermult: "Eternity-Multiplikator",
    timeshardpow: "Time-Shard-Potenz",
    timeEP: "EP-Multiplikator", dilationDT: "DT-Multiplikator", dilationgalaxyThreshold: "TG-Schwelle",
    dilationTTgen: "TT-Erzeugung", dilationpow: "dilatierte AD-Potenz",
  };

  function glyphText(glyph, index) {
    if (!glyph) return "Time mit EP×, sonst Power mit AD-Potenz";
    const rarity = Number(glyph.rarity ?? 0).toLocaleString("de-DE", { maximumFractionDigits: 1 });
    const effekte = (glyph.effects ?? []).map(effekt => GLYPH_EFFEKT[effekt] ?? effekt).join(" + ");
    return `Angebot ${index + 1}: ${GLYPH_TYP[glyph.type] ?? glyph.type}, Level ${glyph.level} `
      + `(${rarity} %, ${effekte})`;
  }

  function glyphBestandText(glyph) {
    const ids = Array.isArray(glyph.effectIds)
      ? glyph.effectIds
      : (Array.isArray(glyph.effects) ? glyph.effects : []);
    const effekte = ids.map(effekt => GLYPH_EFFEKT[effekt] ?? effekt).join(" + ");
    const seltenheit = glyph.rarity == null ? "" : `${Number(glyph.rarity).toLocaleString("de-DE", { maximumFractionDigits: 1 })} % Seltenheit; `;
    return `${GLYPH_TYP[glyph.type] ?? glyph.type} Level ${glyph.level}${effekte ? ` (${seltenheit}${effekte})` : ""}`;
  }

  function glyphGrund(g) {
    if (g.type === "companion") return "Der aktive Companion belegt einen Slot, bringt aber keinen Produktionsbonus. Er bleibt bei dieser Ergänzung aktiv; beim nächsten geplanten Glyph-Respec im Inventar lassen, damit ein Produktions-Glyph den Platz nutzen kann.";
    const e = glyphEffekte(g);
    const gruende = [];
    if (e.includes("powermult")) gruende.push("der direkte AD-Multiplikator wirkt schon ab AD1 und beschleunigt den Wiederaufbau nach jedem Reset");
    if (e.includes("powerpow")) gruende.push("AD-Potenz verstärkt die Multiplikatoren aller acht Antimatter Dimensions; mehrere Power-Glyphs addieren ihre Potenzboni und helfen so beim AM-/IP- und späteren EP-Push");
    if (e.includes("powerdimboost")) gruende.push("der Dimboost-Multiplikator verstärkt zusätzlich die Dimension Boosts und bleibt auch in EC11 nützlich");
    if (e.includes("powerbuy10")) gruende.push("der Kauf-10-Bonus verstärkt jedes weitere Zehnerpaket von Antimatter Dimensions");
    if (e.includes("timeEP")) gruende.push("der EP-Multiplikator erhöht den Gewinn jeder Eternity, sodass du früher Time Dimensions, ×5 EP und Time Theorems bezahlen kannst");
    if (e.includes("timepow")) gruende.push("TD-Potenz verstärkt Time Dimensions und damit den Aufbau von Time Shards für zusätzliche Tickspeed-Upgrades");
    if (e.includes("timeetermult")) gruende.push("der Eternity-Multiplikator erhöht die Zahl gezählter Eternities für Milestones und anzahlabhängige Boni; er multipliziert nicht die EP");
    if (e.includes("timespeed")) gruende.push("Spielgeschwindigkeit beschleunigt die Produktion und die meisten Timer");
    if (e.includes("infinitypow")) gruende.push("ID-Potenz erhöht die Infinity-Power-Produktion und dadurch die Stärke der Antimatter Dimensions");
    if (e.includes("infinityrate")) gruende.push("die Infinity-Power-Umwandlung macht den AD-Bonus aus deiner Infinity Power stärker");
    if (e.includes("infinityIP")) gruende.push("der IP-Multiplikator finanziert Infinity Dimensions und Replicanti-Upgrades früher");
    if (e.includes("infinityinfmult")) gruende.push("mehr gezählte Infinities helfen bei Infinity-Anforderungen und anzahlabhängigen Boni");
    if (e.includes("replicationspeed")) gruende.push("schnellere Replicanti verkürzen den Aufbau von Replicanti-Galaxien und erhöhen später den Replicanti-Rekord für Glyph-Level");
    if (e.includes("replicationpow")) gruende.push("der stärkere Replicanti-Multiplikator verbessert die Infinity Dimensions");
    if (e.includes("replicationdtgain") || e.includes("dilationDT")) gruende.push("mehr Dilated Time finanziert Dilation-Upgrades und Tachyon-Galaxien früher");
    if (e.includes("replicationglyphlevel")) gruende.push("der Replicanti-Faktor liefert aus demselben Rekord mehr Glyph-Level für die nächste Auswahl");
    if (e.includes("dilationTTgen")) gruende.push("passive TT-Erzeugung spart wiederholte Theorem-Käufe und verkürzt den Weg zu Dilation-Studies");
    if (e.includes("dilationgalaxyThreshold")) gruende.push("die niedrigere TG-Schwelle liefert bei derselben Dilated Time mehr Tachyon-Galaxien");
    if (e.includes("dilationpow")) gruende.push("die AD-Potenz hilft beim Antimatter-Push innerhalb von Dilation");
    return `${glyphBestandText(g)}: ${gruende.join("; ") || "die ausgelesenen Effekte reichen für einen belastbaren Vergleich nicht aus"}.`;
  }

  function glyphSetGruende(p, auswahl) {
    const weggelassen = [...(p.inventoryGlyphs ?? []), ...(p.activeGlyphs ?? [])]
      .filter(g => g.type !== "companion" && !auswahl.some(a => a === g || (a.id != null && a.id === g.id)));
    return [
      ...auswahl.map(glyphGrund),
      ...weggelassen.map(g => `${glyphBestandText(g)} bleibt für dieses Set im Inventar: `
        + (g.type === "time" && !glyphEffekte(g).includes("timeEP") && auswahl.some(a => glyphEffekte(a).includes("timeEP"))
          ? "Dein gewählter Time-Glyph erhöht auch EP. Für den übrigen Platz priorisiert diese frühe Push-Route AD-Potenz vor zusätzlicher Eternity-Anzahl; die höhere Seltenheit allein entscheidet nicht."
          : "Die Auswahl priorisiert passende Effekte für den EP-/RM-Aufbau, danach Level und Stärke. Das ist eine Empfehlung aus dem Bestand, kein gemessener Vergleich der Laufzeiten.")),
    ];
  }

  function glyphAuffuellenSchritt(p) {
    // Das noch offene Ein-Glyph-Ziel hat Vorrang, auch bei bereits aktivem Glyph.
    if (!hat(p.realityUpgrades, 9) && !hat(p.realityUpgradeUnlocks, 9) && ru9NochMoeglich(p)) return null;
    if (hat(p.realityRequirementLocks, 24) && !hat(p.realityUpgrades, 24) && !hat(p.realityUpgradeUnlocks, 24)) return null;
    const aktiv = p.activeGlyphs ?? [];
    const slots = glyphSlots(p);
    if (aktiv.length >= slots) return null;
    const kandidaten = glyphAuswahl({ ...p, activeGlyphs: [] }).filter(g => !aktiv.some(a => a.id != null && a.id === g.id));
    const dazu = kandidaten.slice(0, slots - aktiv.length);
    if (!dazu.length) return null;
    const auswahl = [...aktiv, ...dazu];
    const schritt = aktion("realityGlyphSetBauen", "glyphAuffuellen",
      `Belege ${auswahl.length} deiner ${slots} Glyph-Slots für diesen Lauf.`,
      [...(aktiv.length ? [`Aktiv lassen: ${glyphListe(aktiv)}. Für diese Ergänzung ist kein Reality-Neustart nötig.`] : []),
        ...dazu.map(g => `Reality → Glyphs: ${glyphBestandText(g)} aus dem Inventar in einen freien aktiven Slot ziehen.`),
        ...(aktiv.some(g => g.type === "companion") ? [] : ["Den Companion im Inventar lassen."]),
        ...(auswahl.length < slots ? [`Dein Bestand belegt erst ${auswahl.length} Slots; die übrigen ${slots - auswahl.length} Slots bleiben vorerst frei.`] : [])],
      `${auswahl.length} Glyph-Slots sind belegt.`,
      `Du hast ${slots} aktive Slots${hat(p.realityUpgrades, 9) ? ` durch das gekaufte ${ruName(9, true)}` : ""}${hat(p.realityUpgrades, 24) ? ` und ${ruName(24, true)}` : ""}. `
        + "Die Auswahl nutzt deine vorhandenen Effekte für den frühen EP-/RM-Aufbau. Freie Slots können sofort ergänzt werden; bereits aktive Glyphs bleiben erhalten.");
    schritt.glyphAuswahl = auswahl;
    schritt.inhalt.warumDetails = glyphSetGruende(p, auswahl);
    return schritt;
  }

  function ru9GlyphSchritt(p) {
    if (hat(p.realityUpgradeUnlocks, 9) || hat(p.realityUpgrades, 9) || !ru9NochMoeglich(p)
      || (p.activeGlyphs ?? []).some(g => g.type !== "companion")) return null;
    const passend = (p.inventoryGlyphs ?? []).filter(g => g.type !== "companion" && g.level >= 3);
    const sortiert = passend.slice().sort((a, b) => {
      const wert = g => (glyphEffekte(g).includes("timeEP") ? 1e6 : g.type === "power" ? 1e5 : 0)
        + g.level * (g.strength ?? 1);
      return wert(b) - wert(a);
    });
    const glyph = sortiert[0];
    if (!glyph) return null;
    const schritt = aktion("realityGlyphSetBauen", "ru9Glyph", `Rüste genau diesen Glyph aus: ${glyphBestandText(glyph)}.`,
      [`Reality → Glyphs: ${glyphBestandText(glyph)} im Inventar doppelt anklicken oder in einen aktiven Slot ziehen. Die Effekte stehen im Tooltip.`,
        "Lass die übrigen Slots bis zur Eternity bei e4000 EP leer. Die anderen Glyphs bleiben im Inventar.",
        hat(p.realityRequirementLocks, 9) ? "Das Requirement Lock ist bereits aktiv; nicht noch einmal anklicken."
          : `Danach bei ${ruName(9, true)} mit Shift-Klick das offene Schloss schließen.`],
      "Genau der genannte Glyph ist aktiv; Linguistically Expand ist geschützt.",
      "Linguistically Expand verlangt bei der Eternity mit e4000 EP genau einen aktiven Glyph ab Level 3. Deshalb bleiben die anderen Slots leer. "
        + (glyphEffekte(glyph).includes("timeEP") ? "Unter deinen passenden Glyphs bekommt der Time-Glyph mit EP-Multiplikator Vorrang: Du musst unter dieser Einschränkung den gesamten EP-Aufbau schaffen. "
          : "Aus den passenden Glyphs bekommt ein Power-Glyph Vorrang, danach entscheiden Level und Stärke. ")
        + "Das Upgrade gibt dir anschließend den vierten Slot; eine höhere Seltenheit allein ersetzt weder den nötigen Effekt noch Level 3.");
    schritt.inhalt.warumDetails = [glyphGrund(glyph)];
    return schritt;
  }

  const glyphSlots = p => 3 + Number(hat(p.realityUpgrades, 9)) + Number(hat(p.realityUpgrades, 24));
  const glyphListe = glyphs => new Intl.ListFormat("de").format(glyphs.map(glyphBestandText));

  function glyphAuswahl(p, festesGlyph = null) {
    const bestand = [...new Map([...(p.activeGlyphs ?? []), ...(p.inventoryGlyphs ?? []), ...(festesGlyph ? [festesGlyph] : [])]
      .filter(glyph => glyph?.type !== "companion").map(g => [g.id ?? g, g])).values()];
    const score = glyph => {
      const effekte = Array.isArray(glyph.effectIds)
        ? glyph.effectIds
        : (Array.isArray(glyph.effects) ? glyph.effects : []);
      return (effekte.includes("timeEP") ? 10000 : 0)
        + (effekte.includes("powerpow") ? 8000 : 0)
        + (effekte.includes("timepow") ? 6000 : 0)
        + (effekte.includes("powermult") ? 3000 : 0)
        + Math.sqrt(Math.max(1, Number(glyph.level) || 1) * Math.max(1, glyph.strength ?? 1 + (glyph.rarity ?? 0) / 40));
    };
    const sortiert = bestand.slice().sort((a, b) => score(b) - score(a));
    const auswahl = sortiert;
    const slots = glyphSlots(p);
    if (slots > 3) {
      // Pick an available build from the supplied early-Reality guide. This is
      // an effects/level heuristic, not a promise of optimal simulated RM/min.
      const typen = { p: "power", r: "replication", t: "time", d: "dilation" };
      const gut = g => g.type === "power" || (g.type === "time" && glyphEffekte(g).includes("timeEP"))
        || (g.type === "replication" && glyphEffekte(g).includes("replicationspeed") && glyphEffekte(g).length >= 2)
        || (g.type === "dilation" && glyphEffekte(g).includes("dilationDT"));
      const qualitaet = g => Math.sqrt(Math.max(1, g.level) * Math.max(1, g.strength ?? 1 + (g.rarity ?? 0) / 40));
      const kandidaten = ["pprt", "prrt", "prtd", "rrtd", "rtdd"].map(code => {
        const pool = auswahl.filter(gut).sort((a, b) => qualitaet(b) - qualitaet(a));
        const set = [];
        for (const typ of code) {
          const index = pool.findIndex(g => g.type === typen[typ]);
          if (index < 0) return null;
          set.push(...pool.splice(index, 1));
        }
        if (slots === 5 && pool.length) set.push(pool[0]);
        return set;
      }).filter(Boolean).sort((a, b) => b.reduce((sum, g) => sum + qualitaet(g), 0) - a.reduce((sum, g) => sum + qualitaet(g), 0));
      if (kandidaten.length) return kandidaten[0];
    }
    return auswahl.slice(0, slots);
  }

  function glyphSetAusBestand(p, festesGlyph = null) {
    const auswahl = glyphAuswahl(p, festesGlyph);
    return auswahl.length >= 3 ? glyphListe(auswahl) : null;
  }

  /* Wie glyphSetAusBestand, aber ohne die Drei-Slot-Mindestmenge: fruehe
     Realitys haben oft nur einen oder zwei Glyphs, und dann ist "die drei
     staerksten aus deinem Inventar" keine Anweisung, sondern eine Ausrede. */
  function glyphSetVorhanden(p) {
    const bestand = glyphAuswahl(p);
    if (!bestand.length) return null;
    return glyphListe(bestand);
  }

  function fruehesGlyphSetPasst(p) {
    return p.activeGlyphs?.length === Math.min(glyphSlots(p), glyphAuswahl(p).length)
      && !p.activeGlyphs.some(glyph => glyph.type === "companion")
      && glyphSetAusBestand(p) === glyphSetAusBestand({ ...p, inventoryGlyphs: [] });
  }

  function rmZielwerte(p, mitBlackHole = true) {
    const bank = Math.max(0, Math.floor(p.resources?.realityMachines ?? 0));
    const rowOneMissing = [1,1,2,2,3].reduce((s, cost, i) => s + ((p.realityRebuyables?.[i + 1] ?? 0) > 0 ? 0 : cost), 0);
    const offen = hat(p.realityUpgrades, 8) ? offeneRuKaeufe(p) : [];
    // Pins: einmalige Upgrades zuerst; das erste Black Hole während Reihe 3.
    const blackHole = mitBlackHole && !p.firstBlackHoleUnlocked && !p.blackHoles?.[0]?.unlocked
      && hat(p.realityUpgrades, 8) && hatFreischaltung(p, 11, 15);
    const zielId = !hat(p.realityUpgrades, 8) ? 8
        : offen[0]?.id
          ?? (ru9NochMoeglich(p) && !hat(p.realityUpgrades, 9) ? 9 : ru13NochMoeglich(p) ? 13 : null)
          ?? [9,13,12,14,11,15,16,17,18,19,20,21,22,23,24,25].find(id => !hat(p.realityUpgrades, id));
    const kosten = (p.realities ?? 0) === 1 ? rowOneMissing
      : offen.length ? offen.reduce((sum, kauf) => sum + kauf.kosten, 0) : blackHole ? 0 : RU_KOSTEN.get(zielId) ?? 1;
    const ziel = Math.max(1, kosten + (blackHole ? 100 : 0) - bank);
    const kaufliste = offen.map(kauf => `${ruName(kauf.id, true)} (${kauf.kosten} RM)`);
    if (blackHole) kaufliste.push("das erste Black Hole (100 RM)");
    return {
      bankRM: bank,
      zielRM: ziel,
      zielKauf: (p.realities ?? 0) === 1 ? "die fehlenden Start-Upgrades"
        : kaufliste.length ? new Intl.ListFormat("de").format(kaufliste) : zielId ? ruName(zielId, true) : "den nächsten Ausbau",
      zielEP: Math.ceil(ziel < 10 ? (ziel + 26) * 4000 / 27 : 4000 * (1 + Math.log10(ziel) / 3)),
    };
  }

  function konkreteFrueheReality(p) {
    if ((p.realities ?? 0) > 6 || hat(p.realityUpgrades, 8)) return null;

    const bank = Math.max(0, Math.floor(p.resources?.realityMachines ?? 0));
    const ru8Offen = hat(p.realityUpgradeUnlocks, 8);
    const meilenstein = { ...MEILENSTEINE.find(m => m.id === "ersteReality"), restSchritte: 1 };
    if (ru8Offen && bank >= 15) {
      return { phase: "reality", schritte: [ruKaufSchritt(p)], meilenstein, hinweise: [] };
    }

    const frischerLauf = !ru8Offen
      && p.requirementChecks?.noEternities !== false
      && p.requirementChecks?.noRG !== false
      && !p.gainedAutoAchievements;
    if (frischerLauf && (bank < 15 || !glyphSetAusBestand(p))) return null;

    const gewinn = Math.max(0, Math.floor(p.gainedRMEstimate ?? 0));
    if (!frischerLauf && gewinn === 0) return null;
    const reset = realityResetSchritte(p);
    if (!frischerLauf && !glyphSetAusBestand(p, empfohlenerGlyph(p).glyph)) return null;
    const zielwerte = rmZielwerte(p);
    if (!frischerLauf && gewinn < zielwerte.zielRM) {
      const { epBaum, epHandgriff } = dilationAufbau(p);
      /* Nach weiterem EP-Farmen aendern sich RM und Glyph-Angebote. Erst neu
         einlesen, bevor eine konkrete Auswahl oder Kaufliste versprochen wird. */
      return {
        phase: "reality", meilenstein, hinweise: [],
        schritte: [leererSchritt(KONKRETE_SCHRITTE.realityRm.schrittId, "realityRm", {
          werte: { standRM: gewinn, ...zielwerte, activeHandgriff: epHandgriff },
          baeume: [{ bezeichnung: "EP-Push-Baum",
            importString: epBaum }].filter(b => b.importString),
          baeumeSichtbar: true,
        })],
      };
    }

    const rm = bank + (frischerLauf ? 0 : gewinn);
    const schritte = frischerLauf ? [] : [reset[0]];
    const perk = perkSchritt({ ...p,
      perkPoints: (p.perkPoints ?? 0) + (frischerLauf ? 0 : 1) });
    if (perk) schritte.push(perk);
    if (frischerLauf && p.autoAchievementsEnabled) {
      schritte.unshift(leererSchritt(KONKRETE_SCHRITTE.realityAutoAchievements.schrittId,
        "realityAutoAchievements"));
    }
    const rmHinweis = ru8Offen
      ? "Reality → Upgrades: Du hast " + rm + " RM für die Kaufliste im nächsten Schritt."
      : "Reality → Upgrades: Gib die " + rm + " RM noch nicht aus. Kauf erst nach der ersten manuellen Eternity.";
    const set = frischerLauf
      ? leererSchritt(KONKRETE_SCHRITTE.realitySet.schrittId, "realitySet", {
        werte: { glyphSet: glyphSetAusBestand(p), rmHinweis },
        inhalt: { warumDetails: glyphSetGruende(p, glyphAuswahl(p)) } })
      : { ...reset[1], werte: { ...reset[1].werte, rmHinweis } };
    if (!frischerLauf || !fruehesGlyphSetPasst(p)) schritte.push(set);

    const freigeschaltet = new Set([...(p.realityUpgradeUnlocks ?? []), ...(p.realityUpgrades ?? [])]);
    if (!ru8Offen) {
      const ru7Moeglich = !frischerLauf
        || (p.requirementChecks?.noInfinities !== false && (p.galaxies ?? 0) <= 1);
      const ziele = [6, 8, 10].filter(id => !freigeschaltet.has(id));
      const handgriff = !freigeschaltet.has(7) && ru7Moeglich
        ? [`Dimensions → Antimatter Dimensions: Kauf vor dem ersten Big Crunch höchstens eine Antimatter-Galaxie. Drück dann Big Crunch für ${ruName(7, true)}.`]
        : [];
      const ruZiele = new Intl.ListFormat("de").format(ziele.map(id => ruName(id, true)));
      schritte.push(leererSchritt(KONKRETE_SCHRITTE.realityBundle.schrittId, "realityBundle", {
        werte: { ruZiele },
        vorab: handgriff,
        hinweis: frischerLauf ? [
          fruehesGlyphSetPasst(p) ? "Glyph-Set bereits ausgerüstet" : null,
          !p.autoAchievementsEnabled ? "Auto Achievements bereits ausgeschaltet" : null,
        ].filter(Boolean).join(" · ") : "",
      }));
      for (const id of ziele) freigeschaltet.add(id);
      if (ru7Moeglich) freigeschaltet.add(7);
    }
    const kauf = ruKaufSchritt({ ...p, resources: { ...p.resources, realityMachines: rm },
      realityUpgradeUnlocks: [...freigeschaltet] });
    if (kauf) schritte.push(kauf);
    return { phase: "reality", schritte, meilenstein, hinweise: [] };
  }

  /* ---------------- Reality-Lauf ----------------
     Eine Reality setzt Time Theorems, Time Studies, EC-Abschlüsse und Dilation
     komplett zurück (src/core/reality.js). Wer in Reality 3 steckt, spielt also
     denselben Weg noch einmal: Studies aufbauen, ECs klären, Dilation öffnen,
     auf e4000 EP pushen, resetten. Genau diesen Weg zeigt der Planer hier —
     mit denselben Bäumen wie in den Phasen davor, statt mit Ratschlägen. */

  const RU_KOSTEN = new Map([
    [6, 15], [7, 15], [8, 15], [9, 15], [10, 15],
    [11, 50], [12, 50], [13, 50], [14, 50], [15, 50],
    [16, 1500], [17, 1500], [18, 1500], [19, 1500], [20, 1500],
    [21, 100000], [22, 100000], [23, 100000], [24, 100000], [25, 100000],
  ]);

  /* Kaufreihenfolge nach Wirkung auf den nächsten Lauf, nicht nach Nummer. */
  const RU_KAUFREIHE = [
    [8, "Paradoxically Attain", "mehr Tachyon Particles aus dem Achievement-Multiplikator"],
    [10, "Existentially Prolong", "100 Eternities beim Start jeder Reality"],
    [9, "Linguistically Expand", "einen zusätzlichen Glyph-Slot"],
    [6, "Cosmically Duplicate", "mehr Replicanti-Speed aus Replicanti-Galaxien"],
    [7, "Innumerably Construct", "mehr Infinities aus der Galaxien-Zahl"],
    [13, "The Telemechanical Process", "Autobuyer für Time Dimensions und den ×5-EP-Kauf"],
    [12, "The Knowing Existence", "einen EP-Multiplikator aus Reality- und TT-Zahl"],
    [14, "The Eternal Flow", "Eternities pro Sekunde in Höhe deiner Reality-Zahl"],
    [11, "The Boundless Flow", "10 % deines Infinity-Gewinns pro Sekunde"],
    [15, "The Paradoxical Forever", "mehr Tachyon Particles aus dem ×5-EP-Multiplikator"],
    [16, "Disparity of Rarity", "bessere Glyph-Seltenheit"],
    [17, "Duplicity of Potency", "häufiger einen zusätzlichen Glyph-Effekt"],
    [18, "Measure of Forever", "mehr Glyph-Level aus Eternities"],
    [19, "Scour to Empower", "Glyph Sacrifice für dauerhafte Boni"],
    [20, "Parity of Singularity", "das zweite Black Hole"],
    [21, "Cosmic Conglomerate", "späteres Remote-Galaxy-Scaling"],
    [22, "Temporal Transcendence", "stärkere Time Dimensions"],
    [23, "Replicative Rapidity", "mehr Replicanti-Speed aus schnellen Realities"],
    [24, "Synthetic Symbolism", "einen zusätzlichen Glyph-Slot"],
    [25, "Effortless Existence", "den Reality-Autobuyer"],
  ];

  function ruName(id, mitPosition = false) {
    const name = RU_KAUFREIHE.find(eintrag => eintrag[0] === id)[1];
    return mitPosition
      ? `${name} (Reihe ${Math.ceil(id / 5)}, Spalte ${(id - 1) % 5 + 1})`
      : name;
  }

  function offeneRuKaeufe(p) {
    const freigeschaltet = new Set([
      ...(p.realityUpgradeUnlocks ?? []),
      ...(p.realityUpgrades ?? []),
    ]);
    const gekauft = new Set(p.realityUpgrades ?? []);
    return RU_KAUFREIHE
      .filter(([id]) => freigeschaltet.has(id) && !gekauft.has(id))
      .map(([id, name, nutzen]) => ({ id, name, nutzen, kosten: RU_KOSTEN.get(id) ?? 0 }));
  }

  /* Freigeschaltet heißt nicht gekauft. Wer freigeschaltete Upgrades ungekauft
     liegen lässt, verliert den Effekt in jedem weiteren Lauf — deshalb sagt der
     Schritt entweder die Kaufliste oder das konkrete Sparziel. */
  function ruKaufSchritt(p) {
    const rm = Math.floor(p.resources?.realityMachines ?? 0);
    const offen = offeneRuKaeufe(p);
    if (!offen.length) return null;

    const liste = [];
    let rest = rm;
    for (const eintrag of offen) {
      if (eintrag.kosten > rest) continue;
      // Duplicate/Paradoxical must not spend the RM reserved for the extra
      // slot and EP multiplier while their requirements are still playable.
      const reserve = [9, 12].filter(id => !hat(p.realityUpgrades, id)
        && !liste.some(kauf => kauf.id === id)
        && ZIELE.find(z => z.id === `ru${id}`).istNochMoeglich(p))
        .reduce((summe, id) => summe + RU_KOSTEN.get(id), 0);
      if ([6, 15].includes(eintrag.id) && rest - eintrag.kosten < reserve) continue;
      rest -= eintrag.kosten;
      liste.push(eintrag);
    }

    const offenText = offen
      .map(eintrag => `${ruName(eintrag.id, true)}: ${eintrag.kosten} RM`).join("; ");

    if (!liste.length) {
      if (offen.some(eintrag => eintrag.kosten <= rm)) return null;
      const ziel = offen.reduce((guenstigst, eintrag) =>
        eintrag.kosten < guenstigst.kosten ? eintrag : guenstigst, offen[0]);
      return leererSchritt(KONKRETE_SCHRITTE.realityRuSparziel.schrittId, "ruSparziel", {
        werte: {
          ruTop: ruName(ziel.id, true),
          ruTopNutzen: ziel.nutzen,
          ruKosten: ziel.kosten.toLocaleString("de-DE"),
          standRM: rm.toLocaleString("de-DE"),
          fehlendRM: (ziel.kosten - rm).toLocaleString("de-DE"),
          ruOffen: offenText,
        },
      });
    }

    return leererSchritt(KONKRETE_SCHRITTE.realityRuKaufen.schrittId, "ruJetztKaufen", {
      kaufIds: liste.map(eintrag => eintrag.id),
      inhalt: { warumDetails: liste.map(eintrag => `${ruName(eintrag.id, true)} für ${eintrag.kosten} RM: ${eintrag.nutzen}.`) },
      werte: {
        ruListe: liste.map(eintrag => `${ruName(eintrag.id, true)}: ${eintrag.kosten} RM`).join("; "),
        ruTop: ruName(liste[0].id),
        ruTopNutzen: liste[0].nutzen,
        ruKosten: liste.reduce((summe, eintrag) => summe + eintrag.kosten, 0).toLocaleString("de-DE"),
        standRM: rm.toLocaleString("de-DE"),
        restRM: rest.toLocaleString("de-DE"),
        ruOffen: offenText,
      },
    });
  }

  function perkSchritt(p) {
    if (!(p.perkPoints > 0)) return null;
    const vorschlag = perkVorschlag(p);
    if (!vorschlag) return null;
    const gekauftJetzt = vorschlag.pfad.slice(0, vorschlag.punkte);
    const nutzen = {
      0: "START ist der Einstieg in den Perk-Baum. Vier Glyph-Angebote pro Reality erhöhen die Chance auf einen für dein Set passenden Effekt; außerdem entfällt die Achievement-Bedingung der Reality-Study.",
      57: "EC5R entfernt die EC5-Sperre von TS62. Damit kannst du die dreifache Replicanti-Geschwindigkeit schon vor EC5 nutzen; die 3 TT und die übrigen Study-Verbindungen musst du weiterhin bezahlen.",
      31: "PASS macht TS122 zu ×50 EP, TS142 zu ×e50 IP und TS132 zu dreifacher Replicanti-Geschwindigkeit. Damit ist der frühe Passive-Pfad sofort stark, ohne TS121 erst mit kurzen Eternities vorzubereiten.",
      54: "EC1R entfernt nur die EC1-Bedingung von TS181. Der entscheidende Grund für diesen Kauf ist die Verbindung zu ECR → ECB: Danach entfallen Ressourcen-Farmen zum EC-Eintritt und später wiederholte Einzelstarts derselben Challenge. "
        + (hat(p.realityUpgrades, 12) || hat(p.realityUpgradeUnlocks, 12)
          ? "The Knowing Existence ist bei dir bereits erledigt und daher kein Grund für diesen Kauf. " : "Solange The Knowing Existence offen ist, bleibt EC1 trotzdem tabu; EC1R schließt die Challenge nicht ab. ")
        + "TS181 ist damit weder gratis noch sofort verfügbar: TT, Study-Verbindungen und die übrigen EC-Sperren gelten weiterhin.",
      72: "ECR entfernt die zusätzlichen Ressourcen-Anforderungen von ECs, etwa Eternities für EC1 oder Infinities für EC4. Du brauchst weiterhin TT und einen passenden Study-Pfad, sparst aber die getrennten Freischalt-Farmen in jeder Reality. ECR öffnet außerdem den direkten Weg zu ECB.",
      73: "ECB lässt einen Challenge-Lauf mehrere Stufen abschließen, wenn dein IP-Gewinn die jeweiligen höheren Ziele erreicht. Du sparst wiederholtes Verlassen, Freischalten und Starten; für unerreichte Ziele gibt es keine kostenlosen Abschlüsse.",
      70: "ACT hält die Active-Studies auf ihrem maximalen Bonus. Das spart die zehn kurzen Eternities für TS121 und verhindert den Verfall des TS141-IP-Bonus. Automatische Replicanti-Galaxien auf Active brauchen weiterhin r138. Nach ECR/ECB reduziert das die Vorbereitung wiederholter EP-Pushes.",
      201: "ACH1 verkürzt den automatischen Achievement-Timer auf 20 Minuten je Achievement und beginnt den Weg zu ACHNR. Dadurch kommen Belohnungen früher zurück; ACHNR soll später den Verlust der ersten 13 Reihen ganz entfernen.",
      202: "ACH2 verkürzt den Timer von 20 auf 12 Minuten je Achievement und ist der nächste Verbindungsknoten zu ACHNR. Die früher zurückkehrenden Belohnungen helfen schon während der laufenden Reality.",
      203: "ACH3 verkürzt den Timer von 12 auf 6 Minuten je Achievement. Der Kauf setzt den Weg zu ACHNR fort, damit die ersten 13 Achievement-Reihen später dauerhaft erhalten bleiben.",
      204: "ACH4 verkürzt den Timer von 6 auf 2 Minuten je Achievement und öffnet ACHNR direkt. Sein unmittelbarer Nutzen ist kürzeres Warten; das nächste Ziel beseitigt den Wiederaufbau ganz.",
      205: "ACHNR gibt dir die ersten 13 Achievement-Reihen sofort zurück und erhält sie bei Reality. So wirken etwa doppelte Eternities und die frühen Replicanti-/Reset-Boni künftig schon ab Laufbeginn.",
    };
    return leererSchritt(KONKRETE_SCHRITTE.realityPerkPfad.schrittId, "perkPfad", {
      kaufIds: gekauftJetzt,
      inhalt: { warumDetails: gekauftJetzt.map(id => nutzen[id] ?? `${perkName(id)}: ${PERK_INFO.get(id)?.[1]}. Dieser Knoten verbindet deinen vorhandenen Baum mit ${vorschlag.zielName}.`) },
      werte: {
        perkJetzt: vorschlag.jetztText,
        perkPunkte: String(vorschlag.punkte),
        perkWarum: gekauftJetzt.includes(vorschlag.zielId)
          ? `Dein nächstes Ziel ${vorschlag.zielName} ist mit diesen Käufen erreicht`
          : `Du kaufst zunächst die Verbindung zu ${vorschlag.zielName}; der Ziel-Perk selbst ist mit deinen ${vorschlag.punkte} Punkten noch nicht erreichbar`,
      },
    });
  }

  function empfohlenerGlyph(p) {
    const choices = p.upcomingGlyphs ?? [];
    let index = choices.findIndex(glyph => glyph.type === "time" && glyph.effects?.includes("timeEP"));
    if (index < 0) index = choices.findIndex(glyph => glyph.type === "power"
      && glyph.effects?.includes("powerpow"));
    return { glyph: index >= 0 ? choices[index] : null, index };
  }

  function realityResetSchritte(p) {
    const { glyph, index } = empfohlenerGlyph(p);
    const bank = Math.max(0, Math.floor(p.resources?.realityMachines ?? 0));
    const gewinn = Math.max(0, Math.floor(p.gainedRMEstimate ?? 0));
    const ru8Offen = hat(p.realityUpgradeUnlocks, 8) || hat(p.realityUpgrades, 8);
    const kauf = ru8Offen ? ruKaufSchritt({ ...p, resources: { ...p.resources, realityMachines: bank + gewinn } }) : null;
    const nachKauf = bank + gewinn - (kauf?.kaufIds ?? []).reduce((sum, id) => sum + RU_KOSTEN.get(id), 0);
    const blackHole = ru8Offen && !p.firstBlackHoleUnlocked && !p.blackHoles?.[0]?.unlocked
      && hatFreischaltung(p, 11, 15) && nachKauf >= 100;
    const werte = {
      glyphEmpfehlung: glyphText(glyph, index),
      glyphSet: glyphSetAusBestand(p, glyph) ?? glyphSetVorhanden(p)
        ?? "den gerade erhaltenen Glyph",
      naechsteReality: (p.reality ?? ((p.realities ?? 0) + 1)) + 1,
      gewinnRM: gewinn,
      nachResetRM: bank + gewinn,
      achievementSchalter: ru8Offen
        ? "Achievements → Achievements: Auto Achievements darf eingeschaltet bleiben; Paradoxically Attain ist bereits freigeschaltet."
        : "Achievements → Achievements: Schalte Auto Achievements aus, damit Paradoxically Attain in der nächsten Reality freischaltbar bleibt.",
      rmHinweis: ru8Offen
        ? `Nach dem Reset hast du voraussichtlich ${zahl(bank + gewinn)} RM. ${kauf?.kaufIds?.length || blackHole ? "Die folgenden Käufe rechnen bereits mit diesem Gesamtbestand." : "Bewahre die RM für die nächsten Freischaltungen auf."}`
        : "Reality → Upgrades: Nach dem Reset hast du " + (bank + gewinn) + " RM. Kauf damit noch nichts; die fehlenden Upgrades Cosmically Duplicate, Paradoxically Attain und Existentially Prolong werden erst nach deiner ersten manuellen Eternity kaufbar.",
    };
    return [
      leererSchritt(KONKRETE_SCHRITTE.realityReset.schrittId, "realityReset", { werte,
        inhalt: { warum: "Glyph-Respec räumt beim Reality-Reset die aktiven Slots für das nächste Set frei. "
          + (ru8Offen ? "Paradoxically Attain ist bereits gesichert; deshalb darf Auto Achievements an bleiben." : "Der ausgeschaltete Achievement-Timer bewahrt die Bedingung für Paradoxically Attain im nächsten Lauf."),
        warumDetails: glyph ? [glyphGrund(glyph)] : ["Bei den angebotenen Glyphs hat Time mit EP-Multiplikator Vorrang für frühe EP-Käufe, danach Power mit AD-Potenz für den Produktions-Push. Ohne ausgelesenes passendes Angebot ist keine konkrete Angebotsnummer belegbar."] } }),
      leererSchritt(KONKRETE_SCHRITTE.realitySet.schrittId, "realitySet", { werte,
        inhalt: { warumDetails: glyphSetGruende(p, glyphAuswahl(p, glyph)) } }),
      ...(kauf ? [blackHole ? { ...kauf, inhalt: { ...kauf.inhalt, soGehts: [
        "Reality → Upgrades: Kauf in dieser Reihenfolge {ruListe}.",
        "Die verbleibenden {restRM} RM sind für das Black Hole im nächsten Schritt reserviert.",
      ] } } : kauf] : []),
      ...(blackHole ? [leererSchritt("schwarzesLochFreischalten", "schwarzesLoch", { inhalt: {
        kurz: "Kauf jetzt das erste Black Hole für 100 RM.",
        soGehts: ["Reality → Black Hole: Schalte das erste Black Hole für 100 RM frei.",
          `Danach bleiben ${zahl(nachKauf - 100)} RM. Intervall-Upgrades erst kaufen, wenn erneut genug RM vorhanden sind.`],
      } })] : []),
    ];
  }

  /* Die Quellbäume bleiben wörtlich erhalten. Die Ausgabe berücksichtigt das
     erstattbare TT-Budget und lässt noch gesperrte optionale Pfade weg. */
  function dilationAufbau(p) {
    const budget = studyBudget(p);
    // Achievements bleiben über Realities erhalten, Dilation-Fortschritt nicht.
    // Pins: erster Lauf Idle/PASS; danach Active unabhaengig von PASS/ACT.
    // r138/Split mit TP belegen auch dann Fortschritt, wenn die letzten zehn
    // Eternities keine dilatierten Abschluesse mehr enthalten.
    const active = (p.resources?.eternities ?? 0) >= 1_000_000 || (p.recentDilationCompletions ?? 0) >= 2
      || ((p.resources?.tachyonParticles ?? 0) > 0
        && (hat(p.achievementIds, 138) || p.hasDilationStudySplit || hat(p.studies, 121)));
    const optionen = { active, split: p.hasDilationStudySplit };
    const farmBaum = DATEN.planDilationTree(budget, p.clears, p.perks, optionen);
    const epBaum = DATEN.planDilationTree(budget, p.clears, p.perks, { ...optionen, ep: true });
    const alternative = !active ? DATEN.planDilationTree(budget, p.clears, p.perks, { ...optionen, active: true }) : null;
    const activeBaum = alternative?.split("|")[0].split(",").includes("121") ? alternative : null;
    const hinweis = [
      !p.hasDilationStudySplit ? "Ohne Time Study Split lassen die Imports den noch gesperrten dritten Dimensionspfad weg." : "",
      budget < 7858 ? `Für deine ${zahl(budget)} verfügbaren TT ist der Dilation-Baum verkürzt; er priorisiert AD+${active ? "Active" : hat(p.perks, 31) ? "Passive mit PASS" : "Idle"} und ab 2.945 TT TS192 + TS233.` : "",
      activeBaum ? "Nach den ersten zwei erfolgreichen Dilation-Läufen auf den zusätzlichen Active-Tree wechseln, auch unter 1 Mio. Eternities. Mit PASS eignet sich bereits der erste Passive-Lauf." : "",
      active && hat(p.perks, 31) ? "Für deinen fortgeschrittenen Dilation-Aufbau und den EP-/RM-Push Active verwenden, auch mit PASS ohne ACT. Dafür keine Million Eternities farmen." : "",
    ].filter(Boolean).join(" ");
    const epHandgriff = `Nach dem Import des EP-Push-Baums außerhalb von Dilation: ${activeHandgriff(p)} Crunch-Autobuyer ausschalten (TS181).`;
    return { farmBaum, epBaum, activeBaum, hinweis, epHandgriff };
  }

  /* Nach dem Dilation-Unlock: Tachyon-Partikel und Dilated Time aufbauen.
     Ein noch erreichbares RU13-Ziel sperrt dabei den Kauf von TD5 bis TD8. */
  function dilationZyklusSchritte(p) {
    const { farmBaum, epBaum, activeBaum, hinweis, epHandgriff } = dilationAufbau(p);
    const epStand = Math.max(0, Math.floor(p.maxEPExponent ?? 0));
    const rmZiel = (p.realities ?? 0) > 0 ? rmZielwerte(p, false) : null;
    const tdGesperrt = ru13NochMoeglich(p);
    const glyphZiel = !hat(p.realityUpgrades, 9) && !hat(p.realityUpgradeUnlocks, 9) && ru9NochMoeglich(p);
    const ersterLauf = !(p.resources?.tachyonParticles > 0);
    const budget = studyBudget(p);
    const idleFehlt = (p.resources?.eternities ?? 0) < 1_000_000
      && !hat(p.studies, 143) && !(hat(p.perks, 31) && hat(p.studies, 142));
    const replStudiesFehlen = budget >= 2945 && (!hat(p.studies, 192) || !hat(p.studies, 233));
    const korrektur = p.dilationActive && ersterLauf && (idleFehlt || replStudiesFehlen);
    const sekunden = Math.floor(p.currentEternityRealSeconds ?? 0);
    const laufzeit = sekunden < 60 ? `${sekunden} Sekunden` : sekunden < 3600
      ? `${Math.floor(sekunden / 60)} Minuten` : `${(sekunden / 3600).toLocaleString("de-DE", { maximumFractionDigits: 1 })} Stunden`;
    const communityZeit = ersterLauf
      ? hat(p.perks, 31) ? "PASS verstärkt den ersten Passive-Lauf. Für diese Perk- und Glyph-Kombination ist keine verlässliche Dauer aus dem Save ableitbar; die Idle-Zeiten ohne PASS gelten hier nicht."
        : budget >= 7858 ? "Erster erfolgreicher Dilation-Lauf: grob 30–60 Minuten mit vollständigem Idle-Aufbau (Pins / Wiki-Guide). Mit Reality-Boni oft schneller. Das ist eine Laufdauer als Orientierung, keine verbleibende Wartezeit."
        : budget >= 2945 ? "Bei früh gekaufter Dilation mit verkürztem AD+Idle-Aufbau und TS192 + TS233 nennen die Pins bis etwa 1 Stunde 15 Minuten. Glyphs und Upgrades können das deutlich verkürzen; keine Restzeit-Prognose."
          : "Unter 2.945 verfügbaren TT nennen die Pins etwa 3 Stunden, im ungünstigen Fall bis 4 Stunden für den ersten Dilation-Lauf. Voraussetzung: AD+Idle und etwa 100.000, besser 200.000–300.000 Eternities; mit guten Glyphs/Upgrades schneller."
      : (p.realities ?? 0) === 0
        ? "Späte Dilation-Upgrades können laut Pins 7–10 Stunden brauchen: ×3 TP für 2,56e17 DT sowie ×2 DT und die TG-Schwelle für e18 DT. Das gilt für diese späten Käufe, nicht für jeden Dilation-Lauf. Die Timer im Spiel sind für deinen Stand genauer."
        : "Für spätere Realities gibt es wegen Glyphs und Upgrades keine feste Laufdauer. Nutze die Timer an den Dilation-Upgrades; die Zeiten des ersten Durchlaufs sind keine Restzeit-Prognose.";
    const laufInhalt = p.dilationActive ? korrektur ? {
      kurz: "Korrigiere den Baum für deinen ersten Dilation-Lauf.",
      soGehts: [
        idleFehlt ? "Deine Dilation läuft bereits, aber unter 1 Mio. Eternities fehlt dem aktuellen Baum der Idle-Pfad. Ohne PASS ist das für den ersten Lauf ungünstig."
          : "Deine Dilation läuft bereits, aber TS192 oder TS233 fehlt im Baum, obwohl deine TT dafür reichen. Diese Studies helfen beim Replicanti-Aufbau im ersten Lauf.",
        "Eternity → Time Dilation: Verlasse den Versuch über Exit Dilation. Falls Eternity schon verfügbar ist, beende ihn stattdessen damit und nimm die ersten Tachyon Particles mit.",
        "Außerhalb von Dilation Respec time studies aktivieren, Eternity drücken und den Dilation-Baum unten importieren. Danach Dilate time drücken.",
        "Diesen neuen Lauf mit dem Dilation-Baum wachsen lassen, bis der Eternity-Knopf verfügbar ist (etwa 1,79e308 IP). Dann Eternity drücken und den Save neu einlesen.",
        "{tdHandgriff}",
        "{activeHandgriff}",
      ],
    } : {
      kurz: ersterLauf ? "Lass deinen laufenden Dilation-Versuch bis zu den ersten Tachyon Particles weiterlaufen."
        : "Sammle im laufenden Dilation-Versuch Dilated Time und mehr Tachyon Particles.",
      soGehts: [
        "Dilation läuft bereits. Lass den aktuellen Baum stehen; jetzt weder respecen noch erneut Dilate time / Exit Dilation drücken. Die Bäume unten sind für spätere Baumwechsel.",
        ersterLauf ? "Lass Dimensionen, Tickspeed, Dimboosts, Galaxien und Replicanti weiter aufbauen. Auch minutenlang langsamer IP-Fortschritt kann beim ersten Lauf normal sein."
          : "Kauf die bezahlbaren Dilation-Upgrades: ×3 TP und ×2 DT zuerst. Kostet ×3 TP mindestens 1,33-mal so viel wie ×2 DT, hat ×2 DT Vorrang.",
        ersterLauf ? "Sobald der Eternity-Knopf verfügbar ist (etwa 1,79e308 IP), drück Eternity. Dadurch erhältst du deine ersten Tachyon Particles; erst danach entsteht Dilated Time. Lad anschließend den Save neu ein."
          : "Nach dem nächsten ×3-TP-Kauf den Lauf mit Eternity beenden, sobald dabei zusätzliche Tachyon Particles angezeigt werden. Anschließend mit dem Dilation-Baum neu starten; EP nur außerhalb von Dilation pushen.",
        ...(!ersterLauf ? ["Falls du dabei den Baum wechseln willst: vor dieser Eternity Respec time studies aktivieren. Erst nach dem Ende des dilatierten Laufs den EP-Push-Baum importieren; vor der Rückkehr zu Dilation außerhalb erneut respecen und eternitieren, dann den Dilation-Baum laden."] : []),
        "{tdHandgriff}",
        "{activeHandgriff}",
      ],
    } : {};
    return [leererSchritt(KONKRETE_SCHRITTE.realityDilationZyklus.schrittId, "dilationZyklus", {
      inhalt: { ...laufInhalt, communityZeit },
      /* Exponenten bekommen keinen Tausenderpunkt: e1.320 liest sich wie eine
         Kommazahl, gemeint ist e1320. */
      werte: {
        standEP: String(epStand),
        activeHandgriff: epHandgriff,
        tdHandgriff: tdGesperrt
          ? "Dimensions → Time Dimensions: TD5–8 nicht kaufen, bis du e4000 EP erreicht, eternitiert und The Telemechanical Process (Reihe 3, Spalte 3) unter Reality → Upgrades freigeschaltet hast."
          : "Eternity → Time Studies: Kauf die Dilation-Studies für TD5–8, sobald genügend freie Time Theorems da sind. Dimensions → Time Dimensions: Kauf die freigeschalteten Dimensionen.",
      },
      hinweis: (p.dilationActive ? `Im Save läuft dieser Versuch seit ${laufzeit}. ${ersterLauf ? "Noch 0 Tachyon Particles; der erste erfolgreiche Abschluss steht aus. " : ""}` : "")
        + `Zwischenziel: e4000 EP im Rekord dieser Reality; aktuell e${epStand}. `
        + (glyphZiel ? "Für Linguistically Expand (Reihe 2, Spalte 4) bis zur Eternity bei e4000 EP genau den einen Level-3+-Glyph ausgerüstet lassen. Danach ohne Shift Cost: prüfen; die Bedingung bleibt gespeichert. " : "")
        + (rmZiel ? `Reset-Ziel: mindestens ${zahl(rmZiel.zielRM)} RM Gewinn im Reality-Knopf. Zusammen mit deinen ${zahl(rmZiel.bankRM)} RM sind das ${zahl(rmZiel.bankRM + rmZiel.zielRM)} RM für ${rmZiel.zielKauf}. ${tdGesperrt ? "Erst die e4000-EP-Bedingung per Eternity sichern, danach TD5–8 kaufen. " : "TD5–8 bereits jetzt freischalten und kaufen, sobald TT und EP reichen. "}Die Reality-Study kaufen, sobald ihre Bedingungen erfüllt sind. Außerhalb von Dilation mit dem EP-Push-Baum bis zum RM-Ziel weiterspielen, dann die nächste Reality starten. Basis-Richtwert: e${rmZiel.zielEP} EP; die RM-Anzeige im Spiel entscheidet.`
          : "Ab e4000 EP wirft der Reality-Knopf Reality Machines ab.")
        + (hinweis ? ` ${hinweis}` : ""),
      baeume: [
        { bezeichnung: `${p.dilationActive && !korrektur ? "Für den nächsten Dilation-Start" : "Dilation-Baum"} · ${zahl(baumKosten(farmBaum))} TT`, importString: farmBaum },
        ...(activeBaum ? [{ bezeichnung: `Ab dem dritten erfolgreichen Dilation-Lauf: Active-Tree · ${zahl(baumKosten(activeBaum))} TT`, importString: activeBaum }] : []),
        { bezeichnung: `EP-Push-Baum zwischen den Dilation-Läufen · ${zahl(baumKosten(epBaum))} TT`, importString: epBaum },
      ].filter(b => b.importString),
      baeumeSichtbar: true,
    })];
  }

  /* ---------------- Dilation ----------------
     Der Zyklus allein ist keine Anleitung. Zwischen dem Dilation-Unlock und der
     ersten Reality stehen genau drei bezifferte Tore: die vier Dilation-Studies
     fuer Time Dimension 5 bis 8, der EP-Rekord von e4000 und die Reality-Study.
     Kosten aus dilation-time-studies.js, Schwelle aus derselben Datei, Zeile 48. */
  const TD_STUDIES = [
    { id: 2, td: 5, kosten: 1e6, text: "1 Mio." },
    { id: 3, td: 6, kosten: 1e7, text: "10 Mio." },
    { id: 4, td: 7, kosten: 1e8, text: "100 Mio." },
    { id: 5, td: 8, kosten: 1e9, text: "1 Mrd." },
  ];

  function konkreteDilation(p) {
    const gekauft = new Set(p.dilationStudies ?? []);
    const tt = Math.max(0, p.unspentTT ?? 0);
    const epStand = Math.max(0, Math.floor(p.maxEPExponent ?? 0));
    const schritte = dilationZyklusSchritte(p);
    const meilenstein = { ...MEILENSTEINE.find(m => m.id === "dilation") };
    const { epBaum, hinweis, epHandgriff } = dilationAufbau(p);

    const naechsteTd = TD_STUDIES.find(eintrag => !gekauft.has(eintrag.id));
    if (naechsteTd) {
      schritte.push(leererSchritt(KONKRETE_SCHRITTE.dilationTd.schrittId, "dilationTd", {
        werte: {
          tdNummer: String(naechsteTd.td),
          tdKosten: naechsteTd.text,
          tdOffen: TD_STUDIES.filter(eintrag => !gekauft.has(eintrag.id))
            .map(eintrag => `TD${eintrag.td} für ${eintrag.text} TT`).join(", "),
          standTT: tt >= 1 ? Math.floor(tt).toLocaleString("de-DE") : "0",
        },
      }));
    }

    if (epStand < 4000) {
      schritte.push(leererSchritt(KONKRETE_SCHRITTE.dilationEpPush.schrittId, "dilationEpPush", {
        werte: {
          standEP: String(epStand),
          fehlendeEP: String(Math.max(0, 4000 - epStand)),
          activeHandgriff: epHandgriff,
        },
        baeume: epBaum ? [{ bezeichnung: `EP-Push-Baum bis e4000 EP · ${zahl(baumKosten(epBaum))} TT`, importString: epBaum }] : [],
        baeumeSichtbar: true,
        ...(hinweis ? { hinweis } : {}),
      }));
    } else if (!p.realityStudyBought && !naechsteTd) {
      schritte.push(leererSchritt(KONKRETE_SCHRITTE.dilationRealityStudy.schrittId, "dilationRealityStudy", {
        /* Exponenten bekommen keinen Tausenderpunkt: e1.320 liest sich wie eine
         Kommazahl, gemeint ist e1320. */
      werte: { standEP: String(epStand) },
      }));
    }

    if (epStand >= 4000 && !naechsteTd) {
      schritte.splice(schritte.findIndex(s => s.gruppe === "dilationZyklus"), 1);
      if (!(p.hasRealityAchievementRows || p.hasRealityAchievementRows == null || hat(p.perks, 0))) {
        const fehlt = Array.from({ length: 13 }, (_, r) => Array.from({ length: 8 }, (_, c) => (r + 1) * 10 + c + 1))
          .flat().filter(id => !hat(p.achievementIds, id));
        schritte.unshift(aktion("dilationRealityStudyKaufen", "realityAchievements",
          "Vervollständige die ersten 13 Achievement-Reihen für die Reality-Study.",
          ["Noch offen: " + fehlt.map(id => "r" + id).join(", ") + ".", "Diese Achievements sind vor deiner ersten Reality eine echte Study-Bedingung. Kauf danach die Reality-Study."],
          "Alle ersten 13 Reihen sind vollständig.", "Vor der ersten Reality sind die ersten 13 Achievement-Reihen Voraussetzung für die Reality-Study."));
      }
      schritte.push(aktion("dilationRealityStudyKaufen", "ersteReality",
        (p.gainedRMEstimate ?? 0) >= 2 ? "Beende die erste Reality für mindestens 2 RM." : "Push vor der ersten Reality auf mindestens 2 RM.",
        ["Die Discord-Route empfiehlt für die erste Reality 2–3 RM. Für 2 RM brauchst du ungefähr e4149 EP; entscheidend ist die Anzeige im Reality-Knopf.",
          "Sobald die Study gekauft ist und der Knopf mindestens 2 RM zeigt, löse die erste Reality aus. Danach den Save neu einlesen: Glyph, Perk-Punkt und Käufe sind dann verfügbar."],
        "Die erste Reality ist abgeschlossen.", "2–3 RM erlauben einen besseren Start in den zweiten Lauf als ein sofortiger Reset für nur 1 RM."));
    }

    return {
      phase: "dilation",
      schritte: schritte.slice(0, MAX_SICHTBAR),
      meilenstein: { ...meilenstein, restSchritte: Math.min(schritte.length, MAX_SICHTBAR) },
      hinweise: [],
    };
  }

  function konkreteReality(p) {
    const tt = Math.max(0, Math.floor(p.totalTT ?? 0));
    const epStand = Math.max(0, Math.floor(p.maxEPExponent ?? 0));
    const meilenstein = { ...MEILENSTEINE.find(m => m.id === "ersteReality") };

    const schritte = [];

    /* Die erste Upgrade-Reihe hat keine Sonderbedingung und ist der billigste
       dauerhafte Gewinn, deshalb steht sie ganz oben. Sie schließt aber nichts
       anderes aus: die Bedingungen der zweiten Reihe sammelst du im selben Lauf. */
    const reiheEins = [1, 2, 3, 4, 5].every(id => (p.realityRebuyables?.[id] ?? 0) >= 1);
    const startKauf = ersteRealityKaeufe(p);
    if (startKauf) {
      schritte.push(startKauf);
      p = { ...p, resources: { ...p.resources, realityMachines: (p.resources?.realityMachines ?? 0) - startKauf.kosten },
        realityRebuyables: { ...p.realityRebuyables, ...Object.fromEntries(startKauf.kaufIds.map(id => [id, 1])) } };
    }

    /* Das Zeitfenster direkt nach einem Reset: hier lassen sich RU6 bis RU10
       noch einsammeln. Sobald die erste Eternity durch ist, ist es vorbei und
       der Hinweis darauf wäre nur noch Lärm. */
    const frisch = reiheEins ? konkreteFrueheReality(p) : null;
    if (frisch) {
      schritte.push(...frisch.schritte);
      return {
        phase: "reality",
        schritte,
        meilenstein: frisch.meilenstein,
        hinweise: [],
      };
    }

    /* Ein bezahlbarer Kauf ist eine Handlung von jetzt und steht vorne. Ein
       Sparziel ist nur eine Reservierung und kommt hinter den Lauf, der die RM
       ueberhaupt erst verdient. */
    const kauf = ruKaufSchritt(p);
    if (kauf && kauf.gruppe === "ruJetztKaufen") {
      schritte.push(kauf);
      p = { ...p, realityUpgrades: [...(p.realityUpgrades ?? []), ...kauf.kaufIds],
        resources: { ...p.resources, realityMachines: (p.resources?.realityMachines ?? 0)
          - kauf.kaufIds.reduce((sum, id) => sum + RU_KOSTEN.get(id), 0),
          eternities: kauf.kaufIds.includes(10) ? Math.max(100, p.resources?.eternities ?? 0) : p.resources?.eternities } };
    }
    const glyphSet = glyphAuffuellenSchritt(p);
    if (glyphSet) {
      if (kauf?.kaufIds?.includes(9)) glyphSet.gruppe = "glyphNachExpand";
      schritte.push(glyphSet);
    }

    const perk = perkSchritt(p);
    if (perk) {
      schritte.push(perk);
      p = { ...p, perks: [...(p.perks ?? []), ...perk.kaufIds] };
    }
    const epZiel = !p.dilationUnlocked && epStand < 70
      && !p.currentChallenge?.eternity && hat(p.realityUpgrades, 8) && hat(p.realityUpgrades, 10)
      ? [ZIELE.find(z => z.id === "ru15")]
        .find(z => !z.istErledigt(p) && z.istNochMoeglich(p)) : null;
    if (epStand < 4000) {
      schritte.push(...zieleAuswerten(p, "reality", [
        "realityRequirements", ...(epZiel ? [] : ["realityEpSchwellen"]), "realityGlyphSchwelle",
      ]).schritte);
    }

    if (epZiel) {
      const id = 15;
      const zielEP = 10;
      const schutz = [15,12].filter(n => {
        const z = ZIELE.find(z => z.id === `ru${n}`);
        return !z.istErledigt(p) && z.istNochMoeglich(p) && !hat(p.realityRequirementLocks, n);
      });
      const zielTT = DATEN.earlyEternityCheckpoints.find(c => c.tt > tt)?.tt
        ?? Math.max(tt, DATEN.epFarmStages(p.clears, p.perks, p.achievementIds).at(-1).tt);
      const aufbau = epFarmAufbau(p, zielTT);
      const handgriffe = [
        ...(schutz.length ? [`Jetzt unter Reality → Upgrades mit Shift-Klick die offenen Schlösser bei ${schutz.map(n => ruName(n, true)).join("; ")} schließen. Bereits geschlossene Schlösser nicht erneut anklicken.`] : []),
        ...(!(p.timeDimensionsUnlocked > 0) ? ["Mit den jetzt vorhandenen EP zuerst TD1 kaufen; weitere bezahlbare TD1–4 mitkaufen."] : []),
        ...aufbau.soGehts.filter(t => !t.startsWith("Time Dimensions und ×5 EP")),
        "TD1–4 und AM-/IP-/EP-Theorems weiterkaufen. Multiply Eternity Points by 5 und dessen Autobuyer bleiben aus. Wenn du jetzt schon e10 EP erhältst, kannst du direkt eternitieren.",
        ...((p.resources?.eternities ?? 0) >= 100 ? [`Für den abschließenden Ziel-Lauf: „Eternity at X EP“ mit e${zielEP}, „Dynamic amount“ aus, Eternity-Autobuyer an. Bis zum Reset warten; TD1–4 und Theorems weiterkaufen. Das Ziel meint EP-Gewinn pro Reset. Stockt der Lauf vorher, kleinere EP-Gewinne manuell einsammeln und weiter ausbauen.`] : []),
        `Wiederholt EP einsammeln und den Baum ausbauen, bis du nach einer Eternity mindestens e${zielEP} EP besitzt. Falls eine TT-Marke vorher erreicht ist, den Save für den nächsten Baum neu einlesen; die EP-Bedingung bleibt das Ziel.`,
        `Nach der Eternity unter Reality → Upgrades bei ${ruName(id, true)} ohne Shift auf Cost: prüfen. Danach ×5-EP-Käufe und ihren Autobuyer einschalten. Die 50 RM für diesen Upgrade-Kauf vorerst zurückhalten: Zuerst The Knowing Existence und Linguistically Expand finanzieren.`,
      ];
      const farm = aktion("eternityNaechstenCheckpointFarmen", "realityEpFarm",
        `Nächstes EP-Ziel: e${zielEP} EP für ${ruName(id)}.`, handgriffe,
        `${ruName(id)} zeigt ohne Shift Cost:. Danach den Save neu einlesen.`,
        "Die Einschränkung läuft während des EP-Aufbaus mit. Der Tree passt zu deinem aktuellen TT-Budget; spätere Bäume erst ab ihrer TT-Marke laden.");
      farm.baeume = aufbau.baeume;
      farm.baeumeSichtbar = true;
      schritte.push(farm);
      return { phase: "reality", schritte, meilenstein, hinweise: [] };
    }

    if (!p.dilationUnlocked) {
      /* Studies sind nach dem Reset leer. Erst der Baum, dann die EC-Route —
         dieselben Daten wie in den Phasen earlyEternity und eternityChallenges. */
      /* Nur die Time-Theorem-Zahl entscheidet, nicht der Studienbestand: nach
         einem Respec ist der Baum leer, aber die Checkpoint-Liste endet bei
         130 TT. Wer darueber steht und keine Studies hat, bekaeme sonst gar
         keinen Schritt — die EC-Route bringt ihren eigenen Farm-Tree mit. */
      let kern = tt < 130 && !ec1FuerUpgradeOffen(p) ? konkreteFrueheEternity(p) : konkreteEcRoute(p);
      if (!kern.schritte.length) kern = konkreteEcRoute(p);
      schritte.push(...kern.schritte);
    } else if (epStand < 4000) {
      schritte.push(...dilationZyklusSchritte(p));
    } else {
      if (hat(p.realityUpgrades, 9) && hat(p.realityUpgrades, 13)) {
        schritte.push(...realitySpaeteZiele(p));
      }
      const zielwerte = rmZielwerte(p);
      const minimum = rmZielwerte(p, false);
      const gewinn = Math.max(0, Math.floor(p.gainedRMEstimate ?? 0));
      if (gewinn < minimum.zielRM) {
        const { epBaum, epHandgriff } = dilationAufbau(p);
        schritte.push(leererSchritt(KONKRETE_SCHRITTE.realityRm.schrittId, "realityRm", {
          werte: { standRM: gewinn, ...minimum, activeHandgriff: epHandgriff },
          ...(p.realityAvailable ? { inhalt: {
            kurz: `Reality ist schon möglich. Empfehlung: Push von etwa ${zahl(gewinn)} auf ${zahl(minimum.zielRM)} RM Gewinn.`,
          } } : {}),
          baeume: [{ bezeichnung: `EP-Push-Baum bis ${minimum.zielRM} RM`,
            importString: epBaum }].filter(b => b.importString),
          baeumeSichtbar: true,
        }));
      }
      if (gewinn >= minimum.zielRM) {
        const reset = realityResetSchritte(p);
        if (gewinn < zielwerte.zielRM) reset[0].vorab = [
          `Du kannst jetzt resetten; die folgende Kaufliste ist bereits finanzierbar. Optionales größeres Ziel: ${zahl(zielwerte.zielRM)} RM Gewinn für ${zielwerte.zielKauf}. Dafür fehlen noch etwa ${zahl(zielwerte.zielRM - gewinn)} RM Gewinn.`,
          "Die Wartezeit dafür lässt sich aus diesem einzelnen Save nicht zuverlässig bestimmen. Wenn du weiterpushen möchtest, prüfe den RM-Zuwachs nach 5–10 Minuten mit dem EP-Push-Baum. Das ist ein kurzer Versuch, keine Zeitprognose. Bei kaum Fortschritt jetzt resetten und das Black Hole später kaufen.",
        ];
        schritte.push(...reset);
      }
    }

    const resetGeplant = schritte.some(schritt => schritt.gruppe === "realityReset");
    if (kauf && kauf.gruppe === "ruSparziel" && !resetGeplant
      && !schritte.some(schritt => ["realityRm", "dilationZyklus"].includes(schritt.gruppe))) schritte.push(kauf);

    /* Bereits vorhandene weitere Ziele auffuellen; unerreichbare Bedingungen
       erzeugen in diesem Plan keine zusaetzlichen Hinweise. */
    const rest = resetGeplant ? [] : zieleAuswerten(p, "reality", ["schwarzesLoch", "automator"]).schritte;
    schritte.push(...rest);

    return {
      phase: "reality",
      schritte: schritte.slice(0, MAX_SICHTBAR),
      meilenstein: { ...meilenstein, restSchritte: Math.min(schritte.length, MAX_SICHTBAR) },
      hinweise: [],
    };
  }

  function realitySpaeteZiele(p) {
    const s = [];
    const offen = id => !hat(p.realityUpgrades, id) && !hat(p.realityUpgradeUnlocks, id);
    const aktiv = (p.activeGlyphs ?? []).filter(g => g.type !== "companion");
    const alle = [...aktiv, ...(p.inventoryGlyphs ?? []).filter(g => g.type !== "companion")];
    if ([16,17,18,19].every(id => hat(p.realityUpgrades, id))) {
      if (offen(11)) s.push(aktion("spaeteRealityUpgrades", "realityInfinityFarm", "Farme 1e12 Banked Infinities für The Boundless Flow.",
        [`Im Save sind ${zahl(p.resources?.bankedInfinities ?? 0)} Banked Infinities. TS191 kaufen: Beim Eternity werden mindestens 5 % der Infinities gebankt.`,
          "Mit Innumerably Construct, dem Boundless Amplifier und TS32 viele Infinities in kurzen Crunches sammeln. Bei rund 2e13 Infinities reicht eine Eternity mit TS191 selbst ohne zusätzlichen Banking-Bonus für das Ziel.",
          "Nach dem Banking The Boundless Flow (Reihe 3, Spalte 1) für 50 RM kaufen. Ein weiterer Reality-Reset ist für die Anforderung nicht nötig."], "The Boundless Flow ist gekauft."));
      if (offen(14)) s.push(aktion("spaeteRealityUpgrades", "realityEternityFarm", "Farme 1e7 Eternities für The Eternal Flow.",
        [`Du hast ${zahl(p.resources?.eternities ?? 0)} Eternities. Mit kurzen automatischen Eternities bis 10 Millionen farmen; der Eternal Amplifier verstärkt den Ertrag.`,
          "Ein Time-Glyph mit Eternity-Multiplikator hilft, falls du ihn ohnehin im Set hast. Nach dem Ziel The Eternal Flow (Reihe 3, Spalte 4) für 50 RM kaufen."], "The Eternal Flow ist gekauft."));
    }
    const glyphZiele = [[16, g => (g.rarity ?? (g.strength - 1) * 40) >= 20, "mindestens 20 % Seltenheit"],
      // RU17 zaehlt die Bits der Effektmaske (reality-upgrades.js), nicht die
      // benannten Effekte. Sonst faellt ein Time-Glyph mit timeshardpow durch.
      [17, g => (g.effectCount ?? glyphEffekte(g).length) >= 2, "mindestens zwei Effekte"],
      [18, g => g.level >= 10, "mindestens Level 10"]];
    const naechstes = glyphZiele.find(([id]) => offen(id));
    if (naechstes) {
      const [id, passt, kriterium] = naechstes;
      const vorhanden = alle.filter(passt).length;
      s.push(aktion("spaeteRealityUpgrades", "realityGlyphZiel", `${ruName(id, true)}: beende eine Reality mit vier passenden Glyphs.`,
        [`Alle vier brauchen ${kriterium}. Im Bestand passen ${vorhanden}, davon ${aktiv.filter(passt).length} aktiv.`,
          vorhanden < 4 ? "Farm zuerst die noch fehlenden Glyphs in kurzen Realities. Bewahre die passenden Exemplare auf."
            : aktiv.filter(passt).length < 4 ? "Beim nächsten Reality-Reset Glyph Respec aktivieren, anschließend vier passende Glyphs ausrüsten und mit diesem Set einen weiteren Lauf abschließen."
              : "Das aktive Set erfüllt die Glyph-Bedingung. Beim nächsten Reality-Abschluss wird sie gespeichert.",
          `Spar 1.500 RM für ${ruName(id)}. Ein gespeichertes Requirement allein gibt den Bonus noch nicht.`], `${ruName(id)} zeigt Cost: 1.50e3 RM oder ist gekauft.`,
        ruGrund(id) + ` Die Bedingung prüft beim Reality-Abschluss vier aktive Glyphs mit jeweils ${kriterium}; bloßer Inventarbesitz zählt nicht. Deshalb wird vor dem Lauf genau dieses Merkmal geprüft.`));
    } else if (offen(19)) s.push(aktion("spaeteRealityUpgrades", "realitySacrifice", `Sammle 30 Glyphs für ${ruName(19, true)}.`,
      [`Du besitzt ${alle.length} Glyphs ohne Companion. Bis 30 keine davon entfernen; mit mindestens 30 eine Reality abschließen.`,
        "Kauf Scour to Empower für 1.500 RM. Danach schwache Ersatzglyphs mit Shift-Klick opfern; aktive Builds und noch nötige Requirement-Glyphs behalten."], "Glyph Sacrifice ist verfügbar."));
    else if (offen(20)) s.push(aktion("spaeteRealityUpgrades", "realityBh2", `Sammle 100 Spieltage seit dem ersten Black Hole für ${ruName(20, true)}.`,
      [`Seit dem Unlock sind im Save ungefähr ${Math.floor((p.gameTimeSinceBlackHoleMs ?? 0) / 86400000)} Spieltage vergangen. Das sind Spieltage mit Beschleunigung, keine 100 realen Tage.`,
        "Das Black Hole weiter ausbauen und normale Realities spielen. Nach erfüllter Zeitbedingung 1.500 RM für das zweite Black Hole ausgeben."], "Das zweite Black Hole ist gekauft."));
    const row4 = [16,17,18,19].every(id => hat(p.realityUpgrades, id));
    if (row4) {
      const ziel = [25,23,21,22,24].find(offen);
      if (ziel) {
        const wie = {
          25: ["Mit dem normalen EP-/RM-Set auf e11111 EP pushen und Eternity auslösen. Der EP-Rekord bleibt gespeichert.", "Danach 100.000 RM für den Reality-Autobuyer sparen."],
          23: ["Black Holes pausieren und Game-Speed-Glyphs ablegen. Einen frischen Lauf in unter 15 Minuten Spielzeit abschließen; Perks und Automator beschleunigen die Klickfolge.", "Anschließend Black Holes wieder einschalten und Replicative Rapidity für 100.000 RM kaufen."],
          21: ["Dilation-Glyphs mit DT-Multiplikator und Replication-Glyphs mit Replicanti-Speed + DT-Multiplikator ausrüsten. Die zusätzlichen Tachyon-Galaxien tragen diesen Push.", "Bis insgesamt 2800 Antimatter-, Replicanti- und Tachyon-Galaxien pushen. Cosmic Conglomerate für 100.000 RM kaufen."],
          22: ["Time-Glyphs mit TD-Potenz sowie Replication mit Replicanti-Speed + Multiplikator verwenden. Auf e28000 Time Shards pushen.", "Temporal Transcendence anschließend für 100.000 RM kaufen."],
          24: ["Glyph Respec vor dem nächsten Reset aktivieren. Im neuen Lauf alle normalen Glyph-Slots leer lassen und das Requirement Lock setzen.", "Bis mindestens 5000 RM im Reality-Knopf pushen und ohne normale Glyphs resetten. Synthetic Symbolism für 100.000 RM kaufen."],
        }[ziel];
        s.push(aktion("spaeteRealityUpgrades", "realityRow5", `Erfüll als Nächstes ${ruName(ziel, true)}.`, wie,
          `${ruName(ziel)} ist gekauft.`, ruGrund(ziel) + " " + {
            25: "Die Bedingung verlangt e11111 EP; deshalb wird hier der normale EP-Push bis zu genau diesem Rekord fortgesetzt.",
            23: "Die Grenze zählt Spielzeit, deshalb würden Black Holes und Game-Speed-Glyphs den Timer schneller verbrauchen. Perks und Automation sparen dagegen echte Bedien- und Aufbauzeit.",
            21: "Alle Galaxientypen zählen. DT-Effekte und Replicanti-Geschwindigkeit liefern zusätzliche TGs und RGs für die Gesamtsumme von 2800.",
            22: "Gefordert sind Time Shards. TD-Potenz erhöht deren Produktion direkt; der Replicanti-Multiplikator kann über TS103 auch Time Dimensions verstärken.",
            24: "Der fünfte Slot wird durch einen Lauf ganz ohne normale Glyphs verdient. Deshalb vorher respecen und das Lock setzen; ein versehentlich ausgerüsteter Glyph würde die Bedingung verlieren.",
          }[ziel]));
      }
    }
    return s;
  }

  // Strategy order and builds: supplied DiscordPins_Und_Tipps.txt. These are
  // recommendations, not calculated completion guarantees. Actual unlock bits
  // always win over the route, so a completed detour is never prescribed again.
  const GLYPH_TYPEN = { p: "Power", i: "Infinity", r: "Replication", t: "Time", d: "Dilation",
    e: "Effarig", y: "Reality", c: "Cursed" };
  const glyphBuild = code => Object.entries([...code].reduce((a, c) => ({ ...a, [c]: (a[c] ?? 0) + 1 }), {}))
    .map(([c, n]) => `${n}× ${GLYPH_TYPEN[c]}`).join(" + ");
  const rmLog = p => p.resources?.realityMachinesLog10 ?? Math.log10(p.resources?.realityMachines || 1);

  function namelessSchritte(p) {
    const n = p.celestials?.enslaved ?? {};
    const schritte = [];
    const add = (gruppe, kurz, wie, fertig) => schritte.push(aktion("namenloseRealityLoesen", gruppe, kurz, wie, fertig,
      "Der vollständige Nameless-Guide in deinen Discord-Pins nutzt diese Ausnahmen. Erledigte Puzzle-Entdeckungen werden anhand des Saves übersprungen."));
    if (!n.running) add("namelessStart", "Starte die Nameless-Reality mit 2× Power und 3× Time.",
      ["Speichere vorher ungefähr eine Sekunde reale Zeit als Black-Hole-Spielzeit. Rüste Power mit AD-Multiplikator und Time mit Eternity-Gewinn aus; vier Effekte und 100 % Seltenheit sind ideal.",
        "Starte die Nameless-Reality. Farm dafür kein zusätzliches Level: Die Glyphs werden im Lauf auf mindestens Level 5000 angehoben."], "Du bist in der Nameless-Reality.");
    if (!hat(n.progress, 5)) add("namelessStudy", "Klicke die versteckte Time Study 12 für 100 kostenlose TT.",
      ["Im Time-Study-Baum auf den leeren Bereich rechts von TS11 klicken, wo TS12 liegen würde."], "TS12 hat dir 100 TT gegeben.");
    if (!hat(n.progress, 2)) add("namelessFeel", "Drücke FEEL ETERNITY im Break-Infinity-Tab.",
      ["Öffne Infinity → Break Infinity. Der veränderte violette Knopf ersetzt hier Fix Infinity; drücke ihn."], "FEEL ETERNITY ist ausgelöst.");
    if (!p.dilationUnlocked) add("namelessDilation", "Kombiniere EC6 mit C10 und öffne Dilation bei ungefähr 7200 TT.",
      ["Starte EC6 und darin zusätzlich die Normal Challenge C10. EC6 macht Replicanti-Galaxien billiger; C10 erlaubt Antimatter-Galaxien mit AD6.",
        "Hol mit C10 auch die anderen EC-Abschlüsse, dann EC10 mit C10. Die Kombination ist auch nach fünf EC6-Abschlüssen weiter nützlich.",
        "Kauf den kürzesten Weg zu Dilation, sobald die freien TT reichen. Gespeicherte Zeit noch behalten."], "Dilation und ihre TT-Erzeugung sind offen.");
    if ((p.clears?.[0] ?? 0) < 180) add("namelessEc1", `Steigere EC1 von ${p.clears?.[0] ?? 0} auf etwa 180 Abschlüsse.`,
      ["EC1 ist hier absichtlich nicht bei fünf Abschlüssen begrenzt. Spiel EC1 mit C10 und nutz die zusätzlichen Abschlüsse.",
        "Wechsel zu EC6+C10, um den EP-/TT-Rekord weiterzuschieben, und dann zurück zu EC1+C10."], "EC1 liegt ungefähr bei 180 Abschlüssen.");
    add("namelessEnde", "Push EC1 Richtung 220 Abschlüsse und beende den Puzzle-Lauf.",
      ["Wechsel weiter zwischen EC6+C10 und EC1+C10. Entlade die vorbereitete Black-Hole-Zeit im späten EC1+C10-Push.",
        "Mit ungefähr 220 EC1-Abschlüssen geht der abschließende EP-Push in EC6+C10. Kauf bei e4000 EP die Reality-Study und beende den Lauf."], "Die Nameless-Reality ist abgeschlossen.");
    return schritte;
  }

  const V_ZIELE = [
    ["Glyph Knight", [-5, -4, -3, -2, -1, 0]],
    ["AntiStellar", [4000, 4300, 4600, 4900, 5200, 5500]],
    ["Se7en deadly matters", [600000, 720000, 840000, 960000, 1080000, 1200000]],
    ["Young Boy", [400000000, 450000000, 500000000, 600000000, 700000000, 800000000]],
    ["Eternal Sunshine", [7000, 7600, 8200, 8800, 9400, 10000]],
    ["Matterception", [51, 52, 53, 54, 55, 56]],
  ];
  const V_ROUTE = [[0,1],[0,2],[0,3],[0,4],[5,1],[5,2],[5,3],[5,4],[2,1],[2,2],[2,3],[2,4],
    [0,5],[1,1],[1,2],[3,1],[4,1],[4,2],[1,3],[3,2],[2,5],[2,6],[4,3],[4,4],[3,3],[3,4],
    [1,4],[5,5],[4,5],[3,5],[4,6],[1,5],[3,6],[5,6],[0,6],[1,6]];

  function vSchritte(p) {
    const v = p.celestials?.v ?? {};
    const s = [];
    const add = (gruppe, titel, wie, fertig, warum) => s.push(aktion("vAnforderungenSteigern", gruppe, titel, wie, fertig,
      warum ?? "Die nächste V-Etappe braucht mehr Produktionsstärke. Höhere RM verbessern die wiederkaufbaren Boni; bessere Glyphs und Sacrifice verstärken den anschließenden V-Lauf. Die Farmmarke ist ein Routenrichtwert, keine harte Eintrittsbedingung."));
    if (!hat(v.unlocks, 0)) {
      const r = p.resources ?? {};
      const fehlt = [[p.realities >= 10000, "10.000 Realities"], [r.eternities >= 1e70, "e70 Eternities"],
        [r.infinities + (r.bankedInfinities ?? 0) >= 1e160, "e160 Infinities einschließlich Bank"],
        [r.maxDilatedTimeExponent >= 320, "e320 Dilated Time als Rekord dieser Reality"],
        [r.maxReplicantiExponent >= 320000, "e320000 Replicanti als Rekord dieser Reality"],
        [rmLog(p) >= 60, "e60 RM im Bestand"]].filter(([fertig]) => !fertig).map(([, text]) => text);
      return [aktion("vFreischalten", "vOeffnen", fehlt.length ? "Erfüll die noch fehlenden V-Bedingungen gleichzeitig." : "Öffne V jetzt; alle sechs Bedingungen stehen.",
        [...fehlt.map(text => `Noch nötig: ${text}.`), "Baue zuerst den RM-Bestand auf. Im abschließenden Ressourcen-Lauf Eternities und Infinities farmen, dann Replicanti und DT pushen. Vor dem Öffnen von V keine Reality mehr auslösen."],
        "Alle sechs Anzeigen sind gleichzeitig grün und V ist geöffnet.")];
    }
    const st = normaleVTheoreme(p);
    const farm = st >= 35 ? 93 : st >= 30 ? 90 : st >= 26 ? 84 : st >= 20 ? 82 : st >= 16 ? 70 : 0;
    if (rmLog(p) < farm) add("vFarm", `Push außerhalb von V auf ungefähr e${farm} RM.`,
      [`Wechsel zwischen RM-Läufen und Glyph-Farming. ${st >= 20 && (p.celestials?.enslaved?.tesseracts ?? 0) < 2 ? "Kauf dabei den zweiten Tesseract." : "Nimm verbesserte Glyphs in die nächsten V-Sets mit."}`,
        st >= 26 ? "Ab hier nennt der Guide zusätzlich Level 6000+ und etwa e32 Glyph Sacrifice, vor AntiStellar 6 etwa e34." : "Ab 16 V-Abschlüssen Auto Purge einschalten und geschützte Inventarreihen freigeben, wenn dort nichts aufbewahrt werden soll."], `Die nächste V-Etappe erhält den RM- und Glyph-Zuwachs.`);
    for (const [id, tier] of V_ROUTE.filter(([id, tier]) => (v.runUnlocks?.[id] ?? 0) < tier)) {
      const [name, werte] = V_ZIELE[id];
      const ziel = werte[tier - 1];
      const code = id === 0 ? (tier === 6 ? "" : tier === 4 ? "rd" : "r")
        : id === 5 ? (tier <= 4 ? "eppdd" : "epddd") : ["", "erddd", "epppp", "etttt", "errrt"][id];
      const bedingung = [
        `Reality-Study mit höchstens ${-ziel} Glyphs kaufen`, `${ziel} Galaxien aller Typen erreichen`,
        `e${ziel} IP in EC7 erreichen`, `e${ziel} Antimatter in EC12 erreichen, ohne Dilation freizuschalten`,
        `e${ziel} EP erreichen`, `${ziel} Dimboosts innerhalb von Dilation und EC5 erreichen`,
      ][id];
      add("vLauf", `${name} ${tier}: ${bedingung}.`,
        [`Vor einem neuen V-Lauf ${code ? glyphBuild(code) + " ausrüsten" : "alle normalen Glyphs ablegen"}.`,
          ...(code.includes("e") ? [`Effarig-Effekte: ${st < 30 || id === 5 ? "3567" : id === 2 ? "3457" : "3467"} in der Reihenfolge der Effektliste.`] : []),
          `${id === 1 ? "Active" : "Idle"} benutzen${st >= 20 && id !== 1 ? " und TS131+132 dazukaufen" : st >= 10 && id !== 1 ? " und TS131 dazukaufen" : ""}. ${id === 5 ? "TS221, 224 und 231 wirken für Matterception nicht." : id === 2 ? "TS221 und 227 helfen in EC7 nicht." : "Übrige ST zuerst in TS221 und 226 investieren."}`,
          `In V ${bedingung}. Ab 24 Abschlüssen hilft gespeicherte Black-Hole-Zeit zunehmend. Wenn die Stufe stockt, zuerst die benachbarte Etappe oder bessere Glyphs versuchen.`], `${name} steht mindestens auf Stufe ${tier}.`,
        `${name} ${tier} bringt einen weiteren Space Theorem. ` + [
          "Die Glyph-Grenze lässt nur wenige Effekte zu. Replication vereint Geschwindigkeit, Multiplikator und DT; Dilation ergänzt bei zwei Plätzen den DT-Aufbau. Bei der letzten Stufe müssen alle normalen Glyphs weg.",
          "Das Ziel zählt Galaxien. Dilation- und Replication-Effekte erhöhen TGs und RGs, Active ergänzt die RG-Anzahl über TS131.",
          "EC7 verändert die Dimensionskette bis hin zu AD7. Power verstärkt deren Antimatter-Ende, Effarig ergänzt die übergreifenden Produktionspotenzen; normale TD-Multiplikator-Studies helfen hier nicht wie außerhalb der EC.",
          "EC12 hat ein enges Zeitbudget, Dilation ist für diese Bedingung verboten. Time-Glyphs stärken die TD-/Time-Shard-Produktion im vorgeschriebenen TD-Pfad; Effarig liefert Produktionspotenzen.",
          "Gefordert sind EP. Replication verstärkt die Produktionsbasis, Time die TDs und EP, Effarig die übergreifenden Potenzen. Idle baut den Bonus im längeren V-Lauf auf.",
          "Dimboosts müssen gleichzeitig in EC5 und Dilation erreicht werden. Dilation-Glyphs verbessern den dortigen Aufbau, Power hilft trotz der EC5-Kostenskalierung. Die ausdrücklich ausgelassenen Studies umgehen diese besondere Beschränkung nicht.",
        ][id]);
      if (s.length >= MAX_SICHTBAR) break;
    }
    return s;
  }

  function raSchritte(p) {
    const pets = p.celestials?.ra?.pets ?? {};
    const s = [];
    const route = [["teresa",8], ["effarig",8], ["enslaved",5], ["effarig",10]];
    const offen = route.find(([name, ziel]) => (pets[name] ?? 0) < ziel)
      ?? ["effarig", "teresa", "enslaved", "v"].filter(name => (pets[name] ?? 0) < 25).map(name => [name, Math.min(25, (pets[name] ?? 0) + 1)])[0];
    if (offen) {
      const [name, ziel] = offen;
      const lvl = pets[name] ?? 0;
      const code = name === "teresa" ? (lvl >= 8 ? "eppii" : lvl >= 6 ? "eirpp" : "eirrp")
        : name === "effarig" ? "eirpt" : name === "enslaved" ? "rrrtt"
          : Math.max(...Object.values(p.glyphSacrificeLog10 ?? { none: 0 })) >= 43 ? "rrrrr" : "iiirr";
      s.push(aktion("raPetRouteFahren", "raPetRoute", `Trainiere ${name === "enslaved" ? "Nameless" : name[0].toUpperCase() + name.slice(1)} von Level ${lvl} auf ${ziel}.`,
        [`Rüste ${glyphBuild(code)} für Ra aus. ${name === "enslaved" ? "ECs mit abschließen: Die Time Shards erzeugen die Chunks." : `Push ${name === "teresa" ? "EP" : name === "effarig" ? "Relic Shards" : "Infinity Power"} für mehr Chunks.`}`,
          "Kauf auch Fragmentation (Würfel) und Recollection (Gehirn), nicht ausschließlich Pet-Level. Fragmentation zuerst; bei geraden Teresa-Leveln zunächst Recollection kaufen.",
          "Chunks entstehen in Ra, Memories laufen auch außerhalb weiter. Nutze die Wartezeit für Alchemy, RM und Glyphs."], `Das Pet erreicht Level ${ziel}.`,
        `${name === "teresa" ? "Teresa erzeugt Chunks anhand von EP; das gemischte Produktionsset pusht deshalb EP." : name === "effarig" ? "Effarigs Chunks wachsen mit Relic Shards; verschiedene Glyph-Typen liefern viele unterschiedliche Effekte für den Shard-Ertrag." : name === "enslaved" ? "Nameless erzeugt Chunks anhand von Time Shards. Replication und Time verstärken über den TD-Pfad genau diese Produktion." : "V erzeugt Chunks anhand von Infinity Power. Infinity- und Replication-Effekte stärken diese Ressource."} `
          + (name === "teresa" && ziel === 8 ? "Level 8 öffnet Effarigs Memories." : name === "effarig" && ziel === 8 ? "Level 8 öffnet die Nameless-Memories." : name === "enslaved" && ziel === 5 ? "Level 5 erhöht die Memory-Produktion aller Chunks anhand der gesamten Spielzeit." : name === "effarig" && ziel === 10 ? "Level 10 garantiert vier Effekte auf normalen Glyphs und erlaubt bis zu sieben auf Effarig-Glyphs." : "Das nächste Level verstärkt dieses Pet und bringt es näher an seine nächste angezeigte Freischaltung.")));
    }
    if ((pets.effarig ?? 0) >= 2 && (p.alchemyAtCapCount ?? 0) < 21) s.push(aktion("raSpaetarbeitMachen", "raAlchemy", "Fülle die aktuell freigeschalteten Alchemy-Ressourcen.",
      ["Verlasse Ra und push zuerst RM und Glyph-Level. Stelle Glyph-Verwertung auf Refinement.",
        (pets.effarig ?? 0) >= 8 ? "Filter: Lowest Alchemy Resource. Verfeinere ungefähr die Glyph-Level, die ein 10-Sekunden-Lauf liefert." : "Filter: Refinement Value. Verfeinere Glyphs aus ungefähr 10-Sekunden-Läufen, um die Ressourcen-Kappen anzuheben.",
        "Danach schnelle Realities um 0,3 Sekunden für die Reaktionen laufen lassen, bis die offenen Ressourcen einen durchgehenden orangefarbenen Rand haben. Dann erneut RM pushen."], "Die offenen Alchemy-Ressourcen stehen an ihrer derzeitigen Kappe."));
    const vLevel = pets.v ?? 0;
    const runs = p.celestials?.v?.runUnlocks ?? [];
    const hard = [
      ...(vLevel >= 6 ? [[6,2,"ccet"],[8,1,"errrr"]] : []),
      ...(vLevel >= 10 ? [[6,3,"cccet"],[8,2,"errrr"]] : []),
      ...(vLevel >= 12 ? [[7,5,"errpt"],[6,4,"ccccr"]] : []),
      ...(vLevel >= 25 ? [[6,5,"ccccc"],[8,5,"errrr"]] : []),
    ];
    for (const [id, ziel, code] of hard.filter(([id, ziel]) => (runs[id] ?? 0) < ziel)) {
      s.push(aktion("raSpaetarbeitMachen", "hardV", `${id === 6 ? "Requiem for a Glyph" : id === 7 ? "Post-destination" : "Shutter Glyph"}: nächste offene Stufe bis ${ziel}.`,
        [`Für einen neuen V-Lauf ${glyphBuild(code)} vorbereiten. Cursed zählt als −3 Glyphs.`,
          id === 7 ? "TS302 kaufen. Den Inversionsregler passend zum nächsten Ziel auf 1/e100, 1/e150, 1/e200, 1/e250 oder 1/e300 stellen. Nicht entladen und EC12 nicht betreten; dann 400.000 freie TT erreichen."
            : id === 6 ? "TS301 kaufen. In einer EC respecen und den kürzesten Dilation-Weg für TT-Erzeugung kaufen. Bei Requiem 1 zunächst 1× Cursed + Effarig + Time, ab Stufe 2 das oben genannte Set verwenden."
              : `In V das nächste angezeigte Glyph-Level erreichen: ${[6500,7000,8000,9000,10000][runs[8] ?? 0]} vor eventueller Perk-Point-Senkung.`,
          "Nach der Stufe zurück zur Pet-/Alchemy-Route; die Richtwerte in den Pins sind kein Grund, bereits machbare Stufen aufzuschieben."], "Die nächste Hard-V-Stufe ist gespeichert.",
        "Diese Hard-V-Stufe liefert zusätzliche Space Theorems. " + (id === 6
          ? "Cursed zählt jeweils −3 und senkt die gewertete Glyph-Anzahl. Die wenigen übrigen Produktionsglyphs und passive TT-Erzeugung tragen den Lauf unter dieser Grenze."
          : id === 7 ? "Die Bedingung verlangt extrem langsame Spielgeschwindigkeit. Der Inversionsregler erfüllt sie; Entladen oder EC12 würde diesen Versuch ungültig machen. TS302 und das Set helfen, die benötigten freien TT trotzdem aufzubauen."
            : "Shutter Glyph verlangt ein Glyph-Level-Ziel. Vier Replication-Glyphs verstärken den Level-Faktor, Effarig verzögert Instability und unterstützt den Ressourcenaufbau.")));
    }
    if (!s.length) s.push(aktion("raSpaetarbeitMachen", "raImPush", "Push den RM-Ertrag bis zur Grenze von e1000 RM.",
      ["Nutze den vollständigen Study-Baum und wechsle RM-Pushes mit Glyph-Level- und Sacrifice-Läufen ab.", "Fülle den RM-Bestand bis zur Grenze. Dadurch werden Imaginary Machines verfügbar."], "Imaginary Machines sind geöffnet."));
    return s;
  }

  const IM_ZIELE = [
    [11,"Suspicion of Interference",5e7,"piety","e90 Relic Shards sammeln", "Relic-Shard-Läufe mit möglichst vielen unterschiedlichen Glyph-Effekten abschließen."],
    [12,"Consequences of Illusions",5e7,"yepit","einen Glyph mit Level 9000 und genau einem Level-Faktor auf 100 erzeugen", "Im Glyph-Faktor-Menü DT auf 100 stellen, die anderen auf 0. Bei angezeigtem Level 9000 eine Reality auslösen; anschließend normale Gewichte wiederherstellen."],
    [13,"Transience of Information",5e7,"yettt","1,79e308 projizierte RM in der Nameless-Reality erreichen", "FEEL ETERNITY erneut drücken und EC6+C10 benutzen. Die RM-Anzeige im Spiel ist maßgeblich."],
    [14,"Recollection of Intrusion",3.5e8,"yettt","e75000000000 Tickspeed pro Sekunde in EC5 erreichen", "Nach dem Ausrüsten der Glyphs eine Sekunde Time Shards aufbauen lassen, erst dann EC5 starten."],
    [15,"Fabrication of Ideals",1e9,"yettt","e1500000000000 Antimatter erreichen, ohne jemals ID1 zu besitzen", "Vor einer frischen Reality Requirement Lock aktivieren. Auch EC7/Time Dimensions können ID1 erzeugen! Mit Lock EC10+11 abschließen und den vollständigen Study-Baum kaufen. Richtwerte: Ra fertig, Cosmic Filament gekauft, Momentum mindestens 1,16 und e67–e69 Sacrifice."],
    [16,"Massless Momentum",3.5e9,"","Lai'tela zweimal in unter 30 Sekunden destabilisieren", "Dark-Matter-Dimensionen verbessern und Lai'telas Lauf wiederholen, bis zwei Dimensionen deaktiviert sind."],
    [17,"Chiral Oscillation",6e9,"","mindestens 20 Singularities auf einmal automatisch kondensieren", "Erst nach 50 Gesamt-Singularities angehen. Die Singularity-Kappe für mindestens 20 Ertrag erhöhen und auf automatisches Kondensieren warten; ein manueller Klick erfüllt die Bedingung nicht."],
    [18,"Dimensional Symmetry",1.5e10,"ydddd","80.000 Galaxien aller Typen erreichen", "Dilation und Replicanti maximieren. Richtwerte aus den Pins: e74–e75 Sacrifice, 50–52 % Continuum-Zuwachs und e198–e199 Jahre gespeicherte Black-Hole-Zeit."],
    [19,"Deterministic Radiation",2.8e10,"iiiep","3,85 Millionen Tickspeed Continuum mit höchstens acht Studies im ganzen Lauf erreichen", "Requirement Lock vor einer frischen Reality aktivieren. Nur den unten stehenden Acht-Study-Baum kaufen. Big Crunch und automatische EC-Abschlüsse sind erlaubt und helfen."],
    [20,"Vacuum Acceleration",3e12,"","100 % Continuum-Zuwachs erreichen", "Dark-Matter-Produktion steigern und den Annihilation-Multiplikator ausbauen, bis der Continuum-Zuwachs 100 % beträgt."],
    [21,"Existential Elimination",1e13,"yeidd","e7400000000000 Antimatter ohne Continuum im gesamten Lauf erreichen", "Continuum im Dimensions-/Autobuyer-Tab abschalten und Requirement Lock vor der neuen Reality aktivieren. Den RM-Push mit ausgeschaltetem Continuum spielen."],
    [22,"Total Termination",1.5e14,"ccccd","e150000000000 Antimatter in Effarig mit vier Cursed Glyphs erreichen", "Effarigs Reality mit vier Cursed und einem Dilation-Glyph starten. Richtwert: e89 Sacrifice. Keine zusätzlichen normalen Glyphs einsetzen."],
    [23,"Planar Purification",6e14,"cyer","Glyph-Level 20.000 in Ra mit einer Glyph-Anzahl von höchstens null erreichen", "Ra mit Cursed, Reality, Effarig und Replication starten. Cursed zählt −3, die drei übrigen jeweils +1. Keine weiteren Glyphs während dieses Laufs verwenden."],
    [24,"Absolute Annulment",6e14,"epiii","13.000 Antimatter-Galaxien in Ra mit vollständig invertiertem Black Hole erreichen", "Vor dem Ra-Start die Inversion auf 1/e300 und das Requirement Lock setzen. Weder entladen noch EC12 betreten noch die Inversion lockern."],
    [25,"Omnipresent Obliteration",1.6e15,"d","die Reality-Study in Lai'tela mit allen Dimensionen deaktiviert und höchstens einem Glyph kaufen", "Alle acht Lai'tela-Stufen müssen deaktiviert sein. Requirement Lock aktivieren; nur einen Dilation-Glyph ausrüsten. Richtwerte: Level 39.000+, 2,5e45 Singularities, ungefähr zehn Minuten Laufzeit."],
  ];

  const IM_GRUENDE = {
    11: "Mehr TD-Potenz aus gesamtem Antimatter stärkt den weiteren Push. Das Shard-Set kombiniert verschiedene Glyph-Typen, weil unterschiedliche Effekte den Relic-Shard-Gewinn erhöhen.",
    12: "Kostenlose Dimboosts aus den wiederkaufbaren Imaginary-Upgrades stärken die Produktion. Die Bedingung verlangt genau einen Level-Faktor: DT auf 100 nutzt den DT-Aufbau des Sets, ohne andere Faktoren mitzurechnen.",
    13: "Der Kauf erhöht das IM-Limit anhand gekaufter Imaginary-Upgrades. In Nameless funktionieren wieder dieselben Puzzle-Ausnahmen: FEEL ETERNITY und EC6+C10 überwinden die dortigen Sperren, Time stärkt die verbleibende Produktionsroute.",
    14: "Die Potenz 1,5 auf Dimensions-Kaufmultiplikatoren verstärkt alle späteren Pushes. Time-Glyphs bauen vor EC5 Time Shards und damit Tickspeed auf; der kurze Vorlauf sichert diese Produktion vor dem Challenge-Wechsel.",
    15: "Dieser Kauf öffnet Lai'tela und Dark Matter. Das Lock schützt vor ID1 aus Käufen und auch aus der EC7-Produktionskette; Time-Glyphs tragen den alternativen Aufbau bis zum geforderten Antimatter-Ziel.",
    16: "Die zweite Dark Matter Dimension produziert die erste und beschleunigt deren Ertrag. Zwei schnelle Lai'tela-Abschlüsse weisen die dafür nötige Destabilisation nach.",
    17: "Die dritte Dark Matter Dimension erweitert die Produktionskette. Gefordert ist ein automatischer Mehrfach-Singularity-Ertrag; deshalb erst die Automation freischalten und die Kappe hoch genug setzen.",
    18: "Die vierte Dark Matter Dimension vervollständigt die Kette. Für 80.000 Galaxien liefern vier Dilation-Glyphs vor allem DT und damit TGs; Reality verstärkt die Basisglyphs und Galaxien.",
    19: "Annihilation tauscht einen DMD-Neustart gegen einen dauerhaften Produktionsmultiplikator. Die Acht-Study-Grenze schließt den normalen Tree aus; Infinity-Glyphs, Crunches und automatische EC-Belohnungen liefern die fehlende Produktionsstärke.",
    20: "Der Kauf automatisiert wiederkaufbare Imaginary-Upgrades und beschleunigt die IM-Erzeugung. Mehr Dark Matter und der Annihilation-Multiplikator steigern den Continuum-Zuwachs bis zur geforderten 100-%-Marke.",
    21: "Der Annihilation-Gewinn wird durch IM stärker. Weil Continuum für die gesamte Anforderung verboten ist, muss der gewöhnliche Kauf-/Produktionsaufbau mit Glyphs den AM-Push tragen.",
    22: "Alle Glyph-Sacrifice-Werte steigen auf e100. Vier Cursed sind Teil der Bedingung und lassen nur einen freien Platz; der Dilation-Glyph hilft dem verbleibenden Aufbau in Effarigs Reality.",
    23: "Tesseracts erhöhen nach dem Kauf die kostenlosen Dimboosts. Cursed zählt −3 und gleicht genau Reality, Effarig und Replication mit je +1 aus; deren Level-Effekte helfen, die geforderten 20.000 in Ra zu erreichen.",
    24: "Singularities verstärken nach dem Kauf die kostenlosen Dimboosts. Vollständige Inversion ist Pflicht; Infinity-Glyphs stärken die Produktion für die 13.000 Antimatter-Galaxien, während das Lock ein versehentliches Umgehen der Inversion verhindert.",
    25: "Der Kauf öffnet Pelle. In Lai'telas letzter Stufe sind alle Dimensionen deaktiviert und nur ein Glyph erlaubt. Dilation mit TT-Erzeugung kann den Weg zur Reality-Study weiter finanzieren; deshalb dieses einzelne Glyph statt eines normalen Produktionssets.",
  };

  function imaginarySchritte(p, phase) {
    const s = [];
    let bank = p.resources?.imaginaryMachines ?? 0;
    const limit = phase === "imaginaryMachines" ? 15 : 25;
    const fehlt = IM_ZIELE.filter(([id]) => id <= limit && !hat(p.imaginaryUpgrades, id));
    const kaufbar = fehlt.filter(([id, , kosten]) => hat(p.imaginaryUpgradeUnlocks, id) && bank >= kosten);
    const gekauft = new Set();
    for (const [id, name, kosten] of kaufbar) {
      if (bank < kosten) continue;
      bank -= kosten;
      gekauft.add(id);
      s.push(aktion("imaginaryUpgradesElfBisFuenfzehn", "imKauf", `Kauf ${name} für ${kosten.toExponential().replace("e+", "e")} IM.`,
        [`Reality → Imaginary Upgrades, Reihe ${Math.ceil(id / 5)}, Spalte ${(id - 1) % 5 + 1}: Die Bedingung ist bereits gespeichert. Kauf das Upgrade.`], `${name} ist gekauft.`,
        `${name} ist bereits freigeschaltet und bezahlbar. ${IM_GRUENDE[id]}`));
      if (id === 15 || id === 25) return s;
    }
    for (const [id, name, kosten, code, ziel, tipp] of fehlt.filter(([id]) => !gekauft.has(id))) {
      const gespeichert = hat(p.imaginaryUpgradeUnlocks, id);
      const idText = `Reihe ${Math.ceil(id / 5)}, Spalte ${(id - 1) % 5 + 1}`;
      const kostenText = kosten.toExponential().replace("e+", "e");
      const wie = [];
      if (!gespeichert) {
        if (code) wie.push(`Empfohlenes Set: ${glyphBuild(code)}. Vor dem betreffenden Lauf ausrüsten.`);
        wie.push(hat(p.imaginaryRequirementLocks, id)
          ? tipp.replace("Requirement Lock vor einer frischen Reality aktivieren.", "Dein Requirement Lock ist aktiv; für diese Bedingung eingeschaltet lassen.")
            .replace("Vor einer frischen Reality Requirement Lock aktivieren.", "Dein Requirement Lock ist bereits aktiv; eingeschaltet lassen.")
          : tipp);
      }
      if (bank < kosten) wie.push((p.resources?.imaginaryMachineCap ?? 0) <= kosten
        ? `Erhöhe den projizierten RM-Ertrag für eine IM-Kappe über ${kostenText}; an einer zu kleinen Kappe hilft Warten nicht.`
        : `Lass IM bis ${kostenText} anwachsen; die gespeicherte Bedingung bleibt über weitere Realities erhalten.`);
      wie.push(`Sobald die Bedingung als erfüllt angezeigt wird und ${kostenText} IM da sind, ${name} (${idText}) kaufen.`);
      const schritt = aktion("imaginaryUpgradesElfBisFuenfzehn", "imZiel",
        gespeichert ? `Spare ${kostenText} IM für ${name}; die Bedingung ist erledigt.` : `${name}: ${ziel}.`,
        wie, `${name} ist gekauft.`, `${name}: ${IM_GRUENDE[id]}${gespeichert ? " Die Bedingung ist bei dir bereits gespeichert; jetzt fehlt nur noch die Finanzierung." : ""}`);
      if (id === 19 && !gespeichert) { schritt.baeume = [{ bezeichnung: "Genau acht Studies", importString: "11,21,31,41,51,61,72,82|0" }]; schritt.baeumeSichtbar = true; }
      s.push(schritt);
      if (bank < kosten) {
        // Attempt the next challenge when it is fundable. A cap wall first
        // needs the ordinary farming loop, not four more expensive challenges.
        const cap = p.resources?.imaginaryMachineCap ?? 0;
        if (cap <= kosten && !p.celestials?.current) {
          const y = [...(p.activeGlyphs ?? []), ...(p.inventoryGlyphs ?? [])].some(g => g.type === "reality" && g.level >= 15000);
          const rmSet = !y ? "epppi" : hat(p.achievementIds, 177) ? "epiii" : hat(p.imaginaryUpgrades, 22) ? "yeiii"
            : Math.max(...Object.values(p.glyphSacrificeLog10 ?? {}), 0) >= 77 ? "yeiip" : hat(p.imaginaryUpgrades, 14) ? "yettp" : "yettt";
          s.push(aktion("raNacharbeitImaginary", "imFarm", `Erhöhe das IM-Limit über ${kostenText} mit dem nächsten Farm-Zyklus.`,
            [`RM/IM-Push mit ${glyphBuild(rmSet)}; neue Glyph-Level mit ${glyphBuild(y ? "yerrr" : "errrr")}. Außerhalb eines Celestial-Laufs farmen.`,
              "In den ersten beiden Imaginary-Reihen bezahlbare Verstärker kaufen. Runic Assurance (Reihe 2, Spalte 2) verzögert Glyph Instability; bessere Glyph-Level erhöhen die Alchemy-Kappe.",
              `Danach Alchemy auffüllen, schwache Glyphs opfern und Teresas Multiplikator mit ${glyphBuild(y ? "yettt" : "epppp")} verbessern. Mit dem stärkeren Set zurück zum IM-Push.`,
              "Bei freigeschalteter Reality-Reaktion einen Reality-Glyph ab Level 15.000 herstellen und in die angegebenen Sets aufnehmen. Bis dahin bleibt das Set ohne Reality-Glyph gültig.",
              "Die Anzeige „Projected Imaginary Machine cap“ muss steigen. IM sammeln sich danach automatisch an; endlos an derselben zu niedrigen Kappe warten bringt nichts."], `Das IM-Limit liegt über ${kostenText}.`));
          if (!raSpaetFertig(p) && p.celestials?.ra) s.push(...raSchritte(p).filter(schritt => schritt.gruppe !== "raImPush"));
        }
        break;
      }
      // The cap and future unlocks can change after the next purchase; do not
      // pretend a sequence of independent currency budgets is already funded.
      if (s.length >= MAX_SICHTBAR || id === 15 || id === 25) break;
    }
    return s;
  }

  function pelleSchritte(p) {
    const pelle = p.celestials?.pelle ?? {};
    const guide = DATEN.pelleEternityGuide;
    const s = [];
    if (!pelle.doomed) return [leererSchritt("pelleDoomStarten", "pelleDoom")];
    if (pelle.galaxyGeneratorUnlocked) return [aktion("pelleGalaxyGeneratorBeenden", "pelleEnde",
      `Spiele Generatorphase ${(pelle.galaxyGeneratorPhase ?? 0) + 1}: kaufe Upgrades und opfere den verlangten Rift.`,
      ["Kauf verfügbare Generator-Upgrades. Lass den additiven Boost aus, wenn er einen großen Teil der Galaxien kosten würde.",
        "Sobald die aktuelle Galaxien-Kappe erreicht ist, das angezeigte Rift-Opfer starten. Nicht weiter an der Kappe warten; nach dem Opfer die nächste Phase ausbauen."], "Der Abspann erscheint.")];
    if (hat(pelle.progress, 5)) {
      const prozent = Math.max(0, pelle.riftFillLog10?.paradox ?? Math.log10((pelle.rifts?.paradox ?? 0) + 1));
      s.push(aktion("pelleBisGalaxyGenerator", "pelleDilation", "Richte den permanenten Dilation-Lauf auf DT aus.",
        ["Dilation-Glyph ausrüsten. AD + TD + Idle spielen, alle dunklen Studies außer TS223; ab 50 % Rift 5 wieder TS224 statt TS223.",
          "Bis zum Pelle-AD-Multiplikator für e47 RS sind EC11 mit TS231+233 gut für Remnants und Tachyon Particles. Danach den normalen Dilation-Lauf verwenden."], "Das Dilation-Set läuft und kauft die passenden Studies."));
      for (const ziel of [15, 25, 50].filter(ziel => prozent < ziel)) s.push(aktion("pelleBisGalaxyGenerator", "pelleRift", `Fülle Rift 5 von etwa ${Math.floor(prozent)} % bis ${ziel} %.`,
        [`Dieser Meilenstein kommt vor vergleichbar teuren Upgrades bei e${ziel} DT${ziel === 50 ? "; nur ×5 DT hat dort Vorrang" : ""}.`,
          "Fülle portionsweise, wenn dein DT-Bestand mehr als 100-mal höher als der bisherige Rift-Füllwert ist. Anschließend DT wieder wachsen lassen."], `Rift 5 hat ${ziel} % erreicht.`,
        ({ 15: "Bei 15 % werden TD5–8 deutlich billiger und weitere Dilation-Upgrades verfügbar. Dieser Zugang hat hier Vorrang vor einem einzelnen ähnlich teuren DT-Kauf.",
          25: "Bei 25 % geht die Tachyon-Partikel-Menge mit Potenz 1,4 in den DT-Gewinn ein. Das erhöht die weitere DT-Produktion und finanziert die folgenden Dilation-Upgrades schneller.",
          50: "Bei 50 % verbessern die gekauften wiederholbaren Dilation-Upgrades die Umwandlung von Infinity Power in AD-Stärke. Dadurch wird der weitere AM-/EP-Push stärker; der günstige ×5-DT-Kauf darf vorher noch die Füllung beschleunigen." })[ziel]
          + " Das Füllen verbraucht DT. Deshalb portionsweise füllen und den Vorrat zwischen den Portionen wieder aufbauen."));
      s.push(aktion("pelleBisGalaxyGenerator", "pelleUpgrades", "Kauf DT- und Tachyon-Galaxy-Upgrades in der Pin-Reihenfolge.",
        ["×5 DT → ×2,7 DT → TG-Multiplikator → TG-Schwelle → Tickspeed. Den ersten TG-Multiplikator vor ×2,7 DT kaufen; ×2 TG kaufen, sobald bezahlbar.",
          "Pelles TG-Schwelle hat Vorrang. Bei e55 DT Rift 4 wieder füllen, bis der Galaxy Generator aufgeht."], "Rift 4 ist voll und der Galaxy Generator ist verfügbar."));
      return s;
    }
    if (hat(pelle.progress, 3)) {
      if ((p.totalTT ?? 0) < 143 && !(p.clears ?? []).some(n => n > 0) && !p.currentChallenge?.eternity) {
        const tt = p.totalTT ?? 0;
        const ep = Math.max(p.resources?.eternityPointsExponent ?? 0, p.maxEPExponent ?? 0);
        // The workbook has prose checkpoints without save predicates. Select
        // only observable milestones, then preserve its concrete instructions.
        const start = tt >= 103 ? (ep >= 21 ? 21 : ep >= 19 ? 20 : ep >= 16 ? 19 : 18) : tt >= 48 ? (ep >= 12 ? 16 : ep >= 7 ? 15 : 13)
          : tt >= 28 ? (tt >= 41 ? 12 : 9) : (pelle.rifts?.chaos ?? 0) >= 1.5 ? 7 : ep >= 2 ? 5 : 1;
        const checkpoints = guide.eternityStartCheckpoints.filter(e => e.order >= start).slice(0, 5);
        for (const e of checkpoints) {
          // Workbook prose labels the 123/133 trees Active; game IDs and the
          // newer pins agree that this is Idle.
          const text = e.order === 19 && hat(pelle.progress, 4)
            ? "Der vierte Strike ist bereits ausgelöst. Push mit dem Time-Glyph weiter bis 2,2e18 EP."
            : e.recommendation.replaceAll("Active", "Idle");
          const titel = ["", "Kauf TD1 und die ersten Time Studies.", "Fülle Chaos vor der nächsten Eternity.",
            "Farme kleine Eternities und push auf e440 IP.", "Spare 100 EP für TT und TS42.", "Öffne TD3 und push bis e550 IP.",
            "Bring Chaos auf 15 %.", "Farme mit kurzen Eternities bis 28 TT.", "Kauf den AD-Multiplikator für e22 Reality Shards.",
            "Öffne TD4 und erreiche 36 TT.", "Sichere Replicanti dauerhaft und erreiche 41 TT.", "Spare auf den AD-Multiplikator für e23 Reality Shards.",
            "Erreiche 48 TT und kauf TS111.", "Push bis 3,1e6 EP und zum nächsten AD-Multiplikator.", "Kauf EU3 und push Richtung 6,5e7 EP.",
            "Wechsle auf Idle und fülle Vacuum bis 40 %.", "Kauf TS151, TS161 und TS162; push bis 5e14 EP.",
            "Erreiche 103 TT und TS171.", "Wechsle auf TD und push auf e3300 IP.", hat(pelle.progress, 4) ? "Push weiter bis 2,2e18 EP." : "Löse den vierten Strike aus und push bis 2,2e18 EP.",
            "Push bis 6e20 EP und kauf den Infinity-Power-Verstärker.", "Spare auf den AD-Multiplikator für e27 Reality Shards.",
            "Erreiche die 143 TT für die erste Eternity Challenge."][e.order];
          const schritt = aktion("pelleBisEcs", "pelleCheckpoint", titel,
            [text, "Für den jeweiligen Push wechseln: Power für AM/Remnants, Infinity für IP/Rift 1, Replication für Rift 3, Time für EP/Rift 4. TS21 behalten; Idle benutzen."],
            e.recommendedTT ? `${e.recommendedTT} TT sind erreicht.` : "Die genannten Werte oder Käufe sind erreicht.");
          schritt.eigeneRoute = true;
          schritt.inhalt.warum = ["",
            "TD1 erzeugt die ersten Time Shards und damit zusätzliche Tickspeed-Upgrades. Erst diese Produktion trägt den weiteren Eternity-Aufbau.",
            "Chaos verstärkt Time Dimensions. Die Füllung verbraucht Decay statt EP; vor dem Reset aufgefüllt trägt dieser Bonus schon den nächsten Lauf.",
            "Kurze Eternities finanzieren TDs und Studies. Der anschließende längere IP-Push liefert durch die EP-Formel mehr EP pro Reset als dieselben kleinen Wiederholungen.",
            "Die EP werden hier für zusätzliche TT zurückgehalten. TS42 verbilligt die Galaxien-Skalierung und ermöglicht dadurch mehr Galaxien im folgenden Push.",
            "TD3 erweitert die Time-Dimension-Kette. Mehr Time Shards liefern zusätzliche Tickspeed-Upgrades für den längeren IP-Push und den nächsten EP-Sprung.",
            "15 % Chaos schalten die besonderen Pelle-Effekte der Glyphs frei. Erst dadurch bekommt der Wechsel des einzelnen Glyphs für IP, EP oder Rifts seinen großen Zusatznutzen.",
            "28 TT finanzieren den nächsten Study-Ausbau. Kurze Resets sammeln dafür EP; vorhandene TDs und Chaos tragen den wiederholten Aufbau.",
            "Der Pelle-AD-Multiplikator verstärkt die gesamte Antimatter-Kette. Mit dem Decay-Meilenstein verstärkt er zusätzlich ID1 und damit die Infinity-Power-Produktion.",
            "TD4 speist die gesamte darunterliegende Time-Dimension-Kette. Ihr Ausbau und die zusätzlichen Studies liefern die Tickspeed-Stärke für den nächsten EP-Push.",
            "Erhaltene Replicanti sparen ihren wiederholten Aufbau nach Resets. Die zusätzlichen TT öffnen den nächsten Teil des Trees und machen diesen dauerhaften Bonus besser nutzbar.",
            "Der nächste Pelle-AD-Multiplikator erhöht die Produktion dauerhaft. Das Sparziel ist deshalb ein konkreter Produktionssprung für die folgenden IP- und EP-Läufe.",
            "TS111 verbessert die Umrechnung von IP in EP. Die 48-TT-Marke finanziert den Zugang und erhöht so den Ertrag der folgenden Eternities.",
            "Der EP-Push finanziert weitere TDs und TT; der nächste Pelle-AD-Multiplikator stärkt parallel die AD- und mit dem Decay-Meilenstein die ID1-Produktion.",
            "EU3 verstärkt Infinity Dimensions anhand der Summe der Infinity-Challenge-Zeiten. Zusammen mit dem weiteren EP-Ausbau wächst die Infinity Power für den nächsten längeren Push.",
            "Bei 40 % verstärkt Vacuum zusätzlich den EP-Gewinn. Idle passt zum längeren Aufbau: Sein IP-Bonus wächst mit der Laufzeit, sodass Füllung und EP-Push zusammenarbeiten.",
            "TS151 verstärkt Time Dimensions, TS161 Antimatter Dimensions und TS162 Infinity Dimensions. Damit wachsen alle drei Produktionsketten für den Sprung zu höheren EP.",
            "TS171 senkt die Time-Shard-Schwelle für zusätzliche Tickspeed-Upgrades. Ab 103 TT ist der passende TD-Aufbau finanzierbar und wertvoller als der bisherige frühe Pfad.",
            "Mit TS171 profitiert der TD-Pfad besonders von der stärkeren Time-Shard-Produktion. Die zusätzlichen Tickspeed-Upgrades tragen den langen IP-Push für mehr EP.",
            hat(pelle.progress, 4) ? "Der vierte Strike ist schon aktiv. Weitere EP können Recursion füllen und dessen Verbesserung der EP-Formel ausbauen."
              : "Der vierte Strike öffnet Recursion. Dieses Rift verbessert die Umrechnung von IP in EP; der folgende EP-Push kann den neuen Bonus direkt füllen.",
            "Der Infinity-Power-Verstärker macht aus derselben Infinity Power einen stärkeren AD-Bonus. Die dafür gesparten EP eröffnen einen neuen Produktionssprung.",
            "Das nächste Pelle-AD-Upgrade verstärkt die AD-Kette und über den Decay-Meilenstein ID1. Der permanente Bonus bereitet die stärkere Produktion für die erste EC vor.",
            "Die 143 TT finanzieren den vorgesehenen Einstieg in die Eternity Challenges. Deren wiederholbare Belohnungen und Recursion-Boni liefern den nächsten Ausbau, den bloßes EP-Farmen nicht ersetzt.",
          ][e.order];
          if (e.tree) schritt.baeume = [{ bezeichnung: "Cel-7-Tree", importString: e.tree }];
          s.push(schritt);
        }
        return s;
      }
      let tt = p.totalTT ?? 0;
      const clears = [...(p.clears ?? [])];
      const route = [...guide.ecAndTtPushRoute];
      const aktiv = route.find(e => e.ec === p.currentChallenge?.eternity && e.completion === (clears[e.ec - 1] ?? 0) + 1);
      if (aktiv) route.unshift(...route.splice(route.indexOf(aktiv), 1));
      for (const e of route) {
        const zielTT = e.order === guide.treeCostConflict?.order ? guide.treeCostConflict.treeCostTT : e.recommendedTT;
        if (e.kind === "ec" ? (clears[e.ec - 1] ?? 0) >= e.completion : tt >= zielTT) continue;
        const laeuft = e === aktiv;
        const titel = e.kind === "ec" ? `${laeuft ? "Beende" : "Spiele"} ${e.run} in Pelles Reality.` : `Push in Pelles Reality auf ${zielTT} TT.`;
        const schritt = aktion("pelleEcsBisDilation", "pelleRoute", titel,
          [laeuft ? "Bleib in der laufenden EC. Jetzt nicht respecen oder eine andere EC starten."
            : `${{ Infin: "Infinity", Rep: "Replication", Time: "Time", Power: "Power" }[e.glyph] ?? e.glyph}-Glyph verwenden. ${tt < zielTT ? `Zuerst bis ${zielTT} TT farmen, dann ` : "Dann "}den unten stehenden Tree laden.`,
            ...(guide.runNotesDe[String(e.order)] ? [guide.runNotesDe[String(e.order)]] : []),
            "Innerhalb einer EC alle Rifts außer Rift 3 pausieren. Zwischen den Läufen Time Dimensions und die nächste TT-Marke pushen."],
          e.kind === "ec" ? `${e.run} ist abgeschlossen.` : `${zielTT} TT sind erreicht.`,
          "Pelles Rifts und deaktivierte Studies verändern die sinnvolle Reihenfolge. Dieser nächste offene Schritt nutzt die bereits erreichten Abschlüsse und das angegebene TT-Budget. "
            + ({ Time: "Der Time-Glyph verbessert EP für TD-/TT-Käufe und Rift 4.", Power: "Der Power-Glyph verbessert den Antimatter-Push und damit AM-Theorems und Remnants.", Infin: "Der Infinity-Glyph verstärkt IP für Infinity Dimensions, TT und Rift 1.", Rep: "Der Replication-Glyph beschleunigt Replicanti für den Aufbau von Rift 3 und RGs." }[e.glyph] ?? ""));
        schritt.eigeneRoute = true;
        schritt.pelleEc = e.ec;
        if (!laeuft) schritt.baeume = [{ bezeichnung: `Cel-7 · ${e.run ?? zielTT + " TT"}`, importString: e.tree }];
        if (e.order === guide.treeCostConflict?.order) schritt.hinweis = `Die Mappe nennt ${e.recommendedTT} TT, der importierbare Tree kostet aber ${zielTT} TT.`;
        if (guide.routeOrderConflict.importableRoute.includes(e.run)) schritt.hinweis = "Die Mappe enthält zwei Reihenfolgen. Diese Route folgt dem Importable-Blatt: " + guide.routeOrderConflict.importableRoute.join(" → ") + ".";
        s.push(schritt);
        tt = Math.max(tt, zielTT);
        if (e.kind === "ec") clears[e.ec - 1] = e.completion;
        if (s.length >= MAX_SICHTBAR) break;
      }
      if (s.length) return s;
      return [aktion("pelleEcsBisDilation", "pelleDilationUnlock", "Öffne jetzt Dilation in Pelles Reality.",
        ["Fülle Rift 1 und Rift 3 vollständig. Push die freien TT für Dilation und kaufe die Study; die Dilation bleibt nach dem fünften Strike permanent."], "Pelles fünfter Strike ist ausgelöst.")];
    }
    return zieleAuswerten(p, "pelle").schritte;
  }

  function konkreteCelestials(p, phase) {
    const c = p.celestials ?? {};
    const schritte = [];
    const add = (id, gruppe, titel, wie, fertig, warum) => schritte.push(aktion(id, gruppe, titel, wie, fertig, warum));
    if (phase === "pelle") schritte.push(...pelleSchritte(p));
    if (phase === "v") schritte.push(...vSchritte(p));
    if (phase === "ra") schritte.push(...raSchritte(p));
    if (phase === "imaginaryMachines" || phase === "laitela") {
      // Dark Matter is the production engine behind the later unlock runs.
      if (phase === "laitela" && !p.celestials?.current && (c.laitela?.difficultyTier ?? 0) < 8) {
        add("laitelaDimensionenAbschalten", "laitelaProduktion", "Baue Dark Matter und Dark Energy für den nächsten Lai'tela-Lauf aus.",
          ["Kauf bei allen offenen Dark Matter Dimensions die Intervall- und Produktions-Upgrades. Bei minimalem Intervall Ascend benutzen und wieder ausbauen.",
            hat(p.imaginaryUpgrades, 19) ? "Annihilation anfangs nach 2–3 Minuten. Sobald e60 Dark Matter sofort zurückkommen, jeden zweiten Tick annihilieren; zwischendurch längere Produktionsläufe. Zielbereich des Multiplikators: ×2e8–2e9." : "Dark Energy bis zur Singularity-Kappe aufbauen und kondensieren. Ab 50 Gesamt-Singularities den automatischen Ertrag auf mindestens 20 einstellen.",
            `Nächster Destabilisations-Lauf: ${glyphBuild(hat(p.imaginaryUpgrades, 23) && hat(p.imaginaryUpgrades, 24) ? "yeddd" : hat(p.imaginaryUpgrades, 21) ? "ydddd" : "yeddd")}. Unter 30 Sekunden deaktiviert die nächste Dimension. Der Automator muss auch hier kurz dilatieren, wenn TP ≤ 10.`],
          "Dark Matter und Singularities sind gestiegen; der nächste Lauf oder das nächste unten genannte Upgrade ist erreichbar.");
      }
      schritte.push(...imaginarySchritte(p, phase));
    }
    if (phase === "teresa") {
      if (!hat(c.teresa?.unlocks, 0)) {
        add("teresaRealityFreischalten", "teresaRm", "Farm RM und fülle Teresas Behälter bis e14.",
          [`RM-Set: ${glyphBuild(rmLog(p) < 18 ? "ppiir" : "rrrii")}. Für neue Glyphs zwischendurch ${glyphBuild("rrrrd")} verwenden.`,
            "Im GL-Set brauchen die Replication-Glyphs Geschwindigkeit und Glyph-Level; drei davon außerdem DT. Der Dilation-Glyph braucht DT und TT-Erzeugung.",
            "Ungenutzte RM in den Behälter gießen, bis die Reality bei e14 freigeschaltet ist."], "Teresas Reality ist startbar.");
      } else if ((c.teresa?.bestRunAM ?? 0) <= 1) {
        if (!c.teresa?.running) add("teresaRealityAbschliessen", "teresaStart", "Starte Teresa mit 3× Replication und 2× Time.",
          ["Replication: Geschwindigkeit, Multiplikator und DT. Time: Time-Dimension-Potenz. Speichere dein Farmset und starte den Lauf mit diesem Set."], "Teresas Reality läuft.");
        if (!p.dilationUnlocked) add("teresaRealityAbschliessen", "teresaDilation", "Bleib auf Idle und öffne Dilation in Teresas Reality.",
          ["Vor Dilation Idle mit TS225 und 233 verwenden. EC11 fünfmal und EC12 dreimal abschließen.", "Kauf den kürzesten Dilation-Weg, sobald die TT reichen; im Guide ungefähr 7100 TT."], "Dilation ist offen.");
        add("teresaRealityAbschliessen", "teresaEnde", "Wechsle nach Dilation auf Active und beende Teresas Reality.",
          ["Nach dem Dilation-Unlock Active und TS234 benutzen. Wechsel zwischen TP/DT und EP-Push, bis die Reality-Study erreichbar ist.", "Kauf die Study und beende den Celestial-Lauf."], "Teresas erster Reality-Lauf ist abgeschlossen.");
      } else add("effarigFreischalten", "effarigOeffnen", "Fülle Teresas Behälter bis e24 RM für Effarig.",
        [`Wechsle ${glyphBuild("rrrii")} für RM mit ${glyphBuild("rrrrd")} für Glyph-Level ab.`, "Nimm die Behälter-Freischaltungen unterwegs mit und gieß weiter bis e24 RM."], "Effarig ist geöffnet.");
    }
    if (phase === "effarig") {
      const kauf = [[0,"Glyph-Level-Faktoren",1e7],[1,"Glyph-Filter",2e8],[2,"Glyph-Presets",3e9],[3,"Effarigs Reality",5e11]]
        .find(([id]) => !hat(c.effarig?.unlocks, id));
      if (kauf) add("effarigWerkzeugeKaufen", "effarigWerkzeuge", `Kauf als Nächstes ${kauf[1]} für ${kauf[2].toExponential().replace("e+", "e")} Relic Shards.`,
        [`Shard-Set: ${glyphBuild("pirtd")} mit möglichst vielen verschiedenen Effekten.`, "Push EP und schließe Realities für Shards ab. Kauf anschließend den genannten nächsten Shop-Eintrag."], `${kauf[1]} ist gekauft.`,
        ["Die Glyph-Level-Faktoren lassen dich das Gewicht auf die gerade stärkste Ressourcenquelle verschieben und so aus demselben Lauf mehr Level gewinnen.",
          "Der Glyph-Filter wählt bei automatischen Realities nach deinen Effekten und Qualitätsgrenzen; dadurch sammeln schnelle Runs brauchbare Ersatzglyphs.",
          "Glyph-Presets speichern getrennte RM-, Level- und Shard-Sets. Das spart beim Wechsel die manuelle Auswahl und verhindert, mit dem falschen Set weiterzufarmen.",
          "Dieser Kauf öffnet Effarigs dreiteiligen Reality-Lauf und dessen dauerhafte Belohnungen. Die vorherigen Werkzeuge helfen, die dafür nötigen Glyph-Effekte zu sammeln."][kauf[0]]
        + " Für den Kauf liefert das gemischte Shard-Set viele verschiedene Effekte; diese und der EP-Rekord bestimmen den Shard-Gewinn.");
      else if (!hat(c.effarig?.unlocks, 4)) add("effarigInfinityBrechen", "effarigInfinity", "Schließe Effarigs Infinity mit fünf Power-Glyphs ab.",
        ["Alle fünf brauchen den direkten AD-Multiplikator, möglichst mindestens 70 % Seltenheit. Mehr Glyph-Level löst die frühe Level-Kappe nicht.", "Starte Effarigs Reality und spiel bis Big Crunch. Bei einem Stall zuerst Effekte/Seltenheit verbessern."], "Effarigs Infinity-Abschnitt ist gespeichert.");
      else add("effarigEternityBrechen", "effarigEternity", "Schließe Effarigs Eternity mit Power, Infinity, zwei Replication und Dilation ab.",
        ["Power braucht AD-Multiplikator; Infinity braucht IP-Multiplikator und Infinity-Anzahl; beide Replication-Glyphs brauchen Replicanti-Multiplikator; Dilation braucht TT-Erzeugung. Richtwert 70–80 % Seltenheit.", "Benutze ID und Idle im Study-Baum. Spiele Effarig bis Eternity."], "Effarigs Eternity-Abschnitt ist gespeichert und die Zeitmechanik der Nameless Ones ist offen.");
    }
    if (phase === "enslaved") {
      if (!hat(c.effarig?.unlocks, 6)) add("effarigLayerDreiBrechen", "effarigLayerDrei", "Beende Effarigs dritten Abschnitt mithilfe gespeicherter Zeit.",
        ["Speichere ungefähr eine Sekunde reale Zeit als Black-Hole-Spielzeit. Die Nameless-Reality muss dafür noch nicht abgeschlossen sein.", "Starte Effarigs Reality mit einem Dilation-Glyph mit TT-Erzeugung. Kaufe EC10 und entlade die Zeit am Fortschrittswall, dann spiele bis Reality."], "Effarigs dritter Abschnitt ist abgeschlossen.");
      else if (!hat(c.enslaved?.unlocks, 0)) schritte.push(leererSchritt("namenloseZeitSammeln", "namelessZeit"));
      else if (!hat(c.enslaved?.unlocks, 1)) add("namenloseRealityFreischalten", "namelessRealityOeffnen", "Öffne die Nameless-Reality für e40 Jahre gespeicherte Zeit.",
        [`Noch nötige Rekorde: ${p.bestGlyphLevel >= 5000 ? "Level 5000 erledigt" : "Glyph-Level 5000"}; ${p.bestGlyphRarity >= 100 ? "100 % Seltenheit erledigt" : "100 % Glyph-Seltenheit"}.`, "Speichere mit einem Game-Speed-Set (Effarig + vier Time) e40 Jahre Spielzeit und kaufe die Freischaltung."], "Die Nameless-Reality ist startbar.");
      else if (!c.enslaved?.completed) schritte.push(...namelessSchritte(p));
      else schritte.push(leererSchritt("achievement151Holen", "achievement151"));
    }
    return { phase, schritte: schritte.slice(0, MAX_SICHTBAR), hinweise: [],
      meilenstein: { ...MEILENSTEINE.find(m => m.phase === phase), restSchritte: schritte.length } };
  }

  /* Ein Ziel beschreibt genau eine Sache, die der Spieler erreichen kann.
     gruppe    — Ziele derselben Gruppe werden zu einem Schritt zusammengefasst
     schrittId — der Text in content.js, der diese Gruppe erklärt */
  const ZIELE = [

    /* -------- preInfinity -------- */
    { id: "ersteInfinity", phase: "preInfinity", gruppe: "ersteInfinity",
      schrittId: "ersteInfinityPushen", bezeichnung: "die erste Infinity",
      istErledigt: p => Boolean(p.infinityUnlocked),
      istNochMoeglich: () => true },
    /* Je Challenge ein Ziel, damit der Schritt die tatsächlich offenen Nummern
       nennt statt "arbeite alle zwölf ab", wenn sieben davon längst stehen. */
    ...[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(id => ({
      id: `normalChallenge${id}`, phase: "infinity", gruppe: "normalChallenges",
      schrittId: "normalChallengesAbarbeiten", bezeichnung: `C${id}`,
      istErledigt: p => hat(p.normalChallenges, id),
      istNochMoeglich: () => true,
    })),

    /* -------- infinity -------- */
    { id: "infinityUpgrades", phase: "infinity", gruppe: "infinityUpgrades",
      schrittId: "infinityUpgradesKaufen", bezeichnung: "die Infinity Upgrades",
      istErledigt: p => (p.infinityUpgradeCount ?? 0) >= 16,
      istNochMoeglich: () => true },
    { id: "crunchAutobuyer", phase: "infinity", gruppe: "crunchAutobuyer",
      schrittId: "crunchAutobuyerMaximieren", bezeichnung: "der Crunch-Autobuyer",
      istErledigt: p => Boolean(p.breakInfinityReady || p.breakInfinity),
      istNochMoeglich: () => true },
    { id: "infinityDimensions", phase: "infinity", gruppe: "infinityDimensions",
      schrittId: "breakInfinityAusbauen", bezeichnung: "alle acht Infinity Dimensions",
      istRelevant: p => Boolean(p.breakInfinity),
      istErledigt: p => (p.infinityDimensionsUnlocked ?? 0) >= 8,
      istNochMoeglich: () => true },
    ...[1, 2, 3, 4, 5, 6, 7, 8].map(id => ({
      id: `infinityChallenge${id}`, phase: "infinity", gruppe: "infinityChallenges",
      schrittId: "infinityChallengesAbarbeiten", bezeichnung: `IC${id}`,
      istRelevant: p => Boolean(p.breakInfinity),
      istErledigt: p => hat(p.infinityChallenges, id),
      istNochMoeglich: () => true,
    })),
    { id: "replicanti", phase: "infinity", gruppe: "replicanti",
      schrittId: "replicantiFreischalten", bezeichnung: "Replicanti",
      istRelevant: p => Boolean(p.breakInfinity),
      istErledigt: p => Boolean(p.replicantiUnlocked),
      istNochMoeglich: () => true },
    { id: "ersteEternityNachBreak", phase: "infinity", gruppe: "ersteEternityNachBreak",
      schrittId: "ersteEternityErreichen", bezeichnung: "die erste Eternity",
      istRelevant: p => Boolean(p.breakInfinity),
      istErledigt: p => Boolean(p.eternityUnlocked),
      istNochMoeglich: () => true },

    /* -------- earlyEternity -------- */
    { id: "ersteTt", phase: "earlyEternity", gruppe: "ersteTt",
      schrittId: "ersteTimeTheorems", bezeichnung: "die ersten Time Theorems",
      istErledigt: p => (p.totalTT ?? 0) >= 22,
      istNochMoeglich: () => true },
    { id: "milestones", phase: "earlyEternity", gruppe: "milestones",
      schrittId: "eternityMilestonesErreichen", bezeichnung: "die Eternity Milestones",
      istErledigt: p => (p.resources?.eternities ?? 0) >= 100,
      istNochMoeglich: () => true },
    { id: "ecVorbereitung", phase: "earlyEternity", gruppe: "ecVorbereitung",
      schrittId: "aufEcVorbereiten", bezeichnung: "die EC-Vorbereitung",
      istErledigt: p => (p.totalTT ?? 0) >= 130
        && (p.resources?.eternities ?? 0) >= 20000,
      istNochMoeglich: () => true },

    /* -------- eternityChallenges -------- */
    { id: "ecRoute", phase: "eternityChallenges", gruppe: "ecRoute",
      schrittId: "naechstenEcLaufMachen", bezeichnung: "die EC-Route",
      istErledigt: p => (p.clears ?? []).reduce((s, v) => s + v, 0) >= 60,
      istNochMoeglich: () => true },

    /* -------- dilation -------- */
    { id: "dilationZyklus", phase: "dilation", gruppe: "dilationZyklus",
      schrittId: "dilationZyklusFahren", bezeichnung: "der Dilation-Zyklus",
      istErledigt: p => (p.realities ?? 0) > 0,
      istNochMoeglich: () => true },

    /* -------- reality --------
       Die vier Requirement-Ziele teilen sich eine Gruppe. Genau das ist die
       Reparatur: erfüllte Bedingungen bleiben dauerhaft gespeichert
       (src/core/reality-upgrades.js:82), also sammelt man sie gemeinsam ein. */
    { id: "ruReiheEins", phase: "reality", gruppe: "ruReiheEins",
      schrittId: "ersteRealityUpgradeReihe", bezeichnung: "die erste Reality-Upgrade-Reihe",
      istErledigt: p => [1, 2, 3, 4, 5].every(id => (p.realityRebuyables?.[id] ?? 0) >= 1),
      istNochMoeglich: () => true },
    { id: "ru6", phase: "reality", gruppe: "realityRequirements",
      schrittId: "realityRequirementsSammeln", bezeichnung: ruName(6, true),
      istRelevant: istRealityDreiRoute,
      istErledigt: p => hat(p.realityUpgradeUnlocks, 6) || hat(p.realityUpgrades, 6),
      istNochMoeglich: p => p.requirementChecks?.noEternities !== false
        && p.requirementChecks?.noRG !== false,
      verbranntWeil: "In dieser Reality ist bereits eine Replicanti-Galaxie gefallen "
        + "oder du hast schon eternitiert." },
    { id: "ru7", phase: "reality", gruppe: "realityRequirements",
      schrittId: "realityRequirementsSammeln", bezeichnung: ruName(7, true),
      istRelevant: istRealityDreiRoute,
      istErledigt: p => hat(p.realityUpgradeUnlocks, 7) || hat(p.realityUpgrades, 7),
      istNochMoeglich: p => p.requirementChecks?.noInfinities !== false
        && (p.galaxies ?? 0) <= 1,
      verbranntWeil: "Die erste Infinity ist schon vorbei oder du hast mehr als eine Antimatter-Galaxie." },
    { id: "ru8", phase: "reality", gruppe: "realityRequirements",
      schrittId: "realityRequirementsSammeln", bezeichnung: ruName(8, true),
      istRelevant: istRealityDreiRoute,
      istErledigt: p => hat(p.realityUpgradeUnlocks, 8) || hat(p.realityUpgrades, 8),
      istNochMoeglich: p => !p.gainedAutoAchievements,
      verbranntWeil: "Der Achievement-Timer hat dir in dieser Reality bereits eines geschenkt." },
    { id: "ru10", phase: "reality", gruppe: "realityRequirements",
      schrittId: "realityRequirementsSammeln", bezeichnung: ruName(10, true),
      istRelevant: istRealityDreiRoute,
      istErledigt: p => hat(p.realityUpgradeUnlocks, 10) || hat(p.realityUpgrades, 10),
      istNochMoeglich: p => p.requirementChecks?.noEternities !== false,
      verbranntWeil: "Du hast in dieser Reality schon eternitiert." },

    { id: "ru15", phase: "reality", gruppe: "realityEpSchwellen",
      schrittId: "realityEpSchwellen", bezeichnung: ruName(15, true),
      istRelevant: istRealityDreiRoute,
      istErledigt: p => hat(p.realityUpgradeUnlocks, 15) || hat(p.realityUpgrades, 15),
      istNochMoeglich: p => (p.epMultUpgrades ?? 0) === 0,
      verbranntWeil: "In dieser Reality ist bereits eine x5-EP-Stufe gekauft." },
    { id: "ru12", phase: "reality", gruppe: "realityEpSchwellen",
      schrittId: "realityEpSchwellen", bezeichnung: ruName(12, true),
      istRelevant: istRealityDreiRoute,
      istErledigt: p => hat(p.realityUpgradeUnlocks, 12) || hat(p.realityUpgrades, 12),
      istNochMoeglich: p => (p.clears?.[0] ?? 0) === 0,
      verbranntWeil: "EC1 ist bereits abgeschlossen." },

    { id: "ru9", phase: "reality", gruppe: "realityGlyphSchwelle",
      schrittId: "realityGlyphSchwelle", bezeichnung: ruName(9, true),
      istRelevant: istRealityDreiRoute,
      istErledigt: p => hat(p.realityUpgradeUnlocks, 9) || hat(p.realityUpgrades, 9),
      istNochMoeglich: ru9NochMoeglich,
      verbranntWeil: "Es sind mehrere Glyphs ausgerüstet oder der einzige Glyph ist unter Level 3." },
    { id: "ru13", phase: "reality", gruppe: "realityGlyphSchwelle",
      schrittId: "realityGlyphSchwelle", bezeichnung: ruName(13, true),
      istRelevant: istRealityDreiRoute,
      istErledigt: p => hat(p.realityUpgradeUnlocks, 13) || hat(p.realityUpgrades, 13),
      istNochMoeglich: p => (p.timeDimensionsUnlocked ?? 0) <= 4,
      verbranntWeil: "In dieser Reality ist bereits eine Time Dimension über der vierten gekauft." },

    { id: "reihenVierUndFuenf", phase: "reality", gruppe: "reihenVierUndFuenf",
      schrittId: "spaeteRealityUpgrades", bezeichnung: "die vierte und fünfte Upgrade-Reihe",
      istRelevant: p => [11, 12, 13, 14, 15].every(id => hat(p.realityUpgrades, id))
        || hatFreischaltung(p, 16, 25),
      istErledigt: p => [16, 17, 18, 19, 20, 21, 22, 23, 24, 25]
        .every(id => hat(p.realityUpgrades, id)),
      istNochMoeglich: () => true },
    { id: "schwarzesLoch", phase: "reality", gruppe: "schwarzesLoch",
      schrittId: "schwarzesLochFreischalten", bezeichnung: "das erste Schwarze Loch",
      istRelevant: p => hatFreischaltung(p, 16, 25) || Boolean(p.blackHoles?.[0]?.unlocked)
        || ([8,9,13].every(id => hat(p.realityUpgrades, id)) && (p.resources?.realityMachines ?? 0) >= 100),
      istErledigt: p => Boolean(p.blackHoles?.[0]?.unlocked),
      istNochMoeglich: () => true },
    { id: "automator", phase: "reality", gruppe: "automator",
      schrittId: "automatorFreischalten", bezeichnung: "den Automator",
      istRelevant: p => Boolean(p.blackHoles?.[0]?.unlocked) || (p.automatorPoints ?? 0) > 0,
      istErledigt: p => Boolean(p.automatorUnlocked),
      istNochMoeglich: () => true },

    /* -------- Teresa -------- */
    { id: "teresaRealityOeffnen", phase: "teresa", gruppe: "teresaRealityOeffnen",
      schrittId: "teresaRealityFreischalten", bezeichnung: "Teresas Reality",
      istErledigt: p => hat(p.celestials?.teresa?.unlocks, 0), istNochMoeglich: () => true },
    { id: "teresaRealitySpielen", phase: "teresa", gruppe: "teresaRealitySpielen",
      schrittId: "teresaRealityAbschliessen", bezeichnung: "Teresas ersten Reality-Lauf",
      istRelevant: p => hat(p.celestials?.teresa?.unlocks, 0),
      istErledigt: p => (p.celestials?.teresa?.bestRunAM ?? 0) > 1,
      istNochMoeglich: () => true },
    { id: "effarigOeffnen", phase: "teresa", gruppe: "effarigOeffnen",
      schrittId: "effarigFreischalten", bezeichnung: "Effarig",
      istRelevant: p => (p.celestials?.teresa?.bestRunAM ?? 0) > 1,
      istErledigt: p => hat(p.celestials?.teresa?.unlocks, 3), istNochMoeglich: () => true },

    /* -------- Effarig -------- */
    { id: "effarigWerkzeuge", phase: "effarig", gruppe: "effarigWerkzeuge",
      schrittId: "effarigWerkzeugeKaufen", bezeichnung: "Effarigs Reality",
      istErledigt: effarigWerkzeugeFertig, istNochMoeglich: () => true },
    { id: "effarigInfinity", phase: "effarig", gruppe: "effarigInfinity",
      schrittId: "effarigInfinityBrechen", bezeichnung: "Effarigs Infinity-Abschnitt",
      istRelevant: effarigWerkzeugeFertig,
      istErledigt: p => hat(p.celestials?.effarig?.unlocks, 4), istNochMoeglich: () => true },
    { id: "effarigEternity", phase: "effarig", gruppe: "effarigEternity",
      schrittId: "effarigEternityBrechen", bezeichnung: "Effarigs Eternity-Abschnitt",
      istRelevant: p => hat(p.celestials?.effarig?.unlocks, 4),
      istErledigt: p => hat(p.celestials?.effarig?.unlocks, 5), istNochMoeglich: () => true },

    /* -------- The Nameless Ones und Effarig 3 -------- */
    { id: "effarigLayerDrei", phase: "enslaved", gruppe: "effarigLayerDrei",
      schrittId: "effarigLayerDreiBrechen", bezeichnung: "Effarigs dritten Abschnitt",
      istRelevant: p => hat(p.celestials?.effarig?.unlocks, 5),
      istErledigt: p => hat(p.celestials?.effarig?.unlocks, 6), istNochMoeglich: () => true },
    { id: "namelessZeit", phase: "enslaved", gruppe: "namelessZeit",
      schrittId: "namenloseZeitSammeln", bezeichnung: "die erste Zeit-Freischaltung",
      istErledigt: p => hat(p.celestials?.enslaved?.unlocks, 0), istNochMoeglich: () => true },
    { id: "namelessRealityOeffnen", phase: "enslaved", gruppe: "namelessRealityOeffnen",
      schrittId: "namenloseRealityFreischalten", bezeichnung: "die Nameless-Reality",
      istRelevant: p => hat(p.celestials?.enslaved?.unlocks, 0),
      istErledigt: p => hat(p.celestials?.enslaved?.unlocks, 1), istNochMoeglich: () => true },
    { id: "namelessReality", phase: "enslaved", gruppe: "namelessReality",
      schrittId: "namenloseRealityLoesen", bezeichnung: "die Nameless-Reality",
      istRelevant: p => hat(p.celestials?.enslaved?.unlocks, 1),
      istErledigt: p => Boolean(p.celestials?.enslaved?.completed), istNochMoeglich: () => true },
    { id: "achievement151", phase: "enslaved", gruppe: "achievement151",
      schrittId: "achievement151Holen", bezeichnung: "Achievement 151",
      istRelevant: p => Boolean(p.celestials?.enslaved?.completed),
      istErledigt: p => hat(p.achievementIds, 151), istNochMoeglich: () => true },

    /* -------- V -------- */
    { id: "vOeffnen", phase: "v", gruppe: "vOeffnen", schrittId: "vFreischalten",
      bezeichnung: "V", istErledigt: p => hat(p.celestials?.v?.unlocks, 0),
      istNochMoeglich: () => true },
    { id: "vNormal", phase: "v", gruppe: "vNormal", schrittId: "vAnforderungenSteigern",
      bezeichnung: "36 normale Space Theorems",
      istRelevant: p => hat(p.celestials?.v?.unlocks, 0),
      istErledigt: p => normaleVTheoreme(p) >= 36, istNochMoeglich: () => true },
    { id: "raTeresa8", phase: "ra", gruppe: "raPetRoute", schrittId: "raPetRouteFahren",
      bezeichnung: "Teresa auf Level 8", istErledigt: p => (p.celestials?.ra?.pets?.teresa ?? 0) >= 8,
      istNochMoeglich: () => true },
    { id: "raEffarig8", phase: "ra", gruppe: "raPetRoute", schrittId: "raPetRouteFahren",
      bezeichnung: "Effarig auf Level 8",
      istRelevant: p => (p.celestials?.ra?.pets?.teresa ?? 0) >= 8,
      istErledigt: p => (p.celestials?.ra?.pets?.effarig ?? 0) >= 8,
      istNochMoeglich: () => true },
    { id: "raNameless5", phase: "ra", gruppe: "raPetRoute", schrittId: "raPetRouteFahren",
      bezeichnung: "Nameless auf Level 5",
      istRelevant: p => (p.celestials?.ra?.pets?.effarig ?? 0) >= 8,
      istErledigt: p => (p.celestials?.ra?.pets?.enslaved ?? 0) >= 5,
      istNochMoeglich: () => true },
    { id: "raEffarig10", phase: "ra", gruppe: "raPetRoute", schrittId: "raPetRouteFahren",
      bezeichnung: "Effarig auf Level 10",
      istRelevant: p => (p.celestials?.ra?.pets?.enslaved ?? 0) >= 5,
      istErledigt: p => (p.celestials?.ra?.pets?.effarig ?? 0) >= 10,
      istNochMoeglich: () => true },
    { id: "raSpaetarbeit", phase: "ra", gruppe: "raSpaetarbeit", schrittId: "raSpaetarbeitMachen",
      bezeichnung: "Ra, Hard V und Alchemy",
      istRelevant: p => (p.celestials?.ra?.pets?.effarig ?? 0) >= 10,
      istErledigt: raSpaetFertig,
      istNochMoeglich: () => true },

    /* -------- Imaginary Machines -------- */
    { id: "raNacharbeitIm", phase: "imaginaryMachines", gruppe: "raNacharbeitIm",
      schrittId: "raNacharbeitImaginary", bezeichnung: "Ra, Hard V und Alchemy",
      istErledigt: raSpaetFertig, istNochMoeglich: () => true },
    ...[11, 12, 13, 14, 15].map(id => ({
      id: `iu${id}`, phase: "imaginaryMachines", gruppe: "iuElfBisFuenfzehn",
      schrittId: "imaginaryUpgradesElfBisFuenfzehn", bezeichnung: `IU${id}`,
      istErledigt: p => hat(p.imaginaryUpgrades, id), istNochMoeglich: () => true,
    })),

    /* -------- Lai'tela -------- */
    { id: "raNacharbeitLaitela", phase: "laitela", gruppe: "raNacharbeitLaitela",
      schrittId: "raNacharbeitLaitela", bezeichnung: "Ra, Hard V und Alchemy",
      istErledigt: raSpaetFertig, istNochMoeglich: () => true },
    ...[16, 17, 18, 19, 20].map(id => ({
      id: `iu${id}`, phase: "laitela", gruppe: "iuSechzehnBisZwanzig",
      schrittId: "imaginaryUpgradesSechzehnBisZwanzig", bezeichnung: `IU${id}`,
      istErledigt: p => hat(p.imaginaryUpgrades, id), istNochMoeglich: () => true,
    })),
    { id: "laitelaTier", phase: "laitela", gruppe: "laitelaTier",
      schrittId: "laitelaDimensionenAbschalten", bezeichnung: "alle Lai'tela-Stufen",
      istErledigt: p => (p.celestials?.laitela?.difficultyTier ?? 0) >= 8,
      istNochMoeglich: () => true },
    ...[21, 22, 23, 24].map(id => ({
      id: `iu${id}`, phase: "laitela", gruppe: "iuEinundzwanzigBisVierundzwanzig",
      schrittId: "imaginaryUpgradesEinundzwanzigBisVierundzwanzig", bezeichnung: `IU${id}`,
      istErledigt: p => hat(p.imaginaryUpgrades, id), istNochMoeglich: () => true,
    })),
    { id: "iu25", phase: "laitela", gruppe: "iuFuenfundzwanzig",
      schrittId: "imaginaryUpgradeFuenfundzwanzig", bezeichnung: "IU25",
      istErledigt: p => hat(p.imaginaryUpgrades, 25), istNochMoeglich: () => true },

    /* -------- Pelle -------- */
    { id: "pelleDoom", phase: "pelle", gruppe: "pelleDoom", schrittId: "pelleDoomStarten",
      bezeichnung: "Doom starten", istErledigt: p => Boolean(p.celestials?.pelle?.doomed),
      istNochMoeglich: () => true },
    { id: "pelleInfinity", phase: "pelle", gruppe: "pelleInfinity", schrittId: "pelleBisInfinity",
      bezeichnung: "die erste Infinity in Doom",
      istRelevant: p => Boolean(p.celestials?.pelle?.doomed),
      istErledigt: p => hat(p.celestials?.pelle?.progress, 1), istNochMoeglich: () => true },
    { id: "pelleReplicanti", phase: "pelle", gruppe: "pelleReplicanti", schrittId: "pelleBisReplicanti",
      bezeichnung: "Replicanti in Doom",
      istRelevant: p => hat(p.celestials?.pelle?.progress, 1),
      istErledigt: p => hat(p.celestials?.pelle?.progress, 2), istNochMoeglich: () => true },
    { id: "pelleEternity", phase: "pelle", gruppe: "pelleEternity", schrittId: "pelleBisEternity",
      bezeichnung: "die erste Eternity in Doom",
      istRelevant: p => hat(p.celestials?.pelle?.progress, 2),
      istErledigt: p => hat(p.celestials?.pelle?.progress, 3), istNochMoeglich: () => true },
    { id: "pelle115Tt", phase: "pelle", gruppe: "pelle115Tt", schrittId: "pelleBisEcs",
      bezeichnung: "115 TT in Doom",
      istRelevant: p => hat(p.celestials?.pelle?.progress, 3),
      istErledigt: p => hat(p.celestials?.pelle?.progress, 4), istNochMoeglich: () => true },
    { id: "pelleDilation", phase: "pelle", gruppe: "pelleDilation", schrittId: "pelleEcsBisDilation",
      bezeichnung: "Dilation in Doom",
      istRelevant: p => hat(p.celestials?.pelle?.progress, 4),
      istErledigt: p => hat(p.celestials?.pelle?.progress, 5), istNochMoeglich: () => true },
    { id: "pelleGenerator", phase: "pelle", gruppe: "pelleGenerator", schrittId: "pelleBisGalaxyGenerator",
      bezeichnung: "den Galaxy Generator",
      istRelevant: p => hat(p.celestials?.pelle?.progress, 5),
      istErledigt: p => Boolean(p.celestials?.pelle?.galaxyGeneratorUnlocked),
      istNochMoeglich: () => true },
    { id: "pelleEnde", phase: "pelle", gruppe: "pelleEnde", schrittId: "pelleGalaxyGeneratorBeenden",
      bezeichnung: "das Spielende",
      istRelevant: p => Boolean(p.celestials?.pelle?.galaxyGeneratorUnlocked),
      istErledigt: p => Boolean(p.isGameEnd), istNochMoeglich: () => true },
    { id: "complete", phase: "complete", gruppe: "complete", schrittId: "durchgespielt",
      bezeichnung: "abgeschlossen", istErledigt: () => false, istNochMoeglich: () => true },
  ];

  /* Reihenfolge der Prüfungen übernommen aus walkthrough.js:66-101, ohne die
     Reality-3-Sonderfälle, die den Defekt ausmachten. */
  function phaseVon(profil) {
    const p = profil ?? {};
    const celestials = p.celestials ?? {};
    const clears = p.clears ?? [];

    /* Nur isGameEnd zählt. fullGameCompletions bedeutet "hat mindestens einmal
       durchgespielt" und bleibt nach einem Neustart für immer größer als null
       (new-game.js:36 erhöht ihn, setzt isGameEnd aber auf false). Wer den Zähler
       als Endezustand liest, meldet jedem Zweitdurchlauf faelschlich "fertig". */
    if (p.isGameEnd) return "complete";
    if (celestials.pelle?.doomed || hat(p.imaginaryUpgrades, 25)) return "pelle";
    if (hat(p.imaginaryUpgrades, 15) || (celestials.laitela?.difficultyTier ?? 0) > 0
      || celestials.laitela?.running) return "laitela";
    if ((p.resources?.imaginaryMachineCap ?? 0) > 0
      || (p.resources?.imaginaryMachines ?? 0) > 0) return "imaginaryMachines";
    if ((celestials.v?.spaceTheorems ?? 0) >= 36
      || Math.max(...Object.values(celestials.ra?.pets ?? { none: 0 })) > 1
      || celestials.ra?.running) return "ra";
    const namenlos = hat(celestials.effarig?.unlocks, 5) || celestials.enslaved?.completed
      || anzahl(celestials.enslaved?.unlocks) > 0 || celestials.enslaved?.running;
    if (namenlos && !hat(celestials.effarig?.unlocks, 6)) return "enslaved";
    if (namenlos && !celestials.enslaved?.completed) return "enslaved";
    if (anzahl(celestials.v?.unlocks) > 0 || celestials.v?.running
      || (celestials.enslaved?.completed && hat(p.achievementIds, 151))) return "v";
    if (namenlos) return "enslaved";
    const teresaOffenUndUnerledigt = (hat(celestials.teresa?.unlocks, 0)
      || hat(celestials.teresa?.unlocks, 3))
      && (celestials.teresa?.bestRunAM ?? 0) <= 1;
    if (teresaOffenUndUnerledigt) return "teresa";
    if (hat(celestials.teresa?.unlocks, 3) || anzahl(celestials.effarig?.unlocks) > 0
      || celestials.effarig?.running) return "effarig";
    if (hat(p.achievementIds, 147) || anzahl(p.realityUpgrades) >= 25
      || anzahl(celestials.teresa?.unlocks) > 0 || (celestials.teresa?.pouredAmount ?? 0) > 0
      || celestials.teresa?.running) return "teresa";
    if ((p.realities ?? 0) > 0) return "reality";
    if (p.dilationActive || p.dilationUnlocked) return "dilation";
    if (p.eternityUnlocked) {
      if (((p.totalTT ?? 0) >= 130 && (p.resources?.eternities ?? 0) >= 20000)
        || clears.some(v => v > 0)
        || (p.currentChallenge?.eternity ?? 0) > 0) return "eternityChallenges";
      return "earlyEternity";
    }
    if (p.infinityUnlocked) return "infinity";
    return "preInfinity";
  }

  /* Wertet die Ziele genau einer Phase aus. Ziele fremder Phasen kommen gar
     nicht erst in Betracht — das ist die Sperre gegen Spoiler-Anweisungen.
     Eigene Funktion, weil der Reality-Planer dieselbe Auswertung braucht, um
     seine konkreten Laufschritte mit den noch offenen Zielen aufzufüllen. */
  function zieleAuswerten(p, phase, nurGruppen = null) {
    const relevant = ZIELE.filter(ziel => ziel.phase === phase
      && (ziel.istRelevant?.(p) ?? true) && !ziel.istErledigt(p)
      && (!nurGruppen || nurGruppen.includes(ziel.gruppe)));

    const gruppen = new Map();
    for (const ziel of relevant) {
      if (!gruppen.has(ziel.gruppe)) {
        gruppen.set(ziel.gruppe, {
          gruppe: ziel.gruppe, id: ziel.schrittId, offen: [], verbrannt: [],
        });
      }
      const eintrag = gruppen.get(ziel.gruppe);
      if (ziel.istNochMoeglich(p)) eintrag.offen.push(ziel);
      else eintrag.verbrannt.push(ziel);
    }

    const hinweise = [];
    const schritte = [];
    for (const eintrag of gruppen.values()) {
      for (const ziel of eintrag.verbrannt) {
        hinweise.push({
          zielId: ziel.id,
          text: `${ziel.bezeichnung} ist in dieser Reality nicht mehr erreichbar. `
            + `${ziel.verbranntWeil ?? ""} Nimm es beim nächsten Reality-Start mit.`.trim(),
        });
      }
      // An active lock completes the preparation, not the upgrade requirement.
      const glyph = eintrag.offen.some(ziel => ziel.id === "ru9") ? ru9GlyphSchritt(p) : null;
      if (glyph) schritte.push(glyph);
      const offen = eintrag.offen.filter(ziel => !(ziel.id === "ru12" && ec1FuerUpgradeOffen(p)
        && hat(p.realityRequirementLocks, 12)) && (eintrag.gruppe !== "realityGlyphSchwelle"
        || (!hat(p.realityRequirementLocks, Number(ziel.id.slice(2))) && !(glyph && ziel.id === "ru9"))));
      if (offen.length === 0) continue;
      schritte.push({
        id: eintrag.id,
        gruppe: eintrag.gruppe,
        zielIds: offen.map(ziel => ziel.id),
        zielNamen: offen.map(ziel => ziel.bezeichnung),
        verbrannt: eintrag.verbrannt.map(ziel => ziel.id),
        verbranntNamen: eintrag.verbrannt.map(ziel => ziel.bezeichnung),
        ...(eintrag.id === "realityGlyphSchwelle" ? { vorab: [
          `Du hast ${zahl(p.resources?.realityMachines ?? 0)} RM. Das Requirement Lock ist kostenlos und kauft kein Upgrade. Die RM-Kosten fallen erst beim späteren Kauf an.`,
        ] } : {}),
      });
    }
    return { schritte, hinweise };
  }

  function phasenPlan(profil) {
    const p = profil ?? {};
    const phase = phaseVon(p);

    if (phase === "preInfinity") return ersteInfinitySchritte(p);
    if (phase === "infinity") return konkreteInfinity(p);
    if (phase === "earlyEternity") return konkreteFrueheEternity(p);
    if (phase === "eternityChallenges") return konkreteEcRoute(p);
    if (phase === "dilation") return konkreteDilation(p);
    if (["teresa", "effarig", "enslaved", "v", "ra", "imaginaryMachines", "laitela", "pelle"].includes(phase)) {
      return konkreteCelestials(p, phase);
    }
    if (phase === "reality") {
      if (vorEternity(p)) return realityVorEternity(p);
      const konkret = konkreteReality(p);
      if (konkret?.schritte?.length) return konkret;
    }

    const { schritte: alle, hinweise } = zieleAuswerten(p, phase);

    const meilenstein = MEILENSTEINE.find(m => m.phase === phase
      && (m.wenn?.(p) ?? true)) ?? null;

    const gestaffeltePhasen = new Set([
      "teresa", "effarig", "enslaved", "v", "ra", "imaginaryMachines", "laitela", "pelle",
    ]);
    const offenePhasengruppen = new Set(ZIELE
      .filter(ziel => ziel.phase === phase && !ziel.istErledigt(p))
      .map(ziel => ziel.gruppe)).size;

    const offeneEcLaeufe = Array.isArray(window.EC_GUIDE_DATA?.route)
      ? window.EC_GUIDE_DATA.route.filter(lauf => (p.clears?.[lauf.ec - 1] ?? 0) < lauf.tier).length
      : alle.length;

    return {
      phase,
      schritte: alle.slice(0, MAX_SICHTBAR),
      meilenstein: meilenstein ? {
        ...meilenstein,
        restSchritte: phase === "eternityChallenges"
          ? offeneEcLaeufe + (p.dilationUnlocked ? 0 : 1)
          : gestaffeltePhasen.has(phase) ? offenePhasengruppen : alle.length,
      } : null,
      hinweise,
    };
  }

  // Discord pin: cumulative imports, no respec between the ten Eternities.
  function r143Etappen(p) {
    const tree = DATEN.planDilationTree(studyBudget(p), p.clears, p.perks,
      { ep: true, split: p.hasDilationStudySplit });
    const ids = tree?.split("|")[0].split(",").map(Number) ?? [];
    if (!ids.includes(234)) return [];
    const bisVor = id => ids.slice(0, ids.indexOf(id));
    const etappe = (nummer, titel, text, studies = []) => ({
      nummer, titel, text,
      baeume: studies.length ? [{ bezeichnung: `r143 · Eternity ${nummer} · nur ergänzen, kein Respec`,
        importString: `${studies.join(",")}|0` }] : [],
    });
    return [
      etappe(1, "Kleinen Startgewinn holen", "Ohne Studies nur AD1 kaufen. Sobald der Eternity-Knopf einen EP-Gewinn anbietet, einmal manuell eternitieren. Etwa e1000 EP sind normal, dein tatsächlicher Gewinn darf abweichen. Das ist Eternity 1 von 10. Den erzielten Exponenten in den Zielrechner eintragen."),
      etappe(2, "Erste Studies und Produktion einschalten", "Tree importieren. Alle Produktions-Autobuyer einschalten, außer Infinity Dimensions und Replicanti-Galaxien. Crunch und Eternity bleiben aus. Bei Bedarf manuell crunchen und Replicanti-Galaxien einzeln kaufen. Beim berechneten EP-Gewinn einmal manuell eternitieren.", ids.filter(id => id <= 62)),
      etappe(3, "Infinity Dimensions automatisch kaufen", "ID-Autobuyer einschalten. Den Tree von Eternity 2 behalten. Weiter bei Bedarf manuell crunchen und einzelne Replicanti-Galaxien kaufen; beim neuen Ziel einmal eternitieren."),
      etappe(4, "Dimensionspfad ergänzen", "Tree importieren, dann wie bisher bis zum neuen EP-Ziel spielen und einmal eternitieren.", bisVor(111)),
      etappe(5, "Active ergänzen", "Tree importieren. Keine schnellen Eternities für TS121 einschieben: Jede Eternity muss das neue EP-Ziel erreichen. Replicanti-Galaxien weiter einzeln kaufen; beim Ziel einmal eternitieren.", bisVor(181)),
      etappe(6, "Mit demselben Tree weiterspielen", "Tree und Einstellungen von Eternity 5 behalten. Das neue EP-Ziel erreichen und einmal eternitieren."),
      etappe(7, "IP ohne Crunch gewinnen", "Tree importieren. Ab TS181 nicht mehr crunchen: IP kommen automatisch. Einzelne Replicanti-Galaxien nach Bedarf; beim neuen Ziel einmal eternitieren.", bisVor(192)),
      etappe(8, "Studies bis 214 ergänzen", "Tree importieren und bis zum neuen Ziel spielen. Replicanti-Galaxien noch manuell kaufen, dann einmal eternitieren.", bisVor(222)),
      etappe(9, "Späte Verstärker ergänzen", "Tree importieren. Falls das Ziel zu langsam näherkommt, TS234 zusätzlich kaufen. Beim neuen Ziel einmal eternitieren.", [...bisVor(222), 222, 224, 226, 228]),
      etappe(10, "Vollen EP-Tree verwenden", `${hat(p.achievementIds, 138) ? "Replicanti-Galaxien-Autobuyer einschalten." : "Replicanti-Galaxien manuell kaufen; mit Active funktioniert ihr Autobuyer erst nach r138."} Tree importieren, das letzte EP-Ziel erreichen und einmal eternitieren. Im Achievement-Tab prüfen, ob r143 leuchtet.`, ids),
    ];
  }

  const ruGrund = id => `${ruName(id, true)} bringt nach dem Kauf ${RU_KAUFREIHE.find(e => e[0] === id)[2]}.`;

  // Official normal-achievements.js supplies conditions; the supplied Discord
  // pins supply deliberate detours. Current-run evidence never comes from a
  // lifetime record. These are opportunities, not extra progression blockers.
  function achievementHinweise(p, phase) {
    if (!Array.isArray(p.achievementIds) || ["pelle", "complete"].includes(phase)) return [];
    const result = [];
    const r = p.resources ?? {};
    const q = p.requirementChecks ?? {};
    const c = p.currentChallenge ?? {};
    const ruhig = !c.normal && !c.infinity && !c.eternity && !p.celestials?.current;
    const frei = ruhig && !p.dilationActive;
    const ep = p.maxEPExponent ?? 0;
    const ip = r.infinityPointsLog10 ?? r.infinityPointsExponent ?? 0;
    const eternityBereit = ip >= Math.log10(Number.MAX_VALUE) && p.infinityDimensionsUnlocked === 8;
    const add = (id, name, wenn, zeitpunkt, text, anleitung = []) => {
      const nutzen = {
        43: "Belohnung: AD1 bis AD8 werden entsprechend ihrer Stufe um 1 % bis 8 % stärker.",
        125: "Belohnung: ein IP-Multiplikator aus der Laufzeit dieser Infinity, nützlich für längere Pushes.",
        154: "Belohnung: Jede Reality hat 10 % Chance auf doppelte Realities und Perk-Punkte.",
      }[id] ?? ([101,107,108,115,122,153].includes(id)
        ? "Dieses Achievement hat keinen eigenen Spezialbonus. Der Hinweis nutzt die gerade passende Bedingung für die Vervollständigung der Achievement-Reihe; ein längerer Umweg ist dafür nicht nötig." : "");
      if (wenn && !hat(p.achievementIds, id)) result.push({ id, name, zeitpunkt, text: text + (nutzen ? " " + nutzen : ""), anleitung });
    };
    const serie = logs => {
      if (!Number.isFinite(logs?.[0])) return 0;
      let n = 1;
      while (n < Math.min(logs.length, 10) && Number.isFinite(logs[n])
        && logs[n - 1] - logs[n] >= Math.log10(Number.MAX_VALUE) - 1e-9) n++;
      return n;
    };
    const epSerie = serie(p.recentEternityEPLog10);
    const ipSerie = serie(p.recentInfinityIPLog10);
    const r143Jetzt = ep >= 4000;
    const r143Automatik = hat(p.realityUpgrades, 13) && ["reality", "dilation"].includes(phase);
    const r143Vorbereitung = r143Automatik && p.dilationUnlocked && ep <= 2000;
    const r143AutoVersuch = frei && r143Automatik && p.dilationUnlocked
      && Math.max(r.dilatedTimeLog10 ?? -Infinity, r.maxDilatedTimeExponent ?? -Infinity) >= 20
      && (ep <= 2000 || (epSerie >= 2 && p.eternityAutobuyer?.mode === 2));
    // Erst eine aktuelle Gelegenheit oder der Dilation-Push, der sie verbauen kann.
    add(143, "Yo dawg, I heard you liked reskins...", ruhig && ((frei && (r143Jetzt || r143Vorbereitung || r143AutoVersuch)) || (p.dilationActive && r143Vorbereitung)),
      r143AutoVersuch ? "Nach dem Dilation-Ausbau versuchen" : r143Vorbereitung ? "Vor dem EP-Push nach Dilation vorbereiten" : "Vor der nächsten Reality",
      r143AutoVersuch ? "Du hast The Telemechanical Process und mindestens e20 Dilated Time im Rekord. Versuche die aufsteigenden Eternities mit dem verbesserten Autobuyer; dieser DT-Richtwert garantiert noch keinen Abschluss."
        : r143Vorbereitung ? "Vor dem großen EP-Push: Dilation bis e20 DT ausbauen und den EP-Rekord möglichst unter e2000 halten. Dann den Plan für den r143-Versuch mit The Telemechanical Process aktualisieren."
        : "Hol die zehn aufsteigenden Eternities vor dem Reality-Reset. Danach setzen Galaxien deine Dimension Boosts nicht mehr zurück.",
      r143AutoVersuch ? [
        "Save exportieren. Automator und gegebenenfalls Auto-Reality pausieren. Für den Versuch keine Challenges oder zusätzlichen manuellen Eternities einschieben.",
        "Außerhalb von Dilation den EP-Push-Tree aus dem Hauptplan laden; falls dafür Respec nötig ist, zuerst respecen und eternitieren. Danach Time-Study-Respec ausschalten.",
        "Automatic Eternity auf „X times highest EP“ mit e310 stellen und einschalten. Die übrigen Produktions-Autobuyer laufen lassen; TDs und ×5 EP weiterkaufen, soweit keine offene Upgrade-Bedingung diese Käufe verbietet.",
        `Der Modus vergleicht mit dem höchsten EP-Bestand dieser Reality. Aktuell passende Serie: ${epSerie}/10. Bis zum Achievement laufen lassen; e20 DT und 30 Sekunden sind keine Erfolgsgarantie. Stockt die Serie, TDs und ×5 EP weiter ausbauen, keine kleine Zwischen-Eternity auslösen.`,
        "Nach r143 die bisherigen Autobuyer-Einstellungen wiederherstellen und den Hauptplan fortsetzen.",
      ] : r143Jetzt ? [
        epSerie >= 2 ? `Deine letzten ${epSerie} Eternities bilden bereits eine passende Serie (von 10). ${epSerie < 10 ? `Nächster sicherer Gewinn: mindestens e${Math.ceil(p.recentEternityEPLog10[0] + 310)} EP. Für alle zehn wären bei diesen Mindestabständen etwa e${Math.ceil(p.recentEternityEPLog10[0] + 310 * (10 - epSerie))} EP nötig. Die folgende Anleitung beginnt deshalb bewusst eine neue Serie mit kleinem Startgewinn.` : "Alle zehn Abstände passen. Prüfe zuerst die Achievement-Anzeige im Spiel; eine neue Serie ist dann nicht nötig."}`
          : "Die folgende Anleitung beginnt eine neue Serie mit kleinem Startgewinn. Du brauchst zehn aufsteigende EP-Gewinne hintereinander.",
        `Vorbereitung (zählt noch nicht zu den zehn): Bisherige Autobuyer-Einstellungen notieren. Auto-Eternity zuerst ausschalten, dann die übrigen einzelnen Autobuyer ausschalten. Den Hauptschalter anlassen, damit du später einzelne Käufer aktivieren kannst.${p.automatorUnlocked ? " Auch den Automator pausieren." : ""}${hat(p.realityUpgrades, 25) ? " Auto-Reality ausschalten." : ""} Außerhalb von Dilation Respec time studies aktivieren → einmal Eternity → prüfen, dass der Study-Baum leer und Respec wieder aus ist. Jetzt ohne Studies nur AD1 kaufen und mit Eternity 1 beginnen.`,
        "Während aller zehn Eternities: Auto-Eternity und Auto-Crunch bleiben aus. Kein Respec, keine Dilation, keine Challenges und keine zusätzlichen Eternities. Die Trees nur ergänzend importieren. Ein kleiner Zwischengewinn startet die Serie neu. „X times highest EP“ hier nicht verwenden: Der Modus nimmt den höchsten EP-Bestand dieser Reality, auch nach dem Neustart der Serie.",
        "Zielregel ohne Save-Import: Unter Statistics → Past Prestige Runs „Showing total resource gain“ wählen und bei Eternities den EP-Gewinn der neuesten Eternity ablesen. Bei 2,5e1000 trägst du nur 1000 in den Rechner ein. Neues Mindestziel: e(Exponent + 311) EP Gewinn. Beispiel bei exakt diesen Exponenten: e1000 → e1311 → e1622 → e1933 → e2244 → e2555 → e2866 → e3177 → e3488 → e3799. Die Reserve deckt auch die weggelassene Mantisse ab.",
        "Vor jedem Klick muss der Eternity-Knopf mindestens das berechnete Ziel als Gewinn anzeigen. Erst dann genau einmal eternitieren, den neuen tatsächlichen Exponenten eintragen und die nächste nummerierte Etappe spielen. Ein höherer Gewinn ist okay; das nächste Ziel wird dann entsprechend höher. Steigt die Anzeige schnell, direkt vor dem Klick noch einmal prüfen.",
        "Falls ein Ziel stockt: Die Studies der nächsten Etappe schon jetzt ergänzen, ohne Respec oder Zwischen-Eternity; bei Bedarf weitere einzelne Replicanti-Galaxien kaufen. Nach TS181 nicht mehr crunchen. Wird selbst mit vollem Tree das Ziel unerreichbar, den Versuch beenden und vor einer späteren Reality erneut probieren.",
        "Nach der zehnten passenden Eternity r143 im Achievement-Tab prüfen. Danach den normalen Tree und die notierten Autobuyer-Einstellungen wiederherstellen, dann den Hauptplan fortsetzen. Während der Anleitung ist kein neuer Save-Import nötig.",
      ] : []);
    const manuell143 = result.find(a => a.id === 143);
    if (manuell143 && r143Jetzt && !r143AutoVersuch) manuell143.etappen = r143Etappen(p);
    add(111, "Yo dawg, I heard you liked infinities...", frei && (ip >= 4000 || ipSerie >= 2), "Vor der nächsten Eternity",
      `Zehn Crunches mit jeweils mindestens ×1,79e308 IP-Gewinn verhindern künftig den Antimatter-Reset bei Dimboosts und Galaxien.${ipSerie >= 2 ? ` Aktuelle Serie: ${ipSerie}/10.` : ""}`,
      ["Eternity- und Crunch-Autobuyer pausieren. Zehn Crunches mit möglichst kleinem Startgewinn spielen, danach jeden Gewinn gegenüber dem tatsächlich letzten um ×e310 erhöhen. Studies/Replicanti-Galaxien schrittweise dazunehmen; keine kleinen Zwischen-Crunches.",
        ...(ipSerie >= 2 && ipSerie < 10 ? [`Nächstes sicheres Ziel: e${Math.ceil(p.recentInfinityIPLog10[0] + 310)} IP Gewinn im Crunch-Knopf. Wenn das nicht erreichbar ist, die Serie mit kleinem Gewinn neu beginnen.`] : []),
        "Nach dem Achievement die zuvor verwendeten Autobuyer wieder einschalten."]);

    // Reset conditions already preserved by this exact Eternity.
    add(101, "8 nobody got time for that", frei && eternityBereit && q.onlyAD8 === true, "Bei der nächsten Eternity",
      "Du hast in dieser Eternity keine AD1–7 gekauft. Lass deren Autobuyer aus und eternitiere jetzt, bevor du eine davon kaufst.");
    add(122, "You're already dead.", frei && eternityBereit && q.onlyAD1 === true, "Bei der nächsten Eternity",
      "Du hast in dieser Eternity keine AD2–8 gekauft. Lass deren Autobuyer aus und eternitiere jetzt, bevor du eine davon kaufst.");
    add(107, "Do you really need a guide for this?", frei && eternityBereit && r.infinities < 10, "Vor dem nächsten Crunch",
      "Du hast weniger als 10 Infinities. Eternitiere jetzt, bevor ein weiterer Crunch die Bedingung verliert.");
    add(116, "Do I really need to infinity", frei && eternityBereit && r.infinities <= 1, "Vor dem nächsten Crunch",
      "Du hast höchstens eine Infinity. Eternitiere jetzt für den IP-Multiplikator; vorher keinen weiteren Crunch auslösen.");
    for (const [id, name, limit] of [[104, "That wasn't an eternity", 30], [113, "Eternities are the new infinity", 0.25]]) {
      add(id, name, frei && eternityBereit && Number.isFinite(p.currentEternitySeconds) && p.currentEternitySeconds <= limit,
        "Jetzt eternitieren", `Beim Speichern lag diese Eternity innerhalb von ${limit === 30 ? "30 Sekunden" : "250 ms"} Spielzeit. Wenn die Anzeige noch darunter liegt, sofort eternitieren; sonst beim nächsten kurzen Lauf versuchen.${id === 113 ? " Belohnung: ×2 Eternities." : " Belohnung: Start mit 5e25 IP."}`);
    }
    add(108, "We COULD afford 9", frei && eternityBereit && p.replicantiRounded === 9, "Jetzt eternitieren",
      "Beim Speichern hattest du gerundet genau 9 Replicanti. Sofort eternitieren, falls die Anzeige noch 9 zeigt; weiteres Wachstum verliert die Gelegenheit.");
    add(95, "Is this safe?", frei && p.replicantiLog10 >= 300 && Number.isFinite(p.currentInfinitySeconds) && p.currentInfinitySeconds <= 3600,
      "Vor der nächsten Replicanti-Galaxie", "Replicanti sind fast am Limit. Auto Galaxy ausschalten, noch nicht crunchen und das Limit (ca. 1,79e308) innerhalb einer Stunde dieser Infinity erreichen. Danach bleiben Replicanti bei Crunches erhalten.");

    // Deliberate side runs: no interruption of ECs, Dilation or Celestial runs.
    const autoAlt = p.realities > 0 && p.autoAchievementsEnabled;
    add(71, "ERROR 909: Dimension not found", frei && epSerie < 2 && (r.maxInfinityPointsExponent ?? 0) >= 45,
      "Beim nächsten kurzen Challenge-Abstecher", `C2 mit genau einer gekauften AD1 abschließen: Das gibt ×3 auf AD1. ${p.currentRun?.eternity ? "Sammle den EP-Gewinn deines laufenden Pushs vorher ein. " : ""}Der Challenge-Start setzt die Infinity zurück.`,
      [`Autobuyer pausieren, C2 starten, genau eine AD1 über Buy 1 kaufen. Nur Tickspeed dazu, keine weiteren Dimensionen, Dimboosts oder Galaxien. Sobald möglich Big Crunch drücken. Danach die zuvor verwendeten Autobuyer wiederherstellen.${p.realities > 0 ? " Schutzschalter für offene Reality-Upgrades beibehalten." : ""}`]);
    add(43, "How the antitables have turned..", frei && ep >= 6 && !autoAlt, "Vor dem nächsten langen Push",
      "Antitables lässt sich in einem kurzen eigenen Lauf erledigen: Die Multiplikatoren müssen strikt AD1 < AD2 < … < AD8 sein.",
      ["Autobuyer pausieren, Time Studies respecen und eternitieren. Nicht crunchen. AD8 für einen Dimboost kaufen und opfern. Danach AD3 kaufen, bis ihr Multiplikator über AD2 liegt; ebenso AD4 bis AD8. Die angezeigten Multiplikatoren vergleichen. Anschließend den bisherigen Tree und die Autobuyer wiederherstellen."]);
    add(112, "Never again", frei && p.eternityUpgradeCount >= 3 && ip >= 600 && !autoAlt, "Vor dem weiteren EP-Push",
      "Alle acht Infinity Challenges mit eingeschaltetem Retry schnell wiederholen. Ziel: Summe unter 750 ms. Das verbessert zugleich dein Eternity Upgrade aus IC-Zeiten. Danach Retry wieder ausschalten.");
    add(115, "I wish I had gotten 7 eternities", !p.celestials?.current && !c.normal && !c.infinity && c.eternity > 0 && p.infinityChallengesUnlocked > 0,
      "In dieser Eternity Challenge", "Starte eine bereits verfügbare Infinity Challenge innerhalb deiner EC. Das zählt sofort, setzt aber den aktuellen Infinity-Aufbau zurück. Falls dein EC-Lauf schon weit ist, nutze erst einen späteren frischen EC-Start; danach die IC verlassen und die EC fortsetzen.");
    add(131, "No ethical consumption", frei && hat(p.studies, 191) && (r.bankedInfinities ?? 0) + (r.infinities ?? 0) * 0.05 > 2e9,
      "Bei der nächsten Eternity", "Mit TS191 reicht die Bank nach dieser Eternity für mehr als 2 Milliarden Banked Infinities. TS191 vor dem Reset behalten. Belohnung: ×2 Infinities und künftig 5 % Banking auch ohne TS191.");
    add(132, "Unique snowflakes", frei && p.dilationUnlocked && ep >= 2350, "Vor dem nächsten Dilation-Push",
      q.noRG === true ? "Diese Eternity hat noch keine Replicanti-Galaxie erhalten. Auto Galaxy ausschalten und ohne R auf 569 Antimatter-Galaxien pushen; das verstärkt TP und DT."
        : "Für den TP-/DT-Bonus einen eigenen Lauf ohne Replicanti-Galaxien starten: Auto Galaxy vor der Eternity ausschalten, danach ohne R auf 569 Antimatter-Galaxien pushen. Richtwert aus den Pins: e2350 EP; die erreichbare Galaxienzahl entscheidet.");
    add(125, "Like feasting on a behind", frei && hat(p.dilationUpgrades, 7) && !hat(p.realityUpgrades, 11) && !autoAlt, "Beim nächsten eigenen Eternity-Lauf",
      "Mit deinem IP-Multiplikator aus DT geht dieser Bonus leicht: AD1- und Crunch-Autobuyer vor der Eternity ausschalten. Danach keine AD1 kaufen und nicht crunchen; mit TS181 bis e90 IP aufbauen. Erst nach dem Achievement die Einstellungen wiederherstellen.");
    add(128, "What do I have to do to get rid of you", frei && ep >= 100 && p.studies?.length === 0 && ip >= 21000,
      "Vor dem nächsten Study-Kauf", "Du bist ohne Time Studies nahe an e22000 IP. Den Baum noch leer lassen, bis e22000 IP erreicht sind; dafür bei Bedarf crunchen. Danach den normalen Tree laden. Belohnung: TD-Multiplikator aus der Zahl deiner Studies.");
    add(134, "When will it be enough?", ruhig && p.dilationUnlocked && hat(p.studies, 192) && !autoAlt, "Vor der nächsten Eternity",
      "Mit TS192 kannst du e18000 Replicanti ansammeln. Auto Galaxy und Auto-Eternity ausschalten, R nicht drücken; Replicanti bis e18000 wachsen lassen. Ein eigener längerer Lauf, anschließend Einstellungen wiederherstellen. Belohnung: doppelte Replicanti-Geschwindigkeit unter dem Limit.");
    add(137, "Now you're thinking with dilation!", ruhig && p.dilationUnlocked && ep >= 2350, "Beim nächsten frischen Dilation-Lauf",
      "Versuche e260000 Antimatter innerhalb einer Minute Spielzeit in Dilation. Falls dein laufender Versuch schon länger dauert, beim nächsten geplanten Start mitnehmen. Mit r137 gibt es ×2 DT und generierte TT während Dilation.");
    add(138, "This is what I have to do to get rid of you.", frei && p.dilationUnlocked && r.dilatedTime >= 3e17,
      "Vor der nächsten Reality", "Ab etwa 3e17 DT lohnt ein eigener Dilation-Lauf ohne Time Studies: respecen, dilatieren, keine Studies laden und bis e26000 IP pushen. Dafür auch crunchen. Danach den Farm-Tree wieder laden. Belohnung: Die Nachteile von TS131 und TS133 entfallen.");

    const basic = ["power", "infinity", "replication", "time", "dilation"];
    const aktiv = p.activeGlyphs ?? [];
    add(148, "Royal flush", frei && basic.every(type => aktiv.some(g => g.type === type)), "Bei der nächsten Reality",
      "Du trägst alle fünf Basis-Glyph-Typen. Behalte dieses Set bis zum Reality-Reset. Danach erhöhen verschiedene ausgerüstete Glyph-Typen das Glyph-Level.");
    add(153, 'More like "reallydoesn\'tmatter"', frei && p.realityAvailable && q.noAM === true, "Bei der nächsten Reality",
      "Diese Reality hat noch kein Antimatter produziert. AD-Autobuyer aus lassen, kein EC7 starten und jetzt Reality auslösen.");
    add(156, "College Dropout", frei && p.realityAvailable && q.noPurchasedTT === true, "Vor dem nächsten TT-Kauf",
      "Du hast in dieser Reality keine Time Theorems gekauft und kannst resetten. TT-Autobuyer aus lassen und Reality auslösen. Belohnung: ×2,5 generierte TT.");
    add(154, "I am speed", frei && p.realityAvailable && Number.isFinite(p.realityGameTimeMs) && p.realityGameTimeMs <= 5000,
      "Jetzt Reality auslösen", "Beim Speichern lag die Reality innerhalb von 5 Sekunden Spielzeit. Wenn das noch zutrifft, sofort resetten; eine laufende Black Hole kann das Zeitfenster rasch schließen.");
    const spaet = REIHENFOLGE.indexOf(phase) >= REIHENFOLGE.indexOf("enslaved");
    add(165, "Perfectly balanced", frei && spaet && p.bestGlyphLevel >= 5000, "Vor der nächsten Reality",
      "Im Glyph-Level-Faktoren-Menü die Gewichtung mit Reset auf vier gleiche Anteile stellen. Erst Reality auslösen, wenn das angebotene Glyph-Level damit mindestens 5000 ist. Der alte Bestwert genügt nicht. Falls das Level zu niedrig ist, vorherige Gewichtung wiederherstellen. Belohnung: automatische optimale Gewichtung.");
    add(166, "Nicenice.", frei && spaet && p.bestGlyphLevel >= 6500, "Beim nächsten Glyph-Push",
      "Reality-Autobuyer pausieren und das angebotene Glyph-Level auf exakt 6969 bringen, nötigenfalls über die Faktor-Gewichtung. Erst bei genau 6969 resetten. Belohnung: +69 Glyph-Level.");
    return result;
  }

  function planeFuer(profil) {
    const plan = phasenPlan(profil);
    const schritte = plan.schritte.filter(schritt => schritt.id !== KONKRETE_SCHRITTE.ecReload.schrittId);
    // Beide Reality-Routen brauchen auch nach e4000 den Dilation-Aufbau.
    for (const schritt of schritte.filter(s => s.gruppe === "realityRm")) {
      const { farmBaum } = dilationAufbau(profil);
      schritt.werte.rmStart = profil.dilationActive
        ? "Dilation läuft bereits. Sammle weiter DT und kauf die bezahlbaren Dilation-Upgrades. Nach dem nächsten ×3-TP-Kauf: Sobald Eternity zusätzliche TP anzeigt, Respec time studies aktivieren und den dilatierten Lauf mit Eternity beenden. Erst danach den EP-Push-Baum laden."
        : "Für den EP-/RM-Push: Time Studies respecen, eternitieren und den EP-Push-Baum unten laden. Diesen Push außerhalb von Dilation spielen.";
      schritt.werte.dilationWechsel = profil.dilationUnlocked
        ? "Wenn der EP-/RM-Push stockt: außerhalb von Dilation Respec time studies aktivieren → Eternity → Dilation-Baum unten importieren → Dilate time. DT sammeln und ×3 TP / ×2 DT ausbauen. Nach dem nächsten ×3-TP-Kauf den Lauf bei zusätzlichem TP-Gewinn mit Respec + Eternity beenden; erst danach den EP-Push-Baum laden und erneut zum RM-Ziel pushen."
        : "";
      if (profil.dilationUnlocked && farmBaum) schritt.baeume.push({
        bezeichnung: `Dilation-Baum für weitere TP/DT · ${zahl(baumKosten(farmBaum))} TT`, importString: farmBaum,
      });
    }
    // Gemeinsamer Einstieg fuer Sonderroute und regulaere Reality-Ziele.
    // Boni helfen beim IP-Push; sie sind KEINE zusaetzliche RU8-Bedingung.
    // Nach einem geplanten Reset ist der aktuelle Achievement-Bestand ungueltig.
    if (plan.phase === "reality" && !profil.gainedAutoAchievements
      && !hat(profil.realityUpgradeUnlocks, 8) && !hat(profil.realityUpgrades, 8)
      && !schritte.some(schritt => schritt.gruppe === "realityReset")) {
      for (const schritt of schritte) {
        if (schritt.gruppe !== "realityBundle" && !hat(schritt.zielIds, "ru8")) continue;
        const ipZiel = schritt.gruppe === "realityBundle" || hat(schritt.zielIds, "ru10") ? 400 : 308;
        if ((profil.resources?.infinityPointsExponent ?? 0) >= ipZiel) continue;
        schritt.fehlendeAchievements = [71, 23, 28, 85, 95, 93]
          .filter(id => !hat(profil.achievementIds, id));
        schritt.spaetereAchievements = [35, 43, 87].filter(id => !hat(profil.achievementIds, id));
      }
      if (profil.autoAchievementsEnabled
        && schritte.some(s => s.gruppe === "realityBundle" || hat(s.zielIds, "ru8"))
        && !schritte.some(s => s.gruppe === "realityAutoAchievements")) {
        schritte.unshift(leererSchritt(KONKRETE_SCHRITTE.realityAutoAchievements.schrittId,
          "realityAutoAchievements"));
      }
      const lauf = profil.currentChallenge ?? {};
      const vorbereitung = schritte.findIndex(s => s.gruppe === "realityBundle" || hat(s.zielIds, "ru8"));
      if (vorbereitung >= 0 && (lauf.infinity > 0 || lauf.normal > 0)) {
        const ic4 = lauf.infinity === 4;
        schritte.splice(vorbereitung, 0, leererSchritt(KONKRETE_SCHRITTE.realityChallenge.schrittId,
          "realityChallenge", {
            werte: {
              challengeName: lauf.infinity > 0 ? `IC${lauf.infinity}` : `Challenge ${lauf.normal}`,
              challengeZiel: ic4 ? "e13000 Antimatter" : "dem im Challenge-Tab angezeigten Antimatter-Ziel",
            },
            zielIds: ic4 ? ["ic4"] : [],
          }));
      }
    }
    // Reload is a UI action, not one of the player's next five game actions.
    if (profil.gainedRMIsEstimate) {
      for (const schritt of schritte.filter(s => ["realityRm", "realityReset"].includes(s.gruppe))) {
        schritt.hinweis = "Der RM-Wert hier ist eine Basis-Schätzung aus dem EP-Rekord. Zusätzliche RM-Multiplikatoren und der noch nicht ausgezahlte EP-Ertrag können ihn erhöhen. Vor dem Reset die Anzeige im Reality-Knopf prüfen.";
      }
    }
    if (schritte.length <= MAX_SICHTBAR && schritte.at(-1)?.gruppe === "ruJetztKaufen") {
      schritte[schritte.length - 1] = { ...schritte.at(-1), saveNeuEinlesen: true };
    }
    const sichtbar = schritte.slice(0, MAX_SICHTBAR);
    const erklaerPerks = [...(profil.perks ?? [])];
    for (const schritt of sichtbar) {
      if (schritt.gruppe === "perkPfad") erklaerPerks.push(...schritt.kaufIds);
      for (const etappe of schritt.etappen ?? [schritt]) etappe.erklaerPerks = [...erklaerPerks];
      const ruIds = (schritt.zielIds ?? []).filter(id => /^ru\d+$/.test(id)).map(id => Number(id.slice(2)));
      if (ruIds.length) schritt.inhalt = { ...schritt.inhalt,
        warumDetails: [...(schritt.inhalt?.warumDetails ?? []), ...ruIds.map(ruGrund)] };
    }
    const schonErklaert = new Set(sichtbar.flatMap(s => s.fehlendeAchievements ?? []));
    const achievements = achievementHinweise(profil ?? {}, plan.phase).filter(a => !schonErklaert.has(a.id));
    if (achievements.some(a => a.id === 143 && a.anleitung.length)) {
      for (const schritt of sichtbar.filter(s => s.gruppe === "realityRm")) {
        schritt.vorab = ["Optional r143 zuerst: Wenn du das Achievement jetzt mitnehmen möchtest, folge zuerst der Anleitung unter „Noch mitnehmen“. Den folgenden RM-/Dilation-Plan mit Tree-Wechseln und kurzen Eternities erst nach diesem Versuch beginnen; diese Wechsel können die laufende Serie unterbrechen.", ...(schritt.vorab ?? [])];
      }
    }
    return { ...plan, schritte: sichtbar, achievements };
  }

  function statusFuer(p, phase) {
    const r = p.resources ?? {};
    const exp = wert => wert == null ? "—" : `e${Math.floor(wert)}`;
    const ec = (p.clears ?? []).reduce((summe, wert) => summe + Math.min(5, wert), 0);
    const tt = `${zahl(p.totalTT)} TT`;
    const ep = `${exp(p.maxEPExponent)} EP-Rekord`;
    const rm = `${r.realityMachinesLog10 > 308 ? "e" + Math.floor(r.realityMachinesLog10) : zahl(r.realityMachines)} RM auf Lager`;
    const cel = p.celestials ?? {};
    const status = {
      preInfinity: [`${exp(r.antimatterExponent)} Antimatter`, `${zahl(p.galaxies)} Galaxien`, `${zahl(p.dimensionBoosts)} Dimension Boosts`],
      infinity: [`${exp(r.infinityPointsExponent)} IP`, `${anzahl(p.normalChallenges)}/12 Challenges`, `${anzahl(p.infinityChallenges)}/8 Infinity Challenges`, `${zahl(p.infinityDimensionsUnlocked)}/8 Infinity Dimensions`],
      earlyEternity: [tt, `${zahl(r.eternities)} Eternities`, ep],
      eternityChallenges: [tt, `${ec}/60 EC-Abschlüsse`, `${zahl(r.eternities)} Eternities`, ep],
      dilation: [ep, `${zahl(r.dilatedTime)} Dilated Time`, `${zahl(r.tachyonParticles)} Tachyon Particles`, `${zahl(p.timeDimensionsUnlocked)}/8 Time Dimensions`],
      reality: [`Reality ${zahl(p.reality ?? (p.realities ?? 0) + 1)}`, ...(vorEternity(p) ? ["Aktueller Lauf: Infinity"] : []), rm, `${zahl(p.gainedRMEstimate)} ${p.gainedRMIsEstimate ? "Basis-RM (geschätzt)" : "RM im Reality-Knopf"}`, `${zahl(p.perkPoints ?? 0)} Perk-Punkte`, ec === 60 ? "alle 60 EC-Abschlüsse" : `${ec}/60 EC-Abschlüsse`],
      teresa: [rm, `${zahl(cel.teresa?.pouredAmount)} RM im Behälter`, `${anzahl(cel.teresa?.unlocks)} Freischaltungen`],
      effarig: [`${zahl(cel.effarig?.relicShards)} Relic Shards`, `${anzahl(cel.effarig?.unlocks)} Freischaltungen`, ep],
      enslaved: [`${anzahl(cel.enslaved?.unlocks)} Freischaltungen`, `${anzahl(cel.effarig?.unlocks)} Effarig-Freischaltungen`, ep],
      v: [`${zahl(cel.v?.spaceTheorems)} Space Theorems`, `${anzahl(cel.v?.unlocks)} Freischaltungen`, rm],
      ra: Object.entries(cel.ra?.pets ?? {}).map(([name, level]) => `${name === "enslaved" ? "Nameless" : name[0].toUpperCase() + name.slice(1)} Level ${zahl(level)}`).slice(0, 4),
      imaginaryMachines: [`${zahl(r.imaginaryMachines)} Imaginary Machines`, `${zahl(r.imaginaryMachineCap)} IM-Limit`, `${anzahl(p.imaginaryUpgrades)} Imaginary Upgrades`],
      laitela: [`${zahl(cel.laitela?.difficultyTier)} abgeschlossene Stufen`, `${anzahl(p.imaginaryUpgrades)} Imaginary Upgrades`, `${zahl(r.imaginaryMachines)} Imaginary Machines`],
      pelle: [tt, `${ec}/60 EC-Abschlüsse`, `${anzahl(cel.pelle?.progress)} Strikes`, ep],
      complete: [`${zahl(p.fullGameCompletions)} frühere Abschlüsse`, `${zahl(p.realities)} Realitys`, `${zahl(p.achievementCount ?? anzahl(p.achievementIds))} Achievements`],
    };
    return (status[phase] ?? []).join(" · ");
  }

  // ruName und perkName gehen mit hinaus, damit der Kontextblock in content.js
  // die sichtbaren Namen nicht ein zweites Mal fuehren muss.
  window.AD_PLAN = { phaseVon, planeFuer, statusFuer, ruName, perkName, runBaeumeFuer,
    ALLE_MEILENSTEINE: MEILENSTEINE, REIHENFOLGE };
})();
