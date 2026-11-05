package model

import (
	"strings"
	"list"
	ds "github.com/pulzar-net/perses-pulzr-datasource/schemas/datasources/pulzr-datasource:model"
	"github.com/pulzar-net/perses-pulzr-datasource/schemas/common"
)

kind: "PulzrFieldQuery"
spec: close({
	ds.#selector
	field:       strings.MinRunes(1)
	fields?:     [...strings.MinRunes(1)] & list.MinItems(1)
	aggregate?:  "mean" | "min" | "max" | "sum" | "count" | "last" | "median" | "p95" | "timeWeighted" | "rises"
	interval?:   common.#duration
	devices?:    common.#devices
	groupBy?:    "device" | "none"
	filter?: [...close({
		field: strings.MinRunes(1)
		op:    "eq" | "ne" | "gt" | "gte" | "lt" | "lte"
		value: _
	})]
	carryForward?: bool
	holdFor?:      common.#duration
	band?:         close({lo: #edge, hi: #edge}) | close({center: #edge, spread: #edge})
})

// A field, carried forward, or a fixed number.
#edge: strings.MinRunes(1) | number
