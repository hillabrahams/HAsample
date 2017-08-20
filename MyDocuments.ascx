<%@ Control Language="C#" AutoEventWireup="true" CodeBehind="MyDocuments.ascx.cs" Inherits="VISNCS.UserControls.MyDocuments.MyDocuments" %>


<link href="../../Resources/css/EDMS.css" rel="stylesheet" />

<div class="container">

    <div class="row">
        <div class="col-lg-11 col-md-12 col-sm-12">
            <div class="alert alert-danger" style="display: none;" role="alert" data-bind="showAndScrollToTopOfPage: errorMessages">
                <button type="button" class="close" data-bind="click: clearErrorMessages"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>
                <div data-bind="foreach: errorMessages">
                    <div data-bind="html: $data"></div>
                </div>
            </div>

            <div class="panel-body">
                <div>
                    <p>This area is a place for you to view or upload and store important documents like your transcripts, home school verification letter, health forms, and more. You may choose to upload a single document file or a file containing more than one document. Please add comments for each document type in the file.</p>
                    <asp:Label ID="lblFileSizeMessage" runat="server" CssClass="filestatus"></asp:Label>
                    <div>
                        <div id="panelbuttons" class="btn-group">
                            <button type="button" id="btnView" class="btn dashboard__button" data-toggle="modal" data-bind="click: view">View</button>
                            <button type="button" id="btnUploadFiles" class="btn dashboard__button" data-toggle="modal" data-bind="click: uploadfiles" disabled="disabled">Upload Files</button>
                        </div>

                        <div id="viewer" class="panel panel-primary none">

                            <div id="viewerBlockerDiv" data-bind="block: blockerMessage">
                                <section class="section section--dashboard-header">
                                    <h3 class="section__title">View Documents</h3>
                                    <asp:Label runat="server" class="text-danger" ID="documentViewerStatus" Visible="True" EnableViewState="true" ClientIDMode="Static" />
                                </section>
                                <div class="row none" id="pdfDiv">
                                    <div class="col-lg-9 col-md-12 col-sm-12">
                                        <asp:Label ID="lblForViewPDFIframe" runat="server" Text="" ClientIDMode="Static" EnableViewState="true"></asp:Label>
                                    </div>
                                </div>

                                <div id="virtualDocumentEdit" class="none">

                                    <table class="flvs-table">
                                        <thead>
                                            <tr class="bg-primary">
                                                <th class="tagnamewidth">Type</th>
                                                <th>*Comments</th>
                                                <th>Date Updated</th>
                                                <th>Status</th>
                                                <th>View</th>
                                                <th>Edit</th>
                                                <th>Delete</th>
                                            </tr>
                                        </thead>
                                        <tbody data-bind="template: { name: templateToUseVirtualDocument, foreach: VirtualDocuments }"></tbody>
                                        <script id="itemTemplateVirtualDocument" type="text/html">
                                            <tr>
                                                <td>
                                                    <select class="form-control" data-bind="options: $root.DocumentTags, optionsText: 'TagName', optionsValue: 'Id', value: DocumentTagID" disabled="disabled"></select>
                                                </td>
                                                <td>
                                                    <div class="form-group statusCommentDiv">
                                                        <textarea class="form-control statusComments" rows="2" cols="20" data-bind="value: StatusComments" disabled="disabled" placeholder="Comments (required)"></textarea>
                                                    </div>
                                                </td>
                                                <td data-bind="formattedDate: DateUpdated"></td>
                                                <td>

                                                    <select class="form-control" data-bind="options: $root.DocumentStatuses, optionsText: 'StatusName', optionsValue: 'Id', value: DocumentStatusID" disabled="disabled"></select></td>
                                                <td>
                                                    <div class="btn-group">
                                                        <button type="button" class="btn btn-primary btn-sm" data-toggle="modal" data-bind="click: $root.viewItem, enable: inRowLevelSecurityReadGroup" >View</button>
                                                    </div>
                                                </td>
                                                <td class="edittagwidth">
                                                    <div class="btn-group">
                                                        <button type="button" class="btn btn-primary btn-sm" data-toggle="modal" data-bind="click: $root.editItem, enable: inRowLevelSecurityUpdateGroup">Edit</button>
                                                    </div>
                                                </td>
                                                <td>
                                                    <input type="checkbox" data-bind="checked: DeleteFlag" disabled="disabled" />
                                                </td>
                                            </tr>
                                        </script>

                                        <script id="editTemplateVirtualDocument" type="text/html">
                                            <tr>
                                                <td>
                                                    <select class="form-control" data-bind="options: $root.DocumentTags, optionsText: 'TagName', optionsValue: 'Id', value: $root.selectedDocumentTag"></select>
                                                </td>
                                                <td>
                                                    <div class="form-group statusCommentDiv">
                                                        <textarea name="statusComments" class="form-control statusComments" rows="2" cols="20" data-bind="remBad: StatusComments" placeholder="Comments (required)"></textarea>
                                                    </div>
                                                </td>
                                                <td data-bind="formattedDate: DateUpdated"></td>
                                                <td>
                                                    <span id="ddlStatus" runat="server">
                                                        <select class="form-control" data-bind="options: $root.DocumentStatuses, optionsText: 'StatusName', optionsValue: 'Id', value: $root.selectedDocumentStatus"></select>
                                                    </span>
                                                </td>
                                                <td></td>
                                                <td class="editdocwidth">
                                                    <div class="btn-group">
                                                        <button type="button" class="btn btn-primary btn-sm" data-toggle="modal" data-bind="click: $root.SaveVirtualDocument">Save</button>
                                                        <button type="button" class="btn btn-danger btn-sm" data-toggle="modal" data-bind="click: $root.cancelItemEdit">Cancel</button>
                                                    </div>
                                                </td>
                                                <td>
                                                    <input type="checkbox" data-bind="checked: DeleteFlag" />
                                                </td>
                                            </tr>
                                        </script>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <div id="loader" class="mydocumentspanelprimary">
                            <div id="loaderBlockerDiv" data-bind="block: blockerMessage">
                                <a name="aloader"></a>
                                <section class="section section--dashboard-header">
                                    <h3 class="section__title">Upload Files</h3>
                                </section>
                                <div class="row">
                                    <div class="col-xs-1 ">
                                        &nbsp;
                                    </div>
                                    <div class="col-xs-11">
                                        <label for="ctlFileUpload" class="glyphicon-asterisk">Select file to upload</label>
                                        <asp:FileUpload ID="ctlFileUpload" runat="server" class="fileInputWidth" EnableViewState="false" AllowMultiple="false" ViewStateMode="Disabled" ClientIDMode="Static" />
                                        <asp:Label runat="server" class="text-danger" ID="fileUploadStatus" Visible="True" EnableViewState="true" ClientIDMode="Static" />
                                        <div class="list-group" id="files"></div>
                                        <asp:LinkButton ID="btnUpload" runat="server" class="btn btn-primary none" EnableViewState="true" OnClick="btnUpload_Click" ClientIDMode="Static">Attach</asp:LinkButton>
                                    </div>
                                </div>
                                <div id="physcialDocumentData" class="none">
                                    <div class="row" style="height: 80px">
                                        <div class="col-xs-1 vcenter"></div>
                                        <div class="col-xs-5 vcenter form-group">
                                            <label for="titleId" class="control-label glyphicon-asterisk">Enter title</label>
                                            <input id="titleId" class="in-line form-control" type="text" data-bind="textInput: titleNew" />                                            
                                            <label for="titleId" id="titleMessage" class="control-label text-danger" style="width: 300px">Title is required.</label>
                                        </div>
                                    </div>
                                    <div class="row">
                                        <div class="col-xs-12">
                                            &nbsp;
                                        </div>
                                    </div>
                                    <div class="row">
                                        <div class="col-xs-1"></div>
                                        <div class="col-xs-6 form-group">
                                            <label for="tags" class="control-label glyphicon-asterisk">Select all document types in this file</label>
                                            <div id="tags">
                                                <ul data-bind="foreach: DocumentTags">
                                                    <li>
                                                        <label class="checkbox-inline checkboxstyle">
                                                            <input name="tags" data-bind="value: Id, checked: $parent.checkedTags" type="checkbox"><span data-bind="text: TagName"></span>
                                                        </label>
                                                    </li>
                                                </ul>
                                                <label id="tagMessage" class="text-danger" style="width: 300px" data-bind="visible: !checkedTags().length">Please select at least one document type.</label>                                                
                                            </div>
                                        </div>
                                        <div class="col-xs-4 padding-left">
                                            <div class="form-group">
                                                <label for="comment" class="glyphicon-asterisk">Comments</label>
                                                <textarea class="form-control" rows="3" cols="38" id="comment" runat="server" data-bind="textInput: uploadCommentsNew" clientidmode="Static" enableviewstate="true"></textarea>                                                
                                                <label id="commentMessage" style="width: 300px" class="text-danger">Comments are required.</label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-xs-11 ">
                                        &nbsp;
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div id="docEdit" runat="server" class="mydocumentspanelprimary none" clientidmode="Static">
                            <div id="docEditBlockerDiv" data-bind="block: blockerMessage">
                                <div class="row">
                                    <div class="col-xs-9">
                                    </div>
                                    <div class="col-xs-2 text-right none" id="saveButttonGroup">
                                        <button class="btn btn-success" id="btnSaveNewPhysicalDocument" data-bind="click: $root.AddNewPhysicalDocument, enable: $root.canSaveNewPhysicalDocument">Save</button>
                                    </div>
                                </div>
                                <table class="flvs-table physicaldocumentstable">                                    
                                    <thead>
                                        <tr class="bg-primary">
                                            <th>*Title</th>
                                            <th>*Comments</th>
                                            <th>File Name</th>
                                            <th>Date Created</th>
                                            <th>Date Updated</th>
                                            <th>Edit</th>
                                            <th>Delete</th>
                                        </tr>
                                    </thead>
                                    <tbody data-bind="template: { name: templateToUse, foreach: PhysicalDocuments }"></tbody>
                                    <script id="itemTmpl" type="text/html">
                                        <tr>
                                            <td>
                                                <div class="form-group titleDiv">
                                                    <textarea class="form-control title" rows="2" cols="20" data-bind="textInput: Title" disabled="disabled" placeholder="Title (required)"></textarea>
                                                </div>
                                            </td>
                                            <td>
                                                <div class="form-group uploadCommentDiv">
                                                    <textarea class="form-control uploadComments" rows="2" cols="20" data-bind="textInput: UploadComments" disabled="disabled" placeholder="Comments (required)"></textarea>
                                                </div>
                                            </td>
                                            <td>
                                                <textarea class="form-control" rows="2" cols="20" data-bind="value: PhysicalLocation" disabled="disabled" runat="server"></textarea>
                                            </td>
                                            <td data-bind="formattedDate: DateCreated"></td>
                                            <td data-bind="formattedDate: DateUpdated"></td>
                                            <td class="editdocwidth">
                                                <div class="btn-group">
                                                    <button type="button" class="btn btn-primary btn-sm" data-toggle="modal" data-bind="click: $root.editItem">Edit</button>
                                                </div>
                                            </td>
                                            <td>
                                                <label class="checkbox-inline checkboxstyle">
                                                    <input data-bind="checked: DeleteFlag" type="checkbox" disabled="disabled"><span></span>
                                                </label>
                                            </td>

                                        </tr>
                                    </script>

                                    <script id="editTmpl" type="text/html">
                                        <tr>
                                            <td>
                                                <div class="form-group titleDiv">
                                                    <textarea class="form-control title" rows="2" cols="20" data-bind="remBad: Title" placeholder="Title (required)"></textarea>
                                                </div>
                                            </td>
                                            <td>
                                                <div class="form-group uploadCommentDiv">
                                                    <textarea class="form-control uploadComments" rows="2" cols="20" data-bind="remBad: UploadComments" placeholder="Comments (required)"></textarea>
                                                </div>
                                            </td>
                                            <td>
                                                <textarea class="form-control" rows="2" cols="20" data-bind="text: PhysicalLocation" disabled="disabled" runat="server"></textarea>
                                            </td>
                                            <td data-bind="formattedDate: DateCreated"></td>
                                            <td data-bind="formattedDate: DateUpdated"></td>
                                            <td class="editdocwidth">
                                                <div class="btn-group">
                                                    <button type="button" class="btn btn-primary btn-sm" data-toggle="modal" data-bind="click: $root.SavePhysicalDocument">
                                                        Save
                                                    </button>
                                                    <button type="button" class="btn btn-danger btn-sm" data-toggle="modal" data-bind="click: $root.cancelItemEdit">
                                                        Cancel
                                                    </button>
                                                </div>
                                            </td>
                                            <td> 
                                                <label class="checkbox-inline checkboxstyle">
                                                    <input data-bind="checked: DeleteFlag" type="checkbox">
                                                </label>
                                            </td>
                                        </tr>
                                    </script>
                                </table>
                            </div>
                        </div>
                    </div>
                    <%--end of docEdit--%>
                </div>                
            </div>
        </div>
    </div>


</div>

<!-- hidden inputs for data storage, set in code-behind and used by js -->
<asp:HiddenField ID="hfStudentId" runat="server" ClientIDMode="Static" EnableViewState="true" />
<asp:HiddenField ID="hfVirtualSchoolId" runat="server" ClientIDMode="Static" EnableViewState="true" />
<asp:HiddenField ID="hfPhysicalLocation" runat="server" ClientIDMode="Static" EnableViewState="false" />
<asp:HiddenField ID="hfPhysicalLocationForView" runat="server" ClientIDMode="Static" EnableViewState="false" />
<asp:HiddenField ID="hfPhysicalDocumentsCount" runat="server" Value="none" ClientIDMode="Static" EnableViewState="true" />
<asp:HiddenField ID="hfVirtualDocumentsCount" runat="server" Value="none" ClientIDMode="Static" EnableViewState="true" />

<asp:HiddenField ID="hfStudentFirstName" runat="server" Value="none" ClientIDMode="Static" EnableViewState="false" />
<asp:HiddenField ID="hfStudentLastName" runat="server" Value="none" ClientIDMode="Static" EnableViewState="false" />
<asp:HiddenField ID="hfStudetUsername" runat="server" Value="none" ClientIDMode="Static" EnableViewState="false" />
<asp:HiddenField ID="hfStudentDOB" runat="server" Value="none" ClientIDMode="Static" EnableViewState="false" />
<asp:HiddenField ID="hfStudentDistrict" runat="server" Value="none" ClientIDMode="Static" EnableViewState="false" />
<asp:HiddenField ID="hfStudentPhysicalSchool" runat="server" Value="none" ClientIDMode="Static" EnableViewState="false" />
<asp:HiddenField ID="hfStudentGradeLevel" runat="server" Value="none" ClientIDMode="Static" EnableViewState="false" />
<asp:HiddenField ID="hfStudentEmail" runat="server" Value="none" ClientIDMode="Static" EnableViewState="false" />
<asp:HiddenField ID="hfDocumentUploadEmailSender" runat="server" Value="none" ClientIDMode="Static" EnableViewState="false" />
<asp:HiddenField ID="hfDocumentEmailRecipients" runat="server" Value="none" ClientIDMode="Static" EnableViewState="false" />


<script type="text/javascript">

    var strFileTypes = "'pdf', 'doc', 'docx', 'rtf', 'txt', 'xls', 'xlsx', 'jpeg', 'jpg', 'png'";   //for display
    var validFileTypes = ['pdf', 'doc', 'docx', 'rtf', 'txt', 'xls', 'xlsx', 'jpeg', 'jpg', 'png']; // array for extension check    
    var documentTagVM;
    var documentStatusVM;
    var physicalDocumentVM;
    var virtualDocumentVM;
    var buttonsVM;
    var virtualDocumentsCount = 0;
    var physicalDocumentsCount = 0;
    var physicalLocation = "";

    require(["/Resources/JavaScript/require-config.js"], function () {
        require(["knockout", "knockout.mapping", "knockout-helpers", "moment", "aes", "MyDocumentsViewModels", "bootstrap", "main", "noext!api.aspx"], function (ko, komapping, kohelper, moment, aes, MyDocumentsVMs) {

            $(function () {

                ko.mapping = komapping;

                function printObject(o) {
                    var out = '';
                    for (var p in o) {
                        out += p + ': ' + o[p] + '\n';
                    }
                    alert(out);
                }

                MyDocumentsVMs.Init();

                document.getElementById("ctlFileUpload").addEventListener("change", UploadStatus);

                document.getElementById("fileMessage").innerHTML += " Valid file types are: " + strFileTypes.replace(/'/g, "") + "." + "<br>" + "* = Required.  These characters are not permitted < > ” ’ % ; ( ) & + and  will be removed.<br/>";

                var fileUploadStatus = document.getElementById("fileUploadStatus");

                if (fileUploadStatus.innerHTML.indexOf("File successfully uploaded") != -1) {
                    if ($("#physcialDocumentData").hasClass("none") == true) {
                        $("#physcialDocumentData").removeClass("none")
                    }
                    if ($("#physicaldocumentstable").hasClass("none") == false) {
                        $("#physicaldocumentstable").addClass("none")
                    }
                    if ($("#saveButtonGroup").hasClass("none") == true) {
                        $("#saveButtonGroup").removeClass("none")
                    }
                }
                var uploadProcessing = document.getElementById("hfPhysicalLocation").value;
                //alert("uploadProcessing:" + uploadProcessing);
                if (uploadProcessing == "") {
                    $('#btnView').prop('disabled', false);
                    var selectedTab = getUrlParameter('tab'); //keep as null for now
                    //buttonsVM.shTab(selectedTab);
                } else {
                    $('#btnView').prop('disabled', true);
                    if ($("#docEdit").hasClass("none") == true) {
                        $("#docEdit").removeClass("none");
                    }
                }
            });


            ko.bindingHandlers.formattedDate = {
                update: function (element, valueAccessor) {
                    if ((moment(ko.unwrap(valueAccessor())).isValid())) {
                        $(element).text(moment(ko.unwrap(valueAccessor())).format('lll'));
                    }

                }
            };

            function getUrlParameter(name) {
                name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
                var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
                var results = regex.exec(location.search);
                return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
            };

            function UploadStatus() {
                var fileUploadStatus = document.getElementById("fileUploadStatus");
                fileUploadStatus.innerHTML = "";

                var ext = $('#ctlFileUpload').val().split('.').pop().toLowerCase();
                //pdf,doc,docx,rtf,txt,xls,xlsx,jpeg,jpg,png
                if (ext == null) {
                    fileUploadStatus.innerHTML = "Select a file.";
                } else {
                    $('#btnView').prop('disabled', true);
                    if ($.inArray(ext, validFileTypes) == -1) {
                        fileUploadStatus.innerHTML = "Upload status: Your file will not be uploaded because it is an invalid file type. ";
                    }
                    else {
                        $("#btnUpload").removeClass("none");
                    }
                }
            }

        });
    });

</script>

