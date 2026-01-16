@echo off
echo Checking source database (NASB.sqlite) structure...
if exist "data\bible\NASB.sqlite" (
    echo. & echo === Source Database (NASB.sqlite) Tables ===
    sqlite3 "data\bible\NASB.sqlite" ".tables"
    
    echo. & echo === Source Table Structure ===
    for /f "tokens=*" %%a in ('sqlite3 "data\bible\NASB.sqlite" ".tables"') do (
        echo. & echo Table: %%a
        sqlite3 "data\bible\NASB.sqlite" ".schema %%a"
    )
) else (
    echo Error: Source database not found at data\bible\NASB.sqlite
)

echo. & echo Checking target database (bible.db) structure...
if exist "data\bible\bible.db" (
    echo. & echo === Target Database (bible.db) Tables ===
    sqlite3 "data\bible\bible.db" ".tables | findstr /i nasb"
    
    echo. & echo === Target Table Structure ===
    for /f "tokens=*" %%a in ('sqlite3 "data\bible\bible.db" ".tables | findstr /i nasb"') do (
        echo. & echo Table: %%a
        sqlite3 "data\bible\bible.db" ".schema %%a"
    )
) else (
    echo Error: Target database not found at data\bible\bible.db
)

pause
