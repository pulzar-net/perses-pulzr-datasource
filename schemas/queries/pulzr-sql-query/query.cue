package model

import (
	"strings"
	ds "github.com/pulzr/perses-plugin/schemas/datasources/pulzr-datasource:model"
)

kind: "PulzrSqlQuery"
spec: close({
	ds.#selector
	sql:         strings.MinRunes(1)
	time?:       strings.MinRunes(1)
	series?:     strings.MinRunes(1)
})
