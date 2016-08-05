package org.cert.restful;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.Properties;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.naming.Context;
import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.sql.DataSource;
//External libs
import net.sf.json.*;
import net.sf.json.xml.XMLSerializer;
//Out libs
import org.cert.utils.PropertiesLoader;
/*
REST
Copyright (c) 2016 Carnegie Mellon University.
All Rights Reserved.

NO WARRANTY. THIS CARNEGIE MELLON UNIVERSITY AND SOFTWARE ENGINEERING INSTITUTE MATERIAL IS FURNISHED ON AN “AS-IS” BASIS. CARNEGIE MELLON UNIVERSITY MAKES NO WARRANTIES OF ANY KIND, EITHER EXPRESSED OR IMPLIED, AS TO ANY MATTER INCLUDING, BUT NOT LIMITED TO, WARRANTY OF FITNESS FOR PURPOSE OR MERCHANTABILITY, EXCLUSIVITY, OR RESULTS OBTAINED FROM USE OF THE MATERIAL. CARNEGIE MELLON UNIVERSITY DOES NOT MAKE ANY WARRANTY OF ANY KIND WITH RESPECT TO FREEDOM FROM PATENT, TRADEMARK, OR COPYRIGHT INFRINGEMENT.

Released under a BSD-style license, please see license.txt or contact permission@sei.cmu.edu for full terms.  DM-0003716

This Software includes and/or makes use of the following Third-Party Software subject to its own license:
a.	jQuery : Copyright (c) 2016 jQuery Foundation (jquery.org/license)
b.	Bootstrap-table: Copyright (c) 2012-2016 Zhixin Wen wenzhixin2010@gmail.com (https://github.com/wenzhixin/bootstrap-table/blob/develop/LICENSE )
c.	D3 framework: Copyright 2010-2016 Mike Bostock (https://github.com/d3/d3/blob/master/LICENSE)
d.	Leaflet : Copyright (c) 2010-2016, Vladimir Agafonkin and Copyright (c) 2010-2011, CloudMade, (https://github.com/Leaflet/Leaflet/blob/master/LICENSE)


License.txt file:
REST
Copyright 2016 Carnegie Mellon University
All Rights Reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
1. REST includes and/or makes use of certain third party software ("Third Party Software"). You agree to comply with any and all the Third Party Software terms and conditions listed below and/or contained in any separate license file distributed with REST. The parties who own the Third Party Software ("Third Party Licensors") are intended third party beneficiaries to this License with respect to the terms applicable to their Third Party Software. Redistributions of source code must retain the above copyright notice, this list of conditions and the following acknowledgments and disclaimers.
2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following acknowledgments and disclaimers in the documentation and/or other materials provided with the distribution.
3. Products derived from this software may not include “Carnegie Mellon University,” "SEI” and/or “Software Engineering Institute" in the name of such derived product, nor shall “Carnegie Mellon University,” "SEI” and/or “Software Engineering Institute" be used to endorse or promote products derived from this software without prior written permission. For written permission, please contact permission@sei.cmu.edu.

ACKNOWLEDGMENTS AND DISCLAIMERS:
This material is based upon work funded and supported by the Department of Defense under Contract No. FA8721-05-C-0003 with Carnegie Mellon University for the operation of the Software Engineering Institute, a federally funded research and development center.

Any opinions, findings and conclusions or recommendations expressed in this material are those of the author(s) and do not necessarily reflect the views of the United States Department of Defense.

NO WARRANTY. THIS CARNEGIE MELLON UNIVERSITY AND SOFTWARE ENGINEERING INSTITUTE MATERIAL IS FURNISHED ON AN “AS-IS” BASIS. CARNEGIE MELLON UNIVERSITY MAKES NO WARRANTIES OF ANY KIND, EITHER EXPRESSED OR IMPLIED, AS TO ANY MATTER INCLUDING, BUT NOT LIMITED TO, WARRANTY OF FITNESS FOR PURPOSE OR MERCHANTABILITY, EXCLUSIVITY, OR RESULTS OBTAINED FROM USE OF THE MATERIAL. CARNEGIE MELLON UNIVERSITY DOES NOT MAKE ANY WARRANTY OF ANY KIND WITH RESPECT TO FREEDOM FROM PATENT, TRADEMARK, OR COPYRIGHT INFRINGEMENT.

[Distribution Statement A] This material has been approved for public release and unlimited distribution. Please see Copyright notice for non-US Government use and distribution.

CERT® is a registered mark of Carnegie Mellon University.  

THIRD PARTY SOFTWARE:
a.	jQuery : 
The MIT License (MIT)

Copyright (c) 2016 jQuery Foundation

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
b.	Bootstrap-table :
(The MIT License)

Copyright (c) 2012-2016 Zhixin Wen <wenzhixin2010@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

c.	D3 framework : 
Copyright 2010-2016 Mike Bostock
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

* Neither the name of the author nor the names of contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

d.	Leaflet
Copyright (c) 2010-2016, Vladimir Agafonkin
Copyright (c) 2010-2011, CloudMade
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

   1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

   2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

DM-0003716
 */
@WebServlet("/DBCon")

public class DBCon extends HttpServlet {
	//oracle.jdbc.driver.OracleDriver();
	
	private static final long serialVersionUID = 1L;
    private DataSource dataSource;
    private Connection connection;
    private Statement statement;
    private Context envContext;

    public DBCon() {
        super();
        // TODO Auto-generated constructor stub
    }
    public void init() throws ServletException {
        try {
            // Get DataSource
            Context initContext  = new InitialContext();
            envContext  = (Context)initContext.lookup("java:/comp/env");
            

        } catch (NamingException e) {
            e.printStackTrace();
        }
    }
    public void doPost(HttpServletRequest req, HttpServletResponse resp)
    {
    	try {
    		doGet( req, resp);
    	}catch (Exception e) {
            e.printStackTrace();
    	}
    }
    public void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
    	//System.out.println("Hello here you are in DBCon"+req.getHeader("User-Agent"));

    //			lookup("jdbc/trickler");
    	Properties myprop = PropertiesLoader.getProperties("query.properties");
    	myprop.getProperty("queryname");
        ResultSet resultSet = null;
    	String jQuery =  req.getParameter("callback");

    	if(jQuery == null || jQuery.isEmpty())
    		jQuery="jQuery_"+Long.toString(System.currentTimeMillis());
    	//out.print(jQuery+"({\"rdata\":"); // jQuery start
    	String pattern = "[^a-zA-Z_0-9\\.]";
    	jQuery = jQuery.replaceAll(pattern, "");
    	String jndisource = req.getParameter("jndisource");
        String return_type=req.getParameter("out_type");
        if(return_type == null) return_type="xml";
    	if(jndisource == null || jndisource.isEmpty() ) {
    		PrintError(resp,return_type,jQuery,"No Request sent for 'jndisource'");
    		return;
    	}
        try {
            // Get Connection and Statement
        	//resp.setContentType("text/html");
        	dataSource = (DataSource) envContext.lookup(jndisource);
            connection = dataSource.getConnection();
            //statement = connection.createStatement();
        	String querytype = req.getParameter("querytype");
        	if(querytype == null || querytype.isEmpty() ) {
        		PrintError(resp,return_type,jQuery,"No Request sent for 'querytype'");
        		return;
        	}
            String query = myprop.getProperty(querytype);
            if(query == null || query.isEmpty() ) {
            	PrintError(resp,return_type,jQuery,"No Such query exists update properties file if necessary");
        		return;
            }
            		//"SELECT * FROM SYSTEM.DOMAINNAMES WHERE REVERSE(DOMAINNAME) LIKE REVERSE(?) AND ROWNUM < 1000";
            
            //boolean isOk = m.matches();
            //System.out.println("original pattern matches " + isOk);
            String mquery=query;// +"&myname &yourname &fathers";
            Matcher m = Pattern.compile("(&[a-z]+)").matcher(mquery);
           
            String allvars="";
            int ivar=0;
            while(m.find()) {
            	//System.out.println("Matched"+m.group(1));
            	query=query.replace(m.group(1), "?");
            	allvars +=m.group(1);
            	ivar++;
            }
         // If DBA put a semi-colon we cannot use it in JDBC so throw it away
            query=query.replace(';',' '); 

            PreparedStatement pstatement = connection.prepareStatement(query);
            String[] vars = allvars.split("&");
            ArrayList<String[]> mvars = new ArrayList<String[]>();
            int mrows=0; // Number of query rows we will be doing.
            for(int i=1;i<=ivar;i++) {
            	String mvar=req.getParameter(vars[i]);
            	if( mvar == null || mvar.isEmpty()) {
            		String var_err = vars[i].replaceAll(pattern, "");
            		PrintError(resp,return_type,jQuery,"Variable was not supplied for search "+var_err);
            		return;
            	}
            	String[] mv = req.getParameterValues(vars[i]);
            	mrows=mv.length;
            	mvars.add(mv);
            	//System.out.println(vars[i]+":"+mvar);
            	//System.out.println(vars[i]+":"+Arrays.toString(req.getParameterValues(vars[i])));
            	//pstatement.setString(i, mvar.replace('*', '%'));//+vars[i]);
            }
            
            //If we want Java to do the reverse for us
            //pstatement.setString(1, '%'+new StringBuffer(dsearch).reverse().toString());
            //String dsearch="a.google.com";
            //pstatement.setString(1, '%'+dsearch);
            JSONArray jArray = new JSONArray();
            for(int i=0; i< mrows; i++) {
            	pstatement.clearParameters();
            	//System.out.println("Variables are "+i+":"+Arrays.toString(mvars.get(0)));
            	for(int j=0;j<mvars.size();j++) {
            		//System.out.println("Variables are "+i+":"+j+":"+mvars.get(j)[i]);
            		pstatement.setString(j+1, mvars.get(j)[i]);
            		//Array larray = mvars.toArray();
            		//Array larray = connection.createArrayOf("varchar", mvars.toArray());
            		//pstatement.setArray(1, larray);
            	}
            	//pstatement.setFetchSize(100000);
            	resultSet = pstatement.executeQuery();
            	ResultSetMetaData col = resultSet.getMetaData();
            	int coln = col.getColumnCount();
            	while (resultSet.next()) {
            		JSONObject jobj = new JSONObject();
            		for(int k=1;k<=coln;k++) {                	
            			jobj.put(col.getColumnName(k), (resultSet.getString(k)) != null ? resultSet.getString(k): "");
            			//System.out.print(col.getColumnName(k)+":"+resultSet.getString(k));
            		}
                //System.out.println("");
            		jArray.add(jobj);
            	}
            }
            System.out.println("Query type: "+querytype+", Result size: "+jArray.size());
            Enumeration<?> enParams = req.getParameterNames(); 
            System.out.print("Requested Variables: ");
            while(enParams.hasMoreElements()){
             String paramName = (String)enParams.nextElement();
             System.out.print(paramName+": "+req.getParameter(paramName)+", ");
            }
            System.out.println("END");
           System.out.println("Requested at :"+System.currentTimeMillis()+" by : "+req.getRemoteUser()+" From "+req.getRemoteAddr());
            
            JSONObject rdata= new JSONObject();
            rdata.put("gdata", jArray);
            PrintOutput(resp,return_type,rdata,jQuery);
            
        } catch (javax.naming.NameNotFoundException e) {
        	PrintError(resp,return_type,jQuery,"Invalid JNDI Resource Requested");
        	e.printStackTrace();
        }
        catch (Exception e) {
        	PrintError(resp,return_type,jQuery,"Unknown error has occurred");
            e.printStackTrace();
        }finally {
            try { if(null!=resultSet)resultSet.close();} catch (SQLException e) 
            {e.printStackTrace();}
            try { if(null!=statement)statement.close();} catch (SQLException e) 
            {e.printStackTrace();}
            try { if(null!=connection)connection.close();} catch (SQLException e) 
            {e.printStackTrace();}
        } 
        }
    public void PrintError(HttpServletResponse resp, String return_type, String jQuery, String error) throws IOException {
        JSONObject rdata= new JSONObject();
        rdata.put("gdata",new JSONArray());
        rdata.put("error", error);
        PrintOutput( resp,  return_type,  rdata,  jQuery);
    }
    public void PrintOutput(HttpServletResponse resp, String return_type, JSONObject rdata, String jQuery) throws IOException{
    	PrintWriter out = resp.getWriter();
    	//Make expires header 30 minutes - give the same answer back for up to 30 minutes
    	resp.setDateHeader("Expires", System.currentTimeMillis() + 1800000L);
        //System.out.println("Return type requested "+return_type);
        if (return_type.equals("jquery")) {
        	// Print jquery using callback
        	resp.setContentType("application/javascript");
        	out.println(jQuery+"("+rdata+");");
        }	
        else if (return_type.equals("xml")) {
        	resp.setContentType("text/xml");
        	out.println(new XMLSerializer().write(rdata));
        }
        else if (return_type.equals("json")) {
        	resp.setContentType("application/json");
            out.println(rdata);
        } else {
        	//If out_type variable is not requested then just send not content-type: header
        	out.println(rdata);
        }
    }
}
