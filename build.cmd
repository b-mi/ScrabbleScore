@echo off
call npm version patch
call ng deploy --base-href=/ScrabbleScore/ --no-silent
pause
