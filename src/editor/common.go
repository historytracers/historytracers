// SPDX-License-Identifier: GPL-3.0-or-later

package main

import (
	"fmt"
	"time"
)

func htUpdateTimestamp() string {
	newStr := fmt.Sprintf("%d", time.Now().Unix())

	return newStr
}
