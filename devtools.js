chrome.devtools.panels.create(
  "Response Search",   // Tab title
  "",                  // Icon (optional)
  "panel.html",        // HTML file for the panel
  function(panel) {
    console.log("Panel created");
  }
);