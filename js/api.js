const API_URL =
  "https://api.dhruva.ai4bharat.org/services/inference/transliteration";
const AUTHORIZATION_HEADER =
  "EAMe0BjX5OSO_Rw5BDQZKmhzW1kdXDOZM9eEKYrumLIMlCCHzrUllMn5UU9SZmHa";

async function getTransliterationSuggestions(lang, searchTerm) {
  if (searchTerm == "." || searchTerm == "..") {
    searchTerm = " " + searchTerm;
  }

  const data = {
    input: [
      {
        source: searchTerm,
      },
    ],
    config: {
      serviceId: "ai4bharat/indicxlit--cpu-fsv2",
      language: {
        sourceLanguage: lang,
      },
      taskType: "transliteration",
    },
  };

  try {
    const response = await fetch(API_URL, {
      method: "post",
      body: JSON.stringify(data),
      headers: new Headers({
        "Content-Type": "application/json",
        Authorization: AUTHORIZATION_HEADER,
      }),
    });

    if (!response.ok) {
      throw new Error(`Request failed with status: ${response.status}`);
    }

    const responseData = await response.json();
    return responseData.output[0].target;
  } catch (error) {
    console.error("Error fetching transliteration suggestions:", error.message);
    return [];
  }
}

async function getTransliterationForWholeText(inputLang, outputLang, text) {
  const data = {
    input: [
      {
        source: text,
      },
    ],
    config: {
      isSentence: true,
      language: {
        sourceLanguage: inputLang,
        targetLanguage: outputLang,
      },
    },
  };

  try {
    const response = await fetch(API_URL, {
      method: "post",
      body: JSON.stringify(data),
      headers: new Headers({
        "Content-Type": "application/json",
        Authorization: AUTHORIZATION_HEADER,
      }),
    });

    if (!response.ok) {
      throw new Error(`Request failed with status: ${response.status}`);
    }

    const outputData = await response.json();
    return outputData.output[0].target;
  } catch (error) {
    console.error(
      "Error fetching transliteration for whole text:",
      error.message
    );
    return "";
  }
}

async function getSupportedLanguages() {
  try {
    const response = await fetch(LANGS_API, {
      credentials: "include", // To allow CORS cookies
    });

    if (!response.ok) {
      throw new Error(`Request failed with status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Received data:", data); // Add this line for debugging
    return data;
  } catch (error) {
    console.error("Error fetching supported languages:", error.message);
    return [];
  }
}


async function recordUserSelection(lang, input, output, id) {
  if (id < 0) return;

  const data = {
    lang: lang,
    input: input,
    output: output,
    topk_index: id,
  };

  try {
    const xmlhttp = new XMLHttpRequest();
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
  } catch (error) {
    console.error("Error recording user selection:", error.message);
  }
}
