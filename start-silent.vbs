' Design Vault 静默启动器：双击后无窗口，浏览器自动打开。
Option Explicit
Dim shell, fso, here
Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
here = fso.GetParentFolderName(WScript.ScriptFullName)
shell.CurrentDirectory = here
shell.Run """" & here & "\start.bat"" --silent", 0, False
