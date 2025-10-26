# SPDX-License-Identifier: GPL-3.0-or-later

import matplotlib.pyplot as plt
import numpy as np

points = np.array([0, 0, 0, 0, 0])

plt.plot(points, linestyle = 'dotted')
plt.savefig("line.jpg")
