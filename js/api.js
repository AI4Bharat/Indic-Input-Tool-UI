const API_URL =
  "https://api.dhruva.ai4bharat.org/services/inference/transliteration";
const LANGS_API = API_URL + "/languages";
const LEARN_API = API_URL + "/learn";

async function getTransliterationSuggestions(lang, searchTerm) {
  if (searchTerm == "." || searchTerm == "..") {
    searchTerm = " " + searchTerm;
  }
  searchTerm = encodeURIComponent(searchTerm);

  const url = `${API_URL}/tl/${lang}/${searchTerm}`;
  let response = await fetch(url, {
    credentials: "include",
  });
  let data = await response.json();
  return data;
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
        sourceLanguage: "en",
        sourceScriptCode: "",
        targetLanguage: "hi",
        targetScriptCode: "",
      },
      isSentence: true,
      numSuggestions: 5,
    },
    controlConfig: {
      dataTracking: true,
    },
  };

  const outputData = await fetch(API_URL, {
    method: "post",
    body: JSON.stringify(data),
    headers: new Headers({
      "Content-Type": "application/json",
    }),
  }).then((response) => response.json());
  return outputData["output"][0]["target"];
}

async function getSupportedLanguages() {
  let response = await fetch(LANGS_API, {
    credentials: "include",
  });
  let data = await response.json();
  return data;
}

async function recordUserSelection(lang, input, output, id) {
  if (id < 0) return;
  const data = {
    lang: lang,
    input: input,
    output: output,
    topk_index: id,
  };
  fetch(LEARN_API, {
    method: "post",
    body: JSON.stringify(data),
    headers: new Headers({
      "Content-Type": "application/json",
    }),
    credentials: "include",
  }).then((response) => {
    if (response.status !== 200) {
      console.log(
        "ERROR: Failed to recordUserSelection(). Status: " + response.status
      );
    }
  });
}
