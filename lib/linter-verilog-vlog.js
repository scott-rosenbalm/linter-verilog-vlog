'use babel'

/* global atom */

import { exec } from 'child_process'
import { dirname } from 'path'

export default {
  name: 'Verilog Linter',
  scope: 'file', // or 'project'
  lintsOnChange: false, // or true
  grammarScopes: ['source.verilog'],
  lint (textEditor) {
    const file = textEditor.getPath()
    const dirName = dirname(file)
    const projPath = atom.project.relativizePath(file)[0]
    const regex = /\*\*([^:]+):.*[^:]*\(([^)]+)\):(.+)/
    const workDir = atom.config.get('linter-verilog-vlog.workDir')
    let argsString = ''
    atom.config.get('linter-verilog-vlog.vlogOptions').forEach(function (arg) {
      argsString = `${argsString} ${arg}`
    })
    argsString = `${argsString} "${file}" -work "${workDir}"`
    atom.config.get('linter-verilog-vlog.includePathsRelativeToTheProject').forEach(function (incPath) {
      argsString = `${argsString} +incdir+${projPath}/${incPath}`
    })
    atom.config.get('linter-verilog-vlog.includePathsRelativeToTheSourceFile').forEach(function (incPath) {
      argsString = `${argsString} +incdir+${dirName}/${incPath}`
    })

    const options = {}

    // Do something async
    return new Promise(function (resolve) {
      var childProc
      try {
        childProc = exec(
          `vlog ${argsString}`,
          options
        )
      } catch (err) {
        // nothing to do here...
      }

      var messages = []
      var newMessage
      const ignoredCodes = atom.config.get('linter-verilog-vlog.ignoredVlogErrorCodes')
      const readline = require('readline')
      const rl = readline.createInterface({
        input: childProc.stdout
      })

      function msgUnique (msg) {
        if (msg.location.file === newMessage.location.file && msg.location.position[0][0] === newMessage.location.position[0][0] &&
             msg.excerpt === newMessage.excerpt) {
          return false
        } else {
          return true
        }
      }

      function ignoreCode (line) {
        const codeMatch = line.match(/\(vlog-(\d+)\)/)
        var code
        if (!codeMatch) {
          return false
        } else {
          code = codeMatch[1]
        }
        for (var i = 0; i < ignoredCodes.length; i++) {
          if (ignoredCodes[i] === code) {
            return true
          }
        }
        return false
      }

      rl.on('line', function (line) {
        const parts = line.match(regex)
        if (!parts || parts.length !== 4) {
          if (line.match(/\*\* Error/)) {
            atom.notifications.addError(`linter-verilog-vlog: vlog command died with this message: ${line}`, { dismissable: true })
          }
        } else if (!(ignoreCode(line))) {
          const lineNum = parseInt(parts[2])
          const msgSeverity = parts[1].trim().toLowerCase()
          const errorMsg = `${parts[1].trim()}: ${parts[3].trim()}`

          newMessage = {
            location: {
              file: file,
              position: [
                [lineNum - 1, 0],
                [lineNum - 1, 1000]
              ]
            },
            severity: msgSeverity,
            excerpt: errorMsg
          }
          // dont add duplicate messages
          if (messages.every(msgUnique)) {
            messages.push(newMessage)
          }
        }
      })
      function finishUp () {
        resolve(messages)
      }

      rl.on('finish', finishUp)
      rl.on('close', finishUp)
    })
  }
}
