import { spawn } from 'child_process'
import { existsSync } from 'fs'
import { resolve } from 'path'

const isWindows = process.platform === 'win32'
const venvPython = isWindows 
  ? resolve('backend', 'venv', 'Scripts', 'python.exe')
  : resolve('backend', 'venv', 'bin', 'python')

const pythonCmd = existsSync(venvPython) ? venvPython : (isWindows ? 'python' : 'python3')

console.log(`[Jatayu Backend] Starting with: ${pythonCmd}`)

const proc = spawn(
  pythonCmd,
  ['-m', 'uvicorn', 'main:app', '--app-dir', 'backend', '--reload', '--host', '127.0.0.1', '--port', '8000'],
  {
    stdio: 'inherit',
    shell: false,
  }
)

proc.on('close', (code) => {
  process.exit(code || 0)
})
