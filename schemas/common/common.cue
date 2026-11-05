package common

// net-api's duration: 1 to 99999 seconds, minutes, hours or days.
#duration: =~"^[1-9][0-9]{0,4}[smhd]$"

// A variable (`$device`) or DevEUIs.
#devices: =~"^\\$[A-Za-z_][A-Za-z0-9_]*$" | [...=~"^[0-9a-fA-F]{16}$"]
