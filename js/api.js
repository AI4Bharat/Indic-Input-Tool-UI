const API_URL =
  "https://api.dhruva.ai4bharat.org/services/inference/transliteration";

async function getTransliterationSuggestions(lang, searchTerm) {
  const data = {
    input: [
      {
        source: searchTerm,
      },
    ],
    config: {
      serviceId: "ai4bharat/indicxlit--cpu-fsv2",
      language: {
        sourceLanguage: "en",
        sourceScriptCode: "",
        targetLanguage: lang,
        targetScriptCode: "",
      },
      isSentence: true,
      numSuggestions: 5,
    },
    controlConfig: {
      dataTracking: true,
    },
  };

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const responseData = await response.json();
  if (responseData.taskType !== "transliteration") {
    throw new Error("Invalid response from API");
  }

  return responseData.output[0].target;
}

async function getTransliterationForWholeText(inputLang, outputLang, text) {
  const data = {
    input: [
      {
        source: text,
      },
    ],
    config: {
      serviceId: "ai4bharat/indicxlit--cpu-fsv2",
      language: {
        sourceLanguage: inputLang,
        sourceScriptCode: "",
        targetLanguage: outputLang,
        targetScriptCode: "",
      },
      isSentence: true,
      numSuggestions: 1,
    },
    controlConfig: {
      dataTracking: true,
    },
  };

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const responseData = await response.json();
  if (responseData.taskType !== "transliteration") {
    throw new Error("Invalid response from API");
  }

  return responseData.output[0].target;
}

async function getSupportedLanguages() {
  // Fetch supported languages from the API
  const response = await fetch(
    "https://api.dhruva.ai4bharat.org/services/metadata",
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  const responseData = await response.json();
  if (!responseData.services) {
    throw new Error("Invalid response from API");
  }

  const supportedLanguages = [];
  for (const service of responseData.services) {
    if (service.name === "ai4bharat/indicxlit--cpu-fsv2") {
      for (const supportedTarget of service.config.supportedTargets) {
        supportedLanguages.push(supportedTarget.targetLanguageCode);
      }
    }
  }

  return supportedLanguages;
}

async function recordUserSelection(lang, input, output, id) {
  // Record user selection with the new API
  const data = {
    input: input,
    output: output,
    topkIndex: id,
    language: lang,
  };

  const response = await fetch(
    "https://api.dhruva.ai4bharat.org/services/inference/userFeedback",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to record user selection");
  }
}
