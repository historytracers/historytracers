// SPDX-License-Identifier: GPL-3.0-or-later

package common

import (
	"fmt"
	"time"
)

func HTUpdateTimestamp() string {
	newStr := fmt.Sprintf("%d", time.Now().Unix())

	return newStr
}
