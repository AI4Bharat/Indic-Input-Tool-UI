const API_URL =
  "https://api.dhruva.ai4bharat.org/services/inference/transliteration";
const AUTH_TOKEN =
  "EAMe0BjX5OSO_Rw5BDQZKmhzW1kdXDOZM9eEKYrumLIMlCCHzrUllMn5UU9SZmHa";

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
        targetLanguage: outputLang,
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
    method: "post",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AUTH_TOKEN}`,
    },
  });

  const responseData = await response.json();

  if (responseData && responseData.output && responseData.output.length > 0) {
    return responseData.output[0].target;
  } else {
    console.error("Error in transliteration API response format");
    return null; // or handle the error in your own way
  }
}

async function getSupportedLanguages() {
  let response = await fetch(LANGS_API, {
    credentials: "include", // To allow CORS cookies
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
  xmlhttp = new XMLHttpRequest();
  xmlhttp.open("POST", LEARN_API, true);
  xmlhttp.withCredentials = true;
  xmlhttp.onreadystatechange = function () {
    if (xmlhttp.readyState == 4) {
      if (xmlhttp.status != 200) {
        console.log(
          "ERROR: Failed to recordUserSelection(). Status: " + xmlhttp.status
        );
      }
    }
  };
  xmlhttp.setRequestHeader("Content-type", "application/json");
  xmlhttp.send(JSON.stringify(data));
}
