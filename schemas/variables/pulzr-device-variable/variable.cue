package model

import (
	"strings"
	ds "github.com/pulzar-net/perses-pulzr-datasource/schemas/datasources/pulzr-datasource:model"
)

kind: "PulzrDeviceVariable"
spec: close({
	ds.#selector
	tag?: strings.MinRunes(1)
})
