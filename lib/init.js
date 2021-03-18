'use babel'

import LinterVlogLintProvider from './linter-verilog-vlog'

export default {
  config: {
    vlogOptions: {
      title: 'Options for vlog command',
      description: 'Comma separated list of vlog options.',
      type: 'array',
      default: ['-lint', '-quiet'],
      order: 0
    },
    includePathsRelativeToTheProject: {
      title: 'Project Include Paths',
      description: 'Comma separated list of include paths, relative to the Atom project root.',
      type: 'array',
      default: [],
      order: 1
    },
    includePathsRelativeToTheSourceFile: {
      title: 'Relative include paths',
      description: 'Comma separated list of include paths, relative to the source file being linted.',
      type: 'array',
      default: [],
      order: 2
    },
    workDir: {
      title: 'Work directory for vlog command',
      description: 'Vlog must create a compiled library. Give a path where the library will go.',
      type: 'string',
      default: 'C:\\_atom_linter_vlog_lib_delete_me',
      order: 3
    },
    ignoredVlogErrorCodes: {
      title: 'Ignored Vlog Error Codes',
      description: 'Comma separated list of vlog error codes to ignore. Number part only... for (vlog-13533), just put \'13533\'',
      type: 'array',
      default: [],
      order: 4
    }
  },

  provideLinter: () => LinterVlogLintProvider
}
