@echo off
@title AvaIre

set AvaIre=%cd%

for /L %%n in (1,0,10) do (
    echo %AvaIre%\.. && cls && npm start
    
    echo.
    echo The application has been stopped, and will restart in 5 seconds.
    echo Press Ctrl+C to interrupt the process.
    sleep 5
)
