
// Constructor to generate objects that identify orbital elements.
function Trajectory(name, smA,oI,aP,oE,aN,mAe,Sidereal){

   this.name = name                          // name the object
   this.smA = smA                            // semi major axis
   this.oI = oI * 0.01745329                 // orbital inclination --> convert degrees to radians
   this.aP = aP * 0.01745329                 // argument of Perigee --> convert degrees to radians
   this.oE = oE                              // orbital eccentricity
   this.aN = aN * 0.01745329                 // ascending node --> convert degrees to radians
   this.period = Sidereal                    // siderial period as a multiple of Earth's orbital period
   this.epochMeanAnomaly = mAe * 0.01745329  // mean anomaly at epoch 
   this.trueAnomoly = 0                      // initialize to mean anomaly at epoch
   this.position = [0,0,0] 
   this.time = 0 
}
//--------------------------------------------
//        Trajectory Propagator
//--------------------------------------------
Trajectory.prototype.propagate = function(uA){
// Purpose: Determine a position on an orbital trajectory based on a true anomoly.
// Used by the traceOrbits function to draw the orbits.
var pos = [] ;
var xdot; var ydot; var zdot;            // velocity coordinates
var theta = uA;                          // Update true anomaly.
var smA = this.smA;                      // Semi-major Axis
var oI =  this.oI ;                      // Orbital Inclination
var aP = this.aP ;                       // Get the object's orbital elements.
var oE = this.oE;                        // Orbital eccentricity
var aN = this.aN ;                       // ascending Node
var sLR = smA * (1 - oE^2) ;             // Compute Semi-Latus Rectum.
var r = sLR/(1 + oE * Math.cos(theta));  // Compute radial distance.

// Compute position coordinates pos[0] is x, pos[1] is y, pos[2] is z
pos[0] = r * (Math.cos(aP + theta) * Math.cos(aN) - Math.cos(oI) * Math.sin(aP + theta) * Math.sin(aN)) ;  
pos[1] = r * (Math.cos(aP + theta) * Math.sin(aN) + Math.cos(oI) * Math.sin(aP + theta) * Math.cos(aN)) ;
pos[2] = r * (Math.sin(aP + theta) * Math.sin(oI)) ;

return pos ;
}
//-----------------------------------------------------------------------------------------------------
var PLANET_COLORS = {
  'Mercury': 0x8c8c8c, 'Venus': 0xe6b800, 'Earth': 0x2d6bc0,
  'Mars': 0xc1440e, 'Jupiter': 0xd4a574, 'Saturn': 0xead6b8,
  'Uranus': 0x7ec8e3, 'Neptune': 0x3f54ba
};

function getPlanetColor(name) {
  for (var key in PLANET_COLORS) {
    if (name.indexOf(key) === 0) return PLANET_COLORS[key];
  }
  return 0xffffff;
}

function traceOrbits() {  
    for (var hB in heavenlyBodies) {
        var points = [];
        var i = 0.0;
        
        var hbName = heavenlyBodies[hB].name;
        var isPlanet = hbName.includes("Orbit");
        var color = isPlanet ? getPlanetColor(hbName) : 0xffffff;
        var baseColor = new THREE.Color(color);

        while (i <= 6.28) {
            var orbPos = heavenlyBodies[hB].propagate(i);
            points.push(new THREE.Vector3(orbPos[0], orbPos[1], orbPos[2]));
            i += 0.01;
        }

        var curve = new THREE.CatmullRomCurve3(points);
        var curvePoints = curve.getPoints(200);
        
        var positions = [];
        var colors = [];
        var n = curvePoints.length;
        
        for (var k = 0; k < n; k++) {
            var pt = curvePoints[k];
            positions.push(pt.x, pt.y, pt.z);
            var t = k / (n - 1);
            var fade = Math.sin(t * Math.PI);
            fade = Math.pow(fade, 1.5);
            var c = baseColor.clone().multiplyScalar(fade);
            colors.push(c.r, c.g, c.b);
        }

        var geometry = new THREE.BufferGeometry();
        geometry.addAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.addAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        var material = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true });
        var line = new THREE.Line(geometry, material);
        line.name = hbName + "_trace"; 
        line.userData.baseColors = colors.slice();
        line.userData.planetIndex = -1;

        if (isPlanet) {
          line.material.opacity = 0.55;
          planetsOrbits.push(line);
        } else {
          line.material.opacity = 0.15;
          AstroidsOrbits.push(line);
        }

        scene.add(line);
    }
};


/*-------------------------------------------------------------*
 *   Utility functions for true, eccentric and mean anomalies  *
 *-------------------------------------------------------------*/
 function trueToEccentricAnomaly(e,f) {
// http://mmae.iit.edu/~mpeet/Classes/MMAE441/Spacecraft/441Lecture19.pdf slide 7 
 var eccentricAnomaly = 2* Math.atan(Math.sqrt((1-e)/(1+e))* Math.tan(f/2));

	return eccentricAnomaly ;
}
function meanToEccentricAnomaly (e, M) {
// Solves for eccentric anomaly, E from a given mean anomaly, M
// and eccentricty, e.  Performs a simple Newton-Raphson iteration
// Code derived from Matlab scripts written by Richard Rieber, 1/23/2005
// http://www.mathworks.com/matlabcentral/fileexchange/6779-calce-m
   var tol = 0.0001;  // tolerance
   var eAo = M;       // initialize eccentric anomaly with mean anomaly
   var ratio = 1;     // set ratio higher than the tolerance
while (Math.abs(ratio) > tol) {
    var f_E = eAo - e * Math.sin(eAo) - M;
    var f_Eprime = 1 - e * Math.cos(eAo);
    ratio = f_E / f_Eprime;
    if (Math.abs(ratio) > tol) {
        eAo = eAo - ratio;
	 // console.log ("ratio  " + ratio) ;
	  }
    else
        eccentricAnomaly = eAo;
   }
    return eccentricAnomaly 
} 
function eccentricToTrueAnomaly(e, E) {
 // http://mmae.iit.edu/~mpeet/Classes/MMAE441/Spacecraft/441Lecture19.pdf slide 8
	var trueAnomaly = 2 * Math.atan(Math.sqrt((1+e)/(1-e))* Math.tan(E/2));
	return trueAnomaly
}
   function updateTheDate() 
   { // Display the simulated date to the right of the model.
   //  epoch.setTime(epoch.getTime() + simSpeed * 86400)
	 if (simSpeed == 1) {
	   epoch.setDate(epoch.getDate() + 1) ;            // At maximum speed, increment calendar by a day for each clock-cycle.
	 } else {  epoch.setTime(epoch.getTime() + simSpeed * 24 * 3600000) ; }  // 24 hours * milliseconds in an hour * simSpeed 

//	 document.getElementById("modelDate").innerHTML = (epoch.getMonth() + 1) + "-" + epoch.getDate() + "-" + epoch.getFullYear() ;
   }

function updatePosition() 
	{  // With each tick of the clock, propagate the position and set the translation attribute.
	  // Update the position for the following array of objects.
	  var currentPosition = [] ;
      var deltaTime = 0 ;
	  
	  for (var hB in heavenlyBodies) {
	    
		var hbTAnomoly = heavenlyBodies[hB].trueAnomoly ;
	    currentPosition = heavenlyBodies[hB].propagate(hbTAnomoly) ;  // Determine the current position.
		
	    var Xpos = currentPosition[0] ;
	    var Ypos = currentPosition[1] ;
	    var Zpos = currentPosition[2] ;
	    var hBName = heavenlyBodies[hB].name;   // get the name of the current object and update translation
		
		curObj = scene.getObjectByName(hBName) ;
		curObj.position.set (Xpos, Ypos, Zpos) ;
		
	// console.log(curObj.name + "  " + curObj.position.x + ",  " + curObj.position.y + ",  " + curObj.position.z  ) ;
		  
	 // Calculate mean motion n:
		 var n = (2 * Math.PI) / (heavenlyBodies[hB].period) ;   // radians per day
		 
	 // Calculate Eccentric Anomaly E based on the orbital eccentricity and previous true anomaly:
	    var e = heavenlyBodies[hB].oE ;
		var f = heavenlyBodies[hB].trueAnomoly          // heavenlyBodies[hB].trueAnomoly ;
        var eA = trueToEccentricAnomaly(e,f)            // convert from true anomaly to eccentric anomaly
		
	 // Calculate current Mean Anomaly	
		var m0 = eA - e * Math.sin(eA);	
	   
	//  deltaTime = (Math.abs(m0/n) - heavenlyBodies[hB].time) * simSpeed
    //  deltaTime = Math.abs(m0/n) * simSpeed
	    deltaTime = simSpeed * n

	 // Update Mean anomaly by adding the Mean Anomaly at Epoch to the mean motion * delaTime
         var mA = deltaTime + m0
		
		heavenlyBodies[hB].time = heavenlyBodies[hB].time +  deltaTime // increment timer

        eA = meanToEccentricAnomaly (e, mA) 
        var trueAnomaly = eccentricToTrueAnomaly(e, eA) 
		heavenlyBodies[hB].trueAnomoly = trueAnomaly
		
//    console.log(hBName + " time = " +  heavenlyBodies[hB].time + "  delta time " + dt)		
//	  console.log(hBName + " eccentric anomaly " + E + " sin(f) " + sinf + " cos(f) " + cosf )
//	  console.log(hBName + " mean anomaly " + mA + " eccentric anomaly " + eA ) 		
//    console.log (hBName + " trueAnomaly = " + trueAnomaly + "   true Anomaly  " + heavenlyBodies[hB].trueAnomoly + "  mean motion = " + n) ;
//	  console.log(hBName + " eccentricity " + e + " true anomaly " + f + " Eccentric anomaly " + eA + " Mean anomaly " + m0 + " mean motion " + n) 	 
	  }
	  updateTheDate() ;
	  
	};

/*----------------------------------------------------------------------------------------------*
 *                            {--- Global variables --}                                         *
 *----------------------------------------------------------------------------------------------*/
var epoch = new Date('October 5, 2024');  // start the calendar 
var simSpeed = 0.75 ;                        // value from the scroll control
var solid = true;                        // start simulation with solid rendering of orbits
var solidLabels = true;                  // start simulation with solid rendering of Labels

// Specify trajectories' sMA, oI, aP, oE, aN, mAe, Sidereal <-- refer to Trajectory constructor.
// Orbital elements source: http://www.met.rdg.ac.uk/~ross/Astronomy/Planets.html#rates
// Orbital period source: http://en.wikipedia.org/wiki/Orbital_period
// Mean Anomoly at epoch for planets http://farside.ph.utexas.edu/teaching/celestial/Celestial/node34.html
// Source: http://neo.jpl.nasa.gov/cgi-bin/neo_elem?type=PHA;hmax=all;max_rows=20;action=Display%20Table;show=1&sort=moid&sdir=ASC
