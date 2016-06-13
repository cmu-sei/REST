package org.cert.utils;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.net.URL;
import java.util.Properties;


public class PropertiesLoader {

public static Properties getProperties(String filename) {
	Properties prop = new Properties();
	try {
		//load a properties file
		//prop.load(new FileInputStream(filename));
		String default_props="/etc/Rest/"+filename;
		File default_props_file=new File(default_props);
		URL r = PropertiesLoader.class.getResource("/");
		if(!default_props_file.exists()) {
			default_props=r.getFile()+"../../META-INF/"+filename;
		}
		
		System.out.println(r.getFile()+"../../META-INF/"+filename);	
		//prop.load(PropertiesLoader.class.getClassLoader().getResourceAsStream(r.getFile()+"../../META-INF/"+filename));
		
		prop.load(new FileInputStream(default_props));
	    	} catch (IOException ex) {
	    		ex.printStackTrace();
	        }
	    	return prop;
}


}
