/* Konzeptseiten: erklären Mechaniken, statt nur Anweisungen zu geben.
   abPhase ist die Spoilersperre — eine Seite erscheint erst, wenn der Save
   die Phase erreicht hat. tests/konzepte.test.mjs erzwingt das. */
(() => {
  "use strict";

  const KONZEPTE = {

    dimensionenUndTickspeed: {
      titel: "Dimensionen und Tickspeed",
      abPhase: "preInfinity",
      kurzfassung: "Acht Dimensionen bilden eine Kette. Tickspeed beschleunigt die ganze "
        + "Kette auf einmal, deshalb ist sie fast immer mehr wert, als sie aussieht.",
      abschnitte: [
        { ueberschrift: "Die Kette",
          text: "Die erste Dimension erzeugt Antimatter. Die zweite erzeugt die erste, die "
            + "dritte die zweite, und so weiter bis zur achten. Wenn du also eine hohe "
            + "Dimension kaufst, wirkt sich das nach unten durch die gesamte Kette aus. "
            + "Deshalb ist der Kauf der höchsten bezahlbaren Dimension in aller Regel "
            + "besser als der Kauf einer niedrigen, obwohl die niedrige direkt Antimatter "
            + "macht." },
        { ueberschrift: "Warum Tickspeed anders wirkt",
          text: "Tickspeed verändert nicht eine einzelne Dimension, sondern wie schnell "
            + "das Spiel alle Dimensionen abrechnet. Eine Verbesserung wirkt damit auf "
            + "jedes Glied der Kette gleichzeitig. Das ist auch der Grund, warum Galaxien "
            + "so stark sind: sie machen jede weitere Tickspeed-Verbesserung wirksamer." },
      ],
    },

    galaxienUndDimboosts: {
      titel: "Galaxien und Dimension Boosts",
      abPhase: "preInfinity",
      kurzfassung: "Beide setzen deine Dimensionen zurück. Der Unterschied liegt darin, "
        + "was du dafür bekommst — und Galaxien sind fast immer die bessere Wahl.",
      abschnitte: [
        { ueberschrift: "Was der Unterschied ist",
          text: "Ein Dimension Boost setzt deine Dimensionen zurück und schaltet dafür "
            + "eine weitere Dimension frei, bis alle acht offen sind. Eine Galaxie setzt "
            + "zusätzlich die Dimension Boosts zurück und macht dafür deine Tickspeed "
            + "dauerhaft wirksamer. Weil Tickspeed auf die gesamte Kette wirkt, ist eine "
            + "Galaxie in aller Regel der größere Sprung." },
        { ueberschrift: "Die praktische Reihenfolge",
          text: "Wenn eine Galaxie verfügbar ist, nimm sie vor einem weiteren Dimension "
            + "Boost. Danach kommt eine Dimension, die du noch gar nicht gekauft hast, "
            + "danach die erste Dimension, danach Tickspeed. Die Dimensionen drei bis acht "
            + "kaufst du, wenn sonst nichts Besseres ansteht." },
      ],
    },

    sacrifice: {
      titel: "Wann sich Sacrifice lohnt",
      abPhase: "preInfinity",
      kurzfassung: "Sacrifice löscht deine Dimensionen eins bis sieben und macht dafür die "
        + "achte stärker. Es lohnt sich ab etwa dem doppelten Multiplikator.",
      abschnitte: [
        { ueberschrift: "Die Faustregel",
          text: "Schau dir den angezeigten Sacrifice-Multiplikator an. Liegt er über zwei, "
            + "lohnt sich der Klick. Am besten machst du das direkt, nachdem du einen Satz "
            + "achte Dimensionen gekauft hast, denn deine Käufe bleiben erhalten und nur "
            + "die angesammelten Mengen verschwinden. In einer laufenden Challenge steigt "
            + "der Multiplikator oft sehr schnell auf das Drei-, Fünf- oder Zehnfache." },
      ],
    },

    challengesVerstehen: {
      titel: "Was Challenges eigentlich sind",
      abPhase: "infinity",
      kurzfassung: "Eine Challenge ist eine Infinity unter einer zusätzlichen "
        + "Einschränkung. Der Lohn ist dauerhaft, die Einschränkung nur während des Laufs.",
      abschnitte: [
        { ueberschrift: "Warum du sie machen willst",
          text: "Jede Normal Challenge schaltet einen Autobuyer oder ein anderes dauerhaftes "
            + "Komfort-Upgrade frei. Ohne diese Automation musst du jeden Kauf von Hand "
            + "machen, und das wird später zur eigentlichen Bremse. Besonders wichtig ist "
            + "Challenge 12, denn sie bringt den Crunch-Autobuyer, den du für Break "
            + "Infinity brauchst." },
        { ueberschrift: "Was in Challenges nicht wirkt",
          text: "Die vierte Spalte der Infinity Upgrades funktioniert innerhalb von "
            + "Challenges nicht. Es lohnt sich deshalb, die Challenges zu erledigen, "
            + "bevor du dort viel investierst — der Kauf hilft dir während des Laufs "
            + "ohnehin nicht." },
      ],
    },

    infinityUpgrades: {
      titel: "Infinity Upgrades in der richtigen Reihenfolge",
      abPhase: "infinity",
      kurzfassung: "Billig vor teuer, und der Zeit-Multiplikator zuerst — weil deine "
        + "Spielzeit am Anfang schneller wächst als deine Anzahl Infinities.",
      abschnitte: [
        { ueberschrift: "Die Reihenfolge",
          text: "Nimm zuerst den Multiplikator, der auf deiner gespielten Zeit basiert. Er "
            + "ist am Anfang stärker als der Wechsel des Buy-10-Multiplikators von zwei "
            + "auf zwei Komma zwei, selbst wenn du eine sehr schnelle Infinity hinlegst. "
            + "Danach nimmst du diesen Wechsel mit, dann alles, was nur einen Infinity "
            + "Point kostet, dann die Galaxienstärke, dann die dritte und zuletzt die "
            + "vierte Spalte." },
      ],
    },

    timeStudiesLesen: {
      titel: "Den Time-Study-Baum lesen",
      abPhase: "earlyEternity",
      kurzfassung: "Der Baum hat drei Pfade, die sich gegenseitig ausschließen. Du kannst "
        + "jederzeit zurücksetzen, deshalb ist keine Wahl endgültig.",
      abschnitte: [
        { ueberschrift: "Die drei Pfade",
          text: "In der Mitte des Baums musst du dich zwischen dem Antimatter-, dem "
            + "Infinity- und dem Time-Pfad entscheiden. Welcher richtig ist, hängt davon "
            + "ab, was du gerade farmst. Das ist keine dauerhafte Festlegung: Mit der "
            + "Option, die Studies bei der nächsten Eternity zurückzusetzen, wählst du "
            + "jedes Mal neu." },
        { ueberschrift: "Importieren statt klicken",
          text: "Bäume lassen sich als Zeichenkette importieren. Eine Zahl wie 11,22,32 "
            + "bezeichnet die Knoten der Reihe nach. Steht am Ende ein senkrechter Strich "
            + "mit einer Zahl, kauft der Import zusätzlich den Knoten der entsprechenden "
            + "Eternity Challenge. Genau deshalb ist die Reihenfolge wichtig: erst den "
            + "Knoten kaufen, dann zurücksetzen." },
      ],
    },

    epPushen: {
      titel: "Eternity Points wirksam farmen",
      abPhase: "earlyEternity",
      kurzfassung: "Drei versteckte Werte bestimmen dein Tempo: deine schnellste "
        + "Infinity-Challenge-Zeit, deine schnellste Eternity und deine Anzahl Eternities.",
      abschnitte: [
        { ueberschrift: "Die drei versteckten Booster",
          text: "Niedrige Zeiten in den Infinity Challenges verstärken eines der Eternity "
            + "Upgrades. Eine schnelle Eternity verstärkt eine der Time Studies. Und viele "
            + "Eternities verstärken ein weiteres Eternity Upgrade. Wenn dein Fortschritt "
            + "zäh wird, prüf zuerst diese drei Werte, bevor du länger farmst." },
        { ueberschrift: "Warum sich das lohnt",
          text: "Diese drei Werte sind Bestwerte. Du musst sie also nur ein einziges Mal "
            + "gut hinbekommen, und der Bonus bleibt dir dauerhaft erhalten. Eine halbe "
            + "Stunde gezieltes Optimieren spart dir hier oft viele Stunden Farmen." },
      ],
    },

    aktivVsIdle: {
      titel: "Aktiv oder nebenher spielen",
      abPhase: "earlyEternity",
      kurzfassung: "Beides funktioniert. Aktiv ist schneller, nebenher ist bequemer, und "
        + "die Einstellungen unterscheiden sich deutlich.",
      abschnitte: [
        { ueberschrift: "Aktiv",
          text: "Du hältst die Max-Taste und stellst deine Autobuyer auf möglichst viele "
            + "Eternity Points pro Minute ein. Das ist spürbar schneller, verlangt aber, "
            + "dass du im Spiel bist. Am Rechner kannst du dir das Halten der Taste "
            + "erleichtern, indem du kurz in einen anderen Tab wechselst — das Spiel "
            + "verhält sich dann, als hättest du weiter gedrückt." },
        { ueberschrift: "Nebenher",
          text: "Du verbesserst ein paar Autobuyer so weit, dass ein Lauf ohne dein Zutun "
            + "durchläuft, und lässt das Spiel lange laufen. Das ist langsamer, aber du "
            + "kannst in der Zwischenzeit etwas anderes machen. Für lange Wartezeiten ist "
            + "das oft die vernünftigere Wahl." },
      ],
    },

    ecMechanik: {
      titel: "Wie ein EC-Lauf abläuft",
      abPhase: "eternityChallenges",
      kurzfassung: "Drei getrennte Dinge, die leicht verwechselt werden: Farm-Tree, "
        + "Knotenkauf und Run-Tree.",
      abschnitte: [
        { ueberschrift: "Die drei Teile",
          text: "Der Farm-Tree ist der Baum, mit dem du die Freischaltbedingung der "
            + "Challenge erfüllst. Der Knotenkauf ist der Moment, in dem du die Challenge "
            + "im Baum tatsächlich kaufst. Der Run-Tree ist der Baum, mit dem du die "
            + "Challenge dann spielst. Bei einigen Challenges unterscheiden sich Farm-Tree "
            + "und Run-Tree absichtlich, weil zum Farmen ein anderer Pfad besser ist als "
            + "zum Bestehen." },
        { ueberschrift: "Der teure Fehler",
          text: "Setz die Studies niemals zurück, bevor du den Challenge-Knoten gekauft "
            + "hast. Die erfüllte Bedingung hängt am Baum, und mit dem Zurücksetzen ist "
            + "sie weg. Du farmst sie dann ein zweites Mal. Die richtige Reihenfolge ist "
            + "immer: Bedingung erfüllen, Knoten kaufen, dann zurücksetzen und den "
            + "Run-Tree laden." },
      ],
    },

    dilationVerstehen: {
      titel: "Dilation ist ein Kreislauf",
      abPhase: "dilation",
      kurzfassung: "Hineingehen, ein Upgrade kaufen und mit einer Eternity Tachyon Particles einsammeln.",
      abschnitte: [
        { ueberschrift: "Der Ablauf",
          text: "Innerhalb von Dilation wächst Dilated Time, und damit kaufst du die "
            + "Dilation-Upgrades. Eine normale Eternity beendet den dilatierten Lauf und "
            + "schreibt dir die angezeigten Tachyon Particles gut. Der Dilation-Knopf ist "
            + "zum Starten und Verwalten des Modus da, nicht als besonderer Auszahlungsweg." },
        { ueberschrift: "Der richtige Zeitpunkt",
          text: "Im ersten dilatierten Lauf eternitierst du, sobald es möglich ist. In den "
            + "folgenden Läufen wartest du üblicherweise bis zum nächsten ×3-Upgrade für "
            + "Tachyon Particles, kaufst es und eternitierst dann. So bleibt der Zyklus kurz." },
      ],
    },

    glyphsGrundlagen: {
      titel: "Glyphs verstehen",
      abPhase: "reality",
      kurzfassung: "Ein Glyph hat einen Typ, ein Level, eine Seltenheit und bis zu vier "
        + "Effekte. Von diesen vier Angaben ist der Effekt fast immer die wichtigste.",
      abschnitte: [
        { ueberschrift: "Die vier Angaben",
          text: "Der Typ bestimmt, welche Effekte überhaupt möglich sind. Das Level und "
            + "die Seltenheit bestimmen, wie stark diese Effekte ausfallen. Die Effekte "
            + "selbst bestimmen, was der Glyph bei dir bewirkt. Ein hohes Level auf den "
            + "falschen Effekten ist deutlich weniger wert als ein mittleres Level auf "
            + "genau dem Effekt, den du gerade brauchst." },
        { ueberschrift: "Welcher Typ wofür",
          text: "Time-Glyphs sind vor allem mit dem Eternity-Point-Multiplikator wertvoll. "
            + "Dilation-Glyphs willst du mit dem Faktor auf Dilated Time. Replication-Glyphs "
            + "fast immer mit Replikationsgeschwindigkeit. Power-Glyphs wirken anders als "
            + "die anderen — sie sind Exponenten und werden stärker, je größer deine "
            + "Multiplikatoren ohnehin schon sind." },
      ],
    },

    glyphEffekteLesen: {
      titel: "Glyph-Effekte einschätzen",
      abPhase: "reality",
      kurzfassung: "Nicht jeder Effekt mit einer großen Zahl ist stark, und nicht jeder "
        + "mit einer kleinen Zahl ist schwach.",
      abschnitte: [
        { ueberschrift: "Multiplikator oder Exponent",
          text: "Die meisten Glyph-Effekte sind Multiplikatoren: Ein Wert von 3 bedeutet "
            + "dreimal so viel. Manche Effekte sind aber Exponenten, und die liest man "
            + "völlig anders. Ein Exponent von 1.010 sieht winzig aus, kann aber je nach "
            + "Situation mehr bringen als ein Multiplikator von 3. Wie viel genau, steht "
            + "auf der Seite zu AD Power." },
        { ueberschrift: "Der Bezugspunkt zählt",
          text: "Ein Effekt ist immer nur so viel wert wie das, was er verstärkt. Ein "
            + "starker Multiplikator auf eine Ressource, die dich gerade gar nicht "
            + "ausbremst, bringt dir nichts. Schau deshalb vor jeder Reality zuerst nach, "
            + "was dich wirklich aufhält, und wähle danach aus." },
      ],
    },

    adPower: {
      titel: "Wie stark ist AD Power wirklich?",
      abPhase: "reality",
      kurzfassung: "Ein Power-Glyph mit +0.010 gibt dir nicht ein Prozent mehr, sondern rund "
        + "zwanzig. Der Effekt ist ein Exponent, kein Multiplikator.",
      abschnitte: [
        { ueberschrift: "Exponent statt Multiplikator",
          text: "Ohne Glyphs ist jede Antimatter-Dimension mit hoch 1.000 versehen, das "
            + "ändert nichts. Ein Power-Glyph mit Antimatter Dimensions Power +0.010 macht "
            + "daraus hoch 1.010. Das sieht nach fast nichts aus, wirkt aber auf jeden der "
            + "acht Dimensionsmultiplikatoren. Und weil die achte Dimension die siebte "
            + "füttert, die siebte die sechste und so weiter, multipliziert sich der "
            + "Effekt acht Mal durch die ganze Kette." },
        { ueberschrift: "Was dabei herauskommt",
          text: "Beispiel mit einem Multiplikator von 10 je Dimension. Die Formel lautet "
            + "10 hoch (1 plus p), das Ganze hoch 8, geteilt durch 10 hoch 8.",
          tabelle: {
            kopf: ["AD Power", "Faktor", "Zuwachs"],
            zeilen: [
              ["+0.010", "1,20x", "+20,2 %"],
              ["+0.030", "1,74x", "+73,8 %"],
              ["+0.050", "2,51x", "+151,2 %"],
              ["+0.100", "6,31x", "+531,0 %"],
            ],
          } },
        { ueberschrift: "Warum der Wert mit dir mitwächst",
          text: "Je größer deine Dimensionsmultiplikatoren werden, desto mehr bringt "
            + "derselbe Exponent. Ein Power-Glyph, der sich am Anfang einer Phase kaum "
            + "bemerkbar macht, kann am Ende derselben Phase dein stärkster Effekt sein, "
            + "ohne dass sich am Glyph irgendetwas geändert hätte. Deshalb lohnt es sich, "
            + "einen guten Power-Glyph zu behalten, statt ihn früh wegzuwerfen." },
      ],
    },

    perksWaehlen: {
      titel: "Perks sinnvoll setzen",
      abPhase: "reality",
      kurzfassung: "Perk-Wahlen sind dauerhaft. Plane deshalb den nächsten Pfad, bevor du einen Punkt setzt.",
      abschnitte: [
        { ueberschrift: "Von der Mitte nach außen",
          text: "Der Perk-Baum wächst von der Mitte nach außen, du kannst also nur "
            + "Punkte setzen, die an bereits gesetzte angrenzen. Früh am wertvollsten sind "
            + "die Perks, die deine Eternity-Upgrades verstärken und die deine "
            + "Dilation-Läufe verkürzen, weil beides direkt in deinen nächsten "
            + "Fortschritt einzahlt." },
        { ueberschrift: "Jede Wahl bleibt",
          text: "Gesetzte Perk-Punkte kannst du nicht zurücknehmen oder umverteilen. Später "
            + "kaufst du zwar den gesamten Baum, aber früh solltest du vor jedem Kauf den "
            + "zusammenhängenden Weg zu deinem nächsten Ziel prüfen." },
      ],
    },

    rmSkalierung: {
      titel: "Wie Reality Machines skalieren",
      abPhase: "reality",
      kurzfassung: "Reality Machines hängen an deinen Eternity Points, aber nicht linear. "
        + "Deshalb bringt doppelt so langes Warten nicht doppelt so viel RM.",
      abschnitte: [
        { ueberschrift: "Der Zusammenhang",
          text: "Wie viele Reality Machines du bei einer Reality bekommst, richtet sich "
            + "nach den Eternity Points, die du in diesem Durchlauf erreicht hast. Der "
            + "Zusammenhang ist aber gestaucht: Um die nächste RM-Stufe zu erreichen, "
            + "brauchst du jedes Mal deutlich mehr zusätzliche Eternity Points als für "
            + "die vorherige." },
        { ueberschrift: "Was das für dich heißt",
          text: "Warten wird mit der Zeit immer unrentabler. Wenn du merkst, dass die "
            + "angezeigte RM-Zahl kaum noch steigt, obwohl der Lauf länger und länger "
            + "wird, ist das der Moment zum Abbrechen. Eine neue Reality mit besseren "
            + "Glyphs bringt dann mehr als das Ausreizen der alten." },
      ],
    },

    glyphsFarmen: {
      titel: "Glyphs gezielt farmen",
      abPhase: "reality",
      kurzfassung: "Ein Glyph-Filter nimmt dir das Aussortieren ab. Richtig eingestellt "
        + "spart er dir mehr Zeit als fast jedes Upgrade.",
      abschnitte: [
        { ueberschrift: "Warum filtern wichtiger wird als sammeln",
          text: "Mit jeder Reality bekommst du eine neue Glyphe zur Auswahl, und dein "
            + "Inventar füllt sich schneller, als du von Hand prüfen kannst. Ein Filter "
            + "entscheidet automatisch, was behalten wird. Ohne ihn verbringst du einen "
            + "wachsenden Teil deiner Spielzeit mit Sortieren." },
        { ueberschrift: "Nach Effekt filtern, nicht nur nach Seltenheit",
          text: "Der häufigste Fehler ist, nur nach Seltenheit zu filtern. Ein seltener "
            + "Glyph mit den falschen Effekten ist weniger wert als ein gewöhnlicher mit "
            + "den richtigen. Stell den Filter deshalb auf die Effekte ein, die du "
            + "tatsächlich brauchst, und schärfe ihn nach, wenn sich dein Ziel ändert." },
      ],
    },
  };

  window.AD_KONZEPTE = KONZEPTE;
})();
