{ CompositeDisposable } = require 'atom'
path = require 'path'

lint = (editor) ->
  helpers = require('atom-linter')
  regex = /\*\*([^:]+):[^:]*:[^:]*\(([^\)]+)\):(.+)/
  file = editor.getPath()
  dirname = path.dirname(file)
  proj_path = atom.project.relativizePath(file)[0]

  args = ("#{arg}" for arg in atom.config.get('linter-verilog-vlog.vlogOptions'))
  args = args.concat [file, '-work', atom.config.get('linter-verilog-vlog.workDir')]
  args = args.concat ("+incdir+#{proj_path}\/#{arg}" for arg in atom.config.get('linter-verilog-vlog.includePathsRelativeToTheProject'))
  args = args.concat ("+incdir+#{dirname}\/#{arg}" for arg in atom.config.get('linter-verilog-vlog.includePathsRelativeToTheSourceFile'))

  helpers.exec('vlog', args, {stream: 'both'}).then (output) ->
    lines = output.stdout.split("\n")
    messages = []
    for line in lines
      if line.length == 0
        continue;

      console.debug(line)
      parts = line.match(regex)
      if !parts || parts.length != 4
        console.debug("Droping line:", line)
        if line.match(/\*\* Error/)
          atom.notifications.addError("linter-verilog-vlog: vlog command died with this message: #{line}", {'dismissable': true})
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
    vlogOptions:
      type: 'array'
      default: ['-lint', '-quiet']
      description: 'Comma separated list of vlog options.'
    includePathsRelativeToTheProject:
      type: 'array'
      default: []
      description: 'Comma separated list of include paths, relative to the Atom project root.'
    includePathsRelativeToTheSourceFile:
      type: 'array'
      default: []
      description: 'Comma separated list of include paths, relative to the source file being linted.'
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
