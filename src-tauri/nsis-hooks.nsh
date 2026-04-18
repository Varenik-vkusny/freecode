!macro NSIS_HOOK_PREINSTALL
  ; Delete stale config from previous installations to avoid migration issues
  Delete "$INSTDIR\freecode.json"
!macroend
