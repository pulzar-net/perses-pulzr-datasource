package model

import (
	"strings"
	ds "github.com/pulzr/perses-plugin/schemas/datasources/pulzr-datasource:model"
	"github.com/pulzr/perses-plugin/schemas/common"
)

kind: "PulzrMetricQuery"
spec: close({
	ds.#selector
	metric:         "occupancyRate" | "turnover" | "dwell" | "reporting"
	field?:         strings.MinRunes(1)
	equals?:        number
	applicationId?: =~"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"
	devices?:       common.#devices
	interval?:      common.#duration
})
