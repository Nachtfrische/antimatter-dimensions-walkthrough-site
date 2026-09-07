/* Deutsche Schritttexte und gemeinsame Aufloesung der Save-Platzhalter. */
(() => {
  "use strict";


  const PHASEN = {
    preInfinity: {
      titel: "Vor der ersten Infinity",
      farbe: "#2196f3",
    },
    infinity: {
      titel: "Infinity",
      farbe: "#b67f33",
    },
    earlyEternity: {
      titel: "Frühe Eternity",
      farbe: "#b341e0",
    },
    eternityChallenges: {
      titel: "Eternity Challenges",
      farbe: "#b341e0",
    },
    dilation: {
      titel: "Time Dilation",
      farbe: "#64dd17",
    },
    reality: {
      titel: "Reality",
      farbe: "#0ba00e",
    },
    teresa: { titel: "Teresa", farbe: "#5151ec" },
    effarig: { titel: "Effarig", farbe: "#d13737" },
    enslaved: { titel: "The Nameless Ones", farbe: "#f1aa7f" },
    v: { titel: "V", farbe: "#ead584" },
    ra: { titel: "Ra", farbe: "#9575cd" },
    imaginaryMachines: { titel: "Imaginary Machines", farbe: "#ff9800" },
    laitela: { titel: "Lai'tela", farbe: "#c8ccd4" },
    pelle: { titel: "Pelle", farbe: "#dc143c" },
    complete: { titel: "Durchgespielt", farbe: "#64dd17" },
  };

  const SCHRITTE = {

    /* ---------------- Vor der ersten Infinity ---------------- */

    ersteInfinityPushen: {
      phase: "preInfinity",
      kurz: "Spiel auf 1,79e308 Antimatter und löse damit deinen ersten Big Crunch aus.",
      warum: "Antimatter Dimensions sind eine Kette: Die achte Dimension erzeugt die siebte, "
        + "die siebte die sechste, und ganz unten fällt Antimatter heraus. Deshalb bringt "
        + "eine Galaxie, die die gesamte Tickspeed verbessert, fast immer mehr als ein "
        + "weiterer Kauf ganz unten in der Kette. Bei 1,79e308 ist die Zahl technisch am "
        + "Ende, und du tauschst den ganzen Fortschritt gegen die nächste Währung ein.",
      soGehts: [
        "Kauf grundsätzlich die höchste Dimension, die du dir leisten kannst.",
        "Wenn eine Galaxie verfügbar ist, nimm sie vor jedem weiteren Dimension Boost.",
        "Nutze Sacrifice, sobald der angezeigte Multiplikator über 2x liegt. Am besten "
          + "direkt nachdem du einen Satz achte Dimensionen gekauft hast.",
        "Peil für die erste Infinity ungefähr zwei Galaxien an.",
        "Bei 1,79e308 Antimatter drückst du Big Crunch und bekommst deinen ersten Infinity Point.",
      ],
      fertigWenn: "Du hast einen Big Crunch ausgelöst und siehst den Infinity-Tab.",
      siehe: ["dimensionenUndTickspeed", "galaxienUndDimboosts", "sacrifice"],
    },

    normalChallengesAbarbeiten: {
      phase: "infinity",
      kurz: "Dir fehlen noch: {ziele}. Arbeite sie ab, um die Autobuyer freizuschalten.",
      warum: "Jede Normal Challenge ist eine Infinity unter einer zusätzlichen Einschränkung, "
        + "und jede schaltet einen Autobuyer oder ein Komfort-Upgrade frei. Ohne diese "
        + "Automation musst du alles von Hand klicken, was den Rest des Spiels zäh macht. "
        + "Besonders wichtig ist Challenge 12, weil sie den Crunch-Autobuyer bringt.",
      soGehts: [
        "Wiederhol zuerst Challenge 8, bis du das Upgrade für stärkere Galaxien kaufen kannst.",
        "Kauf danach die dritte Spalte der Infinity Upgrades und hol die leichteren offenen Challenges nach.",
        "Mach Achievement r43 möglichst in Challenge 8, solange dessen Regel dir dabei hilft.",
        "Zieh Challenge 12 vor, sobald sie machbar ist — sie bringt den Crunch-Autobuyer.",
        "Challenge 2 und Challenge 9 sind deutlich härter. Heb sie dir bis zum Schluss auf.",
      ],
      fertigWenn: "Im Challenges-Tab stehen {ziele} als abgeschlossen.",
      falle: "Challenge 9 kannst du notfalls später mit viel ungenutztem IP nachholen. "
        + "Verbeiss dich nicht darin, wenn sie gerade nicht geht.",
      siehe: ["challengesVerstehen"],
    },

    /* ---------------- Infinity ---------------- */

    infinityUpgradesKaufen: {
      phase: "infinity",
      kurz: "Kauf die Infinity Upgrades in der Reihenfolge billig vor teuer.",
      warum: "Die Infinity Upgrades überleben deine nächsten Big Crunches. "
        + "Der Multiplikator, der auf deiner gespielten Zeit basiert, ist am Anfang der "
        + "stärkste, weil deine Spielzeit anfangs viel schneller wächst als deine "
        + "Anzahl Infinities. Die vierte Spalte funktioniert innerhalb von Challenges "
        + "nicht, deshalb lohnt es sich, Challenges vor ihr zu erledigen.",
      soGehts: [
        "Kauf zuerst den Multiplikator, der auf der gespielten Zeit basiert.",
        "Danach das Upgrade, das den Buy-10-Multiplikator von 2x auf 2,2x anhebt.",
        "Dann alles, was nur einen Infinity Point kostet.",
        "Danach das Upgrade für die Galaxienstärke, dann die dritte Spalte.",
        "Die vierte Spalte zuletzt, denn sie wirkt in Challenges ohnehin nicht.",
      ],
      fertigWenn: "Die ersten drei Spalten der Infinity Upgrades sind vollständig gekauft.",
      siehe: ["infinityUpgrades"],
    },

    crunchAutobuyerMaximieren: {
      phase: "infinity",
      kurz: "Bring den Crunch-Autobuyer auf 0,100 Sekunden Intervall.",
      warum: "Das ist die eigentliche Bedingung für Break Infinity — nicht etwa alle zwölf "
        + "Normal Challenges, wie oft behauptet wird. Der Autobuyer wird nach Challenge 12 "
        + "verfügbar, und du musst sein Intervall Stufe für Stufe herunterkaufen. "
        + "Insgesamt kostet das 32.767 Infinity Points.",
      soGehts: [
        "Schalt den ×2-IP-Multiplikator frei und kauf ihn viermal bis ×16, das kostet zusammen 11.110 IP.",
        "Automation → Autobuyers: Kauf beim Crunch-Autobuyer alle Intervallstufen bis 0,100 Sekunden für insgesamt 32.767 IP.",
        "Steck den Großteil deiner IP in das Crunch-Intervall; bei anderen Autobuyern vorerst keine teuren Stufen kaufen.",
        "Wenn du aktiv spielst: Max halten und die Autobuyer auf schnellen Crunch trimmen.",
        "Wenn du nebenher spielst: ein paar Autobuyer verbessern und über Nacht laufen lassen.",
        "Drücke bei 0,100 s im Break-Infinity-Tab den Knopf Break Infinity.",
      ],
      fertigWenn: "Der Crunch-Autobuyer steht auf 0,100 s und der Break-Infinity-Knopf ist verfügbar.",
      falle: "Gib vorher keine großen IP-Mengen für andere Autobuyer aus. Die helfen dir "
        + "hier nicht und du brauchst jeden Punkt.",
    },

    breakInfinityAusbauen: {
      phase: "infinity",
      kurz: "Schalte nach Break Infinity alle acht Infinity Dimensions frei.",
      warum: "Nach dem Break endet dein Lauf nicht mehr an der alten Zahlengrenze. Infinity "
        + "Points öffnen nun nach und nach die Infinity Dimensions; jede weitere Stufe verstärkt "
        + "die Produktionskette und bringt dich an die nächste große IP-Schwelle.",
      soGehts: [
        "Aktivier Break Infinity und lass den Big-Crunch-Autobuyer wieder normal arbeiten.",
        "Kauf bei jeder neuen IP-Schwelle zuerst die nächste Infinity Dimension.",
        "Nimm verfügbare Break-Infinity-Upgrades mit, bevor du einen langen Push startest.",
      ],
      fertigWenn: "Im Infinity-Dimensions-Tab sind alle acht Stufen freigeschaltet.",
    },

    infinityChallengesAbarbeiten: {
      phase: "infinity",
      kurz: "Dir fehlen noch: {ziele}. Schließ sie ab, sobald ihre Ziele in Reichweite kommen.",
      warum: "Infinity Challenges geben dauerhafte Multiplikatoren und sind Teil des normalen "
        + "Wegs zur ersten Eternity. Sie werden nicht alle gleichzeitig leicht; ein kurzer "
        + "Produktions-Push zwischen zwei Challenges ist deshalb völlig normal.",
      soGehts: [
        "Starte jeweils die nächste freigeschaltete Infinity Challenge und prüf ihr konkretes Ziel.",
        "Wenn ein Lauf festhängt, geh heraus, kauf Break-Infinity-Upgrades und versuch ihn später erneut.",
        "Hol offene Achievements mit, wenn ihre Bedingung zu einer Challenge passt.",
      ],
      fertigWenn: "{ziele} sind als abgeschlossen markiert.",
    },

    replicantiFreischalten: {
      phase: "infinity",
      kurz: "Schalte Replicanti frei und bau Geschwindigkeit und Galaxien auf.",
      warum: "Replicanti wachsen neben deiner normalen Produktion und liefern eigene Galaxien. "
        + "Diese Galaxien verstärken deinen Push, ohne die normalen Antimatter-Galaxien zu "
        + "ersetzen, und werden für die letzte Strecke zur ersten Eternity wichtig.",
      soGehts: [
        "Kauf die Replicanti-Freischaltung, sobald der Knopf bezahlbar ist.",
        "Steck die nächsten Infinity Points zuerst in Replikationsgeschwindigkeit und danach in Galaxien.",
        "Lass Replicanti während längerer IP-Pushes mitlaufen.",
      ],
      fertigWenn: "Der Replicanti-Tab ist offen und erzeugt Replicanti.",
    },

    ersteEternityErreichen: {
      phase: "infinity",
      kurz: "Push mit den abgeschlossenen ICs und Replicanti bis zur ersten Eternity.",
      warum: "Nach Break Infinity sind lange Läufe sinnvoll, weil dein IP-Höchststand weitere "
        + "Upgrades und Dimensionen öffnet. Sobald der Eternity-Knopf erscheint, ist diese "
        + "Infinity-Phase abgeschlossen; weiteres IP-Farmen vor dem ersten Reset lohnt kaum.",
      soGehts: [
        "Kauf alle verfügbaren Infinity Dimensions, Break-Upgrades und Replicanti-Upgrades.",
        "Stell den Crunch-Autobuyer für den Push aus oder weit genug nach hinten.",
        "Lass den Lauf bis zum Eternity-Knopf wachsen und löse die erste Eternity aus.",
      ],
      fertigWenn: "Du hast eternitiert und siehst Time Dimensions sowie Time Studies.",
    },

    /* ---------------- Frühe Eternity ---------------- */

    ersteTimeTheorems: {
      phase: "earlyEternity",
      kurz: "Steck deinen ersten Eternity Point in die erste Time Dimension.",
      warum: "Time Dimensions erzeugen Time Shards, und Time Shards verbessern deine "
        + "Tickspeed dauerhaft. Das ist der Motor der gesamten Eternity-Phase. Time "
        + "Theorems kaufst du danach aus Antimatter, Infinity Points und Eternity Points "
        + "getrennt, deshalb lohnt es sich, bei jedem Reset alle drei Knöpfe zu drücken.",
      soGehts: [
        "Kauf mit dem ersten Eternity Point die erste Time Dimension.",
        "Kauf danach jedes Time Theorem, das du dir aus Antimatter, IP und EP leisten kannst.",
        "Nimm günstige Eternity Upgrades und weitere Time Dimensions mit.",
        "Aktivier vor jedem Baumwechsel die Option, die Time Studies bei der nächsten "
          + "Eternity zurückzusetzen.",
      ],
      fertigWenn: "Du hast die erste Time Dimension gekauft und dein Time-Study-Baum wächst.",
      siehe: ["timeStudiesLesen"],
    },

    eternityMilestonesErreichen: {
      phase: "earlyEternity",
      kurz: "Sammel Eternities, bis die Automation von allein läuft.",
      warum: "Eternity Milestones sind Schwellen, die dir Dinge dauerhaft abnehmen. Ab "
        + "fünfundzwanzig Eternities kaufen sich Infinity Dimensions und Replicanti von "
        + "selbst, ab hundert bekommst du den Eternity-Autobuyer. Bis dahin ist jede "
        + "Eternity Handarbeit, danach läuft der Großteil im Hintergrund.",
      soGehts: [
        "Eternitiere zügig hintereinander, statt jeden Lauf auszureizen.",
        "Prüf in jeder Eternity kurz die Eternity Upgrades und Infinity Dimensions.",
        "Spar auf das Upgrade, das deine Eternity Points verfünffacht.",
        "Ab hundert Eternities stellst du den Eternity-Autobuyer ein und lässt ihn laufen.",
      ],
      fertigWenn: "Du hast mindestens hundert Eternities und der Eternity-Autobuyer steht bereit.",
      siehe: ["aktivVsIdle"],
    },

    aufEcVorbereiten: {
      phase: "earlyEternity",
      kurz: "Farm auf 130 Time Theorems und mindestens 20.000 Eternities.",
      warum: "Die erste Eternity Challenge verlangt einen bestimmten Time-Study-Baum, und der "
        + "kostet 130 Time Theorems. Die Eternities sind genauso wichtig, weil eines der "
        + "Eternity Upgrades mit ihrer Anzahl skaliert. Mit deutlich weniger als 20.000 "
        + "fängst du dir unnötig lange Läufe ein.",
      soGehts: [
        "Stell den Eternity-Autobuyer auf null Eternity Points, damit er sofort auslöst.",
        "Schalt den Dimension-Boost-Autobuyer ab, er kostet dich hier nur Zeit.",
        "Setz den Crunch-Autobuyer für den Farmbetrieb ungefähr auf ×1e112.",
        "Lass das laufen, bis du 130 Time Theorems und mindestens 20.000 Eternities hast.",
      ],
      fertigWenn: "Du hast 130 Time Theorems verdient und mindestens 20.000 Eternities.",
      falle: "20.000 Eternities sind das Minimum. Rund 110.000 machen die ersten EC-Läufe "
        + "spürbar angenehmer; du musst sie aber nicht erzwingen, wenn 130 TT schon zügig gehen.",
      siehe: ["epPushen"],
    },

    eternityNaechstenCheckpointFarmen: {
      phase: "earlyEternity",
      kurz: "Farme {fehlendeTT} TT: von {standTT} auf {zielTT} TT.",
      warum: "Dein Save liegt zwischen zwei geprüften Time-Theorem-Checkpoints. Der angezeigte "
        + "Baum ist der nächste vollständige, bezahlbare Aufbau — nicht das Ende der Eternity-Phase.",
      soGehts: [
        "Lade den Checkpoint-Baum unten; die letzte Zahl hinter | ist der EC-Knoten.",
        "Kauf danach alle verfügbaren TT aus Antimatter, Infinity Points und Eternity Points.",
        "Push nur bis {zielTT} TT und lade dann den Save neu ein; der nächste Checkpoint wird neu berechnet.",
      ],
      fertigWenn: "Oben im Time-Study-Tab mindestens {zielTT} insgesamt verdiente TT stehen.",
      siehe: ["timeStudiesLesen", "epPushen"],
    },

    eternityAnzahlFarmen: {
      phase: "earlyEternity",
      kurz: "Farme Eternities: von {standEternities} auf 20.000, es fehlen {fehlendeEternities}.",
      warum: "Das ist eine harte Freischaltbedingung von EC1, nicht bloß eine Empfehlung: der "
        + "EC1-Knoten verlangt neben den 30 Time Theorems ausdrücklich 20.000 Eternities. Jede "
        + "weitere Stufe von EC1 verlangt 20.000 mehr.",
      soGehts: [
        "Stell den Eternity-Autobuyer auf 0 EP, damit er sofort eternitiert.",
        "Schalte den Dimension-Boost-Autobuyer während des Farms aus.",
        "Lass den Lauf bis 20.000 Gesamt-Eternities laufen und importiere dann den Save neu.",
      ],
      fertigWenn: "Der Save mindestens 20.000 Eternities enthält.",
      siehe: ["aktivVsIdle"],
    },

    /* ---------------- Eternity Challenges ---------------- */

    naechstenEcLaufMachen: {
      phase: "eternityChallenges",
      kurz: "Arbeite den nächsten Lauf aus der EC-Route ab.",
      warum: "Die sechzig Läufe haben eine feste, erprobte Reihenfolge. Jeder Lauf besteht "
        + "aus drei getrennten Dingen, die man leicht verwechselt: dem Farm-Tree, mit dem "
        + "du die Freischaltbedingung erfüllst, dem Kauf des Challenge-Knotens, und dem "
        + "Run-Tree, mit dem du die Challenge dann tatsächlich spielst. Bei einigen "
        + "Challenges unterscheiden sich Farm-Tree und Run-Tree absichtlich.",
      soGehts: [
        "Lade den Farm-Tree und erfülle damit die angezeigte Freischaltbedingung.",
        "Kauf erst danach den Challenge-Knoten im Time-Study-Baum.",
        "Setz die Studies zurück und lade den Run-Tree, dessen Import auf die Challenge-Nummer endet.",
        "Spiel die Challenge bis zum angegebenen Ziel.",
        "Trag den Clear ein und lade deinen Save neu hoch.",
      ],
      fertigWenn: "Die Challenge zeigt eine Completion mehr als vorher.",
      falle: "Erst den Knoten kaufen, dann zurücksetzen. In der anderen Reihenfolge ist die "
        + "erfüllte Bedingung weg und du farmst sie noch einmal.",
      siehe: ["ecMechanik"],
    },

    ecTtFarmen: {
      phase: "eternityChallenges",
      kurz: "Farme zuerst {fehlendeTT} TT für {run}: {standTT} → {readyTT} TT.",
      warum: "Der nächste Routenlauf kostet mehr TT als dein Save insgesamt verdient hat. "
        + "Darum ist jetzt nicht die Challenge selbst, sondern genau diese Kaufschwelle dein Ziel.",
      soGehts: [
        "Lade den Farm-Tree unten ohne den Challenge-Knoten zu kaufen.",
        "Farme EP und kauf TT, bis dein Gesamtwert {readyTT} erreicht.",
        "Bleib bei {readyTT} TT stehen und arbeite anschließend die Freischaltbedingung ab.",
      ],
      fertigWenn: "Mindestens {readyTT} insgesamt verdiente TT im Save stehen.",
      siehe: ["epPushen", "ecMechanik"],
    },

    ecAnforderungErfuellen: {
      phase: "eternityChallenges",
      kurz: "Schalte {run} frei: {unlock}.",
      warum: "Der Farm-Tree erfüllt die Eintrittsbedingung; der Run-Tree ist erst für den "
        + "eigentlichen Challenge-Lauf. Diese beiden Aufgaben werden bewusst getrennt angezeigt.",
      soGehts: [
        "Nach dem EP-/TT-Farmen: Respec aktivieren, außerhalb der Challenge eternitieren und den Freischalt-Baum unten laden. Die beim Baum genannten TT für den EC-Knoten frei lassen.",
        "Erreiche {unlock}. Kauf dann den Knoten für EC{ec} von Hand oder ersetze im Freischalt-Import |0 durch |{ec}.",
        "{buyStep}",
      ],
      fertigWenn: "Der Knoten für {run} gekauft ist und du die Challenge starten kannst.",
      falle: "Nicht vor dem Knotenkauf respecen — sonst verlierst du die gerade erfüllte Bedingung.",
      siehe: ["ecMechanik"],
    },

    ecLaufSpielen: {
      phase: "eternityChallenges",
      kurz: "Spiel {run} mit dem Run-Tree bis {goal}.",
      warum: "Dieser Baum ist für die Einschränkung der Challenge berechnet. Das Ziel ist der "
        + "konkrete Infinity-Point-Wert, bei dem die nächste Completion ausgelöst wird.",
      soGehts: [
        "Eternity → Time Studies → Import: Lade den Run-Tree unten; der String endet auf |{ec}.",
        "Challenges → Eternity Challenges: Starte EC{ec} und erreiche {goal}.",
        "{tip}",
      ],
      fertigWenn: "EC{ec} im Challenge-Tab {tier}/5 Completions zeigt.",
      siehe: ["ecMechanik"],
    },

    ecSaveNeuEinlesen: {
      phase: "preInfinity",
      kurz: "Exportiere den Save und lad ihn hier neu hoch.",
      warum: "Die nächsten Schritte hängen von deinem neuen Spielstand ab. Ein frischer Export enthält die gerade erledigten Käufe und Freischaltungen und aktualisiert deinen Plan.",
      soGehts: [
        "Options → Saving: Drück Export save und kopiere den vollständigen Text.",
        "Hier: Klick Save neu laden, füge den Export ein und drück Save auswerten."
      ],
      fertigWenn: "Hier ein Plan für deinen neuen Spielstand steht.",
      siehe: [],
    },

    dilationJetztFreischalten: {
      phase: "eternityChallenges",
      kurz: "Kauf jetzt die Dilation-Study für 5.000 TT.",
      warum: "Alle 60 EC-Completions sind erledigt. Entscheidend sind jetzt nicht weitere "
        + "Challenge-Läufe, sondern 12.900 insgesamt verdiente TT und die Dilation-Study.",
      soGehts: [
        "Time Studies respecen, außerhalb der Challenge eternitieren und den EP-Farm-Tree unten laden. Mindestens 5.000 TT für die Dilation-Study frei lassen.",
        "Kauf die Dilation-Study unterhalb von TS231–234 für 5.000 TT.",
        "Lad jetzt den Save neu ein, um den passenden Dilation-Baum für deine verbleibenden TT zu erhalten. Erst mit diesem Baum den ersten dilatierten Lauf starten.",
      ],
      fertigWenn: "Der Time-Dilation-Tab freigeschaltet und der erste Lauf startbar ist.",
      siehe: [],
    },

    dilationTtVorbereiten: {
      phase: "eternityChallenges",
      kurz: "Farme noch {fehlendeTT} TT bis zur Dilation-Schwelle 12.900.",
      warum: "Deine ECs sind abgeschlossen, aber die Dilation-Study prüft zusätzlich die "
        + "insgesamt verdienten Time Theorems.",
      soGehts: [
        "Lade den Dilation-Farm-Tree unten.",
        "Farme EP und kauf TT, bis insgesamt 12.900 erreicht sind.",
        "Kauf dann die Dilation-Study für 5.000 TT.",
      ],
      fertigWenn: "Im Save mindestens 12.900 insgesamt verdiente TT stehen.",
      siehe: ["epPushen"],
    },

    /* ---------------- Time Dilation ---------------- */

    dilationZyklusFahren: {
      phase: "dilation",
      kurz: "Starte Time Dilation und sammle Tachyon Particles.",
      warum: "Während Time Dilation wächst Dilated Time für die Dilation-Upgrades. Eine normale Eternity beendet den dilatierten Lauf und schreibt dir die angezeigten Tachyon Particles gut.",
      soGehts: [
        "Eternity → Time Studies: Setz Respec time studies, drück Eternity und lade den Dilation-Baum unten über Import.",
        "Eternity → Time Dilation: Drück Dilate time.",
        "Eternity: Drück im ersten dilatierten Lauf Eternity, sobald der Knopf verfügbar ist. In späteren Läufen kaufst du unter Time Dilation zuerst das nächste ×3-TP-Upgrade.",
        "{tdHandgriff}",
        "Für EP außerhalb von Dilation: Respec time studies aktivieren und den dilatierten Lauf mit Eternity beenden. Erst danach den EP-Push-Baum importieren; ein Import allein entfernt keine alten Studies.",
        "Vor dem nächsten dilatierten Lauf erneut Respec aktivieren, außerhalb von Dilation eternitieren und den Dilation-Baum laden. Erst dann Dilate time drücken. Nach r137 fast immer in Dilation bleiben und nur für einen EP-/TD-Push wechseln."
      ],
      fertigWenn: "Die Eternity beendet ist und dein Bestand an Tachyon Particles gestiegen ist.",
      siehe: ["dilationVerstehen"],
    },

    dilationTimeDimensionOeffnen: {
      phase: "dilation",
      kurz: "Schalte Time Dimension {tdNummer} frei: {tdKosten} Time Theorems.",
      warum: "Die Reality-Study verlangt, dass die achte Time Dimension freigeschaltet ist. Der "
        + "Weg dorthin führt über vier Dilation-Studies, die je zehnmal so viele Time Theorems "
        + "kosten wie die vorige. Die TT-Erzeugung aus Dilation liefert dafür den Bestand.",
      soGehts: [
        "Öffne im Time-Study-Baum den unteren Dilation-Bereich.",
        "Kauf die Study für Time Dimension {tdNummer} für {tdKosten} TT; du hast {standTT} freie TT.",
        "Noch offen bis zur Reality-Study: {tdOffen}.",
        "Zwischen den Käufen läufst du weiter den Dilation-Zyklus.",
      ],
      fertigWenn: "Time Dimension {tdNummer} im Time-Dimensions-Tab sichtbar ist.",
      siehe: ["dilationVerstehen"],
    },

    dilationAufViertausendEp: {
      phase: "dilation",
      kurz: "Push den EP-Rekord dieser Reality von e{standEP} auf e4000.",
      warum: "e4000 Eternity Points ist die harte Freischaltbedingung der Reality-Study — "
        + "gemessen am Rekord dieser Reality, nicht an deinem Bestand. Unterhalb davon wirft "
        + "der Reality-Knopf auch keine Reality Machines ab.",
      soGehts: [
        "Respec time studies aktivieren, mit Eternity aus Dilation gehen und erst dann den EP-Push-Baum unten laden. Ein Import ersetzt keine bereits gekauften Studies.",
        "Push bis der Rekord dieser Reality e4000 EP erreicht; dir fehlen e{fehlendeEP}.",
        "Wechsel zwischendurch zurück in den Dilation-Zyklus, wenn der Push stockt.",
      ],
      fertigWenn: "Der EP-Rekord dieser Reality mindestens e4000 zeigt.",
      siehe: ["epPushen"],
    },

    dilationRealityStudyKaufen: {
      phase: "dilation",
      kurz: "Kauf jetzt die Reality-Study; e4000 EP sind erreicht.",
      warum: "Alle drei Bedingungen stehen: die achte Time Dimension ist offen, dein Rekord "
        + "liegt bei e{standEP} EP, und die Study selbst kostet fast nichts. Sie ist der letzte "
        + "Knoten vor dem Reality-Knopf.",
      soGehts: [
        "Öffne den Time-Study-Baum ganz unten und kauf die Reality-Study.",
        "Prüf vor dem Reset den RM-Ertrag im Reality-Knopf; die erste Reality lohnt sich ab 2–3 RM.",
      ],
      fertigWenn: "Die Reality-Study gekauft ist und der Reality-Knopf erscheint.",
      siehe: ["dilationVerstehen"],
    },

    /* ---------------- Reality ---------------- */

    ersteRealityUpgradeReihe: {
      phase: "reality",
      kurz: "Kauf zuerst die komplette erste Reihe der Reality Upgrades.",
      warum: "Die erste Upgrade-Reihe verstärkt jeden folgenden Reality-Lauf und hat keine "
        + "besonderen Freischaltbedingungen. Bevor du RM in teurere Reihen oder Komfortsysteme "
        + "steckst, liefert diese Basis den zuverlässigsten Fortschritt pro Reality Machine.",
      soGehts: [
        "Öffne den Reality-Upgrades-Tab nach jedem Reality-Reset.",
        "Kauf die noch fehlenden Upgrades der ersten Reihe, sobald genügend RM da ist.",
        "Mach kurze weitere Realities, statt lange auf ein Upgrade der nächsten Reihe zu sparen.",
      ],
      fertigWenn: "Alle fünf Upgrades der ersten Reihe sind gekauft.",
      siehe: ["rmSkalierung"],
    },

    realityRmAuf15Pushen: {
      phase: "reality",
      kurz: "Push den Reality-Knopf von {standRM} auf {zielRM} RM — bis mindestens e{zielEP} EP.",
      warum: "Das RM-Ziel finanziert {zielKauf}; du hast bereits {bankRM} RM im Vorrat. "
        + "Dafür brauchst du {zielRM} weitere RM. Der EP-Richtwert berücksichtigt die Grundformel; die Anzeige im Spiel entscheidet über den Reset.",
      soGehts: [
        "Time Studies respecen und den laufenden Dilation-/Eternity-Lauf mit Eternity beenden. Dann den EP-Push-Baum unten laden und außerhalb von Dilation bleiben.",
        "Push den Rekord dieser Reality bis mindestens e{zielEP} EP.",
        "Empfehlung: Warte, bis der Reality-Knopf mindestens {zielRM} RM anzeigt. Dann ist zusammen mit deinen {bankRM} RM genug für {zielKauf} da. Ein früherer Reset ist möglich, sobald die Reality-Study gekauft ist, finanziert aber noch nicht die ganze Liste.",
        "Nach weiterem Push den Save neu einlesen: Der Guide zeigt dann die Käufe mit dem neuen Gesamtbestand und die aktuelle Glyph-Auswahl.",
      ],
      fertigWenn: "Auf dem Reality-Knopf mindestens {zielRM} RM stehen.",
      siehe: ["rmSkalierung", "epPushen"],
    },

    realityResetVorbereiten: {
      phase: "reality",
      kurz: "Löse die nächste Reality für {gewinnRM} RM aus.",
      warum: "Respec legt beim Reset deine aktiven Glyphs ins Inventar. So kannst du das neue Set ausrüsten. Der Achievement-Schalter erhält die Freischaltbedingung von Paradoxically Attain für den nächsten Lauf.",
      soGehts: [
        "Reality → Glyphs: Aktiviere Unequip Glyphs on Reality (Glyph-Respec).",
        "{achievementSchalter}",
        "Reality: Drück den Reality-Knopf, der {gewinnRM} RM zeigt. Nimm im Auswahlfenster {glyphEmpfehlung}.",
        "{rmHinweis}"
      ],
      fertigWenn: "Reality {naechsteReality} begonnen hat und der neue Glyph im Inventar liegt.",
      siehe: ["glyphsGrundlagen"],
    },

    realityUpgradesJetztKaufen: {
      phase: "reality",
      kurz: "Kauf die bezahlbaren Reality Upgrades für {ruKosten} RM.",
      warum: "Diese Upgrades sind freigeschaltet und mit deinen {standRM} RM bezahlbar. {ruTop} bringt dir {ruTopNutzen}. Ein freigeschaltetes Upgrade wirkt erst, wenn du es gekauft hast.",
      soGehts: [
        "Reality → Upgrades: Kauf in dieser Reihenfolge {ruListe}.",
        "Reality → Upgrades: Übrig bleiben {restRM} RM. Lass diesen Rest liegen."
      ],
      fertigWenn: "Reality → Upgrades alle genannten Käufe anzeigt.",
      siehe: ["rmSkalierung"],
    },

    realityUpgradeSparziel: {
      phase: "reality",
      kurz: "Nächstes RM-Ziel: {ruTop} für {ruKosten} RM. Dir fehlen {fehlendRM} RM.",
      warum: "Freigeschaltet heißt nicht gekauft. {ruTop} bringt dir {ruTopNutzen} — und zwar "
        + "in jedem weiteren Lauf. Solange es ungekauft liegt, verschenkst du den Effekt in "
        + "jeder Reality erneut. Du hast {standRM} RM.",
      soGehts: [
        "Gib keine RM für etwas anderes aus, bis {ruTop} gekauft ist.",
        "Noch offen und freigeschaltet: {ruOffen}.",
        "Reality Machines kommen aus dem EP-Rekord dieser Reality; ab e4000 EP wirft der Knopf welche ab.",
      ],
      fertigWenn: "{ruTop} im Reality-Tab als gekauft markiert ist.",
      siehe: ["rmSkalierung"],
    },

    realityPerkPfadKaufen: {
      phase: "reality",
      kurz: "Kauf {perkJetzt} mit deinen Perk-Punkten.",
      warum: "Perks bleiben dauerhaft gekauft; du kannst sie nicht zurücknehmen. Die angezeigten Käufe sind von deinem Bestand aus erreichbar und mit deinen {perkPunkte} Perk-Punkten bezahlbar. {perkWarum}.",
      soGehts: [
        "Reality → Perks: Kauf in dieser Reihenfolge {perkJetzt}.",
        "Reality → Perks: Prüfe, dass {perkJetzt} als gekauft markiert ist. Die Farbe hängt von Perk-Familie und Darstellung ab."
      ],
      fertigWenn: "{perkJetzt} im Perk-Baum gekauft ist.",
      siehe: ["perksWaehlen"],
    },

    realityGlyphSetBauen: {
      phase: "reality",
      kurz: "Rüste die Glyphs für den neuen Lauf aus.",
      warum: "Das Set nutzt deine vorhandenen Glyphs und den gerade gewählten Glyph. Power mit AD-Potenz und Time mit EP-Multiplikator beschleunigen den Lauf. Der Companion braucht keinen Platz im aktiven Set.",
      soGehts: [
        "Reality → Glyphs: Zieh {glyphSet} in die aktiven Slots.",
        "Reality → Glyphs: Lass den Companion im Inventar.",
        "{rmHinweis}"
      ],
      fertigWenn: "Die Slots mit {glyphSet} belegt sind und der Companion im Inventar liegt.",
      siehe: ["glyphsGrundlagen", "adPower"],
    },

    realityAutoAchievementsAusschalten: {
      phase: "reality",
      kurz: "Schalte Auto Achievements vor dem nächsten automatischen Achievement aus.",
      warum: "Paradoxically Attain verlangt eine manuelle Eternity ohne automatisch erhaltenes Achievement. Der Timer hat noch keines vergeben; mit ausgeschaltetem Timer bleibt diese Bedingung erreichbar.",
      soGehts: [
        "Achievements → Achievements: Schalte Auto Achievements aus.",
        "Achievements → Achievements: Lass den Schalter bis zur Freischaltung von Paradoxically Attain ausgeschaltet."
      ],
      fertigWenn: "Auto Achievements ausgeschaltet ist und noch keines automatisch vergeben wurde.",
      siehe: [],
    },

    realityLaufendeChallengeBeenden: {
      phase: "reality",
      kurz: "Schließ zuerst deine laufende {challengeName} ab.",
      warum: "Dein Save steckt noch in einer Challenge. Eine neue Challenge für ein Achievement würde diesen Lauf abbrechen. Beende ihn zuerst und nutze die Belohnung für den weiteren IP-Push. Auto Achievements und Replicanti Auto Galaxy bleiben dabei ausgeschaltet.",
      soGehts: [
        "Beende {challengeName} mit Big Crunch bei {challengeZiel}. Starte vorher keine andere Challenge für ein Achievement.",
        "Danach: Stell die für diesen Lauf geänderten Autobuyer zurück. Lass Auto Achievements, den Eternity-Autobuyer und Replicanti Auto Galaxy ausgeschaltet."
      ],
      fertigWenn: "{challengeName} beendet ist und du wieder außerhalb einer Challenge spielst.",
      zielHandgriffe: {
        ic4: [
          "Automation → Autobuyers: Schalte Sacrifice und AD1–7 aus. AD8, Tickspeed, Dimboost und Galaxien bleiben an. Setz die Kaufintervalle von Dimboost und Galaxien auf 0 Sekunden und entferne die Galaxien-Grenze.",
          "Dimensions → Antimatter Dimensions: Halte M, bis der Fortschritt stockt. Klick den Reset-Knopf mit dem Text lose a Dimension Boost, drück M zwei- bis dreimal kurz und kauf dann wiederholt AD7 → AD6 → … → AD1 bis zur nächsten Galaxie. Wiederhole das bis e13000 Antimatter."
        ],
      },
      siehe: [],
    },

    realityRuBundleFreischalten: {
      phase: "reality",
      kurz: "Bereite die erste manuelle Eternity vor.",
      warum: "Diese Freischaltungen passen in dieselbe erste Eternity. Paradoxically Attain verlangt keine bestimmten Achievements, sondern eine manuelle Eternity ohne Vergabe durch den Achievement-Timer. Selbst erfüllte Achievements sind erlaubt. Die Freischaltungen bleiben dauerhaft erhalten; die Käufe folgen erst nach dieser Eternity.",
      soGehts: [
        "Achievements → Achievements: Lass Auto Achievements ausgeschaltet. Selbst erfüllte Achievements sind erlaubt – auch wenn sie beim Spielen von selbst aufleuchten.",
        "Automation → Autobuyers: Schalte den Eternity-Autobuyer aus. Infinity → Replicanti: Schalte Auto Galaxy aus und kauf keine Replicanti-Galaxie.",
        "Dimensions → Antimatter Dimensions: Kauf Dimensionen, Tickspeed und Galaxien; nutze Big Crunch, bis du mindestens e400 IP hast.",
        "Eternity: Drück den Eternity-Knopf genau einmal von Hand."
      ],
      fertigWenn: "Unter Reality → Upgrades bei {ruZiele} die Kostenzeile Cost: statt der Freischaltbedingung steht. Lass beim Prüfen die Umschalttaste los.",
      siehe: ["rmSkalierung"],
    },

    realityRequirementsSammeln: {
      phase: "reality",
      kurz: "Erfülle die offenen Upgrade-Bedingungen in dieser Reality.",
      warum: "Die noch offenen Bedingungen bleiben nach ihrer Erfüllung dauerhaft freigeschaltet. Innumerably Construct (Reihe 2, Spalte 2) wird beim ersten Big Crunch geprüft; die anderen beim manuellen Eternity-Klick. Du kannst sie später bezahlen.",
      soGehts: [
        "Eternity: Drück den Eternity-Knopf von Hand, wenn die genannten Bedingungen erfüllt sind.",
        "Reality → Upgrades: Prüfe bei {ziele}, ob die Kostenzeile Cost: statt der Freischaltbedingung steht. Lass dabei die Umschalttaste los."
      ],
      fertigWenn: "Unter Reality → Upgrades bei {ziele} die Kostenzeile Cost: statt der Freischaltbedingung steht.",
      falle: "Reality → Upgrades: Halte die Umschalttaste gedrückt und klick auf die genannten Upgrade-Felder mit offenem Schloss, um ihre Bedingungen zu schützen.",
      siehe: ["glyphsGrundlagen"],
      zielHandgriffe: {
        "ru6": [
          "Infinity → Replicanti: Schalte Auto Galaxy aus. Kauf vor der ersten manuellen Eternity keine Replicanti-Galaxie."
        ],
        "ru7": [
          "Dimensions → Antimatter Dimensions: Kauf vor dem ersten Big Crunch höchstens eine Antimatter-Galaxie. Drück dann Big Crunch für Innumerably Construct (Reihe 2, Spalte 2)."
        ],
        "ru8": [
          "Achievements → Achievements: Schalte Auto Achievements aus, damit Paradoxically Attain freischaltbar bleibt. Selbst erfüllte Achievements sind erlaubt; nur die Vergabe durch den Timer verhindert diese Freischaltung."
        ],
        "ru10": [
          "Automation → Autobuyers: Schalte den Eternity-Autobuyer aus. Dimensions → Antimatter Dimensions: Nutze Big Crunch, bis mindestens e400 IP auf Lager sind."
        ]
      },
    },

    realityEpSchwellen: {
      phase: "reality",
      kurz: "Schütze die offenen Upgrade-Bedingungen während des EP-Aufbaus.",
      warum: "Jede noch offene Bedingung verlangt einen EP-Bestand unter einer Einschränkung. Nach der Freischaltung zeigt das Upgrade ohne gedrückte Umschalttaste die Kosten statt der Bedingung. Es bleibt auch nach einem Reality-Reset freigeschaltet.",
      soGehts: [
        "Reality → Upgrades: Mit Shift-Klick nur die offenen Schlösser bei {ziele} schließen. Bereits geschlossene Schlösser nicht erneut anklicken. Die folgenden Einschränkungen beim weiteren EP-Aufbau einhalten.",
        "Reality → Upgrades: Prüfe nach der Eternity ihre Freischaltung."
      ],
      fertigWenn: "Die Requirement Locks sind aktiv und die genannten Käufe beziehungsweise Challenges bleiben gesperrt.",
      falle: "",
      zielHandgriffe: {
        "ru15": [
          "Eternity → Upgrades: Kauf keine Stufe von Multiply Eternity Points by 5.",
          "Späteres Ziel während der folgenden Farm-Schritte: mindestens e10 EP besitzen und eternitieren. Bei The Paradoxical Forever (Reihe 3, Spalte 5) danach ohne Shift auf Cost: prüfen; erst dann sind ×5-EP-Käufe erlaubt."
        ],
        "ru12": [
          "Challenges → Eternity Challenges: Schließ EC1 noch nicht ab.",
          "Späteres Ziel während der folgenden Farm-/EC-Schritte: mindestens e70 EP besitzen und eternitieren. Andere ECs sind erlaubt; die folgende Route lässt EC1 aus. Bei The Knowing Existence (Reihe 3, Spalte 2) danach ohne Shift auf Cost: prüfen. Anschließend darfst du EC1 abschließen."
        ]
      },
    },

    realityGlyphSchwelle: {
      phase: "reality",
      kurz: "Halte Glyph-Slots und Time Dimensions für die offenen Upgrades frei.",
      warum: "Die noch offenen Upgrades verlangen e4000 EP mit einer Einschränkung für Glyphs oder Time Dimensions. Die Anleitung enthält nur die Bedingungen, die dein aktueller Lauf noch erfüllen kann.",
      soGehts: [
        "Reality → Upgrades: Halte Shift und aktiviere die Requirement Locks für {ziele}. Mit den folgenden Schritten bis e4000 EP spielen und dann Eternity drücken.",
        "Reality → Upgrades: Sobald bei {ziele} ohne gedrückte Umschalttaste Cost: statt der Bedingung steht, ist die Anforderung dauerhaft gespeichert. Die dafür gesperrten Käufe sind dann wieder erlaubt; bezahlen kannst du das Upgrade in einer späteren Reality."
      ],
      fertigWenn: "Die Requirement Locks und genannten Autobuyer-Einstellungen schützen den weiteren Lauf.",
      siehe: ["adPower", "glyphEffekteLesen"],
      zielHandgriffe: {
        "ru9": [
          "Reality → Glyphs: Rüste genau einen Glyph ab Level 3 aus. Lass alle weiteren Slots leer."
        ],
        "ru13": [
          "Für The Telemechanical Process später für e4000 EP eternitieren, ohne TD5–8 zu besitzen. Das Lock schützt vor deren Kauf, sobald sie nach Dilation verfügbar werden. Der eigentliche Upgrade-Kauf kostet 50 RM."
        ]
      },
    },




    spaeteRealityUpgrades: {
      phase: "reality",
      kurz: "Kauf die noch fehlenden Upgrades der vierten und fünften Reality-Reihe.",
      warum: "Nach den ersten drei Reihen wechseln die Anforderungen zwischen langen Farmen, "
        + "bestimmten Builds und Komfortzielen. Nimm immer nur die nächste erfüllbare Bedingung "
        + "mit, statt einen laufenden Reality-Reset für mehrere widersprüchliche Ziele zu verbiegen.",
      soGehts: [
        "Öffne die Schlösser der noch fehlenden Upgrades und lies ihre Bedingungen vor dem Reset.",
        "Wähl für die nächste Reality genau eine Bedingung, die zu deinen Glyphs passt.",
        "Kauf freigeschaltete Upgrades nach jedem Reset, bevor du RM in Nebensysteme steckst.",
      ],
      fertigWenn: "Die vierte und fünfte Reihe sind vollständig gekauft.",
    },

    schwarzesLochFreischalten: {
      phase: "reality",
      kurz: "Schalte das erste Schwarze Loch frei und kauf zuerst sein Intervall herunter.",
      warum: "Das Schwarze Loch verdichtet Fortschritt in kurze aktive Fenster. Ein kürzeres "
        + "Intervall lässt diese Fenster häufiger auftreten und ist anfangs berechenbarer als "
        + "noch mehr Leistung in ein seltenes Fenster zu stecken.",
      soGehts: [
        "Kauf das erste Black Hole für 100 RM, ungefähr während oder nach der dritten Upgrade-Reihe. Bezahlbare einmalige Upgrades gehen vor.",
        "Kauf nach der Freischaltung zuerst Intervallstufen und danach Dauer beziehungsweise Leistung.",
        "Leg lange Pushes so, dass ihr entscheidender Teil in ein aktives Fenster fällt.",
      ],
      fertigWenn: "Das erste Schwarze Loch ist freigeschaltet und im Reality-Tab sichtbar.",
    },

    automatorFreischalten: {
      phase: "reality",
      kurz: "Sammel Automator-Punkte und ersetz wiederholte Klickfolgen durch ein kleines Skript.",
      warum: "Der Automator soll den bereits verstandenen Reality-Ablauf wiederholen, nicht neue "
        + "Strategie erraten. Ein kurzes, robustes Skript für Studies und Resets ist deshalb "
        + "wertvoller als ein großer Ablauf mit vielen empfindlichen Schwellen.",
      soGehts: [
        "Kauf Reality Upgrades und Perks mit Automator-Punkten, bis die Freischaltung erreicht ist.",
        "Beginne mit einem Skript für Time-Study-Import, Eternity und Reality.",
        "Teste es einmal sichtbar und ergänz erst danach optionale Wartebedingungen.",
      ],
      fertigWenn: "Der Automator ist freigeschaltet und ein getestetes Basisskript ist gespeichert.",
    },

    /* ---------------- Celestials ---------------- */

    teresaRealityFreischalten: {
      phase: "teresa",
      kurz: "Gieß Reality Machines in Teresas Behälter, bis ihre Reality aufgeht.",
      warum: "Teresa nimmt nur RM an, das du gerade nicht ausgegeben hast, und der Behälter "
        + "gibt dir dafür einen dauerhaften Bonus. Die Freischaltungen liegen auf festen "
        + "Schwellen. Kauf die kleinen Komfortschritte unterwegs, aber lass einen schlechten "
        + "RM-Lauf nicht nur für ein winziges Stück am Behälter endlos weiterlaufen.",
      soGehts: [
        "Öffne den Teresa-Tab und schau dir die nächste Schwelle an.",
        "Gieß ungenutzte RM hinein, bis 1e14 RM im Behälter sind.",
        "Nimm die Freischaltungen für Start-Upgrades und Glyph-Undo unterwegs mit.",
        "Farm weiter Glyph-Level und RM, bis Teresas Reality im Tab kaufbar ist.",
      ],
      fertigWenn: "Teresas Reality ist im Behälter freigeschaltet.",
    },

    teresaRealityAbschliessen: {
      phase: "teresa",
      kurz: "Spiel Teresas Reality erst mit wenigen Glyphs und ergänz nur, was wirklich hilft.",
      warum: "Der Lauf verändert die übliche Time-Study-Balance. Ein volles Standardset kann "
        + "dadurch schlechter sein als ein kleineres, gezielt getestetes Set. Mit Undo kannst "
        + "du jede Ergänzung einzeln prüfen, ohne die nächste Glyph-Auswahl zu verlieren.",
      soGehts: [
        "Speicher dein aktuelles Glyph-Set und starte mit den stärksten Replication- und Time-Effekten.",
        "Füg immer nur einen Glyph hinzu und nutz Undo, wenn der Fortschritt dadurch schlechter wird.",
        "Wechsel vor Dilation von Idle auf Active und prüf die dunklen Studies neu.",
        "Beende die Reality, sobald der Reality-Knopf erreichbar ist.",
      ],
      fertigWenn: "Im Teresa-Tab steht ein Bestwert für den abgeschlossenen Reality-Lauf.",
    },

    effarigFreischalten: {
      phase: "teresa",
      kurz: "Farm abwechselnd bessere Glyphs und RM und gieß bis zur Effarig-Schwelle weiter.",
      warum: "Glyph-Level beschleunigt die nächsten RM-Läufe, während RM den Behälter füllt. "
        + "Nur eine der beiden Seiten lange zu farmen wird schnell ineffizient. Die sichtbaren "
        + "Zwischenschwellen für passive EP und den Perk-Shop lohnen sich auf dem Weg.",
      soGehts: [
        "Mach mit deinem GL-Set kurze Läufe, bis kein besserer Glyph mehr auftaucht.",
        "Wechsel dann auf dein RM-Set und gieß bis 1e24 RM in Teresas Behälter.",
        "Kauf passive EP und den Perk-Shop, sobald ihre Behälterschwellen erreicht sind.",
        "Wiederhol den Wechsel, bis Effarig freigeschaltet ist.",
      ],
      fertigWenn: "Der Effarig-Tab ist geöffnet.",
    },

    effarigWerkzeugeKaufen: {
      phase: "effarig",
      kurz: "Farm Relic Shards und kauf Adjuster, Filter, Presets und Effarigs Reality.",
      warum: "Relic Shards wachsen mit vielen verschiedenen Glyph-Effekten und hohen EP. "
        + "Effarigs erste Käufe sind deshalb ein eigener Farmblock: Sie verbessern Glyph-Farming "
        + "und Automation, bevor der eigentliche dreiteilige Celestial-Lauf beginnt.",
      soGehts: [
        "Bau ein Relic-Shard-Set mit möglichst vielen unterschiedlichen Effekten.",
        "Kauf zuerst die verstellbaren Glyph-Faktoren, dann Filter und Presets.",
        "Richte den Filter sofort ein, damit schnelle Realities keine Zufallsglyphs auswählen.",
        "Farm weiter, bis Effarigs Reality im Shop gekauft ist.",
      ],
      fertigWenn: "Effarigs Reality ist gekauft und startbar.",
    },

    effarigInfinityBrechen: {
      phase: "effarig",
      communityZeit: "Pins: etwa 15–20 Sekunden mit fünf Power-Glyphs, jeweils AD-Multiplikator und ungefähr 70 % Seltenheit. Dauert dieses Set länger als eine Minute, zuerst Effekte und Seltenheit prüfen.",
      kurz: "Brich Effarigs Infinity-Abschnitt mit Seltenheit statt bloßem Glyph-Level.",
      warum: "Effarig deckelt hier das Glyph-Level, nicht aber die Seltenheit. Sofort wirksame "
        + "Dimensionsmultiplikatoren schlagen deshalb ein gewohntes Farmset. Wenn der Lauf "
        + "lange feststeht, fehlt meist ein Effekt oder ausreichend Seltenheit.",
      soGehts: [
        "Speicher dein normales Set und rüste seltene Power-Glyphs mit AD-Multiplikator aus.",
        "Starte Effarigs Reality und push ohne unnötige lange Farmstopps bis Infinity.",
        "Wenn der Lauf hängt, verbesser zuerst Seltenheit beziehungsweise Effekte und starte neu.",
      ],
      fertigWenn: "Der Effarig-Tab markiert den Infinity-Abschnitt als abgeschlossen.",
    },

    effarigEternityBrechen: {
      phase: "effarig",
      communityZeit: "Pins: etwa 4 Minuten bei 70 % bis ungefähr 30 Sekunden bei 80 % Seltenheit mit Power, Infinity, zwei Replication und Dilation sowie ID+Idle. Alle genannten Effekte müssen vorhanden sein. Bei mehr als 10 Minuten zuerst Set und Studies prüfen.",
      kurz: "Brich Effarigs Eternity-Abschnitt mit einem gemischten, vollständigen Effektset.",
      warum: "Der zweite Abschnitt belohnt den höheren Replicanti-Spielraum und Infinity Power. "
        + "Ein fehlender Kerneffekt kostet hier mehr als ein niedrigeres Glyph-Level. Darum "
        + "brauchst du mehrere Typen statt fünf Varianten desselben Glyphs.",
      soGehts: [
        "Rüste Power, Infinity, zwei Replication- und einen Dilation-Glyph aus.",
        "Prüf AD-Power, IP- und Infinity-Power-Multiplikator, Replicanti-Multiplikator und TT-Erzeugung.",
        "Lade einen ID-und-Idle-Study-Baum und starte den Eternity-Abschnitt.",
        "Farm bessere Seltenheit, wenn einer der genannten Effekte fehlt oder der Lauf stehen bleibt.",
      ],
      fertigWenn: "Der Eternity-Abschnitt ist abgeschlossen und The Nameless Ones sind offen.",
    },

    namenloseZeitSammeln: {
      phase: "enslaved",
      kurz: "Speicher genug Spielzeit für die erste Nameless-Freischaltung.",
      warum: "Gespeicherte Zeit ist hier die eigentliche Währung. Sie hilft dir nur dann, "
        + "wenn du sie an einer Stelle freigibst, an der du tatsächlich feststeckst. Wer "
        + "sie sofort verbraucht, verschenkt ihren größten Hebel. Der erste Kauf erhöht "
        + "zunächst die Tickspeed-Softcap und macht den weiteren Aufbau leichter.",
      soGehts: [
        "Rüst Glyphs aus, die deine Spielgeschwindigkeit erhöhen.",
        "Lass die gespeicherte Zeit auf 1e35 Jahre auflaufen, statt sie sofort zu verbrauchen.",
        "Kauf die erste Freischaltung, sobald ihr Knopf aktiv wird.",
      ],
      fertigWenn: "Die erste Nameless-Freischaltung ist gekauft.",
    },

    effarigLayerDreiBrechen: {
      phase: "enslaved",
      kurz: "Kehr sofort zu Effarig zurück und nutz die neue Zeitmechanik im dritten Abschnitt.",
      warum: "Effarigs letzter Abschnitt ist erst sinnvoll, nachdem der Eternity-Abschnitt "
        + "The Nameless Ones und ihre Zeitmechanik geöffnet hat. Du musst die Nameless-Reality "
        + "dafür nicht zuerst lösen; genau dieses falsche Warten ließ den alten Plan hängen.",
      soGehts: [
        "Prüf die neu verfügbare Speicherung und Entladung von Spielzeit.",
        "Lade dein Preset für Effarigs dritten Abschnitt und starte die Reality erneut.",
        "Kombinier EC10 und gespeicherte Zeit und entlade erst am eigentlichen Fortschrittswall.",
      ],
      fertigWenn: "Der Effarig-Tab markiert den Reality-Abschnitt als abgeschlossen.",
    },

    namenloseRealityFreischalten: {
      phase: "enslaved",
      kurz: "Erfüll die Glyph-Rekorde und speicher genug Zeit für die Nameless-Reality.",
      warum: "Die zweite Zeit-Freischaltung verlangt nicht nur einen großen Zeitvorrat, sondern "
        + "auch dauerhafte Bestwerte für Glyph-Level und Seltenheit. Der Save kann den Kauf "
        + "sicher erkennen; die beiden Rekordhäkchen prüfst du direkt am Knopf im Spiel.",
      soGehts: [
        "Farm einen Glyph-Level-Rekord von 5.000 und einen Seltenheitsrekord von 100 %, bis beide Häkchen grün sind.",
        "Speicher 1e40 Jahre Spielzeit und gib sie nicht für kurze normale Pushes aus.",
        "Kauf die Reality-Freischaltung, sobald Zeit und beide Glyph-Häkchen reichen.",
      ],
      fertigWenn: "Die Nameless-Reality ist startbar.",
    },

    namenloseRealityLoesen: {
      phase: "enslaved",
      kurz: "Behandle die Nameless-Reality als Puzzle und öffne Hinweise nur bei Bedarf.",
      warum: "Der Lauf versteckt absichtlich mehrere Ausnahmen in bekannten Tabs. Eine sofortige "
        + "Komplettlösung würde den besten Teil dieser Celestial vorwegnehmen. Der Plan hält "
        + "deshalb nur den nächsten sicheren Suchschritt fest und lässt die Lösung eingeklappt.",
      soGehts: [
        "Prüf jeden Tab auf Regeln oder Knöpfe, die im normalen Spiel nicht dort sind.",
        "Teste Challenge-Kombinationen und Time Studies, die sonst unlogisch wirken.",
        "Speicher ausreichend Zeit und entlade sie erst, wenn der Puzzle-Aufbau vollständig steht.",
        "Öffne die Hinweise im Nameless-Tab einzeln, wenn du ohne neue Spur festhängst.",
      ],
      fertigWenn: "Die Nameless-Reality ist als abgeschlossen markiert.",
    },

    achievement151Holen: {
      phase: "enslaved",
      kurz: "Hol Achievement 151 mit 800 Galaxien ohne eine achte AD in der Infinity.",
      warum: "Der abgeschlossene Nameless-Lauf öffnet V noch nicht allein. Achievement 151 ist "
        + "die getrennte Brücke zur nächsten Celestial. Die Bedingung nutzt die inzwischen "
        + "verfügbaren Wege zu Galaxien, ohne in der aktuellen Infinity eine achte AD zu kaufen.",
      soGehts: [
        "Schalte den AD8-Autobuyer aus und starte eine frische Infinity.",
        "Nutze Challenge 10 und deine übrigen Wege zu Galaxien, ohne eine achte AD zu kaufen.",
        "Push bis 800 Antimatter-Galaxien und prüf danach den V-Tab.",
      ],
      fertigWenn: "Achievement 151 ist erreicht.",
    },

    vFreischalten: {
      phase: "v",
      kurz: "Erfüll die sechs sichtbaren V-Anzeigen gleichzeitig und kauf die Freischaltung.",
      warum: "V beginnt mit sechs globalen Bestandsanforderungen. Die Werte sind im V-Tab "
        + "bereits als Häkchen sichtbar und müssen gleichzeitig erfüllt sein. Der Save komprimiert "
        + "einige dieser riesigen Zahlen; deshalb bleibt der Spieltab hier die sichere Anzeige.",
      soGehts: [
        "Öffne V und prüf, welche der sechs Anzeigen noch kein Häkchen hat.",
        "Wechsel zwischen kurzen Realities und langen Ressourcen-Pushes, bis alle sechs gleichzeitig grün sind.",
        "Kauf V direkt im Tab, sobald der Freischaltknopf aktiv wird.",
      ],
      fertigWenn: "V ist freigeschaltet und ihre Anforderungen sind sichtbar.",
    },

    vAnforderungenSteigern: {
      phase: "v",
      kurz: "Erhöh immer die billigste noch offene V-Anforderung um genau eine Stufe.",
      warum: "V speichert für jede Anforderung deinen Bestwert. Du musst also nicht alles in "
        + "einem Lauf schaffen, sondern kannst dir jeweils die Anforderung vornehmen, deren "
        + "nächste Stufe gerade am billigsten ist. Jede Stufe gibt Space Theorems, und die "
        + "sind der eigentliche Fortschritt.",
      soGehts: [
        "Schau im V-Tab, welche nächste Stufe am wenigsten Aufwand kostet.",
        "Speicher dir für diese Anforderung ein eigenes Glyph-Set.",
        "Spiel den Lauf nur bis zu dieser einen Stufe.",
        "Wechsel danach auf die nächste billige Anforderung.",
      ],
      fertigWenn: "Du hast eine Stufe mehr und damit weitere Space Theorems.",
    },

    raPetRouteFahren: {
      phase: "ra",
      kurz: "Arbeite jetzt auf {ziele} hin.",
      warum: "Jedes Pet schaltet auf bestimmten Leveln eine andere Mechanik frei. Darum ist "
        + "pauschal das schwächste Pet zu trainieren nicht optimal: Die ersten vier Zielmarken "
        + "öffnen einander. Danach priorisierst du Effarig, außer ein anderes Pet steht direkt "
        + "vor seiner nächsten Freischaltung.",
      soGehts: [
        "Bring Teresa zuerst auf Level 8 und wechsel dann zu Effarig.",
        "Bring Effarig auf Level 8, Nameless auf Level 5 und Effarig anschließend auf Level 10.",
        "Priorisier danach grob Effarig vor Teresa und Nameless, V zuletzt.",
        "Weich davon ab, wenn ein Pet unmittelbar vor der nächsten sichtbaren Freischaltung steht.",
      ],
      fertigWenn: "{ziele} ist erreicht und die neue Mechanik ist geprüft.",
    },

    raSpaetarbeitMachen: {
      phase: "ra",
      kurz: "Bring alle vier Pets auf 25 und schließ Hard V sowie Alchemy ab.",
      warum: "Nach der ersten Pet-Route laufen drei Fortschrittsstränge zusammen. Volle Pet-Level "
        + "öffnen alle Erinnerungen, Hard V liefert die restlichen Space Theorems und gefüllte "
        + "Alchemy-Ressourcen werden für die kommenden Imaginary-Anforderungen gebraucht.",
      soGehts: [
        "Priorisier Effarig, dann Teresa oder Nameless; trainier V nur bis zur nächsten sichtbaren Freischaltung.",
        "Kehr ab V-Pet-Level 6 regelmäßig zu Hard V zurück und nimm erreichbare Stufen mit.",
        "Farm Glyphs und füll die Alchemy-Ressourcen bis zu ihren Kappen.",
        "Wechsel den Strang, wenn der aktuelle nur noch langsam vorankommt.",
      ],
      fertigWenn: "Alle Pets sind Level 25, Hard V steht bei 66 ST und alle 21 Alchemy-Ressourcen sind voll.",
    },

    raNacharbeitImaginary: {
      phase: "imaginaryMachines",
      kurz: "Schließ offene Ra-, Hard-V- und Alchemy-Arbeit neben den Imaginary-Anforderungen ab.",
      warum: "Imaginary Machines ersetzen die vorherigen Systeme nicht. Mehrere ihrer Anforderungen "
        + "setzen volle Pet-Freischaltungen, Hard-V-Boni oder Alchemy voraus. Ein kurzer Rücksprung "
        + "ist deshalb Fortschritt und kein Umweg.",
      soGehts: [
        "Prüf zuerst, ob alle Pets Level 25 erreicht haben.",
        "Hol offene Hard-V-Stufen, sobald V-Pet-Level und aktuelle Glyphs sie erlauben.",
        "Füll Alchemy weiter und kehr danach zur nächsten Imaginary-Anforderung zurück.",
      ],
      fertigWenn: "Alle Pets sind 25, Hard V ist voll und alle Alchemy-Ressourcen stehen an der Kappe.",
    },

    imaginaryUpgradesElfBisFuenfzehn: {
      phase: "imaginaryMachines",
      kurz: "Arbeite die offenen {ziele} in Lesereihenfolge ab, sobald sie bezahlbar sind.",
      warum: "IU11 bis IU15 sind fünf getrennte Anforderungen an Relic Shards, Glyph-Level und "
        + "Celestial-Runs. Die Reihenfolge ist ein guter Standard, aber kein hartes Gesetz: Ein "
        + "bereits entsperrtes Upgrade kaufst du sofort, statt auf die vorherige Nummer zu warten.",
      soGehts: [
        "IU11 verlangt 1e90 Relic Shards insgesamt; nutz dafür dein Effarig-Farmset.",
        "Für IU12 stellst du einen Glyph-Level-Faktor auf 100 und pushst den Glyph-Rekord auf Level 9.000.",
        "Für IU13 pushst du die projizierten RM in der Nameless-Reality bis MAX.",
        "Für IU14 erreiche 1e75.000.000.000 Tickspeed/s in EC5; für IU15 erreiche e1,5e12 AM ohne ID1-Kauf.",
        "Sobald eine Bedingung gespeichert ist, spar Imaginary Machines und kauf das Upgrade.",
      ],
      fertigWenn: "Bei {ziele} steht im Tab jeweils „gekauft“.",
    },

    raNacharbeitLaitela: {
      phase: "laitela",
      kurz: "Hol fehlende Ra-, Hard-V- und Alchemy-Fortschritte nach, bevor du dich festfährst.",
      warum: "Lai'telas Anforderungen greifen weiter auf Ra, Hard V und Alchemy zurück. Wenn ein "
        + "Imaginary Upgrade unmöglich wirkt, ist die Ursache oft eine dort ausgelassene Stufe "
        + "und nicht ein fehlender weiterer Dark-Matter-Wartelauf.",
      soGehts: [
        "Bring fehlende Pets auf Level 25 und prüf alle Erinnerungsfreischaltungen.",
        "Vervollständige Hard V bis 66 Space Theorems.",
        "Füll alle Alchemy-Ressourcen bis zur Kappe und versuch dann die offene IU erneut.",
      ],
      fertigWenn: "Ra, Hard V und Alchemy sind vollständig abgeschlossen.",
    },

    imaginaryUpgradesSechzehnBisZwanzig: {
      phase: "laitela",
      kurz: "Kauf {ziele} und bau damit Lai'telas Dark-Matter-System vollständig auf.",
      warum: "IU16 bis IU20 öffnen nacheinander Dark Matter Dimensions, Annihilation und "
        + "Automation. Die Anforderungen wechseln zwischen Lai'tela-Abschlüssen, Singularities "
        + "und Continuum; arbeite deshalb mit dem jeweils passenden System statt nur zu warten.",
      soGehts: [
        "Schließ Lai'tela zweimal unter 30 Sekunden ab, um IU16 zu öffnen.",
        "Lass für IU17 mindestens 20 Singularities in einer automatischen Verdichtung entstehen.",
        "Sammel für IU18 insgesamt 80.000 Galaxien.",
        "Erfüll IU19 mit höchstens acht Time Studies und steigere für IU20 Continuum um mindestens 100 Prozent.",
        "Kauf jedes freigeschaltete Upgrade, bevor du den nächsten Abschluss versuchst.",
      ],
      fertigWenn: "Bei {ziele} steht im Tab jeweils „gekauft“.",
    },

    laitelaDimensionenAbschalten: {
      phase: "laitela",
      kurz: "Kauf passende Dark-Matter-Upgrades und schließ Lai'telas nächste Stufe ab.",
      warum: "Jede Stufe deaktiviert eine weitere Dimension und wird absichtlich härter. Es "
        + "gibt keine universelle Kaufreihenfolge: Intervall, Leistung, Singularities und "
        + "Annihilation wechseln sich als Engpass ab. Der sichtbare Timer zeigt, wann ein neuer Versuch lohnt.",
      soGehts: [
        "Kauf die günstigste Intervall- oder Leistungsstufe, die deinen aktuellen Engpass trifft.",
        "Verdichte eine Singularity, wenn der nächste Meilenstein in Reichweite ist.",
        "Nutz Annihilation für einen klaren dauerhaften Sprung und versuch dann die nächste Stufe.",
        "Wenn der Timer stagniert, wechsel zu IM-, Glyph-, Ra- oder Singularity-Fortschritt.",
      ],
      fertigWenn: "Alle acht Lai'tela-Stufen sind abgeschlossen.",
    },

    imaginaryUpgradesEinundzwanzigBisVierundzwanzig: {
      phase: "laitela",
      kurz: "Lös die vier offenen Puzzle-Anforderungen {ziele} mit getrennten Presets.",
      warum: "IU21 bis IU24 verlangen absichtlich ungewöhnliche Einschränkungen in Continuum, "
        + "Effarig und Ra. Ein einziges Allzweckset kann sie nicht erfüllen. Speichere für jede "
        + "Anforderung ein eigenes Preset und aktiviere die Requirement-Sperre vor dem Start.",
      soGehts: [
        "IU21 verlangt e7,4e12 AM in einer kompletten Reality mit ausgeschaltetem Continuum.",
        "IU22 verlangt e1,5e11 AM in Effarig mit mindestens vier Cursed Glyphs.",
        "IU23 verlangt Glyph-Level 20.000 in Ra ohne positive Glyph-Slots.",
        "IU24 verlangt 13.000 Antimatter-Galaxien in Ra bei vollständig invertierten Schwarzen Löchern.",
        "Kauf jedes Upgrade sofort nach gespeicherter Bedingung.",
      ],
      fertigWenn: "Bei {ziele} steht im Tab jeweils „gekauft“.",
    },

    imaginaryUpgradeFuenfundzwanzig: {
      phase: "laitela",
      kurz: "Erfüll IU25 in Lai'telas härtester Stufe mit höchstens einem normalen Glyph.",
      warum: "Das letzte Imaginary Upgrade verbindet den vollständigen Lai'tela-Fortschritt mit "
        + "einer strikten Glyph-Grenze. Die Bedingung ist ein langer Abschluss, kein Grund für "
        + "einen frühen Versuch; bau zuerst Singularities, Glyph-Level und Sacrifice weiter aus.",
      soGehts: [
        "Schließ zuerst alle acht Lai'tela-Stufen und kauf die vorherigen Imaginary Upgrades.",
        "Rüste höchstens einen Nicht-Companion-Glyph aus und sperr die Anforderung.",
        "Starte Lai'telas härteste Stufe und lass den vorbereiteten Build vollständig durchlaufen.",
        "Kauf IU25 nach gespeicherter Bedingung und lies die Doom-Warnung vollständig.",
      ],
      fertigWenn: "IU25 ist gekauft und Pelle ist geöffnet.",
    },

    pelleDoomStarten: {
      phase: "pelle",
      kurz: "Lies die Doom-Warnung vollständig und starte Pelle nur, wenn du den Endlauf jetzt spielen willst.",
      warum: "Doom ist unumkehrbar. Zusätzlicher Fortschritt vor dem Start macht den Lauf nicht "
        + "stärker, weil Pelle fast alles neu aufbaut; einzelne geheime Achievements können "
        + "dagegen gesperrt werden. Die Entscheidung gehört deshalb bewusst an diese Zäsur.",
      soGehts: [
        "Exportier zur Sicherheit einen separaten Save, bevor du den Doom-Knopf drückst.",
        "Prüf die Warnung auf dauerhaft gesperrte Inhalte und stoppe, wenn du sie vorher noch holen willst.",
        "Starte Doom und lies Pelles ersten Upgrade- und Armageddon-Text.",
      ],
      fertigWenn: "Der Save ist als doomed markiert und der Pelle-Tab zeigt Reality Shards.",
    },

    pelleBisInfinity: {
      phase: "pelle",
      kurz: "Bau Antimatter neu auf und löse den ersten Pelle-Strike bei Infinity aus.",
      warum: "Vor der ersten Infinity sind Armageddons nur dann sinnvoll, wenn die neuen Remnants "
        + "sofort ein wirksames Pelle-Upgrade kaufen. Challenge 8 hilft erst mit genügend AD-Multiplikator; "
        + "zu frühes Festbeißen dort macht den Wiederaufbau unnötig langsam.",
      soGehts: [
        "Löse den ersten Armageddon bei einem Remnant aus und priorisier den AD-Multiplikator.",
        "Bleib zunächst außerhalb von Challenge 8 und nutz Dimension Boosts für neue Remnants.",
        "Wechsel erst mit einem starken AD-Multiplikator in Challenge 8 und push bis zum Crunch.",
        "Armageddon direkt vor dem ersten Crunch noch einmal, wenn dadurch ein klares Upgrade möglich wird.",
      ],
      fertigWenn: "Die erste Infinity ist erreicht und Pelles erster Strike hat Rift 1 geöffnet.",
    },

    pelleBisReplicanti: {
      phase: "pelle",
      kurz: "Farm Infinity Points, brich Infinity und arbeite bis Replicanti vor.",
      warum: "Der erste Rift ersetzt einen Teil des gesperrten IP-Multiplikators. Du füllst ihn "
        + "deshalb in kurzen Abschnitten, während Break-Upgrades und Autobuyer den IP-Ertrag "
        + "steigern. Infinity Dimensions kommen durch Pelle-Upgrades später von selbst in Reichweite.",
      soGehts: [
        "Stell die Autobuyer auf den besten IP-Ertrag pro Minute und kauf Break-Upgrades.",
        "Füll Rift 1 immer wieder kurz und lass ihn ruhen, wenn IP gerade stärker wachsen muss.",
        "Schalte die Autobuyer für höhere Dimensionen, Tickspeed und Galaxien frei.",
        "Kauf die Pelle-Freischaltung für Replicanti, sobald sie erreichbar ist.",
      ],
      fertigWenn: "Replicanti sind geöffnet und Pelles zweiter Strike hat Rift 2 freigeschaltet.",
    },

    pelleBisEternity: {
      phase: "pelle",
      kurz: "Nutz Replicanti, Infinity Dimensions und ICs bis zur ersten Doom-Eternity.",
      warum: "Rift 2 verbraucht Replicanti und ist gleichzeitig dein stärkster neuer Multiplikator. "
        + "Lass Replicanti deshalb zwischen Füllphasen wachsen. Der Rest ähnelt der ersten "
        + "Infinity-Phase: neue IDs, IC-Abschlüsse und gezielte Crunches treiben den Rekord.",
      soGehts: [
        "Füll Rift 2 nur, wenn ausgeschaltetes Füllen den Replicanti-Rekord kaum noch verbessert.",
        "Kauf neue Infinity Dimensions und Break- beziehungsweise Replicanti-Upgrades bei jeder Schwelle.",
        "Schließ die erreichbaren Infinity Challenges mit denselben Grundstrategien wie vor Reality ab.",
        "Armageddon nur, wenn die neuen Reality Shards den Weg zum nächsten Upgrade deutlich verkürzen.",
      ],
      fertigWenn: "Die erste Doom-Eternity ist erreicht und Rift 3 ist geöffnet.",
    },

    pelleBisEcs: {
      phase: "pelle",
      kurz: "Bau die frühe Doom-Eternity mit der eigenen Pelle-Route bis 115 TT auf.",
      warum: "Rift 3 verbraucht den Fortschritt von Rift 2 und erhöht dafür dessen späteres "
        + "Potenzial. Gleichzeitig sind mehrere Time Studies wirkungslos, bleiben aber als "
        + "Verbindung nötig. Die normale Früh-Eternity-Route passt deshalb hier nicht unverändert.",
      soGehts: [
        "Kauf mit dem ersten EP wieder TD1 und arbeite die Pelle-Eternity-Checkpoints ab.",
        "Füll Rift 3 zunächst mit Rift 2 und pausier Rift 1.",
        "Nimm TS21 früh; nutz beim Dimensionspfad AD statt ID und beim Temposplit Idle.",
        "Wechsel zwischen Power-, Infinity-, Replication- und Time-Glyph für den jeweiligen Ressourcenpush.",
      ],
      fertigWenn: "115 TT sind erreicht und Pelles vierter Strike hat Rift 4 geöffnet.",
    },

    pelleEcsBisDilation: {
      phase: "pelle",
      kurz: "Folge ausschließlich der Cel-7-EC-Route bis zur permanenten Dilation.",
      warum: "Pelles EC-Reihenfolge, Kosten und sinnvolle Trees unterscheiden sich deutlich von "
        + "der normalen 60-Läufe-Route. Rifts und Glyph-Wechsel liegen zwischen den Clears. "
        + "Darum zeigt dieser Abschnitt nur die separate Cel-7-Tabelle und niemals den normalen EC-Tab.",
      soGehts: [
        "Lade den nächsten Cel-7-Tree und beachte eingestreute TT-Push-Zeilen als eigene Etappen.",
        "Pausier außer Rift 3 alle Rifts innerhalb einer Eternity Challenge.",
        "Push vor einem EC die Time Dimensions und wechsel Glyphs für TT, Rifts und Remnants.",
        "Füll Rift 1 und Rift 3 vor Dilation vollständig und Rift 4 so weit wie sinnvoll.",
      ],
      fertigWenn: "Dilation ist erreicht und Pelles fünfter Strike macht sie dauerhaft aktiv.",
    },

    pelleBisGalaxyGenerator: {
      phase: "pelle",
      kurz: "Priorisier Rift 5 und Dilation-Upgrades, bis der Galaxy Generator aufgeht.",
      warum: "Nach dem letzten Strike ist Dilation dauerhaft aktiv. Rift 5 liefert die stärksten "
        + "Zwischenschwellen, darf aber Dilated Time nicht völlig leersaugen. Dilation-Rebuyables, "
        + "Rift-Meilensteine und Armageddons bilden jetzt den letzten Produktionskreislauf.",
      soGehts: [
        "Rüste standardmäßig den Dilation-Glyph aus und wechsel nur für einen klaren Remnant-Push.",
        "Füll Rift 5 kurz, wenn dein DT-Bestand deutlich über seinem bisherigen Drainwert liegt.",
        "Priorisier Rift-5-Meilensteine sowie die starken DT- und Tachyon-Galaxy-Rebuyables.",
        "Füll Rift 4 ab dem späten DT-Push wieder vollständig, um den Generator freizuschalten.",
      ],
      fertigWenn: "Der Galaxy Generator ist freigeschaltet.",
    },

    pelleGalaxyGeneratorBeenden: {
      phase: "pelle",
      kurz: "Kauf wirksame Generator-Upgrades und opfere jeweils den aktuell begrenzenden Rift.",
      warum: "Der Galaxy Generator durchläuft feste Phasen, deren Kappen von Pelles fünf Rifts "
        + "bestimmt werden. Sobald eine Kappe erreicht ist, setzt das vorgesehene Rift-Opfer "
        + "den Generator in die nächste Phase; zusätzliches Warten an der Kappe bringt nichts.",
      soGehts: [
        "Kauf Generator-Upgrades, solange sie einen kleinen Teil deiner erzeugten Galaxien kosten.",
        "Prüf an jeder Kappe, welches Rift der Generator als nächstes verlangt.",
        "Aktivier das Opfer und lass die neue Generatorphase anlaufen.",
        "Wiederhol das bis zum Abspann und warte nicht an einer bereits erreichten Kappe.",
      ],
      fertigWenn: "Der Save meldet isGameEnd und der Abspann ist erreichbar.",
    },

    durchgespielt: {
      phase: "complete",
      kurz: "Der Save meldet einen abgeschlossenen Durchlauf.",
      warum: "In deinem Save steht ein Eintrag für ein abgeschlossenes Spiel. Damit gibt es "
        + "keine weitere Phase mehr, auf die der Guide dich hinweisen könnte. Für einen "
        + "neuen Durchlauf fängt die Erkennung wieder bei der tatsächlich erreichten "
        + "Phase an.",
      soGehts: [
        "Lad einen anderen Save hoch, wenn du einen zweiten Durchlauf begleiten lassen willst.",
        "Der Guide erkennt die Phase dann automatisch neu.",
      ],
      fertigWenn: "Nichts mehr offen.",
    },
  };

  // Anforderungen und Belohnungen: normal-achievements.js. Nur Hilfen fuer
  // einen Lauf ohne Achievement-Timer, keine erfundene Freischalt-Pflichtliste.
  const ACHIEVEMENT_HILFEN = {
    71: "r71 „ERROR 909: Dimension not found“ fehlt: Pausier alle Autobuyer. Starte unter Challenges → Normal Challenges die Challenge 2. Kauf genau eine erste Antimatter Dimension über Buy 1, nur Tickspeed dazu, keine weiteren Dimensionen, keine Dimboosts und keine Galaxien. Drück Big Crunch, sobald möglich. Belohnung: ×3 auf AD1. Aktiviere danach die zuvor genutzten Autobuyer wieder, außer Eternity und Replicanti Auto Galaxy.",
    23: "r23 „The 9th Dimension is a lie“ fehlt: Pausier AD8-, Dimboost- und Galaxie-Autobuyer. Setz die Dimensionen mit einem Dimboost oder einer Galaxie zurück und kauf genau 99 achte Antimatter Dimensions: 90 plus 9 Einzelkäufe. Nach dem Achievement die pausierten Autobuyer wieder einschalten. Belohnung: 10 % stärkere AD8.",
    28: "r28 „There's no point in doing that...“ fehlt: Sobald die Menge deiner ersten Antimatter Dimension mindestens e150 beträgt, kauf eine einzelne AD1. Gemeint ist die AD1-Menge, nicht Antimatter. Belohnung: 10 % stärkere AD1.",
    85: "r85 „ALL YOUR IP ARE BELONG TO US“ fehlt: Warte, bis der Big-Crunch-Knopf mindestens e150 IP als Gewinn für diesen einen Crunch zeigt, und drück ihn. Belohnung: ×4 IP.",
    93: "r93 „MAXIMUM OVERDRIVE“ fehlt: Warte, bis der Big-Crunch-Knopf mindestens e300 IP als Gewinn für diesen einen Crunch zeigt, und drück ihn. Belohnung: nochmals ×4 IP.",
    95: "r95 „Is this safe?“ fehlt: Starte mit Big Crunch eine neue Infinity. Kauf Replicanti-Chance und -Intervall, bis du innerhalb einer Stunde das Replicanti-Limit (ca. 1,79e308) erreichst. Kauf dabei keine Replicanti-Galaxie; Auto Galaxy bleibt aus. Danach bleiben die Replicanti bei Big Crunch erhalten und du musst sie nicht jedes Mal neu aufbauen.",
  };

  function ecEtappeFuer(schritt) {
    const text = textFuer(schritt);
    const w = schritt.werte;
    const studies = (schritt.baeume ?? []).flatMap(b => b.importString.split("|")[0].split(",").map(Number));
    if (schritt.gruppe === "ecTt") return { ...text,
      kurz: `TT farmen · ${w.standTT} → ${w.readyTT} TT`,
      soGehts: [
        "Außerhalb der Challenge respecen, eternitieren, EP-Farm-Tree laden. Weitere Trees erst an ihrer TT-Marke verwenden.",
        ...text.soGehts.filter(t => /Studienpfad muss/.test(t)),
        ...(text.soGehts.some(t => t.startsWith("Mit PASS")) ? ["Mit PASS den Passive-Tree verwenden; RGs automatisch kaufen lassen, sonst mit R."] : []),
        ...(studies.includes(121) ? text.soGehts.filter(t => t.startsWith("Ab dem Baum mit TS121:")) : []),
        studies.includes(181) ? "Mit TS181: Crunch-Autobuyer aus, Dimboost/Galaxy unbeschränkt auf 0 s. Ohne TS181 nach vollen RGs crunchen. Eternity-Autobuyer für den EP-Push aus."
          : "Nach vollen Replicanti-Galaxien crunchen; für den EP-Push Eternity-Autobuyer aus.",
        ...text.soGehts.filter(t => t.startsWith("EP-Farmen lassen:")).map(t => t.replace("und den Save neu einlesen", "und hier weitermachen")),
        `TDs und ×5 EP kaufen; AM-/IP-/EP-Theorems bis ${w.readyTT} Gesamt-TT sammeln. Dann hier mit der Freischaltung weitermachen.`,
      ],
    };
    if (schritt.gruppe === "ecUnlock") return { ...text, kurz: "Freischalten",
      soGehts: schritt.inhalt?.soGehts ?? [
        `Respecen, eternitieren, Freischalt-Farm-Tree laden und ${w.unlock} erreichen.`,
        `EC${w.ec}-Knoten kaufen; die beim Tree genannten TT dafür frei lassen. Erst danach zum Run-Tree wechseln.`,
      ],
    };
    if (schritt.gruppe === "ecRun") return { ...text, kurz: "Challenge spielen",
      soGehts: !schritt.baeume.length ? [
        `Laufenden ${w.run} ohne Respec bis ${w.goal} weiterspielen, dann Eternity.`, w.tip,
      ] : [
        `Respecen und außerhalb der Challenge eternitieren; ${w.ec === 8 ? "Start-Tree" : "Run-Tree"} laden. EC${w.ec} starten, bei ${w.goal} mit Eternity abschließen.${w.ec === 11 ? " Nur AD-Pfad, TS72/73 ungekauft lassen." : w.ec === 12 ? " Nur TD-Pfad, TS71/72 ungekauft lassen." : ""}`,
        ...(w.ec === 8 ? ["Alle 50 ID-Käufe in ID1; 9 % Replicanti-Chance, RG-Upgrades laut Tipp, Rest ins Intervall. Erst bei vollen Replicanti/RGs den restlichen Run-Tree ohne Respec importieren."] : []),
        w.tip,
      ],
    };
    return text;
  }

  function textFuer(schritt) {
    if (!SCHRITTE[schritt.id]) return null;
    if (schritt.etappen) {
      const texte = schritt.etappen.map(ecEtappeFuer);
      return { ...textFuer({ ...schritt, etappen: null }),
        kurz: `${schritt.etappen.at(-1).baeume.length ? "" : "Laufenden "}${schritt.werte.run} abschließen · ${schritt.werte.goal}`,
        soGehts: texte.flatMap(t => t.soGehts.map((zeile, i) => i === 0 ? `${t.kurz}: ${zeile}` : zeile)),
        falle: [...new Set(texte.map(t => t.falle).filter(Boolean))].join(" "),
        warum: "Der Reihe nach abarbeiten: TT sammeln, falls nötig freischalten, dann den Lauf abschließen. Spätere Schritte setzen die vorherigen Abschlüsse und TT-Ziele voraus. Ein neuer Save ist erst nach der Folge oder bei einer Abweichung nötig.",
      };
    }
    const basis = { ...SCHRITTE[schritt.id], ...schritt.inhalt };
    if (schritt.id === "realityGlyphSchwelle" && schritt.zielIds?.length === 1 && schritt.zielIds[0] === "ru13") {
      basis.kurz = "Sichere The Telemechanical Process kostenlos für später.";
      basis.warum = "Du kannst die Freischaltbedingung schon in dieser Reality erfüllen und das Upgrade später für 50 RM kaufen. Die erfüllte Bedingung bleibt über Reality-Resets erhalten. Deine ausgerüsteten Glyphs kannst du dafür behalten; nur TD5–8 sind eingeschränkt.";
    }
    const werte = {
      ziele: new Intl.ListFormat("de").format(schritt.zielNamen ?? []),
      ...(schritt.werte ?? {}),
    };
    const fuelle = text => String(text ?? "").replace(/\{([a-zA-Z0-9_]+)\}/g,
      (treffer, name) => name in werte ? String(werte[name]) : treffer);
    const zielHandgriffe = (schritt.zielIds ?? []).flatMap(id => basis.zielHandgriffe?.[id] ?? []);
    let handgriffe = [...(schritt.vorab ?? []), ...zielHandgriffe, ...basis.soGehts];
    if (schritt.id === "realityEpSchwellen") handgriffe = [...(schritt.vorab ?? []), basis.soGehts[0], ...zielHandgriffe];
    if (schritt.id === "realityRequirementsSammeln"
      && schritt.zielIds?.length && schritt.zielIds.every(id => id === "ru7")) handgriffe = zielHandgriffe;
    if (schritt.fehlendeAchievements?.length) {
      const hilfen = [
        "Für Paradoxically Attain gibt es keine Pflichtliste von Achievements. Die folgenden fehlen in deinem Save und helfen beim IP-Push. Wenn du die IP-Bedingung schon erreichst, geh direkt zur manuellen Eternity weiter.",
        ...schritt.fehlendeAchievements.map(id => ACHIEVEMENT_HILFEN[id]),
      ];
      if (schritt.spaetereAchievements?.length) hilfen.push(
        "Für dieses Upgrade nicht nötig: " + schritt.spaetereAchievements.map(id => "r" + id).join(", ")
        + ". Warte dafür jetzt nicht auf Offline-Zeit, Antitables oder Millionen Infinities. Nach der Freischaltung darf der Achievement-Timer den Rest übernehmen."
      );
      // Erst Schutzschalter, dann die Hilfen, erst danach die Eternity.
      const position = (schritt.vorab?.length ?? 0)
        + (schritt.id === "realityRuBundleFreischalten" ? 2 : zielHandgriffe.length);
      handgriffe.splice(position, 0, ...hilfen);
    }
    if (schritt.saveNeuEinlesen) handgriffe.push(...SCHRITTE.ecSaveNeuEinlesen.soGehts);
    return {
      ...basis,
      kurz: schritt.saveNeuEinlesen ? "Kauf die Upgrades und lad den Save neu hoch." : fuelle(basis.kurz),
      soGehts: handgriffe.map(fuelle),
      warum: fuelle(basis.warum),
      falle: fuelle(basis.falle),
      fertigWenn: schritt.saveNeuEinlesen ? SCHRITTE.ecSaveNeuEinlesen.fertigWenn : fuelle(basis.fertigWenn),
    };
  }

  /* Kontext für Rückfragen: Spielstand und aktueller Plan, ohne Guide-Anhang. */
  const KONTEXT_KOPF = [
    "# Antimatter Dimensions – mein Spielstand",
    "",
    "Antimatter Dimensions (Web/Steam). Bitte beantworte meine Frage am Ende auf Deutsch und prüfe den vorgeschlagenen Plan anhand meines Spielstands.",
    "Save-Momentaufnahme, kein Live-Stand. Schätzungen sind gekennzeichnet; der Rohsave ist nicht enthalten.",
  ];

  const felderAus = (objekt, felder) => Object.fromEntries(felder.split(/\s+/)
    .filter(feld => feld && objekt?.[feld] !== undefined).map(feld => [feld, objekt[feld]]));

  function kontextDetails(p, phase) {
    const reihenfolge = window.AD_PLAN?.REIHENFOLGE ?? Object.keys(PHASEN);
    const erreicht = name => reihenfolge.indexOf(name) <= reihenfolge.indexOf(phase);
    const r = p.resources ?? {};
    const daten = {
      basis: felderAus(p, "platform version legacySave achievementIds dimensionBoosts galaxies eighthDimensionAmount eighthDimensionBought recentEternityEPLog10 recentInfinityIPLog10 peakEPGain eternityAutobuyer currentInfinitySeconds currentEternitySeconds replicantiLog10 replicantiRounded"),
      ressourcen: felderAus(r, "antimatterExponent maxAntimatterExponent"),
    };
    if (erreicht("infinity")) {
      daten.infinity = felderAus(p, `infinityUnlocked normalChallenges infinityChallenges infinityChallengesUnlocked
        breakInfinity breakInfinityReady bigCrunchInterval ipMultPurchases infinityUpgrades infinityRebuyables
        infinityDimensionsUnlocked infinityPowerExponent replicantiUnlocked replicantiGalaxies replicantiGalaxyCap`);
      daten.challenges = felderAus(p.currentChallenge, "normal infinity");
      Object.assign(daten.ressourcen, felderAus(r, "infinityPoints infinityPointsExponent maxInfinityPointsExponent infinities"));
    }
    if (erreicht("earlyEternity")) {
      daten.eternity = felderAus(p, `eternityUnlocked totalTT unspentTT studies clears timeDimensionsUnlocked
        eternityUpgradeCount epMultUpgrades totalTickGained currentEternityRealSeconds currentRun`);
      daten.challenges = felderAus(p.currentChallenge, "normal infinity eternity eternityUnlocked requirementBits");
      Object.assign(daten.ressourcen, felderAus(r, `eternityPoints eternityPointsExponent maxEternityPointsExponent
        eternities bankedInfinities maxReplicantiExponent`));
    }
    if (erreicht("dilation")) {
      daten.dilation = felderAus(p, `dilationUnlocked dilationActive dilationStudies dilationUpgrades dilationRebuyables
        recentDilationCompletions realityStudyBought realityAvailable`);
      Object.assign(daten.ressourcen, felderAus(r, "tachyonParticles dilatedTime dilatedTimeLog10 maxDilatedTimeExponent"));
    }
    if (erreicht("reality")) {
      daten.reality = felderAus(p, `reality realities realityUpgrades realityUpgradeUnlocks realityRequirementLocks
        realityRebuyables perks perkPoints autoAchievementsEnabled gainedAutoAchievements realityGameTimeMs currentRun`);
      daten.bedingungen = felderAus(p.requirementChecks, "noEternities noInfinities noRG noAD8 maxGlyphs slowestBlackHole");
      daten.glyphs = felderAus(p, `activeGlyphs inventoryGlyphs glyphRespecEnabled glyphSacrificeLog10 bestGlyphLevel bestGlyphRarity`);
      daten.prognosen = felderAus(p, "gainedRMEstimate gainedRMIsEstimate pendingGlyphLevel upcomingGlyphs");
      daten.automation = felderAus(p, "automatorPoints automatorUnlocked automatorScriptCount automatorMode");
      daten.blackHoles = felderAus(p, "blackHoles blackHolePaused gameTimeSinceBlackHoleMs");
      Object.assign(daten.ressourcen, felderAus(r, "realityMachines realityMachinesLog10 maxRealityMachines"));
    }
    if (erreicht("teresa")) {
      daten.celestials = { current: p.celestials?.current ?? null };
      for (const name of ["teresa", "effarig", "enslaved", "v", "ra", "laitela", "pelle"]) {
        if (erreicht(name) && p.celestials?.[name]) daten.celestials[name] = p.celestials[name];
      }
    }
    if (erreicht("ra")) daten.alchemy = felderAus(p, "alchemyAtCapCount");
    if (erreicht("imaginaryMachines")) {
      daten.imaginary = felderAus(p, "imaginaryUpgrades imaginaryUpgradeUnlocks imaginaryRequirementLocks imaginaryRebuyables continuumDisabled");
      Object.assign(daten.bedingungen, felderAus(p.requirementChecks, "noContinuum"));
      Object.assign(daten.ressourcen, felderAus(r, "imaginaryMachines imaginaryMachineCap"));
    }
    if (erreicht("complete")) daten.abschluss = felderAus(p, "isGameEnd fullGameCompletions");
    // Nicht-endliche Exponenten sind fehlende/Null-Ressourcen, kein JSON-null
    // ohne Erklärung. Endliche Log10-Werte bleiben ohne Rundung erhalten.
    return JSON.stringify(daten, (_, wert) => typeof wert === "number" && !Number.isFinite(wert) ? null : wert, 2);
  }

  function kontextFuer(profil, plan, extras = {}) {
    if (!profil || !plan) return "";
    const { status = "", ruName = window.AD_PLAN?.ruName ?? (id => `Upgrade ${id}`),
      perkName = window.AD_PLAN?.perkName ?? (id => `Perk ${id}`), importiertAm = null } = extras;
    const r = profil.resources ?? {};
    const zeilen = [];
    const zeile = (name, wert) => {
      if (wert === null || wert === undefined || wert === "" || wert === false) return;
      zeilen.push(`${name}: ${wert}`);
    };
    const zahl = wert => Number(wert ?? 0).toLocaleString("de-DE", { maximumFractionDigits: 0 });
    const exp = wert => (Number.isFinite(wert) && wert > 0 ? `e${Math.floor(wert)}` : null);
    const liste = werte => (werte?.length ? werte.join(", ") : null);
    const gross = wort => String(wort ?? "").charAt(0).toUpperCase() + String(wort ?? "").slice(1);

    zeile("Phase", PHASEN[plan.phase]?.titel ?? plan.phase);
    zeile("Kurzfassung", status);
    if ((profil.realities ?? 0) > 0) {
      zeile("Reality", `${profil.reality} (${zahl(profil.realities)} abgeschlossen)`);
    }
    if ((profil.totalTT ?? 0) > 0) {
      zeile("Time Theorems", `${zahl(profil.totalTT)} insgesamt, ${zahl(profil.unspentTT)} frei`);
    }
    zeile("Antimatter", exp(r.antimatterExponent));
    zeile("Infinity Points", exp(r.infinityPointsExponent));
    if (exp(r.maxEternityPointsExponent)) {
      zeile("Eternity Points", `${exp(r.eternityPointsExponent) ?? "e0"} (Rekord dieser Reality ${exp(r.maxEternityPointsExponent)})`);
    }
    if ((r.infinities ?? 0) > 0) zeile("Infinities", zahl(r.infinities));
    if ((r.eternities ?? 0) > 0) zeile("Eternities", zahl(r.eternities));
    zeile("Dimension Boosts / Galaxien", profil.galaxies > 0 || profil.dimensionBoosts > 0
      ? `${zahl(profil.dimensionBoosts)} / ${zahl(profil.galaxies)}` : null);
    if (profil.infinityUnlocked) {
      zeile("Break Infinity", profil.breakInfinity ? "aktiv" : "noch nicht aktiviert");
      zeile("Normal Challenges", `${profil.normalChallenges?.length ?? 0}/12`);
      zeile("Infinity Challenges", `${profil.infinityChallenges?.length ?? 0}/8`);
      zeile("Infinity Dimensions", `${profil.infinityDimensionsUnlocked ?? 0}/8`);
      zeile("Replicanti", profil.replicantiUnlocked
        ? `freigeschaltet, ${zahl(profil.replicantiGalaxies)} Galaxien` : "noch nicht freigeschaltet");
    }
    const laufend = [
      profil.currentChallenge?.normal ? `Normal Challenge ${profil.currentChallenge.normal}` : null,
      profil.currentChallenge?.infinity ? `IC${profil.currentChallenge.infinity}` : null,
      profil.currentChallenge?.eternity ? `EC${profil.currentChallenge.eternity}` : null,
    ].filter(Boolean);
    zeile("Laufende Challenge", liste(laufend) ?? "keine");
    if (profil.eternityUnlocked) {
      zeile("Time Dimensions", `${profil.timeDimensionsUnlocked ?? 0}/8`);
      const clears = profil.clears ?? [];
      if (clears.some(wert => wert > 0)) {
        zeile("EC-Abschlüsse", clears.map((wert, index) => `EC${index + 1} ${wert}/5`).join(", "));
      }
      zeile("Gekaufte Time Studies", liste(profil.studies));
      zeile("Gekaufter EC-Knoten", profil.currentChallenge?.eternityUnlocked ? `EC${profil.currentChallenge.eternityUnlocked}` : null);
      zeile("Gespeicherte EC-Freischaltbedingungen", liste(Array.from({ length: 12 }, (_, i) => i + 1)
        .filter(ec => (profil.currentChallenge?.requirementBits ?? 0) & (1 << ec)).map(ec => `EC${ec}`)));
    }
    if (profil.dilationUnlocked) {
      zeile("Dilation", `${profil.dilationActive ? "läuft gerade" : "freigeschaltet, gerade nicht aktiv"}; Studies ${liste(profil.dilationStudies) ?? "keine"}`);
      if (profil.dilationActive) zeile("Aktueller Dilation-Lauf", `${Math.floor(profil.currentEternityRealSeconds ?? 0)} reale Sekunden beim Speichern; keine Restzeit-Prognose`);
      zeile("Tachyon Particles / Dilated Time", `${zahl(r.tachyonParticles)} / ${exp(r.dilatedTimeLog10) ?? zahl(r.dilatedTime)}`);
      zeile("Dilation-Upgrades", liste(profil.dilationUpgrades));
    }
    if ((profil.realities ?? 0) > 0) {
      zeile("Reality Machines", `${r.realityMachinesLog10 > 308 ? exp(r.realityMachinesLog10) : zahl(r.realityMachines)} auf Lager, ${profil.gainedRMIsEstimate ? "Basis-Schätzung" : "ausgelesener Gewinn"} ${zahl(profil.gainedRMEstimate)} beim nächsten Reset`);
      zeile("Perk-Punkte", zahl(profil.perkPoints));
      zeile("Gekaufte Perks", liste((profil.perks ?? []).map(perkName)) ?? "keine");
      const offeneRu = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25]
        .filter(id => !(profil.realityUpgrades ?? []).includes(id));
      const gekauft = (profil.realityUpgrades ?? []).filter(id => id >= 6);
      zeile("Reality-Upgrades", `${gekauft.length}/20 einmalige Upgrades gekauft`);
      zeile("Bereits gekaufte Reality-Upgrades", liste(gekauft.map(ruName)) ?? "keine");
      zeile("Bedingung erfüllt, noch nicht gekauft", liste((profil.realityUpgradeUnlocks ?? [])
        .filter(id => id >= 6 && !gekauft.includes(id)).map(ruName)) ?? "keine");
      zeile("Aktive Requirement Locks (kein Kauf)", liste((profil.realityRequirementLocks ?? []).map(ruName)) ?? "keine");
      zeile("Noch nicht gekaufte Reality-Upgrades (keine Kaufreihenfolge)", liste(offeneRu.map(ruName)) ?? "keine");
      const glyphen = (profil.activeGlyphs ?? []).filter(glyph => glyph.type !== "companion");
      if (glyphen.length) {
        zeile("Ausgerüstete Glyphs", glyphen
          .map(glyph => `${gross(glyph.type)} Level ${glyph.level} (${(glyph.effectIds ?? []).join(" + ") || "kein Effekt"})`)
          .join("; "));
      } else zeile("Ausgerüstete Glyphs", "keine spielwirksamen Glyphs");
      zeile("Glyph-Inventar", `${profil.inventoryGlyphs?.length ?? 0} Glyphs; alle Einzelwerte im Diagnoseblock`);
    }
    if (profil.imaginaryUpgrades?.length || (r.imaginaryMachines ?? 0) > 0) {
      zeile("Imaginary Machines", `${zahl(r.imaginaryMachines)} von ${zahl(r.imaginaryMachineCap)} Limit, ${profil.imaginaryUpgrades?.length ?? 0} Upgrades`);
    }

    const schritte = (plan.schritte ?? []).map((schritt, index) => {
      const text = textFuer(schritt);
      if (!text) return null;
      const teile = [`${index + 1}. ${text.kurz}`];
      for (const handgriff of text.soGehts ?? []) teile.push(`   - ${handgriff}`);
      if (text.falle) teile.push(`   Stolperfalle: ${text.falle}`);
      if (schritt.hinweis) teile.push(`   Hinweis: ${schritt.hinweis}`);
      if (text.communityZeit) teile.push(`   Community-Zeit: ${text.communityZeit}`);
      if (text.fertigWenn) teile.push(`   Fertig, wenn: ${text.fertigWenn}`);
      for (const baum of schritt.baeume ?? []) {
        if (/^\d+(?:,\d+)*\|\d+$/.test(baum.importString ?? "")) {
          teile.push(`   Tree „${baum.bezeichnung}“: ${baum.importString}`);
        }
      }
      return teile.join("\n");
    }).filter(Boolean);

    const offeneHinweise = (plan.hinweise ?? []).map(hinweis => `- ${hinweis.text}`);

    return [
      ...KONTEXT_KOPF,
      "",
      ...(importiertAm ? [`Save importiert am: ${importiertAm}`, ""] : []),
      "## Stand",
      ...zeilen,
      "",
      "## Was mein Walkthrough als Nächstes vorschlägt",
      ...((plan.achievements ?? []).length ? ["", "Noch mitnehmen (Zeitpunkt beachten, eigene Läufe einzeln spielen):",
        ...plan.achievements.flatMap(a => [`- ${a.zeitpunkt}: r${a.id} „${a.name}“. ${a.text}`,
          ...a.anleitung.map(text => `  - ${text}`)]), ""] : []),
      ...(schritte.length ? schritte : ["(keine Schritte)"]),
      ...(offeneHinweise.length ? ["", "## In dieser Reality nicht mehr erreichbar", ...offeneHinweise] : []),
      "",
      "## Weitere Spielstanddetails",
      "Exponent/Log10: Basis 10; große Zahlen können gekappt sein. Fehlende Werte sind unbekannt; bei Altsaves sind Standardwerte möglich.",
      ...((profil.realities ?? 0) > 0 ? ["currentRun zählt gespielte Resets, keine geschenkten Eternities. RM-/Glyph-Prognosen sind berechnet, nicht garantiert."] : []),
      "```json",
      kontextDetails(profil, plan.phase),
      "```",
      "",
      "## Meine Frage",
      "",
    ].join("\n");
  }

  window.AD_INHALT = { SCHRITTE, PHASEN, textFuer, ecEtappeFuer, kontextFuer };
})();
