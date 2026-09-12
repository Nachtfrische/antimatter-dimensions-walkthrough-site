/* Oberfläche. Einsprachig deutsch, keine Übersetzungsschicht.
   Texte kommen aus content.js, konzepte.js und data.js. */
(() => {
  "use strict";

  const INHALT = window.AD_INHALT;
  const KONZEPTE = window.AD_KONZEPTE;
  const PLAN = window.AD_PLAN;
  const DATEN = window.EC_GUIDE_DATA;
  const ANALYZER = window.AD_SAVE_ANALYZER;

  const el = id => document.getElementById(id);

  const knoten = {
    einstieg: el("einstieg"),
    saveText: el("save-text"),
    savePruefen: el("save-pruefen"),
    saveDatei: el("save-datei"),
    saveMeldung: el("save-meldung"),
    saveNeu: el("save-neu"),
    navigation: el("navigation"),
    planBereich: el("plan-bereich"),
    phasenTitel: el("phasen-titel"),
    phasenEinleitung: el("phasen-einleitung"),
    hinweise: el("hinweise"),
    hinweisBlock: el("hinweis-block"),
    achievementBlock: el("achievement-block"),
    achievementListe: el("achievement-liste"),
    schrittfolge: el("schrittfolge"),
    konzeptListe: el("konzept-liste"),
    konzeptLeer: el("konzept-leer"),
    konzeptUebersicht: el("konzept-uebersicht"),
    konzeptEinzeln: el("konzept-einzeln"),
    konzeptTitel: el("konzept-titel"),
    konzeptKurzfassung: el("konzept-kurzfassung"),
    konzeptAbschnitte: el("konzept-abschnitte"),
    konzeptZurueck: el("konzept-zurueck"),
    runListe: el("run-liste"),
    reiterRuns: el("reiter-runs"),
    kontextKopieren: el("kontext-kopieren"),
    toast: el("toast"),
  };

  let profil = null;
  let aktuellerPlan = null;
  let importiertAm = null;

  /* ---------------- Werkzeug ---------------- */

  function schuetze(wert) {
    return String(wert ?? "")
      .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;").replaceAll("'", "&#39;");
  }

  let toastTimer = 0;
  function melde(text) {
    knoten.toast.textContent = text;
    knoten.toast.dataset.sichtbar = "ja";
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { knoten.toast.dataset.sichtbar = "nein"; }, 2600);
  }

  async function kopiere(text, erfolg = "Kopiert.") {
    try {
      await navigator.clipboard.writeText(text);
      melde(erfolg);
    } catch {
      /* Ältere Browser und unsichere Kontexte haben keine Clipboard-API. */
      const feld = document.createElement("textarea");
      feld.value = text;
      feld.setAttribute("readonly", "");
      feld.style.position = "fixed";
      feld.style.opacity = "0";
      document.body.append(feld);
      feld.select();
      try {
        if (!document.execCommand("copy")) throw new Error("copy failed");
        melde(erfolg);
      } catch {
        melde("Kopieren hat nicht geklappt. Markier den Text und kopier ihn von Hand.");
      }
      feld.remove();
    }
  }

  function setzePhasenfarbe(phase) {
    document.documentElement.style.setProperty("--phase", `var(--ph-${phase})`);
    document.documentElement.style.setProperty("--phase-text", `var(--pht-${phase})`);
  }

  /* ---------------- Schritte darstellen ---------------- */

  function baumMarkup(bezeichnung, baum) {
    if (!/^\d+(?:,\d+)*\|\d+$/.test(baum ?? "")) return "";
    return `
      <div class="baum">
        <div class="baum-kopf"><span>${schuetze(bezeichnung)}</span></div>
        <div class="baum-feld">
          <code>${schuetze(baum)}</code>
          <button class="kopieren" type="button" data-kopieren="${schuetze(baum)}">Kopieren</button>
        </div>
      </div>`;
  }

  function pelleFruehrouteMarkup() {
    const guide = DATEN?.pelleEternityGuide;
    if (!guide || !Array.isArray(guide.eternityStartCheckpoints)) return "";

    const tt = profil?.totalTT ?? 0;
    const stufen = tt < 48
      ? ["startToChaos15", "chaos15To48TT"]
      : tt < 103 ? ["48To103TT"] : ["103To143TT"];
    const ziel = tt < 48 ? "48 TT" : tt < 103 ? "103 TT" : "143 TT und den ersten EC";
    const eintraege = guide.eternityStartCheckpoints.filter(eintrag => stufen.includes(eintrag.stage));
    if (!eintraege.length) return "";

    const zeilen = eintraege.map(eintrag => {
      const schwelle = eintrag.recommendedTT ? `<strong>${schuetze(eintrag.recommendedTT)} TT:</strong> ` : "";
      const baumTitel = eintrag.recommendedTT
        ? `Tree bei ${eintrag.recommendedTT} TT`
        : "Tree für diesen Schritt";
      const baum = eintrag.tree
        ? baumMarkup(baumTitel, eintrag.tree)
        : "";
      return `<li><p>${schwelle}${schuetze(eintrag.recommendation)}</p>${baum}</li>`;
    }).join("");

    return `
      <section class="pelle-route" aria-label="Aktueller Abschnitt der Pelle-Eternity-Route">
        <h4>Aktueller Cel-7-Abschnitt: bis ${schuetze(ziel)}</h4>
        <p class="routen-hinweis">Community-Route aus der mitgelieferten Cel-7-Arbeitsmappe; die Werte sind Richtwerte, keine Freischaltbedingungen.</p>
        <ol>${zeilen}</ol>
      </section>`;
  }

  function pelleRouteZielTt(eintrag, guide) {
    const konflikt = guide?.treeCostConflict;
    return konflikt?.order === eintrag?.order
      ? Math.max(eintrag.recommendedTT ?? 0, konflikt.treeCostTT ?? 0)
      : (eintrag?.recommendedTT ?? 0);
  }

  function naechsterPelleRouteneintrag() {
    const guide = DATEN?.pelleEternityGuide;
    if (!guide || !Array.isArray(guide.ecAndTtPushRoute)) return null;
    const clears = profil?.clears ?? [];
    const tt = profil?.totalTT ?? 0;
    return guide.ecAndTtPushRoute.find(eintrag => eintrag.kind === "ec"
      ? (clears[eintrag.ec - 1] ?? 0) < eintrag.completion
      : tt < pelleRouteZielTt(eintrag, guide)) ?? null;
  }

  function pelleEcRouteMarkup() {
    const guide = DATEN?.pelleEternityGuide;
    const eintrag = naechsterPelleRouteneintrag();
    if (!guide || !eintrag) {
      return `<p class="routen-hinweis">Die Cel-7-EC-Tabelle ist vollständig. Push jetzt Rift 4 und öffne Dilation.</p>`;
    }

    const glyphen = { Infin: "Infinity", Rep: "Replication", Time: "Time", Power: "Power" };
    const zielTt = pelleRouteZielTt(eintrag, guide);
    const titel = eintrag.kind === "ec" ? eintrag.run : `TT-Push ${eintrag.sequence}`;
    const konflikt = guide.treeCostConflict?.order === eintrag.order
      ? ` Die Mappe nennt auch ${eintrag.recommendedTT} TT; der importierbare Tree selbst kostet ${zielTt} TT.`
      : "";
    const laufHinweis = guide.runNotesDe?.[String(eintrag.order)] ?? "";
    const reihenfolgeKonflikt = guide.routeOrderConflict?.importableRoute?.includes(eintrag.run)
      ? `Die beiden Blätter widersprechen sich hier. Der Guide folgt dem Importable-Blatt: ${guide.routeOrderConflict.importableRoute.join(" → ")}; das Route-Blatt nennt ${guide.routeOrderConflict.routeAfterEc10.join(" → ")}.`
      : "";
    const meta = `${titel} · ${glyphen[eintrag.glyph] ?? eintrag.glyph}-Glyph · Richtwert ${zielTt} TT`;
    return `
      <section class="pelle-route" aria-label="Nächster Schritt der Pelle-EC-Route">
        <h4>Nächster Cel-7-Routenschritt: ${schuetze(titel)}</h4>
        <p class="routen-hinweis">Reihenfolge ${schuetze(eintrag.order)} von ${schuetze(guide.ecAndTtPushRoute.length)}.${schuetze(konflikt)}</p>
        ${laufHinweis ? `<p class="routen-notiz"><strong>Hinweis für diesen Schritt:</strong> ${schuetze(laufHinweis)}</p>` : ""}
        ${reihenfolgeKonflikt ? `<p class="routen-konflikt"><strong>Widerspruch in der Arbeitsmappe:</strong> ${schuetze(reihenfolgeKonflikt)}</p>` : ""}
        ${baumMarkup(meta, eintrag.tree)}
      </section>`;
  }

  function schrittMarkup(schritt, nummer) {
    const inhalt = INHALT.textFuer(schritt);
    if (!inhalt) return "";
    if (schritt.etappen) {
      const etappen = schritt.etappen.map(etappe => {
        const text = INHALT.ecEtappeFuer(etappe);
        return `<div class="ec-etappe"><h4>${schuetze(text.kurz)}</h4>
          <ul class="handgriffe">${text.soGehts.map(t => `<li>${schuetze(t)}</li>`).join("")}</ul>
          ${text.falle ? `<p class="falle"><b>Achtung:</b> ${schuetze(text.falle)}</p>` : ""}
          ${(etappe.baeume ?? []).map(b => baumMarkup(b.bezeichnung, b.importString)).join("")}
        </div>`;
      }).join("");
      return `<li class="schritt"><span class="schritt-nummer" aria-hidden="true">${nummer}</span>
        <h3>${schuetze(inhalt.kurz)}</h3>
        ${schritt.hinweis ? `<p class="fokus-hinweis">${schuetze(schritt.hinweis)}</p>` : ""}
        ${etappen}
        <details class="aufklappen"><summary>Warum?</summary>
          <p>${schuetze(inhalt.warum)}</p><p>${schuetze(inhalt.fertigWenn)}</p>
          ${(inhalt.warumDetails ?? []).map(t => `<p>${schuetze(t)}</p>`).join("")}
          ${schritt.etappen.map(INHALT.textFuer).filter(t => t.communityZeit).map(t => `<p>${schuetze(t.communityZeit)}</p>`).join("")}
        </details></li>`;
    }

    const handgriffe = inhalt.soGehts
      .map(zeile => `<li>${schuetze(zeile)}</li>`).join("");

    const falle = inhalt.falle
      ? `<p class="falle"><b>Achtung:</b> ${schuetze(inhalt.falle)}</p>` : "";

    const verweise = (inhalt.siehe ?? [])
      .filter(id => KONZEPTE[id])
      .map(id => `<a href="#konzept/${id}">${schuetze(KONZEPTE[id].titel)}</a>`);
    const mehr = verweise.length
      ? `<p class="mehr-dazu"><span>Mehr dazu:</span> ${verweise.join(" · ")}</p>` : "";

    /* Konkrete Schritte liefern ihre exakten Imports direkt mit. */
    let baeume = Array.isArray(schritt.baeume)
      ? schritt.baeume.map(baum => baumMarkup(baum.bezeichnung, baum.importString)).join("")
      : "";
    if (!Array.isArray(schritt.baeume) && schritt.id === "naechstenEcLaufMachen") {
      const lauf = naechsterLauf();
      if (lauf) {
        baeume = baumMarkup(`EP-Farm-Tree · ohne Challenge`, DATEN.planFarmTree(lauf, profil?.totalTT ?? 0, profil?.clears ?? [], profil?.perks ?? [], profil?.achievementIds ?? []))
          + baumMarkup(`Run-Tree für ${lauf.run}`, DATEN.runImportForPerks(lauf, profil?.perks ?? []));
      }
    } else if (!baeume && !schritt.eigeneRoute && schritt.id === "pelleBisEcs") {
      baeume = pelleFruehrouteMarkup();
    } else if (!baeume && !schritt.eigeneRoute && schritt.id === "pelleEcsBisDilation") {
      baeume = (profil?.totalTT ?? 0) < 143
        ? pelleFruehrouteMarkup()
        : pelleEcRouteMarkup();
    }

    const fokusHinweis = schritt.hinweis
      ? `<p class="fokus-hinweis">${schuetze(schritt.hinweis)}</p>` : "";

    return `
      <li class="schritt">
        <span class="schritt-nummer" aria-hidden="true">${nummer}</span>
        <h3>${schuetze(inhalt.kurz)}</h3>
        <ol class="handgriffe">${handgriffe}</ol>
        ${falle}
        ${fokusHinweis}
        ${inhalt.communityZeit ? `<p class="fokus-hinweis"><b>Community-Zeit:</b> ${schuetze(inhalt.communityZeit)}</p>` : ""}
        ${baeume}
        <p class="fertig-wenn"><b>Fertig, wenn:</b> ${schuetze(inhalt.fertigWenn)}</p>
        <details class="aufklappen">
          <summary>Warum?</summary>
          <div class="aufklapp-inhalt">
            <p class="warum">${schuetze(inhalt.warum)}</p>
            ${(inhalt.warumDetails ?? []).map(t => `<p>${schuetze(t)}</p>`).join("")}
            ${mehr}
          </div>
        </details>
      </li>`;
  }

  /* Der Kontextblock ist der Weg zu einer freien Rueckfrage in einem Chat:
     Spielstand und aktuelle Schritte für eine Rückfrage. */
  function kontextText() {
    if (!profil || !aktuellerPlan) return "";
    return INHALT.kontextFuer(profil, aktuellerPlan, {
      status: PLAN.statusFuer(profil, aktuellerPlan.phase),
      ruName: PLAN.ruName,
      perkName: PLAN.perkName,
      importiertAm,
    });
  }

  function naechsterLauf() {
    if (!profil || !Array.isArray(DATEN?.route)) return null;
    const clears = profil.clears ?? [];
    return DATEN.route.find(lauf => (clears[lauf.ec - 1] ?? 0) < lauf.tier) ?? null;
  }

  function zeichnePlan() {
    if (!profil) return;
    aktuellerPlan = PLAN.planeFuer(profil);
    const phase = INHALT.PHASEN[aktuellerPlan.phase];

    setzePhasenfarbe(aktuellerPlan.phase);
    knoten.phasenTitel.textContent = phase?.titel ?? aktuellerPlan.phase;
    knoten.phasenEinleitung.textContent = PLAN.statusFuer(profil, aktuellerPlan.phase);

    knoten.schrittfolge.innerHTML = aktuellerPlan.schritte
      .map((schritt, index) => schrittMarkup(schritt, index + 1)).join("");
    if (aktuellerPlan.schritte.some(s => s.etappen)) {
      knoten.phasenEinleitung.textContent += " Die folgenden Challenges der Reihe nach abarbeiten; ihre TT-Ziele gelten jeweils vor dem Lauf. Erst danach oder bei einer Abweichung einen neuen Save einlesen.";
    }

    const achievements = aktuellerPlan.achievements ?? [];
    knoten.achievementBlock.hidden = achievements.length === 0;
    knoten.achievementListe.innerHTML = achievements.map(a => `<li>
      <h4>${schuetze(a.zeitpunkt)}: r${schuetze(a.id)} „${schuetze(a.name)}“</h4>
      <p>${schuetze(a.text)}</p>
      ${a.anleitung.length ? `<details class="aufklappen"><summary>Anleitung für r${schuetze(a.id)}</summary>
        <ol class="handgriffe">${a.anleitung.map(text => `<li>${schuetze(text)}</li>`).join("")}</ol>
        ${a.etappen?.length ? `<div class="r143-ziel">
          <label for="r143-exponent">Zuletzt erzielter EP-Exponent</label>
          <p id="r143-ziel-hilfe">Unter Statistics → Past Prestige Runs „Showing total resource gain“ wählen. Den neuesten EP-Gewinn bei Eternities ablesen: Bei 2,5e1000 nur 1000 eintragen. Kein neuer Save nötig.</p>
          <input id="r143-exponent" type="text" inputmode="numeric" autocomplete="off" aria-describedby="r143-ziel-hilfe">
          <output for="r143-exponent" aria-live="polite">Trage den Exponenten deiner ersten Eternity ein.</output>
        </div>
        <ol class="r143-etappen">${a.etappen.map(e => `<li><h5>Eternity ${e.nummer}: ${schuetze(e.titel)}</h5>
          <p>${schuetze(e.text)}</p>${e.baeume.map(b => baumMarkup(b.bezeichnung, b.importString)).join("")}</li>`).join("")}</ol>` : ""}
        </details>` : ""}
    </li>`).join("");

    if (aktuellerPlan.hinweise.length) {
      knoten.hinweise.innerHTML = aktuellerPlan.hinweise
        .map(hinweis => `<li class="hinweis">${schuetze(hinweis.text)}</li>`).join("");
      knoten.hinweisBlock.hidden = false;
    } else {
      knoten.hinweisBlock.hidden = true;
    }

    knoten.planBereich.hidden = false;
    knoten.navigation.hidden = false;
    knoten.saveNeu.hidden = false;
    /* Die Runliste gehört zu jedem Save, der gerade auf der EC-Route läuft —
       auch in einer späteren Reality, weil Reality die EC-Abschlüsse zurücksetzt
       und dieselbe Route noch einmal ansteht. */
    const aufEcRoute = aktuellerPlan.phase === "eternityChallenges"
      || aktuellerPlan.schritte.some(schritt => ["ecTt", "ecUnlock", "ecRun"].includes(schritt.gruppe));
    knoten.reiterRuns.hidden = !aufEcRoute;
    knoten.einstieg.hidden = true;

    zeichneKonzeptListe();
    zeichneRunListe();
  }

  /* ---------------- Konzeptseiten ---------------- */

  function erreichbareKonzepte() {
    if (!aktuellerPlan) return [];
    const rang = name => PLAN.REIHENFOLGE.indexOf(name);
    const jetzt = rang(aktuellerPlan.phase);
    return Object.entries(KONZEPTE)
      .filter(([, konzept]) => rang(konzept.abPhase) <= jetzt)
      .sort((a, b) => rang(a[1].abPhase) - rang(b[1].abPhase));
  }

  function zeichneKonzeptListe() {
    const liste = erreichbareKonzepte();
    knoten.konzeptListe.innerHTML = liste.map(([id, konzept]) => `
      <li class="konzept-eintrag">
        <a href="#konzept/${id}">
          <strong>${schuetze(konzept.titel)}</strong>
          <span>${schuetze(konzept.kurzfassung)}</span>
        </a>
      </li>`).join("");
    knoten.konzeptListe.hidden = liste.length === 0;
    knoten.konzeptLeer.hidden = liste.length > 0;
  }

  function zeigeKonzept(id) {
    const konzept = KONZEPTE[id];
    if (!konzept) return false;

    const rang = name => PLAN.REIHENFOLGE.indexOf(name);
    const jetzt = aktuellerPlan ? rang(aktuellerPlan.phase) : 0;
    /* Spoilersperre auch beim direkten Aufruf über die Adresszeile. */
    if (rang(konzept.abPhase) > jetzt) return false;

    knoten.konzeptTitel.textContent = konzept.titel;
    knoten.konzeptKurzfassung.textContent = konzept.kurzfassung;

    knoten.konzeptAbschnitte.innerHTML = konzept.abschnitte.map(abschnitt => {
      const tabelle = abschnitt.tabelle ? `
        <table class="tabelle">
          <thead><tr>${abschnitt.tabelle.kopf.map(k => `<th>${schuetze(k)}</th>`).join("")}</tr></thead>
          <tbody>${abschnitt.tabelle.zeilen.map(zeile =>
            `<tr>${zeile.map(z => `<td>${schuetze(z)}</td>`).join("")}</tr>`).join("")}</tbody>
        </table>` : "";
      return `
        <section class="konzept-abschnitt">
          <h3>${schuetze(abschnitt.ueberschrift)}</h3>
          <p>${schuetze(abschnitt.text)}</p>
          ${tabelle}
        </section>`;
    }).join("");


    knoten.konzeptUebersicht.hidden = true;
    knoten.konzeptEinzeln.hidden = false;
    zeigeAnsicht("konzepte", { markiereReiter: true });
    return true;
  }

  function zurueckZurUebersicht() {
    knoten.konzeptEinzeln.hidden = true;
    knoten.konzeptUebersicht.hidden = false;
    if (location.hash.startsWith("#konzept/")) history.replaceState(null, "", "#konzepte");
  }

  /* ---------------- EC-Runs ---------------- */

  function zeichneRunListe() {
    if (!Array.isArray(DATEN?.route)) return;
    const clears = profil?.clears ?? [];
    knoten.runListe.innerHTML = DATEN.route.map(lauf => {
      const erledigt = (clears[lauf.ec - 1] ?? 0) >= lauf.tier;
      return `
        <article class="karte">
          <h3>${schuetze(lauf.run)}${erledigt ? " — erledigt" : ""}</h3>
          <p>Richtwert ${schuetze(lauf.readyTT)} Time Theorems. Freischaltbedingung: ${schuetze(lauf.unlock)}. Ziel im Lauf: ${schuetze(lauf.goal)}.</p>
          ${baumMarkup("EP-Farm-Tree · für deinen TT-Bestand", DATEN.planFarmTree(lauf, profil?.totalTT ?? 0, clears, profil?.perks ?? [], profil?.achievementIds ?? []))}
          ${lauf.ec === 8 ? `<p>Start-Tree laden und EC8 starten. ${schuetze(lauf.tip)} Erst bei vollen Replicanti/RGs den restlichen Tree ohne Respec importieren.</p>` : ""}
          ${PLAN.runBaeumeFuer(lauf, null, profil?.perks ?? []).map(baum => baumMarkup(baum.bezeichnung, baum.importString)).join("")}
        </article>`;
    }).join("");
  }

  /* ---------------- Ansichten ---------------- */

  function zeigeAnsicht(name, { markiereReiter = true } = {}) {
    for (const tafel of document.querySelectorAll(".tafel")) {
      tafel.hidden = tafel.id !== `tafel-${name}`;
    }
    if (!markiereReiter) return;
    for (const reiter of document.querySelectorAll(".reiter")) {
      reiter.setAttribute("aria-selected", String(reiter.dataset.ansicht === name));
    }
  }

  function ausHash() {
    const hash = location.hash.replace("#", "");
    if (!profil) {
      zeigeAnsicht("plan", { markiereReiter: false });
      if (hash) history.replaceState(null, "", `${location.pathname}${location.search}`);
      return;
    }
    if (hash.startsWith("konzept/")) {
      if (zeigeKonzept(hash.slice("konzept/".length))) return;
      melde("Diese Erklärung passt noch nicht zu deinem Spielstand.");
      zeigeAnsicht("konzepte");
      return;
    }
    if (["plan", "konzepte", "runs"].includes(hash)) {
      if (hash === "runs" && knoten.reiterRuns.hidden) {
        melde("Die EC-Laufliste wird erst in der EC-Phase eingeblendet.");
        history.replaceState(null, "", "#plan");
        zeigeAnsicht("plan");
        return;
      }
      zurueckZurUebersicht();
      zeigeAnsicht(hash);
      return;
    }
    zeigeAnsicht("plan");
  }

  /* ---------------- Save ---------------- */

  const FEHLERTEXT = {
    invalid: "Der Text sieht nicht wie ein Antimatter-Dimensions-Export aus. Kopier ihn im Spiel unter Optionen noch einmal vollständig.",
    wrongShape: "Der Save lässt sich lesen, enthält aber keine Spieldaten. Achte darauf, den Export zu nehmen und nicht eine andere Datei.",
    tooLarge: "Die Datei ist größer als 4 MB. So groß wird ein normaler Export nicht.",
    mobileUnsupported: "Das ist ein Save aus der Handy-App. Die haben ein anderes Format, das diese Seite nicht lesen kann.",
    unsupportedVersion: "Dieser Save stammt aus einer Spielversion, die diese Seite nicht kennt.",
    browserUnsupported: "Dein Browser kann den Save nicht entpacken. Probier einen aktuellen Firefox, Chrome oder Safari.",
  };

  function setzeMeldung(text, art = "") {
    knoten.saveMeldung.textContent = text;
    if (art) knoten.saveMeldung.dataset.art = art;
    else delete knoten.saveMeldung.dataset.art;
  }

  async function werteAus(text) {
    if (!text || !text.trim()) {
      setzeMeldung("Füg erst deinen Export ein.", "fehler");
      return;
    }
    setzeMeldung("Wird ausgewertet ...");
    try {
      profil = await ANALYZER.analyze(text.trim());
      importiertAm = new Date().toISOString();
      aktuellerPlan = null;
    } catch (fehler) {
      if (!fehler?.code) console.error("Spielstand konnte nicht ausgewertet werden.", fehler);
      setzeMeldung(FEHLERTEXT[fehler?.code] ?? FEHLERTEXT.invalid, "fehler");
      return;
    }
    try {
      setzeMeldung("");
      zeichnePlan();
      history.replaceState(null, "", "#plan");
      zeigeAnsicht("plan");
      knoten.planBereich.scrollIntoView({ block: "start" });
    } catch {
      setzeMeldung("Der Save wurde gelesen, aber der Walkthrough konnte nicht erstellt werden. Bitte diesen Fehler mit dem Save prüfen lassen.", "fehler");
    }
  }

  async function ausDatei(datei) {
    if (!datei) return;
    try {
      await werteAus(await datei.text());
    } catch {
      setzeMeldung("Die Datei ließ sich nicht lesen.", "fehler");
    }
  }

  /* ---------------- Ereignisse ---------------- */

  function verdrahte() {
    knoten.achievementListe.addEventListener("input", ereignis => {
      const eingabe = ereignis.target;
      if (eingabe.id !== "r143-exponent") return;
      const wert = eingabe.value.trim();
      const exponent = Number(wert);
      const gueltig = /^\d+$/.test(wert) && Number.isSafeInteger(exponent + 311);
      const ausgabe = eingabe.closest(".r143-ziel").querySelector("output");
      ausgabe.textContent = gueltig
        ? `Nächste Eternity: mindestens e${exponent + 311} EP Gewinn im Eternity-Knopf. Danach den tatsächlich erzielten Exponenten hier ersetzen.`
        : wert ? "Bitte nur die ganze Zahl nach dem e eingeben, zum Beispiel 1000."
          : "Trage den Exponenten deiner ersten Eternity ein.";
      eingabe.setAttribute("aria-invalid", String(Boolean(wert) && !gueltig));
    });
    knoten.savePruefen.addEventListener("click", () => werteAus(knoten.saveText.value));
    knoten.saveText.addEventListener("keydown", ereignis => {
      if ((ereignis.ctrlKey || ereignis.metaKey) && ereignis.key === "Enter") {
        werteAus(knoten.saveText.value);
      }
    });
    knoten.saveDatei.addEventListener("change", ereignis => ausDatei(ereignis.target.files?.[0]));

    knoten.saveNeu.addEventListener("click", () => {
      profil = null;
      aktuellerPlan = null;
      importiertAm = null;
      knoten.einstieg.hidden = false;
      knoten.planBereich.hidden = true;
      knoten.navigation.hidden = true;
      knoten.saveNeu.hidden = true;
      knoten.reiterRuns.hidden = true;
      knoten.hinweisBlock.hidden = true;
      knoten.saveText.value = "";
      knoten.saveDatei.value = "";
      setzeMeldung("");
      history.replaceState(null, "", `${location.pathname}${location.search}`);
      zeigeAnsicht("plan", { markiereReiter: false });
      knoten.einstieg.scrollIntoView({ block: "start" });
      knoten.saveText.focus();
    });

    knoten.konzeptZurueck.addEventListener("click", zurueckZurUebersicht);

    knoten.kontextKopieren.addEventListener("click", async () => {
      const text = kontextText();
      if (!text) {
        melde("Lade zuerst einen Save.");
        return;
      }
      await kopiere(text, "Kontext kopiert. Füg ihn in deinen Chat ein und schreib deine Frage darunter.");
    });

    for (const reiter of document.querySelectorAll(".reiter")) {
      reiter.addEventListener("click", () => {
        zurueckZurUebersicht();
        zeigeAnsicht(reiter.dataset.ansicht);
        history.replaceState(null, "", `#${reiter.dataset.ansicht}`);
      });
    }

    document.addEventListener("click", ereignis => {
      const knopf = ereignis.target.closest("[data-kopieren]");
      if (knopf) kopiere(knopf.dataset.kopieren);
    });

    window.addEventListener("hashchange", ausHash);
  }

  verdrahte();
  zeichneKonzeptListe();
  ausHash();

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    });
  }
})();
