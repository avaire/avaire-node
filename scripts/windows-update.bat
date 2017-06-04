@echo off
@title AvaIre - Updating

cd .. && cls && git pull
echo.

if %errorlevel% == 0 (
    echo You can now close the window.
) else (
    echo Looks like the something went wrong while trying to update AvaIre to the latest
    echo version, make sure you're using the git version of AvaIre when running this script.
)

pause >nul
