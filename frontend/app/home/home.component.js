'use strict';

// Register `phoneList` component, along with its associated controller and template
angular.
module('home').
component('home', {
    templateUrl: 'home/home.template.html',
    controller: ['$http', '$window', '$rootScope', function homeController($http, $window, $rootScope) {
        this.noteEditor =  CKEDITOR.replace( 'note' );
        this.note = null;

        toastr.options = {
            "closeButton": true,
            "debug": false,
            "newestOnTop": true,
            "progressBar": true,
            "positionClass": "toast-top-right",
            "preventDuplicates": false,
            "onclick": null,
            "showDuration": "300",
            "hideDuration": "1000",
            "timeOut": "5000",
            "extendedTimeOut": "1000",
            "showEasing": "swing",
            "hideEasing": "linear",
            "showMethod": "fadeIn",
            "hideMethod": "fadeOut"
        }

        /************************
         * Variable Declarations
         ************************/
        
        // for getting access in http request
        var self = this;

        this.input = ""; // input data expected from user
        this.output = ""; // output data
        this.ext = ".cpp14"; // default extension
        this.code = "";

        // codearea
        this.editor = monaco.editor.create(document.getElementById('code'), {
            value: "",
            theme: "vs-dark",
            language: 'cpp',
            fontSize: 20,
            automaticLayout: true
        });

        /**********************
         * Open File Varibles
         **********************/

        // starting filetype
        this.filetype = "cpp";

        // open file in editor
        this.openfile = "";

        // current file name file path
        this.openfile_path = "";

        // id of open file in editor
        this.openfile_id = -1;

        // testcases list
        this.testcases = [];

        // flag for AC, WA, TLE, RE
        this.flag = null;

        // tabs
        this.tabs = [];

        /******************
         * Other Variables
         ******************/
        // Theme of editor
        this.theme = "vs-dark";

        // stack for point current and its path
        // e.g. ['D','engg','sem 5'] means /D/engg/sem \5/
        this.stack = [];

        // parent of current opened directory in file explorer
        this.parent_id = 1;

        // parent name
        this.parent = "root";

        // files and folders in current directory
        this.children = [];

        // initial load root directory
        $http({
            url: 'http://127.0.0.1:8888/dir',
            method: "POST",
            data: {
                'dir_id': self.parent_id
            }
        }).then(function (response) {
            self.children = response.data;
            self.children.sort(function (a, b) {
                return b[2] - a[2]
            });
        });

        //query in searchbox
        this.query;
        // search box showing or not
        this.searchbox = "none";

        // file on which right clicked
        this.contextFile = null;
        // where is right clicked
        this.contextMenuFlag = false;
        // file = 0 amd folder = 1
        this.fileOrFolder = -1;

        // which test case right clicked
        this.testSelected = null;

        //clipboard or copied file data
        this.clipboard = {
            "data_available": false,
            "data":null
        }

        // preview code by right clicking on file
        this.previewCode = "";

        /************************
         * Functions
         ************************/
        this.runcode = function () {
            /**
             * Runs Code in Editor
             */

            var c = this.editor.getValue("code");

            if (c == "") {
                toastr["error"]("Code is blank.", "Code");
                return;
            }
            this.output = "running";
            $http({
                url: 'http://127.0.0.1:8888/run',
                method: "POST",
                data: {
                    'code': c,
                    'input': this.input,
                    'ext': this.ext
                }
            }).then(function (response) {
                self.output = response["data"];
            });
        }

        this.langChange = function () {
            /**
             * Changing language of code in editor
             */

            if (this.ext == ".cpp" || this.ext == ".cpp11" || this.ext == ".cpp14" || this.ext == ".cpp17") {
                this.filetype = "cpp";
            } else if (this.ext == ".py" || this.ext == ".py3") {
                this.filetype = "python";
            } else {
                this.filetype = "c";
            }
            monaco.editor.setModelLanguage(this.editor.getModel(), this.filetype);
        }

        this.themeChange = function () {
            /**
             * Changing Theme of Editor
             */
            monaco.editor.setTheme(this.theme);
        }

        /**************************
         * File Explorer Section
         **************************/

        this.loadDir = function (child) {
            /**
             * Load clicked directory if directory
             */
            if (child[2] == 1) { // if folder
                this.stack.push([this.parent, this.parent_id]);
                this.parent = child[1];
                this.parent_id = child[0];
                this.loadDirUsingId(child[0]);
            } else { // file
                this.loadFile(child);
            }
        }

        this.loadFile = function (node) {
            /**
             * Load clicked file if file
             */
            this.openfile = node;
            this.openfile_id = node[0];
            this.openfile_path = "";
            // this.noteEditor.setData("");
            var flag = true;
            for (var i = this.stack.length - 1; i > 0; i--) {
                if(this.openfile_path.length + this.parent.length + node[1].length > 80){
                    flag = false;
                    break;
                }
                this.openfile_path = this.stack[i][0] + "/"  + this.openfile_path;
            }
            if(!flag)
                this.openfile_path = "../" + this.openfile_path;
            else   
                this.openfile_path = "/" + this.openfile_path;
            this.openfile_path += this.parent + "/";
            this.openfile_path += node[1];
            if(this.openfile_path.length > 40)
                this.openfile_path = ".." + this.openfile_path.substring(this.openfile_path.length-80,this.openfile_path.length);
            $http({
                url: 'http://127.0.0.1:8888/cat',
                method: "POST",
                data: {
                    'filename': node[1],
                    'parent': node[3]
                }
            }).then(function (response) {
                self.code = response.data[3];
                self.openfile_id = response.data[0];
                self.note = response.data[6];
                if (response.data[5] == 1)
                    self.flag = "AC";
                else if (response.data[5] == 2)
                    self.flag = "WA";
                else if (response.data[5] == 3)
                    self.flag = "TLE";
                else if (response.data[5] == 4)
                    self.flag = "RE";
                else 
                    self.flag = null;
                self.editor.setValue(self.code);
                
                self.noteEditor.setData(self.note, {
                    callback: function() {
                        self.loadAllTestCases();
                        toastr["success"]("File Loading Successful.", "File");
                    }
                });
                var flag = true;
                for (const e of self.tabs) {
                    e.current = 0;
                    if(e.openfile_id == self.openfile_id){
                        e.filetype = self.filetype;
                        e.openfile = self.openfile;
                        e.openfile_path = self.openfile_path;
                        e.testcases = self.testcases;
                        e.flag = self.flag;
                        e.current = 1;
                        e.note = self.note;
                        e.content = self.code;
                        flag = false;
                    }
                }
                if(!flag)
                    return;
                var tab = {
                    filetype: self.filetype,
                    openfile: self.openfile,
                    openfile_path: self.openfile_path,
                    openfile_id: self.openfile_id,
                    testcases: self.testcases,
                    flag: self.flag,
                    current: 1,
                    note: self.note,
                    content: self.editor.getValue("code")
                }
                self.tabs.push(tab);
            });
        }

        this.back = function () {
            /**
             * Go to one directory up/back
             */
            if (this.stack.length == 0)
                return;
            var tmp = this.stack.pop();
            this.parent_id = tmp[1];
            this.parent = tmp[0];
            this.loadDirUsingId(this.parent_id);
        }

        this.loadDirUsingId = function (id) {
            /**
             * Load files and folders in directory in 
             * file explorer whose id is passed
             */
            $http({
                url: 'http://127.0.0.1:8888/dir',
                method: "POST",
                data: {
                    'dir_id': id
                }
            }).then(function (response) {
                self.children = response.data;
                self.children.sort(function (a, b) {
                    return b[2] - a[2]
                }); // first folders and then files
            });
        }

        // creat new file in current directory
        this.createFile = function (content) {
            /**
             * Create New File in current Directory
             * content of whose content is given
             * if not given then blank file
             */
            var filename = prompt("Enter Filename");
            if (filename == null)
                return;
            $http({
                url: 'http://127.0.0.1:8888/touch',
                method: "POST",
                data: {
                    "filename": filename,
                    "parent": this.parent_id,
                    "content": content
                }
            }).then(function (response) {
                self.loadDirUsingId(self.parent_id); // refresh directory
                var interval = setInterval(function(){ 
                     if(document.getElementById(filename) != null){
                        document.getElementById(filename).click();
                        clearInterval(interval);
                     }
                }, 500);
                
                toastr["success"]("File Creation Successful.", "File");
            });
        }

        this.createDir = function () {
            /**
             * Create Directory in current directory
             */
            var dir_name = prompt("Enter folder name", "");
            if (dir_name == "") {
                toastr["error"]("Directory Name is Empty.", "Folder");
                return;
            }
            if(dir_name != null){
                $http({
                    url: 'http://127.0.0.1:8888/mkdir',
                    method: "POST",
                    data: {
                        "folder": dir_name,
                        "parent": this.parent_id,
                    }
                }).then(function (response) {
                    self.loadDirUsingId(self.parent_id); // refresh directory
                    toastr["success"]("Directory Created Successfully.", "Folder");
                });
            }
        }


        // keyword shortcuts
        document.addEventListener("keydown", function (e) {

            if ((window.navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey) && e.keyCode == 83) { //ctrl + s
                e.preventDefault();
                self.saveFile();
                // Process the event here (such as click on submit button)
            } else if ((window.navigator.platform.match("Mac") ? e.altKey : e.altKey) && e.keyCode == 78 && !e.shiftKey) { // alt + n
                e.preventDefault();
                self.createFile();
                // Process the event here (such as click on submit button)
            } else if ((window.navigator.platform.match("Mac") ? e.altKey : e.altKey) && e.keyCode == 78 && e.shiftKey) {  // alt + shift + n
                e.preventDefault();
                self.createDir();
                // Process the event here (such as click on submit button)
            }
        }, false);

        this.saveFile = function () {
            /**
             * Save file to server
             */

            this.code = this.editor.getValue("code");

            if (this.openfile != "") {
                $http({
                    url: 'http://127.0.0.1:8888/edit',
                    method: "POST",
                    data: {
                        "filename": this.openfile[1],
                        "parent": this.openfile[3],
                        "content": this.code
                    }
                }).then(function (response) {
                    if(response.data == "file not exist")
                        toastr["error"]("file not found. may be deleted. refresh page", "File");
                    else
                        toastr["success"]("file successfully saved", "File");
                });
            } else {
                this.createFile(this.editor.getValue("code"));
            }
        }

        /*******************************
         * Testcases for testing code
         *******************************/  

        this.addTestCase = function () {
            /**
             * Add New test case for currently opened file
             * Testcase input and output taken from 
             * standard input and output
             */
            if (this.input == "" && this.output == "") {
                toastr["error"]("Both input and output empty.", "Testcases");
                return;
            }
            if (this.openfile != "") {
                $http({
                    url: 'http://127.0.0.1:8888/addtest',
                    method: "POST",
                    data: {
                        "node_id": this.openfile_id,
                        "input": this.input,
                        "output": this.output
                    }
                }).then(function (response) {
                    self.loadAllTestCases();
                    toastr["success"]("Testcases Added Successfully.", "Testcases");
                });
            } else {
                toastr["info"]("Open / Create File First.", "Testcases");
            }
        }

        // loads all testcases of current file or when file loaded testcases get loaded
        this.loadAllTestCases = function () {
            /**
             * When file opened all testcases are get loaded
             */
            if (this.openfile != "") {
                $http({
                    url: 'http://127.0.0.1:8888/loadtests',
                    method: "POST",
                    data: {
                        "node_id": this.openfile_id,
                    }
                }).then(function (response) {
                    self.testcases = response.data;
                });
            }
        }

        this.showTest = function (test) {
            /**
             * Show testcases in standard input and output
             */
            this.input = test[2];
            this.output = test[3];
        }

        this.runOnTestCases = function () {
            /**
             * Run currently opened file on testcases saved
             */
            if (this.code != this.editor.getValue("code")) {
                toastr["error"]("File not saved", "File");
                return;
            }
            for (var i = 0; i < this.testcases.length; i++) {
                this.testcases[i][5] = -1;
            }
            if (this.testcases.length > 0) {
                $http({
                    url: 'http://127.0.0.1:8888/runtests',
                    method: "POST",
                    data: {
                        "node_id": this.openfile_id,
                        "parent": this.openfile[3],
                        "ext": this.ext
                    }
                }).then(function (response) {
                    self.testcases = response.data;
                });
            } else {
                toastr["error"]("Testcases not available", "Testcases");
            }
        }

        // flag for AC, WA, TLE, RE
        this.flagChange = function () {
            /**
             * Change flag related to file
             * i.e. code accepted/wrong answer etc
             */
            if (this.openfile != "") {
                $http({
                    url: 'http://127.0.0.1:8888/updateflag',
                    method: "POST",
                    data: {
                        "node_id": this.openfile_id,
                        "flag": this.flag
                    }
                }).then(function (response) {
                    if (response.data == "success")
                        toastr["success"]("verdict changed", "File");
                    else
                        toastr["error"]("verdict not changed", "File");
                    self.loadDirUsingId(self.parent_id); // refresh directory
                    
                });
            }
        }

        $(".searchbox").css("display", this.searchbox);
        // search within folder
        this.search = function () {
            if (this.searchbox == "none") {
                this.searchbox = "block";
                $(".searchbox").css("display", this.searchbox);
            } else {
                this.searchbox = "none";
                this.query = "";
                $(".searchbox").css("display", this.searchbox);
            }
        }

        // context menu / right click option for file explorer
        this.contextMenu = function (child, e) {
            /**
             * Context / right click menu in file explorer
             */
            if(child == null){
                this.contextMenuFlag = false;
            } else {
                this.fileOrFolder = child[2];
                this.contextMenuFlag = true;
            }
            $('#context-menu').hide();
            $('#context-test').hide();
            if (e.which == 3) {
                var top = e.pageY - 75;
                var left = e.pageX;
                this.contextFile = child;
                $("#context-menu").css({
                  display: "block",
                  top: top,
                  left: left
                }).addClass("show");
                return false; 
            }
        }

        this.contextMenuTestCases = function (test, e) {
            /**
             * Right click/context menu in test case section
             */
            if(test == null){
                this.contextMenuFlag = false;
            } else {
                this.testSelected = test;
                this.contextMenuFlag = true;
            }
            $('#context-menu').hide();
            $('#context-test').hide();
            if (e.which == 3) {
                var top = e.pageY - 75;
                var left = e.pageX;
                $("#context-test").css({
                  display: "block",
                  top: top,
                  left: left
                }).addClass("show");
                return false; 
            }
        }

        /**
         * Remove default browser context menu
         */
        $('body').bind('contextmenu', function(e) {
            return false;
        }); 

        /**
         * Close context menu when anywhere on screen clicked
         */
        $(document).click(function() {
            $('#context-menu').hide();
            $('#context-test').hide();
        });

        // rename file properties 
        this.editFile = function(file) {
            /**
             * Edit file Name
             */
            $('#context-menu').hide();
            var name = prompt("Enter new Filename");
            
            if(name != "" && name != null){
                $http({
                    url: 'http://127.0.0.1:8888/rename',
                    method: "POST",
                    data: {
                        "node_id": this.contextFile[0],
                        "name": name
                    }
                }).then(function (response) {
                    if (response.data == "success")
                        toastr["success"]("Rename Completed", "File");
                    else
                        toastr["error"]("omething ent rong", "File");
                    self.loadDirUsingId(self.parent_id); // refresh directory
                });
            }
        }

        // delete file
        this.deleteFile = function() {
            /**
             * Delete file from file explorer
             */
            $('#context-menu').hide();

            if(window.confirm("Really Want to delete '" + this.contextFile[1] + "'")){
                $http({
                    url: 'http://127.0.0.1:8888/delete',
                    method: "POST",
                    data: {
                        "node_id": this.contextFile[0],
                        "type": this.contextFile[2]
                    }
                }).then(function (response) {
                    if (response.data != "fail"){
                        self.loadDirUsingId(self.parent_id); // refresh directory
                        toastr["success"](response.data + " nodes deleted.", "File");
                        response.data.forEach(e => {
                            self.removeTab(e);
                        });
                    }
                    else
                        toastr["error"]("Something Went Wrong", "File");   
                });
            }
        }

        // copy file 
        this.copyFile = function() {
            /**
             * Copies file to clipboard
             */
            if(this.clipboard.data_available && window.confirm("Really Want to paste '" + this.clipboard.data[1] + "' to '" + this.parent + "' . Will remove file / Folder.")){  // paste
                this.clipboard.data_available = false;
                $http({
                    url: 'http://127.0.0.1:8888/cutpaste',
                    method: "POST",
                    data: {
                        "node_id": this.clipboard.data[0],
                        "parent": this.parent_id
                    }
                }).then(function (response) {
                    if (response.data == "success")
                        toastr["success"]("cut paste Completed", "File");
                    else
                        toastr["error"]("cut paste unsuccessfull", "File");
                    self.loadDirUsingId(self.parent_id); // refresh directory
                });
            } else {   // cut
                this.clipboard.data_available = true;
                this.clipboard.data = this.contextFile;
            }
        }

        this.saveNote = function() {
            /**
             * Saves note related to current opened file
             */
            $('#myModal').modal('hide');
            this.note = this.noteEditor.getData();
            $http({
                url: 'http://127.0.0.1:8888/savenote',
                method: "POST",
                data: {
                    "node_id": this.openfile_id,
                    "note": this.note
                }
            }).then(function (response) {
                if (response.data != "fail")
                    toastr["success"]("Note Saved Successfully.", "Note");
                else
                    toastr["error"]("Something Went Wrong", "Note");
            });
        }

        this.editorSetting = function() {

            $('#editorSetting').modal('hide');
            this.editor.updateOptions({
                lineNumbers: "off",
                fontSize: 10
            });
        }

        this.download = function() {
            /**
             * Download File for file explorer
             */
            var node = this.contextFile;
            $http({
                url: 'http://127.0.0.1:8888/cat',
                method: "POST",
                data: {
                    'filename': node[1],
                    'parent': node[3]
                }
            }).then(function (response) {

                var element = document.createElement('a');
                element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(response.data[3]));
                element.setAttribute('download', response.data[2]);

                element.style.display = 'none';
                document.body.appendChild(element);

                element.click();

                document.body.removeChild(element);
            });
        }

        
        this.preview = function() {
            /**
             * Preview file by right clicking on file
             * in file explorer
             */
            var node = this.contextFile;
            $http({
                url: 'http://127.0.0.1:8888/cat',
                method: "POST",
                data: {
                    'filename': node[1],
                    'parent': node[3]
                }
            }).then(function (response) {
                self.previewCode = response.data[3];
                $('#previewModal').modal('show');
            });
        }

        this.deleteTest = function() {
            /**
             * Delete testcase by right clicking on it
             * form test case area
             */
            $http({
                url: 'http://127.0.0.1:8888/deltest',
                method: "POST",
                data: {
                    'test_id': this.testSelected[0]
                }
            }).then(function (response) {
                if (response.data != "fail"){
                    toastr["success"]("Test Deleted Successfully.", "Testcase");
                    self.loadAllTestCases();
                    self.testSelected = null;
                }
                else
                    toastr["error"]("Something Went Wrong", "Testcase");
            });
        }

        /**********************
         * Open File Varibles
         **********************/

        // starting filetype
        this.filetype = "C++14";

        // open file in editor
        this.openfile = "";

        // current file name file path
        this.openfile_path = "";

        // id of open file in editor
        this.openfile_id = -1;

        // testcases list
        this.testcases = [];

        // flag for AC, WA, TLE, RE
        this.flag = null;

        this.note = null;

        // tab
        this.createNewTab = function() {
            var tmp ;
            tmp = {
                filetype: this.filetype,
                openfile: this.openfile,
                openfile_path: this.openfile_path,
                openfile_id: this.openfile_id,
                testcases: this.testcases,
                flag: this.flag,
                current: 0,
                note: this.noteEditor.getData(),
                content: this.editor.getValue("code")
            }
            return tmp;
        }
        var tmpTab = this.createNewTab();
        tmpTab.current = 1;
        this.tabs = [tmpTab];

        this.resetFileProperties = function() {
            // starting filetype
            this.filetype = "C++14";

            // open file in editor
            this.openfile = "";

            // current file name file path
            this.openfile_path = "";

            // id of open file in editor
            this.openfile_id = -1;

            // testcases list
            this.testcases = [];

            // flag for AC, WA, TLE, RE
            this.flag = null;
        }

        this.changeTab = function(file_id) {
            var tmp = null;
            for (const e of this.tabs) {
                if(e.current == 1 && e.openfile_id == file_id)
                    return;
                if(e.current == 1){
                    e.current = 0;
                    e.content = this.editor.getValue("code");
                }
                if(e.openfile_id == file_id){
                    e.current = 1;
                    tmp = e;
                }
            }
            this.setFileProperties(tmp);
        }

        this.setFileProperties = function(tab) {
            this.filetype = tab.filetype;
            this.openfile = tab.openfile;
            this.openfile_path = tab.openfile_path;
            this.openfile_id = tab.openfile_id;
            this.testcases = tab.testcases;
            this.note = tab.note;
            this.noteEditor.setData(this.note, {
                callback: function() {
                }
            });
            this.flag = tab.flag;
            this.editor.setValue(tab.content);
        }

        this.addNewTab = function(id) {
            for (const e of this.tabs) {
                if(e.openfile_id == id){
                    this.changeTab(id);
                    return;
                }
            }
            this.tabs.push(this.createNewTab());
            this.resetFileProperties();
            self.editor.setValue("");
        }        
        
        this.removeTab = function(id) {
            var index = 0;
            if(id == -1)
                return;
            var tmp = null, flag = true;
            for (const e of this.tabs) {
                if(e.openfile_id == id){
                    if(e.current == 1)
                        flag = false;
                    this.tabs.splice(index,1);
                    break;
                } else {
                    tmp = e;
                }
                index ++;
            }
            if(!flag){
                tmp.current = 1;
                this.setFileProperties(tmp);
            }
        }
    }]
});