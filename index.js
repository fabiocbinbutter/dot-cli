#! /usr/bin/env node

const cliArgs = require('minimist')(process.argv.slice(
		process.argv[0]=="dot-cli"
		?1 //e.g. dot-cli --bla
		:2 //e.g. node index.js --bla
	));
const glob=require("glob");
const fs=require("fs");
const path=require("path");
const dot=require("dot");

const templateGlob=cliArgs.template || cliArgs.t;
const jsonGlob=cliArgs.json || cliArgs.j;
const outpattern=cliArgs.output || cliArgs.o;
const breakOnErrors=cliArgs.e;


if(!templateGlob){console.error("template argument is required"); process.exit(1);}
if(!jsonGlob){console.error("json argument is required"); process.exit(1);}

const globOptions=cliArgs;

const encoding=cliArgs.encoding||'utf8';

const tFiles=glob.sync(templateGlob,globOptions);
const jFiles=glob.sync(jsonGlob,globOptions);

if(!tFiles.length){console.warn("Warning: No template files were matched.")}
if(!jFiles.length){console.warn("Warning: No json files were matched.")}

tFiles.forEach(function(t){
		const tFile=fs.readFileSync(t,{encoding:encoding});
		const tFrag=filename(t)
		var template;
		try{
				template=dot.template(tFile);
			}catch(e){
				console.error(e);
				if(breakOnErrors){process.exit(1);}
				return;
			}
		jFiles.forEach(function(j){
				const jFile=fs.readFileSync(j,{encoding:encoding});
				const jFrag=filename(j);
				var output;
				try{
						output=template(JSON.parse(jFile));
					}catch(e){
						console.error(e);
						if(breakOnErrors){process.exit(1);}
						return;
					}
				if(outpattern){
						const outpath=outpattern.replace("%t",tFrag).replace("%j",jFrag)
						outpath.split('/').slice(0,-1).reduce(function(accum,x,i){
								accum.push(x); const path=accum.join('/')
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
