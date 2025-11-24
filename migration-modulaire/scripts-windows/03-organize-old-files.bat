@echo off
REM =====================================================================
REM SCRIPT: Organize Old Files
REM =====================================================================
REM Description: Organise les anciens fichiers dans Archive
REM Author: Claude Code Assistant
REM Date: 2025-11-24
REM Version: 1.0
REM =====================================================================

echo.
echo =====================================================
echo   ORGANISATION DES ANCIENS FICHIERS
echo =====================================================
echo.

REM Variables
set "BASE_DIR=%USERPROFILE%"
set "ARCHIVE_DIR=%BASE_DIR%\Archive\Migration-Prolex-Monolithe"
set "DESKTOP_DIR=%BASE_DIR%\Desktop"
set "DOWNLOADS_DIR=%BASE_DIR%\Downloads"

echo Base directory: %BASE_DIR%
echo Archive directory: %ARCHIVE_DIR%
echo.

REM Créer dossier Archive si n'existe pas
if not exist "%ARCHIVE_DIR%" (
    echo Creating Archive directory...
    mkdir "%ARCHIVE_DIR%"
    echo [OK] Archive directory created
) else (
    echo [INFO] Archive directory already exists
)

echo.
echo =====================================================
echo   NETTOYAGE BUREAU (Desktop)
echo =====================================================
echo.

REM Compter fichiers sur Desktop
set "desktop_files=0"
for %%F in ("%DESKTOP_DIR%\*") do set /a desktop_files+=1

echo Files sur Desktop: %desktop_files%

if %desktop_files% GTR 10 (
    echo [WARNING] Plus de 10 fichiers sur Desktop!
    echo.
    echo Voulez-vous déplacer les anciens fichiers vers Archive? (O/N)
    set /p "move_desktop="

    if /i "%move_desktop%"=="O" (
        echo Déplacement des fichiers...

        REM Créer sous-dossier avec date
        set "date_stamp=%date:~6,4%-%date:~3,2%-%date:~0,2%"
        set "desktop_archive=%ARCHIVE_DIR%\Desktop-%date_stamp%"

        if not exist "%desktop_archive%" mkdir "%desktop_archive%"

        REM Déplacer fichiers (sauf raccourcis système)
        for %%F in ("%DESKTOP_DIR%\*") do (
            if not "%%~nxF"=="desktop.ini" (
                echo   Moving: %%~nxF
                move "%%F" "%desktop_archive%\" >nul 2>&1
            )
        )

        echo [OK] Desktop nettoyé!
    ) else (
        echo [INFO] Nettoyage Desktop annulé
    )
) else (
    echo [OK] Desktop propre (moins de 10 fichiers)
)

echo.
echo =====================================================
echo   NETTOYAGE TÉLÉCHARGEMENTS (Downloads)
echo =====================================================
echo.

REM Compter fichiers vieux de plus de 30 jours dans Downloads
echo Recherche des fichiers anciens (30+ jours)...

REM Créer VBScript pour filtrer par date
echo Set fso = CreateObject("Scripting.FileSystemObject") > "%TEMP%\check_old_files.vbs"
echo Set folder = fso.GetFolder("%DOWNLOADS_DIR%") >> "%TEMP%\check_old_files.vbs"
echo count = 0 >> "%TEMP%\check_old_files.vbs"
echo For Each file In folder.Files >> "%TEMP%\check_old_files.vbs"
echo     If DateDiff("d", file.DateLastModified, Now) ^> 30 Then >> "%TEMP%\check_old_files.vbs"
echo         count = count + 1 >> "%TEMP%\check_old_files.vbs"
echo     End If >> "%TEMP%\check_old_files.vbs"
echo Next >> "%TEMP%\check_old_files.vbs"
echo WScript.Echo count >> "%TEMP%\check_old_files.vbs"

REM Exécuter VBScript
for /f %%i in ('cscript //nologo "%TEMP%\check_old_files.vbs"') do set "old_files=%%i"
del "%TEMP%\check_old_files.vbs"

echo Fichiers anciens trouvés: %old_files%

if %old_files% GTR 0 (
    echo.
    echo Voulez-vous archiver les fichiers de plus de 30 jours? (O/N)
    set /p "move_downloads="

    if /i "%move_downloads%"=="O" (
        echo Archivage des fichiers anciens...

        set "date_stamp=%date:~6,4%-%date:~3,2%-%date:~0,2%"
        set "downloads_archive=%ARCHIVE_DIR%\Downloads-%date_stamp%"

        if not exist "%downloads_archive%" mkdir "%downloads_archive%"

        REM Déplacer fichiers anciens (nécessite PowerShell pour date check)
        powershell -Command "Get-ChildItem -Path '%DOWNLOADS_DIR%' -File | Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-30) } | Move-Item -Destination '%downloads_archive%'"

        echo [OK] Fichiers archivés!
    ) else (
        echo [INFO] Archivage annulé
    )
) else (
    echo [OK] Pas de fichiers anciens à archiver
)

echo.
echo =====================================================
echo   ORGANISATION TERMINÉE
echo =====================================================
echo.
echo Archive location: %ARCHIVE_DIR%
echo.
echo [INFO] Vous pouvez maintenant trier manuellement les fichiers archivés
echo.

pause
