'use strict';

// Register `phoneList` component, along with its associated controller and template
angular.
  module('home').
  component('home', {
    templateUrl: 'home/home.template.html',
    controller: ['$http','$window','$rootScope', function homeController($http,$window,$rootScope) {
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
        // for getting access in http request
        var self = this;

        this.input = "";    // input data expected from user
        this.output = "";   // output data
        this.ext = ".cpp";   // default extension
        this.code = "";
        // running code
        this.runcode = function() {
            var c = this.editor.getValue("code");

            if(c == ""){
                toastr["error"]("Code is blank.", "Code");
                return;
            }
            this.output = "running";
            $http({
                url: 'http://127.0.0.1:8888/run',
                method: "POST",
                data: { 'code' : c,
                        'input': this.input, 
                        'ext': this.ext }
            }).then(function(response) {
                self.output = response["data"];
            });
        }
        
        // codearea
        this.editor = monaco.editor.create(document.getElementById('code'), {
            value: "",
            theme: "vs-dark",
            language: 'cpp',
            fontSize: 20,
            automaticLayout:true
        });

        this.filetype = "cpp";
        this.langChange = function() {
            if(this.ext == ".cpp"){
                this.filetype = "cpp";
            } else if(this.ext == ".py"){
                this.filetype = "python";
            } else {
                this.filetype = "c";
            }
            monaco.editor.setModelLanguage(this.editor.getModel(),this.filetype);
        }
        
        this.theme = "vs-dark";
        this.themeChange = function(){
            monaco.editor.setTheme(this.theme);
        }
        // explorer

        // stack for point current and its path
        // e.g. ['D','engg','sem 5'] means /D/engg/sem \5/
        this.stack = [];
        this.parent_id = 1;
        this.parent = "root";
        this.children = [];
        this.openfile = "";
        this.openfile_path = "";
        this.openfile_id = -1;
        $http({
            url: 'http://127.0.0.1:8888/dir',
            method: "POST",
            data: { 'dir_id' : self.parent_id}
        }).then(function(response) {
            self.children = response.data;
            self.children.sort(function(a, b){return b[2] - a[2]});
        });

        this.loadDir = function(child) {
            if(child[2] == 1){  // if folder
                this.stack.push([this.parent,this.parent_id]);
                this.parent = child[1];
                this.parent_id = child[0];
                this.loadDirUsingId(child[0]);
            } else { // file
                this.loadFile(child);
            }
        }

        this.loadFile = function(node) {
            this.openfile = node;
            this.openfile_id = node[0];
            this.openfile_path = "";
            for(var i=0;i<this.stack.length;i++){
                this.openfile_path += this.stack[i][0] + "/";
            }
            this.openfile_path += node[1];
            $http({
                url: 'http://127.0.0.1:8888/cat',
                method: "POST",
                data: { 
                    'filename' : node[1],
                    'parent': node[3]
                }
            }).then(function(response) {
                self.code = response.data[3];
                self.openfile_id = response.data[0];
                
                if(response.data[5] == 1)
                    self.flag = "AC";
                else if(response.data[5] == 2)
                    self.flag = "WA";
                else if(response.data[5] == 3)
                    self.flag = "TLE";
                else if(response.data[5] == 4)
                    self.flag = "RE";
                self.editor.setValue(self.code);
                self.loadAllTestCases();
                toastr["success"]("File Loading Successful.", "File");
            });
        }

        this.back = function() {
            if(this.stack.length == 0)
                return;
            var tmp = this.stack.pop();
            this.parent_id = tmp[1];
            this.parent = tmp[0];
            this.loadDirUsingId(this.parent_id);
        }

        this.loadDirUsingId = function(id) {
            $http({
                url: 'http://127.0.0.1:8888/dir',
                method: "POST",
                data: { 'dir_id' : id}
            }).then(function(response) {
                self.children = response.data;
                self.children.sort(function(a, b){return b[2] - a[2]});   // first folders and then files
            });
        }
        
        // creat new file in current directory
        this.createFile = function(content) {
            var filename = prompt("Enter Filename");
            if(filename == null)
                return;
            $http({
                url: 'http://127.0.0.1:8888/touch',
                method: "POST",
                data: {
                    "filename": filename,
                    "parent": this.parent_id,
                    "content": content
                }
            }).then(function(response) {
                self.loadDirUsingId(self.parent_id);  // refresh directory
                toastr["success"]("File Creation Successful.", "File");
            });
        }

        this.createDir = function() {
            var dir_name = prompt("Enter folder name","");
            if(dir_name == ""){
                toastr["error"]("Directory Name is Empty.", "Folder");
                return;
            }
            $http({
                url: 'http://127.0.0.1:8888/mkdir',
                method: "POST",
                data: {
                    "folder": dir_name,
                    "parent": this.parent_id,
                }
            }).then(function(response) {
                self.loadDirUsingId(self.parent_id);  // refresh directory
                toastr["success"]("Directory Created Successfully.", "Folder");
            });
        }
        
        
        document.addEventListener("keydown", function(e) {
            // ctrl + s
            console.log(e)
            if ((window.navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)  && e.keyCode == 83) {
              e.preventDefault();
              self.saveFile();
              // Process the event here (such as click on submit button)
            } else if ((window.navigator.platform.match("Mac") ? e.altKey : e.altKey)  && e.keyCode == 78) {
                e.preventDefault();
                self.createFile();
                // Process the event here (such as click on submit button)
              }
        }, false);

        this.saveFile = function() {
            this.code = this.editor.getValue("code");
            
            if(this.openfile != ""){
                $http({
                    url: 'http://127.0.0.1:8888/edit',
                    method: "POST",
                    data: {
                        "filename": this.openfile[1],
                        "parent": this.openfile[3],
                        "content": this.code
                    }
                }).then(function(response) {
                    toastr["success"]("File Saved Successfully", "File");
                });
            } else {
                this.createFile(this.editor.getValue("code"));
            }
        }
        
        // testcases
        this.testcases = [];
        this.addTestCase = function() {
            if(this.input == ""  && this.output == ""){
                toastr["error"]("Both input and output empty.", "Testcases");
                return;
            }
            if(this.openfile != ""){
                $http({
                    url: 'http://127.0.0.1:8888/addtest',
                    method: "POST",
                    data: {
                        "node_id": this.openfile_id,
                        "input": this.input,
                        "output": this.output
                    }
                }).then(function(response) {
                    self.loadAllTestCases();
                    toastr["success"]("Testcases Added Successfully.", "Testcases");
                });
            } else {
                toastr["info"]("Open / Create File First.", "Testcases");
            }
        }

        // loads all testcases of current file or when file loaded testcases get loaded
        this.loadAllTestCases = function() {
            if(this.openfile != ""){
                $http({
                    url: 'http://127.0.0.1:8888/loadtests',
                    method: "POST",
                    data: {
                        "node_id": this.openfile_id,
                    }
                }).then(function(response) {
                    self.testcases = response.data;
                });
            }
        }

        this.showTest = function(test) {
            this.input = test[2];
            this.output = test[3];
        }

        this.runOnTestCases = function() {
            if(this.code != this.editor.getValue("code")){
                toastr["error"]("File not saved", "File");
                return;
            }
            for(var i=0;i<this.testcases.length;i++){
                this.testcases[i][5] = -1;
            }
            if(this.testcases.length > 0){
                $http({
                    url: 'http://127.0.0.1:8888/runtests',
                    method: "POST",
                    data: {
                        "node_id": this.openfile_id,
                        "parent": this.openfile[3]
                    }
                }).then(function(response) {
                    self.testcases = response.data;
                });
            } else {
                toastr["error"]("Testcases not available", "Testcases");
            }
        }

        // flag for AC, WA, TLE, RE
        this.flag = null;
        this.flagChange = function() {
            if(this.openfile != ""){
                $http({
                    url: 'http://127.0.0.1:8888/updateflag',
                    method: "POST",
                    data: {
                        "node_id": this.openfile_id,
                        "flag": this.flag
                    }
                }).then(function(response) {
                    if(response.data == "success")
                        toastr["success"]("verdict changed", "File");
                    else 
                        toastr["error"]("verdict not changed", "File");
                    self.loadDirUsingId(self.parent_id);  // refresh directory
                });
            }
        }

        this.query;
        this.searchbox = "none";
        $(".searchbox").css("display",this.searchbox);
        // search within folder
        this.search = function() {
            if(this.searchbox == "none"){
                this.searchbox = "block";
                $(".searchbox").css("display",this.searchbox);
            } else {
                this.searchbox = "none";
                this.query = "";
                $(".searchbox").css("display",this.searchbox);
            }
        }

        this.rightClick = function(e) {
            console.log(e);
        }
    }]
  });
