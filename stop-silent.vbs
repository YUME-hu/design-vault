' Design Vault 静默停止器：双击即可清理后台 Web 服务。
Option Explicit
Dim shell, fso, here
Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
here = fso.GetParentFolderName(WScript.ScriptFullName)
shell.CurrentDirectory = here
shell.Run """" & here & "\stop.bat""", 0, False
