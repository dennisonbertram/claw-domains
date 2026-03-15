#!/usr/bin/env node
import { Command } from 'commander'
import { initCommand } from './commands/init.js'
import { registerCommand } from './commands/register.js'
import { lookupCommand } from './commands/lookup.js'
import { listCommand } from './commands/list.js'
import { setRecordCommand } from './commands/set-record.js'
import { getRecordCommand } from './commands/get-record.js'
import { renewCommand } from './commands/renew.js'
import { balanceCommand } from './commands/balance.js'

const program = new Command()
  .name('claw')
  .version('0.1.0')
  .description('CLI for managing .claw domains')
  .option('--json', 'Output in JSON format')

program.addCommand(initCommand)
program.addCommand(registerCommand)
program.addCommand(lookupCommand)
program.addCommand(listCommand)
program.addCommand(setRecordCommand)
program.addCommand(getRecordCommand)
program.addCommand(renewCommand)
program.addCommand(balanceCommand)

program.parse(process.argv)
