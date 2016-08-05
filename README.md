# REST
Data webservices API software called REST is a simple J2EE based application that is designed to connect to legacy databases (RDBMS) and expose the output data via webservices.  REST software is designed to simplify integration of several RDBMS datasources to a cloud friendly webservices layer.  

You can manage the queries by changing the "query.properties" file either in the META-INF folder or in the /etc/Rest/ folder.  The DBCon class will search for /etc/Rest/query.properties file and then fall back to the default local properties file. There is a local example file in META-INF context.

The Database connection is managed via Context.xml using JNDI name space and URI convention.  If you update your context.xml and then upgrade the application context.xml in your tomcat/[appengine]/[context] folder will be used as default first and then fall back to local META-INF folder.  Just like the earlier query.properties file case. This way on upgrades to Rest WAR file the context file can be collected from tomcat/[appengine] folder.


The system library files for JDBC connections are preferably part of your JVM bootstrap library files.  If not, you can add them to this container at WEB-INF/lib/.  After initial install just test the setup in Tomcat7 
For JSON use: http://localhost:8080/Rest/DBCon?jndisource=jdbc/simple&querytype=hsqltest&true=1&out_type=json
for XML use: http://localhost:8080/Rest/DBCon?jndisource=jdbc/simple&querytype=hsqltest&true=1&out_type=xml

for HTML table view visit
http://localhost:8080/bootstrap_table.html?jndisource=jdbc/simple&querytype=hsqltest&true=1&out_type=json

simple json_table is
http://localhost:8080/json_table.html?jndisource=jdbc/simple&querytype=hsqltest&true=1&out_type=json

VERSION: 1.4.9
RELEASE: 20160804
