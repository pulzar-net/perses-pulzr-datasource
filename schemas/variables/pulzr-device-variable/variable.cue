package model

import (
	ds "github.com/pulzr/perses-plugin/schemas/datasources/pulzr-datasource:model"
)

kind: "PulzrDeviceVariable"
spec: close({
	ds.#selector
})
