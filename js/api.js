const API_URL = "//xlit-api.ai4bharat.org";
const LANGS_API = API_URL + "/languages";
const LEARN_API = API_URL + "/learn";
const TRANSLITERATE_API = https://api.dhruva.ai4bharat.org/services/inference/transliteration; // Use API_URL directly

async function getTransliterationSuggestions(lang, searchTerm) {
  if (searchTerm == '.' || searchTerm == '..') {
    searchTerm = ' ' + searchTerm;
  }
  searchTerm = encodeURIComponent(searchTerm);

  const data = {
    "input": [
      {
        "source": searchTerm
      }
    ],
    "config": {
      "serviceId": "ai4bharat/indicxlit--cpu-fsv2",
      "language": {
        "sourceLanguage": "en",
        "sourceScriptCode": "",
        "targetLanguage": lang,
        "targetScriptCode": ""
      },
      "isSentence": false,
      "numSuggestions": 5
    },
    "controlConfig": {
      "dataTracking": true
    }
  };

  const outputData = await fetch(TRANSLITERATE_API, {
    method: 'post',
    body: JSON.stringify(data),
    mode: 'cors',
    headers: new Headers({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.API_KEY}`
    })
  })
    .then(response => response.json());

  return outputData["output"][0];
}

async function getTransliterationForWholeText(inputLang, outputLang, text) {
  const data = {
    "input": [
      {
        "source": text
      }
    ],
    "config": {
      "serviceId": "ai4bharat/indicxlit--cpu-fsv2",
      "language": {
        "sourceLanguage": inputLang,
        "sourceScriptCode": "",
        "targetLanguage": outputLang,
        "targetScriptCode": ""
      },
      "isSentence": true,
      "numSuggestions": 5
    },
    "controlConfig": {
      "dataTracking": true
    }
  };

  const outputData = await fetch(TRANSLITERATE_API, {
    method: 'post',
    body: JSON.stringify(data),
    mode: 'cors',
    headers: new Headers({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.API_KEY}`
    })
  })
    .then(response => response.json());
  return outputData["output"][0]["target"];
}

async function getSupportedLanguages() {
  let response = await fetch(LANGS_API, {
    credentials: 'include' // To allow CORS cookies
  });
  let data = await response.json();
  return data;
}

async function recordUserSelection(lang, input, output, id) {
  if (id < 0)
    return;
  const data = {
    "lang": lang,
    "input": input,
    "output": output,
    "topk_index": id
  };

  // Using fetch instead of XMLHttpRequest
  await fetch(LEARN_API, {
    method: 'post',
    body: JSON.stringify(data),
    mode: 'cors',
    headers: new Headers({
      'Content-Type': 'application/json'
    })
  })
    .then(response => {
      if (response.status !== 200) {
        console.log("ERROR: Failed to recordUserSelection(). Status: " + response.status);
      }
    });
}
