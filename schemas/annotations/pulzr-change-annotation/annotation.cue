package model

import (
	"strings"
	"list"
	ds "github.com/pulzar-net/perses-pulzr-datasource/schemas/datasources/pulzr-datasource:model"
	"github.com/pulzar-net/perses-pulzr-datasource/schemas/common"
)

kind: "PulzrChangeAnnotation"
spec: close({
	ds.#selector
	// net-api marks at most four fields in one query.
	fields:   [...strings.MinRunes(1)] & list.MinItems(1) & list.MaxItems(4)
	devices?: common.#devices
	states?: [...close({
		value: number | bool
		label: strings.MinRunes(1)
	})]
})
