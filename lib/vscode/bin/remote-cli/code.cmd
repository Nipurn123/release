@echo off
setlocal
set ROOT_DIR=%~dp0..\..\..\..
set VSROOT_DIR=%~dp0..\..
call "%ROOT_DIR%\node.exe" "%VSROOT_DIR%\out\server-cli.js" "code-server" "1.100.2" "65cd38b0aa03cee46e7901bbf0b0921f715ccdfb" "code-server.cmd" %*
endlocal
