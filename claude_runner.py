#!/usr/bin/env python3
import asyncio
import json
import sys
import platform
import time
from subprocess import PIPE

async def run_command(cmd: str, timeout: int = 30):
    """Execute shell command with timeout, cross-platform."""
    is_windows = platform.system() == "Windows"

    if is_windows:
        shell_cmd = ["powershell.exe", "-NoProfile", "-NonInteractive", "-Command", cmd]
    else:
        shell_cmd = ["bash", "-c", cmd]

    print(f"[EXEC] {' '.join(shell_cmd)}", file=sys.stderr, flush=True)

    start_time = time.time()

    try:
        process = await asyncio.create_subprocess_exec(
            *shell_cmd,
            stdout=PIPE,
            stderr=PIPE
        )

        stdout_data, stderr_data = await asyncio.wait_for(
            process.communicate(),
            timeout=timeout
        )

        execution_time = time.time() - start_time

        return {
            "stdout": stdout_data.decode("utf-8", errors="replace"),
            "stderr": stderr_data.decode("utf-8", errors="replace"),
            "exit_code": process.returncode,
            "execution_time_seconds": round(execution_time, 2),
            "timed_out": False
        }

    except asyncio.TimeoutError:
        try:
            process.kill()
            await process.wait()
        except:
            pass

        execution_time = time.time() - start_time

        return {
            "stdout": "",
            "stderr": f"Command timed out after {timeout} seconds",
            "exit_code": -1,
            "execution_time_seconds": round(execution_time, 2),
            "timed_out": True
        }

    except Exception as e:
        execution_time = time.time() - start_time

        return {
            "stdout": "",
            "stderr": f"Execution error: {str(e)}",
            "exit_code": -1,
            "execution_time_seconds": round(execution_time, 2),
            "timed_out": False
        }

async def main():
    """Main loop: read JSON requests from stdin, execute, write results to stdout."""
    while True:
        try:
            line = sys.stdin.readline()

            if not line:
                break

            request = json.loads(line.strip())

            cmd = request.get("cmd")
            timeout = request.get("timeout_seconds", 30)

            if not cmd:
                result = {
                    "error": "Missing 'cmd' parameter",
                    "exit_code": -1
                }
            else:
                result = await run_command(cmd, timeout)

            response = {
                "type": "tool_result",
                "content": json.dumps(result, ensure_ascii=False)
            }

            print(json.dumps(response, ensure_ascii=False), flush=True)

        except json.JSONDecodeError as e:
            error_response = {
                "type": "tool_result",
                "content": json.dumps({
                    "error": f"Invalid JSON input: {str(e)}",
                    "exit_code": -1
                })
            }
            print(json.dumps(error_response), flush=True)

        except KeyboardInterrupt:
            break

        except Exception as e:
            error_response = {
                "type": "tool_result",
                "content": json.dumps({
                    "error": f"Unexpected error: {str(e)}",
                    "exit_code": -1
                })
            }
            print(json.dumps(error_response), flush=True)

if __name__ == "__main__":
    asyncio.run(main())
