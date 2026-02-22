/**
 * HELPER FUNCTIONS
 */

// 1. Grabs IDs and names, cleaning up the 'character|' prefix
const getAvailableCharacters = () => {
  const select = document.getElementById("speakingas");
  if (!select) return [];

  return Array.from(select.options)
    .filter((opt) => opt.value.startsWith("character|")) // Only get characters, ignore 'player|'
    .map((opt) => ({
      name: opt.text,
      id: opt.value.split("|")[1], // Just the raw ID: -OYLNSTuq...
    }));
};

// 2. The Logic to run when the Journal is clicked
const handleJournalOpen = () => {
  const characters = getAvailableCharacters();
  console.log("📂 Journal Accessed. Found Characters:", characters);

  // You can now use these IDs to do something cool
  if (characters.length > 0) {
    alert(`Found ${characters.length} characters in your 'Speaking As' list!`);
  }
};

/**
 * CORE EXECUTION
 */

const init = () => {
  const tabMenu = document.querySelector(".tabmenu");

  if (tabMenu) {
    tabMenu.addEventListener("click", (event) => {
      const isJournal = event.target.closest('li[aria-controls="journal"]');
      if (isJournal) {
        handleJournalOpen();
      }
    });
    console.log("✅ Roll20 Listener Loaded.");
  } else {
    // Roll20 is slow; if the menu isn't there, wait 1 second and try again
    setTimeout(init, 1000);
  }
};

// Fire it up
init();
