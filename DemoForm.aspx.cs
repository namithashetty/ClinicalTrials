using System.Data;
using System.Collections.Generic;
using System;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Xml;
using Newtonsoft.Json;

public partial class DemoForm : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {

    }

    private void SaveXml()
    {
        if (FileUpload1.HasFile)
        {

            string file = Server.MapPath(FileUpload1.FileName);
            string grand = Path.GetDirectoryName(file);
            //DirectoryInfo d = new DirectoryInfo(file);
            string[] files = Directory.GetFiles(grand);
            Response.Write(file[0]);
            Thread.Sleep(5000);
            foreach (string eachfile in files)
            {
                DataSet ds = new DataSet();
                ds.ReadXml(eachfile);
                //Response.Write(file);
                XmlDocument doc = new XmlDocument();
                doc.Load(eachfile);
                string JsonText = JsonConvert.SerializeXmlNode(doc);
                Response.Write(JsonText);
                Thread.Sleep(2000);
                Response.Flush();
            }
        }
        else
        {
            Response.Write("No files found");
        }
    }

    protected void Button1_Click(object sender, EventArgs e)
    {
        SaveXml();
    }
}
