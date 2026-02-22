/**
 * 1. THE DEEP SCRAPER: Reaches inside the Iframe content
 */
const scrapeIframeData = (charId) => {
  // Target the iframe by its specific name attribute provided in your HTML
  const iframe = document.querySelector(`iframe[name="iframe_${charId}"]`);

  if (!iframe) {
    console.error(`❌ Iframe for ${charId} not found.`);
    return;
  }

  // Access the internal document of the iframe
  const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

  if (!iframeDoc) {
    console.error(
      "❌ Cannot access Iframe content. This usually happens if the sheet isn't fully ready.",
    );
    return;
  }

  const results = {};
  // Query all inputs specifically INSIDE the iframe
  const inputs = iframeDoc.querySelectorAll("input, select, textarea");

  inputs.forEach((input) => {
    const name = input.getAttribute("name");
    const val = input.value;
    if (name && val) {
      // Clean 'attr_strength' to 'strength'
      const cleanName = name.replace("attr_", "");
      results[cleanName] = val;
    }
  });

  console.group(
    `📊 Scraped Iframe Result: ${results["character_name"] || charId}`,
  );
  console.log("Stats:", {
    STR: results["strength"],
    DEX: results["dexterity"],
    CON: results["constitution"],
  });

  // Filter for inventory items using the 'itemname' key
  const items = Object.keys(results)
    .filter((k) => k.includes("itemname"))
    .map((k) => results[k]);

  console.log("Inventory Items:", items);
  console.groupEnd();
};

/**
 * 2. THE WATCHER: Waits for the Iframe to exist and populate
 */
const monitorIframeLoading = (charId) => {
  console.log(`⏳ Waiting for Iframe (ID: ${charId}) to populate...`);
  let attempts = 0;

  const check = setInterval(() => {
    attempts++;
    const iframe = document.querySelector(`iframe[name="iframe_${charId}"]`);

    if (iframe) {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      // Check if the internal iframe document has rendered its inputs yet
      if (iframeDoc && iframeDoc.querySelectorAll("input").length > 10) {
        clearInterval(check);
        console.log("✨ Iframe content detected! Beginning scrape...");
        scrapeIframeData(charId);
      }
    }

    if (attempts > 20) {
      clearInterval(check);
      console.warn("⏳ Timeout: Character sheet iframe took too long to load.");
    }
  }, 1000);
};

/**
 * 3. THE HANDLER: Logic triggered when Journal Tab is clicked
 */
const handleJournalOpen = () => {
  // 1. Get IDs from the "Speaking As" list for validation
  const select = document.getElementById("speakingas");
  if (!select) return;

  const availableIds = Array.from(select.options)
    .filter((opt) => opt.value.startsWith("character|"))
    .map((opt) => opt.value.split("|")[1]);

  console.log(
    "📂 Journal Tab detected. Cross-referencing with Speaking As list...",
  );

  // 2. Find all journal items in the sidebar
  const journalItems = document.querySelectorAll(".journalitem.character");

  journalItems.forEach((char) => {
    const charId = char.getAttribute("data-itemid");
    const nameContainer = char.querySelector(".namecontainer");
    const charName = nameContainer ? nameContainer.innerText.trim() : "Unknown";

    // 3. Only process if the ID is in our 'Speaking As' list AND it's our test target
    if (availableIds.includes(charId) && charName === "Laksa") {
      console.log(`🖱️ Clicking ${charName} (ID: ${charId})...`);

      // Click the sidebar name container to trigger the UI popup
      if (nameContainer) nameContainer.click();

      // Start monitoring the resulting popup's iframe
      monitorIframeLoading(charId);
    }
  });
};

/**
 * 4. THE CORE: Main Listener
 */
const init = () => {
  const tabMenu = document.querySelector(".tabmenu");

  if (tabMenu) {
    tabMenu.addEventListener("click", (event) => {
      const isJournal = event.target.closest('li[aria-controls="journal"]');
      if (isJournal) {
        // Delay slightly to allow the Journal sidebar list to render
        setTimeout(handleJournalOpen, 600);
      }
    });
    console.log(
      "✅ Iframe-Aware Scraper Loaded. Click the Journal tab to test.",
    );
  } else {
    setTimeout(init, 1000);
  }
};

// Fire it up
init();
