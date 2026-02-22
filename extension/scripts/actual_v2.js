/**
 * ============================================================
 * ROLL20 PARTY SCRAPER - Comprehensive Edition
 * For use as a browser extension content script or console paste
 * ============================================================
 *
 * HOW IT WORKS:
 * 1. Finds all characters in the Journal sidebar
 * 2. Clicks each one to open their sheet popup
 * 3. Waits for the iframe to load
 * 4. Scrapes inputs, selects, textareas AND named spans (Roll20 uses both)
 * 5. Parses repeating sections (inventory, spells, attacks, features, traits)
 * 6. Stores everything in window.__partyData
 * 7. When all characters are done, calls window.__onPartyDataReady(data)
 *    — hook this to send data to your website
 * ============================================================
 */

(function () {
  // ── CONFIG ──────────────────────────────────────────────────
  const IFRAME_POLL_INTERVAL_MS = 800;
  const IFRAME_POLL_MAX_ATTEMPTS = 30; // ~24 seconds
  const DELAY_BETWEEN_CHARS_MS = 1500; // gap between opening sheets
  const MIN_INPUTS_TO_CONSIDER_LOADED = 15;

  // ── STORAGE ─────────────────────────────────────────────────
  window.__partyData = {};

  // ── UTILITY: strip attr_ prefix ─────────────────────────────
  const clean = (name) => name.replace(/^attr_/, "");

  // ── CORE: scrape a raw flat key→value map from iframe doc ───
  const scrapeRawAttributes = (iframeDoc) => {
    const results = {};

    // 1. Standard form inputs / selects / textareas
    iframeDoc.querySelectorAll("input, select, textarea").forEach((el) => {
      const name = el.getAttribute("name");
      if (!name) return;
      const key = clean(name);

      if (el.type === "checkbox" || el.type === "radio") {
        // Only record checked state
        if (el.checked) results[key] = el.value || "1";
      } else {
        if (el.value && el.value.trim()) results[key] = el.value.trim();
      }
    });

    // 2. Named SPANS — Roll20 sheets display many read-only values this way
    iframeDoc
      .querySelectorAll("span[name], div[name], data[name]")
      .forEach((el) => {
        const name = el.getAttribute("name");
        if (!name) return;
        const key = clean(name);
        const text = el.innerText?.trim() || el.textContent?.trim();
        if (text && !results[key]) results[key] = text; // don't overwrite input values
      });

    return results;
  };

  // ── CORE: parse repeating section entries from the repcontainers ──
  const scrapeRepeatingSection = (iframeDoc, groupName) => {
    const container = iframeDoc.querySelector(
      `.repcontainer[data-groupname="${groupName}"]`,
    );
    if (!container) return [];

    const entries = [];
    // Each direct child div of repcontainer is one repeating row
    container.querySelectorAll(":scope > div").forEach((row) => {
      const entry = {};
      row.querySelectorAll("input, select, textarea").forEach((el) => {
        const name = el.getAttribute("name");
        if (!name) return;
        // Repeating names look like: attr_repeating_inventory_-ABC123_itemname
        const match = name.match(/attr_repeating_[^_]+_[^_]+_(.+)/);
        const key = match ? match[1] : clean(name);
        if (el.type === "checkbox") {
          entry[key] = el.checked ? "1" : "0";
        } else if (el.value?.trim()) {
          entry[key] = el.value.trim();
        }
      });
      row.querySelectorAll("span[name], div[name]").forEach((el) => {
        const name = el.getAttribute("name");
        if (!name) return;
        const match = name.match(/attr_repeating_[^_]+_[^_]+_(.+)/);
        const key = match ? match[1] : clean(name);
        const text = el.innerText?.trim() || el.textContent?.trim();
        if (text && !entry[key]) entry[key] = text;
      });
      if (Object.keys(entry).length > 0) entries.push(entry);
    });
    return entries;
  };

  // ── CORE: build structured character object from raw data ────
  const buildCharacterObject = (raw, iframeDoc) => {
    // Helper: grab with fallback
    const g = (key, fallback = "") => raw[key] ?? fallback;

    // ── BASIC INFO ──
    const info = {
      name: g("character_name"),
      race: g("race"),
      background: g("background"),
      alignment: g("alignment"),
      class: g("class_display"), // <-- TODO: check if this works
      level: g("level"),
      experience: g("experience"),
      player_name: g("player_name"),
    };

    // ── ABILITY SCORES ──
    const abilities = {
      strength: { score: g("strength"), modifier: g("strength_mod") },
      dexterity: { score: g("dexterity"), modifier: g("dexterity_mod") },
      constitution: {
        score: g("constitution"),
        modifier: g("constitution_mod"),
      },
      intelligence: {
        score: g("intelligence"),
        modifier: g("intelligence_mod"),
      },
      wisdom: { score: g("wisdom"), modifier: g("wisdom_mod") },
      charisma: { score: g("charisma"), modifier: g("charisma_mod") },
    };

    // ── COMBAT ──
    const combat = {
      ac: g("ac"),
      initiative: g("initiative_bonus"),
      speed: g("speed"),
      hp_current: g("hp"),
      hp_max: g("hp_max"),
      hp_temp: g("hp_temp"),
      hit_dice: g("hit_dice"),
      hit_dice_used: g("hit_dice_used"),
      death_saves_success: g("death_saves_success_value"),
      death_saves_fail: g("death_saves_fail_value"),
      inspiration: g("inspiration"),
    };

    // ── PROFICIENCY & SAVES ──
    const proficiency = {
      bonus: g("pb"),
      passive_perception: g("passive_wisdom"),
      saving_throw_str: g("strength_save_bonus"),
      saving_throw_dex: g("dexterity_save_bonus"),
      saving_throw_con: g("constitution_save_bonus"),
      saving_throw_int: g("intelligence_save_bonus"),
      saving_throw_wis: g("wisdom_save_bonus"),
      saving_throw_cha: g("charisma_save_bonus"),
    };

    // ── SKILLS ──
    const skills = {};
    const skillNames = [
      "acrobatics",
      "animal_handling",
      "arcana",
      "athletics",
      "deception",
      "history",
      "insight",
      "intimidation",
      "investigation",
      "medicine",
      "nature",
      "perception",
      "performance",
      "persuasion",
      "religion",
      "sleight_of_hand",
      "stealth",
      "survival",
    ];
    skillNames.forEach((s) => {
      skills[s] = {
        bonus: g(s + "_bonus"),
        prof: !((g(s + "_prof") || g(s + "_type")) == "1"),
      };
    });

    // ── CURRENCY & CARRYING ──
    const currency = {
      cp: g("cp"),
      sp: g("sp"),
      ep: g("ep"),
      gp: g("gp"),
      pp: g("pp"),
    };

    // ── SPELLCASTING ──
    const spellcasting = {
      ability: g("spellcasting_ability"),
      save_dc: g("spell_save_dc"),
      attack: g("spell_attack_bonus"),
      slots: {},
    };
    for (let lvl = 1; lvl <= 9; lvl++) {
      spellcasting.slots[`level_${lvl}`] = {
        total: g(`spell_slots_l${lvl}`),
        used: g(`spell_slots_expended_l${lvl}`),
      };
    }

    // ── REPEATING SECTIONS ──

    // Attacks / Actions
    const attacks = scrapeRepeatingSection(iframeDoc, "repeating_attack").map(
      (a) => ({
        name: a.atkname,
        range: a.atkrange,
        attack_bonus: a.atkbonus,
        damage: a.dmgbase_die,
        damage_type: a.dmgtype,
        damage_bonus: a.dmgbonus,
        crit_damage: a.dmgbase_die_crit,
        notes: a.atknotes,
      }),
    );

    // Inventory
    const inventory = scrapeRepeatingSection(
      iframeDoc,
      "repeating_inventory",
    ).map((i) => ({
      name: i.itemname,
      count: i.itemcount,
      weight: i.itemweight,
      properties: i.itemproperties,
      equipped: i.equipped,
      description: i.itemcontent,
    }));

    // Spells by level
    const spells = {};
    for (let lvl = 0; lvl <= 9; lvl++) {
      const group =
        lvl === 0 ? "repeating_spell-cantrip" : `repeating_spell-${lvl}`;
      const label = lvl === 0 ? "cantrips" : `level_${lvl}`;
      const raw_spells = scrapeRepeatingSection(iframeDoc, group);
      if (raw_spells.length > 0) {
        spells[label] = raw_spells.map((s) => ({
          name: s.spellname,
          level: s.spelllevel,
          school: s.spellschool,
          casting_time: s.spellcastingtime,
          range: s.spellrange,
          target: s.spelltarget,
          duration: s.spellduration,
          components: [
            s.spellcomp_v === "1" ? "V" : null,
            s.spellcomp_s === "1" ? "S" : null,
            s.spellcomp_m === "1" ? "M" : null,
          ]
            .filter(Boolean)
            .join(", "),
          materials: s.spellcomp_materials,
          ritual: s.spellritual === "1",
          concentration: s.spellconcentration === "1",
          prepared: s.spellprepared === "1",
          description: s.spelldescription,
          higher_levels: s.spellathigherlevels,
          attack_bonus: s.spellattack,
          save_dc: s.spellsave,
          damage: s.spelldmg,
          damage_type: s.spelldmgtype,
        }));
      }
    }

    // Features & Traits
    const allTraits = (() => {
      const container = iframeDoc.querySelector(
        '.repcontainer[data-groupname="repeating_traits"]',
      );
      if (!container) return [];
      return Array.from(container.querySelectorAll(".repitem"))
        .map((item) => {
          const displayEl = item.querySelector(".display");
          if (!displayEl) return null;
          return {
            name:
              displayEl
                .querySelector('span[name="attr_name"]')
                ?.innerText?.trim() || "",
            source:
              displayEl
                .querySelector('span[name="attr_source"]')
                ?.innerText?.trim() || "",
            source_type:
              displayEl
                .querySelector('span[name="attr_source_type"]')
                ?.innerText?.trim() || "",
            description:
              displayEl
                .querySelector('span[name="attr_description"]')
                ?.innerText?.trim() || "",
          };
        })
        .filter((t) => t && t.name);
    })();

    // Split traits by source category for convenience
    const traits = {
      all: allTraits,
      racial: allTraits.filter((t) => t.source === "Racial"),
      class: allTraits.filter((t) => t.source === "Class"),
      feat: allTraits.filter((t) => t.source === "Feat"),
      background: allTraits.filter((t) => t.source === "Background"),
      item: allTraits.filter((t) => t.source === "Item"),
      other: allTraits.filter((t) => t.source === "Other"),
    };

    // Proficiencies & Languages
    // Tool Proficiencies — repeating_tool, data in .display > button spans
    const toolProfs = (() => {
      const container = iframeDoc.querySelector(
        '.repcontainer[data-groupname="repeating_tool"]',
      );
      if (!container) return [];
      return Array.from(container.querySelectorAll(".repitem"))
        .map((item) => {
          const btn = item.querySelector(".display button");
          if (!btn) return null;
          return {
            name:
              btn
                .querySelector('span[name="attr_toolname"]')
                ?.innerText?.trim() || "",
            bonus:
              btn
                .querySelector('input[name="attr_toolbonus_display"]')
                ?.value?.trim() || "",
          };
        })
        .filter((t) => t && t.name);
    })();

    // Proficiencies & Languages — repeating_proficiencies, data in .display > button spans
    const allProfs = (() => {
      const container = iframeDoc.querySelector(
        '.repcontainer[data-groupname="repeating_proficiencies"]',
      );
      if (!container) return [];
      return Array.from(container.querySelectorAll(".repitem"))
        .map((item) => {
          const btn = item.querySelector(".display button");
          if (!btn) return null;
          return {
            type:
              btn
                .querySelector('span[name="attr_prof_type"]')
                ?.innerText?.trim() || "",
            name:
              btn.querySelector('span[name="attr_name"]')?.innerText?.trim() ||
              "",
          };
        })
        .filter((p) => p && p.name);
    })();

    const other_profs = {
      tools: toolProfs,
      languages: allProfs
        .filter((p) => p.type === "LANGUAGE")
        .map((p) => p.name),
      armor: allProfs.filter((p) => p.type === "ARMOR").map((p) => p.name),
      weapons: allProfs.filter((p) => p.type === "WEAPON").map((p) => p.name),
      other: allProfs.filter((p) => p.type === "OTHER").map((p) => p.name),
    };

    // Personality (Bio & Info tab values stored as attrs)
    const personality = {
      traits: g("personality_traits"),
      ideals: g("ideals"),
      bonds: g("bonds"),
      flaws: g("flaws"),
      appearance: g("appearance"),
    };

    return {
      info,
      abilities,
      combat,
      proficiency,
      skills,
      currency,
      spellcasting,
      attacks,
      inventory,
      spells,
      traits,
      other_profs,
      personality,
      // raw: raw  // ← Uncomment during debugging to see everything
    };
  };

  // ── WATCHER: poll until iframe is populated ──────────────────
  const waitForIframeAndScrape = (charId, charName, onDone) => {
    let attempts = 0;
    console.log(`⏳ [${charName}] Waiting for iframe...`);

    const poll = setInterval(() => {
      attempts++;
      const iframe = document.querySelector(`iframe[name="iframe_${charId}"]`);

      if (iframe) {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        const inputCount = doc?.querySelectorAll("input").length ?? 0;

        if (doc && inputCount >= MIN_INPUTS_TO_CONSIDER_LOADED) {
          clearInterval(poll);
          console.log(
            `✅ [${charName}] Iframe ready (${inputCount} inputs). Scraping...`,
          );
          try {
            const raw = scrapeRawAttributes(doc);
            const structured = buildCharacterObject(raw, doc);
            window.__partyData[charId] = { charId, charName, ...structured };
            console.log(`📦 [${charName}] Done.`, structured);
          } catch (err) {
            console.error(`❌ [${charName}] Error during scrape:`, err);
          }
          onDone();
          return;
        }
      }

      if (attempts >= IFRAME_POLL_MAX_ATTEMPTS) {
        clearInterval(poll);
        console.warn(`⏰ [${charName}] Timed out waiting for iframe.`);
        onDone(); // still continue to next char
      }
    }, IFRAME_POLL_INTERVAL_MS);
  };

  // ── HANDLER: open character sheet and trigger scrape ─────────
  const openAndScrapeCharacter = (charEl, onDone) => {
    const charId = charEl.getAttribute("data-itemid");
    const nameEl = charEl.querySelector(".namecontainer");
    const charName = nameEl?.innerText?.trim() || charId;

    console.log(`🖱️ Opening sheet for: ${charName}`);
    if (nameEl) nameEl.click();

    // Small delay before polling to allow popup + iframe to begin loading
    setTimeout(() => {
      waitForIframeAndScrape(charId, charName, onDone);
    }, 500);
  };

  // ── MAIN: scrape all characters sequentially ─────────────────
  const scrapeAllCharacters = () => {
    // Get the list of playable character IDs from the "Speaking As" dropdown
    const select = document.getElementById("speakingas");
    if (!select) {
      console.warn("⚠️ Could not find #speakingas dropdown.");
      return;
    }

    const playableIds = new Set(
      Array.from(select.options)
        .filter((opt) => opt.value.startsWith("character|"))
        .map((opt) => opt.value.split("|")[1]),
    );

    if (playableIds.size === 0) {
      console.warn("⚠️ No playable characters found in Speaking As dropdown.");
      return;
    }

    console.log(`🎭 Playable character IDs from Speaking As:`, [
      ...playableIds,
    ]);

    // Filter journal items to only those in the playable list
    const allCharEls = Array.from(
      document.querySelectorAll(".journalitem.character"),
    ).filter((el) => playableIds.has(el.getAttribute("data-itemid")));

    if (allCharEls.length === 0) {
      console.warn(
        "⚠️ No matching journal items found. Is the Journal tab open?",
      );
      return;
    }

    console.log(
      `🎲 Found ${allCharEls.length} playable character(s). Starting sequential scrape...`,
    );
    let index = 0;

    const next = () => {
      if (index >= allCharEls.length) {
        console.log("🏁 All characters scraped!");
        console.log("📊 Full Party Data:", window.__partyData);

        // ── HOOK: Send data to your website ────────────────────
        // Option A: PostMessage (if your site is in another tab)
        // window.opener?.postMessage({ type: "PARTY_DATA", data: window.__partyData }, "*");

        // Option B: Fetch to your local server / backend
        // fetch("http://localhost:3000/party", {
        //   method: "POST",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify(window.__partyData),
        // });

        // Option C: Copy to clipboard for manual paste
        try {
          const json = JSON.stringify(window.__partyData, null, 2);
          navigator.clipboard.writeText(json).then(() => {
            console.log(
              "📋 Party data copied to clipboard! Paste into your site.",
            );
          });
        } catch (e) {
          console.warn(
            "Clipboard write failed — access window.__partyData directly.",
          );
        }

        // Option D: Custom callback
        if (typeof window.__onPartyDataReady === "function") {
          window.__onPartyDataReady(window.__partyData);
        }
        return;
      }

      openAndScrapeCharacter(allCharEls[index], () => {
        index++;
        setTimeout(next, DELAY_BETWEEN_CHARS_MS);
      });
    };

    next();
  };

  // ── ENTRY POINT: watch for Journal tab click ─────────────────
  const init = () => {
    const tabMenu = document.querySelector(".tabmenu");
    if (!tabMenu) {
      setTimeout(init, 1000);
      return;
    }

    tabMenu.addEventListener("click", (e) => {
      if (e.target.closest('li[aria-controls="journal"]')) {
        // Wait for journal list to render
        setTimeout(scrapeAllCharacters, 700);
      }
    });

    // Also expose a manual trigger so you can call it from the console anytime:
    window.__scrapeParty = scrapeAllCharacters;

    console.log(
      "✅ Roll20 Party Scraper loaded!\n" +
        "• Click the Journal tab to auto-trigger\n" +
        "• Or run: window.__scrapeParty() in console\n" +
        "• Data lands in: window.__partyData",
    );
  };

  init();
})();
