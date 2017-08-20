define(["knockout", "knockout.mapping", "knockout-helpers", "moment", "bootstrap", "main", "noext!api.aspx"], function (ko, komapping, kohelper, moment) {

    var MyDocumentsVMs = {

        Init: function () {

            ko.mapping = komapping;

            $(window).unload(function () {
                return "Handler for .unload() called.";
            });

            documentTagVM = new DocumentTagViewModel();
            ko.applyBindings(documentTagVM, document.getElementById("loader"));

            physicalDocumentVM = new PhysicalDocumentViewModel();
            ko.applyBindings(physicalDocumentVM, document.getElementById("docEdit"));

            virtualDocumentVM = new VirtualDocumentViewModel();
            ko.applyBindings(virtualDocumentVM, document.getElementById("viewer"));

            buttonsVM = new ButtonsViewModel();
            ko.applyBindings(buttonsVM, document.getElementById("panelbuttons"));

            documentTagVM.loadDocumentTags();

            physicalDocumentVM.loadPhysicalDocuments();

            virtualDocumentVM.loadDocumentStatuses();
            virtualDocumentVM.loadDocumentTags();
            virtualDocumentVM.loadVirtualDocuments();

            var fileUploadStatus = document.getElementById("fileUploadStatus");
            var encPath = "";
            var timeoutPath = "";
            var encrypedTimeStamp = "";
            const DOCUMENT_STATUS_SUBMITTED = 1;
            const DOCUMENT_STATUS_DELETEREQUESTED = 4;

            var ACTION = {
                VIEW: { value: 1 },
                DELETE_FILE: { value: 2 },
                CHANGE_TYPE: { value: 3 },
                DELETE_VIRTUAL_DOCUMENT: { value: 4 },
                CHANGE_STATUS: { value: 5 },
                CHANGE_COMMENTS: { value: 6 },
                ARCHIVE: { value: 7 }
            };
            //EXAMPLE USAGE
            //var selectedAction = ACTION.VIEW;

            function DocumentActionLog(data) {
                var self = this;
                self.Id = data.Id;
                self.DocumentID = data.DocumentID;
                self.VirtualDocumentID = data.VirtualDocumentID;
                self.From = data.From;
                self.To = data.To;
                self.DocumentActionID = data.DocumentActionID;
            }

            function documentActionLogHelper(documentId, virtualDocumentId, from, to, documentActionId) {
                var actionUrlDocumentActionLogs = WEB_API_URL_BASE + "documents/actionlogs";
                var newDocumentActionLog = (new DocumentActionLog({
                    Id: 0,
                    DocumentID: documentId,
                    VirtualDocumentID: virtualDocumentId,
                    From: from,
                    To: to,
                    DocumentActionID: documentActionId
                }));

                var failPromise = function (jqXHR, textStatus, errorThrown) {
                    var message = buildAjaxFailHtmlMessage("Could not add document action log entry. ", jqXHR, textStatus, errorThrown);
                    self.addErrorMessage(message);
                    self.selectedItem(null);
                };

                var alwaysPromise = function () {
                };
                var donePromise = function (response, msg, xhr) {

                }

                $.ajaxPost(actionUrlDocumentActionLogs, ko.toJSON(newDocumentActionLog), donePromise, failPromise, alwaysPromise);
            }

            var uploadProcessing = document.getElementById("hfPhysicalLocation").value;
            var viewCheck = getUrlParameter("vvccD");             
            if (uploadProcessing.length == 0) {                            
               if (viewCheck.length == 0) {                            
                   $('#btnView').prop('disabled', false);
               }
                var selectedTab = getUrlParameter('tab'); //keep as null for now                
            } else {
                $('#btnView').prop('disabled', true);
                if ($("#docEdit").hasClass("none") == true) {
                    $("#docEdit").removeClass("none");
                }
            }
            if (viewCheck.length > 0) {                            
                $('#btnView').prop('disabled', true);
            }
           
            if (fileUploadStatus.innerHTML.indexOf("File successfully uploaded") != -1) {
                if ($("#viewer").hasClass("none") == false) {
                    $("#viewer").addClass("none");
                }
                if ($("#docEdit").hasClass("none") == true) {
                    $("#docEdit").removeClass("none")
                }
                if ($("#saveButtonGroup").hasClass("none") == true) {
                    $("#saveButtonGroup").removeClass("none"); $('#btnView').prop
                }

                $('#btnView').prop('disabled', true);
            } else {
                encPath = getUrlParameter("vvccD");
                encTimeout = getUrlParameter("Dccvv");
                if (encPath.length > 0) {
                    $('#btnView').prop('disabled', true);                    
                    if ($("#pdfDiv").hasClass("none") == true) {
                        $("#pdfDiv").removeClass("none")
                    }
 
                    //get placeholder for iframe
                    var labelForIFrame = document.getElementById("lblForViewPDFIframe");

                    lblForViewPDFIframe.innerHTML = "<iframe id = \"viewPDFIframe\" src =\"PDFViewer.aspx?vvccD=" + encPath + "&Dccvv=" + encTimeout + "\"></iframe>" //dimensions in EDMS.css                    

                    virtualDocumentVM.loadVirtualDocuments();
                    buttonsVM.view();
                }
            }


            function ButtonsViewModel() {
                var self = this;
                kohelper.BaseViewModel.call(self);
                var fileUploadStatus = document.getElementById("fileUploadStatus");

                self.view = function () {
                    self.shTab("view");
                    if (document.getElementById("hfVirtualDocumentsCount").value > 0) {
                        if ($("#virtualDocumentEdit").hasClass("none") == true) {
                            $("#virtualDocumentEdit").removeClass("none")
                        }
                        if ($("#docEdit").hasClass("none") == false) {
                            $("#docEdit").addClass("none")
                        }
                    } else {
                        if (document.getElementById("hfPhysicalDocumentsCount").value > 0) {
                            documentViewerStatus.innerHTML = "Upload Status: No documents available."
                            if ($("#virtualDocumentEdit").hasClass("none") == false) {
                                $("#virtualDocumentEdit").addClass("none")
                            }
                        }
                    }
                };

                self.uploadfiles = function () {
                    self.shTab("UploadFiles");
                    if (physicalDocumentsCount > 0) {
                        if ($("#docEdit").hasClass("none") == true) {
                            $("#docEdit").removeClass("none")
                        }
                    } else {
                        if ($("#docEdit").hasClass("none") == false) {
                            $("#docEdit").addClass("none")
                        }

                    }
                };


                self.shTab = function showHideTab(tab) {

                    if (tab == "view" || tab == "viewnew") {
                        virtualDocumentVM.loadVirtualDocuments();
                        if ($("#virtualDocumentEdit").hasClass("none") == true) {
                            $("#virtualDocumentEdit").removeClass("none");
                        }
                        if ($("#viewer").hasClass("none") == true) {
                            $("#viewer").removeClass("none");
                        }
                        $("#loader").hide();
                        $('#btnView').prop('disabled', true);
                        $('#btnUploadFiles').prop('disabled', false);
                        if ($("#docEdit").hasClass("none") == false) {
                            $("#docEdit").addClass("none");
                        }
                        //each helper, index and value are optional
                        $.each($('.statusComments'), function (index, value) {
                            if ($(value).val().length == 0) {
                                $(this.parentNode).addClass('has-warning');
                                $(this).focus();
                            }
                        });
                    }
                    else { //tab = Upload Files
                        if ($("#viewer").hasClass("none") == false) {
                            $("#viewer").addClass("none");
                        }
                        $("#loader").show();
                        $('#btnView').prop('disabled', false);
                        $('#btnUploadFiles').prop('disabled', true);
                        if (fileUploadStatus.innerHTML.indexOf("File successfully uploaded") != -1) {
                            if ($("#viewer").hasClass("none") == false) {
                                $("#viewer").addClass("none");
                            }
                            if ($("#docEdit").hasClass("none") == true) {
                                $("#docEdit").removeClass("none");
                            }
                            if ($("#saveButtonGroup").hasClass("none") == true) {
                                $("#saveButtonGroup").removeClass("none");
                            }

                            $('#btnView').prop('disabled', true);
                        } else {
                            var viewCheck = getUrlParameter("vvccD");
                            if (viewCheck.length == 0) {
                               $('#btnView').prop('disabled', false);
                            } 
                        }
                    }
                }
            }

            function DocumentStatus(data) {
                var self = this;
                self.Id = ko.observable(data.Id);
                self.IsActive = ko.observable(data.IsActive);
                self.StatusName = ko.observable(data.StatusName);
                self.UserCreatedID = ko.observable(data.UserCreatedID);
                self.DateCreated = ko.observable(moment(data.DateCreated));
                self.UserUpdatedID = ko.observable(data.UserUpdatedID);
                self.DateUpdated = ko.observable(moment(data.DateUpdated));
                self.RowVersion = ko.observable(data.RowVersion);
            }

            function VirtualDocument(data) {
                var self = this;
                self.Id = ko.protectedObservable(data.Id);
                self.DocumentID = ko.protectedObservable(data.DocumentID);
                self.DocumentStatusID = ko.protectedObservable(data.DocumentStatusID);
                self.DocumentTagID = ko.protectedObservable(data.DocumentTagID);
                self.StatusComments = ko.protectedObservable(data.StatusComments);
                self.DeleteFlag = ko.protectedObservable(data.DeleteFlag);
                self.VirtualSchoolID = ko.protectedObservable(data.VirtualSchoolID);
                self.UserCreatedID = ko.protectedObservable(data.UserCreatedID);
                self.DateCreated = ko.protectedObservable(moment(data.DateCreated));
                self.UserUpdatedID = ko.protectedObservable(data.UserUpdatedID);
                self.DateUpdated = ko.protectedObservable(moment(data.DateUpdated));
                self.RowVersion = ko.protectedObservable(data.RowVersion);
                self.inRowLevelSecurityReadGroup = ko.observable();
                self.inRowLevelSecurityCreateGroup = ko.observable();
                self.inRowLevelSecurityUpdateGroup = ko.observable();
            }

            function VirtualDocumentViewModel(items) {
                var documentViewerStatus = document.getElementById("documentViewerStatus");
                var self = this;
                kohelper.BaseViewModel.call(self);
                self.isValidField = ko.observable();

                self.VirtualDocuments = ko.observableArray([]);
                self.VirtualDocumentsFrom = ko.observableArray([]);
                self.VirtualDocument = ko.observable();
                self.Id = ko.observable();
                self.DocumentID = ko.observable();
                self.DocumentTagID = ko.observable();
                self.DocumentStatusID = ko.observable();
                self.StatusComments = ko.observable();
                self.DeleteFlag = ko.observable();
                self.VirtualSchoolID = ko.observable();
                self.UserCreatedID = ko.observable()
                self.DateCreated = ko.observable(moment());
                self.UserUpdatedID = ko.observable();
                self.DateUpdated = ko.observable(moment());
                self.RowVersion = ko.observable();

                self.DocumentTags = ko.observableArray([]);                
                self.DocumentStatuses = ko.observableArray([]);
                self.DocumentActions = ko.observableArray([]);
                

                self.selectedDocumentTag = ko.observable();
                self.selectedDocumentStatus = ko.observable();

                var selectedDocumentTagFrom = "";
                var selectedDocumentStatusFrom = "";
                var selectedDocumentStatusCommentsFrom = "";
                var selectedDeleteFlagFrom = "";

                self.selectedItem = ko.observable();
                self.studentId = ko.observable();
                self.studentId = document.getElementById("hfStudentId").value;

                self.blockerMessage = ko.observable("");

                self.PhysicalDocuments = ko.observableArray([]);

                var unencryptedPhysicalLocation = "";
                var encryptedPhysicalLocation = "";
                var dateForTimeout = "";

                self.getPhysicalDocument = function (documentId) {

                    var donePromise = function (response) {
                        unencryptedPhysicalLocation = response.Data.PhysicalLocation;
                        encryptedPhysicalLocation = encrypter(unencryptedPhysicalLocation);
                    };

                    var failPromise = function (jqXHR, textStatus, errorThrown) {
                        var message = buildAjaxFailHtmlMessage("Could not load document.", jqXHR, textStatus, errorThrown);
                        self.addErrorMessage(message);
                    };

                    var alwaysPromise = function () {
                        self.blockerMessage = ko.observable("");
                    };

                    self.blockerMessage = ko.observable("Loading Document...");
                    $.ajaxGet(WEB_API_URL_BASE + "physicaldocuments/" + ko.toJSON(documentId), null, donePromise, failPromise, alwaysPromise);
                };


                self.viewItem = function (item) {
                    //log entry
                    documentActionLogHelper(ko.utils.unwrapObservable(item.DocumentID), ko.utils.unwrapObservable(item.Id), null, null, ACTION.VIEW.value);

                    self.getPhysicalDocument(item.DocumentID);

                    setTimeout(function () { //TODO: check for async if possible                                   
                        var now = new Date();
                        var nowUTC = now.getTime()
                        encrypedTimeStamp = encrypter(Math.floor(nowUTC / 1000).toString()); //round down to the nearest second - the number of milliseconds since 1 January 1970 00:00:00 UTC.
                        window.location = "default.aspx?PageID=524&fn=My-Documents&tab=view&vvccD=" + encryptedPhysicalLocation + "&Dccvv=" + encrypedTimeStamp;
                    }, 1000);

                };

                self.editItem = function (item) {

                    self.StatusComments = item.StatusComments;

                    self.selectedDocumentTag = item.DocumentTagID;
                    self.selectedDocumentStatus = item.DocumentStatusID;

                    self.selectedItem(item);
                    $.each($('.statusComments'), function (index, value) {
                        if ($(value).val().length == 0) {
                            $(this.parentNode).addClass('has-warning');
                            $(this).focus();
                        }
                    });

                };

                self.cancelItemEdit = function () {
                    self.selectedItem(null);
                    $.each($('.statusComments'), function (index, value) {
                        //console.log(index + 'edit:' + $(value).val().length + $(value).val());
                        if ($(value).val().length == 0) {
                            $(this.parentNode).addClass('has-warning');
                        }
                    });
                };

                self.templateToUseVirtualDocument = function (item) {
                    return self.selectedItem() === item ? "editTemplateVirtualDocument" : "itemTemplateVirtualDocument";
                };

                self.loadDocumentStatuses = function () {
                    var donePromise = function (response) {
                        self.DocumentStatuses([]);
                        //may want to refactor using push.apply
                        for (var i = 0; i < response.Data.length; i++) {
                            var documentStatus = new DocumentStatus(response.Data[i]);
                            self.DocumentStatuses.push(documentStatus);
                        }
                    };

                    var failPromise = function (jqXHR, textStatus, errorThrown) {
                        var message = buildAjaxFailHtmlMessage("Could not load document statuses.", jqXHR, textStatus, errorThrown);
                        self.addErrorMessage(message);
                    };

                    var alwaysPromise = function () {
                        self.blockerMessage("");
                    };

                    self.blockerMessage("Loading Statuses...");
                    $.ajaxGet(WEB_API_URL_BASE + "documents/statuses", null, donePromise, failPromise, alwaysPromise);
                };

                self.loadDocumentTags = function () {
                    var donePromise = function (response) {
                        self.DocumentTags([]);
                        //may want to refactor using push.apply
                        for (var i = 0; i < response.Data.length; i++) {
                            var documentTag = new DocumentTag(response.Data[i]);                            
                            if (ko.toJSON(documentTag.IsActive) == "true") {
                              self.DocumentTags.push(documentTag);
                            }
                        }
                    };

                    var failPromise = function (jqXHR, textStatus, errorThrown) {
                        var message = buildAjaxFailHtmlMessage("Could not load document tags.", jqXHR, textStatus, errorThrown);
                        self.addErrorMessage(message);
                    };

                    var alwaysPromise = function () {
                        self.blockerMessage("");
                    };

                    self.blockerMessage("Loading Document Types");
                    $.ajaxGet(WEB_API_URL_BASE + "documents/tags", null, donePromise, failPromise, alwaysPromise);
                };

                self.SaveVirtualDocument = function () {
                    
                    self.selectedItem().DocumentTagID.commit();                                        
                    self.selectedItem().DeleteFlag.commit();
                    self.selectedItem().VirtualSchoolID.commit();                    
                    
                    var id = ko.utils.unwrapObservable(self.selectedItem().Id);

                    self.selectedItem().DocumentStatusID.commit();                     
                                                            
                    self.selectedItem().StatusComments.commit();
                    updatedVirtualDocument = self.selectedItem();                    
                    updatedVirtualDocument.DateUpdated = Date.now();                    

                    var failPromise = function (jqXHR, textStatus, errorThrown) {
                        var message = buildAjaxFailHtmlMessage("Could not save document. Please refresh the page and try again.", jqXHR, textStatus, errorThrown);
                        self.addErrorMessage(message);
                        self.selectedItem(null);
                    };

                    var alwaysPromise = function () {
                        self.blockerMessage("");
                    };

                    var actionUrlVirtualDocuments = WEB_API_URL_BASE + "virtualdocuments/" + id;

                    var donePromise = function (response, msg, xhr) {                                                                       
                        
                        updatedVirtualDocument.RowVersion = response.Data.RowVersion;

                        self.selectedItem().DateUpdated = response.Data.DateUpdated;
                        self.selectedItem().RowVersion = response.Data.RowVersion;
                        self.selectedItem().DocumentTagID.reset();
                        self.selectedItem().DocumentStatusID.reset();
                        self.selectedItem().DeleteFlag.reset();
                        self.selectedItem().StatusComments.reset();
                        self.selectedItem().VirtualSchoolID.reset();                        

                        self.selectedItem(null);
                        var showMessage = false;
                        $.each($('.statusComments'), function (index, value) {
                            if ($(value).val().length == 0) {
                                $(this.parentNode).addClass('has-warning');
                                showMessage = true;
                            }
                        });
                        if (showMessage == true && $("#viewer").hasClass("none") == false) {
                            alert("Comments are required.");
                        }
                    }
                    self.blockerMessage("Saving Document...");
                    alert("updatedVirtualDocument:" + ko.toJSON(updatedVirtualDocument));
                    setTimeout(function () {
                        $.ajaxPut(actionUrlVirtualDocuments, ko.toJSON(updatedVirtualDocument), donePromise, failPromise, alwaysPromise);
                    }, 1000);     
                    setTimeout(function () {
                        self.loadVirtualDocuments();                        
                    }, 3500);    
                                                       
                };

                self.loadVirtualDocuments = function () {
                    var donePromise = function (response) {
                        self.VirtualDocuments([]);                        
                        for (var i = 0; i < response.Data.length; i++) {
                            
                            var virtualDocument = new VirtualDocument(response.Data[i]);
                            //apply security                             
                            var match = ko.utils.arrayFirst(self.DocumentTags(), function(item) {                                
                                return ko.toJSON(virtualDocument.DocumentTagID) == ko.toJSON(item.Id);
                            });
                            var updateSecurity = ko.utils.arrayFirst(self.DocumentTags(), function(item) {                                
                                if (ko.toJSON(virtualDocument.DocumentTagID) == ko.toJSON(item.Id)) {
                                  return ko.toJSON(item.RowLevelSecurityUpdateGroup) > 0;
                                }
                            });
                            var readSecurity = ko.utils.arrayFirst(self.DocumentTags(), function(item) {                                
                                if (ko.toJSON(virtualDocument.DocumentTagID) == ko.toJSON(item.Id)) {
                                  return ko.toJSON(item.RowLevelSecurityReadGroup) > 0;
                                }
                            });
                            if (match) {
                              virtualDocumentsCount += 1;                              
                              virtualDocument.inRowLevelSecurityUpdateGroup = updateSecurity;
                              virtualDocument.inRowLevelSecurityReadGroup = readSecurity;
                              self.VirtualDocuments.push(virtualDocument);
                            }                           
                        }                        
                        //put count in hidden input
                        document.getElementById("hfVirtualDocumentsCount").value = virtualDocumentsCount;
                        if (virtualDocumentsCount == 0) {
                            if ($("#virtualDocumentEdit").hasClass("none") == false) {
                                $("#virtualDocumentEdit").addClass("none")
                            }
                            if ($("#docEdit").hasClass("none") == false) {
                                $("#docEdit").addClass("none")
                            }
                            documentViewerStatus.innerHTML = "Upload Status: No documents available.";
                        } else {
                            if ($("#virtualDocumentEdit").hasClass("none") == true) {
                                $("#virtualDocumentEdit").removeClass("none")
                            }
                            documentViewerStatus.innerHTML = "";
                        }
                        var showMessage = false;
                        $.each($('.statusComments'), function (index, value) {
                            if ($(value).val().length == 0) {
                                $(this.parentNode).addClass('has-warning');
                                showMessage = true;
                            }
                        });
                        if (showMessage == true && $("#viewer").hasClass("none") == false) {
                            alert("Comments are required.");
                        }
                    };


                    var failPromise = function (jqXHR, textStatus, errorThrown) {
                        var message = buildAjaxFailHtmlMessage("Could not load Virtual documents.", jqXHR, textStatus, errorThrown);
                        self.addErrorMessage(message);
                    };

                    var alwaysPromise = function () {
                        self.blockerMessage("");
                    };
                    self.blockerMessage("Loading Documents...");
                    $.ajaxGet(WEB_API_URL_BASE + "students/" + self.studentId + "/virtualdocuments", null, donePromise, failPromise, alwaysPromise);
                };
            }

            function PhysicalDocument(data) {
                var self = this;
                self.Id = ko.protectedObservable(data.Id);
                self.DocumentID = ko.protectedObservable(data.DocumentID);
                self.UserID = ko.protectedObservable(data.UserID);
                self.Title = ko.protectedObservable(data.Title);
                self.UploadComments = ko.protectedObservable(data.UploadComments);
                self.PhysicalLocation = ko.protectedObservable(data.PhysicalLocation);
                self.DeleteFlag = ko.protectedObservable(data.DeleteFlag);
                self.UserCreatedID = ko.protectedObservable(data.UserCreatedID);
                self.DateCreated = ko.observable(moment(data.DateCreated));
                self.UserUpdatedID = ko.protectedObservable(data.UserUpdatedID);
                self.DateUpdated = ko.protectedObservable(moment(data.DateUpdated));
                self.RowVersion = ko.protectedObservable(data.RowVersion);
                self.documentTagIds = ko.observableArray([]);
            }

            function PhysicalDocumentViewModel(items) {
                var fileUploadStatus = document.getElementById("fileUploadStatus");

                var self = this;

                kohelper.BaseViewModel.call(self);

                self.PhysicalDocuments = ko.observableArray([]);
                self.VirtualDocuments = ko.observableArray([]);

                self.Id = ko.observable();
                self.DocumentID = ko.observable();
                self.UserID = ko.observable();
                self.Title = ko.observable();
                self.UploadComments = ko.observable();
                self.PhysicalLocation = ko.observable();
                self.DeleteFlag = ko.observable();
                self.UserCreatedID = ko.observable()
                self.DateCreated = ko.observable(moment());
                self.UserUpdatedID = ko.observable();
                self.DateUpdated = ko.observable(moment());
                self.RowVersion = ko.observable();

                self.selectedItem = ko.observable();
                self.documentTagIds = ko.observableArray([]);
                self.updatedPhysicalDocument = ko.observable();

                self.CurrentUserID = ko.observable();

                //for add
                self.titleNew = ko.observable();
                self.uploadCommentsNew = ko.observable();

                self.physicalLocationNew = ko.observable();

                //for add and update
                self.studentId = ko.observable();
                self.virtualSchoolId = ko.observable();
                self.studentId = document.getElementById("hfStudentId").value;
                self.physicalLocationNew = document.getElementById("hfPhysicalLocation").value;

                self.virtualSchoolId = document.getElementById("hfVirtualSchoolId").value;

                self.canSaveNewPhysicalDocument = ko.observable(false);

                self.checkTags = ko.observableArray([]);

                self.blockerMessage = ko.observable("");

                self.UploadComments.extend({ notify: 'always' });

                var selectedDeleteFlagFrom = "";
               
                self.removeBad = function (element) {
                    var cleanText = $(element).val();
                    cleanText = RemoveBad(cleanText);
                    $(element).val(cleanText);
                }
                ko.bindingHandlers.remBad = {
                    init: function (element, valueAccessor) {
                        $(element).change(function () {
                            self.removeBad(element);
                            var value = valueAccessor();
                            value($(element).val());
                        });

                    },
                    update: function (element, valueAccessor) {
                        $(element).val(ko.unwrap(valueAccessor()));
                        self.removeBad(element);
                    }
                };
                self.editItem = function (item) {                    

                    self.selectedItem(item);

                    var showMessageTitle = false;
                    $.each($('.title'), function (index, value) {
                        if ($(value).val().length == 0) {
                            $(this.parentNode).addClass('has-warning');
                            showMessage = true;
                            $(this).focus();
                        }
                        $(this).change(function () {
                            var checkText = $(this).val();
                            checkText = RemoveBad(checkText);
                            $(this).val(checkText);  //for on-screen display only, will not save properly                                
                        });
                    });
                    if (showMessageTitle == true && $("#docEdit").hasClass("none") == false) {
                        alert("Title is required.");
                    }

                    var showMessage = false;
                    $.each($('.uploadComments'), function (index, value) {                        
                        if ($(value).val().length == 0) {
                            $(this.parentNode).addClass('has-warning');
                            showMessage = true;
                            $(this).focus();
                        }
                        $(this).change(function () {
                            var checkText = $(this).val();                                                        
                            checkText = RemoveBad(checkText);
                            $(this).val(checkText);  //for on-screen display only, will not save properly                                
                        });
                    });
                    if (showMessage == true && $("#docEdit").hasClass("none") == false) {
                        alert("Comments are required.");
                    }
                   
                };                

                self.cancelItemEdit = function () {
                    self.selectedItem(null);
                    var showMessage = false;
                    $.each($('.uploadComments'), function (index, value) {                        
                        if ($(value).val().length == 0) {
                            $(this.parentNode).addClass('has-warning');
                            showMessage = true;
                        }
                    });
                    if (showMessage == true && $("#docEdit").hasClass("none") == false) {
                        alert("Comments are required.");
                    }

                    var showMessageTitle = false;
                    $.each($('.title'), function (index, value) {                        
                        if ($(value).val().length == 0) {
                            $(this.parentNode).addClass('has-warning');
                            showMessageTitle = true;
                        }
                    });
                    if (showMessageTitle == true && $("#docEdit").hasClass("none") == false) {
                        alert("Title is required.");
                    }
                };

                self.templateToUse = function (item) {

                    return self.selectedItem() === item ? "editTmpl" : "itemTmpl";
                };
                self.checkRequired = function () {
                    if ($("#docEdit").hasClass("none") == true) {
                        $("#docEdit").removeClass("none");
                    }
                    if ($("#physicaldocumentstable").hasClass("none") == false) {
                        $("#physicaldocumentstable").addClass("none");
                    }
                    self.canSaveNewPhysicalDocument(false);

                    //check all required fields - tagMessage requires a different check because it uses ko visible binding
                    if (document.getElementById("tagMessage").style.display == "none" && $("#titleMessage").hasClass("none") == true && $("#commentMessage").hasClass("none") == true) {                        
                        //show and enable button
                        if ($("#saveButttonGroup").hasClass("none") == true) {
                            $("#saveButttonGroup").removeClass("none");
                        }
                        self.canSaveNewPhysicalDocument(true);
                    }
                    else {  //hide button                         
                        if ($("#saveButttonGroup").hasClass("none") == false) {
                            $("#saveButttonGroup").addClass("none");
                        }
                    }
                    //}
                };
                documentTagVM.titleNew.subscribe(function (newValue) {                    
                    newValue = RemoveBad(newValue);
                    document.getElementById("titleId").value = newValue;                    
                    self.titleNew = newValue;
                    if (newValue.length > 0) {
                        if ($("#titleMessage").hasClass("none") == false) {
                            $("#titleMessage").addClass("none");
                        }                                                
                    } else {
                        if ($("#titleMessage").hasClass("none") == true) {
                            $("#titleMessage").removeClass("none");
                        }
                    }                    
                    self.checkRequired();                    
                    
                });
                documentTagVM.uploadCommentsNew.subscribe(function (newValue) {                    
                    newValue = RemoveBad(newValue);
                    document.getElementById("comment").value = newValue;
                    self.uploadCommentsNew = newValue;
                    if (newValue.length > 0) {
                        if ($("#commentMessage").hasClass("none") == false) {
                            $("#commentMessage").addClass("none");
                        }
                    } else {
                        if ($("#commentMessage").hasClass("none") == true) {
                            $("#commentMessage").removeClass("none");
                        }
                    }
                    self.checkRequired();
                });
                documentTagVM.checkedTags.subscribe(function (newValue) {
                    //load array with new tag objects
                    self.checkedTags = newValue;
                    self.checkRequired();
                });
                                
                self.AddNewPhysicalDocument = function () {
                    //disable save button                                        
                    self.canSaveNewPhysicalDocument(false);                    

                    var newPhysicalDocument = (new PhysicalDocument({
                        Title: self.titleNew,
                        DeleteFlag: false,
                        UserID: self.studentId,
                        UploadComments: self.uploadCommentsNew,
                        PhysicalLocation: self.physicalLocationNew
                    }));

                    //put tag ids into document model
                    for (var i = 0; i < self.checkedTags.length; i++) {
                        newPhysicalDocument.documentTagIds.push(self.checkedTags[i]);
                    }
                    
                    //alert(ko.toJSON(newPhysicalDocument));


                    var failPromise = function (jqXHR, textStatus, errorThrown) {
                        var message = buildAjaxFailHtmlMessage("Could not save document. Please refresh the page and try again.", jqXHR, textStatus, errorThrown);
                        self.addErrorMessage(message);
                        self.selectedItem(null);
                    };

                    var alwaysPromise = function () {
                        self.blockerMessage = ("");
                    };

                    var actionUrl = WEB_API_URL_BASE + "physicaldocuments/";
                    var actionUrlVirtualDocuments = WEB_API_URL_BASE + "virtualdocuments/";

                    var donePromise = function (response, msg, xhr) {
                        
                        newPhysicalDocument.Id = response.Id;
                        newPhysicalDocument.RowVersion = response.RowVersion;

                        for (var i = 0; i < self.checkedTags.length; i++) {
                            //post to virtual documents
                            //create virtual document object, set data, post 
                            var newVirtualDocument = (new VirtualDocument({
                                DocumentID: newPhysicalDocument.Id,
                                DocumentTagID: self.checkedTags[i],
                                DocumentStatusID: DOCUMENT_STATUS_SUBMITTED,
                                StatusComments: newPhysicalDocument.UploadComments,
                                DeleteFlag: 0,
                                VirtualSchoolID: self.virtualSchoolId,
                                DateCreated: Date.now(),
                                DateUpdated: Date.now()
                            }));

                            var failPromiseVD = function (jqXHR, textStatus, errorThrown) {
                                var message = buildAjaxFailHtmlMessage("Could not save virtual document. Please refresh the page and try again.", jqXHR, textStatus, errorThrown);
                                self.addErrorMessage(message);
                                self.selectedItem(null);
                            };

                            var alwaysPromiseVD = function () {
                                self.blockerMessage = ("");
                            };
                            var donePromiseVD = function (response, msg, xhr) {
                                newVirtualDocument.RowVersion = response.RowVersion;
                                newVirtualDocument.Id = response.Id;                                
                            }
                            self.blockerMessage = ("Saving Documents...");
                            $.ajaxPost(actionUrlVirtualDocuments, ko.toJSON(newVirtualDocument), donePromiseVD, failPromiseVD, alwaysPromiseVD);
                        }


                        self.selectedItem(null);
                        fileUploadStatus.innerHTML = "Your document has been saved.";
                        fileUploadStatus.focus();
                        setTimeout(function () {
                            window.location.href = "default.aspx?PageID=524&fn=My-Documents";
                        }, 1500);

                    }

                    self.blockerMessage = ("Saving File...");
                    $.ajaxPost(actionUrl, ko.toJSON(newPhysicalDocument), donePromise, failPromise, alwaysPromise);
                };

               self.SavePhysicalDocument = function () {
                    
                    self.selectedItem().DeleteFlag.commit();
                    self.selectedItem().Title.commit();                    
                    self.selectedItem().UploadComments.commit();
                    self.selectedItem().UserID.commit();

                    var id = ko.utils.unwrapObservable(self.selectedItem().Id);                    

                    updatedPhysicalDocument = self.selectedItem();
                    updatedPhysicalDocument.DateUpdated = Date.now();

                    var failPromise = function (jqXHR, textStatus, errorThrown) {
                        var message = buildAjaxFailHtmlMessage("Could not save document. Please refresh the page and try again.", jqXHR, textStatus, errorThrown);
                        self.addErrorMessage(message);
                        self.selectedItem(null);
                    };

                    var alwaysPromise = function () {
                        self.blockerMessage = ("");
                    };

                    var actionUrl = WEB_API_URL_BASE + "physicaldocuments/" + id;

                    //send e-mail here
                    var donePromise = function (response, msg, xhr) {
                        updatedPhysicalDocument.RowVersion = response.Data.RowVersion;

                        self.selectedItem().DateUpdated = response.Data.DateUpdated;
                        self.selectedItem().RowVersion = response.Data.RowVersion
                        var Id = ko.utils.unwrapObservable(self.selectedItem().Id);
                                                
                        self.selectedItem().DeleteFlag.reset();
                        self.selectedItem().Title.reset();
                        self.selectedItem().UploadComments.reset();
                        self.selectedItem().UserID.reset();

                        self.selectedItem(null);
                        var showMessage = false;
                        $.each($('.uploadComments'), function (index, value) {

                            if ($(value).val().length == 0) {
                                $(this.parentNode).addClass('has-warning');
                                showMessage = true;
                            }
                            $(this).change(function () {
                                var checkText = $(this).val();
                                checkText = RemoveBad(checkText);
                                $(this).val(checkText);  //for on-screen display only, will not save properly                                
                            });

                        });
                        if (showMessage == true && $("#docEdit").hasClass("none") == false) {
                            alert("Comments are required.");
                        }

                        var showMessageTitle = false;
                        $.each($('.title'), function (index, value) {
                            if ($(value).val().length == 0) {
                                $(this.parentNode).addClass('has-warning');
                                showMessageTitle = true;
                            }
                        });
                        $(this).change(function () {
                            var checkText = $(this).val();
                            checkText = RemoveBad(checkText);
                            $(this).val(checkText);  //for on-screen display only, will not save properly                                
                        });
                        if (showMessageTitle == true && $("#docEdit").hasClass("none") == false) {
                            alert("Title is required.");
                        }
                        
                        //self.loadPhysicalDocuments();
                    }

                    self.blockerMessage = ("Saving File Data...");
                    setTimeout(function () {
                        $.ajaxPut(actionUrl, ko.toJSON(updatedPhysicalDocument), donePromise, failPromise, alwaysPromise);
                    }, 1000);     
                    setTimeout(function () {
                        self.loadPhysicalDocuments();                        
                    }, 3500);                   
                };

                self.loadPhysicalDocuments = function () {

                    var donePromise = function (response) {
                        self.PhysicalDocuments([]);
                        //may need to refactor using push.assign
                        for (var i = 0; i < response.Data.length; i++) {
                            physicalDocumentsCount += 1;
                            response.Data[i].PhysicalLocation = response.Data[i].PhysicalLocation.replace(/^.*[\\\/\_]/, '') //remove path and timestamp 
                            var physicalDocument = new PhysicalDocument(response.Data[i]);
                            self.PhysicalDocuments.push(physicalDocument);
                        }
                        var showPDF = "";
                        showPDF = getUrlParameter("vvccD");
                        if (showPDF == null || document.getElementById('btnView').disabled == true) {
                            buttonsVM.uploadfiles();
                        }                        
                        if (physicalDocumentsCount == 0) {
                            //check here if already exists
                            if ($("#docEdit").hasClass("none") == false) {
                                $("#docEdit").addClass("none");
                            }

                            if (document.getElementById('btnView').disabled == false) {
                                fileUploadStatus.innerHTML = "Upload Status: no files have been uploaded.";
                            }

                        } else {
                            var selectedTab = getUrlParameter('tab');
                            if ($("#docEdit").hasClass("none") == true && selectedTab != "view") {
                                $("#docEdit").removeClass("none");
                                if (fileUploadStatus.innerHTML.indexOf("File successfully uploaded") != -1) {
                                    if ($("#saveButtonGroup").hasClass("none") == true) {
                                        $("#saveButtonGroup").removeClass("none")
                                    }
                                }
                            }
                        }
                    };

                    var failPromise = function (jqXHR, textStatus, errorThrown) {
                        var message = buildAjaxFailHtmlMessage("Could not load physical documents.", jqXHR, textStatus, errorThrown);
                        self.addErrorMessage(message);
                    };

                    var alwaysPromise = function () {
                        //self.blockerMessage("");
                    };

                    //self.blockerMessage("Loading File Data...");
                    $.ajaxGet(WEB_API_URL_BASE + "students/" + self.studentId + "/physicaldocuments", null, donePromise, failPromise, alwaysPromise);
                };

            }

            function DocumentTag(data) {
                var self = this;
                self.Id = ko.protectedObservable(data.Id);
                self.IsActive = ko.protectedObservable(data.IsActive);
                self.TagName = ko.protectedObservable(data.TagName);
                self.RowLevelSecurityReadGroup = ko.observable(data.RowLevelSecurityReadGroup);
                self.RowLevelSecurityCreateGroup = ko.observable(data.RowLevelSecurityCreateGroup);
                self.RowLevelSecurityUpdateGroup = ko.observable(data.RowLevelSecurityUpdateGroup);
                self.UserCreatedID = ko.protectedObservable(data.UserCreatedID);
                self.DateCreated = ko.observable(moment(data.DateCreated));
                self.UserUpdatedID = ko.protectedObservable(data.UserUpdatedID);
                self.DateUpdated = ko.protectedObservable(moment(data.DateUpdated));
                self.RowVersion = ko.protectedObservable(data.RowVersion);

            }

            function DocumentTagViewModel(items) {
                var self = this;

                kohelper.BaseViewModel.call(self);

                self.DocumentTags = ko.observableArray([]);                
                self.Id = ko.observable();
                self.IsActive = ko.observable();
                self.TagName = ko.observable();
                self.RowLevelSecurityReadGroup = ko.observable();
                self.RowLevelSecurityCreateGroup = ko.observable();
                self.RowLevelSecurityUpdateGroup = ko.observable();
                self.UserCreatedID = ko.observable()
                self.DateCreated = ko.observable(moment());
                self.UserUpdatedID = ko.observable();
                self.DateUpdated = ko.observable(moment());
                self.RowVersion = ko.observable();

                self.CurrentUserID = ko.observable();

                self.selectedTags = ko.observableArray([]);
                self.checkedTags = ko.observableArray([]);

                self.titleNew = ko.observable();
                self.uploadCommentsNew = ko.observable();
                self.physicalLocationNew = ko.observable();
                self.blockerMessage = ko.observable("");

                self.loadDocumentTags = function () {
                    var donePromise = function (response) {
                        self.DocumentTags([]);                        
                        for (var i = 0; i < response.Data.length; i++) {
                            var documentTag = new DocumentTag(response.Data[i]);                            
                            if (ko.toJSON(documentTag.IsActive) == "true") {                                                               
                               //upload security check                               
                               if (ko.toJSON(documentTag.RowLevelSecurityCreateGroup) > 0) {
                                   self.DocumentTags.push(documentTag);
                               }

                            }                            
                        }                        
                    };

                    var failPromise = function (jqXHR, textStatus, errorThrown) {
                        var message = buildAjaxFailHtmlMessage("Could not load document tags.", jqXHR, textStatus, errorThrown);
                        self.addErrorMessage(message);
                    };

                    var alwaysPromise = function () {
                        self.blockerMessage = ko.observable("");
                    };

                    self.blockerMessage = ko.observable("Loading Document Types...");
                    $.ajaxGet(WEB_API_URL_BASE + "documents/tags", null, donePromise, failPromise, alwaysPromise);
                };

            }
            function RemoveBad(InStr) {
                InStr = InStr.replace(/\</g, "");
                InStr = InStr.replace(/\>/g, "");
                InStr = InStr.replace(/\"/g, "");
                InStr = InStr.replace(/\'/g, "");
                InStr = InStr.replace(/\%/g, "");
                InStr = InStr.replace(/\;/g, "");
                InStr = InStr.replace(/\(/g, "");
                InStr = InStr.replace(/\)/g, "");
                InStr = InStr.replace(/\&/g, "");
                InStr = InStr.replace(/\+/g, "");
                return InStr;
            }            
            function printObject(o) {
                var out = '';
                for (var p in o) {
                    out += p + ': ' + o[p] + '\n';
                }
                alert(out);
            }
            //probably available elsewhere 
            function getUrlParameter(name) {
                name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
                var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
                var results = regex.exec(location.search);
                return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
            };

            function encrypter(unecrypted) {

                var key = CryptoJS.enc.Utf8.parse('8080808080808080');

                var iv = CryptoJS.enc.Utf8.parse('8080808080808080');

                var encrypted = "";

                encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(unecrypted), key,
                    {
                        keySize: 128 / 8,
                        iv: iv,
                        mode: CryptoJS.mode.CBC,
                        padding: CryptoJS.pad.Pkcs7
                    });
                return encrypted;
            }
        }

    };
    return MyDocumentsVMs;
});