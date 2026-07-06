@echo off
set EXE=%~dp0VLC_Launcher.exe

reg add "HKCU\Software\Classes\vlcplay" /ve /d "URL:VLC Protocol" /f
reg add "HKCU\Software\Classes\vlcplay" /v "URL Protocol" /d "" /f
reg add "HKCU\Software\Classes\vlcplay\shell\open\command" /ve /d "\"%EXE%\" \"%%1\"" /f

echo 登録完了
pause