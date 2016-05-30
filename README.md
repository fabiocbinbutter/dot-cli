# dot-cli
A command-line wrapper for the doT templating engine.

*Example stdout usage: `node index.js template="template.dot" json="data.json"`
*Example batch usage: `node index.js template="template.dot" json="data/*.json" output="out/%t %j.html"`

#Arguments
* `--template=<glob>` or `-t <glob>` . A glob specifying your dot file(s) (Required)
* `--json=<glob>` or `-j <glob>` . A glob specifying your json data file(s) (Required)
* `--output=<pattern>` or `-o <pattern>` . A pattern specifying where to write the output. The tokens `%t` and `%j` are replaced with the filename of the respective template and json files, which is useful when a glob mathes multiple files. If this argument is not provided, the output will be to stdout.
* `--encoding=...`. The encoding of your files, as accepted by fs.readFileSync. Default 'utf8'
* `-e`. Set this flag to turn template compilation, JSON parsing, or template application errors into fatal errors. By default, such errors write to stderr and the script continues.

All arguments are also passed through to the glob library, so any [glob options] (https://www.npmjs.com/package/glob#options) can also be used.
