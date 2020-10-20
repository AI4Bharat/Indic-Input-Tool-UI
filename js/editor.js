async function displaySuggestions(searchTerm, renderList, mentionChar) {
    if (!searchTerm) return;
    const lang = localStorage.getItem('lang');
    if (!lang) {
        alert('Select a language first!');
        return;
    } else if (lang == 'en') {
        return;
    }
    getTransliterationSuggestions(lang, searchTerm)
        .then(response => {
            var suggestions = [];
            if (!response["success"])
                return;
            var result = response["result"];
            for (i = 0; i < result.length; i++) {
                suggestions.push({id: i, value: result[i]});
            }
            suggestions.push({id: -1, value: response["input"]})
            renderList(suggestions, searchTerm);
        });
}

var container = document.getElementById('editor');
var toolbarOptions = [
    ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
    ['blockquote', 'code-block'],

    [{ 'header': 1 }, { 'header': 2 }],               // custom button values
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
    [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
    // [{ 'direction': 'rtl' }],                         // text direction

    [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

    [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
    [{ 'font': [] }],
    [{ 'align': [] }],

    ['clean']                                         // remove formatting button
];

var options = {
    // debug: 'info',
    placeholder: 'Start typing...',
    theme: 'snow',
    modules: {
        toolbar: toolbarOptions,
        mention: {
            allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
            mentionDenotationChars: [" ", "\n"],
            autoSelectOnSpace: true,
            showDenotationChar: true,
            blotName: "text",
            source: displaySuggestions,
            onSelect(item, insertItem) {
                recordUserSelection(localStorage.getItem('lang'), item.searchTerm, item.value, item.id);
                insertItem(item, true);
            },
        }
    },
};
var editor = new Quill("#editor", options);

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
    }
    myDropDown.attach(quill);
}

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
    setLanguagesDropDown(languageMap, editor);
});
