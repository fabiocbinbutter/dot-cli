#! /usr/bin/env node

var cliArgs = require('minimist')(process.argv.slice(
		process.argv[0]=="dot-cli"
		?1 //e.g. dot-cli --bla
		:2 //e.g. node index.js --bla
	));
var glob=require("glob");
var fs=require("fs");
var path=require("path");
var dot=require("dot");

var templateGlob=cliArgs.template || cliArgs.t;
var jsonGlob=cliArgs.json || cliArgs.j;
var outpattern=cliArgs.output || cliArgs.o;
var breakOnErrors=cliArgs.e;

if(!templateGlob){console.error("template argument is required"); process.exit(1);}
if(!jsonGlob){console.error("json argument is required"); process.exit(1);}

var globOptions=cliArgs;

var encoding=cliArgs.encoding||'utf8';

var tFiles=glob.sync(templateGlob,globOptions);
var jFiles=glob.sync(jsonGlob,globOptions);

if(!tFiles.length){console.warn("Warning: No template files were matched.")}
if(!jFiles.length){console.warn("Warning: No json files were matched.")}

tFiles.forEach(function(t){
		var tFile=fs.readFileSync(t,{encoding:encoding});
		var tFrag=filename(t)
		try{
				var template=dot.template(tFile);
			}catch(e){
				console.error(e);
				if(breakOnErrors){process.exit(1);}
				return;
			}
		jFiles.forEach(function(j){
				var jFile=fs.readFileSync(j,{encoding:encoding});
				var jFrag=filename(j);
				try{
						var output=template(JSON.parse(jFile));
					}catch(e){
						console.error(e);
						if(breakOnErrors){process.exit(1);}
						return;
					}
				if(outpattern){
						var outpath=outpattern.replace("%t",tFrag).replace("%j",jFrag)
						outpath.split('/').slice(0,-1).reduce(function(accum,x,i){
								accum.push(x); var path=accum.join('/')
								//e.g. for a/b/c.txt => path: "a","a/b"
								//e.g. for /a/b/c.txt => path: "", "/a", "/a/b"
								if(path && !fs.existsSync(path)){fs.mkdirSync(path)}
								return accum;
							},[])
						fs.writeFileSync(outpath,output);
					}else{
						process.stdout.write(output);
					}
			});
	});

function filename(x){
		return x.split("/").slice(-1).join("").split(".").slice(0,-1).join(".");
	}
