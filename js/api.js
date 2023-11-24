const API_URL = "//xlit-api.ai4bharat.org";
const LANGS_API = API_URL + "/languages";
const LEARN_API = API_URL + "/learn";
const TRANSLITERATE_API = "https://api.dhruva.ai4bharat.org/services/inference/transliteration";

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
      'Authorization': 'EAMe0BjX5OSO_Rw5BDQZKmhzW1kdXDOZM9eEKYrumLIMlCCHzrUllMn5UU9SZmHa'
    })
  })
  .then(response => response.json());
  return outputData["output"][0]["target"];
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
      'Authorization': 'EAMe0BjX5OSO_Rw5BDQZKmhzW1kdXDOZM9eEKYrumLIMlCCHzrUllMn5UU9SZmHa'
    })
  })
  .then(response => response.json());
  return outputData["output"][0]["target"];
}

async function getSupportedLanguages() {
  let data = [{"Author":"AI4Bharat","CompiledDate":"09-April-2022","Direction":"ltr","DisplayName":"Assamese - অসমীয়া","FallbackFont":null,"GoogleFont":null,"Identifier":"as","IsStable":true,"LangCode":"as","ScriptCode":"Beng"},{"Author":"AI4Bharat","CompiledDate":"09-April-2022","Direction":"ltr","DisplayName":"Bangla - বাংলা","FallbackFont":null,"GoogleFont":null,"Identifier":"bn","IsStable":true,"LangCode":"bn","ScriptCode":"Beng"},{"Author":"AI4Bharat","CompiledDate":"09-April-2022","Direction":"ltr","DisplayName":"Boro - बड़ो","FallbackFont":null,"GoogleFont":null,"Identifier":"brx","IsStable":true,"LangCode":"brx","ScriptCode":"Deva"},{"Author":"AI4Bharat","CompiledDate":"09-April-2022","Direction":"ltr","DisplayName":"Goan Konkani - कोंकणी","FallbackFont":"serif","GoogleFont":"Tiro Devanagari Marathi","Identifier":"gom","IsStable":true,"LangCode":"gom","ScriptCode":"Deva"},{"Author":"AI4Bharat","CompiledDate":"09-April-2022","Direction":"ltr","DisplayName":"Gujarati - ગુજરાતી","FallbackFont":null,"GoogleFont":null,"Identifier":"gu","IsStable":true,"LangCode":"gu","ScriptCode":"Gujr"},{"Author":"AI4Bharat","CompiledDate":"09-April-2022","Direction":"ltr","DisplayName":"Hindi - हिंदी","FallbackFont":null,"GoogleFont":null,"Identifier":"hi","IsStable":true,"LangCode":"hi","ScriptCode":"Deva"},{"Author":"AI4Bharat","CompiledDate":"09-April-2022","Direction":"ltr","DisplayName":"Kannada - ಕನ್ನಡ","FallbackFont":null,"GoogleFont":null,"Identifier":"kn","IsStable":true,"LangCode":"kn","ScriptCode":"Knda"},{"Author":"AI4Bharat","CompiledDate":"09-April-2022","Direction":"rtl","DisplayName":"Kashmiri - كٲشُر","FallbackFont":"serif","GoogleFont":"Noto Nastaliq Urdu","Identifier":"ks","IsStable":true,"LangCode":"ks","ScriptCode":"Aran"},{"Author":"AI4Bharat","CompiledDate":"09-April-2022","Direction":"ltr","DisplayName":"Maithili - मैथिली","FallbackFont":null,"GoogleFont":null,"Identifier":"mai","IsStable":true,"LangCode":"mai","ScriptCode":"Deva"},{"Author":"AI4Bharat","CompiledDate":"09-April-2022","Direction":"ltr","DisplayName":"Malayalam - മലയാളം","FallbackFont":null,"GoogleFont":null,"Identifier":"ml","IsStable":true,"LangCode":"ml","ScriptCode":"Mlym"},{"Author":"AI4Bharat","CompiledDate":"09-April-2022","Direction":"ltr","DisplayName":"Manipuri - ꯃꯤꯇꯩꯂꯣꯟ","FallbackFont":"sans-serif","GoogleFont":"Noto Sans Meetei Mayek","Identifier":"mni","IsStable":true,"LangCode":"mni","ScriptCode":"Mtei"},{"Author":"AI4Bharat","CompiledDate":"09-April-2022","Direction":"ltr","DisplayName":"Marathi - मराठी","FallbackFont":"serif","GoogleFont":"Tiro Devanagari Marathi","Identifier":"mr","IsStable":true,"LangCode":"mr","ScriptCode":"Deva"},{"Author":"AI4Bharat","CompiledDate":"09-April-2022","Direction":"ltr","DisplayName":"Nepali - नेपाली","FallbackFont":null,"GoogleFont":null,"Identifier":"ne","IsStable":true,"LangCode":"ne","ScriptCode":"Deva"},{"Author":"AI4Bharat","CompiledDate":"09-April-2022","Direction":"ltr","DisplayName":"Oriya - ଓଡ଼ିଆ","FallbackFont":null,"GoogleFont":null,"Identifier":"or","IsStable":true,"LangCode":"or","ScriptCode":"Orya"},{"Author":"AI4Bharat","CompiledDate":"09-April-2022","Direction":"ltr","DisplayName":"Panjabi - ਪੰਜਾਬੀ","FallbackFont":null,"GoogleFont":null,"Identifier":"pa","IsStable":true,"LangCode":"pa","ScriptCode":"Guru"},{"Author":"AI4Bharat","CompiledDate":"09-April-2022","Direction":"ltr","DisplayName":"Sanskrit - संस्कृतम्","FallbackFont":"serif","GoogleFont":"Tiro Devanagari Sanskrit","Identifier":"sa","IsStable":true,"LangCode":"sa","ScriptCode":"Deva"},{"Author":"AI4Bharat","CompiledDate":"09-April-2022","Direction":"rtl","DisplayName":"Sindhi - سنڌي","FallbackFont":"serif","GoogleFont":"Lateef","Identifier":"sd","IsStable":true,"LangCode":"sd","ScriptCode":"Arab"},{"Author":"AI4Bharat","CompiledDate":"09-April-2022","Direction":"ltr","DisplayName":"Sinhala - සිංහල","FallbackFont":null,"GoogleFont":null,"Identifier":"si","IsStable":true,"LangCode":"si","ScriptCode":"Sinh"},{"Author":"AI4Bharat","CompiledDate":"09-April-2022","Direction":"ltr","DisplayName":"Tamil - தமிழ்","FallbackFont":null,"GoogleFont":null,"Identifier":"ta","IsStable":true,"LangCode":"ta","ScriptCode":"Taml"},{"Author":"AI4Bharat","CompiledDate":"09-April-2022","Direction":"ltr","DisplayName":"Telugu - తెలుగు","FallbackFont":null,"GoogleFont":null,"Identifier":"te","IsStable":true,"LangCode":"te","ScriptCode":"Telu"},{"Author":"AI4Bharat","CompiledDate":"09-April-2022","Direction":"rtl","DisplayName":"Urdu - اُردُو","FallbackFont":"serif","GoogleFont":"Noto Nastaliq Urdu","Identifier":"ur","IsStable":true,"LangCode":"ur","ScriptCode":"Aran"}].json();
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
  }
  xmlhttp = new XMLHttpRequest();
  xmlhttp.open("POST", LEARN_API, true);
  xmlhttp.withCredentials = true;
  xmlhttp.onreadystatechange = function () {
    if (xmlhttp.readyState == 4) {
      if (xmlhttp.status != 200) {
        console.log("ERROR: Failed to recordUserSelection(). Status: " + xmlhttp.status);
      }
    }
  };
  xmlhttp.setRequestHeader("Content-type", "application/json");
  xmlhttp.send(JSON.stringify(data));
}
