/*
*/
function subnet2range(subnet) {
	 var arr=subnet.split("/");
	 var ip=arr[0];
	 var sub=parseInt(arr[1]);
	 sub=32-sub;
	 return [((ip2long(ip) >>> (sub))*Math.pow(2,sub)),((ip2long(ip) >>> (sub))*Math.pow(2,sub)+Math.pow(2,sub)-1)];
	}


	function long2ip(long) {
	  if(long < 1) return '';
	  return [long >>> 24, long >>> 16 & 0xFF, long >>> 8 & 0xFF, long & 0xFF].join('.');
	}
	function ip2long(ip) {
	     var ipa=ip.split('.').reverse();
	     var long=0;
	     for(var i=0;i<ipa.length;i++) long=long+ipa[i]*Math.pow(2,i*8);
	     return long;
	}
	function validip(ip) {
		if(!ip) return false;
	     var ipa=ip.split('.').reverse();
	     var check=0;
	     for(var i=0;i<ipa.length;i++) 
	    	 if((parseInt(ipa[i]) <= 255) && (parseInt(ipa[i])>=0)) 
	    		 check++;
	     if(check == 4) return true;
	     else return false;
	}
