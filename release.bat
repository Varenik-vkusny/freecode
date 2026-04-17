@echo off
git tag -s %1 -m "Release %1" && git push origin %1
