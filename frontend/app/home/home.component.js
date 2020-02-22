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
            $http({
                url: 'http://127.0.0.1:8888/run',
                method: "POST",
                data: { 'code' : editAreaLoader.getValue("code"),
                        'input': this.input, 
                        'ext': this.ext }
            }).then(function(response) {
                self.output = response["data"];
            });
        }

        // codearea
        editAreaLoader.init({
            id : "code",		
            syntax: "cpp",			
            start_highlight: true,
            allow_toggle: false,
            replace_tab_by_spaces: 4	
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
            editAreaLoader.init({
                id : "code",		
                syntax: this.filetype,		
                start_highlight: true,
                allow_toggle: false,
                replace_tab_by_spaces: 4	
            }); 
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
                editAreaLoader.setValue("code",self.code);
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
            $http({
                url: 'http://127.0.0.1:8888/touch',
                method: "POST",
                data: {
                    "filename": prompt("Enter Filename",""),
                    "parent": this.parent_id,
                    "content": content
                }
            }).then(function(response) {
                alert(response.data);
                self.loadDirUsingId(self.parent_id);  // refresh directory
                toastr["success"]("File Creation Successful.", "File");
            });
        }

        this.createDir = function() {
            $http({
                url: 'http://127.0.0.1:8888/mkdir',
                method: "POST",
                data: {
                    "folder": prompt("Enter folder name",""),
                    "parent": this.parent_id,
                }
            }).then(function(response) {
                alert(response.data);
                self.loadDirUsingId(self.parent_id);  // refresh directory
                toastr["success"]("Directory Created Successfully.", "Folder");
            });
        }

        this.saveFile = function() {
            this.code = editAreaLoader.getValue("code");
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
                this.createFile(editAreaLoader.getValue("code"));
            }
        }

        // testcases
        this.testcases = [];
        this.addTestCase = function() {
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
                    toastr["success"]("Testcases", "Testcases Added Successfully.");
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
            if(this.code != editAreaLoader.getValue("code")){
                alert("file not saved");
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
    }]
  });