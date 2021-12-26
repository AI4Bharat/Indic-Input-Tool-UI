var QUILL_EDITOR;
const THROTTLE_API_REQUESTS = false;
const API_FIRE_FREQ_THRESH = 200; // millisecs
var LAST_REQUEST_TIMESTAMP = 0;

function displaySuggestions(searchTerm, renderList, lang_code) {

    // To avoid the API getting throttled, we don't fire API
    // at the rate at which the user is typing
    if (THROTTLE_API_REQUESTS && Date.now() - LAST_REQUEST_TIMESTAMP < API_FIRE_FREQ_THRESH) {
        // console.log('die hey');
        return;
    }

    // Display Transliterated Suggestions
    getTransliterationSuggestions(lang_code, searchTerm)
        .then(response => {
            var suggestions = [];
            if (!response["success"])
                return;
            var result = response["result"];
            for (i = 0; i < result.length; i++) {
                suggestions.push({id: i, value: result[i]});
            }
            if (!result.includes(response["input"])) {
                suggestions.push({id: -1, value: response["input"]})
            }
            renderList(suggestions, searchTerm);
        });
}

async function handleChangesInText(searchTerm, renderList, mentionChar) {
    if (!searchTerm) return;
    const lang = localStorage.getItem('lang');
    if (!lang) {
        alert('Select a language first!');
        return;
    } else if (lang == 'en') {
        return;
    }

    if (THROTTLE_API_REQUESTS) {
        // Fire Transliteration API only once in certain frequency
        LAST_REQUEST_TIMESTAMP = Date.now();
        setTimeout(displaySuggestions, API_FIRE_FREQ_THRESH, searchTerm, renderList, lang);
    } else {
        displaySuggestions(searchTerm, renderList, lang);
    }
    
}

function setLanguagesDropDown(dropDownItems, quill) {
    if (!dropDownItems) {
        const lang_map = localStorage.getItem('lang_map');
        if (lang_map) {
            dropDownItems = JSON.parse(lang_map);
        } else {
            alert('ERROR: Unable to fetch list of languages!');
            return;
        }
    }
    const default_language = localStorage.getItem('lang_label');
    const myDropDown = new QuillToolbarDropDown({
        label: default_language ? default_language : "Languages",
        rememberSelection: true
    })

    myDropDown.setItems(dropDownItems);

    myDropDown.onSelect = function(label, value, quill) {
        localStorage.setItem('lang', value);
        localStorage.setItem('lang_label', label);
        setQuillTextDirectionAutomatically(value, quill);
    }
    myDropDown.attach(quill, true);
}

var quillOptions = {
    placeholder: 'Start typing...',
    theme: 'snow',
    modules: {
        toolbar: {
            container: [
            ]
        },
        mention: {
            allowedChars: /^.*[A-Za-z0-9\\.\sÅÄÖåäö]+.*$/,
            mentionDenotationChars: [" ", "\n"],
            autoSelectOnSpace: true,
            spaceAfterInsert: false,
            blotName: "text",
            numberList: false,
            source: handleChangesInText,
            onSelect(item, insertItem) {
                recordUserSelection(localStorage.getItem('lang'), item.searchTerm, item.value, item.id);
                insertItem(item, true);
            },
        }
    },
};

function setupQuillEditor() {

    QUILL_EDITOR = new Quill("#editor", quillOptions);

    getSupportedLanguages().then(response => {
        var languageMap = null;
        if (response) {
            languageMap = {};
            languageMap["None"] = "en";
            for (i = 0; i < response.length; i++) {
                languageMap[response[i]["DisplayName"]] = response[i]["Identifier"]
            }
            localStorage.setItem('lang_map', JSON.stringify(languageMap));
        }
        setLanguagesDropDown(languageMap, QUILL_EDITOR);
    });
}

window.onload = () => {
    setupQuillEditor();
}
