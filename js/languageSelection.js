// languageSelection.js

// Function to populate language selection dropdown
async function populateLanguageSelection() {
  const languageSelect = document.getElementById("languageSelect");
  const supportedLanguages = await getSupportedLanguages();

  if (supportedLanguages) {
    // Clear existing options
    languageSelect.innerHTML = "";

    // Populate language selection dropdown
    supportedLanguages.forEach((language) => {
      const option = document.createElement("option");
      option.value = language.code;
      option.textContent = language.name;
      languageSelect.appendChild(option);
    });
  }
}

// Initialize language selection dropdown
populateLanguageSelection();
