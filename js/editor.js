var QUILL_EDITOR;
var LAST_SAVE_TIMESTAMP = 0;
var SAVE_CONTENT_FREQUENCY = 5*1000; // millisecs

function saveContent() {
    if (Date.now() - LAST_SAVE_TIMESTAMP > SAVE_CONTENT_FREQUENCY) {
        localStorage.setItem('quill_content', QUILL_EDITOR.root.innerHTML);
        LAST_SAVE_TIMESTAMP = Date.now();
    }
}

async function handleChangesInText(searchTerm, renderList, mentionChar) {
    saveContent();

    if (!searchTerm) return;
    const lang = localStorage.getItem('lang');
    if (!lang) {
        alert('Select a language first!');
        return;
    } else if (lang == 'en') {
        return;
    }

    // Display Transliterated Suggestions
    getTransliterationSuggestions(lang, searchTerm)
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

function downloadQuillContent(format, quill) {
    if (format == "pdf") {
        var opt = {
            margin:       1,
            filename:     'transcript.pdf',
            html2canvas:  { scale: 2 },
            jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(quill.root.innerHTML).save();
    }
    else if (format == "txt") {
        downloadString(quill.getText().trim(), "text/txt", "transcript.txt")
    }
    else if (format == "md") {
        var turndownService = new TurndownService();
        var markdown = turndownService.turndown(quill.root.innerHTML);
        downloadString(markdown, "text/md", "transcript.md")
    }
    else if (format == "html") {
        downloadString(quill.root.innerHTML, "text/html", "transcript.html")
    }
}

function setupQuillExport(quill) {
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

    exportDropDown.onSelect = function(label, value, quill) {
        downloadQuillContent(value, quill);
    }

    exportDropDown.attach(quill);
}

var toolbarOptions = {
    container: [

        ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
        ['link', 'blockquote', 'code-block'],
        ['image', 'video'],

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
    ]
};

var quillOptions = {
    placeholder: 'Start typing...',
    theme: 'snow',
    modules: {
        toolbar: toolbarOptions,
        blotFormatter: {},
        mention: {
            allowedChars: /^.*[A-Za-z0-9\\.\sÅÄÖåäö]+.*$/,
            mentionDenotationChars: [" ", "\n"],
            autoSelectOnSpace: true,
            showDenotationChar: true,
            spaceAfterInsert: false,
            blotName: "text",
            source: handleChangesInText,
            onSelect(item, insertItem) {
                recordUserSelection(localStorage.getItem('lang'), item.searchTerm, item.value, item.id);
                insertItem(item, true);
            },
        }
    },
};

function setupQuillEditor() {
    Quill.register('modules/blotFormatter', QuillBlotFormatter.default);

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

    setupQuillExport(QUILL_EDITOR);

    // Restore text content if present
    const cached_content = localStorage.getItem('quill_content');
    if (cached_content) {
        QUILL_EDITOR.root.innerHTML = cached_content;
    }
}

window.onload = () => {
    setupQuillEditor();
}
