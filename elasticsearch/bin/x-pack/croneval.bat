@echo off

setlocal enabledelayedexpansion
setlocal enableextensions

call "%~dp0..\elasticsearch-env.bat" || exit /b 1

call "%~dp0x-pack-watcher-env.bat" || exit /b 1

%JAVA% ^
  %ES_JAVA_OPTS% ^
  -Des.path.home="%ES_HOME%" ^
  -Des.path.conf="%ES_PATH_CONF%" ^
  -cp "%ES_CLASSPATH%" ^
  org.elasticsearch.xpack.watcher.trigger.schedule.tool.CronEvalTool ^
  %*

endlocal
endlocal