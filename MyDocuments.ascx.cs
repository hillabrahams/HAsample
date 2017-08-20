using Flvs.Core.Entities;
using System;
using System.Configuration;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text;
using System.Web;
using System.ServiceModel;
using System.Web.Configuration;
using VISNCS.MuhimbiServiceReference1;
using Flvs.Core.Logic;

namespace VISNCS.UserControls.MyDocuments
{    
    public partial class MyDocuments : SinglePageAppControl
    {

        static int UserID;
        static int VirtualSchoolID;
        bool NoContext = false;
        CookiesDB _UserState = ((CookiesDB)HttpContext.Current.Items["UserState"]);
        string savePath = ConfigurationManager.AppSettings["FilePathWrite"];
        string viewPath = ConfigurationManager.AppSettings["FilePathRead"];        
        int StudentId = 0;             

        protected void Page_Load(object sender, EventArgs e)
        {
            
            fileUploadStatus.Text = "";
            hfPhysicalLocation.Value = "";
            try
            {
                UserSecurity _UserSecurity = (UserSecurity)(HttpContext.Current.Items["UserSecurity"]);
                // Check to make sure the user can view this module                
                UserID = _UserSecurity.UserID;                
                if (SinglePageAppSecurity.HasViewPermissions(ModuleConfiguration, _UserSecurity.UserID) == false)
                {
                    Response.Redirect(Constants.AccessDeniedPage);
                    return;
                }

                // Check for Student Context.
                
                if (Flvs.Core.Utilities.Utils.ToInt(_UserState.Crum["StudentID"], false, 0) == 0)
                {
                    Response.Redirect("~/default.aspx?pageID=" + ((int)Constants.PageID.NoStudentSelected));
                }
                else
                {
                    StudentId = int.Parse(_UserState.Crum["StudentID"].ToString());
                    hfStudentId.Value = StudentId.ToString();

                    StudentManager mgrStudent = new StudentManager();
                    var _myStudent = new Flvs.Core.Entities.Student();

                    _myStudent = mgrStudent.GetStudentById(StudentId);                    

                    ViewState["virtualSchoolID"] = _myStudent.AdmissionsVirtualSchoolID.ToString();
                    hfVirtualSchoolId.Value = ViewState["virtualSchoolID"].ToString();

                    hfStudentFirstName.Value = _myStudent.FirstName;
                    hfStudentLastName.Value = _myStudent.LastName;
                    hfStudetUsername.Value = _myStudent.Username;
                    hfStudentDOB.Value = _myStudent.DateOfBirth.ToString();
                    hfStudentDistrict.Value = _myStudent.DistrictId.ToString();
                    hfStudentPhysicalSchool.Value = _myStudent.PhysicalSchoolId.ToString();
                    hfStudentGradeLevel.Value = _myStudent.GradeLevel.ToString();
                    hfStudentEmail.Value = _myStudent.EmailAddress;
                    hfDocumentUploadEmailSender.Value = ConfigurationManager.AppSettings["DocumentUploadEmailSender"];
                }


            }
            catch (Exception ex)
            {
                ExceptionManager.Publish(ex);
            }

            HttpRuntimeSection runTime = (HttpRuntimeSection)WebConfigurationManager.GetSection("system.web/httpRuntime");
            
            int maxRequestLength = (runTime.MaxRequestLength) / 1024; //maxRequestLength is in KB, so * 1024 for MB 

            //double maxFileSizeforDisplay = maxRequestLength; 
            lblFileSizeMessage.Text = "<p id='fileMessage'>The maximum file size for uploading is " + String.Format("{0:n2}", maxRequestLength) + " Megabytes.</p>";

            
        }

       
        string filePath = "";
        
        void DocToPdf(string path, string viewPath)
        {
            //string pdfPath = "";
            string fileSuffix = Path.GetExtension(path);
            if (fileSuffix.ToUpper() != ".PDF")
            {
                DocumentConverterServiceClient client = null;

                try
                {
                    // ** Determine the source file and read it into a byte array.
                    //string sourceFileName = textBox1.Text;
                    byte[] sourceFile = File.ReadAllBytes(path);

                    // ** Open the service and configure the bindings
                    client = OpenService(ConfigurationManager.AppSettings["MuhimbiConvertURL"]);

                    //** Set the absolute minimum open options
                    OpenOptions openOptions = new OpenOptions();
                    openOptions.OriginalFileName = Path.GetFileName(path);
                    openOptions.FileExtension = Path.GetExtension(path);

                    // ** Set the absolute minimum conversion settings.
                    ConversionSettings conversionSettings = new ConversionSettings();
                    conversionSettings.Fidelity = ConversionFidelities.Full;
                    conversionSettings.Quality = ConversionQuality.OptimizeForPrint;

                    // ** Carry out the conversion.
                    byte[] convFile = client.Convert(sourceFile, openOptions, conversionSettings);

                    // ** Write the converted file back to the file system with a PDF extension.
                    string destinationFileName = Path.GetDirectoryName(viewPath) + @"\" +
                                                 Path.GetFileNameWithoutExtension(viewPath) +
                                                 "." + conversionSettings.Format;
                    using (FileStream fs = File.Create(destinationFileName))
                    {
                        fs.Write(convFile, 0, convFile.Length);
                        fs.Close();
                    }

                    Console.WriteLine("File converted to " + destinationFileName);
                }
                catch (FaultException<WebServiceFaultException> ex)
                {

                    Console.WriteLine("FaultException occurred: ExceptionType: " +
                                     ex.Detail.ExceptionType.ToString());
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex.ToString());
                }
                finally
                {
                    CloseService(client);
                    //client.Close();
                }

            }
            else {
                if (String.Equals(path, viewPath, StringComparison.OrdinalIgnoreCase) == false) {
                    //copy original to viewPath, it is already a PDF, leave in place if the paths are the same
                    File.Copy(path, viewPath, true);
                }
               
            }

        }
        /// <summary>
        /// Configure the Bindings, endpoints and open the service using the specified address.
        /// </summary>
        /// <returns>An instance of the Web Service.</returns>
        public static DocumentConverterServiceClient OpenService(string address)
        {
            DocumentConverterServiceClient client = null;

            try
            {
                HttpRuntimeSection runTime = (HttpRuntimeSection)WebConfigurationManager.GetSection("system.web/httpRuntime");
                //Approx 100 Kb(for page content) size has been deducted because the maxRequestLength proprty is the page size, not only the file upload size
                int maxRequestLength = (runTime.MaxRequestLength - 100) * 1024; //maxRequestLength is in KB, so * 1024 for MB 
                BasicHttpBinding binding = new BasicHttpBinding();
                // ** Use standard Windows Security.
                binding.Security.Mode = BasicHttpSecurityMode.TransportCredentialOnly;
                binding.Security.Transport.ClientCredentialType =
                                                            HttpClientCredentialType.Windows;
                // ** Increase the Timeout to deal with (very) long running requests.
                binding.SendTimeout = TimeSpan.FromMinutes(30);
                binding.ReceiveTimeout = TimeSpan.FromMinutes(30);
                // ** Set the maximum document size to 50MB
                binding.MaxReceivedMessageSize = maxRequestLength;
                binding.ReaderQuotas.MaxArrayLength = maxRequestLength;
                binding.ReaderQuotas.MaxStringContentLength = maxRequestLength;

                // ** Specify an identity (any identity) in order to get it past .net3.5 sp1
                EndpointIdentity epi = EndpointIdentity.CreateUpnIdentity("unknown");
                EndpointAddress epa = new EndpointAddress(new Uri(address), epi);

                client = new DocumentConverterServiceClient(binding, epa);

                client.Open();

                return client;
            }
            catch (Exception)
            {
                CloseService(client);
                throw;
            }
        }


        /// <summary>
        /// Check if the client is open and then close it.
        /// </summary>
        /// <param name="client">The client to close</param>
        public static void CloseService(DocumentConverterServiceClient client)
        {
            if (client != null && client.State == CommunicationState.Opened)
                client.Close();
        }

        string ParseUserId(int userid, string path)
        {
            bool exists = false;
            filePath = path;
            string strUserID = userid.ToString().PadLeft(9, '0');
            string folderFirst = strUserID.Substring(0, 4) + "\\";
            string folderSecond = strUserID.Substring(4, 2) + "\\";
            string folderThird = strUserID.Substring(6, 2) + "\\";
            string folderFourth = strUserID.Substring(8, 1) + "\\";
            string[] folderArray = new string[] { folderFirst, folderSecond, folderThird, folderFourth };
            for (int i = 0; i <= folderArray.Count() - 1; i++)
            {
                filePath += folderArray[i];
                exists = Directory.Exists(filePath);
                if (!exists)
                {
                    Directory.CreateDirectory(filePath);

                }
            }
            return filePath;
        }

       
        string CreateFilePath(int userid, string path)
        {
            bool exists = Directory.Exists(path); //file share root
            try
            {

                if (exists) // file share is accessable
                {
                    filePath = ParseUserId(userid, path);
                }
                else
                {
                    ViewState["fileUploadStatus"] = "Upload status: The file could not be uploaded. The following error occured: System error, please contact techical support.";
                    fileUploadStatus.Text = ViewState["fileUploadStatus"].ToString();
                }
            }
            catch (Exception ex)
            {
                ViewState["fileUploadStatus"] = "Upload status: The file could not be uploaded. The following error occured: System error, please contact techical support.";
                fileUploadStatus.Text = ViewState["fileUploadStatus"].ToString();
            }
            return filePath;
        }
       

        bool CheckIsExecutable(byte[] filedata)
        {
            var firstBytes = new byte[2];
            firstBytes[0] = filedata[0];
            firstBytes[1] = filedata[1];
            return Encoding.UTF8.GetString(firstBytes) == "MZ";
        }
        protected void btnUpload_Click(object sender, EventArgs e)
        {
            if (ctlFileUpload.HasFile)
            {
                try
                {
                    string fileName = Path.GetFileName(ctlFileUpload.FileName);
                    string extension = Path.GetExtension(fileName);
                  
                    //int id = 0;
                  

                    fileName = System.DateTime.Now.ToString("yyyy_MM_dd_hh_mm_ss_fff") + "_" +
                             fileName.Replace(" ", "-").Replace("_", "-");

                    byte[] fileData = null;
                    //check for executable
                    fileData = ctlFileUpload.FileBytes;
                    if (CheckIsExecutable(fileData))
                    {
                        fileUploadStatus.Text = "Upload status: Your file was not uploaded because it is an invalid file type.";
                    }
                    else
                    {
                                                   
                        savePath = CreateFilePath(StudentId, savePath);
                        viewPath = CreateFilePath(StudentId, viewPath); //new per Jamie

                        savePath += fileName;
                        viewPath += fileName;

                        ctlFileUpload.SaveAs(savePath);                        

                        //convert to pdf
                        DocToPdf(savePath, viewPath);
                        
                        ViewState["fileUploadStatus"] = "Upload status: " + Path.GetFileName(ctlFileUpload.FileName) + " :File successfully uploaded! Please enter the following information (required) and then click the Save button.";
                        fileUploadStatus.CssClass = "text-success";
                        fileUploadStatus.Text = ViewState["fileUploadStatus"].ToString();                          
                        extension = Path.GetExtension(viewPath);
                        viewPath = viewPath.Replace(extension, ".PDF");                                              
                        hfPhysicalLocation.Value = viewPath;

                       
                        ctlFileUpload.Dispose();                        
					}

                }
                catch (Exception ex)
                {
                    fileUploadStatus.Text = "Upload status: The file could not be uploaded. The following error occurred: System error, please contact techical support.";
                    hfPhysicalLocation.Value = "";
                }
            }
        }
    }
}