
SET(SQLITE_SEARCH_PATHS
    /usr/local/
    /usr
    /opt
)

FIND_PATH(SQLITE_INCLUDE_DIR sqlite3.h 
    HINTS ${SQLITE_ROOT}
    PATH_SUFFIXES include
    PATHS ${SQLITE_SEARCH_PATHS}
)
FIND_LIBRARY(SQLITE_LIBRARY sqlite3
    HINTS ${SQLITE_ROOT}
    PATH_SUFFIXES lib64 lib bin
    PATHS ${SQLITE_SEARCH_PATHS}
)

IF(SQLITE_INCLUDE_DIR AND SQLITE_LIBRARY)
   SET(SQLITE_FOUND TRUE)
ENDIF (SQLITE_INCLUDE_DIR AND SQLITE_LIBRARY)


IF(SQLITE_FOUND)
    MESSAGE(STATUS "Found Sqlite3: ${SQLITE_LIBRARY}")
ELSE(SQLITE_FOUND)
    MESSAGE(STATUS "Could not find Sqlite3. Some features may not be available.")
ENDIF(SQLITE_FOUND)