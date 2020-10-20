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
    // [{ 'font': [] }],
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
            allowedChars: /^.*[A-Za-z0-9\\.\sÅÄÖåäö]+.*$/,
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
    myDropDown.attach(quill, true);
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


const exportDropDown = new QuillToolbarDropDown({
    label: "Export",
    rememberSelection: false
});

exportDropDown.setItems({
    "PDF": "pdf",
    "Text": "txt",
    "Markdown": "md",
    "HTML": "html"
});

function downloadString(text, fileType, fileName) {
    // https://gist.github.com/danallison/3ec9d5314788b337b682
    var blob = new Blob([text], { type: fileType });
  
    var a = document.createElement('a');
    a.download = fileName;
    a.href = URL.createObjectURL(blob);
    a.dataset.downloadurl = [fileType, a.download, a.href].join(':');
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function() { URL.revokeObjectURL(a.href); }, 1500);
  }

exportDropDown.onSelect = function(label, value, quill) {
    if (value == "pdf") {
        var opt = {
            margin:       1,
            filename:     'transcript.pdf',
            html2canvas:  { scale: 2 },
            jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(quill.root.innerHTML).save();
    }
    else if (value == "txt") {
        downloadString(quill.getText().trim(), "text/txt", "transcript.txt")
    }
    else if (value == "md") {
        var turndownService = new TurndownService();
        var markdown = turndownService.turndown(quill.root.innerHTML);
        downloadString(markdown, "text/md", "transcript.md")
    }
    else if (value == "html") {
        downloadString(quill.root.innerHTML, "text/html", "transcript.html")
    }
}

exportDropDown.attach(editor);
