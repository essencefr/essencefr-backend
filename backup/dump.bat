@REM Creta DB backup by dumping its content

mongodump --uri=%MONGODB_ESSENCEFR_CLUSTER_URI% --db=essencefr --out="C:\Users\youn\Documents\Programming\essencefr\essencefr-backend\backup\db"

pause
exit