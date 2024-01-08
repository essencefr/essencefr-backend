@REM Restore DB from backup files

@REM '--drop' drops all existing collections before restore (avoid 'duplicate key error' issues)
mongorestore --uri=%MONGODB_ESSENCEFR_CLUSTER_URI% --db=essencefr --dir="C:\Users\youn\Documents\Programming\essencefr\essencefr-backend\backup\db\essencefr" --drop

pause
exit