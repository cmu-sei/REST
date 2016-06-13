package org.cert.utils;

public class IPTools {
	public static String IntToIPv4(String ip) {
		Long i;
		try {
			i=Long.parseLong(ip);
		} catch (Exception e) {
			return "0.0.0.0";
		}
		if (i > 4294967295L) return "255.255.255.255";
		if (i<0) return "0.0.0.0";
	    return ((i >> 24 ) & 0xFF) + "." +
	           ((i >> 16 ) & 0xFF) + "." +
	           ((i >>  8 ) & 0xFF) + "." +
	           ( i        & 0xFF);
	}

	public static Long IPv4ToInt(String addr) {
	    String[] addrArray = addr.split("\\.");
	    long num = 0;
	    if(addr.length() != 4) return num;
	    for (int i=0;i<addrArray.length;i++) {
	        int power = 3-i;
	        try {     
	        	num += ((Integer.parseInt(addrArray[i])%256 * Math.pow(256,power)));
	        } catch (Exception e) {
	        	return num;
	        }
	    }
	    return num;
	}

	
}
