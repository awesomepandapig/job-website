const express = require('express');
const xml2js = require('xml2js');

var parser = new xml2js.Parser();

const app = express();
const port = 3000;

async function getXMLfromURL(url) {
	try {
		const response = await fetch(url);
		const content = await response.text();
		const data = await parser.parseStringPromise(content);
		return data;
	} catch (err) {
		console.log(err)
	}
}

const localities = [{GS: {}}, {AL: {}}, {AQ: {}}, {ATL: {}}, {AU: {}}, {BH: {}}, {BOS: {}}, {BU: {}}, {BN: {}}, {CT: {}}, {CHI: {}}, {CIN: {}}, {CLE: {}}, {CS: {}}, {COL: {}}, {CC: {}}, {DFW: {}}, {DV:{}}, {DAY:{}}, {DEN: {}}, {DM: {}}, {DET: {}}, {HB: {}}, {HAR: {}}, {HOU: {}}, {HNT: {}}, {IND: {}}, {KC: {}}, {LR: {}}, {LV: {}}, {LA: {}}, {MFL: {}}, {MIL: {}}, {MSP: {}}, {NY: {}}, {OM: {}}, {PB: {}}, {PHL: {}}, {PX: {}}, {PIT: {}}, {POR: {}}, {RA: {}}, {RCH: {}}, {SAC: {}}, {SO: {}}, {SD: {}}, {SF: {}}, {SEA: {}}, {SL: {}}, {TU: {}}, {VB: {}}, {DCB: {}}, {RUS: {}}, {AK: {}}, {HI: {}}];

app.get('/locality=:locality&grade=:grade&step=:step', async (req, res) => {
	let locality = req.params.locality;
	let grade = parseInt(parseInt(req.params.grade))-1;
	let step = parseInt(req.params.step)-1;

	let found = false;
	for(let i = 0; i < localities.length; i++) {
		if(Object.keys(localities[i])[0] == locality) {
			found = true;
		}
	}
	if(!found) {
		res.status(400)
  		res.send({"error": "invalid locality"});
	}
	else if(grade < 0 || grade > 14) {
		res.status(400)
		res.send({"error": "invalid grade"});
	}
	else if(step < 0 || step > 9) {
		res.status(400)
		res.send({"error": "invalid step"});
	}
	else {
		let data = localities[locality];

		if(data == null) {
			localities[locality] = JSON.stringify(await getXMLfromURL(`https://www.opm.gov/policy-data-oversight/pay-leave/salaries-wages/salary-tables/xml/2023/${locality}.xml`));
			data = localities[locality];
		}

		data = JSON.parse(data);

		let annual = parseFloat(data.PayTable.Grades[0].Grade[grade].Steps[0].Step[step].Annual[0]);
		let hourly = parseFloat(data.PayTable.Grades[0].Grade[grade].Steps[0].Step[step].Hourly[0])
		let overtime = parseFloat(data.PayTable.Grades[0].Grade[grade].Steps[0].Step[step].Overtime[0]);

		res.send({annual, hourly, overtime});
	}
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});

/*
	LOCALITIES

	GS - General Schedule (Base)
	AL - ALBANY-SCHENECTADY, NY-MA
	AQ - ALBUQUERQUE-SANTA FE-LAS VEGAS, NM
	ATL - ATLANTA--ATHENS-CLARKE COUNTY--SANDY SPRINGS, GA-AL
	AU - AUSTIN-ROUND ROCK, TX
	BH - BIRMINGHAM-HOOVER-TALLADEGA, AL
	BOS - BOSTON-WORCESTER-PROVIDENCE, MA-RI-NH-ME
	BU - BUFFALO-CHEEKTOWAGA, NY
	BN - BURLINGTON-SOUTH BURLINGTON, VT
	CT - CHARLOTTE-CONCORD, NC-SC
	CHI - CHICAGO-NAPERVILLE, IL-IN-WI
	CIN - CINCINNATI-WILMINGTON-MAYSVILLE, OH-KY-IN
	CLE - CLEVELAND-AKRON-CANTON, OH
	CS - COLORADO SPRINGS, CO
	COL - COLUMBUS-MARION-ZANESVILLE, OH
	CC - CORPUS CHRISTI-KINGSVILLE-ALICE, TX
	DFW - DALLAS-FORT WORTH, TX-OK
	DV - DAVENPORT-MOLINE, IA-IL
	DAY - DAYTON-SPRINGFIELD-SIDNEY, OH
	DEN - DENVER-AURORA, CO
	DM - DES MOINES-AMES-WEST DES MOINES, IA
	DET - DETROIT-WARREN-ANN ARBOR, MI
	HB - HARRISBURG-LEBANON, PA
	HAR - HARTFORD-WEST HARTFORD, CT-MA
	HOU - HOUSTON-THE WOODLANDS, TX
	HNT - HUNTSVILLE-DECATUR-ALBERTVILLE, AL
	IND - INDIANAPOLIS-CARMEL-MUNCIE, IN
	KC - KANSAS CITY-OVERLAND PARK-KANSAS CITY, MO-KS
	LR - LAREDO, TX
	LV - LAS VEGAS-HENDERSON, NV-AZ
	LA - LOS ANGELES-LONG BEACH, CA
	MFL - MIAMI-FORT LAUDERDALE-PORT ST. LUCIE, FL
	MIL - MILWAUKEE-RACINE-WAUKESHA, WI
	MSP - MINNEAPOLIS-ST. PAUL, MN-WI
	NY - NEW YORK-NEWARK, NY-NJ-CT-PA
	OM - OMAHA-COUNCIL BLUFFS-FREMONT, NE-IA
	PB - PALM BAY-MELBOURNE-TITUSVILLE, FL
	PHL - PHILADELPHIA-READING-CAMDEN, PA-NJ-DE-MD
	PX - PHOENIX-MESA-SCOTTSDALE, AZ
	PIT - PITTSBURGH-NEW CASTLE-WEIRTON, PA-OH-WV
	POR - PORTLAND-VANCOUVER-SALEM, OR-WA
	RA - RALEIGH-DURHAM-CHAPEL HILL, NC
	RCH - RICHMOND, VA
	SAC - SACRAMENTO-ROSEVILLE, CA-NV
	SO - SAN ANTONIO-NEW BRAUNFELS-PEARSALL, TX
	SD - SAN DIEGO-CARLSBAD, CA
	SF - SAN JOSE-SAN FRANCISCO-OAKLAND, CA
	SEA - SEATTLE-TACOMA, WA
	SL - ST. LOUIS-ST. CHARLES-FARMINGTON, MO-IL
	TU - TUCSON-NOGALES, AZ
	VB - VIRGINIA BEACH-NORFOLK, VA-NC
	DCB - WASHINGTON-BALTIMORE-ARLINGTON, DC-MD-VA-WV-PA
	RUS - REST OF UNITED STATES
	AK - STATE OF ALASKA
	HI - STATE OF HAWAII
*/