
var cliArgs = require('minimist')(process.argv.slice(2));
var glob=require("glob");
var fs=require("fs");
var path=require("path");
var dot=require("dot");

var templateGlob=cliArgs.template || cliArgs.t;
var jsonGlob=cliArgs.json || cliArgs.j;
var outpattern=cliArgs.output || cliArgs.o || "$t $j.txt";
if(!templateGlob){throw "template argument is required"}
if(!jsonGlob){throw "json argument is required"}

var globOptions=cliArgs;

var encoding=cliArgs.encoding||'utf8';

var tFiles=glob.sync(templateGlob,globOptions);
var jFiles=glob.sync(jsonGlob,globOptions);

if(!tFiles.length){console.warn("No template files were matched.")}
if(!jFiles.length){console.warn("No json files were matched.")}

tFiles.forEach(function(t){
		var tFile=fs.readFileSync(t,{encoding:encoding});
		var tFrag=filename(t)
		var template=dot.template(tFile);
		jFiles.forEach(function(j){
				var jFile=fs.readFileSync(j,{encoding:encoding});
				var jFrag=filename(j);
				var output=template(jFile);
				console.log(tFrag,jFrag);
				var outpath=outpattern.replace("$t",tFrag).replace("$j",jFrag)
				console.log(outpath);
				fs.writeFileSync(outpath,output);
			});
	});

function filename(x){
		return x.split("/").slice(-1).join("").split(".").slice(0,-1).join(".");
	}
