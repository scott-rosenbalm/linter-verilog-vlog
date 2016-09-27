{ CompositeDisposable } = require 'atom'
path = require 'path'

lint = (editor) ->
  helpers = require('atom-linter')
  regex = /\*\*([^:]+):[^:]*:[^:]*\(([^\)]+)\):(.+)/
  file = editor.getPath()
  dirname = path.dirname(file)

  args = ("#{arg}" for arg in atom.config.get('linter-verilog-vlog.extraOptions'))
  args = args.concat ['-quiet', '-lint', file, '-work', atom.config.get('linter-verilog-vlog.workDir')]
  helpers.exec('vlog', args, {stream: 'both'}).then (output) ->
    lines = output.stdout.split("\n")
    messages = []
    for line in lines
      if line.length == 0
        continue;

      console.log(line)
      parts = line.match(regex)
      if !parts || parts.length != 4
        console.debug("Droping line:", line)
      else
        message =
          filePath: file
          range: helpers.rangeFromLineNumber(editor, parseInt(parts[2])-1, 0)
          type: parts[1].trim()
          text: parts[3].trim()

        messages.push(message)

    return messages


module.exports =
  config:
    extraOptions:
      type: 'array'
      default: []
      description: 'Comma separated list of vlog options'
    workDir:
      type: 'string'
      default: 'D:\\_atom_linter_vlog_lib_delete_me'
      description: 'Vlog must create a compiled library. Give a path where the library will go.'
  activate: ->
    require('atom-package-deps').install('linter-verilog-vlog')

  provideLinter: ->
    provider =
      grammarScopes: ['source.verilog']
      scope: 'project'
      lintOnFly: false
      name: 'Verilog'
      lint: (editor) => lint(editor)
