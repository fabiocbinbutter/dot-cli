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
const outputCompiledFunctions = !jsonGlob;

const globOptions=cliArgs;

const encoding=cliArgs.encoding||'utf8';

const tFiles=glob.sync(templateGlob,globOptions);
const jFiles=jsonGlob && glob.sync(jsonGlob,globOptions);

if(!tFiles.length){console.warn("Warning: No template files were matched.")}
if(jsonGlob && !jFiles.length){console.warn("Warning: No json files were matched.")}

tFiles.forEach(function(t){
		const tFile=fs.readFileSync(t,{encoding:encoding});
		var template;
		try{
				template=dot.template(tFile);
			}catch(e){
				console.error(e);
				if(breakOnErrors){process.exit(1);}
				return;
			}
		if(outputCompiledFunctions){
				writeout(outpattern, t, "", "module.exports="+template.toString())
			}else{
				jFiles.forEach(function(j){
						const jFile=fs.readFileSync(j,{encoding:encoding});
						var output;
						try{
								output=template(JSON.parse(jFile));
							}catch(e){
								console.error(e);
								if(breakOnErrors){process.exit(1);}
								return;
							}
						writeout(outpattern, t, j, output)
					});
			}
	});
	if(outputCompiledFunctions){
			writeout(outpattern, "index.", "", "module.exports={\n"
					+tFiles.map(t=>
							'"'+escapeStringLiteral(filename(t))+'":require("./'+escapeStringLiteral(filename(t))+'.js")'
						).join("\n")+"\n}"
				)
		}

function writeout(outpattern, t, j, output){
		if(outpattern){
				writeFileSyncPlusPath(
						outpath(outpattern,t,j),
						output
					)
			}else{
				process.stdout.write(output);
			}
	}

function writeFileSyncPlusPath(outpath, output){
		outpath.split('/').slice(0,-1).reduce(function(accum,x,i){
				accum.push(x); const path=accum.join('/')
				//e.g. for a/b/c.txt => path: "a","a/b"
				//e.g. for /a/b/c.txt => path: "", "/a", "/a/b"
				if(path && !fs.existsSync(path)){fs.mkdirSync(path)}
				return accum;
			},[])
		fs.writeFileSync(outpath,output);
	}

function outpath(pattern,t,j){
		return outpattern.replace("%t",filename(t)).replace("%j",filename(j))
	}

function filename(x){
		return x.split("/").slice(-1).join("").split(".").slice(0,-1).join(".");
	}

function escapeStringLiteral (string) {
		return ('' + string).replace(/["'\\\n\r\u2028\u2029]/g, function (c) {
				switch (c) {
						case '"':
						case "'":
						case '\\':
							return '\\' + c
						case '\n':
							return '\\n'
						case '\r':
							return '\\r'
						case '\u2028':
							return '\\u2028'
						case '\u2029':
							return '\\u2029'
					}
			});
	}
